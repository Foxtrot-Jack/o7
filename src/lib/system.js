// System body generation — up to 150 bodies per system
// Generates stars (binary/multiple), planets, moons, asteroid belts, and stray asteroids
import { makeRng, randInt, randFloat, pick, pickWeighted, shuffle } from './prng';
import { generateBodyName, generateStationName, generateFactionName } from './names';
import { ECONOMY_TYPES } from './commodities';
import { STAR_CLASSES, SPECIAL_STARS, SOL_SEED } from './galaxy';
import { generateSolSystem } from './solSystem';

const ALL_STAR_CLASSES_LOCAL = [...STAR_CLASSES, ...SPECIAL_STARS];

// Materials obtainable from mining — used by mining missions to ensure
// the target commodity is actually mineable from asteroid belts/planets.
export const MINING_MATERIAL_IDS = [
  'iron', 'silicon', 'carbon', 'water', 'nickel', 'phosphorus', 'sulphur',
  'chromium', 'manganese', 'zinc', 'germanium', 'tin', 'tungsten', 'mercury',
  'platinum', 'palladium', 'iridium', 'painite', 'pristine_diamond',
  'low_temp_diamond', 'tritium', 'bromellite', 'void_opals', 'alexandrite',
  'core_minerals',
];

// Body types
export const BODY_TYPES = {
  STAR: 'star',
  PLANET: 'planet',
  MOON: 'moon',
  BELT: 'belt',
  ASTEROID: 'asteroid',
  RING: 'ring',
};

// Planet types (inspired by Elite Dangerous but legally distinct)
export const PLANET_TYPES = [
  { id: 'high_metal_content', name: 'High Metal Content Body', color: '#8a7a6a', habitable: false, weight: 15 },
  { id: 'rocky', name: 'Rocky Body', color: '#7a6a5a', habitable: false, weight: 20 },
  { id: 'rocky_ice', name: 'Rocky Ice Body', color: '#8a9aaa', habitable: false, weight: 12 },
  { id: 'icy', name: 'Icy Body', color: '#c0d0e0', habitable: false, weight: 15 },
  { id: 'earthlike', name: 'Earth-Like World', color: '#4a8acc', habitable: true, weight: 2, rare: true },
  { id: 'water_world', name: 'Water World', color: '#3399cc', habitable: true, weight: 3, rare: true },
  { id: 'ammonia', name: 'Ammonia World', color: '#55aa44', habitable: false, weight: 4 },
  { id: 'gas_giant', name: 'Class I Gas Giant', color: '#cc9966', habitable: false, weight: 10, hasRings: true },
  { id: 'gas_giant_ii', name: 'Class II Gas Giant', color: '#bbaa77', habitable: false, weight: 8, hasRings: true },
  { id: 'gas_giant_iii', name: 'Class III Gas Giant', color: '#aa8855', habitable: false, weight: 6, hasRings: true },
  { id: 'gas_giant_iv', name: 'Class IV Gas Giant', color: '#886644', habitable: false, weight: 4, hasRings: true },
  { id: 'helium_rich', name: 'Helium-Rich Gas Giant', color: '#ddccaa', habitable: false, weight: 3, hasRings: true },
  { id: 'helium_gas_giant', name: 'Helium Gas Giant', color: '#c0b090', habitable: false, weight: 3, hasRings: true },
  { id: 'metal_rich', name: 'Metal-Rich Body', color: '#9a8a7a', habitable: false, weight: 8 },
  { id: 'desert', name: 'Desert World', color: '#bb9955', habitable: false, weight: 6 },
  { id: 'terracformed', name: 'Terraformed World', color: '#558855', habitable: true, weight: 2, rare: true },
  { id: 'lava', name: 'Lava World', color: '#cc4422', habitable: false, weight: 5 },
  { id: 'carbon', name: 'Carbon World', color: '#444444', habitable: false, weight: 4 },
];

