// Station parts definitions for the custom station creator
// Supports orbital and surface variants. Modules have NO part limit.

export const STATION_TYPES = [
  { id: 'orbital', name: 'Orbital Station', desc: 'Space-based station in planetary orbit' },
  { id: 'surface', name: 'Surface Base', desc: 'Ground-based installation on a planetary surface' },
];

export const STATION_PART_CATEGORIES = {
  core: { name: 'Core', slot: 'core' },
  docking: { name: 'Docking', slot: 'docking' },
  habitat: { name: 'Habitat', slot: 'habitat' },
  power: { name: 'Power', slot: 'power' },
  comm: { name: 'Comms', slot: 'comm' },
  defense: { name: 'Defense', slot: 'defense' },
  module: { name: 'Module', slot: 'module' },
};

export const STATION_SLOTS = [
  { id: 'core', label: 'Core Hub', category: 'core', pos: [0, 0, 0] },
  { id: 'docking_n', label: 'North Dock', category: 'docking', pos: [0, 0, 2.5] },
  { id: 'docking_s', label: 'South Dock', category: 'docking', pos: [0, 0, -2.5] },
  { id: 'habitat', label: 'Habitat', category: 'habitat', pos: [2.5, 0, 0] },
  { id: 'power', label: 'Power Plant', category: 'power', pos: [-2.5, 0, 0] },
  { id: 'comm', label: 'Comm Array', category: 'comm', pos: [0, 1.8, 0] },
  { id: 'defense_1', label: 'Defense NE', category: 'defense', pos: [2, 0.8, 2] },
  { id: 'defense_2', label: 'Defense SW', category: 'defense', pos: [-2, 0.8, -2] },
];

