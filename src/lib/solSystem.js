// Sol System — hidden special system with real solar system bodies
// Finding Sol unlocks cheats, each tied to a planetary body
import { BODY_TYPES, generateSurfaceSignals, generatePlanetMaterials } from './system';
import { STAR_CLASSES, SOL_SEED } from './galaxy';
import { makeRng } from './prng';
import { ECONOMY_TYPES } from './commodities';

// Cheat definitions — each tied to a body in the Sol system
export const SOL_CHEATS = [
  { id: 'infinite_fuel', bodyName: 'Sol', name: 'Solar Forge', desc: 'Your ship never runs out of fuel. Every jump is fully fueled.', type: 'passive' },
  { id: 'instant_jumps', bodyName: 'Mercury', name: 'Fleet-Footed', desc: 'Jump to any system instantly. No fuel cost, no range limit.', type: 'passive' },
  { id: 'best_prices', bodyName: 'Venus', name: 'Morning Star', desc: 'All stations offer perfect prices — buy for nothing, sell for maximum.', type: 'passive' },
  { id: 'max_colonies', bodyName: 'Earth', name: 'Genesis Protocol', desc: 'All colonies instantly reach maximum infrastructure, population, and happiness.', type: 'active' },
  { id: 'free_outfitting', bodyName: 'Mars', name: 'War Forge', desc: 'All ship modules and engineering are free at every station.', type: 'passive' },
  { id: 'max_credits', bodyName: 'Jupiter', name: 'Jovian Treasury', desc: 'Fill your accounts with 1 billion credits from the king of planets.', type: 'active' },
  { id: 'golden_theme', bodyName: 'Saturn', name: 'Lord of Rings', desc: 'A radiant golden CRT theme, befitting the ringed lord.', type: 'cosmetic' },
  { id: 'galaxy_flip', bodyName: 'Uranus', name: 'Tilted Axis', desc: 'The galaxy map is viewed from Uranus\'s tilted perspective — upside down.', type: 'cosmetic' },
  { id: 'reveal_systems', bodyName: 'Neptune', name: 'All-Seeing Eye', desc: 'Reveal all star systems within 500 LY of your position.', type: 'active' },
  { id: 'max_materials', bodyName: 'Pluto', name: 'Underworld Riches', desc: 'Fill your ship locker with maximum quantities of all materials.', type: 'active' },
];

export function isSolSeed(seed) {
  return seed === SOL_SEED;
}

