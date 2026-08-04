// Card Deck — 8 ship manufacturers, 100 unique cards each (800 total).
// Each card carries stats used by the three card games. Pure data + helpers.
export const DECK_SIZE = 100;

export const CARD_MANUFACTURERS = [
  { key: 'drake_voss', name: 'Drake-Voss', short: 'DV', desc: 'Birds of prey — multipurpose traders.', color: '#e08a2a' },
  { key: 'orion_heavy', name: 'Orion Heavy', short: 'OH', desc: 'Industrial haulers and bulk freighters.', color: '#c77a3a' },
  { key: 'sentinel_forge', name: 'Sentinel Forge', short: 'SF', desc: 'Military combat vessels.', color: '#b04a3a' },
  { key: 'kepler', name: 'Kepler Aeroworks', short: 'KA', desc: 'Explorers and surveyors.', color: '#4aa0c0' },
  { key: 'meridian', name: 'Meridian Luxe', short: 'ML', desc: 'Passenger liners and luxury cruisers.', color: '#c8a0d0' },
  { key: 'solaris', name: 'Solaris Dynasty', short: 'SD', desc: 'Imperial craft of the Dynasty.', color: '#d0b060' },
  { key: 'proxima', name: 'Proxima Corp', short: 'PC', desc: 'Corporate explorers and traders.', color: '#5aa070' },
  { key: 'omega', name: 'Omega Corp', short: 'OC', desc: 'Budget interceptors and couriers.', color: '#909090' },
];
export const MFR_COLORS = CARD_MANUFACTURERS.reduce((m, x) => { m[x.key] = x.color; return m; }, {});
const MFR_BY_KEY = CARD_MANUFACTURERS.reduce((m, x) => { m[x.key] = x; return m; }, {});
const NAME_TO_KEY = CARD_MANUFACTURERS.reduce((m, x) => { m[x.name] = x.key; return m; }, {});
export function mfrKey(nameOrKey) { return NAME_TO_KEY[nameOrKey] || nameOrKey; }
export function mfrName(key) { return (MFR_BY_KEY[key] || {}).name || key; }

const PREFIXES = {
  drake_voss: ['Sparrow', 'Kestrel', 'Merlin', 'Osprey', 'Harrier', 'Goshawk', 'Buzzard', 'Kite', 'Peregrine', 'Gyrfalcon'],
  orion_heavy: ['Mule', 'Ox', 'Dray', 'Wagon', 'Barge', 'Tug', 'Leviathan', 'Mammoth', 'Goliath', 'Titan'],
  sentinel_forge: ['Lance', 'Phalanx', 'Vanguard', 'Centurion', 'Legionary', 'Praetor', 'Tribune', 'Cataphract', 'Ballista', 'Citadel'],
  kepler: ['Tern', 'Petrel', 'Skua', 'Albatross', 'Booby', 'Jaeger', 'Skimmer', 'Wanderer', 'Pathfinder', 'Surveyor'],
  meridian: ['Porpoise', 'Narwhal', 'Cachalot', 'Manatee', 'Orca', 'Beluga', 'Rorqual', 'Dolphin', 'Bluefin', 'Spire'],
  solaris: ['Raptor', 'Herald', 'Hawk', 'Shuttle', 'Drake', 'Schooner', 'Raven', 'Palace', 'Sovereign', 'Dynast'],
  proxima: ['Surveyor', 'Trader', 'Cruiser', 'Prospector', 'Courier', 'Liner', 'Scout', 'Freighter', 'Pioneer', 'Wayfinder'],
  omega: ['Herald', 'Interceptor', 'Shadow', 'Spectre', 'Wraith', 'Phantom', 'Viper', 'Cobra', 'Mamba', 'Sidewinder'],
};
const DESIGNATIONS = ['Mk-I', 'Mk-II', 'Mk-III', 'Mk-IV', 'Mk-V', 'Mk-VI', 'Mk-VII', 'Mk-VIII', 'Mk-IX', 'Mk-X'];

const RARITY_TIERS = [
  { name: 'Common', max: 65 },
  { name: 'Rare', max: 90 },
  { name: 'Epic', max: 98 },
  { name: 'Legendary', max: 100 },
];
function rarityOfIdx(idx) {
  for (const t of RARITY_TIERS) if (idx < t.max) return t.name;
  return 'Common';
}

