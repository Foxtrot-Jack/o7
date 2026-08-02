// ============================================================
// SHIP OUTFITTING — Module database, ship slot layouts, engineering
// References Coriolis-style outfitting from Elite Dangerous
// ============================================================

import { EXPANDED_SHIP_SLOTS } from './shipRosterExpanded';

const CLASS_MULT = { E: 0.7, D: 0.85, C: 1.0, B: 1.2, A: 1.5 };
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

  // Passenger cabins — economy, business, first, luxury
  for (const size of [2,3,4,5,6]) {
    m[`pc_${size}e`] = { id: `pc_${size}e`, name: `Economy Passenger Cabin ${size}E`, category: 'optional', type: 'passenger_cabin', size, class: 'E', mass: size * 1.5, cabinClass: 'economy', passengerCapacity: size * 2, statLabel: 'Berths' };
  }
  for (const size of [3,4,5,6]) {
    m[`pc_${size}d`] = { id: `pc_${size}d`, name: `Business Passenger Cabin ${size}D`, category: 'optional', type: 'passenger_cabin', size, class: 'D', mass: size * 2, cabinClass: 'business', passengerCapacity: size, statLabel: 'Berths' };
  }
  for (const size of [4,5,6]) {
    m[`pc_${size}c`] = { id: `pc_${size}c`, name: `First Class Cabin ${size}C`, category: 'optional', type: 'passenger_cabin', size, class: 'C', mass: size * 2.5, cabinClass: 'first', passengerCapacity: Math.ceil(size / 2), statLabel: 'Berths' };
  }
  for (const size of [5,6]) {
    m[`pc_${size}b`] = { id: `pc_${size}b`, name: `Luxury Cabin ${size}B`, category: 'optional', type: 'passenger_cabin', size, class: 'B', mass: size * 3, cabinClass: 'luxury', passengerCapacity: Math.max(1, Math.floor(size / 3)), statLabel: 'Berths' };
  }

  // Detailed surface scanner
  m['dss_1e'] = { id: 'dss_1e', name: 'Detailed Surface Scanner 1E', category: 'optional', type: 'surface_scanner', size: 1, class: 'E', mass: 2, statLabel: 'Scan Bonus' };

  // ---- Expanded optional modules ----
  // Prospector limpet controllers
  for (const size of [1,3,5,7]) { m[`plc_${size}d`] = { id: `plc_${size}d`, name: `Prospector Limpet ${size}D`, category: 'optional', type: 'prospector_limpet', size, class: 'D', mass: size, limpets: size, statLabel: 'Limpets' }; }
  // Shield cell banks
  for (const size of [1,2,3,4,5,6,7,8]) { for (const cls of ['A','C','D']) { m[`scb_${size}${cls.toLowerCase()}`] = { id: `scb_${size}${cls.toLowerCase()}`, name: `Shield Cell Bank ${size}${cls}`, category: 'optional', type: 'shield_cell_bank', size, class: cls, mass: size * 1.5, shieldRestore: Math.round(size * 30 * CLASS_MULT[cls]), statLabel: 'Shield Restore' }; } }
  // Repair limpet controllers
  for (const size of [1,3,5,7]) { m[`rlc_${size}d`] = { id: `rlc_${size}d`, name: `Repair Limpet ${size}D`, category: 'optional', type: 'repair_limpet', size, class: 'D', mass: size, limpets: size, statLabel: 'Limpets' }; }
  // Recon limpet controllers
  for (const size of [1,3,5]) { m[`reclc_${size}d`] = { id: `reclc_${size}d`, name: `Recon Limpet ${size}D`, category: 'optional', type: 'recon_limpet', size, class: 'D', mass: size, limpets: size, statLabel: 'Limpets' }; }
  // Decontamination limpet
  for (const size of [1,3]) { m[`dlc_${size}e`] = { id: `dlc_${size}e`, name: `Decontamination Limpet ${size}E`, category: 'optional', type: 'decontamination_limpet', size, class: 'E', mass: size, limpets: size, statLabel: 'Limpets' }; }
  // Research limpet controllers
  for (const size of [1,3,5]) { m[`rslc_${size}d`] = { id: `rslc_${size}d`, name: `Research Limpet ${size}D`, category: 'optional', type: 'research_limpet', size, class: 'D', mass: size, limpets: size, statLabel: 'Limpets' }; }
  // Hull reinforcement — expanded classes
  for (const size of [1,2,3,4,5]) { for (const cls of ['C','B']) { m[`hrp_${size}${cls.toLowerCase()}`] = { id: `hrp_${size}${cls.toLowerCase()}`, name: `Hull Reinforcement ${size}${cls}`, category: 'optional', type: 'hull_reinforcement', size, class: cls, mass: size * 2, hull: Math.round(size * 150 * CLASS_MULT[cls]), statLabel: 'Hull' }; } }
  // Module reinforcement — expanded classes
  for (const size of [1,2,3,4]) { for (const cls of ['D','C']) { m[`mrp_${size}${cls.toLowerCase()}`] = { id: `mrp_${size}${cls.toLowerCase()}`, name: `Module Reinforcement ${size}${cls}`, category: 'optional', type: 'module_reinforcement', size, class: cls, mass: size * 1.5, moduleProtection: Math.round(size * 30 * CLASS_MULT[cls]), statLabel: 'Protection' }; } }
  // Guardian FSD booster
  for (const size of [1,2,3,4,5]) { m[`gfsd_${size}h`] = { id: `gfsd_${size}h`, name: `Guardian FSD Booster ${size}H`, category: 'optional', type: 'guardian_fsd_booster', size, class: 'H', mass: size * 1.5, jumpRangeBonus: size * 2, statLabel: 'Jump +LY' }; }
  // Guardian hull reinforcement
  for (const size of [1,2,3,4,5]) { m[`ghr_${size}d`] = { id: `ghr_${size}d`, name: `Guardian Hull Reinforcement ${size}D`, category: 'optional', type: 'guardian_hull_reinforcement', size, class: 'D', mass: size * 2, hull: size * 200, statLabel: 'Hull' }; }
  // Guardian module reinforcement
  for (const size of [1,2,3]) { m[`gmr_${size}d`] = { id: `gmr_${size}d`, name: `Guardian Module Reinforcement ${size}D`, category: 'optional', type: 'guardian_module_reinforcement', size, class: 'D', mass: size * 1.5, moduleProtection: size * 50, statLabel: 'Protection' }; }
  // Guardian shield reinforcement
  for (const size of [1,2,3,4,5]) { m[`gsr_${size}d`] = { id: `gsr_${size}d`, name: `Guardian Shield Reinforcement ${size}D`, category: 'optional', type: 'guardian_shield_reinforcement', size, class: 'D', mass: size * 1.5, shield: size * 80, statLabel: 'Shield MJ' }; }
  // Meta-alloy hull reinforcement (caustic resistant)
  for (const size of [1,2,3,4,5]) { m[`mhr_${size}d`] = { id: `mhr_${size}d`, name: `Meta-Alloy Hull Reinforcement ${size}D`, category: 'optional', type: 'meta_alloy_hull_reinforcement', size, class: 'D', mass: size * 2, hull: size * 180, causticResist: true, statLabel: 'Hull' }; }
  // Shield cell bank — pre-engineered variant
  for (const size of [4,5,6,7,8]) { m[`scb_${size}a_r5`] = { id: `scb_${size}a_r5`, name: `Shield Cell Bank ${size}A (Rapid)`, category: 'optional', type: 'shield_cell_bank', size, class: 'A', mass: size * 1.5, shieldRestore: Math.round(size * 30 * 1.25 * 1.3), statLabel: 'Shield Restore', premium: true, preEngineered: true }; }

  // ---- Hardpoint weapons (all class ratings E-A + expanded types) ----
  const WEAPON_CLASS_MULT = { E: 1.0, D: 1.15, C: 1.3, B: 1.5, A: 1.7 };
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
    { abbr: 'fc', name: 'Frag Cannon', sizes: [1,2,3], dmg: 18 },
    { abbr: 'sm', name: 'Shock Mine Launcher', sizes: [1,2], dmg: 22 },
    { abbr: 'mnl', name: 'Mine Launcher', sizes: [1,2], dmg: 16 },
    { abbr: 'ps', name: 'Plasma Slug', sizes: [2,3], dmg: 40 },
    { abbr: 'gc', name: 'Gauss Cannon', sizes: [1,2], dmg: 28 },
    { abbr: 'sc', name: 'Shard Cannon', sizes: [1,2], dmg: 14 },
    { abbr: 'fm', name: 'Flak Missile', sizes: [2,3], dmg: 24 },
    { abbr: 'rp', name: 'Rocket Pod', sizes: [1,2], dmg: 19 },
    { abbr: 'em', name: 'Enzyme Missile Rack', sizes: [1,2], dmg: 21 },
    { abbr: 'axm', name: 'AX Missile Rack', sizes: [2,3], dmg: 26 },
    { abbr: 'axmc', name: 'AX Multi-Cannon', sizes: [2,3], dmg: 17 },
    { abbr: 'ggc', name: 'Guardian Gauss Cannon', sizes: [1,2], dmg: 32 },
    { abbr: 'gsc', name: 'Guardian Shard Cannon', sizes: [1,2], dmg: 16 },
    { abbr: 'gpc', name: 'Guardian Plasma Charger', sizes: [2,3], dmg: 35 },
    { abbr: 'minl', name: 'Mining Laser', sizes: [1,2,3], dmg: 5 },
    { abbr: 'scl', name: 'Seismic Charge Launcher', sizes: [2,3], dmg: 15 },
    { abbr: 'ab', name: 'Abrasion Blaster', sizes: [1,2], dmg: 8 },
    { abbr: 'ssm', name: 'Sub-Surface Missile', sizes: [1,2], dmg: 12 },
  ];
  for (const d of weaponDefs) {
    for (const size of d.sizes) {
      for (const cls of CLASS_ORDER) {
        const id = `${d.abbr}_${size}${cls.toLowerCase()}`;
        if (m[id]) continue;
        m[id] = { id, name: `${d.name} ${size}${cls}`, category: 'hardpoint', type: d.abbr, size, class: cls, mass: Math.round(size * 2 * (cls === 'A' ? 1.5 : cls === 'D' ? 0.8 : 1) * 10) / 10, damage: Math.round(d.dmg * size * WEAPON_CLASS_MULT[cls]), statLabel: 'Damage' };
      }
    }
  }

  // ---- Utility mounts (expanded with class variants + new types) ----
  for (const cls of ['A','B','C','D','E']) {
    const id = `sb_0${cls.toLowerCase()}`;
    m[id] = { id, name: `Shield Booster 0${cls}`, category: 'utility', type: 'shield_booster', size: 0, class: cls, mass: 1.3, shieldBoost: Math.round((CLASS_MULT[cls] - 0.7) * 100), statLabel: 'Shield %' };
  }
  for (const cls of CLASS_ORDER) {
    const cl = cls.toLowerCase();
    m[`ch_0${cl}`] = { id: `ch_0${cl}`, name: `Chaff Launcher 0${cls}`, category: 'utility', type: 'chaff', size: 0, class: cls, mass: 1.3, statLabel: 'Utility' };
    m[`hs_0${cl}`] = { id: `hs_0${cl}`, name: `Heat Sink Launcher 0${cls}`, category: 'utility', type: 'heat_sink', size: 0, class: cls, mass: 1.3, statLabel: 'Utility' };
    m[`pdu_0${cl}`] = { id: `pdu_0${cl}`, name: `Point Defence 0${cls}`, category: 'utility', type: 'point_defence', size: 0, class: cls, mass: 1.3, statLabel: 'Utility' };
    m[`kws_0${cl}`] = { id: `kws_0${cl}`, name: `Kill Warrant Scanner 0${cls}`, category: 'utility', type: 'kws', size: 0, class: cls, mass: 1.3, bountyBonus: Math.round(CLASS_MULT[cls] * 50), statLabel: 'Bounty %' };
    m[`ecm_0${cl}`] = { id: `ecm_0${cl}`, name: `Electronic Countermeasure 0${cls}`, category: 'utility', type: 'ecm', size: 0, class: cls, mass: 1.3, statLabel: 'ECM' };
    m[`man_0${cl}`] = { id: `man_0${cl}`, name: `Manifest Scanner 0${cls}`, category: 'utility', type: 'manifest_scanner', size: 0, class: cls, mass: 1.3, scanRange: Math.round(CLASS_MULT[cls] * 500), statLabel: 'Scan Range' };
    m[`fsw_0${cl}`] = { id: `fsw_0${cl}`, name: `Frame Shift Wake Scanner 0${cls}`, category: 'utility', type: 'wake_scanner', size: 0, class: cls, mass: 1.3, scanRange: Math.round(CLASS_MULT[cls] * 1000), statLabel: 'Wake Scan' };
    m[`sgs_0${cl}`] = { id: `sgs_0${cl}`, name: `Sinuous Tether 0${cls}`, category: 'utility', type: 'sinuous_tether', size: 0, class: cls, mass: 1.3, statLabel: 'Utility' };
  }

  // ---- Pre-engineered modules (premium, engineering built in) ----
  const preEngCore = [
    { abbr: 'fsd', name: 'FSD Long Range', type: 'fsd', sizes: [3,4,5,6,7], statKey: 'range', statBase: 3, statMult: 1.4, cat: 'core' },
    { abbr: 'thr', name: 'Thrusters Dirty Drive', type: 'thrusters', sizes: [3,4,5,6,7], statKey: 'thrust', statBase: 10, statMult: 1.5, cat: 'core' },
    { abbr: 'pp', name: 'Power Plant Overcharged', type: 'power_plant', sizes: [3,4,5,6,7], statKey: 'power', statBase: 8, statMult: 1.4, cat: 'core' },
    { abbr: 'sg', name: 'Shield Generator Reinforced', type: 'shield_generator', sizes: [3,4,5,6,7], statKey: 'shield', statBase: 50, statMult: 1.5, cat: 'optional' },
  ];
  for (const pe of preEngCore) {
    for (const size of pe.sizes) {
      const id = `pe_${pe.abbr}_${size}a`;
      m[id] = { id, name: `${pe.name} ${size}A`, category: pe.cat, type: pe.type, size, class: 'A', mass: Math.round(size * 2 * 1.5 * 10) / 10, [pe.statKey]: Math.round(size * pe.statBase * 1.25 * pe.statMult), statLabel: 'Engineered', premium: true, preEngineered: true };
    }
  }
  // Pre-engineered shield boosters
  for (const cls of ['B','A']) {
    const id = `pe_sb_0${cls.toLowerCase()}`;
    m[id] = { id, name: `Shield Booster 0${cls} (Reinforced)`, category: 'utility', type: 'shield_booster', size: 0, class: cls, mass: 1.3, shieldBoost: Math.round((CLASS_MULT[cls] - 0.7) * 150), statLabel: 'Shield %', premium: true, preEngineered: true };
  }
  // Pre-engineered weapons
  const preEngWpns = [
    { abbr: 'mc', name: 'Multi-Cannon Overcharged', sizes: [1,2,3], dmg: 15 },
    { abbr: 'bml', name: 'Beam Laser Long Range', sizes: [1,2,3], dmg: 8 },
    { abbr: 'pa', name: 'Plasma Accelerator Overcharged', sizes: [2,3], dmg: 50 },
    { abbr: 'can', name: 'Cannon High Yield', sizes: [2,3,4], dmg: 25 },
    { abbr: 'pl', name: 'Pulse Laser Efficient', sizes: [1,2,3], dmg: 12 },
  ];
  for (const pw of preEngWpns) {
    for (const size of pw.sizes) {
      const id = `pe_${pw.abbr}_${size}a`;
      m[id] = { id, name: `${pw.name} ${size}A`, category: 'hardpoint', type: pw.abbr, size, class: 'A', mass: size * 3, damage: Math.round(pw.dmg * size * 1.7 * 1.3), statLabel: 'Damage', premium: true, preEngineered: true };
    }
  }

  return m;
}

