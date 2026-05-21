'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/shared/Navbar';
import MobileHeader from '@/components/shared/MobileHeader';
import MobileNav from '@/components/shared/MobileNav';
import { CHAT_SUGGESTIONS } from '@/lib/constants';
import type { ScanContext } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Simple markdown renderer for chat messages
function renderMarkdown(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 space-y-0.5`}>
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  const renderInline = (line: string): React.ReactNode => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Unordered list
    const ulMatch = trimmed.match(/^[-•]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(ulMatch[1]);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(olMatch[1]);
      continue;
    }

    flushList();

    // Empty line
    if (trimmed === '') {
      elements.push(<br key={`br-${i}`} />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="mb-1 last:mb-0">{renderInline(trimmed)}</p>
    );
  }

  flushList();
  return <>{elements}</>;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const fromScan = searchParams.get('from') === 'scan';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanContext, setScanContext] = useState<ScanContext | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSendRef = useRef<number>(0);

  // Load scan context if coming from result page
  useEffect(() => {
    if (fromScan && !contextLoaded) {
      try {
        const stored = sessionStorage.getItem('scamshield_chat_context');
        if (stored) {
          const ctx: ScanContext = JSON.parse(stored);
          setScanContext(ctx);
          setContextLoaded(true);

          const riskText = {
            aman: 'kemungkinan aman',
            mencurigakan: 'memiliki beberapa hal yang perlu diwaspadai',
            berbahaya: 'memiliki pola yang sering ditemukan pada penipuan',
          }[ctx.riskLevel];

          const scamTypesText = ctx.scamTypes.length > 0
            ? `\n\nPola yang terdeteksi: ${ctx.scamTypes.join(', ')}.`
            : '';

          const initialMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Saya sudah melihat hasil scan sebelumnya. Pesan yang Anda scan ${riskText} dengan skor risiko ${ctx.scamProbability}%.${scamTypesText}\n\n${ctx.simpleExplanation}\n\nAda yang ingin Anda tanyakan tentang hasil analisis ini? Saya siap membantu menjelaskan lebih detail.`,
          };

          setMessages([initialMessage]);
        }
      } catch { /* ignore */ }
    }
  }, [fromScan, contextLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Client-side debounce
    const now = Date.now();
    if (now - lastSendRef.current < 2000) return;
    lastSendRef.current = now;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          scanContext: scanContext || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const errMsg = errData?.error || 'Sistem AI sedang sibuk sementara. Silakan coba lagi beberapa saat lagi.';
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                fullContent += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id ? { ...m, content: fullContent } : m
                  )
                );
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sistem AI sedang sibuk sementara. Silakan coba lagi beberapa saat lagi.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: errorMsg }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, scanContext]);

  const contextSuggestions = scanContext ? [
    'Jelaskan lebih detail kenapa pesan ini mencurigakan',
    'Apakah pesan ini benar-benar berbahaya?',
    'Apa yang harus saya lakukan sekarang?',
    'Bagaimana cara memastikan pesan ini asli atau palsu?',
  ] : null;

  return (
    <>
      <Navbar />
      <MobileHeader />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-base sm:text-lg shrink-0">🤖</div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base">ScamShield AI</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {scanContext ? 'Konteks scan dimuat' : 'Siap membantu'}
              </div>
            </div>
          </div>

          {scanContext && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-2.5 rounded-lg bg-blue-500/[0.06] border border-blue-500/15 text-xs text-blue-400">
              <div className="flex items-center gap-1.5">
                <span>📋</span>
                <span>Hasil scan dimuat — Risiko: {scanContext.scamProbability}% ({
                  scanContext.riskLevel === 'aman' ? '✅ Aman' : scanContext.riskLevel === 'mencurigakan' ? '⚠️ Mencurigakan' : '🔴 Berbahaya'
                })</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 sm:py-12 space-y-5 sm:space-y-6">
              <div className="text-4xl sm:text-5xl">💬</div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg mb-2">Halo! Saya ScamShield AI</h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Tanyakan apa saja tentang keamanan online, penipuan, atau cara melindungi diri Anda.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto px-2">
                {CHAT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                  <button key={suggestion} onClick={() => sendMessage(suggestion)}
                    className="px-3 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground hover:bg-border hover:text-foreground transition-colors active:scale-95">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {contextSuggestions && messages.length === 1 && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-2">
              {contextSuggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => sendMessage(suggestion)}
                  className="px-3 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground hover:bg-border hover:text-foreground transition-colors active:scale-95">
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] sm:max-w-[85%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-primary/15 text-foreground rounded-br-md'
                    : 'bg-muted/50 border border-border text-foreground/85 rounded-bl-md'
                }`}>
                  {message.content ? (
                    message.role === 'assistant' ? (
                      <div className="break-words">{renderMarkdown(message.content)}</div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>●</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>●</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>●</motion.span>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 sm:px-6 py-3 pb-24 md:pb-4 border-t border-border">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan Anda..." disabled={isLoading}
              className="flex-1 h-11 px-4 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 disabled:opacity-50" />
            <Button type="submit" disabled={!input.trim() || isLoading}
              className="h-11 w-11 sm:px-5 sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 disabled:opacity-40 shrink-0">↑</Button>
          </form>
        </div>
      </main>
      <MobileNav />
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full" />
          <span className="text-sm">Memuat chat...</span>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