// Surface signal definitions — biological, geological, mineral
export const SURFACE_SIGNALS = {
  biological: [
    { id: 'bacterial_colony', name: 'Bacterial Colony', value: 5000 },
    { id: 'fungal_cluster', name: 'Fungal Cluster', value: 8000 },
    { id: 'tubus_conifer', name: 'Tubus Conifer', value: 12000 },
    { id: 'stratum_techtonicus', name: 'Stratum Techtonicus', value: 15000 },
    { id: 'tussocks', name: 'Tussocks', value: 9000 },
    { id: 'bark_mounds', name: 'Bark Mounds', value: 14000 },
    { id: 'sinuous_tubers', name: 'Sinuous Tubers', value: 11000 },
  ],
  geological: [
    { id: 'fumarole', name: 'Fumarole', value: 3000 },
    { id: 'geyser', name: 'Geiser', value: 3500 },
    { id: 'lava_spout', name: 'Lava Spout', value: 4000 },
    { id: 'crystalline_shard', name: 'Crystalline Shard', value: 8000 },
    { id: 'ice_geyser', name: 'Ice Geyser', value: 3500 },
  ],
  mineral: [
    { id: 'crystal_cluster', name: 'Crystal Cluster', value: 4000 },
    { id: 'mineral_deposit', name: 'Mineral Deposit', value: 2500 },
    { id: 'brain_trees', name: 'Brain Trees', value: 7000 },
    { id: 'metallic_deposits', name: 'Metallic Deposits', value: 3500 },
  ],
};

// Generate surface signals for a body — uses separate RNG to not affect system gen
export function generateSurfaceSignals(bodyId, planetType) {
  const rng = makeRng(bodyId + ':signals');
  const signals = [];
  const habitable = ['earthlike', 'water_world', 'terracformed'].includes(planetType);
  const volcanic = planetType === 'lava' || planetType === 'high_metal_content';

  const pickN = (pool, count) => {
    const avail = [...pool];
    for (let i = 0; i < count && avail.length > 0; i++) {
      const idx = Math.floor(rng() * avail.length);
      signals.push({ ...avail[idx], type: pool === SURFACE_SIGNALS.biological ? 'biological' : pool === SURFACE_SIGNALS.geological ? 'geological' : 'mineral' });
      avail.splice(idx, 1);
    }
  };

  if (habitable || planetType === 'ammonia' || planetType === 'desert') {
    pickN(SURFACE_SIGNALS.biological, habitable ? randInt(rng, 2, 6) : randInt(rng, 0, 2));
  }
  if (volcanic || planetType === 'lava') {
    pickN(SURFACE_SIGNALS.geological, randInt(rng, 1, 4));
  }
  if (['rocky', 'metal_rich', 'high_metal_content', 'carbon', 'rocky_ice', 'icy'].includes(planetType)) {
    pickN(SURFACE_SIGNALS.mineral, randInt(rng, 1, 3));
  }
  if (planetType === 'icy' && rng() < 0.3) {
    pickN(SURFACE_SIGNALS.geological, randInt(rng, 0, 2));
  }

  return signals;
}

