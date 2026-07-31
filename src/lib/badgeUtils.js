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