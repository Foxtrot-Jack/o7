// ============================================================
// SHIP OUTFITTING — Module database, ship slot layouts, engineering
// References Coriolis-style outfitting from Elite Dangerous
// ============================================================

const CLASS_MULT = { E: 0.8, D: 0.85, C: 0.9, B: 1.0, A: 1.25 };
const CLASS_ORDER = ['E', 'D', 'C', 'B', 'A'];

const CARGO_CAP = { 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64, 7: 128, 8: 256 };
const CARGO_CAP_EXP = { 1: 3, 2: 6, 3: 10, 4: 20, 5: 38, 6: 72, 7: 144, 8: 288 };

// ---- Module generation ----
function generateModules() {
  const m = {};

  // Core internals
  const coreDefs = [
    { abbr: 'pp', name: 'Power Plant', type: 'power_plant', sizes: [2,3,4,5,6,7,8], statKey: 'power', statLabel: 'Power', statBase: 8 },
    { abbr: 'thr', name: 'Thrusters', type: 'thrusters', sizes: [2,3,4,5,6,7,8], statKey: 'thrust', statLabel: 'Thrust', statBase: 10 },
    { abbr: 'fsd', name: 'Frame Shift Drive', type: 'fsd', sizes: [2,3,4,5,6,7,8], statKey: 'range', statLabel: 'Optimal Mass', statBase: 3 },
    { abbr: 'ls', name: 'Life Support', type: 'life_support', sizes: [1,2,3,4,5,6,7,8], statKey: 'oxygen', statLabel: 'Oxygen', statBase: 5 },
    { abbr: 'sen', name: 'Sensors', type: 'sensors', sizes: [1,2,3,4,5,6,7,8], statKey: 'scanRange', statLabel: 'Scan Range', statBase: 2 },
    { abbr: 'pd', name: 'Power Distributor', type: 'power_distributor', sizes: [1,2,3,4,5,6,7,8], statKey: 'distro', statLabel: 'Capacity', statBase: 5 },
  ];
  for (const d of coreDefs) {
    for (const size of d.sizes) {
      for (const cls of CLASS_ORDER) {
        const id = `${d.abbr}_${size}${cls.toLowerCase()}`;
        m[id] = {
          id, name: `${d.name} ${size}${cls}`,
          category: 'core', type: d.type, size, class: cls,
          mass: Math.round(size * 2 * (cls === 'D' ? 0.3 : cls === 'A' ? 1.5 : 1) * 10) / 10,
          [d.statKey]: Math.round(size * d.statBase * CLASS_MULT[cls] * 10) / 10,
          statLabel: d.statLabel,
        };
      }
    }
  }

  // Cargo racks (class E only) + expanded mk2 variants
  for (const size of [1,2,3,4,5,6,7,8]) {
    m[`cr_${size}e`] = { id: `cr_${size}e`, name: `Cargo Rack ${size}E`, category: 'optional', type: 'cargo_rack', size, class: 'E', mass: Math.round(size * 0.5 * 10) / 10, cargo: CARGO_CAP[size], statLabel: 'Cargo' };
    m[`cr_${size}e_mk2`] = { id: `cr_${size}e_mk2`, name: `Cargo Rack ${size}E (Expanded)`, category: 'optional', type: 'cargo_rack', size, class: 'E', mass: Math.round(size * 0.5 * 10) / 10, cargo: CARGO_CAP_EXP[size], premium: true, statLabel: 'Cargo' };
  }

  // Shield generators
  for (const size of [1,2,3,4,5,6,7,8]) {
    for (const cls of CLASS_ORDER) {
      const id = `sg_${size}${cls.toLowerCase()}`;
      m[id] = { id, name: `Shield Generator ${size}${cls}`, category: 'optional', type: 'shield_generator', size, class: cls, mass: Math.round(size * 2 * (cls === 'D' ? 0.5 : 1) * 10) / 10, shield: Math.round(size * 50 * CLASS_MULT[cls]), statLabel: 'Shield MJ' };
    }
  }

  // Hull reinforcement
  for (const size of [1,2,3,4,5]) {
    m[`hrp_${size}d`] = { id: `hrp_${size}d`, name: `Hull Reinforcement ${size}D`, category: 'optional', type: 'hull_reinforcement', size, class: 'D', mass: size * 2, hull: size * 150, statLabel: 'Hull' };
  }

  // Module reinforcement
  for (const size of [1,2,3]) {
    m[`mrp_${size}e`] = { id: `mrp_${size}e`, name: `Module Reinforcement ${size}E`, category: 'optional', type: 'module_reinforcement', size, class: 'E', mass: size * 1.5, moduleProtection: size * 30, statLabel: 'Protection' };
  }

  // Fuel scoop
  for (const size of [1,2,3,4,5,6,7,8]) {
    m[`fsc_${size}a`] = { id: `fsc_${size}a`, name: `Fuel Scoop ${size}A`, category: 'optional', type: 'fuel_scoop', size, class: 'A', mass: size, scoopRate: size * 5, statLabel: 'Scoop/s' };
  }

  // Fuel tank (additional)
  for (const size of [1,2,3,4,5,6,7,8]) {
    m[`ft_${size}c`] = { id: `ft_${size}c`, name: `Fuel Tank ${size}C`, category: 'optional', type: 'fuel_tank', size, class: 'C', mass: size, fuel: CARGO_CAP[size], statLabel: 'Fuel T' };
  }

  // Collector limpet
  for (const size of [1,3,5,7]) {
    m[`cl_${size}d`] = { id: `cl_${size}d`, name: `Collector Limpet ${size}D`, category: 'optional', type: 'collector_limpet', size, class: 'D', mass: size, limpets: size, statLabel: 'Limpets' };
  }

  // AFM unit
  for (const size of [1,3,5]) {
    m[`afm_${size}d`] = { id: `afm_${size}d`, name: `AFM Unit ${size}D`, category: 'optional', type: 'afm_unit', size, class: 'D', mass: size * 2, repair: size * 10, statLabel: 'Repair' };
  }

  // SRV hangar
  for (const size of [2,3,4]) {
    m[`srv_${size}g`] = { id: `srv_${size}g`, name: `Planetary Vehicle Hangar ${size}G`, category: 'optional', type: 'srv_hangar', size, class: 'G', mass: size * 4, srvs: Math.floor(size / 2), statLabel: 'SRVs' };
  }

  // Fighter hangar
  for (const size of [5,6,7]) {
    m[`fh_${size}d`] = { id: `fh_${size}d`, name: `Fighter Hangar ${size}D`, category: 'optional', type: 'fighter_hangar', size, class: 'D', mass: size * 10, fighters: 2, statLabel: 'Fighters' };
  }

  // Refinery
  for (const size of [1,2,3,4]) {
    m[`ref_${size}d`] = { id: `ref_${size}d`, name: `Refinery ${size}D`, category: 'optional', type: 'refinery', size, class: 'D', mass: size * 3, bins: size * 2, statLabel: 'Bins' };
  }

  // Detailed surface scanner
  m['dss_1e'] = { id: 'dss_1e', name: 'Detailed Surface Scanner 1E', category: 'optional', type: 'surface_scanner', size: 1, class: 'E', mass: 2, statLabel: 'Scan Bonus' };

  // ---- Hardpoint weapons ----
  const weaponDefs = [
    { abbr: 'pl', name: 'Pulse Laser', sizes: [1,2,3,4], dmg: 12 },
    { abbr: 'bl', name: 'Burst Laser', sizes: [1,2,3], dmg: 10 },
    { abbr: 'bml', name: 'Beam Laser', sizes: [1,2,3], dmg: 8 },
    { abbr: 'mc', name: 'Multi-Cannon', sizes: [1,2,3], dmg: 15 },
    { abbr: 'can', name: 'Cannon', sizes: [2,3,4], dmg: 25 },
    { abbr: 'rg', name: 'Railgun', sizes: [1,2], dmg: 30 },
    { abbr: 'mr', name: 'Missile Rack', sizes: [1,2], dmg: 20 },
    { abbr: 'tor', name: 'Torpedo Pylon', sizes: [1], dmg: 80 },
    { abbr: 'pa', name: 'Plasma Accelerator', sizes: [2,3,4], dmg: 50 },
  ];
  for (const d of weaponDefs) {
    for (const size of d.sizes) {
      const id = `${d.abbr}_${size}e`;
      if (m[id]) continue;
      m[id] = { id, name: `${d.name} ${size}E`, category: 'hardpoint', type: d.abbr, size, class: 'E', mass: size * 2, damage: d.dmg * size, statLabel: 'Damage' };
    }
  }

  // ---- Utility mounts ----
  for (const cls of ['A','B','C','D','E']) {
    const id = `sb_0${cls.toLowerCase()}`;
    m[id] = { id, name: `Shield Booster 0${cls}`, category: 'utility', type: 'shield_booster', size: 0, class: cls, mass: 1.3, shieldBoost: Math.round((CLASS_MULT[cls] - 0.7) * 100), statLabel: 'Shield %' };
  }
  m['ch_0e'] = { id: 'ch_0e', name: 'Chaff Launcher 0E', category: 'utility', type: 'chaff', size: 0, class: 'E', mass: 1.3, statLabel: 'Utility' };
  m['hs_0e'] = { id: 'hs_0e', name: 'Heat Sink Launcher 0E', category: 'utility', type: 'heat_sink', size: 0, class: 'E', mass: 1.3, statLabel: 'Utility' };
  m['pdu_0e'] = { id: 'pdu_0e', name: 'Point Defence 0E', category: 'utility', type: 'point_defence', size: 0, class: 'E', mass: 1.3, statLabel: 'Utility' };
  m['kws_0e'] = { id: 'kws_0e', name: 'Kill Warrant Scanner 0E', category: 'utility', type: 'kws', size: 0, class: 'E', mass: 1.3, statLabel: 'Bounty %' };

  return m;
}

