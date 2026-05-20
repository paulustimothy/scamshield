'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import InteractiveDemo from '@/components/landing/InteractiveDemo';
import TrendCounter from '@/components/landing/TrendCounter';
import { Search, Camera, Thermometer, Heart, Scale, MessageCircle } from 'lucide-react';

const features = [
  { icon: Search, title: 'Analisis Teks AI', desc: 'Paste chat WhatsApp, SMS, atau email mencurigakan untuk dianalisis AI.', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20' },
  { icon: Camera, title: 'Baca Screenshot', desc: 'Upload tangkapan layar dan AI akan membaca serta menganalisisnya.', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/20' },
  { icon: Thermometer, title: 'Pola Manipulasi', desc: 'Visualisasi 5 dimensi manipulasi: urgensi, ketakutan, otoritas, risiko, impersonasi.', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/20' },
  { icon: Heart, title: 'Mode Orang Tua', desc: 'Penjelasan sederhana yang bisa dipahami siapapun, termasuk orang tua.', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/20' },
  { icon: Scale, title: 'Analisis Seimbang', desc: 'AI yang objektif — membedakan pesan aman dan berbahaya dengan akurat.', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20' },
  { icon: MessageCircle, title: 'Chat AI Assistant', desc: 'Tanya apa saja tentang keamanan online dalam Bahasa Indonesia.', color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20' },
];

const steps = [
  { num: '1', icon: '📋', title: 'Paste atau Upload', desc: 'Tempel pesan mencurigakan atau upload tangkapan layar' },
  { num: '2', icon: '🤖', title: 'AI Menganalisis', desc: 'Gemini AI menganalisis pola penipuan secara real-time' },
  { num: '3', icon: '🛡️', title: 'Dapatkan Insight', desc: 'Lihat tingkat risiko, penjelasan, dan saran perlindungan' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Landing Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-foreground font-bold text-sm sm:text-base shadow-lg shadow-blue-500/20">
              S
            </div>
            <span className="font-semibold text-base sm:text-lg tracking-tight">ScamShield</span>
          </div>
          <Link href="/scanner">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-foreground border-0 shadow-lg shadow-blue-500/25 text-xs sm:text-sm">
              Mulai Scan
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Shield */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-blue-500/30 animate-float">
                🛡️
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-xs text-blue-400 font-medium mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Powered by Google Gemini AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Lindungi Keluarga Anda
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              dari Penipuan Online
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
          >
            AI cerdas yang mendeteksi phishing, penipuan WhatsApp, lowongan kerja palsu,
            QRIS scam, dan pesan manipulatif — dengan penjelasan yang mudah dipahami siapapun.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0"
          >
            <Link href="/scanner" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-foreground border-0 text-sm sm:text-base px-6 sm:px-8 shadow-xl shadow-blue-500/25 animate-pulse-glow active:scale-[0.98]">
                🔍 Coba Scan Sekarang
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto scroll-smooth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 border-border hover:bg-muted active:scale-[0.98]">
                ✨ Lihat Demo
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Trend Counter — Social Proof */}
      <section className="py-4 sm:py-6 px-4 sm:px-6">
        <TrendCounter />
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-12 sm:py-16 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-3">
              ✨ Coba Langsung
            </h2>
            <p className="text-center text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
              Lihat bagaimana ScamShield AI menganalisis pesan mencurigakan
            </p>
            <InteractiveDemo />
          </motion.div>
        </div>
      </section>

      {/* Features — with Lucide icons */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Fitur Unggulan</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Perlindungan menyeluruh dari berbagai jenis penipuan online</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-4 sm:p-5 rounded-2xl bg-card border border-border hover:bg-muted/30 hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-1.5">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Cara Kerja</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Hanya 3 langkah mudah</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-2xl sm:text-3xl">
                  {step.icon}
                </div>
                <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center -ml-10 sm:-ml-12">
                  {step.num}
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-1.5">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 sm:top-8 -right-2 sm:-right-3 w-6 text-muted-foreground/30">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Indonesian Scam Types */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Penipuan yang Kami Deteksi</h2>
            <p className="text-muted-foreground text-sm sm:text-base">ScamShield memahami konteks penipuan di Indonesia</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { icon: '📦', label: 'Paket Palsu' },
              { icon: '📱', label: 'QRIS Scam' },
              { icon: '💼', label: 'Lowongan Palsu' },
              { icon: '🏦', label: 'CS Bank Palsu' },
              { icon: '📲', label: 'WhatsApp Scam' },
              { icon: '🔐', label: 'Pencurian OTP' },
              { icon: '📈', label: 'Investasi Bodong' },
              { icon: '🧠', label: 'Social Engineering' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-3 sm:p-4 rounded-xl bg-card border border-border text-center hover:bg-muted/30 transition-colors"
              >
                <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{item.icon}</div>
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Periksa Pesan Mencurigakan
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto">
              Scan pesan atau screenshot mencurigakan sekarang. Gratis, cepat, dan mudah digunakan.
            </p>
            <Link href="/scanner">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-foreground border-0 text-sm sm:text-base px-6 sm:px-8 shadow-xl shadow-blue-500/25 active:scale-[0.98]">
                🛡️ Mulai Periksa Sekarang
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-foreground text-[10px] font-bold">S</div>
            <span>ScamShield © 2026 — Powered by Google Gemini AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/library" className="hover:text-foreground transition-colors">Perpustakaan</Link>
            <Link href="/chat" className="hover:text-foreground transition-colors">Chat AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