// Generate a complete system from a seed
export function generateSystem(starSeed, parentStarClass, population = 0) {
  if (starSeed === SOL_SEED) {
    return generateSolSystem();
  }
  const rng = makeRng(starSeed + ':system');

  // Number of stars in the system (1-3)
  const starCount = pickWeighted(rng, [
    { value: 1, weight: 70 },
    { value: 2, weight: 22 },
    { value: 3, weight: 8 },
  ]);

  const stars = [];
  const rootLetters = 'ABCDEFGH';

  // Primary star
  stars.push({
    id: 'star_0',
    type: BODY_TYPES.STAR,
    designation: rootLetters[0],
    name: parentStarClass.name,
    starClass: parentStarClass,
    radius: parentStarClass.radius[0] + rng() * (parentStarClass.radius[1] - parentStarClass.radius[0]),
    temperature: parentStarClass.temp[0] + rng() * (parentStarClass.temp[1] - parentStarClass.temp[0]),
    color: parentStarClass.color,
    parent: null,
    orbitRadius: 0,
    orbitPeriod: 0,
    axialTilt: randFloat(rng, 0, 30),
    rotationPeriod: randFloat(rng, 10, 60),
    scanValue: 0,
    scanned: false,
  });

  // Additional stars (binary, trinary)
  for (let s = 1; s < starCount; s++) {
    // Companion stars are typically smaller than the primary
    const smallerClasses = require_starClassesSmaller(parentStarClass);
    const compClass = pickWeighted(rng, smallerClasses.map(c => ({ value: c, weight: c.weight })));

    stars.push({
      id: `star_${s}`,
      type: BODY_TYPES.STAR,
      designation: rootLetters[s],
      name: compClass.name,
      starClass: compClass,
      radius: compClass.radius[0] + rng() * (compClass.radius[1] - compClass.radius[0]),
      temperature: compClass.temp[0] + rng() * (compClass.temp[1] - compClass.temp[0]),
      color: compClass.color,
      parent: s === 1 ? 'star_0' : `star_${s - 1}`,
      orbitRadius: randFloat(rng, 50, 500) * (s),
      orbitPeriod: randFloat(rng, 100, 2000),
      axialTilt: randFloat(rng, 0, 30),
      rotationPeriod: randFloat(rng, 10, 60),
      scanValue: 0,
      scanned: false,
    });
  }

  // Generate orbital groups for each star
  const bodies = [...stars];
  const rootStar = stars[0];

  for (let si = 0; si < starCount; si++) {
    const star = stars[si];
    // Only the primary star gets a full system; companions may get a few bodies
    const maxOrbits = si === 0 ? randInt(rng, 6, 12) : randInt(rng, 0, 4);
    if (maxOrbits === 0) continue;

    let currentOrbitRadius = randFloat(rng, 0.5, 5) + star.radius * 0.5;

    for (let o = 1; o <= maxOrbits; o++) {
      // Orbital spacing increases with distance
      const gap = randFloat(rng, 3, 15) * (1 + o * 0.3);
      currentOrbitRadius += gap;

      // Determine if this orbit slot is a planet or a belt
      const isBelt = rng() < 0.15;

      if (isBelt) {
        const beltBody = generateBelt(rng, star.id, star.designation, o, currentOrbitRadius);
        bodies.push(beltBody);

        // Sometimes a belt has stray asteroids with valuable materials
        const asteroidCount = randInt(rng, 3, 15);
        for (let a = 0; a < asteroidCount; a++) {
          bodies.push(generateAsteroid(rng, beltBody.id, star.designation, o, currentOrbitRadius));
        }
      } else {
        const planet = generatePlanet(rng, star.id, star.designation, o, currentOrbitRadius, star);
        bodies.push(planet);

        // Generate moons
        if (planet.hasRings) {
          bodies.push(generateRing(rng, planet.id));
        }

        const moonCount = pickWeighted(rng, [
          { value: 0, weight: 30 },
          { value: 1, weight: 25 },
          { value: 2, weight: 20 },
          { value: 3, weight: 15 },
          { value: 4, weight: 7 },
          { value: 5, weight: 3 },
        ]);

        for (let m = 0; m < moonCount; m++) {
          const moon = generateMoon(rng, planet, m, String.fromCharCode(97 + m)); // a, b, c...
          bodies.push(moon);
        }
      }
    }
  }

  // Cap at 150 bodies
  const finalBodies = bodies.slice(0, 150);

  // Generate stations (population determines whether stations are guaranteed)
  const stations = generateStations(rng, starSeed, finalBodies, population);

  // Generate faction
  const faction = generateFactionName(starSeed);
  const economy = pickWeighted(rng, ECONOMY_TYPES.map(e => ({ value: e, weight: 1 })));

  return {
    seed: starSeed,
    stars,
    bodies: finalBodies,
    stations,
    faction,
    economy,
    bodyCount: finalBodies.length,
  };
}

function require_starClassesSmaller(parentClass) {
  // Return classes with weight > 0, preferring smaller companion stars
  return ALL_STAR_CLASSES_LOCAL.filter(c => c.weight > 0);
}

