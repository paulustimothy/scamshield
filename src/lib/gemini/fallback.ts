// ========================
// ScamShield Demo Fallback System
// Provides realistic mock responses when API is unavailable
// Ensures the app never breaks during demos
// ========================

import type { ScamAnalysisResult } from '@/lib/types';

// ========================
// Error Detection
// ========================

export function isQuotaError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('429') ||
      msg.includes('resource exhausted') ||
      msg.includes('too many requests')
    );
  }
  return false;
}

export function getGracefulErrorMessage(error: unknown): string {
  if (isQuotaError(error)) {
    return 'Kuota AI sementara penuh. Coba lagi dalam beberapa detik.';
  }
  return 'Sistem AI sedang sibuk sementara. Silakan coba lagi beberapa saat lagi.';
}

// ========================
// Rate Limiting (Server-side)
// ========================

const requestTimestamps = new Map<string, number>();

export function checkRateLimit(key: string, cooldownMs: number = 3000): boolean {
  const now = Date.now();
  const lastRequest = requestTimestamps.get(key);
  if (lastRequest && now - lastRequest < cooldownMs) {
    return false; // Rate limited
  }
  requestTimestamps.set(key, now);
  // Clean up old entries every 100 requests
  if (requestTimestamps.size > 100) {
    const cutoff = now - 60000;
    for (const [k, v] of requestTimestamps) {
      if (v < cutoff) requestTimestamps.delete(k);
    }
  }
  return true; // Allowed
}

// ========================
// Fallback Scan Results
// ========================

export function getFallbackScanResult(content: string, type: 'text' | 'url' | 'email'): ScamAnalysisResult {
  // Simple heuristic-based fallback analysis
  const lowerContent = content.toLowerCase();

  const scamSignals = [
    { pattern: /hadiah|pemenang|undian|menang/i, type: 'Penipuan Hadiah/Undian', weight: 25 },
    { pattern: /otp|pin|password|kata sandi/i, type: 'Pencurian Data Sensitif', weight: 30 },
    { pattern: /klik link|klik di sini|bit\.ly|tinyurl/i, type: 'Phishing Link', weight: 20 },
    { pattern: /transfer|rekening|bca|bni|bri|mandiri/i, type: 'Penipuan Transfer', weight: 15 },
    { pattern: /segera|dalam \d+ jam|batas waktu|hangus/i, type: 'Manipulasi Urgensi', weight: 20 },
    { pattern: /blokir|suspend|ditangguhkan/i, type: 'Manipulasi Ketakutan', weight: 20 },
    { pattern: /gaji.*juta|income.*hari|penghasilan.*mudah/i, type: 'Lowongan Kerja Palsu', weight: 25 },
    { pattern: /modal awal|biaya aktivasi|deposit/i, type: 'Penipuan Berkedok Investasi', weight: 25 },
    { pattern: /cs |customer service|tim keamanan/i, type: 'Impersonasi CS', weight: 15 },
    { pattern: /qris|kode pembayaran/i, type: 'Penipuan QRIS', weight: 20 },
  ];

  let totalScore = 0;
  const detectedTypes: string[] = [];
  const suspiciousPhrases: ScamAnalysisResult['suspiciousPhrases'] = [];
  const redFlags: string[] = [];

  for (const signal of scamSignals) {
    const match = content.match(signal.pattern);
    if (match) {
      totalScore += signal.weight;
      if (!detectedTypes.includes(signal.type)) {
        detectedTypes.push(signal.type);
      }
      suspiciousPhrases.push({
        text: match[0],
        reason: `Pola yang sering ditemukan pada ${signal.type.toLowerCase()}`,
        severity: signal.weight >= 25 ? 'high' : signal.weight >= 20 ? 'medium' : 'low',
      });
      redFlags.push(`Terdeteksi pola: ${signal.type}`);
    }
  }

  // Check for URL-specific signals
  if (type === 'url') {
    if (!lowerContent.startsWith('https://')) {
      totalScore += 15;
      redFlags.push('URL tidak menggunakan HTTPS');
    }
    if (/\d+\.\d+\.\d+\.\d+/.test(content)) {
      totalScore += 20;
      redFlags.push('URL menggunakan alamat IP langsung');
    }
    if (/\.xyz|\.tk|\.ml|\.ga|\.cf/.test(lowerContent)) {
      totalScore += 15;
      redFlags.push('Domain menggunakan TLD yang sering digunakan untuk penipuan');
    }
  }

  const scamProbability = Math.min(95, Math.max(5, totalScore));
  const riskLevel = scamProbability <= 35 ? 'aman' : scamProbability <= 70 ? 'mencurigakan' : 'berbahaya';

  const urgency = scamSignals[4].pattern.test(content) ? Math.min(85, totalScore + 10) : Math.max(5, totalScore - 20);
  const fear = scamSignals[5].pattern.test(content) ? Math.min(80, totalScore + 5) : Math.max(5, totalScore - 25);
  const authority = scamSignals[8].pattern.test(content) ? Math.min(75, totalScore) : Math.max(5, totalScore - 30);
  const financial = (scamSignals[3].pattern.test(content) || scamSignals[7].pattern.test(content)) ? Math.min(80, totalScore + 5) : Math.max(5, totalScore - 20);
  const impersonation = scamSignals[8].pattern.test(content) ? Math.min(75, totalScore) : Math.max(5, totalScore - 35);

  return {
    scamProbability,
    riskLevel,
    confidenceScore: 50, // Lower confidence for fallback — be honest
    suspiciousPhrases: suspiciousPhrases.slice(0, 5),
    scamTypes: detectedTypes.slice(0, 4),
    explanation: riskLevel === 'aman'
      ? 'Berdasarkan analisis pola, pesan ini tidak menunjukkan indikator penipuan yang signifikan. Namun tetap berhati-hati dalam membagikan data pribadi.'
      : `Pesan ini memiliki beberapa pola yang ${riskLevel === 'berbahaya' ? 'sering' : 'kadang'} ditemukan pada penipuan online, termasuk ${detectedTypes.slice(0, 2).join(' dan ').toLowerCase()}.`,
    simpleExplanation: riskLevel === 'aman'
      ? 'Pesan ini kemungkinan aman dan tidak perlu dikhawatirkan.'
      : riskLevel === 'mencurigakan'
      ? 'Pesan ini ada beberapa bagian yang perlu diwaspadai. Jangan langsung percaya dan jangan berikan data pribadi.'
      : 'Pesan ini sangat mirip dengan pola penipuan. Jangan klik link apapun, jangan berikan data pribadi, dan jangan transfer uang.',
    recommendedActions: riskLevel === 'aman'
      ? ['Tetap berhati-hati dalam membagikan data pribadi', 'Verifikasi melalui saluran resmi jika ragu']
      : [
          'Jangan klik link dalam pesan ini',
          'Jangan berikan data pribadi (OTP, PIN, password)',
          'Verifikasi langsung melalui saluran resmi',
          'Laporkan ke pihak berwajib jika diperlukan',
        ],
    redFlags: redFlags.slice(0, 5),
    safeIndicators: riskLevel === 'aman'
      ? ['Tidak ditemukan permintaan data sensitif', 'Tidak ada pola manipulasi yang signifikan']
      : [],
  };
}

