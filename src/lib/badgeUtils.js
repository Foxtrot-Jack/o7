// Badge design system — shapes, symbols, patterns, colors, and share-code utilities

export const SHAPE_PATHS = {
  shield: 'M50 5 L88 15 L88 48 Q88 82 50 95 Q12 82 12 48 L12 15 Z',
  circle: 'M50 5 A45 45 0 1 1 49.9 5 Z',
  hexagon: 'M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z',
  diamond: 'M50 5 L90 50 L50 95 L10 50 Z',
  square: 'M12 5 L88 5 L88 95 L12 95 Z',
  pentagon: 'M50 5 L92 36 L76 90 L24 90 L8 36 Z',
};

export const BADGE_SHAPES = [
  { id: 'shield', name: 'Shield' },
  { id: 'circle', name: 'Circle' },
  { id: 'hexagon', name: 'Hexagon' },
  { id: 'diamond', name: 'Diamond' },
  { id: 'square', name: 'Square' },
  { id: 'pentagon', name: 'Pentagon' },
];

export const BADGE_PATTERNS = [
  { id: 'solid', name: 'Solid' },
  { id: 'split', name: 'Split' },
  { id: 'quartered', name: 'Quartered' },
  { id: 'striped', name: 'Striped' },
];

export const BADGE_SYMBOLS = [
  { id: 'none', name: 'None', path: null },
  { id: 'star', name: 'Star', path: 'M50 18 L57 38 L78 38 L61 51 L67 72 L50 59 L33 72 L39 51 L22 38 L43 38 Z' },
  { id: 'rocket', name: 'Rocket', path: 'M50 18 C55 18 60 28 60 42 L60 62 L65 72 L60 72 L60 82 L55 82 L55 76 L45 76 L45 82 L40 82 L40 72 L35 72 L40 62 L40 42 C40 28 45 18 50 18 Z M44 42 A3 3 0 1 1 44 41.9 Z M56 42 A3 3 0 1 1 56 41.9 Z' },
  { id: 'planet', name: 'Planet', path: 'M50 38 A12 12 0 1 1 49.9 38 Z M28 50 Q50 62 72 50 Q50 66 28 50 Z' },
  { id: 'skull', name: 'Skull', path: 'M50 22 C37 22 28 33 28 46 L28 60 L36 60 L36 70 L44 70 L44 60 L56 60 L56 70 L64 70 L64 60 L72 60 L72 46 C72 33 63 22 50 22 Z M41 42 A4 4 0 1 1 41 41.9 Z M59 42 A4 4 0 1 1 59 41.9 Z' },
  { id: 'anchor', name: 'Anchor', path: 'M50 22 A5 5 0 1 1 49.9 22 Z M50 27 L50 72 M35 72 Q50 84 65 72 M42 42 L58 42' },
  { id: 'crown', name: 'Crown', path: 'M25 55 L25 72 L75 72 L75 55 L66 42 L57 55 L50 38 L43 55 L34 42 Z' },
  { id: 'wings', name: 'Wings', path: 'M50 35 L50 62 M50 42 L22 50 L18 60 L50 55 M50 42 L78 50 L82 60 L50 55' },
  { id: 'sword', name: 'Sword', path: 'M50 18 L50 62 M43 62 L57 62 M50 62 L50 72 M45 72 L55 72' },
  { id: 'atom', name: 'Atom', path: 'M50 50 M50 45 A5 5 0 1 1 49.9 45 Z M50 50 A28 12 0 1 1 49.9 50 Z M50 50 A28 12 0 1 1 49.9 50.1 Z M50 50 A12 28 0 1 1 49.9 50 Z M50 50 A12 28 0 1 1 49.9 50.1 Z' },
  { id: 'comet', name: 'Comet', path: 'M68 32 A10 10 0 1 1 67.9 32 Z M62 40 L32 68 M64 44 L36 70 M58 38 L30 64' },
  { id: 'spiral', name: 'Galaxy', path: 'M50 50 M48 48 A4 4 0 1 1 47.9 48 Z M50 50 Q60 45 60 55 Q56 64 46 60 Q37 52 44 42 Q58 35 66 48' },
  { id: 'lightning', name: 'Bolt', path: 'M55 18 L37 55 L48 55 L42 80 L63 45 L52 45 L60 18 Z' },
  { id: 'crosshair', name: 'Target', path: 'M50 22 L50 78 M22 50 L78 50 M50 38 A12 12 0 1 1 49.9 38 Z' },
  { id: 'triangle', name: 'Triangle', path: 'M50 22 L75 68 L25 68 Z' },
  { id: 'eye', name: 'Eye', path: 'M25 50 Q50 28 75 50 Q50 72 25 50 Z M50 44 A7 7 0 1 1 49.9 44 Z' },
  { id: 'flag', name: 'Flag', path: 'M37 18 L37 82 M37 22 L70 22 L62 35 L70 48 L37 48' },
  // Animals
  { id: 'eagle', name: 'Eagle', path: 'M50 38 L45 33 L40 38 L22 42 L36 44 L32 52 L42 50 L42 62 L48 67 L48 58 L50 62 L52 58 L52 67 L58 62 L58 50 L68 52 L64 44 L78 42 L60 38 L55 33 Z' },
  { id: 'wolf', name: 'Wolf', path: 'M28 58 L32 40 L36 45 L40 32 L44 38 L50 30 L56 38 L60 32 L64 45 L68 40 L72 58 L66 68 L58 72 L58 62 L54 68 L50 62 L46 68 L42 62 L42 72 L34 68 Z' },
  { id: 'shark', name: 'Shark', path: 'M18 50 L32 44 L50 38 L72 42 L82 50 L72 58 L50 60 L32 54 L28 66 L24 72 L30 56 Z M72 42 L78 34 L74 48 Z' },
  { id: 'serpent', name: 'Serpent', path: 'M22 28 Q38 28 38 42 Q38 56 56 56 Q72 56 72 72 L66 72 Q66 62 56 62 Q32 62 32 42 Q32 34 22 34 Z M72 72 L76 68 L78 76 Z' },
  { id: 'dragon', name: 'Dragon', path: 'M50 22 L44 16 L40 28 L32 22 L36 34 L22 38 L34 40 L28 48 L40 46 L46 54 L50 48 L54 54 L60 46 L72 48 L66 40 L78 38 L64 34 L68 22 L60 28 L56 16 Z M50 54 L44 66 L50 78 L56 66 Z' },
  { id: 'bear', name: 'Bear', path: 'M34 28 L28 22 L26 30 L22 38 L22 58 L28 70 L40 74 L60 74 L72 70 L78 58 L78 38 L74 30 L72 22 L66 28 L60 26 L54 28 L50 26 L46 28 L40 26 Z' },
  { id: 'falcon', name: 'Falcon', path: 'M50 28 L44 22 L40 28 L24 34 L40 36 L34 44 L44 42 L50 48 L56 42 L66 44 L60 36 L76 34 L60 28 L56 22 Z M50 48 L48 62 L52 62 Z' },
  { id: 'octopus', name: 'Octopus', path: 'M34 28 Q50 18 66 28 L66 44 Q72 50 66 56 L60 50 L56 60 L50 50 L44 60 L40 50 L34 56 Q28 50 34 44 Z M66 44 L76 38 M66 50 L78 48 M34 44 L24 38 M34 50 L22 48' },
  { id: 'phoenix', name: 'Phoenix', path: 'M50 18 L44 12 L40 24 L32 18 L38 30 L22 34 L38 36 L32 44 L44 42 L50 52 L56 42 L68 44 L62 36 L78 34 L62 30 L68 18 L60 24 L56 12 Z M50 52 L44 66 L50 80 L56 66 Z' },
  { id: 'spider', name: 'Spider', path: 'M38 38 Q50 32 62 38 L62 52 Q50 58 38 52 Z M38 42 L26 34 M38 48 L24 48 M38 52 L26 60 M62 42 L74 34 M62 48 L76 48 M62 52 L74 60' },
  { id: 'bee', name: 'Bee', path: 'M34 44 Q50 34 66 44 L66 54 Q50 64 34 54 Z M38 38 L28 30 M34 48 L24 48 M38 58 L28 68 M48 42 L48 58 M56 42 L56 58' },
  { id: 'stag', name: 'Stag', path: 'M38 28 L32 16 L30 28 L26 22 L30 32 M62 28 L68 16 L70 28 L74 22 L70 32 M34 32 L44 38 L56 38 L66 32 L66 54 L60 70 L40 70 L34 54 Z' },
  { id: 'raven', name: 'Raven', path: 'M32 32 L26 26 L32 36 L22 40 L36 42 L36 52 L30 64 L42 70 L48 58 L52 70 L64 64 L58 52 L58 42 L72 40 L62 36 L68 26 Z' },
  { id: 'turtle', name: 'Turtle', path: 'M28 44 Q50 34 72 44 L72 54 Q50 64 28 54 Z M24 44 L18 40 M24 54 L18 58 M76 44 L82 40 M76 54 L82 58 M44 54 L44 62 M56 54 L56 62' },
  { id: 'scorpion', name: 'Scorpion', path: 'M26 50 L32 44 L38 50 L44 44 L50 50 L56 44 L62 50 L68 44 L62 54 L56 60 L44 60 L38 54 Z M26 50 L16 40 L12 30 L18 24 M12 30 L24 28 M18 24 L30 30' },
  { id: 'horse', name: 'Horse', path: 'M32 32 L26 22 L24 34 L22 44 L22 60 L28 70 L34 70 L34 54 L50 54 L50 70 L56 70 L60 48 L66 42 L66 32 L60 26 L54 22 L48 28 L42 32 Z' },
  { id: 'owl', name: 'Owl', path: 'M34 22 L28 16 L34 28 M66 22 L72 16 L66 28 M28 28 Q50 22 72 28 L72 50 Q72 70 50 70 Q28 70 28 50 Z M42 42 A5 5 0 1 1 41.9 42 Z M58 42 A5 5 0 1 1 57.9 42 Z' },
  { id: 'cat', name: 'Cat', path: 'M32 28 L26 16 L32 34 M68 28 L74 16 L68 34 M28 34 Q50 28 72 34 L72 54 Q72 70 50 70 Q28 70 28 54 Z M42 42 A4 4 0 1 1 41.9 42 Z M58 42 A4 4 0 1 1 57.9 42 Z M72 50 L82 54 M72 60 L82 58' },
  { id: 'dog', name: 'Dog', path: 'M32 34 L26 22 L24 34 M62 34 L68 22 L70 34 M28 34 Q50 28 70 34 L70 54 Q70 70 50 70 Q28 70 28 54 Z M42 44 A3 3 0 1 1 41.9 44 Z M58 44 A3 3 0 1 1 57.9 44 Z M50 54 L44 62 L56 62 Z' },
  { id: 'fish', name: 'Fish', path: 'M28 50 Q50 34 66 50 Q50 66 28 50 Z M66 50 L80 38 L74 50 L80 62 Z M44 48 A2 2 0 1 1 43.9 48 Z' },
  { id: 'beetle', name: 'Beetle', path: 'M38 34 Q50 28 62 34 L62 54 Q50 70 38 54 Z M38 40 L28 34 M38 50 L26 50 M38 60 L28 66 M62 40 L72 34 M62 50 L74 50 M62 60 L72 66 M50 34 L50 66' },
  { id: 'bat', name: 'Bat', path: 'M50 34 L44 28 L40 34 L24 28 L30 40 L24 50 L36 46 L40 54 L50 48 L60 54 L64 46 L76 50 L70 40 L76 28 L60 34 L56 28 Z' },
  { id: 'mammoth', name: 'Mammoth', path: 'M28 38 L22 28 L26 38 L18 34 L24 44 M34 32 L40 20 L42 32 M28 38 L34 44 L50 44 L62 44 L68 38 L68 54 L62 70 L40 70 L34 54 Z M62 44 L72 34 L78 40 L74 50 L68 54' },
  // Nature & Elements
  { id: 'heart', name: 'Heart', path: 'M50 76 L24 50 Q18 34 34 30 Q44 30 50 40 Q56 30 66 30 Q82 34 76 50 Z' },
  { id: 'sun', name: 'Sun', path: 'M50 38 A12 12 0 1 1 49.9 38 Z M50 16 L50 24 M50 76 L50 84 M16 50 L24 50 M76 50 L84 50 M26 26 L32 32 M68 68 L74 74 M74 26 L68 32 M32 68 L26 74' },
  { id: 'moon', name: 'Moon', path: 'M62 22 Q36 28 36 50 Q36 72 62 78 Q46 72 46 50 Q46 28 62 22 Z' },
  { id: 'mountain', name: 'Mountain', path: 'M14 76 L34 34 L50 56 L66 24 L86 76 Z M34 34 L42 46 L26 46 Z' },
  { id: 'wave', name: 'Wave', path: 'M14 48 Q24 34 34 48 Q44 62 54 48 Q64 34 74 48 Q80 54 86 48 M14 64 Q24 50 34 64 Q44 78 54 64 Q64 50 74 64 Q80 70 86 64' },
  { id: 'fire', name: 'Fire', path: 'M50 80 Q28 70 34 48 Q40 54 46 42 Q50 54 50 32 Q56 44 62 48 Q68 54 66 70 Q60 80 50 80 Z' },
  { id: 'snowflake', name: 'Snowflake', path: 'M50 14 L50 86 M18 32 L82 68 M18 68 L82 32 M50 14 L44 22 L56 22 Z M50 86 L44 78 L56 78 Z' },
  { id: 'gem', name: 'Gem', path: 'M28 30 L50 18 L72 30 L50 82 Z M28 30 L50 42 L72 30 M50 42 L50 82' },
  { id: 'hourglass', name: 'Hourglass', path: 'M24 18 L76 18 L76 24 L50 50 L76 76 L76 82 L24 82 L24 76 L50 50 L24 24 Z' },
  // Space
  { id: 'satellite', name: 'Satellite', path: 'M38 38 L62 38 L62 62 L38 62 Z M38 44 L22 44 L22 56 L38 56 M62 44 L78 44 L78 56 L62 56 M50 62 L50 78' },
  { id: 'telescope', name: 'Telescope', path: 'M28 62 L58 28 L64 34 L34 68 Z M28 62 L22 72 L34 68 M58 28 L70 22 L64 34' },
  { id: 'ufo', name: 'UFO', path: 'M18 50 Q50 34 82 50 Q82 56 50 56 Q18 56 18 50 Z M50 34 Q38 22 50 18 Q62 22 50 34 Z M34 56 L28 68 M50 56 L50 72 M66 56 L72 68' },
  { id: 'shuttle', name: 'Shuttle', path: 'M50 14 L56 30 L56 60 L66 76 L56 76 L56 86 L50 86 L44 86 L44 76 L34 76 L44 60 L44 30 Z' },
  { id: 'nebula', name: 'Nebula', path: 'M28 38 Q40 28 50 40 Q60 28 72 38 Q78 50 66 56 Q60 66 50 60 Q40 66 34 56 Q22 50 28 38 Z M44 44 A3 3 0 1 1 43.9 44 Z M58 48 A2 2 0 1 1 57.9 48 Z' },
  { id: 'blackhole', name: 'Black Hole', path: 'M50 50 A8 8 0 1 1 49.9 50 Z M50 50 Q28 38 16 50 Q28 62 50 50 Q72 38 84 50 Q72 62 50 50' },
  // Misc
  { id: 'key', name: 'Key', path: 'M34 34 A10 10 0 1 1 33.9 34 Z M34 44 L34 82 M34 70 L50 70 M34 58 L46 58' },
  { id: 'gear', name: 'Gear', path: 'M50 38 A12 12 0 1 1 49.9 38 Z M50 16 L50 26 M50 74 L50 84 M16 50 L26 50 M74 50 L84 50 M26 26 L33 33 M67 67 L74 74 M74 26 L67 33 M33 67 L26 74' },
  { id: 'tower', name: 'Tower', path: 'M38 18 L38 28 L32 28 L32 82 L68 82 L68 28 L62 28 L62 18 L56 18 L56 28 L44 28 L44 18 Z M32 40 L68 40 M32 56 L68 56' },
];

