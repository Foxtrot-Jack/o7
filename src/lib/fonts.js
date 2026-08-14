// Font options for the game interface.
// Google Fonts are imported in src/index.css; system fonts need no import.
export const FONTS = {
  inter:      { name: 'Inter',           family: "'Inter', sans-serif",                          type: 'Readable' },
  courier:    { name: 'Courier New',     family: "'Courier New', 'Lucida Console', monospace",  type: 'System Mono' },
  monaco:     { name: 'Monaco',          family: "Monaco, Menlo, 'Courier New', monospace",      type: 'System Mono' },
  consolas:   { name: 'Consolas',        family: "Consolas, 'Courier New', monospace",           type: 'System Mono' },
  vt323:      { name: 'VT323',           family: "'VT323', monospace",                           type: 'Retro CRT' },
  sharetech:  { name: 'Share Tech Mono', family: "'Share Tech Mono', monospace",                 type: 'Tech Mono' },
  ibmplex:    { name: 'IBM Plex Mono',   family: "'IBM Plex Mono', monospace",                   type: 'Modern Mono' },
  sourcecode: { name: 'Source Code Pro', family: "'Source Code Pro', monospace",                 type: 'Code Editor' },
  major:      { name: 'Major Mono',      family: "'Major Mono Display', monospace",              type: 'Display' },
  pressstart: { name: 'Press Start 2P',  family: "'Press Start 2P', monospace",                  type: 'Pixel 8-bit' },
};

export const FONT_LIST = Object.entries(FONTS).map(([id, f]) => ({ id, ...f }));

export const DEFAULT_FONT = 'inter';