export const MODULES = generateModules();

// ---- Ship slot layouts (Coriolis-style) ----
// core: { pp, thr, fsd, ls, sen, pd } — maxSize per slot
// optional: array of maxSize per slot
// hardpoints: array of sizes (1=small, 2=medium, 3=large, 4=huge)
// utility: count
export const SHIP_SLOTS = {
  sidewinder:         { core: { pp: 2, thr: 2, fsd: 2, ls: 1, sen: 1, pd: 1 }, optional: [2, 2, 1], hardpoints: [1, 1], utility: 2 },
  eagle:              { core: { pp: 2, thr: 2, fsd: 2, ls: 1, sen: 1, pd: 1 }, optional: [2, 2, 1], hardpoints: [1, 1, 1], utility: 2 },
  hauler:             { core: { pp: 2, thr: 2, fsd: 2, ls: 1, sen: 1, pd: 1 }, optional: [3, 2, 2, 1], hardpoints: [1], utility: 2 },
  adder:              { core: { pp: 3, thr: 3, fsd: 3, ls: 1, sen: 1, pd: 2 }, optional: [3, 2, 2, 1], hardpoints: [1, 1], utility: 2 },
  viper:              { core: { pp: 4, thr: 4, fsd: 4, ls: 2, sen: 2, pd: 3 }, optional: [3, 3, 2], hardpoints: [1, 1, 2, 2], utility: 4 },
  cobra:              { core: { pp: 4, thr: 4, fsd: 4, ls: 2, sen: 2, pd: 3 }, optional: [4, 4, 2, 2, 1], hardpoints: [1, 1, 2, 2], utility: 4 },
  cobramk4:           { core: { pp: 4, thr: 4, fsd: 4, ls: 2, sen: 2, pd: 3 }, optional: [4, 3, 3, 2, 1], hardpoints: [1, 1, 2, 2], utility: 4 },
  cobramk5:           { core: { pp: 4, thr: 4, fsd: 4, ls: 2, sen: 2, pd: 3 }, optional: [4, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2], utility: 4 },
  dolphin:            { core: { pp: 4, thr: 4, fsd: 4, ls: 2, sen: 2, pd: 3 }, optional: [4, 3, 2, 2, 1], hardpoints: [1, 1], utility: 3 },
  type6:              { core: { pp: 4, thr: 4, fsd: 4, ls: 3, sen: 3, pd: 3 }, optional: [4, 4, 4, 3, 2], hardpoints: [1, 1], utility: 3 },
  diamondback:        { core: { pp: 4, thr: 4, fsd: 4, ls: 3, sen: 3, pd: 3 }, optional: [5, 3, 3, 1], hardpoints: [1, 1, 2, 2], utility: 4 },
  imperial_courier:   { core: { pp: 4, thr: 4, fsd: 4, ls: 3, sen: 3, pd: 3 }, optional: [3, 3, 3, 2, 1], hardpoints: [1, 1, 2], utility: 4 },
  asp:                { core: { pp: 5, thr: 5, fsd: 5, ls: 3, sen: 3, pd: 4 }, optional: [5, 5, 3, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3, 3], utility: 4 },
  type7:              { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [6, 5, 5, 3, 2], hardpoints: [1, 1], utility: 4 },
  federal_dropship:   { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 4, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3], utility: 4 },
  vulture:            { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 4, 3, 2], hardpoints: [2, 2, 3, 3], utility: 4 },
  mandalay:           { core: { pp: 5, thr: 5, fsd: 5, ls: 3, sen: 3, pd: 4 }, optional: [5, 5, 3, 3, 2], hardpoints: [1, 1, 2, 2], utility: 4 },
  krait_phantom:      { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 5, 3, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3], utility: 4 },
  krait_mk2:          { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 5, 3, 3, 2, 1, 1], hardpoints: [1, 1, 2, 2, 3], utility: 4 },
  alliance_chieftain: { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 4, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3, 3], utility: 4 },
  alliance_crusader:  { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 4, 4, 3, 2, 1, 1], hardpoints: [1, 1, 2, 2, 3, 3], utility: 4 },
  alliance_challenger:{ core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 5, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3, 3], utility: 4 },
  type8:              { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [6, 5, 5, 3, 2, 2], hardpoints: [1, 1, 2], utility: 4 },
  federal_assault:    { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 4, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3], utility: 4 },
  mamba:              { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3], utility: 4 },
  imperial_clipper:   { core: { pp: 6, thr: 6, fsd: 5, ls: 4, sen: 4, pd: 5 }, optional: [5, 5, 4, 4, 3, 2], hardpoints: [2, 2, 3, 3], utility: 4 },
  python:             { core: { pp: 6, thr: 6, fsd: 5, ls: 4, sen: 4, pd: 5 }, optional: [5, 5, 4, 3, 3, 2, 1], hardpoints: [2, 2, 3, 3], utility: 4 },
  orca:               { core: { pp: 6, thr: 6, fsd: 5, ls: 4, sen: 4, pd: 5 }, optional: [5, 5, 4, 3, 2, 2], hardpoints: [1, 1, 2, 2], utility: 4 },
  python_mk2:         { core: { pp: 6, thr: 6, fsd: 5, ls: 4, sen: 4, pd: 5 }, optional: [5, 4, 4, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3, 3], utility: 4 },
  type9:              { core: { pp: 7, thr: 7, fsd: 6, ls: 4, sen: 4, pd: 6 }, optional: [7, 7, 6, 6, 5, 4, 3], hardpoints: [1, 1, 2, 2, 3, 3], utility: 4 },
  beluga:             { core: { pp: 6, thr: 6, fsd: 5, ls: 5, sen: 5, pd: 5 }, optional: [6, 5, 5, 4, 3, 3, 2], hardpoints: [1, 1, 2, 2], utility: 4 },
  anaconda:           { core: { pp: 6, thr: 6, fsd: 6, ls: 4, sen: 4, pd: 5 }, optional: [6, 6, 5, 5, 3, 3, 2, 2, 4], hardpoints: [4, 4, 3, 3, 2, 2], utility: 8 },
  federal_corvette:   { core: { pp: 7, thr: 7, fsd: 6, ls: 5, sen: 5, pd: 6 }, optional: [7, 6, 6, 5, 5, 4, 3, 2], hardpoints: [4, 4, 3, 3, 3, 2, 2], utility: 8 },
  imperial_cutter:    { core: { pp: 7, thr: 7, fsd: 6, ls: 5, sen: 5, pd: 6 }, optional: [7, 6, 6, 5, 5, 4, 3, 2], hardpoints: [4, 4, 3, 3, 2, 2], utility: 8 },
  type10:             { core: { pp: 7, thr: 7, fsd: 6, ls: 5, sen: 5, pd: 6 }, optional: [7, 7, 6, 6, 5, 5, 4, 3], hardpoints: [1, 1, 2, 2, 3, 3, 3], utility: 8 },
};

