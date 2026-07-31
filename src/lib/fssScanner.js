// FSS Scanner — Full Spectrum Scanner frequency tuning minigame

export const FSS_BANDS = [
  { id: 'low', name: 'Low Frequency', range: '0–30 Hz', color: '#ff4444' },
  { id: 'mid', name: 'Mid Frequency', range: '30–60 Hz', color: '#ffaa44' },
  { id: 'high', name: 'High Frequency', range: '60–90 Hz', color: '#44aaff' },
  { id: 'ultra', name: 'Ultra Frequency', range: '90–120 Hz', color: '#aa44ff' },
];

export function generateFSSSignals(systemData) {
  const bodies = systemData?.bodies || [];
  const signals = [];
  for (const body of bodies) {
    const bandIdx = (body.id?.charCodeAt(body.id.length - 1) || 0) % FSS_BANDS.length;
    signals.push({
      id: `fss_${body.id}`,
      bodyId: body.id,
      bodyName: body.name || body.designation || 'Unknown Body',
      band: FSS_BANDS[bandIdx].id,
      signalType: body.type === 'star' ? 'stellar' : body.type === 'planet' ? 'planetary' : 'lunar',
    });
  }
  return signals;
}

export function getBodiesInBand(signals, bandId) {
  return signals.filter(s => s.band === bandId);
}

export function getScanProgress(signals, tunedBands) {
  const total = signals.length;
  const found = signals.filter(s => tunedBands.includes(s.band)).length;
  return { found, total, pct: total > 0 ? Math.round((found / total) * 100) : 0 };
}