// Carrier Logistics — multi-jump route planning and tritium management

import { distance3D } from './galaxy';

export function calculateRouteTritium(currentSystem, route) {
  let total = 0;
  let current = currentSystem;
  for (const dest of route) {
    const dist = distance3D(
      { x: current.x, y: current.y, z: current.z },
      { x: dest.x, y: dest.y, z: dest.z }
    );
    total += Math.ceil(dist / 10);
    current = dest;
  }
  return total;
}

export function calculateRouteDistance(currentSystem, route) {
  let total = 0;
  let current = currentSystem;
  for (const dest of route) {
    total += distance3D(
      { x: current.x, y: current.y, z: current.z },
      { x: dest.x, y: dest.y, z: dest.z }
    );
    current = dest;
  }
  return total;
}

export function getRouteSummary(currentSystem, route) {
  if (!route || route.length === 0) return { jumps: 0, distance: 0, tritium: 0 };
  return {
    jumps: route.length,
    distance: Math.round(calculateRouteDistance(currentSystem, route)),
    tritium: calculateRouteTritium(currentSystem, route),
  };
}