function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function buildCard(key, idx) {
  const mfr = MFR_BY_KEY[key];
  const prefix = PREFIXES[key][Math.floor(idx / 10) % 10];
  const designation = DESIGNATIONS[idx % 10];
  const name = `${prefix} ${designation}`;
  const rng = mulberry(hashStr(key) + idx * 1013);
  const firepower = 20 + Math.floor(rng() * 80);
  const speed = 20 + Math.floor(rng() * 80);
  const armor = 20 + Math.floor(rng() * 80);
  const cargo = 20 + Math.floor(rng() * 80);
  const power = Math.round((firepower + speed + armor + cargo) / 4);
  const cls = (idx % 4) + 1;
  return {
    id: `${key}_${String(idx).padStart(2, '0')}`,
    mfrKey: key,
    manufacturer: mfr.name,
    name,
    rarity: rarityOfIdx(idx),
    class: cls,
    firepower, speed, armor, cargo, power,
    flavor: `Serial ${mfr.short}-${String(idx).padStart(2, '0')} · Class ${cls} hull. ${mfr.desc}`,
  };
}

const CARD_MAP = {};
const MFR_IDS = {};
export const ALL_CARD_IDS = [];
for (const m of CARD_MANUFACTURERS) {
  MFR_IDS[m.key] = [];
  for (let i = 0; i < DECK_SIZE; i++) {
    const c = buildCard(m.key, i);
    CARD_MAP[c.id] = c;
    MFR_IDS[m.key].push(c.id);
    ALL_CARD_IDS.push(c.id);
  }
}

export function getCard(id) { return CARD_MAP[id]; }
export function mfrCardIds(nameOrKey) { return MFR_IDS[mfrKey(nameOrKey)] || []; }
export function idxOfId(id) { return parseInt(id.slice(-2), 10); }
export function rarityOfId(id) { return rarityOfIdx(idxOfId(id)); }
export function isMfrDeckComplete(owned, nameOrKey) {
  const ids = mfrCardIds(nameOrKey);
  return ids.every(id => (owned[id] || 0) > 0);
}
export function getMissingCardIds(owned, nameOrKey) {
  return mfrCardIds(nameOrKey).filter(id => !(owned[id] > 0));
}
export function getOwnedCardIds(owned, nameOrKey) {
  return mfrCardIds(nameOrKey).filter(id => (owned[id] || 0) > 0);
}
export function randomCardFromMfr(nameOrKey) {
  const ids = mfrCardIds(nameOrKey);
  return CARD_MAP[ids[Math.floor(Math.random() * ids.length)]];
}

const ECON_MFR = {
  Extraction: 'orion_heavy', Refinery: 'orion_heavy', Industrial: 'orion_heavy', Mining: 'orion_heavy',
  'High Tech': 'kepler', Technology: 'kepler', Terraforming: 'kepler',
  Military: 'sentinel_forge', Security: 'sentinel_forge',
  Agriculture: 'drake_voss', Colony: 'drake_voss', Service: 'drake_voss', Consumer: 'drake_voss',
  Tourism: 'meridian', Luxury: 'meridian',
  Imperial: 'solaris',
  Corporate: 'proxima',
  None: 'omega', '': 'omega',
};
function pickMfrForStation(station) {
  const eco = station?.economy || station?.system?.economy || '';
  let key = ECON_MFR[eco];
  if (!key) key = CARD_MANUFACTURERS[Math.floor(Math.random() * CARD_MANUFACTURERS.length)].key;
  return key;
}
function pickRarity(station) {
  const sec = station?.security || station?.system?.security;
  const pop = station?.population || station?.system?.population || 0;
  let leg = 0.01, epic = 0.06, rare = 0.22;
  if (sec === 'anarchy' || sec === 'low') { leg += 0.02; epic += 0.06; }
  if (pop > 1e9) { epic += 0.05; rare += 0.1; }
  const r = Math.random();
  if (r < leg) return 'Legendary';
  if (r < leg + epic) return 'Epic';
  if (r < leg + epic + rare) return 'Rare';
  return 'Common';
}
export function pickStationCard(station, owned) {
  const key = pickMfrForStation(station);
  const rarity = pickRarity(station);
  const ids = MFR_IDS[key];
  const want = ids.filter(id => rarityOfId(id) === rarity && !(owned[id] > 0));
  const pool = want.length ? want : ids.filter(id => !(owned[id] > 0));
  const finalPool = pool.length ? pool : ids;
  return CARD_MAP[finalPool[Math.floor(Math.random() * finalPool.length)]];
}

// Full-deck achievement + title reward metadata
export const DECK_REWARD_CREDITS = 50000000;
export const DECK_TITLE_BY_MFR = {
  drake_voss: 'Master of Drake-Voss',
  orion_heavy: 'Master of Orion Heavy',
  sentinel_forge: 'Master of Sentinel Forge',
  kepler: 'Master of Kepler Aeroworks',
  meridian: 'Master of Meridian Luxe',
  solaris: 'Master of Solaris Dynasty',
  proxima: 'Master of Proxima Corp',
  omega: 'Master of Omega Corp',
};