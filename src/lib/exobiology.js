// Exobiology — surface biological scanning and species Codex

export const BIO_TYPES = [
  { id: 'bacterium', name: 'Bacterium', baseValue: 10000, color: '#aaffaa' },
  { id: 'fungoida', name: 'Fungoida', baseValue: 15000, color: '#ffaa44' },
  { id: 'osseus', name: 'Osseus', baseValue: 20000, color: '#ff8866' },
  { id: 'tussocks', name: 'Tussocks', baseValue: 12000, color: '#88ff88' },
  { id: 'stratum', name: 'Stratum Tectonicus', baseValue: 25000, color: '#66ddff' },
  { id: 'clypeus', name: 'Clypeus Speculi', baseValue: 18000, color: '#ddaaff' },
];

export const SAMPLES_REQUIRED = 3;

export function generateBioSignals(bodyId, planetType) {
  const count = 1 + Math.floor(Math.random() * 3);
  const available = [...BIO_TYPES];
  const signals = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const species = available.splice(idx, 1)[0];
    signals.push({
      id: `bio_${bodyId}_${species.id}`,
      speciesId: species.id,
      name: species.name,
      baseValue: species.baseValue,
      color: species.color,
    });
  }
  return signals;
}

export function calculateExobioPayout(species) {
  return Math.round(species.baseValue * (1 + Math.random() * 0.3));
}