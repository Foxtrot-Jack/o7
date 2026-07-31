// Cartography — regional exploration data review and sale with bonuses

import { SOL_SYSTEM, distance3D } from './galaxy';

export const CARTOGRAPHY_REGIONS = [
  { id: 'core', name: 'Core Systems', maxDist: 50, bonus: 1.5, desc: 'Densely populated center' },
  { id: 'inner', name: 'Inner Sphere', maxDist: 200, bonus: 1.3, desc: 'Established colonies' },
  { id: 'middle', name: 'Middle Regions', maxDist: 1000, bonus: 1.2, desc: 'Frontier systems' },
  { id: 'outer', name: 'Outer Rim', maxDist: 5000, bonus: 1.1, desc: 'Sparse outposts' },
  { id: 'deep', name: 'Deep Space', maxDist: 999999, bonus: 1.0, desc: 'Uncharted void' },
];

export function getRegionForSystem(system) {
  const dist = distance3D(system, SOL_SYSTEM);
  for (const region of CARTOGRAPHY_REGIONS) {
    if (dist <= region.maxDist) return region;
  }
  return CARTOGRAPHY_REGIONS[CARTOGRAPHY_REGIONS.length - 1];
}

export function getRegionForDistance(dist) {
  for (const region of CARTOGRAPHY_REGIONS) {
    if (dist <= region.maxDist) return region;
  }
  return CARTOGRAPHY_REGIONS[CARTOGRAPHY_REGIONS.length - 1];
}

// Group scanned bodies by region based on their parent system distance from Sol
export function groupDataByRegion(scannedBodies, discoveredSystems) {
  const byRegion = {};
  for (const region of CARTOGRAPHY_REGIONS) {
    byRegion[region.id] = { region, bodyCount: 0, systemCount: 0, totalValue: 0, firstDiscoveries: 0 };
  }
  for (const [bodyId, scan] of Object.entries(scannedBodies || {})) {
    // Extract system seed from bodyId (format: "seed_bodyN")
    const seedPart = bodyId.split('_')[0];
    const sys = discoveredSystems?.[seedPart];
    if (!sys) continue;
    const dist = sys.x !== undefined ? distance3D({ x: sys.x, y: sys.y, z: sys.z }, SOL_SYSTEM) : 0;
    const region = getRegionForDistance(dist);
    byRegion[region.id].bodyCount++;
    byRegion[region.id].totalValue += scan.value || 0;
    if (sys.firstDiscovered) byRegion[region.id].firstDiscoveries++;
  }
  for (const [seed, sys] of Object.entries(discoveredSystems || {})) {
    const dist = sys.x !== undefined ? distance3D({ x: sys.x, y: sys.y, z: sys.z }, SOL_SYSTEM) : 0;
    const region = getRegionForDistance(dist);
    byRegion[region.id].systemCount++;
  }
  return byRegion;
}