function generatePlanet(rng, parentId, rootLetter, orbitIndex, orbitRadius, parentStar) {
  const planetType = pickWeighted(rng, PLANET_TYPES.map(t => ({ value: t, weight: t.weight })));
  const radius = randFloat(rng, 0.1, 3) * (planetType.id.startsWith('gas_giant') ? 8 : 1);
  const properName = generateBodyName(parentId + ':planet:' + orbitIndex);

  // Determine habitability and atmosphere
  const isHabitable = planetType.habitable;
  const hasAtmosphere = planetType.id.startsWith('gas_giant') || rng() < 0.5;

  // Scan value — rare/habitable worlds are worth more
  let scanValue = randInt(rng, 500, 50000);
  if (planetType.rare) scanValue *= 10;
  if (isHabitable) scanValue *= 3;
  if (planetType.id === 'ammonia') scanValue *= 2;
  if (planetType.id === 'water_world') scanValue *= 4;
  if (planetType.id === 'earthlike') scanValue *= 5;

  return {
    id: `${parentId}_p${orbitIndex}`,
    type: BODY_TYPES.PLANET,
    designation: `${rootLetter} ${orbitIndex}`,
    name: properName || `${rootLetter} ${orbitIndex}`,
    planetType: planetType.id,
    planetTypeName: planetType.name,
    color: planetType.color,
    radius,
    orbitRadius,
    orbitPeriod: Math.pow(orbitRadius, 1.5) * randFloat(rng, 50, 100),
    axialTilt: randFloat(rng, 0, 45),
    rotationPeriod: randFloat(rng, 5, 100),
    temperature: randFloat(rng, 50, 1500) - orbitRadius * 2,
    gravity: randFloat(rng, 0.1, 3.5),
    atmosphere: hasAtmosphere,
    habitable: isHabitable,
    hasRings: planetType.hasRings && rng() < 0.6,
    ringType: planetType.hasRings && rng() < 0.6 ? pick(rng, ['rocky', 'icy', 'metallic']) : null,
    volcanic: planetType.id === 'lava',
    terraformed: planetType.id === 'terracformed',
    materials: generatePlanetMaterials(rng, planetType),
    parent: parentId,
    scanValue: Math.round(scanValue),
    scanned: false,
    discovered: false,
    landable: !planetType.id.startsWith('gas_giant') && !planetType.id.startsWith('helium'),
    surfaceSignals: generateSurfaceSignals(`${parentId}_p${orbitIndex}`, planetType.id),
  };
}

function generateMoon(rng, parentPlanet, moonIndex, moonLetter) {
  const moonType = pickWeighted(rng, [
    { value: 'rocky', weight: 40 },
    { value: 'icy', weight: 30 },
    { value: 'metal_rich', weight: 15 },
    { value: 'rocky_ice', weight: 15 },
  ]);

  const typeMap = {
    rocky: { name: 'Rocky Body', color: '#7a6a5a' },
    icy: { name: 'Icy Body', color: '#c0d0e0' },
    metal_rich: { name: 'Metal-Rich Body', color: '#9a8a7a' },
    rocky_ice: { name: 'Rocky Ice Body', color: '#8a9aaa' },
  };

  const radius = randFloat(rng, 0.05, 0.8);
  const orbitRadius = randFloat(rng, 1, 8) * (parentPlanet.radius + 1);

  return {
    id: `${parentPlanet.id}_m${moonIndex}`,
    type: BODY_TYPES.MOON,
    designation: `${parentPlanet.designation}${moonLetter}`,
    name: `${parentPlanet.designation}${moonLetter}`,
    planetType: moonType,
    planetTypeName: typeMap[moonType].name,
    color: typeMap[moonType].color,
    radius,
    orbitRadius,
    orbitPeriod: Math.pow(orbitRadius, 1.5) * randFloat(rng, 5, 20),
    axialTilt: randFloat(rng, 0, 30),
    rotationPeriod: randFloat(rng, 5, 60),
    temperature: parentPlanet.temperature + randFloat(rng, -100, 100),
    gravity: randFloat(rng, 0.05, 0.8),
    atmosphere: rng() < 0.1,
    habitable: false,
    hasRings: false,
    volcanic: rng() < 0.1,
    materials: generatePlanetMaterials(rng, { id: moonType }),
    parent: parentPlanet.id,
    scanValue: Math.round(randInt(rng, 200, 8000) * (moonType === 'metal_rich' ? 2 : 1)),
    scanned: false,
    discovered: false,
    landable: true,
    surfaceSignals: generateSurfaceSignals(`${parentPlanet.id}_m${moonIndex}`, moonType),
  };
}

