// Procedural name generation for stars, systems, bodies, stations, and factions
import { makeRng, randInt, pick, shuffle } from './prng';

const STAR_PREFIXES = ['LHS', 'BD', 'CD', 'CPD', 'HD', 'HR', 'GJ', 'Wolf', 'Ross', 'Gliese', 'LP', 'TYC', 'UGCS', 'WASP', 'KOI'];
const PROPER_PREFIXES = ['A', 'E', 'I', 'O', 'U', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

const PROPER_ROOTS = ['ara', 'bel', 'cor', 'dec', 'elt', 'far', 'gib', 'har', 'ix', 'jor', 'kel', 'lya', 'mor', 'ner', 'osc', 'pri', 'qua', 'rho', 'sig', 'tau', 'uma', 'vel', 'wol', 'xan', 'yth', 'zor'];
const PROPER_SUFFIXES = ['ia', 'us', 'ar', 'on', 'is', 'ax', 'or', 'en', 'um', 'ai', 'os', 'ir', 'an', 'es', 'yx', 'oth'];

const STATION_PREFIXES = ['Port', 'Station', 'Hub', 'Dock', 'Gateway', 'Terminal', 'Outpost', 'Beacon', 'Anchor', 'Refinery', 'Hubbard', 'Ring'];
const STATION_ROOTS = ['Armstrong', 'Belmont', 'Coriolis', 'Daedalus', 'Eden', 'Faraday', 'Gagarin', 'Hadley', 'Icarus', 'Jansen', 'Kepler', 'Li', 'Marlow', 'Niven', 'Oberth', 'Pioneer', 'Quill', 'Ridley', 'Sagan', 'Triton', 'Ulrich', 'Voss', 'Whitley', 'Xavier', 'Yamato', 'Zephyr'];

function generateProperName(rng) {
  const parts = randInt(rng, 1, 3);
  let name = '';
  for (let i = 0; i < parts; i++) {
    const pre = pick(rng, PROPER_PREFIXES);
    const root = pick(rng, PROPER_ROOTS);
    const suf = pick(rng, PROPER_SUFFIXES);
    name += pre + root + suf;
    if (i < parts - 1) name += ' ';
  }
  return name;
}

// Generate a star system name from its seed
export function generateSystemName(seed) {
  const rng = makeRng(seed + ':name');
  // 30% chance of a proper name, 70% chance of a catalog designation
  if (rng() < 0.3) {
    return generateProperName(rng);
  }
  const prefix = pick(rng, STAR_PREFIXES);
  const number = randInt(rng, 100, 99999);
  return `${prefix} ${number}`;
}

// Generate a station name
export function generateStationName(seed, index) {
  const rng = makeRng(seed + ':station:' + index);
  const root = pick(rng, STATION_ROOTS);
  const suffix = pick(rng, STATION_PREFIXES);
  if (rng() < 0.5) {
    return `${root} ${suffix}`;
  }
  return `${suffix} ${root}`;
}

// Generate a body designation (e.g. "A 1", "B 2 a")
export function generateBodyDesignation(rootLetter, orbitIndex, moonLetter) {
  let name = rootLetter;
  if (orbitIndex !== null) name += ` ${orbitIndex}`;
  if (moonLetter) name += moonLetter;
  return name;
}

// Generate a body proper name (for notable bodies)
export function generateBodyName(seed) {
  const rng = makeRng(seed + ':bodyname');
  if (rng() < 0.15) {
    // Named after mythology/science
    const roots = ['Aether', 'Boreas', 'Caelus', 'Demeter', 'Erebus', 'Fornax', 'Gaia', 'Helios', 'Inferna', 'Janus', 'Kronos', 'Lethe', 'Morpheus', 'Nyx', 'Orcus', 'Phobos', 'Quirinus', 'Rhea', 'Styx', 'Tartarus', 'Urania', 'Vesta', 'Wraith', 'Xenon', 'Ymir', 'Zeus'];
    return pick(rng, roots);
  }
  return null;
}

// Faction names
export function generateFactionName(seed) {
  const rng = makeRng(seed + ':faction');
  const types = ['Union', 'Consortium', 'Syndicate', 'Republic', 'Collective', 'Dominion', 'Council', 'League', 'Federation', 'Pact', 'Conglomerate', 'Authority'];
  const roots = ['Aurora', 'Bright', 'Crimson', 'Dark', 'Eastern', 'Free', 'Golden', 'Helionic', 'Iron', 'Jovian', 'Keplerian', 'Lunar', 'Meridian', 'Nova', 'Orion', 'Polar', 'Quasar', 'Rift', 'Solar', 'Terminus', 'Umbra', 'Vega', 'Western', 'Xeno', 'Zenith'];
  const root = pick(rng, roots);
  const type = pick(rng, types);
  if (rng() < 0.4) {
    return `${root} ${type}`;
  }
  const root2 = pick(rng, shuffle(rng, [...roots])).slice(0, 3);
  return `${root}-${root2} ${type}`;
}