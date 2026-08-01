// Galaxy generation — ~4 billion procedurally generated stars
// Stars are generated on-demand from sector seeds, never stored all at once.
import { makeRng, randInt, randFloat, hashSeed, pickWeighted } from './prng';
import { generateSystemName } from './names';

// Galaxy dimensions — the galaxy is a disk with spiral arms
// Coordinate space: x,y in [-GALACTIC_RADIUS, GALACTIC_RADIUS], z in [-GALACTIC_HEIGHT, GALACTIC_HEIGHT]
export const GALACTIC_RADIUS = 20000;
export const GALACTIC_HEIGHT = 800;
export const SECTOR_SIZE = 8; // light-years per sector edge
export const SECTOR_STAR_DENSITY = 2.5; // average stars per sector

// The galaxy has 4 spiral arms
export const GALAXY_ARMS = 4;
export const GALAXY_TWIST = 0.0004; // radians per unit radius

// Star spectral classes (like Elite's star types)
export const STAR_CLASSES = [
  { class: 'O', color: '#9bb0ff', temp: [30000, 50000], weight: 0.5, radius: [6.6, 15], name: 'Blue Supergiant' },
  { class: 'B', color: '#aabfff', temp: [10000, 30000], weight: 2, radius: [1.8, 6.6], name: 'Blue Giant' },
  { class: 'A', color: '#cad7ff', temp: [7500, 10000], weight: 5, radius: [1.4, 1.8], name: 'White Star' },
  { class: 'F', color: '#f8f7ff', temp: [6000, 7500], weight: 8, radius: [1.15, 1.4], name: 'Yellow-White Star' },
  { class: 'G', color: '#fff4ea', temp: [5200, 6000], weight: 12, radius: [0.96, 1.15], name: 'Yellow Star' },
  { class: 'K', color: '#ffd2a1', temp: [3700, 5200], weight: 20, radius: [0.7, 0.96], name: 'Orange Dwarf' },
  { class: 'M', color: '#ffcc6f', temp: [2400, 3700], weight: 50, radius: [0.1, 0.7], name: 'Red Dwarf' },
  { class: 'L', color: '#ff8866', temp: [1300, 2400], weight: 1.5, radius: [0.08, 0.12], name: 'Brown Dwarf' },
  { class: 'T', color: '#cc6644', temp: [500, 1300], weight: 0.5, radius: [0.06, 0.1], name: 'Methane Dwarf' },
];

// Non-main-sequence special star types
export const SPECIAL_STARS = [
  { class: 'NS', color: '#cccccc', temp: [600000, 1000000], weight: 0.1, radius: [0.00001, 0.00002], name: 'Neutron Star' },
  { class: 'WD', color: '#eeeeff', temp: [10000, 100000], weight: 0.8, radius: [0.008, 0.02], name: 'White Dwarf' },
  { class: 'BH', color: '#330000', temp: [0, 0], weight: 0.05, radius: [0.0001, 0.001], name: 'Black Hole' },
  { class: 'RG', color: '#ff4422', temp: [3000, 4000], weight: 0.3, radius: [20, 100], name: 'Red Giant' },
];

export const ALL_STAR_CLASSES = [...STAR_CLASSES, ...SPECIAL_STARS];

// Populated bubbles — regions of space with guaranteed inhabited systems
// Like Elite Dangerous's "Core Systems" (the bubble) and Colonia region
export const BUBBLE_CENTERS = [
  {
    name: 'The Core Worlds',
    x: 6000, y: 3000, z: 0,
    radius: 200,
    minPop: 100000,
    maxPop: 20000000000,
    popChance: 0.85,
  },
  {
    name: 'The Coreward Reach',
    x: 800, y: -600, z: 50,
    radius: 100,
    minPop: 50000,
    maxPop: 5000000000,
    popChance: 0.75,
  },
];

