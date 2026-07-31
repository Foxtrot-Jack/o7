// Deterministic seeded PRNG utilities for procedural generation

// Hash a string into a 128-bit seed (cyrb128)
export function hashSeed(str) {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Mulberry32 PRNG — fast, good quality, returns a function producing [0,1)
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Create a PRNG from any seed input (number, string, or array of numbers)
export function makeRng(seedInput) {
  if (typeof seedInput === 'number') {
    return mulberry32(seedInput);
  }
  if (Array.isArray(seedInput)) {
    return mulberry32(hashSeed(seedInput.join(',')));
  }
  return mulberry32(hashSeed(String(seedInput)));
}

// Helper: random integer in [min, max] inclusive
export function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Helper: random float in [min, max)
export function randFloat(rng, min, max) {
  return rng() * (max - min) + min;
}

// Helper: pick from an array
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// Helper: pick from a weighted array of {value, weight}
export function pickWeighted(rng, weighted) {
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let r = rng() * total;
  for (const item of weighted) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return weighted[weighted.length - 1].value;
}

// Helper: shuffle array in place
export function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}