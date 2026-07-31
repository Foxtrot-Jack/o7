// Market Analysis — commodity price tracking and AI-powered trade reports

import { COMMODITIES, COMMODITY_MAP, COMMODITY_CATEGORIES } from './commodities';

// Generate a deterministic "visited station" price snapshot for display
export function generatePriceSnapshot(systemSeed, systemData) {
  const prices = [];
  const rng = ((systemSeed || 0) * 9301 + 49297) % 233280;
  for (const comm of COMMODITIES.slice(0, 30)) {
    const variance = 0.7 + ((rng + comm.id.length * 17) % 60) / 100;
    const price = Math.round(comm.basePrice * variance);
    prices.push({ id: comm.id, name: comm.name, category: comm.category, price, basePrice: comm.basePrice, variance });
  }
  return prices;
}

export function findBestDeals(prices) {
  const sorted = [...prices].sort((a, b) => b.variance - a.variance);
  return {
    bestBuys: sorted.slice(0, 5).reverse(),
    bestSells: sorted.slice(-5).reverse(),
  };
}

export function generateReportPrompt(system) {
  return `You are a galactic trade analyst AI for the space simulation "Dogstar Interstellar".
Generate a brief (3-4 sentence) market report for the star system "${system.name}".

System details:
- Security: ${system.security}
- Population: ${system.population?.toLocaleString() || 'unknown'}
- Star class: ${system.starClass?.class || 'unknown'}

Write a flavorful, in-character trade advisory. Mention which commodity categories are likely to be in high demand or oversupplied based on the system's characteristics. Keep it concise and immersive. No bullet points — just a short paragraph.`;
}