// ---- Engineering blueprints ----
export const ENGINEERING_BLUEPRINTS = {
  fsd: [
    { id: 'long_range', name: 'Long Range', levels: 5, stat: 'range', perLevel: 0.08, desc: '+8% FSD range per grade' },
    { id: 'rapid_charge', name: 'Rapid Charge', levels: 5, stat: 'chargeRate', perLevel: 0.1, desc: '+10% charge speed per grade' },
  ],
  thrusters: [
    { id: 'dirty_drive', name: 'Dirty Drive', levels: 5, stat: 'thrust', perLevel: 0.1, desc: '+10% thrust per grade' },
    { id: 'clean_drive', name: 'Clean Drive', levels: 5, stat: 'heatEfficiency', perLevel: 0.08, desc: '-8% heat per grade' },
  ],
  power_plant: [
    { id: 'overcharged', name: 'Overcharged', levels: 5, stat: 'power', perLevel: 0.08, desc: '+8% power per grade' },
    { id: 'low_emission', name: 'Low Emission', levels: 5, stat: 'heatEfficiency', perLevel: 0.1, desc: '-10% heat per grade' },
  ],
  shield_generator: [
    { id: 'reinforced', name: 'Reinforced', levels: 5, stat: 'shield', perLevel: 0.1, desc: '+10% shield per grade' },
    { id: 'thermal_resist', name: 'Thermal Resistance', levels: 5, stat: 'thermalResist', perLevel: 0.08, desc: '+8% thermal resist per grade' },
  ],
  pp: [{ id: 'overcharged', name: 'Overcharged', levels: 5, stat: 'power', perLevel: 0.08, desc: '+8% power per grade' }],
};

