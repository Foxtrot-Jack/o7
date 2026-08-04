// Long-distance journey engine — plans a multi-jump route and manages
// automated jumping, en-route refueling (fuel scoop or station), and
// abort-on-no-fuel logic. Pure helpers; JourneyScreen drives the timing.
import { distance3D } from './galaxy';
import { generateSystemFromStar } from './system';
import { generateCorridorStars } from './routeCalculator';
import { MODULES, computeShipStats, getDefaultModules } from './shipOutfitting';

// Main-sequence stars a fuel scoop can harvest from (Elite convention).
export const SCOOPABLE_STAR_CLASSES = new Set(['O', 'B', 'A', 'F', 'G', 'K', 'M']);
const FUEL_PER_LY = 0.5;
const STATION_FUEL_PRICE = 50; // CR per tonne (matches StationScreen)
const MAX_JUMPS = 2000;

export function getShipJumpRange(state) {
  const modules = state.ship?.modules || getDefaultModules(state.ship?.type);
  const stats = computeShipStats(state.ship?.type, modules);
  return Math.max(5, stats.jumpRange || 8);
}

export function getShipFuelCapacity(state) {
  return state.ship?.fuelCapacity ?? state.ship?.fuel ?? 8;
}

export function hasInfiniteFuel(state) {
  return !!(state.cheats?.unlocked && (state.cheats?.active?.instant_jumps || state.cheats?.active?.infinite_fuel));
}

export function hasFuelScoop(state) {
  const modules = state.ship?.modules || {};
  for (const id of Object.values(modules)) {
    const mod = MODULES[id];
    if (mod && mod.type === 'fuel_scoop') return true;
  }
  return false;
}

export function isScoopable(star) {
  return SCOOPABLE_STAR_CLASSES.has(star?.starClass?.class);
}

// Does this star's system have a station? Returns the first station or null.
export function hasStation(star) {
  const sysData = generateSystemFromStar(star);
  const stations = sysData?.stations || [];
  return stations.length > 0 ? stations[0] : null;
}

// How a stop can refuel: 'scoop' (free), 'station' (paid), or null.
export function refuelMethod(star, hasScoop) {
  if (hasScoop && isScoopable(star)) return 'scoop';
  if (hasStation(star)) return 'station';
  return null;
}

// Fuel a single hop consumes (mirrors gameState.setCurrentSystem, no FSD boost).
export function hopFuelCost(dist, state) {
  if (hasInfiniteFuel(state)) return 0;
  return Math.ceil(dist * FUEL_PER_LY);
}

// Plan a route of FULL star objects from start to end.
export function planJourney(start, end, jumpRange, useNeutron) {
  const corridorStars = generateCorridorStars(start, end);
  const route = [];
  let pos = { ...start };
  for (let i = 0; i < MAX_JUMPS; i++) {
    const isNeutron = pos.starClass?.class === 'NS';
    const effectiveRange = isNeutron && useNeutron ? jumpRange * 4 : jumpRange;
    let best = null;
    let bestRemaining = distance3D(pos, end);
    if (bestRemaining <= effectiveRange) {
      route.push({ star: end, jumpDist: bestRemaining, fromNeutron: isNeutron && useNeutron });
      return { route, error: null };
    }
    for (const star of corridorStars) {
      if (star.seed === pos.seed) continue;
      const jd = distance3D(pos, star);
      if (jd > effectiveRange || jd < 0.5) continue;
      const remaining = distance3D(star, end);
      if (remaining < bestRemaining) { bestRemaining = remaining; best = star; }
    }
    if (!best) return { route, error: 'No route found — try a closer destination or increase jump range.' };
    route.push({ star: best, jumpDist: distance3D(pos, best), fromNeutron: isNeutron && useNeutron });
    pos = best;
  }
  return { route, error: 'Route exceeds maximum jumps.' };
}

// Preview summary of a planned route.
export function summarizeRoute(route, state) {
  const totalDist = route.reduce((s, h) => s + h.jumpDist, 0);
  const totalFuel = route.reduce((s, h) => s + hopFuelCost(h.jumpDist, state), 0);
  const neutronCount = route.filter(h => h.fromNeutron).length;
  const hasScoop = hasFuelScoop(state);
  let scoopStops = 0;
  let stationStops = 0;
  let deadZones = 0; // intermediate stops with no fuel source at all
  for (let i = 0; i < route.length - 1; i++) {
    const m = refuelMethod(route[i].star, hasScoop);
    if (m === 'scoop') scoopStops++;
    else if (m === 'station') stationStops++;
    else deadZones++;
  }
  return { totalDist, totalFuel, neutronCount, scoopStops, stationStops, deadZones, jumps: route.length };
}