export const STATION_PARTS = {
  core: [
    { id: 'score_orb_hub', name: 'Orbital Hub', shape: 'box', stationType: 'orbital', cost: 5000000, dockBonus: 2, popBonus: 50 },
    { id: 'score_rot_hub', name: 'Rotating Hub', shape: 'cylinder', stationType: 'orbital', cost: 12000000, dockBonus: 3, popBonus: 100 },
    { id: 'score_spoke', name: 'Spoke Core', shape: 'octagon', stationType: 'orbital', cost: 25000000, dockBonus: 4, popBonus: 200 },
    { id: 'score_ring', name: 'Ring Core', shape: 'cylinder', stationType: 'orbital', cost: 50000000, dockBonus: 6, popBonus: 400 },
    { id: 'score_spire', name: 'Central Spire', shape: 'cone', stationType: 'orbital', cost: 18000000, dockBonus: 2, popBonus: 150 },
    { id: 'score_cmd', name: 'Command Center', shape: 'box', stationType: 'surface', cost: 3000000, dockBonus: 2, popBonus: 50 },
    { id: 'score_tower', name: 'Control Tower', shape: 'cylinder', stationType: 'surface', cost: 5000000, dockBonus: 1, popBonus: 30 },
    { id: 'score_admin', name: 'Admin Building', shape: 'box', stationType: 'surface', cost: 2000000, dockBonus: 1, popBonus: 80 },
    { id: 'score_ops_dome', name: 'Operations Dome', shape: 'sphere', stationType: 'surface', cost: 8000000, dockBonus: 2, popBonus: 100 },
  ],
  docking: [
    { id: 'sdock_arm', name: 'Docking Arm', shape: 'cylinder', stationType: 'orbital', cost: 2000000, dockBonus: 2 },
    { id: 'sdock_ring', name: 'Docking Ring', shape: 'octagon', stationType: 'orbital', cost: 8000000, dockBonus: 4 },
    { id: 'sdock_bay', name: 'Landing Bay', shape: 'box', stationType: 'orbital', cost: 5000000, dockBonus: 3 },
    { id: 'sdock_mega', name: 'Mega Dock', shape: 'box', stationType: 'orbital', cost: 15000000, dockBonus: 6 },
    { id: 'sdock_pad', name: 'Landing Pad', shape: 'box', stationType: 'surface', cost: 1000000, dockBonus: 2 },
    { id: 'sdock_hangar', name: 'Hangar Bay', shape: 'box', stationType: 'surface', cost: 4000000, dockBonus: 4 },
    { id: 'sdock_depot', name: 'Vehicle Depot', shape: 'box', stationType: 'surface', cost: 2000000, dockBonus: 2 },
    { id: 'sdock_cluster', name: 'Pad Cluster', shape: 'octagon', stationType: 'surface', cost: 6000000, dockBonus: 5 },
  ],
  habitat: [
    { id: 'shab_ring', name: 'Habitat Ring', shape: 'cylinder', stationType: 'orbital', cost: 10000000, popBonus: 300 },
    { id: 'shab_cyl', name: 'Habitat Cylinder', shape: 'cylinder', stationType: 'orbital', cost: 6000000, popBonus: 200 },
    { id: 'shab_bio_dome', name: 'Biosphere Dome', shape: 'sphere', stationType: 'orbital', cost: 15000000, popBonus: 400 },
    { id: 'shab_dome', name: 'Habitat Dome', shape: 'sphere', stationType: 'surface', cost: 5000000, popBonus: 250 },
    { id: 'shab_block', name: 'Residential Block', shape: 'box', stationType: 'surface', cost: 3000000, popBonus: 200 },
    { id: 'shab_barracks', name: 'Barracks', shape: 'box', stationType: 'surface', cost: 1500000, popBonus: 150 },
  ],
  power: [
    { id: 'spow_solar_orb', name: 'Solar Array', shape: 'box', stationType: 'orbital', cost: 3000000, powerBonus: 100 },
    { id: 'spow_fusion_orb', name: 'Fusion Reactor', shape: 'cylinder', stationType: 'orbital', cost: 12000000, powerBonus: 500 },
    { id: 'spow_anti_orb', name: 'Antimatter Plant', shape: 'sphere', stationType: 'orbital', cost: 40000000, powerBonus: 1500 },
    { id: 'spow_solar_sur', name: 'Solar Farm', shape: 'box', stationType: 'surface', cost: 2000000, powerBonus: 100 },
    { id: 'spow_fusion_sur', name: 'Fusion Plant', shape: 'cylinder', stationType: 'surface', cost: 10000000, powerBonus: 500 },
    { id: 'spow_geo', name: 'Geothermal Tap', shape: 'cone', stationType: 'surface', cost: 6000000, powerBonus: 300 },
  ],
  comm: [
    { id: 'scomm_tower', name: 'Comm Tower', shape: 'cylinder', stationType: 'both', cost: 1000000, commBonus: 50 },
    { id: 'scomm_sensor', name: 'Sensor Array', shape: 'sphere', stationType: 'both', cost: 4000000, commBonus: 150 },
    { id: 'scomm_deep', name: 'Deep Space Antenna', shape: 'cone', stationType: 'both', cost: 8000000, commBonus: 300 },
  ],
  defense: [
    { id: 'sdef_turret', name: 'Turret Battery', shape: 'cylinder', stationType: 'both', cost: 3000000, defBonus: 50 },
    { id: 'sdef_missile', name: 'Missile Battery', shape: 'box', stationType: 'both', cost: 8000000, defBonus: 120 },
    { id: 'sdef_shield', name: 'Shield Generator', shape: 'sphere', stationType: 'both', cost: 20000000, defBonus: 300 },
  ],
  module: [
    { id: 'smod_cargo', name: 'Cargo Module', shape: 'box', stationType: 'both', cost: 1000000, cargoBonus: 20 },
    { id: 'smod_antenna', name: 'Antenna', shape: 'cylinder', stationType: 'both', cost: 500000 },
    { id: 'smod_spire', name: 'Spire', shape: 'cone', stationType: 'both', cost: 800000 },
    { id: 'smod_dome', name: 'Observation Dome', shape: 'sphere', stationType: 'both', cost: 2000000, popBonus: 50 },
    { id: 'smod_fin', name: 'Fin', shape: 'wedge', stationType: 'both', cost: 300000 },
    { id: 'smod_plate', name: 'Armor Plate', shape: 'box', stationType: 'both', cost: 500000, defBonus: 20 },
    { id: 'smod_ring', name: 'Ring Section', shape: 'cylinder', stationType: 'both', cost: 3000000, popBonus: 100 },
    { id: 'smod_hub', name: 'Hub', shape: 'octagon', stationType: 'both', cost: 4000000, dockBonus: 2 },
    { id: 'smod_sensor', name: 'Sensor Pod', shape: 'sphere', stationType: 'both', cost: 3000000, commBonus: 100 },
    { id: 'smod_tank', name: 'Storage Tank', shape: 'cylinder', stationType: 'both', cost: 1500000, cargoBonus: 30 },
    { id: 'smod_greenhouse', name: 'Greenhouse', shape: 'sphere', stationType: 'both', cost: 2500000, popBonus: 80 },
    { id: 'smod_workshop', name: 'Workshop', shape: 'box', stationType: 'both', cost: 2000000, cargoBonus: 15 },
    { id: 'smod_wind', name: 'Wind Turbine', shape: 'cone', stationType: 'surface', cost: 800000, powerBonus: 50 },
    { id: 'smod_water', name: 'Water Tower', shape: 'cylinder', stationType: 'surface', cost: 600000, popBonus: 40 },
    { id: 'smod_solar_panel', name: 'Solar Panel', shape: 'box', stationType: 'both', cost: 400000, powerBonus: 30 },
    { id: 'smod_beacon', name: 'Nav Beacon', shape: 'octagon', stationType: 'both', cost: 1000000, commBonus: 60 },
  ],
};