export const MODULES = generateModules();

// ---- Ship slot layouts (Coriolis-style) ----
// core: { pp, thr, fsd, ls, sen, pd } — maxSize per slot
// optional: array of maxSize per slot
// hardpoints: array of sizes (1=small, 2=medium, 3=large, 4=huge)
// utility: count
const BASE_SHIP_SLOTS = {
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

export const SHIP_SLOTS = { ...BASE_SHIP_SLOTS, ...EXPANDED_SHIP_SLOTS };

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
// Type-based price multipliers — weapons and premium tech cost more than cargo racks
const TYPE_PRICE_MULT = {
  power_plant: 2.5, thrusters: 2.5, fsd: 3.0, life_support: 1.5, sensors: 1.5, power_distributor: 2.0,
  shield_generator: 2.0, hull_reinforcement: 1.2, module_reinforcement: 1.5, fuel_scoop: 1.8, fuel_tank: 0.8,
  cargo_rack: 0.6, collector_limpet: 1.3, afm_unit: 2.0, srv_hangar: 2.2, fighter_hangar: 4.0, refinery: 1.6,
  passenger_cabin: 1.4, surface_scanner: 1.5, prospector_limpet: 1.3, shield_cell_bank: 2.5,
  repair_limpet: 1.5, recon_limpet: 1.5, decontamination_limpet: 1.4, research_limpet: 1.5,
  guardian_fsd_booster: 6.0, guardian_hull_reinforcement: 4.0, guardian_module_reinforcement: 4.0,
  guardian_shield_reinforcement: 4.0, meta_alloy_hull_reinforcement: 3.5,
};
const HARDPOINT_PRICE_MULT = { 1: 1.0, 2: 2.5, 3: 6.0, 4: 15.0 };

export function getModulePrice(moduleId) {
  const mod = MODULES[moduleId];
  if (!mod) return 0;
  const classPriceMult = { E: 1, D: 3, C: 8, B: 20, A: 50 };
  let base = mod.size * 1000 * (classPriceMult[mod.class] || 1);
  // Apply type multiplier
  if (mod.category === 'hardpoint') {
    base *= HARDPOINT_PRICE_MULT[mod.size] || 1.0;
  } else if (mod.category === 'utility') {
    base *= 0.8;
  } else {
    base *= TYPE_PRICE_MULT[mod.type] || 1.5;
  }
  // Premium / pre-engineered modules cost significantly more
  if (mod.premium) base *= 2.0;
  if (mod.preEngineered) base *= 3.0;
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
  let passengerCapacity = 0;
  let cabinClasses = {};

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
    if (mod.type === 'passenger_cabin') {
      passengerCapacity += mod.passengerCapacity || 0;
      if (mod.cabinClass) cabinClasses[mod.cabinClass] = (cabinClasses[mod.cabinClass] || 0) + (mod.passengerCapacity || 0);
    }
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
    passengerCapacity,
    cabinClasses,
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