export const HARDPOINT_ENGINEERING = {
  pl: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
  bl: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
  bml: [{ id: 'long_range', name: 'Long Range', levels: 5, stat: 'range', perLevel: 0.1, desc: '+10% range per grade' }],
  mc: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
  can: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
  rg: [{ id: 'long_range', name: 'Long Range', levels: 5, stat: 'range', perLevel: 0.1, desc: '+10% range per grade' }],
  mr: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
  pa: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
  tor: [{ id: 'overcharge', name: 'Overcharge', levels: 5, stat: 'damage', perLevel: 0.08, desc: '+8% damage per grade' }],
};

// ---- Module price calculation ----
export function getModulePrice(moduleId) {
  const mod = MODULES[moduleId];
  if (!mod) return 0;
  const classPriceMult = { E: 1, D: 3, C: 8, B: 20, A: 50 };
  let base = mod.size * 1000 * (classPriceMult[mod.class] || 1);
  if (mod.premium) base *= 1.5;
  return Math.round(base);
}

// ---- Default loadout per ship ----
export function getDefaultModules(shipTypeId) {
  const slots = SHIP_SLOTS[shipTypeId];
  if (!slots) return {};
  const modules = {};
  // Core: stock class E
  for (const [key, maxSize] of Object.entries(slots.core)) {
    modules[`core_${key}`] = `${key}_${maxSize}e`;
  }
  // Optional: first slot gets a cargo rack, rest empty
  if (slots.optional.length > 0) {
    modules['opt_0'] = `cr_${slots.optional[0]}e`;
  }
  // Hardpoints: small weapons
  slots.hardpoints.forEach((size, i) => {
    if (size === 1) modules[`hp_${i}`] = 'pl_1e';
    else if (size === 2) modules[`hp_${i}`] = 'pl_2e';
    else modules[`hp_${i}`] = 'can_3e';
  });
  return modules;
}