export function generateSolSystem() {
  const rng = makeRng(SOL_SEED + ':system');
  const G_CLASS = STAR_CLASSES[4];
  const bodies = [];

  // Sol — the star
  const solStar = {
    id: 'star_0', type: BODY_TYPES.STAR, designation: 'A', name: 'Sol',
    starClass: G_CLASS, radius: 1.0, temperature: 5778, color: G_CLASS.color,
    parent: null, orbitRadius: 0, orbitPeriod: 0, axialTilt: 7.25, rotationPeriod: 25,
    scanValue: 0, scanned: false,
  };
  bodies.push(solStar);

  const makePlanet = (id, designation, name, planetType, planetTypeName, color, radius, orbitRadius, orbitPeriod, axialTilt, rotationPeriod, temperature, gravity, atmosphere, habitable, landable, hasRings, ringType) => ({
    id, type: BODY_TYPES.PLANET, designation, name, planetType, planetTypeName, color,
    radius, orbitRadius, orbitPeriod, axialTilt, rotationPeriod, temperature, gravity,
    atmosphere, habitable, hasRings: hasRings || false, ringType: ringType || null,
    volcanic: false, terraformed: false,
    materials: generatePlanetMaterials(rng, { id: planetType }),
    parent: 'star_0', scanValue: 50000, scanned: false, discovered: false, landable,
    surfaceSignals: generateSurfaceSignals(id, planetType),
  });

  const makeMoon = (id, designation, name, parentId, color, radius, orbitRadius, orbitPeriod, temperature, gravity) => ({
    id, type: BODY_TYPES.MOON, designation, name, planetType: 'rocky', planetTypeName: 'Rocky Body', color,
    radius, orbitRadius, orbitPeriod, axialTilt: 0, rotationPeriod: orbitPeriod, temperature, gravity,
    atmosphere: false, habitable: false, hasRings: false, volcanic: false,
    materials: generatePlanetMaterials(rng, { id: 'rocky' }),
    parent: parentId, scanValue: 20000, scanned: false, discovered: false, landable: true,
    surfaceSignals: generateSurfaceSignals(id, 'rocky'),
  });

  // Mercury
  bodies.push(makePlanet('star_0_p1', 'A 1', 'Mercury', 'high_metal_content', 'High Metal Content Body', '#8a7a6a', 0.38, 8, 88, 0.03, 58.6, 167, 0.38, false, false, true));
  // Venus
  bodies.push(makePlanet('star_0_p2', 'A 2', 'Venus', 'rocky', 'Rocky Body', '#e8c878', 0.95, 12, 225, 177, 243, 464, 0.91, true, false, false));
  // Earth + Luna
  bodies.push(makePlanet('star_0_p3', 'A 3', 'Earth', 'earthlike', 'Earth-Like World', '#4a8acc', 1.0, 16, 365, 23.4, 1, 15, 1.0, true, true, true));
  bodies.push(makeMoon('star_0_p3_m0', 'A 3 a', 'Luna', 'star_0_p3', '#cccccc', 0.27, 2.5, 27.3, -23, 0.16));
  // Mars
  bodies.push(makePlanet('star_0_p4', 'A 4', 'Mars', 'desert', 'Desert World', '#cc6644', 0.53, 22, 687, 25.2, 1.03, -65, 0.38, true, false, true));
  // Asteroid Belt
  bodies.push({ id: 'star_0_b1', type: BODY_TYPES.BELT, designation: 'A Belt', name: 'Asteroid Belt', color: '#665544', radius: 1.5, orbitRadius: 30, orbitPeriod: 1680, parent: 'star_0', scanValue: 15000, scanned: false, discovered: false, bodyCount: 1000000, materials: generatePlanetMaterials(rng, { id: 'rocky' }) });
  // Jupiter + Galilean moons
  bodies.push(makePlanet('star_0_p5', 'A 5', 'Jupiter', 'gas_giant', 'Class I Gas Giant', '#cc9966', 11.2, 45, 4333, 3.1, 0.41, -145, 2.53, true, false, false, true, 'icy'));
  bodies.push(makeMoon('star_0_p5_m0', 'A 5 a', 'Io', 'star_0_p5', '#ffcc44', 0.29, 14, 1.77, -143, 0.18));
  bodies.push(makeMoon('star_0_p5_m1', 'A 5 b', 'Europa', 'star_0_p5', '#d0c0a0', 0.25, 18, 3.55, -171, 0.13));
  bodies.push(makeMoon('star_0_p5_m2', 'A 5 c', 'Ganymede', 'star_0_p5', '#9a8a7a', 0.41, 24, 7.15, -183, 0.15));
  bodies.push(makeMoon('star_0_p5_m3', 'A 5 d', 'Callisto', 'star_0_p5', '#6a5a4a', 0.38, 32, 16.69, -139, 0.13));
  // Saturn + Titan
  bodies.push(makePlanet('star_0_p6', 'A 6', 'Saturn', 'gas_giant_ii', 'Class II Gas Giant', '#d4c090', 9.45, 65, 10759, 26.7, 0.45, -178, 1.07, true, false, false, true, 'icy'));
  bodies.push(makeMoon('star_0_p6_m0', 'A 6 a', 'Titan', 'star_0_p6', '#cc9933', 0.40, 20, 15.95, -179, 0.14));
  // Uranus
  bodies.push(makePlanet('star_0_p7', 'A 7', 'Uranus', 'gas_giant_iii', 'Class III Gas Giant', '#88ccdd', 4.01, 85, 30687, 97.8, 0.72, -224, 0.89, true, false, false, true, 'icy'));
  // Neptune
  bodies.push(makePlanet('star_0_p8', 'A 8', 'Neptune', 'gas_giant_iv', 'Class IV Gas Giant', '#3366cc', 3.88, 100, 60190, 28.3, 0.67, -218, 1.14, true, false, false, true, 'icy'));
  // Pluto
  bodies.push(makePlanet('star_0_p9', 'A 9', 'Pluto', 'icy', 'Icy Body', '#b0a090', 0.19, 115, 90560, 122.5, 6.39, -229, 0.06, false, false, true));

  const stations = [
    { id: 'station_0', name: 'Abraham Lincoln Station', parentId: 'star_0_p3', parentName: 'Earth', type: 'coriolis', isOrbital: true, stationOrbitRadius: 3, distanceFromStar: 16, economy: ECONOMY_TYPES[0], services: { market: true, refuel: true, repair: true, rearm: true, shipyard: true, outfitting: true, missions: true, exploration: true, cartographics: true, contact: true } },
    { id: 'station_1', name: 'Mars Point Settlement', parentId: 'star_0_p4', parentName: 'Mars', type: 'planetary', isOrbital: false, stationOrbitRadius: 0, distanceFromStar: 22, economy: ECONOMY_TYPES[0], services: { market: true, refuel: true, repair: true, rearm: false, shipyard: false, outfitting: true, missions: true, exploration: false, cartographics: false, contact: false } },
    { id: 'station_2', name: 'Galileo Orbital', parentId: 'star_0_p5', parentName: 'Jupiter', type: 'orbis', isOrbital: true, stationOrbitRadius: 5, distanceFromStar: 45, economy: ECONOMY_TYPES[0], services: { market: true, refuel: true, repair: true, rearm: false, shipyard: false, outfitting: false, missions: true, exploration: false, cartographics: false, contact: false } },
  ];

  return { seed: SOL_SEED, stars: [solStar], bodies, stations, faction: 'Sol Federation', economy: ECONOMY_TYPES[0], bodyCount: bodies.length, isSol: true };
}