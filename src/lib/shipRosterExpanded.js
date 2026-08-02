// 200 expanded ships across all classes and specialist roles
// Specialist ships for mining, cargo, passenger, exploration, combat
// 60 multirole ships for versatile customization

const MFRS = ['Drake-Voss', 'Orion Heavy', 'Sentinel Forge', 'Kepler Aeroworks', 'Meridian Luxe', 'Solaris Dynasty', 'Proxima Corp', 'Omega Corp', 'Vortex Dynamics', 'Stellaris Corp', 'Nova Forge', 'Helios Dynamics'];

const NAME_POOLS = {
  mining: ['Excavator', 'Prospector', 'Digger', 'Quarry', 'Vein', 'Pickaxe', 'Drill', 'Borer'],
  cargo: ['Hauler', 'Freighter', 'Carrier', 'Transport', 'Mule', 'Wagon', 'Dray', 'Barge'],
  passenger: ['Liner', 'Cruiser', 'Ferry', 'Yacht', 'Clipper', 'Dhow', 'Pinnace', 'Salon'],
  exploration: ['Pathfinder', 'Surveyor', 'Pioneer', 'Voyager', 'Ranger', 'Scout', 'Wayfarer', 'Drifter'],
  combat: ['Interceptor', 'Gunship', 'Frigate', 'Corvette', 'Destroyer', 'Cruiser', 'Battleship', 'Dreadnought'],
  multirole: ['Venture', 'Endeavor', 'Genesis', 'Horizon', 'Frontier', 'Odyssey', 'Nexus', 'Catalyst', 'Meridian', 'Sentinel'],
};

const MK = ['Mk-I', 'Mk-II', 'Mk-III', 'Mk-IV'];

function genSlots(cls, role) {
  const base = {
    1: { core: { pp: 2, thr: 2, fsd: 2, ls: 1, sen: 1, pd: 1 }, optional: [2, 2, 1], hardpoints: [1, 1], utility: 2 },
    2: { core: { pp: 4, thr: 4, fsd: 4, ls: 2, sen: 2, pd: 3 }, optional: [4, 3, 2, 2, 1], hardpoints: [1, 1, 2, 2], utility: 4 },
    3: { core: { pp: 5, thr: 5, fsd: 5, ls: 4, sen: 4, pd: 4 }, optional: [5, 5, 3, 3, 2, 1], hardpoints: [1, 1, 2, 2, 3], utility: 4 },
    4: { core: { pp: 7, thr: 7, fsd: 6, ls: 5, sen: 5, pd: 6 }, optional: [7, 6, 6, 5, 4, 3, 2], hardpoints: [2, 2, 3, 3, 4], utility: 8 },
  };
  const s = JSON.parse(JSON.stringify(base[cls]));
  if (role === 'cargo') { s.optional = s.optional.map(x => Math.min(8, x + 1)); s.hardpoints = s.hardpoints.slice(0, Math.max(1, s.hardpoints.length - 1)); }
  if (role === 'mining') { s.optional = s.optional.map(x => Math.min(8, x + 1)); if (cls >= 2) s.hardpoints.push(1); }
  if (role === 'combat') { s.hardpoints = s.hardpoints.map(x => Math.min(4, x + 1)); if (cls >= 3) s.hardpoints.push(3); s.optional = s.optional.slice(0, Math.max(2, s.optional.length - 1)); }
  if (role === 'exploration') { s.optional.push(2); s.optional.push(1); }
  if (role === 'passenger') { s.optional.push(3); }
  if (role === 'multirole') { s.optional.push(2); if (cls >= 2) s.hardpoints.push(2); }
  return s;
}

function genStats(cls, role, idx) {
  const baseCargo = { 1: 4, 2: 16, 3: 40, 4: 100 };
  const baseFuel = { 1: 8, 2: 16, 3: 32, 4: 64 };
  const baseRange = { 1: 9, 2: 14, 3: 16, 4: 14 };
  const baseCost = { 1: 50000, 2: 2000000, 3: 25000000, 4: 120000000 };
  let cargo = baseCargo[cls], range = baseRange[cls], cost = baseCost[cls];
  if (role === 'cargo') { cargo *= 2.5; range *= 0.8; }
  if (role === 'mining') { cargo *= 1.5; range *= 0.85; }
  if (role === 'passenger') { cargo *= 0.4; range *= 1.1; }
  if (role === 'exploration') { cargo *= 0.7; range *= 1.5; }
  if (role === 'combat') { cargo *= 0.3; range *= 0.85; }
  if (role === 'multirole') { cargo *= 1.2; range *= 1.1; }
  const v = 0.8 + (idx % 5) * 0.1;
  return {
    cargoCapacity: Math.round(cargo * v),
    fuelCapacity: baseFuel[cls],
    jumpRange: Math.round(range * v * 10) / 10,
    cost: Math.round(cost * v * (1 + idx * 0.05)),
  };
}

function generate() {
  const ships = [];
  const slots = {};
  const roles = ['mining', 'cargo', 'passenger', 'exploration', 'combat'];
  let n = 0;

  // 28 per specialist role × 5 roles = 140
  for (const role of roles) {
    for (let i = 0; i < 28; i++) {
      const cls = Math.min(4, Math.floor(i / 7) + 1);
      const id = `exp_${role}_${i}`;
      const pool = NAME_POOLS[role];
      const nameIdx = i % pool.length;
      const suffix = i >= pool.length ? `-${String.fromCharCode(97 + Math.floor(i / pool.length))}` : '';
      const name = `${pool[nameIdx]} ${MK[cls - 1]}${suffix}`;
      const st = genStats(cls, role, i);
      ships.push({ id, name, manufacturer: MFRS[(n + role.length) % MFRS.length], ...st, multirole: false, class: cls });
      slots[id] = genSlots(cls, role);
      n++;
    }
  }

  // 60 multirole ships = 200 total
  for (let i = 0; i < 60; i++) {
    const cls = (i % 4) + 1;
    const id = `exp_multi_${i}`;
    const pool = NAME_POOLS.multirole;
    const nameIdx = i % pool.length;
    const suffix = i >= pool.length ? `-${String.fromCharCode(97 + Math.floor(i / pool.length))}` : '';
    const name = `${pool[nameIdx]} ${MK[cls - 1]}${suffix}`;
    const st = genStats(cls, 'multirole', i);
    ships.push({ id, name, manufacturer: MFRS[i % MFRS.length], ...st, multirole: true, class: cls });
    slots[id] = genSlots(cls, 'multirole');
  }

  return { ships, slots };
}

const { ships: EXPANDED_SHIPS, slots: EXPANDED_SHIP_SLOTS } = generate();
export { EXPANDED_SHIPS, EXPANDED_SHIP_SLOTS };