# 🛡️ ScamShield AI

**ScamShield AI** adalah asisten keamanan siber berbasis kecerdasan buatan (AI) yang dirancang khusus untuk melindungi masyarakat Indonesia dari berbagai modus penipuan online (*scams*), *phishing*, dan manipulasi psikologis. Proyek ini menggunakan **Google Gemini AI** untuk analisis multimodal secara *real-time* dan mendalam.

---

## ✨ Fitur Unggulan

### 1. 🗂️ Multi-Evidence Investigation (Analisis Gabungan)
Pengguna dapat menumpuk (*stack*) beberapa jenis bukti sekaligus dalam satu investigasi:
* **Teks:** Paste isi chat WhatsApp, SMS, email, atau penawaran mencurigakan.
* **URL:** Deteksi otomatis *phishing*, typosquatting, dan reputasi domain.
* **Gambar (Screenshot):** Ekstraksi teks dari tangkapan layar percakapan atau bukti transfer secara otomatis menggunakan *vision intelligence*.
* **Audio:** Unggah rekaman suara telepon penipuan untuk ditranskripsi dan dianalisis taktik manipulasi verbalnya.

### 2. 🌐 Analisis URL Terbuka & VirusTotal
* **URL Dissection:** Membedah URL secara visual berdasarkan protokol (HTTPS), subdomain, TLD mencurigakan, dan panjang domain.
* **Typosquatting Checker:** Menggunakan algoritma *Levenshtein Distance* secara lokal untuk membandingkan domain dengan merek resmi di Indonesia (misal: BCA, Shopee, GoPay, Tokopedia).
* **VirusTotal API:** Integrasi opsional untuk memvalidasi status ancaman melalui puluhan mesin keamanan global.

### 3. 🧠 Analisis Psikologis Empatik
Menjelaskan alasan psikologis mengapa penipuan tersebut bisa sangat meyakinkan (misal: memanfaatkan ketakutan, rasa hormat terhadap otoritas, atau tekanan urgensi) tanpa menyalahkan korban (*no victim-blaming*), serta dibekali nada yang mengedukasi.

### 4. ⚙️ Aksesibilitas Tinggi (Elderly-Friendly)
Didesain khusus agar mudah digunakan oleh orang tua atau pengguna dengan keterbatasan visual:
* **Font Scaling:** Pilihan ukuran huruf (Normal, Besar, Sangat Besar).
* **High Contrast Mode:** Kontras tinggi untuk keterbacaan yang optimal.
* **Simplified UI:** Mematikan animasi dan elemen dekoratif untuk mempercepat performa di perangkat berspesifikasi rendah.

---

## 🛠️ Tech Stack

* **Frontend & Backend Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
* **Gaya & Desain:** Vanilla CSS dengan [Tailwind CSS v4](https://tailwindcss.com/)
* **Animasi:** [Framer Motion](https://www.framer.com/motion/)
* **AI Model:** [Google GenAI SDK](https://github.com/google/generative-ai-js) (Gemini 2.0 Flash / Gemini 2.5 Flash)
* **Integrasi Keamanan:** [VirusTotal API](https://developers.virustotal.com/)

---

## 📂 Struktur Folder Proyek

```text
src/
├── app/                  # Next.js Routes & API Endpoint
│   ├── api/
│   │   ├── analyze-multi # Handler untuk unggahan multimodal (Multipart Form)
│   │   └── chat          # Chatbot streaming berbasis konteks hasil scan
│   ├── chat/             # Halaman Chatbot AI
│   ├── emergency/        # Halaman Panduan Darurat & Pelaporan Korban
│   ├── library/          # Perpustakaan Pola Penipuan Umum
│   ├── settings/         # Pengaturan Aksesibilitas & Tema
│   ├── globals.css       # Tokens, Variabel CSS & Tema Light/Dark
│   ├── layout.tsx        # Entrypoint layout aplikasi
│   └── page.tsx          # Halaman Utama (Landing Page & Interactive Demo)
├── components/           # Komponen React reusable
│   ├── landing/          # Komponen khusus halaman landing (Demo Interaktif)
│   ├── scanner/          # Komponen hasil scan, pengukur risiko, visual URL, dll.
│   ├── shared/           # Header, Navigasi Mobile, & Aksesibilitas
│   └── ui/               # Komponen UI Primitif
└── lib/                  # Utilitas, Tipe data, & API Client
    ├── gemini/           # Konfigurasi Gemini SDK, Prompts, & fallback resilience
    ├── scam-patterns.ts  # Database lokal jenis penipuan
    ├── url-analyzer.ts   # Heuristik deteksi typosquatting lokal
    └── virustotal.ts     # Klien API VirusTotal
```

---

## 🔋 Ketahanan Sistem AI (API Resilience)

Untuk memastikan kelancaran aplikasi selama demonstrasi langsung (*live demo*), ScamShield dilengkapi dengan sistem **API Key Rotation** dan **Model Fallback** di `src/lib/gemini/client.ts`:
1. **Rotasi Kunci:** Mendukung penggunaan beberapa API key Gemini sekaligus (melalui koma di `.env`). Sistem akan otomatis beralih ke kunci berikutnya jika mendeteksi *Rate Limit (429)*.
2. **Penurunan Model:** Jika model utama (`gemini-2.0-flash`) gagal, sistem akan otomatis mencoba `gemini-2.5-flash`, lalu `gemini-flash-latest`.
3. **Fallback Offline:** Jika semua koneksi API terputus, sistem akan mengembalikan analisis statis dari database lokal secara anggun agar aplikasi tidak *crash*.

---

## 🚀 Memulai Aplikasi secara Lokal

### Prerequisites
* Node.js v18 atau versi terbaru
* NPM atau Yarn / PNPM

### 1. Kloning Repositori & Install Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Buat file `.env.local` di root direktori proyek:
```env
# Masukkan API Key Gemini (Bisa lebih dari satu, pisahkan dengan koma untuk rotasi otomatis)
GEMINI_API_KEY=your_gemini_api_key_1,your_gemini_api_key_2

# Opsional: API Key VirusTotal untuk reputasi URL eksternal
VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## 📝 Catatan Hak Cipta
ScamShield © 2025 — Didukung oleh Google Gemini AI. Dibuat dengan tujuan edukasi keamanan siber dan perlindungan keluarga Indonesia.