// ========================
// Fallback Image Scan Results
// ========================

export function getFallbackImageResult(): ScamAnalysisResult {
  return {
    scamProbability: 0,
    riskLevel: 'aman',
    confidenceScore: 0,
    suspiciousPhrases: [],
    scamTypes: [],
    explanation: 'Sistem AI sedang tidak tersedia sehingga gambar ini belum bisa dianalisis. Hasil ini bukan penilaian terhadap konten gambar — coba analisis ulang saat sistem kembali normal.',
    simpleExplanation: 'Maaf, sistem sedang sibuk dan belum bisa membaca gambar ini. Coba lagi nanti ya.',
    recommendedActions: [
      'Coba analisis ulang beberapa saat lagi',
      'Jangan langsung percaya konten dalam gambar sampai terverifikasi',
      'Verifikasi informasi melalui saluran resmi',
    ],
    redFlags: [],
    safeIndicators: [],
    extractedText: '[Teks tidak dapat diekstrak — sistem dalam mode terbatas]',
  };
}

// ========================
// Fallback Audio Scan Results
// ========================

export function getFallbackAudioResult(): ScamAnalysisResult & { transcript: string } {
  return {
    scamProbability: 0,
    riskLevel: 'aman',
    confidenceScore: 0,
    suspiciousPhrases: [],
    scamTypes: [],
    explanation: 'Sistem AI sedang tidak tersedia sehingga audio ini belum bisa dianalisis. Hasil ini bukan penilaian terhadap konten audio — coba analisis ulang saat sistem kembali normal.',
    simpleExplanation: 'Maaf, sistem sedang sibuk dan belum bisa mendengarkan rekaman ini. Coba lagi nanti ya.',
    recommendedActions: [
      'Coba analisis ulang beberapa saat lagi',
      'Jangan langsung percaya konten dalam rekaman sampai terverifikasi',
      'Verifikasi informasi melalui saluran resmi',
    ],
    redFlags: [],
    safeIndicators: [],
    transcript: '[Transkripsi tidak tersedia — sistem dalam mode terbatas]',
  };
}

// ========================
// Fallback Chat Responses
// ========================

const FALLBACK_CHAT_RESPONSES = [
  'Maaf, sistem AI sedang dalam mode terbatas saat ini. Berikut beberapa tips umum keamanan online:\n\n1. **Jangan pernah berikan OTP, PIN, atau password** kepada siapapun\n2. **Verifikasi** melalui saluran resmi sebelum bertindak\n3. **Jangan klik link mencurigakan** — ketik alamat website secara manual\n4. **Waspada terhadap pesan yang memaksa Anda bertindak segera**\n\nCoba tanyakan lagi beberapa saat lagi untuk jawaban yang lebih spesifik.',

  'Saat ini sistem AI sedang sibuk. Beberapa hal penting yang perlu Anda ketahui:\n\n🛡️ **Perlindungan Dasar:**\n- Bank tidak pernah meminta data sensitif via WhatsApp/SMS\n- Hadiah yang terlalu bagus kemungkinan besar penipuan\n- Selalu cek URL dengan teliti sebelum memasukkan data\n- Laporkan penipuan ke Patrolisiber atau OJK\n\nSilakan coba lagi nanti untuk jawaban yang lebih detail.',

  'Maaf, saya sedang dalam mode terbatas. Namun, berikut panduan singkat:\n\n📱 **Jika menerima pesan mencurigakan:**\n1. Jangan panik — penipu sering memanfaatkan kepanikan\n2. Jangan klik link apapun\n3. Hubungi pihak terkait melalui nomor resmi\n4. Screenshot pesan sebagai bukti\n5. Blokir dan laporkan pengirim\n\nCoba tanya lagi nanti untuk bantuan lebih lanjut.',
];

export function getFallbackChatResponse(): string {
  return FALLBACK_CHAT_RESPONSES[Math.floor(Math.random() * FALLBACK_CHAT_RESPONSES.length)];
}
