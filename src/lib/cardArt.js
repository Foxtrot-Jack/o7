// Procedural card art — pure data + deterministic generators.
// Each card renders: a manufacturer glyph (primary, decks stay themed) over a
// starfield seeded by the origin system, plus a planet sigil colored by that
// system's dominant planet type. Population drives starfield density; faction
// drives the accent tint. Cards with no stored origin fall back to a seed
// derived from the card id itself, so every card still looks distinct.
import { PLANET_TYPES } from './system';

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Manufacturer glyphs — SVG shape descriptors in a 24x24 space, rendered with a
// stroke (no fill) to match the wireframe CRT aesthetic. Each is distinct so a
// deck reads as its manufacturer at a glance.
export const MFR_GLYPHS = {
  drake_voss: [
    { t: 'path', d: 'M3 13 L12 5 L21 13' },
    { t: 'path', d: 'M6 17 L12 11 L18 17' },
  ],
  orion_heavy: [
    { t: 'path', d: 'M4 6 V18 H20 V6 Z' },
    { t: 'line', x1: 4, y1: 10, x2: 20, y2: 10 },
    { t: 'line', x1: 4, y1: 14, x2: 20, y2: 14 },
    { t: 'line', x1: 12, y1: 6, x2: 12, y2: 18 },
  ],
  sentinel_forge: [
    { t: 'path', d: 'M12 3 L20 6 V11 C20 16 16 19 12 21 C8 19 4 16 4 11 V6 Z' },
    { t: 'path', d: 'M8.5 11.5 L11 14 L15.5 9' },
  ],
  kepler: [
    { t: 'path', d: 'M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z' },
    { t: 'circle', cx: 12, cy: 12, r: 1.4 },
  ],
  meridian: [
    { t: 'path', d: 'M12 3 L21 12 L12 21 L3 12 Z' },
    { t: 'path', d: 'M12 8 L16 12 L12 16 L8 12 Z' },
  ],
  solaris: [
    { t: 'circle', cx: 12, cy: 12, r: 3.6 },
    { t: 'line', x1: 12, y1: 3, x2: 12, y2: 6 },
    { t: 'line', x1: 12, y1: 18, x2: 12, y2: 21 },
    { t: 'line', x1: 3, y1: 12, x2: 6, y2: 12 },
    { t: 'line', x1: 18, y1: 12, x2: 21, y2: 12 },
    { t: 'line', x1: 5.6, y1: 5.6, x2: 7.7, y2: 7.7 },
    { t: 'line', x1: 16.3, y1: 16.3, x2: 18.4, y2: 18.4 },
    { t: 'line', x1: 18.4, y1: 5.6, x2: 16.3, y2: 7.7 },
    { t: 'line', x1: 7.7, y1: 16.3, x2: 5.6, y2: 18.4 },
  ],
  proxima: [
    { t: 'path', d: 'M12 3 L20 8 V16 L12 21 L4 16 V8 Z' },
    { t: 'path', d: 'M12 8 L16 12 L12 16 L8 12 Z' },
  ],
  omega: [
    { t: 'path', d: 'M6 9 C6 5 18 5 18 9 C18 13 12 13 12 18' },
    { t: 'line', x1: 8, y1: 18, x2: 16, y2: 18 },
  ],
  canis_stella: [
    { t: 'path', d: 'M12 3 L14.2 9 L21 9.3 L15.5 14 L17.5 21 L12 17 L6.5 21 L8.5 14 L3 9.3 L9.8 9 Z' },
  ],
  special: [
    { t: 'path', d: 'M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z' },
    { t: 'circle', cx: 12, cy: 12, r: 1.3 },
  ],
};

const PLANET_COLOR = PLANET_TYPES.reduce((m, t) => { m[t.id] = t.color; return m; }, {});
const DEFAULT_PLANET_COLOR = '#9a8a78';

export function planetColorFor(typeId) {
  return PLANET_COLOR[typeId] || DEFAULT_PLANET_COLOR;
}

const FACTION_PALETTE = ['#5aa0ff', '#ff7a3a', '#b464ff', '#5aa070', '#c89030', '#d05050', '#50c0c0'];
const SECURITY_ACCENT = { high: '#5aa0ff', medium: '#c89030', low: '#ff7a3a', anarchy: '#b464ff' };

function accentFor(origin, rng) {
  if (origin?.faction) return FACTION_PALETTE[hashStr(origin.faction) % FACTION_PALETTE.length];
  if (origin?.security && SECURITY_ACCENT[origin.security]) return SECURITY_ACCENT[origin.security];
  return FACTION_PALETTE[Math.floor(rng() * FACTION_PALETTE.length)];
}

export function popTierOf(pop) {
  if (pop > 1e9) return 5;
  if (pop > 1e8) return 4;
  if (pop > 1e6) return 3;
  if (pop > 1e4) return 2;
  if (pop > 0) return 1;
  return 0;
}

// Compute every value CardArt needs up front so the component stays a pure render.
export function getCardArt(card, origin) {
  const seed = origin?.systemSeed != null
    ? hashStr(card.id + ':' + origin.systemSeed)
    : hashStr('art_' + card.id);
  const rng = mulberry(seed);

  const tier = origin?.population != null ? popTierOf(origin.population) : Math.floor(rng() * 6);
  const dotCount = 7 + tier * 3 + Math.floor(rng() * 4);
  const dots = [];
  for (let i = 0; i < dotCount; i++) {
    dots.push({ x: +(rng() * 24).toFixed(2), y: +(rng() * 24).toFixed(2), r: rng() < 0.18 ? 0.9 : 0.5 });
  }

  const planetType = origin?.planetType || PLANET_TYPES[Math.floor(rng() * PLANET_TYPES.length)].id;
  const planetColor = planetColorFor(planetType);
  const accent = accentFor(origin, rng);

  return { seed, tier, dots, planetType, planetColor, accent, hasOrigin: !!origin };
}

// Build an origin snapshot from the live game state at the moment a card is
// granted, so the card's art reflects the system it was drawn from.
export function buildCardOrigin(station, state) {
  const sys = state?.currentSystem;
  const sysData = state?.currentSystemData;
  const bodies = sysData?.bodies || [];
  const planets = bodies.filter(b => b.type === 'planet');
  let planetType = 'barren';
  if (planets.length) {
    const counts = {};
    for (const p of planets) counts[p.planetType] = (counts[p.planetType] || 0) + 1;
    planetType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
  return {
    systemSeed: station.systemSeed,
    systemName: station.systemName || sys?.name,
    economy: sysData?.economy?.name || sys?.economy,
    security: sys?.security,
    population: sys?.population,
    faction: sysData?.faction,
    planetType,
    starClass: sys?.starClass?.class,
  };
}