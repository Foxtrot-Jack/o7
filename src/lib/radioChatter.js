// Procedural radio chatter — NPC dialogue, station announcements, ship AI alerts
import { makeRng, randInt, pick } from './prng';

const CHATTER_TEMPLATES = {
  station_traffic: [
    'Control, {ship} requesting docking clearance.',
    '{ship} departing {station}, safe travels Commander.',
    'Traffic control to {ship}, hold position — congestion ahead.',
    '{ship} cleared for approach, pad {pad}.',
    'Standby {ship}, landing sequence initiated.',
  ],
  station_announcement: [
    'Welcome to {station}. Local market open.',
    'Security level: {security}. Stay vigilant, Commander.',
    'Reminder: weapons must be stowed while docked.',
    'Station services available — contact the front desk.',
  ],
  npc_chatter: [
    'Any bounties in this system?',
    'Just dropped in from {system}. Quiet run.',
    'Looking for a wingmate for the local resource site.',
    'Selling some salvage at the market — decent prices today.',
    'Anyone seen the local faction rep?',
    'Pirates reported near the nav beacon. Watch your six.',
    'Fuel prices are good here, topping off before the long haul.',
    'Exploring out toward the rim. Nice finds out there.',
  ],
  ai_alert: [
    'Fuel reserves at {fuel}%. Recommend refueling at earliest opportunity.',
    'Hull integrity at {integrity}%. Maintenance advised.',
    'Cargo hold at {cargo}% capacity.',
    'Route plotted. {jumps} jumps remaining to destination.',
    'FSD charging complete. Ready for jump, Commander.',
    'Surface scan data available for download at Cartographics.',
    'Shield generator nominal. All systems green.',
  ],
};

const SHIP_NAMES = ['Cobra Mk III', 'Sidewinder', 'Hauler', 'Viper Mk III', 'Python', 'Asp Explorer', 'Diamondback', 'Keelback', 'Type-6', 'Vulture'];

export function generateChatter(systemData, state) {
  const seed = (systemData?.seed || 'default') + ':' + Math.floor(Date.now() / 30000) + ':' + randInt(makeRng(systemData?.seed || 'x'), 0, 9999);
  const rng = makeRng(seed);
  const types = Object.keys(CHATTER_TEMPLATES);
  const type = pick(rng, types);
  const templates = CHATTER_TEMPLATES[type];
  let msg = pick(rng, templates);

  const station = systemData?.stations?.[0];
  const shipName = pick(rng, SHIP_NAMES);
  const fuelPct = state.ship?.fuelCapacity ? Math.round((state.ship.fuel / state.ship.fuelCapacity) * 100) : 100;
  const integrityPct = Math.round(state.ship?.integrity || 100);
  const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
  const cargoPct = state.ship?.cargoCapacity ? Math.round((cargoUsed / state.ship.cargoCapacity) * 100) : 0;
  const jumps = state.plottedRoute?.length || 0;

  msg = msg
    .replace('{ship}', shipName)
    .replace('{station}', station?.name || systemData?.name || 'the station')
    .replace('{pad}', String(randInt(rng, 1, 12)))
    .replace('{system}', systemData?.name || 'unknown')
    .replace('{security}', systemData?.security || 'standard')
    .replace('{fuel}', String(fuelPct))
    .replace('{integrity}', String(integrityPct))
    .replace('{cargo}', String(cargoPct))
    .replace('{jumps}', String(jumps));

  return { type, message: msg, timestamp: Date.now() };
}