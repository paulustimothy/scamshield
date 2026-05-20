'use client';

import { motion } from 'framer-motion';

interface URLDissectionProps {
  url: string;
  typosquatting?: { targetDomain: string; similarity: number } | null;
}

interface URLSegment {
  text: string;
  type: 'protocol' | 'subdomain' | 'domain' | 'tld' | 'path' | 'separator';
  status: 'safe' | 'warning' | 'danger';
  label?: string;
}

const SAFE_TLDS = ['.com', '.co.id', '.id', '.org', '.net', '.gov', '.go.id', '.ac.id', '.edu'];
const SUSPICIOUS_TLDS = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.top', '.buzz', '.click', '.info', '.club', '.live'];

function dissectURL(url: string): URLSegment[] {
  const segments: URLSegment[] = [];

  try {
    // Add protocol if missing
    let fullUrl = url;
    if (!url.match(/^https?:\/\//)) {
      fullUrl = 'http://' + url;
    }

    const parsed = new URL(fullUrl);

    // Protocol
    const isHTTPS = parsed.protocol === 'https:';
    segments.push({
      text: parsed.protocol + '//',
      type: 'protocol',
      status: isHTTPS ? 'safe' : 'warning',
      label: isHTTPS ? 'Terenkripsi' : 'Tidak terenkripsi',
    });

    // Hostname parts
    const hostname = parsed.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 3) {
      // Has subdomain
      const subdomain = parts.slice(0, -2).join('.');
      const domain = parts[parts.length - 2];
      const tld = '.' + parts[parts.length - 1];

      // Check for IP address pattern
      const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
      if (isIP) {
        segments.push({
          text: hostname,
          type: 'domain',
          status: 'danger',
          label: 'IP langsung — mencurigakan',
        });
      } else {
        segments.push({
          text: subdomain + '.',
          type: 'subdomain',
          status: subdomain.length > 15 || subdomain.includes('-') ? 'warning' : 'safe',
          label: subdomain.length > 15 ? 'Subdomain panjang' : 'Subdomain',
        });

        segments.push({
          text: domain,
          type: 'domain',
          status: 'safe',
          label: 'Domain',
        });

        const tldStatus = SUSPICIOUS_TLDS.includes(tld) ? 'danger' : SAFE_TLDS.includes(tld) ? 'safe' : 'warning';
        segments.push({
          text: tld,
          type: 'tld',
          status: tldStatus,
          label: tldStatus === 'danger' ? 'TLD mencurigakan' : tldStatus === 'safe' ? 'TLD terpercaya' : 'TLD tidak umum',
        });
      }
    } else if (parts.length === 2) {
      // Just domain + TLD
      const domain = parts[0];
      const tld = '.' + parts[1];

      segments.push({
        text: domain,
        type: 'domain',
        status: 'safe',
        label: 'Domain',
      });

      const tldStatus = SUSPICIOUS_TLDS.includes(tld) ? 'danger' : SAFE_TLDS.includes(tld) ? 'safe' : 'warning';
      segments.push({
        text: tld,
        type: 'tld',
        status: tldStatus,
        label: tldStatus === 'danger' ? 'TLD mencurigakan' : tldStatus === 'safe' ? 'TLD terpercaya' : 'TLD tidak umum',
      });
    }

    // Path
    if (parsed.pathname && parsed.pathname !== '/') {
      const path = parsed.pathname + parsed.search + parsed.hash;
      const hasEncodedChars = /%[0-9a-fA-F]{2}/.test(path);
      segments.push({
        text: path,
        type: 'path',
        status: hasEncodedChars || path.length > 50 ? 'warning' : 'safe',
        label: hasEncodedChars ? 'Path mengandung karakter tersembunyi' : 'Path',
      });
    }
  } catch {
    // If URL can't be parsed, show it as-is with warning
    segments.push({ text: url, type: 'domain', status: 'warning', label: 'URL tidak valid' });
  }

  return segments;
}

const STATUS_CONFIG = {
  safe: {
    icon: '✅',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    line: 'bg-emerald-500',
  },
  warning: {
    icon: '⚠️',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    line: 'bg-amber-500',
  },
  danger: {
    icon: '🔴',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    line: 'bg-red-500',
  },
};

export default function URLDissection({ url, typosquatting }: URLDissectionProps) {
  const segments = dissectURL(url);

  return (
    <div className="space-y-4">
      {/* Visual URL with colored segments */}
      <div className="p-3 sm:p-4 rounded-xl bg-muted border border-border overflow-x-auto">
        <div className="font-mono text-xs sm:text-sm whitespace-nowrap">
          {segments.map((seg, i) => {
            const config = STATUS_CONFIG[seg.status];
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`${config.color} relative group cursor-help`}
              >
                <span className={`border-b-2 ${config.line}/50 pb-0.5`}>
                  {seg.text}
                </span>
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Segment annotations */}
      <div className="space-y-1.5">
        {segments.filter(s => s.type !== 'separator').map((seg, i) => {
          const config = STATUS_CONFIG[seg.status];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} border ${config.border}`}
            >
              <span className="text-xs shrink-0">{config.icon}</span>
              <span className={`text-xs font-mono truncate ${config.color}`}>{seg.text}</span>
              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{seg.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Typosquatting comparison */}
      {typosquatting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15"
        >
          <p className="text-xs font-semibold text-red-400 mb-2">🎭 Kemungkinan Typosquatting</p>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex-1 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 truncate">
              {url.replace(/^https?:\/\//, '').split('/')[0]}
            </div>
            <span className="text-muted-foreground shrink-0">≈ {typosquatting.similarity}%</span>
            <div className="flex-1 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 truncate">
              {typosquatting.targetDomain}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Domain ini mirip dengan {typosquatting.targetDomain} — kemungkinan penipu menyamar</p>
        </motion.div>
      )}
    </div>
  );
}