// ---- Compute ship stats from equipped modules ----
export function computeShipStats(shipTypeId, modules) {
  const slots = SHIP_SLOTS[shipTypeId];
  if (!slots) return { cargoCapacity: 4, jumpRange: 8, shield: 0, power: 0, powerDraw: 0, mass: 10, totalDamage: 0 };

  let cargoCapacity = 0;
  let jumpRangeBase = 8;
  let shield = 0;
  let power = 0;
  let powerDraw = 0;
  let mass = 10; // hull mass
  let totalDamage = 0;
  let fuelCapacity = 8;

  // Core modules
  for (const [key, maxSize] of Object.entries(slots.core)) {
    const modId = modules[`core_${key}`];
    const mod = MODULES[modId];
    if (!mod) continue;
    mass += mod.mass || 0;
    if (mod.type === 'fsd') {
      jumpRangeBase = (mod.range || 3) * 3;
    }
    if (mod.type === 'power_plant') power = mod.power || 0;
    if (mod.type === 'thrusters') mass += 0; // already counted
  }

  // Optional modules
  slots.optional.forEach((maxSize, i) => {
    const modId = modules[`opt_${i}`];
    const mod = MODULES[modId];
    if (!mod) return;
    mass += mod.mass || 0;
    if (mod.type === 'cargo_rack') cargoCapacity += mod.cargo || 0;
    if (mod.type === 'shield_generator') shield += mod.shield || 0;
    if (mod.type === 'hull_reinforcement') mass += mod.hull ? 0 : 0;
    if (mod.type === 'fuel_tank') fuelCapacity += mod.fuel || 0;
    powerDraw += (mod.mass || 0) * 0.2;
  });

  // Hardpoints
  slots.hardpoints.forEach((size, i) => {
    const modId = modules[`hp_${i}`];
    const mod = MODULES[modId];
    if (!mod) return;
    mass += mod.mass || 0;
    totalDamage += mod.damage || 0;
    powerDraw += (mod.damage || 0) * 0.1;
  });

  // Utility
  for (let i = 0; i < slots.utility; i++) {
    const modId = modules[`util_${i}`];
    const mod = MODULES[modId];
    if (!mod) continue;
    mass += mod.mass || 0;
    if (mod.type === 'shield_booster') shield += shield * (mod.shieldBoost || 0) / 100;
    powerDraw += 0.5;
  }

  // Apply engineering modifiers
  const eng = modules.__engineering || {};
  for (const [slotKey, engData] of Object.entries(eng)) {
    const modId = modules[slotKey];
    const mod = MODULES[modId];
    if (!mod || !engData) continue;
    const blueprint = (ENGINEERING_BLUEPRINTS[mod.type] || HARDPOINT_ENGINEERING[mod.type] || [])
      .find(b => b.id === engData.blueprint);
    if (!blueprint) continue;
    const bonus = engData.level * blueprint.perLevel;
    if (blueprint.stat === 'range' && mod.type === 'fsd') jumpRangeBase *= (1 + bonus);
    if (blueprint.stat === 'power') power *= (1 + bonus);
    if (blueprint.stat === 'shield') shield *= (1 + bonus);
    if (blueprint.stat === 'damage') totalDamage *= (1 + bonus);
    if (blueprint.stat === 'thrust') {} // visual only for now
  }

  // Jump range: mass affects it
  const jumpRange = Math.max(2, jumpRangeBase * (10 / Math.max(mass, 5)));

  return {
    cargoCapacity,
    jumpRange: Math.round(jumpRange * 10) / 10,
    shield: Math.round(shield),
    power: Math.round(power * 10) / 10,
    powerDraw: Math.round(powerDraw * 10) / 10,
    mass: Math.round(mass * 10) / 10,
    totalDamage: Math.round(totalDamage),
    fuelCapacity,
  };
}

// ---- Get available modules for a slot ----
export function getModulesForSlot(slotType, maxSize, shipTypeId) {
  const results = [];
  for (const mod of Object.values(MODULES)) {
    if (mod.size > maxSize) continue;
    if (slotType === 'core') {
      // Match by core type key
      results.push(mod);
    } else if (slotType === 'optional') {
      if (mod.category === 'optional') results.push(mod);
    } else if (slotType === 'hardpoint') {
      if (mod.category === 'hardpoint' && mod.size <= maxSize) results.push(mod);
    } else if (slotType === 'utility') {
      if (mod.category === 'utility') results.push(mod);
    }
  }
  return results.sort((a, b) => a.size - b.size || CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class));
}

export const HARDPOINT_SIZES = { 1: 'Small', 2: 'Medium', 3: 'Large', 4: 'Huge' };
export const SLOT_LABELS = { pp: 'Power Plant', thr: 'Thrusters', fsd: 'Frame Shift Drive', ls: 'Life Support', sen: 'Sensors', pd: 'Power Distributor' };