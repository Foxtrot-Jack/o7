// Ship parts definitions for the custom ship creator
// Low-poly shapes with snappable slots and resizable parts

export const SHIP_PART_CATEGORIES = {
  hull: { name: 'Hull', slot: 'hull' },
  cockpit: { name: 'Cockpit', slot: 'cockpit' },
  wing: { name: 'Wings', slot: 'wing' },
  engine: { name: 'Engines', slot: 'engine' },
  cargo: { name: 'Cargo / Fuel', slot: 'cargo' },
  weapon: { name: 'Weapons', slot: 'weapon' },
};

export const SHIP_SLOTS = [
  { id: 'hull', label: 'Hull', category: 'hull', pos: [0, 0, 0] },
  { id: 'cockpit', label: 'Cockpit', category: 'cockpit', pos: [0, 0.5, 1] },
  { id: 'wing_left', label: 'Left Wing', category: 'wing', pos: [-1.5, 0, 0] },
  { id: 'wing_right', label: 'Right Wing', category: 'wing', pos: [1.5, 0, 0] },
  { id: 'engine_left', label: 'Left Engine', category: 'engine', pos: [-0.4, 0, -1.3] },
  { id: 'engine_right', label: 'Right Engine', category: 'engine', pos: [0.4, 0, -1.3] },
  { id: 'cargo_top', label: 'Top Cargo', category: 'cargo', pos: [0, 0.9, -0.3] },
  { id: 'cargo_bottom', label: 'Bottom Cargo', category: 'cargo', pos: [0, -0.7, -0.3] },
  { id: 'weapon_left', label: 'Left Weapon', category: 'weapon', pos: [-0.9, 0.3, 0.6] },
  { id: 'weapon_right', label: 'Right Weapon', category: 'weapon', pos: [0.9, 0.3, 0.6] },
];

export const SHIP_PARTS = {
  hull: [
    { id: 'hull_arrow', name: 'Arrow Hull', shape: 'cone', unlockLevel: 0, baseCargo: 4, baseFuel: 8, baseCost: 0 },
    { id: 'hull_wedge', name: 'Wedge Hull', shape: 'wedge', unlockLevel: 1, baseCargo: 8, baseFuel: 16, baseCost: 50000 },
    { id: 'hull_box', name: 'Box Hull', shape: 'box', unlockLevel: 1, baseCargo: 16, baseFuel: 16, baseCost: 100000 },
    { id: 'hull_cylinder', name: 'Cylinder Hull', shape: 'cylinder', unlockLevel: 2, baseCargo: 24, baseFuel: 24, baseCost: 500000 },
    { id: 'hull_sphere', name: 'Spherical Hull', shape: 'sphere', unlockLevel: 3, baseCargo: 32, baseFuel: 32, baseCost: 2000000 },
    { id: 'hull_octagon', name: 'Octagonal Hull', shape: 'octagon', unlockLevel: 4, baseCargo: 64, baseFuel: 48, baseCost: 10000000 },
    { id: 'hull_titan', name: 'Titan Hull', shape: 'box', unlockLevel: 5, baseCargo: 128, baseFuel: 64, baseCost: 50000000 },
  ],
  cockpit: [
    { id: 'cockpit_bubble', name: 'Bubble Canopy', shape: 'sphere', unlockLevel: 0, cost: 5000 },
    { id: 'cockpit_slanted', name: 'Slanted Canopy', shape: 'cone', unlockLevel: 1, cost: 20000 },
    { id: 'cockpit_armored', name: 'Armored Canopy', shape: 'box', unlockLevel: 2, cost: 100000 },
    { id: 'cockpit_panoramic', name: 'Panoramic Canopy', shape: 'sphere', unlockLevel: 3, cost: 500000 },
  ],
  wing: [
    { id: 'wing_straight', name: 'Straight Wing', shape: 'box', unlockLevel: 0, cost: 5000 },
    { id: 'wing_swept', name: 'Swept Wing', shape: 'wedge', unlockLevel: 1, cost: 25000 },
    { id: 'wing_delta', name: 'Delta Wing', shape: 'wedge', unlockLevel: 2, cost: 100000 },
    { id: 'wing_caniard', name: 'Caniard Wing', shape: 'box', unlockLevel: 3, cost: 250000 },
    { id: 'wing_variable', name: 'Variable Wing', shape: 'wedge', unlockLevel: 4, cost: 1000000 },
  ],
  engine: [
    { id: 'engine_basic', name: 'Basic Thruster', shape: 'cylinder', unlockLevel: 0, cost: 5000, jumpBonus: 2 },
    { id: 'engine_twin', name: 'Twin Thruster', shape: 'cylinder', unlockLevel: 1, cost: 30000, jumpBonus: 4 },
    { id: 'engine_ion', name: 'Ion Drive', shape: 'cone', unlockLevel: 2, cost: 200000, jumpBonus: 6 },
    { id: 'engine_plasma', name: 'Plasma Drive', shape: 'sphere', unlockLevel: 3, cost: 1000000, jumpBonus: 8 },
    { id: 'engine_quantum', name: 'Quantum Drive', shape: 'cylinder', unlockLevel: 4, cost: 5000000, jumpBonus: 12 },
    { id: 'engine_warp', name: 'Warp Drive', shape: 'sphere', unlockLevel: 5, cost: 20000000, jumpBonus: 16 },
  ],
  cargo: [
    { id: 'cargo_pod', name: 'Cargo Pod', shape: 'cylinder', unlockLevel: 0, cost: 5000, cargoBonus: 4 },
    { id: 'cargo_hold', name: 'Cargo Hold', shape: 'box', unlockLevel: 1, cost: 30000, cargoBonus: 8 },
    { id: 'cargo_tank', name: 'Fuel Tank', shape: 'sphere', unlockLevel: 1, cost: 30000, fuelBonus: 8 },
    { id: 'cargo_expandable', name: 'Expandable Rack', shape: 'box', unlockLevel: 2, cost: 150000, cargoBonus: 16 },
    { id: 'cargo_liquid', name: 'Liquid Container', shape: 'cylinder', unlockLevel: 3, cost: 500000, fuelBonus: 32 },
  ],
  weapon: [
    { id: 'weapon_laser', name: 'Laser Turret', shape: 'cylinder', unlockLevel: 1, cost: 25000 },
    { id: 'weapon_cannon', name: 'Cannon', shape: 'cylinder', unlockLevel: 2, cost: 150000 },
    { id: 'weapon_missile', name: 'Missile Rack', shape: 'box', unlockLevel: 3, cost: 500000 },
    { id: 'weapon_railgun', name: 'Railgun', shape: 'box', unlockLevel: 4, cost: 2000000 },
    { id: 'weapon_plasma', name: 'Plasma Cannon', shape: 'sphere', unlockLevel: 5, cost: 10000000 },
  ],
};