export const BADGE_COLORS = [
  '#ff8800', '#ff4400', '#ffcc00', '#00ff88', '#00aaff', '#aa00ff',
  '#ff00aa', '#ffffff', '#888888', '#000000', '#0044aa', '#880000',
  '#008800', '#444400', '#440044', '#004444',
];

export const BORDER_STYLES = [
  { id: 'none', name: 'None' },
  { id: 'solid', name: 'Solid' },
  { id: 'double', name: 'Double' },
  { id: 'dashed', name: 'Dashed' },
];

export function createDefaultBadge() {
  return {
    shape: 'shield',
    pattern: 'solid',
    bgColor: '#ff8800',
    bgColor2: '#000000',
    symbol: 'star',
    symbolColor: '#000000',
    borderStyle: 'solid',
    borderColor: '#ffaa00',
    text: '',
    textColor: '#ffffff',
  };
}

// Encode any JSON-serializable data into a share code string
export function encodeShareCode(data) {
  try {
    const json = JSON.stringify(data);
    return 'SF-' + btoa(encodeURIComponent(json));
  } catch (e) {
    return null;
  }
}

// Decode a share code back into an object, or null on failure
export function decodeShareCode(code) {
  try {
    const cleaned = code.trim().replace(/^SF-/, '').replace(/\s/g, '');
    const json = decodeURIComponent(atob(cleaned));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}