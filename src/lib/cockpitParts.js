// Cockpit accessory parts and slot configurations
// Decorations are independent per ship, per carrier, and per station
// Bigger ships = bigger windows, more decorative spots

export const COCKPIT_PART_CATEGORIES = {
  dashboard: { name: 'Dashboard Items' },
  console: { name: 'Console Modules' },
  hanging: { name: 'Hanging Items' },
  personal: { name: 'Personal Items' },
  decor: { name: 'Decor' },
};

export const COCKPIT_PARTS = {
  dashboard: [
    { id: 'cd_bobble', name: 'Bobblehead', shape: 'sphere', cost: 500, materials: { iron: 2, carbon: 3 } },
    { id: 'cd_hula', name: 'Hula Girl', shape: 'cone', cost: 800, materials: { carbon: 3, silicon: 1 } },
    { id: 'cd_compass', name: 'Compass', shape: 'cylinder', cost: 300, materials: { iron: 2, nickel: 1 } },
    { id: 'cd_photo', name: 'Photo Frame', shape: 'box', cost: 200, materials: { carbon: 1, iron: 1 } },
    { id: 'cd_dice', name: 'Lucky Dice', shape: 'octahedron', cost: 400, materials: { carbon: 2 } },
    { id: 'cd_thermo', name: 'Thermometer', shape: 'cylinder', cost: 350, materials: { iron: 1, silicon: 1 } },
    { id: 'cd_model', name: 'Ship Model', shape: 'wedge', cost: 1500, materials: { iron: 2, tin: 1 } },
  ],
  console: [
    { id: 'cs_screen', name: 'Extra Screen', shape: 'box', cost: 2000, materials: { iron: 2, silicon: 2 } },
    { id: 'cs_navcomp', name: 'Nav Computer', shape: 'box', cost: 5000, materials: { iron: 3, silicon: 3 } },
    { id: 'cs_coffee', name: 'Coffee Maker', shape: 'cylinder', cost: 1500, materials: { iron: 2, carbon: 2 } },
    { id: 'cs_holo', name: 'Holo Display', shape: 'sphere', cost: 8000, materials: { silicon: 3, iron: 2 } },
    { id: 'cs_grid', name: 'Power Grid', shape: 'box', cost: 3000, materials: { chromium: 3, iron: 2 } },
  ],
  hanging: [
    { id: 'hg_dice', name: 'Fuzzy Dice', shape: 'octahedron', cost: 600, materials: { carbon: 2 } },
    { id: 'hg_fresh', name: 'Air Freshener', shape: 'cone', cost: 300, materials: { carbon: 1, water: 1 } },
    { id: 'hg_pendant', name: 'Pendant', shape: 'torus', cost: 1000, materials: { platinum: 1 } },
    { id: 'hg_lights', name: 'String Lights', shape: 'cylinder', cost: 1200, materials: { silicon: 2, carbon: 1 } },
    { id: 'hg_crystal', name: 'Crystal', shape: 'tetrahedron', cost: 2000, materials: { low_temp_diamond: 1 } },
  ],
  personal: [
    { id: 'ps_trophy', name: 'Trophy Case', shape: 'box', cost: 3000, materials: { iron: 3, silicon: 2 } },
    { id: 'ps_plant', name: 'Potted Plant', shape: 'cone', cost: 800, materials: { carbon: 2, water: 1 } },
    { id: 'ps_mug', name: 'Coffee Mug', shape: 'cylinder', cost: 150, materials: { carbon: 1 } },
    { id: 'ps_datapad', name: 'Data Pad', shape: 'box', cost: 600, materials: { silicon: 1, carbon: 1 } },
    { id: 'ps_helmet', name: 'Helmet', shape: 'sphere', cost: 2500, materials: { iron: 2, silicon: 2 } },
  ],
  decor: [
    { id: 'dc_rug', name: 'Floor Rug', shape: 'box', cost: 500, materials: { carbon: 3 } },
    { id: 'dc_art', name: 'Wall Art', shape: 'box', cost: 1200, materials: { carbon: 2, silicon: 1 } },
    { id: 'dc_stickers', name: 'Sticker Pack', shape: 'box', cost: 200, materials: { carbon: 1 } },
    { id: 'dc_flag', name: 'Flag', shape: 'box', cost: 700, materials: { carbon: 2 } },
    { id: 'dc_globe', name: 'Mini Globe', shape: 'sphere', cost: 900, materials: { iron: 1, silicon: 1 } },
  ],
};