export const STATION_PART_MAP = {};
for (const [cat, parts] of Object.entries(STATION_PARTS)) {
  for (const p of parts) {
    STATION_PART_MAP[p.id] = { ...p, category: cat };
  }
}

export function getStationPartsForSlot(slotId, stationType) {
  const slot = STATION_SLOTS.find(s => s.id === slotId);
  if (!slot) return [];
  return STATION_PARTS[slot.category].filter(p =>
    p.stationType === 'both' || p.stationType === stationType
  );
}

export function getStationModuleParts(stationType) {
  return STATION_PARTS.module.filter(p =>
    p.stationType === 'both' || p.stationType === stationType
  );
}

export function createEmptyStationDesign(type = 'orbital') {
  const parts = {};
  for (const slot of STATION_SLOTS) {
    const available = STATION_PARTS[slot.category].filter(p =>
      p.stationType === 'both' || p.stationType === type
    );
    parts[slot.id] = {
      partId: available.length > 0 ? available[0].id : null,
      scale: [1, 1, 1],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    };
  }
  return { name: 'Untitled Station', type, parts, moduleSlots: [] };
}

export function addModuleToDesign(design) {
  const moduleId = `mod_${Date.now()}_${Math.floor(Math.random() * 999)}`;
  const count = (design.moduleSlots || []).length;
  const angle = count * 0.9;
  const r = 3.5 + Math.floor(count / 8) * 1.5;
  const newSlot = {
    id: moduleId,
    label: `Module ${count + 1}`,
    category: 'module',
    pos: [Math.cos(angle) * r, Math.sin(count * 0.5) * 0.8, Math.sin(angle) * r],
  };
  const moduleParts = getStationModuleParts(design.type);
  return {
    ...design,
    moduleSlots: [...(design.moduleSlots || []), newSlot],
    parts: {
      ...design.parts,
      [moduleId]: {
        partId: moduleParts.length > 0 ? moduleParts[0].id : null,
        scale: [1, 1, 1],
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
    },
  };
}

export function removeModuleFromDesign(design, moduleId) {
  const newParts = { ...design.parts };
  delete newParts[moduleId];
  return {
    ...design,
    moduleSlots: (design.moduleSlots || []).filter(s => s.id !== moduleId),
    parts: newParts,
  };
}

export function getAllStationSlots(design) {
  return [...STATION_SLOTS, ...(design.moduleSlots || [])];
}

export function computeStationStats(design) {
  let dockCapacity = 4;
  let population = 50;
  let powerOutput = 200;
  let defenseRating = 20;
  let commRange = 100;
  let cargoStorage = 100;
  let cost = 0;

  for (const [slotId, partRef] of Object.entries(design.parts)) {
    if (!partRef?.partId) continue;
    const part = STATION_PART_MAP[partRef.partId];
    if (!part) continue;
    const scale = partRef.scale || [1, 1, 1];
    const scaleMult = (scale[0] + scale[1] + scale[2]) / 3;
    if (part.dockBonus) dockCapacity += Math.round(part.dockBonus * scaleMult);
    if (part.popBonus) population += Math.round(part.popBonus * scaleMult);
    if (part.powerBonus) powerOutput += Math.round(part.powerBonus * scaleMult);
    if (part.defBonus) defenseRating += Math.round(part.defBonus * scaleMult);
    if (part.commBonus) commRange += Math.round(part.commBonus * scaleMult);
    if (part.cargoBonus) cargoStorage += Math.round(part.cargoBonus * scaleMult);
    cost += part.cost || 0;
  }

  const revenuePerHour = Math.round(
    (dockCapacity * 5000 + population * 50 + cargoStorage * 20 + commRange * 10) *
    (design.type === 'orbital' ? 1.3 : 1.0)
  );

  return {
    dockCapacity,
    population,
    powerOutput,
    defenseRating,
    commRange,
    cargoStorage,
    revenuePerHour,
    cost: Math.max(5000000, cost),
  };
}