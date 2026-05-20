// ========================
// URL Reputation Analyzer
// Analyzes URLs for suspicious patterns
// ========================

import type { URLReputationData } from '@/lib/types';

// Known safe Indonesian domains
const KNOWN_SAFE_DOMAINS = [
  'shopee.co.id', 'tokopedia.com', 'bukalapak.com', 'lazada.co.id',
  'blibli.com', 'bca.co.id', 'bni.co.id', 'bri.co.id', 'mandiri.co.id',
  'bi.go.id', 'ojk.go.id', 'gojek.com', 'grab.com', 'dana.id',
  'ovo.id', 'gopay.co.id', 'google.com', 'google.co.id',
  'facebook.com', 'instagram.com', 'twitter.com', 'youtube.com',
  'whatsapp.com', 'linkedin.com', 'tiktok.com', 'detik.com',
  'kompas.com', 'liputan6.com', 'kaskus.co.id',
];

// Suspicious TLDs often used in scams
const SUSPICIOUS_TLDS = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.buzz', '.click', '.link', '.work', '.fun'];

// Common URL shorteners
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'v.gd', 'ow.ly', 'rebrand.ly', 's.id'];

// Suspicious keywords in URLs
const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'update', 'secure', 'account', 'confirm', 'banking',
  'prize', 'winner', 'claim', 'reward', 'free', 'hadiah', 'menang', 'pemenang',
  'klaim', 'undian', 'gratis', 'promo-khusus', 'bonus-spesial',
];

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function checkTyposquatting(domain: string): { targetDomain: string; similarity: number } | undefined {
  const domainBase = domain.replace(/^www\./, '').split('.').slice(0, -1).join('.');
  for (const safeDomain of KNOWN_SAFE_DOMAINS) {
    const safeBase = safeDomain.replace(/^www\./, '').split('.').slice(0, -1).join('.');
    if (domainBase === safeBase) continue; // exact match = safe
    const dist = levenshteinDistance(domainBase, safeBase);
    const maxLen = Math.max(domainBase.length, safeBase.length);
    const similarity = 1 - dist / maxLen;
    if (similarity >= 0.7 && similarity < 1) {
      return { targetDomain: safeDomain, similarity: Math.round(similarity * 100) };
    }
  }
  return undefined;
}

export function analyzeURL(urlString: string): URLReputationData {
  const suspiciousIndicators: URLReputationData['suspiciousIndicators'] = [];
  const safeIndicators: URLReputationData['safeIndicators'] = [];
  let trustScore = 50; // Start neutral

  let url: URL;
  try {
    url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
  } catch {
    return {
      isHTTPS: false,
      trustScore: 20,
      suspiciousIndicators: [{ indicator: 'URL tidak valid', explanation: 'Alamat website ini tidak dapat diparse sebagai URL yang valid.' }],
      safeIndicators: [],
    };
  }

  const isHTTPS = url.protocol === 'https:';
  const domain = url.hostname.toLowerCase();

  // HTTPS check
  if (isHTTPS) {
    trustScore += 10;
    safeIndicators.push({ indicator: 'Menggunakan HTTPS', explanation: 'Website menggunakan koneksi terenkripsi (HTTPS).' });
  } else {
    trustScore -= 15;
    suspiciousIndicators.push({ indicator: 'Tidak menggunakan HTTPS', explanation: 'Website tidak menggunakan koneksi aman. Data Anda bisa disadap.' });
  }

  // Known safe domain check
  const isKnownSafe = KNOWN_SAFE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
  if (isKnownSafe) {
    trustScore += 30;
    safeIndicators.push({ indicator: 'Domain terpercaya', explanation: 'Website ini menggunakan domain yang dikenal dan terpercaya.' });
  }

  // IP-based URL check
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    trustScore -= 25;
    suspiciousIndicators.push({ indicator: 'Menggunakan alamat IP', explanation: 'Website menggunakan alamat IP langsung, bukan nama domain. Ini sering digunakan untuk menyembunyikan identitas.' });
  }

  // Suspicious TLD check
  const tld = '.' + domain.split('.').pop();
  if (SUSPICIOUS_TLDS.includes(tld)) {
    trustScore -= 15;
    suspiciousIndicators.push({ indicator: 'Domain mencurigakan', explanation: `Domain menggunakan ekstensi ${tld} yang sering digunakan untuk situs penipuan.` });
  }

  // URL shortener check
  if (URL_SHORTENERS.some(s => domain.includes(s))) {
    trustScore -= 10;
    suspiciousIndicators.push({ indicator: 'Menggunakan URL shortener', explanation: 'Link dipendekkan menggunakan layanan shortener, menyembunyikan tujuan sebenarnya.' });
  }

  // Typosquatting check
  const typosquatting = checkTyposquatting(domain);
  if (typosquatting) {
    trustScore -= 25;
    suspiciousIndicators.push({
      indicator: 'Kemungkinan typosquatting',
      explanation: `Alamat website ini mencoba meniru domain resmi ${typosquatting.targetDomain} agar terlihat terpercaya.`,
    });
  }

  // Suspicious keywords in path
  const fullPath = (url.pathname + url.search).toLowerCase();
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(k => fullPath.includes(k));
  if (foundKeywords.length >= 2) {
    trustScore -= 10;
    suspiciousIndicators.push({ indicator: 'Kata kunci mencurigakan', explanation: 'URL mengandung kata-kata yang sering digunakan dalam link phishing.' });
  }

  // Excessive query parameters
  if (url.searchParams.toString().length > 200) {
    trustScore -= 5;
    suspiciousIndicators.push({ indicator: 'Parameter berlebihan', explanation: 'URL memiliki banyak parameter yang tidak biasa, bisa digunakan untuk tracking.' });
  }

  // Excessive subdomains
  const subdomainCount = domain.split('.').length;
  if (subdomainCount > 3) {
    trustScore -= 10;
    suspiciousIndicators.push({ indicator: 'Banyak subdomain', explanation: 'URL memiliki banyak subdomain yang tidak biasa, sering digunakan untuk menyamarkan domain asli.' });
  }

  // Domain length
  if (domain.length > 40) {
    trustScore -= 5;
    suspiciousIndicators.push({ indicator: 'Domain sangat panjang', explanation: 'Nama domain yang sangat panjang sering digunakan untuk menyembunyikan tujuan sebenarnya.' });
  }

  // Clamp trust score
  trustScore = Math.max(5, Math.min(95, trustScore));

  return {
    isHTTPS,
    trustScore,
    suspiciousIndicators,
    safeIndicators,
    typosquatting,
  };
}