function generateBelt(rng, parentId, rootLetter, orbitIndex, orbitRadius) {
  return {
    id: `${parentId}_b${orbitIndex}`,
    type: BODY_TYPES.BELT,
    designation: `${rootLetter} Belt ${orbitIndex}`,
    name: `${rootLetter} Belt ${orbitIndex}`,
    color: '#665544',
    radius: randFloat(rng, 0.5, 2),
    orbitRadius,
    orbitPeriod: Math.pow(orbitRadius, 1.5) * randFloat(rng, 50, 100),
    parent: parentId,
    scanValue: Math.round(randInt(rng, 1000, 10000)),
    scanned: false,
    discovered: false,
    bodyCount: randInt(rng, 1000, 100000),
    materials: generatePlanetMaterials(rng, { id: 'rocky' }),
  };
}

function generateAsteroid(rng, parentId, rootLetter, orbitIndex, orbitRadius) {
  const isValuable = rng() < 0.15;
  return {
    id: `${parentId}_a${Math.floor(rng() * 1000000)}`,
    type: BODY_TYPES.ASTEROID,
    designation: `${rootLetter} ${orbitIndex} - Stray`,
    name: `Stray Asteroid`,
    color: isValuable ? '#ffaa44' : '#554433',
    radius: randFloat(rng, 0.001, 0.05),
    orbitRadius: orbitRadius + randFloat(rng, -2, 2),
    orbitPeriod: Math.pow(orbitRadius, 1.5) * randFloat(rng, 50, 100),
    parent: parentId,
    scanValue: Math.round(randInt(rng, 500, 5000)),
    scanned: false,
    discovered: false,
    valuable: isValuable,
    materials: isValuable ? generateValuableMaterials(rng) : generatePlanetMaterials(rng, { id: 'rocky' }),
  };
}

function generateRing(rng, parentId) {
  return {
    id: `${parentId}_ring`,
    type: BODY_TYPES.RING,
    designation: 'Ring',
    name: 'Planetary Ring',
    color: '#aa9988',
    radius: 0,
    orbitRadius: 0,
    parent: parentId,
    scanValue: Math.round(randInt(rng, 2000, 15000)),
    scanned: false,
    discovered: false,
    ringType: pick(rng, ['rocky', 'icy', 'metallic']),
    materials: generatePlanetMaterials(rng, { id: 'rocky' }),
  };
}

export function generatePlanetMaterials(rng, planetType) {
  // Materials available for mining from this body
  const allMaterials = [
    { id: 'iron', chance: 0.8 },
    { id: 'silicon', chance: 0.7 },
    { id: 'carbon', chance: 0.5 },
    { id: 'water', chance: 0.3 },
    { id: 'nickel', chance: 0.6 },
    { id: 'phosphorus', chance: 0.4 },
    { id: 'sulphur', chance: 0.5 },
    { id: 'chromium', chance: 0.3 },
    { id: 'manganese', chance: 0.3 },
    { id: 'zinc', chance: 0.25 },
    { id: 'germanium', chance: 0.2 },
    { id: 'tin', chance: 0.15 },
    { id: 'tungsten', chance: 0.15 },
    { id: 'mercury', chance: 0.1 },
    { id: 'platinum', chance: 0.08 },
    { id: 'palladium', chance: 0.06 },
    { id: 'iridium', chance: 0.04 },
    { id: 'painite', chance: 0.02 },
    { id: 'pristine_diamond', chance: 0.05 },
    { id: 'low_temp_diamond', chance: 0.04 },
    { id: 'tritium', chance: 0.06 },
    { id: 'bromellite', chance: 0.03 },
    { id: 'void_opals', chance: 0.02 },
    { id: 'alexandrite', chance: 0.03 },
    { id: 'core_minerals', chance: 0.1 },
  ];

  // Icy bodies have more water/ice materials
  const isIcy = planetType.id === 'icy' || planetType.id === 'rocky_ice';
  // Metal-rich bodies have more metals
  const isMetal = planetType.id === 'metal_rich' || planetType.id === 'high_metal_content';

  const materials = [];
  for (const mat of allMaterials) {
    let chance = mat.chance;
    if (isIcy && ['water', 'low_temp_diamond'].includes(mat.id)) chance *= 3;
    if (isMetal && ['iron', 'nickel', 'platinum', 'palladium', 'iridium'].includes(mat.id)) chance *= 2;

    if (rng() < chance) {
      materials.push({
        id: mat.id,
        concentration: randFloat(rng, 0.5, 25),
      });
    }
  }

  return materials;
}

