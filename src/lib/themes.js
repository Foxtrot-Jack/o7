// Color theme presets for the CRT interface
export const THEMES = {
  elite:   { name: 'Elite Orange',  color: '#ff8800', hueRotate: 0,   glow: 'rgba(255,136,0,0.03)',  flicker: 'rgba(255,136,0,0.02)',  shadow: 'rgba(255,136,0,0.5)',  shadowDim: 'rgba(255,136,0,0.2)',  gradient: 'rgba(255,136,0,0.02)' },
  matrix:  { name: 'Matrix Green',  color: '#00ff66', hueRotate: 95,  glow: 'rgba(0,255,100,0.03)',  flicker: 'rgba(0,255,100,0.02)',  shadow: 'rgba(0,255,100,0.5)',  shadowDim: 'rgba(0,255,100,0.2)',  gradient: 'rgba(0,255,100,0.02)' },
  amber:   { name: 'Amber',         color: '#ffbf00', hueRotate: 15,  glow: 'rgba(255,191,0,0.03)',  flicker: 'rgba(255,191,0,0.02)',  shadow: 'rgba(255,191,0,0.5)',  shadowDim: 'rgba(255,191,0,0.2)',  gradient: 'rgba(255,191,0,0.02)' },
  ice:     { name: 'Ice Blue',      color: '#00c8ff', hueRotate: 150, glow: 'rgba(0,200,255,0.03)',  flicker: 'rgba(0,200,255,0.02)',  shadow: 'rgba(0,200,255,0.5)',  shadowDim: 'rgba(0,200,255,0.2)',  gradient: 'rgba(0,200,255,0.02)' },
  crimson: { name: 'Crimson',       color: '#ff3232', hueRotate: -25, glow: 'rgba(255,50,50,0.03)',  flicker: 'rgba(255,50,50,0.02)',  shadow: 'rgba(255,50,50,0.5)',  shadowDim: 'rgba(255,50,50,0.2)',  gradient: 'rgba(255,50,50,0.02)' },
  violet:  { name: 'Violet',        color: '#b464ff', hueRotate: 235, glow: 'rgba(180,100,255,0.03)',flicker: 'rgba(180,100,255,0.02)',shadow: 'rgba(180,100,255,0.5)',shadowDim: 'rgba(180,100,255,0.2)',gradient: 'rgba(180,100,255,0.02)' },
  mono:    { name: 'Monochrome',    color: '#cccccc', hueRotate: 0,   grayscale: true, glow: 'rgba(200,200,200,0.03)', flicker: 'rgba(200,200,200,0.02)', shadow: 'rgba(200,200,200,0.5)', shadowDim: 'rgba(200,200,200,0.2)', gradient: 'rgba(200,200,200,0.02)' },
  sol_gold: { name: 'Sol Gold',     color: '#ffd700', hueRotate: 20,  glow: 'rgba(255,215,0,0.04)',  flicker: 'rgba(255,215,0,0.02)',  shadow: 'rgba(255,215,0,0.6)',  shadowDim: 'rgba(255,215,0,0.25)',  gradient: 'rgba(255,215,0,0.03)' },
};

export const THEME_LIST = Object.entries(THEMES).map(([id, t]) => ({ id, ...t }));

// Build a theme object dynamically from a custom hex color,
// generating all rgba variants the CRTFrame needs.
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 255, g: 136, b: 0 };
}

export function buildCustomTheme(hex) {
  const { r, g, b } = hexToRgb(hex);
  return {
    name: 'Custom',
    color: hex,
    glow: `rgba(${r},${g},${b},0.03)`,
    flicker: `rgba(${r},${g},${b},0.02)`,
    shadow: `rgba(${r},${g},${b},0.5)`,
    shadowDim: `rgba(${r},${g},${b},0.2)`,
    gradient: `rgba(${r},${g},${b},0.02)`,
  };
}