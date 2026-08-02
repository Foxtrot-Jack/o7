// FSS Scanner — Full Spectrum Scanner per-body signal discovery
// Each body resonates at a characteristic frequency on the FSS spectrum

// Frequency ranges by body classification (0-100 scale)
const FREQUENCY_RANGES = {
  star: { min: 0, max: 10, label: 'Stellar' },
  gas_giant: { min: 12, max: 32, label: 'Gas Giants' },
  high_metal_content: { min: 34, max: 44, label: 'Metal-Rich' },
  metal_rich: { min: 34, max: 44, label: 'Metal-Rich' },
  lava: { min: 40, max: 48, label: 'Volcanic' },
  rocky: { min: 46, max: 56, label: 'Rocky' },
  desert: { min: 50, max: 58, label: 'Arid' },
  carbon: { min: 56, max: 64, label: 'Carbon' },
  rocky_ice: { min: 58, max: 66, label: 'Transitional' },
  icy: { min: 66, max: 76, label: 'Icy' },
  ammonia: { min: 76, max: 84, label: 'Ammonia' },
  water_world: { min: 82, max: 90, label: 'Water Worlds' },
  earthlike: { min: 86, max: 94, label: 'Habitable' },
  terracformed: { min: 86, max: 94, label: 'Habitable' },
  helium_rich: { min: 14, max: 22, label: 'Gas Giants' },
  helium_gas_giant: { min: 14, max: 22, label: 'Gas Giants' },
  // Moon subtypes
  moon_rocky: { min: 46, max: 56, label: 'Rocky' },
  moon_icy: { min: 66, max: 76, label: 'Icy' },
  moon_metal_rich: { min: 34, max: 44, label: 'Metal-Rich' },
  moon_rocky_ice: { min: 58, max: 66, label: 'Transitional' },
  belt: { min: 92, max: 100, label: 'Belts' },
  alien_site: { min: 96, max: 100, label: 'Anomalous' },
};

function getFrequencyForBody(body, index, total) {
  let range;
  if (body.type === 'star') {
    range = FREQUENCY_RANGES.star;
  } else if (body.type === 'belt') {
    range = FREQUENCY_RANGES.belt;
  } else if (body.type === 'alien_site') {
    range = FREQUENCY_RANGES.alien_site;
  } else if (body.type === 'moon') {
    range = FREQUENCY_RANGES[`moon_${body.planetType}`] || FREQUENCY_RANGES.moon_rocky;
  } else {
    range = FREQUENCY_RANGES[body.planetType] || { min: 40, max: 60 };
  }
  // Spread within range based on index to avoid overlapping signals
  const spread = total > 1 ? index / (total - 1) : 0.5;
  const jitter = ((body.id || '').charCodeAt(body.id.length - 1) || 0) % 7 - 3;
  return Math.max(0, Math.min(100, range.min + (range.max - range.min) * spread + jitter * 0.3));
}

export function generateFSSSignals(systemData) {
  const bodies = systemData?.bodies || [];
  // Only scannable bodies: stars, planets, moons, belts (not rings or individual asteroids)
  const scannable = bodies.filter(b =>
    b.type === 'star' || b.type === 'planet' || b.type === 'moon' || b.type === 'belt' || b.type === 'alien_site'
  );
  return scannable.map((body, i) => {
    const freq = getFrequencyForBody(body, i, scannable.length);
    return {
      id: `fss_${body.id}`,
      bodyId: body.id,
      bodyName: body.name || body.designation || 'Unknown Body',
      designation: body.designation,
      bodyType: body.type,
      planetType: body.planetType,
      planetTypeName: body.planetTypeName,
      frequency: freq,
      scanValue: body.scanValue || 0,
      isStar: body.type === 'star',
      isBelt: body.type === 'belt',
      isMoon: body.type === 'moon',
      starClass: body.starClass?.class,
    };
  }).sort((a, b) => a.frequency - b.frequency);
}

export function getScanProgress(signals, discoveredBodyIds) {
  const total = signals.length;
  const discoveredSet = discoveredBodyIds instanceof Set ? discoveredBodyIds : new Set(discoveredBodyIds);
  const found = signals.filter(s => discoveredSet.has(s.bodyId)).length;
  return { found, total, pct: total > 0 ? Math.round((found / total) * 100) : 0 };
}

// Frequency range labels for the spectrum display
export const SPECTRUM_RANGES = [
  { label: 'STELLAR', min: 0, max: 10 },
  { label: 'GIANTS', min: 12, max: 32 },
  { label: 'METAL', min: 34, max: 48 },
  { label: 'ROCKY', min: 46, max: 66 },
  { label: 'ICY', min: 66, max: 76 },
  { label: 'HABIT', min: 76, max: 94 },
  { label: 'BELTS', min: 92, max: 100 },
];