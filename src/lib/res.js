// Resource Extraction Sites — high-yield mining hotspots in planetary rings

function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) | 0;
  return () => { s = (s * 1103515245 + 12345) | 0; return ((s >>> 16) & 0x7fff) / 0x7fff; };
}

export const RES_TYPES = [
  { id: 'low', label: 'Low RES', yieldMult: 1.2, pirateChance: 0.05, desc: 'Sparse asteroid cluster, low risk' },
  { id: 'normal', label: 'Resource Extraction', yieldMult: 1.8, pirateChance: 0.12, desc: 'Standard mining site' },
  { id: 'pristine', label: 'Pristine RES', yieldMult: 2.5, pirateChance: 0.15, desc: 'Untouched rich deposits' },
  { id: 'hazardous', label: 'Hazardous RES', yieldMult: 3.5, pirateChance: 0.30, desc: 'Dangerous but extremely lucrative' },
];

const RES_MATERIALS = ['iron', 'silicon', 'carbon', 'nickel', 'phosphorus', 'chromium', 'manganese', 'zinc', 'germanium', 'tin', 'tungsten', 'platinum', 'palladium', 'iridium', 'painite', 'low_temp_diamond', 'tritium', 'void_opals', 'alexandrite'];

export function generateRESSites(systemSeed, systemData) {
  if (!systemData?.bodies) return [];
  const ringBodies = systemData.bodies.filter(b => b.hasRings || b.type === 'belt');
  if (ringBodies.length === 0) return [];

  const rng = seededRandom(systemSeed + ':res');
  const sites = [];
  for (const body of ringBodies) {
    if (rng() < 0.65) {
      const type = RES_TYPES[Math.floor(rng() * RES_TYPES.length)];
      sites.push({
        id: `res_${body.id}`,
        bodyId: body.id,
        bodyName: body.name || body.designation,
        type,
        yieldMult: type.yieldMult,
        pirateChance: type.pirateChance,
      });
    }
  }
  return sites;
}

export function rollRESYield(yieldMult) {
  const mat = RES_MATERIALS[Math.floor(Math.random() * RES_MATERIALS.length)];
  const qty = Math.max(1, Math.ceil(Math.random() * 3 * yieldMult));
  return { materialId: mat, qty };
}