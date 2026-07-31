// Carrier parts definitions for the custom carrier creator
// Similar to ship parts but scaled up, with a structural category for visual customization

export const CARRIER_PART_CATEGORIES = {
  hull: { name: 'Hull', slot: 'hull' },
  bridge: { name: 'Bridge', slot: 'bridge' },
  docking: { name: 'Docking Bay', slot: 'docking' },
  engine: { name: 'Engines', slot: 'engine' },
  wing: { name: 'Stabilizers', slot: 'wing' },
  structural: { name: 'Structural', slot: 'structural' },
};

export const CARRIER_SLOTS = [
  { id: 'hull', label: 'Hull', category: 'hull', pos: [0, 0, 0] },
  { id: 'bridge', label: 'Bridge', category: 'bridge', pos: [0, 1.8, 1.2] },
  { id: 'docking_left', label: 'Left Dock', category: 'docking', pos: [-2.2, 0, 0] },
  { id: 'docking_right', label: 'Right Dock', category: 'docking', pos: [2.2, 0, 0] },
  { id: 'engine_left', label: 'Left Engine', category: 'engine', pos: [-1, 0, -2.5] },
  { id: 'engine_right', label: 'Right Engine', category: 'engine', pos: [1, 0, -2.5] },
  { id: 'wing_left', label: 'Left Stabilizer', category: 'wing', pos: [-3, 0, 0] },
  { id: 'wing_right', label: 'Right Stabilizer', category: 'wing', pos: [3, 0, 0] },
  // Structural slots — purely visual, high limit
  { id: 'struct_1', label: 'Top Front', category: 'structural', pos: [0, 1.5, 2] },
  { id: 'struct_2', label: 'Top Center', category: 'structural', pos: [0, 2, 0] },
  { id: 'struct_3', label: 'Top Rear', category: 'structural', pos: [0, 1.5, -2] },
  { id: 'struct_4', label: 'Left Upper', category: 'structural', pos: [-1.8, 1.2, 0.5] },
  { id: 'struct_5', label: 'Right Upper', category: 'structural', pos: [1.8, 1.2, 0.5] },
  { id: 'struct_6', label: 'Bottom Front', category: 'structural', pos: [0, -1.2, 1.5] },
  { id: 'struct_7', label: 'Bottom Rear', category: 'structural', pos: [0, -1.2, -1.5] },
  { id: 'struct_8', label: 'Left Lower', category: 'structural', pos: [-2, -0.8, 0] },
  { id: 'struct_9', label: 'Right Lower', category: 'structural', pos: [2, -0.8, 0] },
  { id: 'struct_10', label: 'Rear Center', category: 'structural', pos: [0, 0, -3] },
];

