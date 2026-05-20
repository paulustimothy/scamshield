import { NextRequest, NextResponse } from 'next/server';
import ai from '@/lib/gemini/client';
import {
  SCAM_ANALYSIS_SYSTEM_PROMPT,
  SCAM_ANALYSIS_JSON_SCHEMA,
  IMAGE_ANALYSIS_PROMPT,
  VOICE_ANALYSIS_PROMPT,
  MULTI_EVIDENCE_PROMPT,
} from '@/lib/gemini/prompts';
import { getFallbackScanResult, getGracefulErrorMessage, checkRateLimit } from '@/lib/gemini/fallback';
import { analyzeURL } from '@/lib/url-analyzer';
import { checkVirusTotal } from '@/lib/virustotal';
import type { ScamAnalysisResult } from '@/lib/types';

// Limits
const MAX_IMAGES = 5;
const MAX_AUDIO = 1;
const MAX_TEXT_LENGTH = 5000;

// Safe JSON parse with validation
function parseAIResponse(text: string): ScamAnalysisResult | null {
  try {
    const parsed = JSON.parse(text);
    // Validate minimum required fields
    if (
      typeof parsed.scamProbability !== 'number' ||
      typeof parsed.riskLevel !== 'string' ||
      typeof parsed.explanation !== 'string'
    ) {
      console.warn('AI response missing required fields');
      return null;
    }
    // Ensure arrays exist even if optional fields were skipped
    if (!Array.isArray(parsed.suspiciousPhrases)) parsed.suspiciousPhrases = [];
    if (!Array.isArray(parsed.safeIndicators)) parsed.safeIndicators = [];
    if (!Array.isArray(parsed.redFlags)) parsed.redFlags = [];
    if (!Array.isArray(parsed.scamTypes)) parsed.scamTypes = [];
    if (!Array.isArray(parsed.recommendedActions)) parsed.recommendedActions = [];
    if (typeof parsed.confidenceScore !== 'number') parsed.confidenceScore = 70;
    if (typeof parsed.simpleExplanation !== 'string') parsed.simpleExplanation = parsed.explanation;
    if (!parsed.heatMeter) {
      parsed.heatMeter = { urgencyManipulation: 0, fearManipulation: 0, fakeAuthority: 0, financialRisk: 0, impersonation: 0 };
    }
    return parsed as ScamAnalysisResult;
  } catch {
    console.error('Failed to parse AI response JSON');
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Server-side rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`multi-${clientIP}`, 5000)) {
      return NextResponse.json(
        { error: 'Mohon tunggu beberapa detik sebelum melakukan scan lagi.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    // =====================
    // Extract all evidence
    // =====================
    const textContent = formData.get('text') as string | null;
    const urls = formData.getAll('urls') as string[];
    const imageFiles = formData.getAll('images') as File[];
    const audioFile = formData.get('audio') as File | null;

    // Validate: at least one evidence piece
    const hasText = textContent && textContent.trim().length > 0;
    const hasUrls = urls.length > 0 && urls.some(u => u.trim().length > 0);
    const hasImages = imageFiles.length > 0 && imageFiles[0]?.size > 0;
    const hasAudio = audioFile && audioFile.size > 0;

    if (!hasText && !hasUrls && !hasImages && !hasAudio) {
      return NextResponse.json(
        { error: 'Minimal satu bukti diperlukan untuk analisis' },
        { status: 400 }
      );
    }

    // Validate limits
    if (textContent && textContent.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Teks terlalu panjang (maks ${MAX_TEXT_LENGTH} karakter)` }, { status: 400 });
    }
    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maksimal ${MAX_IMAGES} gambar` }, { status: 400 });
    }
    if (audioFile && audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File audio terlalu besar (maks 25MB)' }, { status: 400 });
    }
    for (const img of imageFiles) {
      if (img.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Salah satu gambar terlalu besar (maks 10MB per gambar)' }, { status: 400 });
      }
    }

    // Count evidence for response
    const evidenceCount = (hasText ? 1 : 0) + (hasUrls ? urls.filter(u => u.trim()).length : 0) + imageFiles.filter(f => f.size > 0).length + (hasAudio ? 1 : 0);

    // =====================
    // URL reputation checks (parallel)
    // =====================
    let urlReputation = undefined;
    let analyzedUrl: string | undefined = undefined;
    const validUrls = urls.filter(u => u.trim().length > 0);
    if (validUrls.length > 0) {
      const primaryUrl = validUrls[0];
      analyzedUrl = primaryUrl;
      const [urlAnalysis, vtResult] = await Promise.all([
        Promise.resolve(analyzeURL(primaryUrl)),
        checkVirusTotal(primaryUrl),
      ]);
      urlReputation = { ...urlAnalysis };
      if (vtResult) {
        urlReputation.virusTotal = vtResult;
        if (vtResult.detected > 0) {
          urlReputation.trustScore = Math.max(5, urlReputation.trustScore - vtResult.detected * 5);
        }
      }
    }

    // =====================
    // Build Gemini parts[]
    // =====================
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // Images first (Gemini processes inline images best when they come early)
    for (const img of imageFiles) {
      if (img.size === 0) continue;
      const bytes = await img.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      parts.push({
        inlineData: { mimeType: img.type || 'image/jpeg', data: base64 },
      });
    }

    // Audio
    if (audioFile && audioFile.size > 0) {
      const bytes = await audioFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      let mimeType = audioFile.type || 'audio/mpeg';
      if (audioFile.name.endsWith('.mp3')) mimeType = 'audio/mpeg';
      else if (audioFile.name.endsWith('.wav')) mimeType = 'audio/wav';
      else if (audioFile.name.endsWith('.m4a')) mimeType = 'audio/mp4';
      else if (audioFile.name.endsWith('.webm')) mimeType = 'audio/webm';
      else if (audioFile.name.endsWith('.ogg')) mimeType = 'audio/ogg';

      parts.push({
        inlineData: { mimeType, data: base64 },
      });
    }

    // Construct the text prompt
    const evidenceSections: string[] = [];

    if (hasText) {
      evidenceSections.push(`[BUKTI TEKS]\n${textContent}`);
    }
    if (validUrls.length > 0) {
      evidenceSections.push(`[BUKTI URL]\n${validUrls.join('\n')}`);
      if (urlReputation && urlReputation.suspiciousIndicators.length > 0) {
        const urlContext = urlReputation.suspiciousIndicators.map(i => `- ${i.indicator}: ${i.explanation}`).join('\n');
        evidenceSections.push(`[KONTEKS TEKNIS URL]\nTrust Score: ${urlReputation.trustScore}/100\n${urlContext}`);
      }
    }
    if (hasImages) {
      evidenceSections.push(`[BUKTI GAMBAR: ${imageFiles.filter(f => f.size > 0).length} screenshot terlampir di atas]`);
    }
    if (hasAudio) {
      evidenceSections.push(`[BUKTI AUDIO: 1 rekaman terlampir di atas]`);
    }

    // Decide on prompt based on evidence count
    let userPromptText: string;
    if (evidenceCount > 1) {
      userPromptText = MULTI_EVIDENCE_PROMPT(evidenceSections, evidenceCount);
    } else if (hasImages && !hasText && !hasUrls && !hasAudio) {
      userPromptText = IMAGE_ANALYSIS_PROMPT + '\n\n' + evidenceSections.join('\n\n');
    } else if (hasAudio && !hasText && !hasUrls && !hasImages) {
      userPromptText = VOICE_ANALYSIS_PROMPT + '\n\n' + evidenceSections.join('\n\n');
    } else {
      userPromptText = `Analisis konten berikut untuk mendeteksi penipuan. Bersikaplah OBJEKTIF dan SEIMBANG.\n\n---\n${evidenceSections.join('\n\n')}\n---\n\nBerikan analisis lengkap dalam format JSON.`;
    }

    parts.push({ text: userPromptText });

    // Extend schema for multi-evidence
    const multiSchema = {
      ...SCAM_ANALYSIS_JSON_SCHEMA,
      properties: {
        ...SCAM_ANALYSIS_JSON_SCHEMA.properties,
        extractedText: { type: 'string' as const, description: 'Teks yang diekstrak dari gambar (jika ada gambar)' },
        transcript: { type: 'string' as const, description: 'Transkripsi audio (jika ada audio)' },
      },
    };

    let result: ScamAnalysisResult;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: SCAM_ANALYSIS_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: multiSchema,
        },
      });

      const text = response.text;
      if (!text) {
        console.warn('AI returned empty response for multi-evidence, using fallback');
        const fallback = getFallbackScanResult(textContent || validUrls.join(' ') || 'evidence', hasUrls ? 'url' : 'text');
        if (urlReputation) fallback.urlReputation = urlReputation;
        return NextResponse.json({ ...fallback, evidenceCount, isFallback: true, analyzedUrl });
      }

      const parsed = parseAIResponse(text);
      if (!parsed) {
        console.warn('AI returned invalid JSON, using fallback');
        const fallback = getFallbackScanResult(textContent || validUrls.join(' ') || 'evidence', hasUrls ? 'url' : 'text');
        if (urlReputation) fallback.urlReputation = urlReputation;
        return NextResponse.json({ ...fallback, evidenceCount, isFallback: true, analyzedUrl });
      }
      result = parsed;
    } catch (aiError) {
      console.error('AI API error for multi-evidence, using fallback:', aiError);
      const fallback = getFallbackScanResult(textContent || validUrls.join(' ') || 'evidence', hasUrls ? 'url' : 'text');
      if (urlReputation) fallback.urlReputation = urlReputation;
      return NextResponse.json({ ...fallback, evidenceCount, isFallback: true, analyzedUrl });
    }

    // =====================
    // Post-process
    // =====================
    result.scamProbability = Math.max(0, Math.min(100, result.scamProbability));
    result.confidenceScore = Math.max(0, Math.min(100, result.confidenceScore));
    if (result.heatMeter) {
      for (const key of Object.keys(result.heatMeter) as (keyof typeof result.heatMeter)[]) {
        result.heatMeter[key] = Math.max(0, Math.min(100, result.heatMeter[key]));
      }
    }
    if (!result.safeIndicators) result.safeIndicators = [];

    // Risk level consistency
    if (result.scamProbability <= 35) result.riskLevel = 'aman';
    else if (result.scamProbability <= 70) result.riskLevel = 'mencurigakan';
    else result.riskLevel = 'berbahaya';

    // VT override
    if (urlReputation?.virusTotal && urlReputation.virusTotal.detected > 0) {
      result.riskLevel = 'berbahaya';
      result.scamProbability = Math.max(95, result.scamProbability);
      result.redFlags.unshift('🚨 TERDETEKSI BERBAHAYA OLEH VIRUSTOTAL: Ada indikasi malware atau phishing yang valid pada URL ini.');
    }

    // Attach URL reputation
    if (urlReputation) result.urlReputation = urlReputation;

    return NextResponse.json({ ...result, evidenceCount, isFallback: false, analyzedUrl });
  } catch (error) {
    console.error('Multi-evidence analysis error:', error);
    const message = getGracefulErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
