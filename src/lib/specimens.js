// Fish and flora specimen generation
const FISH_PATTERNS = ['solid', 'striped', 'spotted', 'gradient', 'bioluminescent'];
const FISH_SHAPES = ['oval', 'elongated', 'round', 'angular', 'serpentine'];
const FISH_PREFIXES = ['Luminous', 'Abyssal', 'Crimson', 'Azure', 'Golden', 'Phantom', 'Prismatic', 'Verdant', 'Onyx', 'Coral', 'Silver', 'Violet'];
const FISH_NAMES = ['Finback', 'Glimmerwing', 'Depthstalker', 'Tidecaller', 'Scalewing', 'Voidfish', 'Starfin', 'Reefglider', 'Abyssray', 'Currentskipper', 'Shimmerfin', 'Duskleaper'];

const FLORA_PREFIXES = ['Crystal', 'Bio', 'Star', 'Void', 'Neon', 'Frost', 'Solar', 'Lunar', 'Spore', 'Pulse', 'Ghost', 'Ember'];
const FLORA_NAMES = ['Bloom', 'Frond', 'Cluster', 'Blossom', 'Vine', 'Pod', 'Sprout', 'Thorn', 'Petal', 'Stalk', 'Mycelium', 'Lichen'];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick(arr, seed) {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export function generateFish(body, systemName) {
  const seed = (body?.id || 'fish').split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now() % 10000;
  const hue = Math.floor(seededRandom(seed) * 360);
  return {
    id: `fish_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    type: 'fish',
    species: `${pick(FISH_PREFIXES, seed)} ${pick(FISH_NAMES, seed + 1)}`,
    color: hslToRgb(hue, 70, 50),
    size: 0.5 + seededRandom(seed + 2) * 1.5,
    pattern: pick(FISH_PATTERNS, seed + 3),
    shape: pick(FISH_SHAPES, seed + 4),
    originSystem: systemName,
    originBody: body?.name || body?.designation || 'Unknown',
    originType: body?.planetType || 'water_world',
    collectedAt: Date.now(),
    edited: false,
  };
}

export function generateFlora(signal, body, systemName) {
  const seed = (signal?.id || 'flora').split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now() % 10000;
  const hue = Math.floor(seededRandom(seed) * 360);
  return {
    id: `flora_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    type: 'flora',
    species: `${pick(FLORA_PREFIXES, seed)} ${pick(FLORA_NAMES, seed + 1)}`,
    color: hslToRgb(hue, 60, 45),
    size: 0.3 + seededRandom(seed + 2) * 1.2,
    pattern: pick(FISH_PATTERNS, seed + 3),
    originSystem: systemName,
    originBody: body?.name || body?.designation || 'Unknown',
    signalType: signal?.type || 'biological',
    collectedAt: Date.now(),
    edited: false,
  };
}

export const SPECIMEN_PATTERNS = FISH_PATTERNS;
export const SPECIMEN_SHAPES = FISH_SHAPES;