function generateValuableMaterials(rng) {
  const valuable = ['painite', 'pristine_diamond', 'low_temp_diamond', 'void_opals', 'alexandrite', 'tritium', 'bromellite', 'platinum', 'palladium', 'iridium'];
  const count = randInt(rng, 1, 3);
  const materials = [];
  for (let i = 0; i < count; i++) {
    const id = pick(rng, valuable);
    materials.push({ id, concentration: randFloat(rng, 5, 40) });
  }
  return materials;
}

function generateStations(rng, seed, bodies, population = 0) {
  const stations = [];
  // Find landable planets and habitable worlds for stations
  let suitableBodies = bodies.filter(b =>
    b.type === BODY_TYPES.PLANET &&
    (b.landable || b.habitable || b.terraformed)
  );

  // Fallback: if no suitable bodies, use any planet
  if (suitableBodies.length === 0) {
    suitableBodies = bodies.filter(b => b.type === BODY_TYPES.PLANET);
  }

  // No planets at all — only populated systems get a star-orbiting station fallback.
  // Uninhabited systems with no planets simply have no stations (players colonize later).
  if (suitableBodies.length === 0) {
    if (population > 0) {
      const primaryStar = bodies.find(b => b.type === BODY_TYPES.STAR);
      if (primaryStar) {
        stations.push({
          id: 'station_0',
          name: generateStationName(seed, 0),
          parentId: primaryStar.id,
          parentName: primaryStar.name,
          type: 'coriolis',
          isOrbital: true,
          stationOrbitRadius: randFloat(rng, 5, 15),
          distanceFromStar: 0,
          economy: pickWeighted(rng, ECONOMY_TYPES.map(e => ({ value: e, weight: 1 }))),
          services: { market: true, refuel: true, repair: true, rearm: false, shipyard: false, outfitting: false, missions: true, exploration: true, cartographics: true, contact: false },
        });
      }
    }
    return stations;
  }

  // Populated systems always have at least one station.
  // Uninhabited systems may have zero stations — players colonize them later.
  const stationCount = population > 0
    ? Math.min(suitableBodies.length, Math.max(1, randInt(rng, 1, 4)))
    : Math.min(suitableBodies.length, randInt(rng, 0, 2));

  for (let i = 0; i < stationCount; i++) {
    const body = suitableBodies[i];
    const stationType = pickWeighted(rng, [
        { value: 'coriolis', weight: 30 },
        { value: 'orbis', weight: 20 },
        { value: 'outpost', weight: 25 },
        { value: 'planetary', weight: 15 },
        { value: 'megaship', weight: 5 },
        { value: 'asteroid', weight: 5 },
      ]);
    stations.push({
      id: `station_${i}`,
      name: generateStationName(seed, i),
      parentId: body.id,
      parentName: body.name,
      type: stationType,
      isOrbital: stationType !== 'planetary',
      stationOrbitRadius: stationType !== 'planetary' ? randFloat(rng, 2, 5) * (body.radius + 1) : 0,
      distanceFromStar: body.orbitRadius,
      economy: pickWeighted(rng, ECONOMY_TYPES.map(e => ({ value: e, weight: 1 }))),
      services: {
        market: true,
        refuel: rng() < 0.8,
        repair: rng() < 0.7,
        rearm: rng() < 0.5,
        shipyard: rng() < 0.3,
        outfitting: rng() < 0.4,
        missions: true,
        exploration: rng() < 0.6,
        cartographics: rng() < 0.5,
        contact: rng() < 0.3,
      },
    });
  }

  return stations;
}

// Calculate total scan value of a system (for exploration data selling)
export function getSystemScanValue(system) {
  let total = 0;
  for (const body of system.bodies) {
    total += body.scanValue || 0;
  }
  return total;
}

// Get materials available at a body for mining
export function getBodyMaterials(body) {
  return body.materials || [];
}