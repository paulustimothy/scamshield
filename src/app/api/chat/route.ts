import { NextRequest } from 'next/server';
import ai from '@/lib/gemini/client';
import { CHAT_SYSTEM_PROMPT, CHAT_WITH_CONTEXT_SYSTEM_PROMPT } from '@/lib/gemini/prompts';
import { getGracefulErrorMessage, getFallbackChatResponse, checkRateLimit } from '@/lib/gemini/fallback';

export async function POST(request: NextRequest) {
  try {
    const { messages, scanContext } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Pesan diperlukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Server-side rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`chat-${clientIP}`, 2000)) {
      return new Response(
        JSON.stringify({ error: 'Mohon tunggu sebentar sebelum mengirim pesan lagi.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Choose system prompt based on whether scan context is provided
    let systemPrompt = CHAT_SYSTEM_PROMPT;

    if (scanContext) {
      // Optimized context: only send essential fields to minimize tokens
      const topPhrases = (scanContext.suspiciousPhrases || [])
        .slice(0, 3)
        .map((p: { text: string }) => p.text)
        .join(', ');

      systemPrompt = `${CHAT_WITH_CONTEXT_SYSTEM_PROMPT}

KONTEKS HASIL SCAN (ringkas):
- Tingkat Risiko: ${scanContext.riskLevel} (${scanContext.scamProbability}%)
- Jenis Pola: ${(scanContext.scamTypes || []).slice(0, 3).join(', ') || 'Tidak ada'}
- Frasa Mencurigakan: ${topPhrases || 'Tidak ada'}
- Penjelasan: ${scanContext.simpleExplanation || 'N/A'}`;
    }

    // Limit message history to last 6 messages to reduce token usage
    const recentMessages = messages.slice(-6);

    // Convert messages to Gemini format
    const geminiMessages = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    try {
      // Use real streaming for token-by-token responses
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: geminiMessages,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const text = chunk.text || '';
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (streamError) {
            console.error('Stream error:', streamError);
            // If streaming fails mid-way, send DONE and close gracefully
            try {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch {
              // Controller may already be closed
            }
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (aiError) {
      console.error('AI API error:', aiError);

      // Fallback: return demo response as streaming
      const fallbackText = getFallbackChatResponse();
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    const message = getGracefulErrorMessage(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