// Distance helper
export function distance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Given a 3D position, compute the galactic density (spiral arm structure)
function galacticDensity(x, y, z) {
  const r = Math.sqrt(x * x + y * y);
  if (r > GALACTIC_RADIUS) return 0;

  // Disk thickness falloff
  const zFalloff = Math.exp(-(z * z) / (2 * GALACTIC_HEIGHT * GALACTIC_HEIGHT));

  // Spiral arm structure
  const baseAngle = Math.atan2(y, x);
  let armIntensity = 0;
  for (let arm = 0; arm < GALAXY_ARMS; arm++) {
    const armOffset = (arm / GALAXY_ARMS) * Math.PI * 2;
    const spiralAngle = armOffset + r * GALAXY_TWIST;
    const angleDiff = Math.abs(((baseAngle - spiralAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    // Closer to arm center = higher density
    const armWidth = 0.3 + 0.1 * (r / GALACTIC_RADIUS);
    armIntensity += Math.exp(-(angleDiff * angleDiff) / (2 * armWidth * armWidth));
  }

  // Central bulge
  const bulge = Math.exp(-(r * r) / (2 * 2000 * 2000)) * 3;

  // Outer falloff
  const outerFalloff = Math.exp(-Math.pow((r - GALACTIC_RADIUS * 0.4) / (GALACTIC_RADIUS * 0.5), 2));

  return (armIntensity + bulge) * zFalloff * outerFalloff;
}

// Check if a position falls within a populated bubble and return its population.
// Returns null if not in any bubble (caller uses normal random population).
function getBubblePopulation(x, y, z) {
  for (const bubble of BUBBLE_CENTERS) {
    const dist = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2 + (z - bubble.z) ** 2);
    if (dist <= bubble.radius) {
      const fade = 1 - (dist / bubble.radius) * 0.5; // 1.0 at center, 0.5 at edge
      // Deterministic population from position hash — doesn't consume star RNG
      const posHash = hashSeed(`bubpop:${Math.round(x)},${Math.round(y)},${Math.round(z)}`);
      const rng = makeRng(posHash);
      if (rng() < bubble.popChance * fade) {
        return Math.max(bubble.minPop, Math.floor(randInt(rng, bubble.minPop, bubble.maxPop) * fade));
      }
      return 0;
    }
  }
  return null;
}

// Generate stars in a single sector
export function generateSectorStars(sx, sy, sz) {
  const sectorSeed = hashSeed(`sector:${sx},${sy},${sz}`);
  const rng = makeRng(sectorSeed);

  const density = galacticDensity(
    sx * SECTOR_SIZE + SECTOR_SIZE / 2,
    sy * SECTOR_SIZE + SECTOR_SIZE / 2,
    sz * SECTOR_SIZE + SECTOR_SIZE / 2
  );

  if (density < 0.05) return [];

  const expectedStars = SECTOR_STAR_DENSITY * density * SECTOR_SIZE * SECTOR_SIZE / 64;
  const numStars = Math.max(0, Math.round(expectedStars * (0.7 + rng() * 0.6)));

  const stars = [];
  for (let i = 0; i < numStars; i++) {
    const starSeed = hashSeed(`star:${sx},${sy},${sz}:${i}`);
    const starRng = makeRng(starSeed);

    const x = sx * SECTOR_SIZE + starRng() * SECTOR_SIZE;
    const y = sy * SECTOR_SIZE + starRng() * SECTOR_SIZE;
    const z = sz * SECTOR_SIZE + (starRng() - 0.5) * SECTOR_SIZE * 0.5;

    const starClass = pickWeighted(starRng,
      ALL_STAR_CLASSES.map(c => ({ value: c, weight: c.weight }))
    );

    // Population — boosted within populated bubbles, otherwise random
    const bubblePop = getBubblePopulation(x, y, z);
    const population = bubblePop !== null
      ? bubblePop
      : (starRng() < 0.4 ? randInt(starRng, 1000, 2000000000) : 0);

    stars.push({
      id: `${sx},${sy},${sz}:${i}`,
      seed: starSeed,
      x, y, z,
      name: generateSystemName(starSeed),
      starClass,
      // System-level properties generated lazily but we can pre-generate a few
      security: pickWeighted(starRng, [
        { value: 'high', weight: 15 },
        { value: 'medium', weight: 40 },
        { value: 'low', weight: 30 },
        { value: 'anarchy', weight: 15 },
      ]),
      population,
      visited: false,
    });
  }

  return stars;
}

// Generate stars in a radius around a point (for the galaxy map)
export function generateStarsInRange(centerX, centerY, centerZ, radius) {
  const allStars = [];
  const minSX = Math.floor((centerX - radius) / SECTOR_SIZE);
  const maxSX = Math.ceil((centerX + radius) / SECTOR_SIZE);
  const minSY = Math.floor((centerY - radius) / SECTOR_SIZE);
  const maxSY = Math.ceil((centerY + radius) / SECTOR_SIZE);
  const minSZ = Math.floor((centerZ - radius) / SECTOR_SIZE);
  const maxSZ = Math.ceil((centerZ + radius) / SECTOR_SIZE);

  for (let sx = minSX; sx <= maxSX; sx++) {
    for (let sy = minSY; sy <= maxSY; sy++) {
      for (let sz = minSZ; sz <= maxSZ; sz++) {
        const stars = generateSectorStars(sx, sy, sz);
        for (const star of stars) {
          const dist = distance3D(
            { x: star.x, y: star.y, z: star.z },
            { x: centerX, y: centerY, z: centerZ }
          );
          if (dist <= radius) {
            allStars.push(star);
          }
        }
      }
    }
  }

  // Inject landmark systems + starting system if within range
  const injectableSystems = [...LANDMARK_SYSTEMS, STARTING_SYSTEM];
  for (const landmark of injectableSystems) {
    const dist = distance3D(
      { x: landmark.x, y: landmark.y, z: landmark.z },
      { x: centerX, y: centerY, z: centerZ }
    );
    if (dist <= radius) {
      allStars.push({ ...landmark });
    }
  }

  return allStars;
}

// The player's starting system — a fixed, known-good system
export const STARTING_SYSTEM = {
  id: 'start:0',
  seed: hashSeed('player_start_system'),
  x: GALACTIC_RADIUS * 0.3,
  y: GALACTIC_RADIUS * 0.15,
  z: 0,
  name: 'Deciat Reach',
  starClass: STAR_CLASSES[5], // K class
  security: 'medium',
  population: 4500000000,
  visited: true,
};

// Sol — humanity's lost cradle, hidden far from the starting system
export const SOL_SEED = hashSeed('sol_system_hidden');
export const SOL_SYSTEM = {
  id: 'sol',
  seed: SOL_SEED,
  x: -5500,
  y: -4200,
  z: 320,
  name: 'Sol',
  starClass: STAR_CLASSES[4], // G class — yellow star
  security: 'high',
  population: 20000000000,
  visited: false,
  isSol: true,
};

// Cradle's End — a populated hub near the galactic core (Colonia equivalent)
// A distant civilized region serving as a staging point for core exploration.
export const COLONIA_SEED = hashSeed('cradles_end_hub');
export const COLONIA_SYSTEM = {
  id: 'cradles_end',
  seed: COLONIA_SEED,
  x: 800,
  y: -600,
  z: 50,
  name: "Cradle's End",
  starClass: STAR_CLASSES[4], // G class
  security: 'high',
  population: 8500000000,
  visited: false,
  isLandmark: true,
};

// Vagrant's Horizon — the furthest inhabited outpost from the starting bubble
// (Bernard's Star equivalent) — a lonely station at the galactic rim.
export const FAR_REACH_SEED = hashSeed('vagrants_horizon_outpost');
export const FAR_REACH_SYSTEM = {
  id: 'vagrants_horizon',
  seed: FAR_REACH_SEED,
  x: -17000,
  y: -8500,
  z: 0,
  name: "Vagrant's Horizon",
  starClass: STAR_CLASSES[6], // M class — red dwarf
  security: 'low',
  population: 750000,
  visited: false,
  isLandmark: true,
};

// All landmark systems injected into star queries
export const LANDMARK_SYSTEMS = [SOL_SYSTEM, COLONIA_SYSTEM, FAR_REACH_SYSTEM];

// Get the color for a star class
export function getStarColor(starClass) {
  return starClass.color;
}

// Total estimated star count (for flavor text)
export const TOTAL_STARS_ESTIMATE = '4,000,000,000+';

// Generate overview points sampling the galaxy's spiral structure (for galaxy-wide view)
export function generateGalaxyOverview() {
  const points = [];
  const step = GALACTIC_RADIUS / 80;
  const rng = makeRng(hashSeed('galaxy_overview'));
  for (let x = -GALACTIC_RADIUS; x <= GALACTIC_RADIUS; x += step) {
    for (let y = -GALACTIC_RADIUS; y <= GALACTIC_RADIUS; y += step) {
      const density = galacticDensity(x, y, 0);
      if (density > 0.05) {
        const zJitter = (rng() - 0.5) * GALACTIC_HEIGHT * 0.3;
        points.push({ x, y, z: zJitter, density });
      }
    }
  }
  return points;
}