export const CARRIER_PARTS = {
  hull: [
    { id: 'chull_asteroid', name: 'Asteroid Base', shape: 'sphere', unlockLevel: 0, baseShipCap: 4, baseTritium: 200, baseCost: 0 },
    { id: 'chull_box', name: 'Box Carrier', shape: 'box', unlockLevel: 0, baseShipCap: 6, baseTritium: 300, baseCost: 50000000 },
    { id: 'chull_cylinder', name: 'Cylinder Carrier', shape: 'cylinder', unlockLevel: 1, baseShipCap: 8, baseTritium: 400, baseCost: 200000000 },
    { id: 'chull_octagon', name: 'Octagon Carrier', shape: 'octagon', unlockLevel: 2, baseShipCap: 12, baseTritium: 600, baseCost: 500000000 },
    { id: 'chull_sphere', name: 'Sphere Carrier', shape: 'sphere', unlockLevel: 3, baseShipCap: 16, baseTritium: 800, baseCost: 2000000000 },
    { id: 'chull_titan', name: 'Titan Carrier', shape: 'box', unlockLevel: 5, baseShipCap: 24, baseTritium: 1200, baseCost: 5000000000 },
  ],
  bridge: [
    { id: 'bridge_tower', name: 'Tower Bridge', shape: 'box', unlockLevel: 0, cost: 10000000 },
    { id: 'bridge_dome', name: 'Dome Bridge', shape: 'sphere', unlockLevel: 0, cost: 15000000 },
    { id: 'bridge_cylinder', name: 'Cylinder Bridge', shape: 'cylinder', unlockLevel: 1, cost: 50000000 },
    { id: 'bridge_panoramic', name: 'Panoramic Bridge', shape: 'sphere', unlockLevel: 2, cost: 100000000 },
  ],
  docking: [
    { id: 'dock_box', name: 'Box Docking Bay', shape: 'box', unlockLevel: 0, cost: 20000000, shipBonus: 2 },
    { id: 'dock_cylinder', name: 'Cylinder Docking Bay', shape: 'cylinder', unlockLevel: 1, cost: 100000000, shipBonus: 3 },
    { id: 'dock_octagon', name: 'Octagon Docking Bay', shape: 'octagon', unlockLevel: 2, cost: 300000000, shipBonus: 4 },
    { id: 'dock_sphere', name: 'Sphere Docking Bay', shape: 'sphere', unlockLevel: 3, cost: 800000000, shipBonus: 6 },
  ],
  engine: [
    { id: 'cengine_basic', name: 'Standard Drive', shape: 'cylinder', unlockLevel: 0, cost: 10000000, tritiumBonus: 50 },
    { id: 'cengine_ion', name: 'Ion Drive', shape: 'cone', unlockLevel: 1, cost: 50000000, tritiumBonus: 100 },
    { id: 'cengine_plasma', name: 'Plasma Drive', shape: 'sphere', unlockLevel: 2, cost: 200000000, tritiumBonus: 150 },
    { id: 'cengine_quantum', name: 'Quantum Drive', shape: 'cylinder', unlockLevel: 4, cost: 1000000000, tritiumBonus: 300 },
  ],
  wing: [
    { id: 'cwing_box', name: 'Box Stabilizer', shape: 'box', unlockLevel: 0, cost: 5000000 },
    { id: 'cwing_wedge', name: 'Wedge Stabilizer', shape: 'wedge', unlockLevel: 1, cost: 25000000 },
    { id: 'cwing_cylinder', name: 'Cylinder Stabilizer', shape: 'cylinder', unlockLevel: 2, cost: 100000000 },
  ],
  structural: [
    { id: 'struct_antenna', name: 'Antenna Array', shape: 'cylinder', unlockLevel: 0, cost: 500000 },
    { id: 'struct_dome', name: 'Observation Dome', shape: 'sphere', unlockLevel: 0, cost: 2000000 },
    { id: 'struct_spire', name: 'Spire', shape: 'cone', unlockLevel: 0, cost: 1000000 },
    { id: 'struct_cargo', name: 'Cargo Module', shape: 'box', unlockLevel: 0, cost: 1000000 },
    { id: 'struct_tower', name: 'Comm Tower', shape: 'box', unlockLevel: 1, cost: 5000000 },
    { id: 'struct_sensor', name: 'Sensor Pod', shape: 'sphere', unlockLevel: 1, cost: 8000000 },
    { id: 'struct_fin', name: 'Fin', shape: 'wedge', unlockLevel: 0, cost: 500000 },
    { id: 'struct_hub', name: 'Hub', shape: 'octagon', unlockLevel: 2, cost: 20000000 },
    { id: 'struct_ring', name: 'Ring Section', shape: 'cylinder', unlockLevel: 1, cost: 15000000 },
    { id: 'struct_plate', name: 'Armor Plate', shape: 'box', unlockLevel: 0, cost: 1000000 },
  ],
};

export const CARRIER_PART_MAP = {};
for (const [cat, parts] of Object.entries(CARRIER_PARTS)) {
  for (const p of parts) {
    CARRIER_PART_MAP[p.id] = { ...p, category: cat };
  }
}

export function getCarrierPartsForSlot(slotId, level) {
  const slot = CARRIER_SLOTS.find(s => s.id === slotId);
  if (!slot) return [];
  return CARRIER_PARTS[slot.category].filter(p => p.unlockLevel <= level);
}

export function createEmptyCarrierDesign() {
  const parts = {};
  for (const slot of CARRIER_SLOTS) {
    if (slot.category === 'hull') parts[slot.id] = { partId: 'chull_asteroid', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
    else if (slot.category === 'bridge') parts[slot.id] = { partId: 'bridge_tower', scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
    else parts[slot.id] = { partId: null, scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] };
  }
  return { name: 'Untitled Carrier', parts };
}

export function computeCarrierStats(design) {
  let shipCapacity = 4;
  let tritiumCapacity = 200;
  let cost = 5000000000;

  const hullPart = design.parts.hull?.partId ? CARRIER_PART_MAP[design.parts.hull.partId] : null;
  if (hullPart) {
    shipCapacity += hullPart.baseShipCap || 0;
    tritiumCapacity += hullPart.baseTritium || 0;
    cost += hullPart.baseCost || 0;
  }

  for (const [slotId, partRef] of Object.entries(design.parts)) {
    if (!partRef.partId || slotId === 'hull') continue;
    const part = CARRIER_PART_MAP[partRef.partId];
    if (!part) continue;
    if (part.shipBonus) shipCapacity += part.shipBonus;
    if (part.tritiumBonus) tritiumCapacity += part.tritiumBonus;
    cost += part.cost || 0;
  }

  return { shipCapacity, tritiumCapacity, cost: Math.max(0, cost) };
}