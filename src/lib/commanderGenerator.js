// Procedural Commander Generator — produces unique NPC commander names so the
// same pilot never appears twice at once. A name is excluded while its NPC is
// still "there" (passed in as the active-names set), and a bounded recent-
// history buffer prevents a freshly-departed name from reappearing too soon,
// giving the galaxy a feel of distinct, non-repeating individuals.

const GIVEN = [
  'Vex', 'Korra', 'Dax', 'Rima', 'Solon', 'Tova', 'Nyx', 'Orin', 'Pax', 'Lira',
  'Mira', 'Garr', 'Sable', 'Wren', 'Cade', 'Iolo', 'Rusk', 'Hela', 'Bram', 'Jovan',
  'Sera', 'Kade', 'Nima', 'Roan', 'Thal', 'Yara', 'Quill', 'Bex', 'Dru', 'Eska',
  'Falke', 'Glen', 'Hawk', 'Iren', 'Jorah', 'Kael', 'Lyra', 'Maren', 'Nox', 'Oryn',
  'Petra', 'Rune', 'Sable', 'Tarn', 'Ula', 'Voss', 'Wren', 'Xan', 'Ysol', 'Zara',
];

const ONSETS = ['K', 'V', 'R', 'T', 'M', 'S', 'N', 'Z', 'D', 'L', 'B', 'G', 'P', 'H', 'J', 'C', 'Th', 'Vr', 'Kr', 'St', 'Zr', 'Sk', 'Br', 'Dr', 'Gr', 'Tr', 'Qu'];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'ae', 'io', 'ei', 'ou', 'ya', 'ia', 'oo'];
const CODAS = ['n', 'r', 's', 'k', 'x', 'th', 'm', 'l', 'd', 'g', 'v', 'nn', 'ss', 'll', 'rk', 'sh', 'nt', 'dr'];

const RECENT_CAP = 400;
const recentNames = [];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeSyllable(closed) {
  let s = pick(ONSETS) + pick(VOWELS);
  if (closed && Math.random() < 0.6) s += pick(CODAS);
  return s;
}

function makeSurname() {
  const n = 2 + (Math.random() < 0.35 ? 1 : 0);
  let s = '';
  for (let i = 0; i < n; i++) s += makeSyllable(i === n - 1);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function makeGiven() {
  // ~70% curated given name, ~30% procedural given name for variety
  if (Math.random() < 0.7) return pick(GIVEN);
  const s = makeSyllable(true) + makeSyllable(false);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildName() {
  return `CMDR ${makeGiven()} ${makeSurname()}`;
}

// Generate a commander name not present in `activeNames` (currently on screen)
// and not recently issued. Returns { name }.
export function generateCommander(activeNames) {
  const excluded = activeNames instanceof Set ? activeNames : new Set(activeNames || []);
  for (let i = 0; i < 60; i++) {
    const name = buildName();
    if (excluded.has(name) || recentNames.includes(name)) continue;
    recentNames.push(name);
    if (recentNames.length > RECENT_CAP) recentNames.shift();
    return { name };
  }
  // Vanishingly unlikely fallback — guarantee uniqueness with a suffix.
  let n = buildName();
  let suffix = 2;
  while (excluded.has(n) || recentNames.includes(n)) n = `${buildName()}-${suffix++}`;
  recentNames.push(n);
  if (recentNames.length > RECENT_CAP) recentNames.shift();
  return { name: n };
}

export function _recentCountForTest() { return recentNames.length; }