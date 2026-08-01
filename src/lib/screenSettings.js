// Screen-specific gesture and display settings defaults & helpers
export const DEFAULT_GESTURE_SETTINGS = {
  global: {
    pinchZoom: true,
    pinchSensitivity: 100,
    panEnabled: true,
    panSensitivity: 100,
    invertPan: false,
    rotateEnabled: true,
    rotateSensitivity: 100,
    doubleTapZoom: true,
    scrollInvert: false,
  },
  screens: {},
};

export const DEFAULT_DISPLAY_SETTINGS = {
  global: {
    invertColors: false,
    hueRotate: 0,
    saturation: 100,
    contrast: 100,
    flipHorizontal: false,
    flipVertical: false,
  },
  screens: {},
};

export const INTERACTIVE_SCREENS = [
  { id: 'galaxy', name: 'Galaxy Map' },
  { id: 'system', name: 'System Orrery' },
  { id: 'mining', name: 'Mining' },
  { id: 'survey', name: 'Surface Survey' },
  { id: 'srv', name: 'SRV Rover' },
  { id: 'fss', name: 'FSS Scanner' },
  { id: 'exploration', name: 'Exploration' },
  { id: 'cartography', name: 'Cartography' },
  { id: 'exobiology', name: 'Exobiology' },
];

export function getEffectiveSettings(settings, category, screenId) {
  const global = settings?.[category]?.global || {};
  const screenOverride = settings?.[category]?.screens?.[screenId] || {};
  return { ...global, ...screenOverride };
}