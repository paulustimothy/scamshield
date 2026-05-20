// ========================
// ScamShield Constants
// ========================

export const APP_NAME = 'ScamShield';
export const APP_TAGLINE = 'Lindungi Keluarga Anda dari Penipuan Online';
export const APP_DESCRIPTION = 'AI yang membantu mendeteksi penipuan online, phishing, dan pesan manipulatif untuk melindungi Anda dan keluarga.';

// Risk Level Configuration
export const RISK_COLORS = {
  aman: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10b981' },
  mencurigakan: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b' },
  berbahaya: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hex: '#ef4444' },
} as const;

export const RISK_LABELS = {
  aman: '✅ Aman',
  mencurigakan: '⚠️ Mencurigakan',
  berbahaya: '🔴 Berbahaya',
} as const;

// Heat Meter Labels
export const HEAT_METER_LABELS = {
  urgencyManipulation: { label: 'Manipulasi Urgensi', icon: '🕐', description: 'Tekanan untuk bertindak cepat' },
  fearManipulation: { label: 'Manipulasi Ketakutan', icon: '😰', description: 'Menakut-nakuti korban' },
  fakeAuthority: { label: 'Otoritas Palsu', icon: '👔', description: 'Berpura-pura sebagai pihak resmi' },
  financialRisk: { label: 'Risiko Finansial', icon: '💰', description: 'Potensi kerugian uang' },
  impersonation: { label: 'Impersonasi', icon: '🎭', description: 'Menyamar sebagai orang lain' },
} as const;

// Navigation Items
export const NAV_ITEMS = [
  { href: '/', label: 'Beranda', icon: '🏠' },
  { href: '/scanner', label: 'Scan', icon: '🔍' },
  { href: '/chat', label: 'Chat AI', icon: '💬' },
  { href: '/library', label: 'Perpustakaan', icon: '📚' },
  { href: '/settings', label: 'Pengaturan', icon: '⚙️' },
] as const;

// Sample scam messages for interactive demo
export const SAMPLE_SCAM_MESSAGES = [
  {
    label: 'WhatsApp Penipuan Hadiah',
    content: 'SELAMAT! Anda terpilih sebagai pemenang undian Shopee senilai Rp 50.000.000! Klik link berikut untuk klaim hadiah Anda: http://shopee-winner.xyz/claim. SEGERA klaim dalam 24 jam atau hadiah hangus! Kirim kode OTP yang masuk ke nomor ini untuk verifikasi.',
  },
  {
    label: 'Penipuan Lowongan Kerja',
    content: 'Halo kak, kami dari PT. Global Digital Indonesia membuka lowongan kerja online dengan gaji Rp 500.000-2.000.000/hari. Cukup like & subscribe video YouTube. Modal awal hanya Rp 100.000 untuk aktivasi akun. Transfer ke rekening BCA 1234567890 a.n Budi Santoso. WA: 0812-xxxx-xxxx',
  },
  {
    label: 'Penipuan Customer Service Bank',
    content: 'Yth Nasabah BCA, Akun Anda terdeteksi aktivitas mencurigakan dan akan DIBLOKIR dalam 1 jam. Segera verifikasi dengan mengirim: Nama lengkap, No KTP, No rekening, PIN ATM, dan kode OTP ke nomor ini. Tim Keamanan BCA.',
  },
];

// Quick chat suggestions
export const CHAT_SUGGESTIONS = [
  'Apakah link ini aman?',
  'Apa itu phishing?',
  'Bagaimana cara melaporkan penipuan?',
  'Apa yang harus dilakukan jika terlanjur klik link mencurigakan?',
  'Bagaimana cara mengenali penipuan QRIS?',
  'Apakah lowongan kerja ini asli?',
];
