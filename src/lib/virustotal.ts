// ========================
// VirusTotal API Integration (Optional)
// Only activates if VIRUSTOTAL_API_KEY env var exists
// ========================

interface VirusTotalResult {
  detected: number;
  total: number;
  vendors: string[];
}

export async function checkVirusTotal(url: string): Promise<VirusTotalResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    // Encode URL for VirusTotal
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      // If URL not found, submit it first
      if (response.status === 404) {
        const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: {
            'x-apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `url=${encodeURIComponent(url)}`,
          signal: AbortSignal.timeout(8000),
        });

        if (!submitResponse.ok) return null;

        // Return null since analysis is pending
        return null;
      }
      return null;
    }

    const data = await response.json();
    const stats = data?.data?.attributes?.last_analysis_stats;

    if (!stats) return null;

    const detected = (stats.malicious || 0) + (stats.suspicious || 0);
    const total = Object.values(stats).reduce((sum: number, v) => sum + (v as number), 0);

    // Get detected vendor names
    const results = data?.data?.attributes?.last_analysis_results || {};
    const vendors = Object.entries(results)
      .filter(([, v]) => (v as { category: string }).category === 'malicious' || (v as { category: string }).category === 'suspicious')
      .map(([name]) => name)
      .slice(0, 5);

    return { detected, total, vendors };
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return null;
  }
}
