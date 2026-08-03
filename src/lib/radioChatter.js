// Procedural radio chatter — NPC dialogue, station announcements, ship AI alerts
// All references (ships, manufacturers, systems, factions, commodities) are native to o7.
import { makeRng, randInt, pick } from './prng';
import { SHIP_TYPES } from './shipRoster';
import { COMMODITY_MAP } from './commodities';
import { LANDMARK_SYSTEMS, BUBBLE_CENTERS } from './galaxy';
import { getRegionName } from './regions';

const SHIP_NAMES = SHIP_TYPES.map(s => s.name);
const MANUFACTURERS = [...new Set(SHIP_TYPES.map(s => s.manufacturer))];
const LANDMARK_NAMES = LANDMARK_SYSTEMS.map(l => l.name);
const BUBBLE_NAMES = BUBBLE_CENTERS.map(b => b.name);
const COMMODITY_NAMES = Object.values(COMMODITY_MAP).map(c => c.name).filter(Boolean);

const CHATTER_TEMPLATES = {
  station_traffic: [
    '{ship} requesting docking clearance at {station}.',
    'Departing {station} — safe skies, Commander.',
    'Traffic control to {ship}, hold position — congestion on pad {pad}.',
    '{ship} cleared for approach, pad {pad}.',
    'Standby {ship}, landing sequence engaged.',
  ],
  station_announcement: [
    'Welcome to {station}. Market and outfitting are open.',
    'Security level: {security}. Stow weapons while docked.',
    'Reminder: Canis Stella regulations require shields offline in the dock.',
    'Station services online — contact the concourse front desk.',
    'Docking bay {pad} now available for incoming traffic.',
  ],
  npc_chatter: [
    'Anyone running bounties out of {system}?',
    'Just jumped in from {landmark}. Quiet run.',
    'Looking for a wing for the local resource site.',
    'Offloading {commodity} at the market — decent prices today.',
    'Seen the Canis Stella rep around? They are pushing new claims.',
    'Pirates reported near the nav beacon out by {system}. Watch your six.',
    'Fuel is cheap here — topping off before the long haul to {landmark}.',
    'Surveying out toward {region}. Nice finds on the rim.',
    'My {ship} frame shift drive is acting up — headed to maintenance.',
    'Heard a {manufacturer} dealer is discounting {ship} hulls this cycle.',
    'Probing a Guardian site past {landmark} — high-value blueprints out there.',
    'Canis Stella is pulling {commodity} contracts. Could use a hauler.',
    'Runner from {bubble} says the markets there are shifting.',
    'Picked up a {ship} out of {landmark} — solid little vessel.',
  ],
  ai_alert: [
    'Fuel reserves at {fuel}%. Recommend refueling at {station}.',
    'Hull integrity at {integrity}%. Maintenance advised.',
    'Cargo hold at {cargo}% capacity.',
    'Route plotted. {jumps} jumps remaining to destination.',
    'Frame shift drive charged. Ready for jump, Commander.',
    'Surface scan data ready for download at Cartographics.',
    'Shield generator nominal. All systems green.',
    'Approaching {station} — request docking clearance.',
    'Entering {region} space. Updating stellar database.',
  ],
};

export function generateChatter(systemData, state) {
  const seed = (systemData?.seed || 'default') + ':' + Math.floor(Date.now() / 30000) + ':' + randInt(makeRng(systemData?.seed || 'x'), 0, 9999);
  const rng = makeRng(seed);
  const types = Object.keys(CHATTER_TEMPLATES);
  const type = pick(rng, types);
  const templates = CHATTER_TEMPLATES[type];
  let msg = pick(rng, templates);

  const station = systemData?.stations?.[0];
  const shipName = pick(rng, SHIP_NAMES);
  const manufacturer = pick(rng, MANUFACTURERS);
  const landmark = pick(rng, LANDMARK_NAMES);
  const bubble = pick(rng, BUBBLE_NAMES);
  const commodity = COMMODITY_NAMES.length ? pick(rng, COMMODITY_NAMES) : 'supplies';
  const fuelPct = state.ship?.fuelCapacity ? Math.round((state.ship.fuel / state.ship.fuelCapacity) * 100) : 100;
  const integrityPct = Math.round(state.ship?.integrity || 100);
  const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
  const cargoPct = state.ship?.cargoCapacity ? Math.round((cargoUsed / state.ship.cargoCapacity) * 100) : 0;
  const jumps = state.plottedRoute?.length || 0;

  // Build a pool of system names the chatter can reference — this game only.
  const discoveredNames = state?.discoveredSystems ? Object.values(state.discoveredSystems).map(s => s?.name).filter(Boolean) : [];
  const flightLogNames = (state?.flightLog || []).map(s => s?.name).filter(Boolean);
  const systemPool = [
    systemData?.name,
    ...LANDMARK_NAMES,
    ...flightLogNames,
    ...discoveredNames,
  ].filter(Boolean);
  const systemName = systemPool.length ? pick(rng, systemPool) : (systemData?.name || 'unknown');

  const regionName = systemData ? getRegionName(systemData.x || 0, systemData.y || 0, systemData.z || 0) : 'the frontier';

  msg = msg
    .replace('{ship}', shipName)
    .replace('{manufacturer}', manufacturer)
    .replace('{station}', station?.name || systemData?.name || 'the station')
    .replace('{pad}', String(randInt(rng, 1, 12)))
    .replace('{system}', systemName)
    .replace('{landmark}', landmark)
    .replace('{bubble}', bubble)
    .replace('{commodity}', commodity)
    .replace('{region}', regionName)
    .replace('{security}', systemData?.security || 'standard')
    .replace('{fuel}', String(fuelPct))
    .replace('{integrity}', String(integrityPct))
    .replace('{cargo}', String(cargoPct))
    .replace('{jumps}', String(jumps));

  return { type, message: msg, timestamp: Date.now() };
}