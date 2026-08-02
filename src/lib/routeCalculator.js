// Shared route calculation logic — used by RoutePlotter and GalaxyMap
import { generateStarsInRange, distance3D } from './galaxy';

const CORRIDOR_WIDTH = 25;
const SEGMENT_SIZE = 25;
const MAX_SEGMENTS = 1000;
const MAX_JUMPS = 2000;

export function generateCorridorStars(start, end) {
  const allStars = [];
  const seen = new Set();
  const totalDist = distance3D(start, end);
  const numSegments = Math.min(Math.ceil(totalDist / SEGMENT_SIZE), MAX_SEGMENTS);
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const cx = start.x + (end.x - start.x) * t;
    const cy = start.y + (end.y - start.y) * t;
    const cz = start.z + (end.z - start.z) * t;
    const stars = generateStarsInRange(cx, cy, cz, CORRIDOR_WIDTH);
    for (const star of stars) {
      if (!seen.has(star.seed)) { seen.add(star.seed); allStars.push(star); }
    }
  }
  return allStars;
}

export function computeGreedyRoute(start, end, allStars, jumpRange, useNeutron) {
  const route = [];
  let pos = { ...start };
  const dest = { x: end.x, y: end.y, z: end.z };
  for (let i = 0; i < MAX_JUMPS; i++) {
    const isNeutron = pos.starClass?.class === 'NS';
    const effectiveRange = isNeutron && useNeutron ? jumpRange * 4 : jumpRange;
    let best = null;
    let bestRemaining = distance3D(pos, dest);
    if (bestRemaining <= effectiveRange) {
      route.push({ name: end.name, starClass: end.starClass, jumpDist: bestRemaining, fromNeutron: isNeutron && useNeutron });
      return route;
    }
    for (const star of allStars) {
      const jumpDist = distance3D(pos, star);
      if (jumpDist > effectiveRange || jumpDist < 0.5) continue;
      const remaining = distance3D(star, dest);
      if (remaining < bestRemaining) { bestRemaining = remaining; best = star; }
    }
    if (!best) return route;
    const jumpDist = distance3D(pos, best);
    route.push({ name: best.name, starClass: best.starClass, x: best.x, y: best.y, z: best.z, jumpDist, fromNeutron: isNeutron && useNeutron });
    pos = best;
  }
  return route;
}

export function calculateRoute(start, end, jumpRange, useNeutron = true) {
  const corridorStars = generateCorridorStars(start, end);
  return computeGreedyRoute(start, end, corridorStars, jumpRange, useNeutron);
}