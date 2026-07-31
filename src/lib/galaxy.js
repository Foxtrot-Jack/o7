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
      population: starRng() < 0.4 ? randInt(starRng, 1000, 2000000000) : 0,
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