export const COCKPIT_PART_MAP = {};
for (const [cat, parts] of Object.entries(COCKPIT_PARTS)) {
  for (const p of parts) {
    COCKPIT_PART_MAP[p.id] = { ...p, category: cat };
  }
}

// Cockpit layouts per ship class, carrier, and station
export const COCKPIT_CONFIGS = {
  1: {
    name: 'Compact Cockpit',
    windowWidth: 3, windowHeight: 1.8, depth: 1.8,
    slots: [
      { id: 'ck_dash_l', label: 'Dash Left', category: 'dashboard', pos: [-0.7, -0.55, -1.1] },
      { id: 'ck_dash_r', label: 'Dash Right', category: 'dashboard', pos: [0.7, -0.55, -1.1] },
      { id: 'ck_hang', label: 'Ceiling Mount', category: 'hanging', pos: [0, 0.7, -0.6] },
    ],
  },
  2: {
    name: 'Standard Cockpit',
    windowWidth: 4.5, windowHeight: 2.2, depth: 2.0,
    slots: [
      { id: 'ck_dash_l', label: 'Dash Left', category: 'dashboard', pos: [-1.1, -0.6, -1.2] },
      { id: 'ck_dash_c', label: 'Dash Center', category: 'dashboard', pos: [0, -0.6, -1.2] },
      { id: 'ck_dash_r', label: 'Dash Right', category: 'dashboard', pos: [1.1, -0.6, -1.2] },
      { id: 'ck_hang_l', label: 'Ceiling Left', category: 'hanging', pos: [-0.7, 0.8, -0.6] },
      { id: 'ck_hang_r', label: 'Ceiling Right', category: 'hanging', pos: [0.7, 0.8, -0.6] },
    ],
  },
  3: {
    name: 'Spacious Cockpit',
    windowWidth: 6, windowHeight: 2.8, depth: 2.2,
    slots: [
      { id: 'ck_dash_l', label: 'Dash Left', category: 'dashboard', pos: [-1.5, -0.7, -1.3] },
      { id: 'ck_dash_cl', label: 'Dash Center-L', category: 'dashboard', pos: [-0.5, -0.7, -1.3] },
      { id: 'ck_dash_cr', label: 'Dash Center-R', category: 'dashboard', pos: [0.5, -0.7, -1.3] },
      { id: 'ck_dash_r', label: 'Dash Right', category: 'dashboard', pos: [1.5, -0.7, -1.3] },
      { id: 'ck_con_l', label: 'Console Left', category: 'console', pos: [-1.3, -0.4, -0.5] },
      { id: 'ck_con_r', label: 'Console Right', category: 'console', pos: [1.3, -0.4, -0.5] },
      { id: 'ck_hang', label: 'Ceiling Mount', category: 'hanging', pos: [0, 1.0, -0.7] },
    ],
  },
  4: {
    name: 'Command Bridge',
    windowWidth: 8, windowHeight: 3.5, depth: 2.5,
    slots: [
      { id: 'ck_dash_l1', label: 'Dash Far Left', category: 'dashboard', pos: [-2.0, -0.8, -1.4] },
      { id: 'ck_dash_l2', label: 'Dash Left', category: 'dashboard', pos: [-1.0, -0.8, -1.4] },
      { id: 'ck_dash_c', label: 'Dash Center', category: 'dashboard', pos: [0, -0.8, -1.4] },
      { id: 'ck_dash_r2', label: 'Dash Right', category: 'dashboard', pos: [1.0, -0.8, -1.4] },
      { id: 'ck_dash_r1', label: 'Dash Far Right', category: 'dashboard', pos: [2.0, -0.8, -1.4] },
      { id: 'ck_con_l', label: 'Console Left', category: 'console', pos: [-1.8, -0.5, -0.6] },
      { id: 'ck_con_r', label: 'Console Right', category: 'console', pos: [1.8, -0.5, -0.6] },
      { id: 'ck_hang_l', label: 'Ceiling Left', category: 'hanging', pos: [-1.2, 1.2, -0.8] },
      { id: 'ck_hang_c', label: 'Ceiling Center', category: 'hanging', pos: [0, 1.2, -0.8] },
      { id: 'ck_hang_r', label: 'Ceiling Right', category: 'hanging', pos: [1.2, 1.2, -0.8] },
    ],
  },
  carrier: {
    name: 'Carrier Bridge',
    windowWidth: 12, windowHeight: 5, depth: 3.0,
    slots: [
      { id: 'ck_dash_l1', label: 'Dash Far Left', category: 'dashboard', pos: [-3.0, -1.0, -1.5] },
      { id: 'ck_dash_l2', label: 'Dash Left', category: 'dashboard', pos: [-1.5, -1.0, -1.5] },
      { id: 'ck_dash_c', label: 'Dash Center', category: 'dashboard', pos: [0, -1.0, -1.5] },
      { id: 'ck_dash_r2', label: 'Dash Right', category: 'dashboard', pos: [1.5, -1.0, -1.5] },
      { id: 'ck_dash_r1', label: 'Dash Far Right', category: 'dashboard', pos: [3.0, -1.0, -1.5] },
      { id: 'ck_con_l1', label: 'Console Far Left', category: 'console', pos: [-2.5, -0.6, -0.7] },
      { id: 'ck_con_l2', label: 'Console Left', category: 'console', pos: [-1.0, -0.6, -0.7] },
      { id: 'ck_con_r2', label: 'Console Right', category: 'console', pos: [1.0, -0.6, -0.7] },
      { id: 'ck_con_r1', label: 'Console Far Right', category: 'console', pos: [2.5, -0.6, -0.7] },
      { id: 'ck_hang_l', label: 'Ceiling Left', category: 'hanging', pos: [-2.0, 1.8, -0.9] },
      { id: 'ck_hang_c', label: 'Ceiling Center', category: 'hanging', pos: [0, 1.8, -0.9] },
      { id: 'ck_hang_r', label: 'Ceiling Right', category: 'hanging', pos: [2.0, 1.8, -0.9] },
      { id: 'ck_ps_l', label: 'Personal Left', category: 'personal', pos: [-2.0, -0.3, 0.3] },
      { id: 'ck_ps_r', label: 'Personal Right', category: 'personal', pos: [2.0, -0.3, 0.3] },
      { id: 'ck_dec', label: 'Floor Decor', category: 'decor', pos: [0, -1.2, 0.5] },
    ],
  },
  station: {
    name: 'Station Office',
    windowWidth: 7, windowHeight: 3, depth: 2.5,
    slots: [
      { id: 'st_dash_l', label: 'Desk Left', category: 'dashboard', pos: [-1.5, -0.6, -1.2] },
      { id: 'st_dash_c', label: 'Desk Center', category: 'dashboard', pos: [0, -0.6, -1.2] },
      { id: 'st_dash_r', label: 'Desk Right', category: 'dashboard', pos: [1.5, -0.6, -1.2] },
      { id: 'st_con_l', label: 'Console Left', category: 'console', pos: [-1.3, -0.4, -0.5] },
      { id: 'st_con_r', label: 'Console Right', category: 'console', pos: [1.3, -0.4, -0.5] },
      { id: 'st_hang_l', label: 'Wall Left', category: 'hanging', pos: [-1.8, 0.8, -0.5] },
      { id: 'st_hang_c', label: 'Wall Center', category: 'hanging', pos: [0, 1.0, -0.5] },
      { id: 'st_hang_r', label: 'Wall Right', category: 'hanging', pos: [1.8, 0.8, -0.5] },
      { id: 'st_ps_l', label: 'Personal Left', category: 'personal', pos: [-1.5, -0.3, 0.3] },
      { id: 'st_ps_r', label: 'Personal Right', category: 'personal', pos: [1.5, -0.3, 0.3] },
      { id: 'st_dec_l', label: 'Floor Left', category: 'decor', pos: [-1.0, -1.0, 0.5] },
      { id: 'st_dec_r', label: 'Floor Right', category: 'decor', pos: [1.0, -1.0, 0.5] },
    ],
  },
};

export function getCockpitConfig(shipClass) {
  return COCKPIT_CONFIGS[shipClass] || COCKPIT_CONFIGS[1];
}

export function createEmptyCockpit() {
  return { parts: {} };
}

export function getCockpitPartsForSlot(slot) {
  if (!slot) return [];
  return COCKPIT_PARTS[slot.category] || [];
}

export function computeCockpitCost(decoration) {
  let credits = 0;
  const materials = {};
  for (const partRef of Object.values(decoration?.parts || {})) {
    if (!partRef?.partId) continue;
    const part = COCKPIT_PART_MAP[partRef.partId];
    if (!part) continue;
    credits += part.cost || 0;
    for (const [mat, qty] of Object.entries(part.materials || {})) {
      materials[mat] = (materials[mat] || 0) + qty;
    }
  }
  return { credits, materials };
}