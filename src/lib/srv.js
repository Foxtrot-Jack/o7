// SRV Surface Rover — surface exploration via deployable rover
// Generates scan locations with materials, POIs, and data caches

const POI_TYPES = [
  { id: 'material_cache', name: 'Material Cache', icon: 'gem', value: 0, materialChance: 1.0 },
  { id: 'data_beacon', name: 'Data Beacon', icon: 'radio', value: 8000, materialChance: 0.2 },
  { id: 'wreckage', name: 'Crash Site', icon: 'ghost', value: 5000, materialChance: 0.6 },
  { id: 'crystalline_growth', name: 'Crystalline Growth', icon: 'sparkles', value: 12000, materialChance: 0.8 },
  { id: 'geological_vent', name: 'Geological Vent', icon: 'flame', value: 6000, materialChance: 0.5 },
  { id: 'ancient_obelisk', name: 'Ancient Obelisk', icon: 'monument', value: 20000, materialChance: 0.3 },
];

const SURFACE_MATERIALS = [
  'iron', 'silicon', 'carbon', 'nickel', 'phosphorus', 'sulphur',
  'chromium', 'manganese', 'zinc', 'germanium', 'tin', 'tungsten',
  'mercury', 'platinum', 'palladium',
];

const RARE_SURFACE_MATERIALS = ['iridium', 'painite', 'pristine_diamond', 'low_temp_diamond', 'alexandrite'];

export function generateSRVLocations(bodyId, planetType) {
  const seed = parseInt(bodyId.replace(/[^0-9]/g, '').slice(0, 8)) || 42;
  const locations = [];
  const numLocations = 4 + (seed % 4); // 4-7 locations

  for (let i = 0; i < numLocations; i++) {
    const rng = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
    const isPOI = rng < 0.4;
    const angle = rng * Math.PI * 2;
    const dist = 0.2 + rng * 0.8;

    if (isPOI) {
      const poiType = POI_TYPES[Math.floor(rng * POI_TYPES.length) % POI_TYPES.length];
      const materials = [];
      if (poiType.materialChance > rng) {
        const isRare = rng < 0.15;
        const pool = isRare ? RARE_SURFACE_MATERIALS : SURFACE_MATERIALS;
        const mat = pool[Math.floor(rng * pool.length) % pool.length];
        materials.push({ id: mat, qty: Math.floor(rng * 4) + 1 });
      }
      locations.push({
        id: `srv_loc_${i}`,
        type: 'poi',
        poiType,
        name: poiType.name,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        materials,
        credits: poiType.value,
        scanned: false,
      });
    } else {
      const isRare = rng < 0.1;
      const pool = isRare ? RARE_SURFACE_MATERIALS : SURFACE_MATERIALS;
      const matCount = Math.floor(rng * 3) + 1;
      const materials = [];
      for (let j = 0; j < matCount; j++) {
        const mat = pool[Math.floor(rng * (j + 1) * pool.length) % pool.length];
        const existing = materials.find(m => m.id === mat);
        if (existing) existing.qty += Math.floor(rng * 3) + 1;
        else materials.push({ id: mat, qty: Math.floor(rng * 3) + 1 });
      }
      locations.push({
        id: `srv_loc_${i}`,
        type: 'deposit',
        name: `Mineral Deposit ${i + 1}`,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        materials,
        credits: 0,
        scanned: false,
      });
    }
  }

  return locations;
}

export function hasSRVHangar(modules) {
  return Object.values(modules || {}).some(id => typeof id === 'string' && id.startsWith('srv_'));
}