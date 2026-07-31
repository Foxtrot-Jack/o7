// Dynamic Economy — commodity prices shift over time based on market cycles
// Prices change each jump cycle, with trend indicators

// Get the current market cycle (changes each jump)
export function getMarketCycle(totalJumps) {
  return totalJumps || 0;
}

// Get price modifier for a commodity based on the current cycle
// Returns a multiplier around 1.0 (0.7 = cheap, 1.4 = expensive)
export function getPriceModifier(basePrice, systemSeed, stationId, cycle) {
  // Use a pseudo-random function based on the cycle to create price shifts
  const seed = parseInt(systemSeed) || 0;
  const stationHash = stationId?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
  const combined = (seed + stationHash + cycle * 137 + basePrice * 7) % 1000;
  const wave = Math.sin(combined * 0.01) * 0.15; // -0.15 to +0.15
  const noise = ((combined * 9301 + 49297) % 233280) / 233280 - 0.5; // -0.5 to +0.5
  return 1.0 + wave + noise * 0.1; // ~0.75 to ~1.25
}

// Compare current price to base price for trend indicator
export function getPriceTrend(currentPrice, basePrice) {
  const ratio = currentPrice / basePrice;
  if (ratio > 1.08) return 'up';
  if (ratio < 0.92) return 'down';
  return 'stable';
}

// Get trend label and color
export function getTrendDisplay(trend) {
  switch (trend) {
    case 'up': return { label: '▲ RISING', color: 'text-green-400' };
    case 'down': return { label: '▼ FALLING', color: 'text-red-400' };
    default: return { label: '◆ STABLE', color: 'text-orange-600' };
  }
}