export const SHIP_PART_MAP = {};
for (const [cat, parts] of Object.entries(SHIP_PARTS)) {
  for (const p of parts) {
    SHIP_PART_MAP[p.id] = { ...p, category: cat };
  }
}

export function getPartsForSlot(slotId, shipyardLevel) {
  const slot = SHIP_SLOTS.find(s => s.id === slotId);
  if (!slot) return [];
  return SHIP_PARTS[slot.category].filter(p => p.unlockLevel <= shipyardLevel);
}

export function createEmptyDesign() {
  const parts = {};
  for (const slot of SHIP_SLOTS) {
    if (slot.category === 'hull') parts[slot.id] = { partId: 'hull_arrow', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
    else if (slot.category === 'cockpit') parts[slot.id] = { partId: 'cockpit_bubble', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
    else if (slot.category === 'wing') parts[slot.id] = { partId: 'wing_straight', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
    else if (slot.category === 'engine') parts[slot.id] = { partId: 'engine_basic', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
    else parts[slot.id] = { partId: null, scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
  }
  return { name: 'Untitled Vessel', parts };
}

export function computeCustomShipStats(design) {
  let cargoCapacity = 0;
  let fuelCapacity = 0;
  let jumpRange = 5;
  let cost = 0;

  const hullPart = design.parts.hull?.partId ? SHIP_PART_MAP[design.parts.hull.partId] : null;
  if (hullPart) {
    const hullScale = design.parts.hull.scale || [1, 1, 1];
    const hullMult = (hullScale[0] + hullScale[1] + hullScale[2]) / 3;
    cargoCapacity += Math.round((hullPart.baseCargo || 0) * hullMult);
    fuelCapacity += Math.round((hullPart.baseFuel || 0) * hullMult);
    cost += hullPart.baseCost || 0;
  }

  for (const [slotId, partRef] of Object.entries(design.parts)) {
    if (!partRef.partId || slotId === 'hull') continue;
    const part = SHIP_PART_MAP[partRef.partId];
    if (!part) continue;
    const scale = partRef.scale || [1, 1, 1];
    const scaleMult = (scale[0] + scale[1] + scale[2]) / 3;
    if (part.cargoBonus) cargoCapacity += Math.round(part.cargoBonus * scaleMult);
    if (part.fuelBonus) fuelCapacity += Math.round(part.fuelBonus * scaleMult);
    if (part.jumpBonus) jumpRange += Math.round(part.jumpBonus * scaleMult);
    cost += part.cost || 0;
  }

  return {
    cargoCapacity: Math.max(2, cargoCapacity),
    fuelCapacity: Math.max(4, fuelCapacity),
    jumpRange: Math.max(5, jumpRange),
    cost: Math.max(0, cost),
  };
}

export const SHIPYARD_LEVELS = [
  { level: 0, name: 'Foundation', infraRequired: 0, desc: 'Basic hulls and components only.' },
  { level: 1, name: 'Workshop', infraRequired: 20, desc: 'Standard parts available.' },
  { level: 2, name: 'Factory', infraRequired: 40, desc: 'Improved parts and shapes.' },
  { level: 3, name: 'Advanced Yard', infraRequired: 60, desc: 'High-grade components.' },
  { level: 4, name: 'Elite Yard', infraRequired: 80, desc: 'Premium parts unlocked.' },
  { level: 5, name: 'Master Yard', infraRequired: 100, desc: 'All parts and shapes available.' },
];

export function getShipyardLevel(infra) {
  for (let i = SHIPYARD_LEVELS.length - 1; i >= 0; i--) {
    if (infra >= SHIPYARD_LEVELS[i].infraRequired) return SHIPYARD_LEVELS[i];
  }
  return SHIPYARD_LEVELS[0];
}