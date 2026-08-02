// Monochrome color-override helpers — lets the mono theme keep specific
// 3D / UI color categories while everything else stays grey.
import * as THREE from 'three';

// The effective theme accounting for the Sol-Gold cheat override.
export function effectiveTheme(state) {
  if (state?.cheats?.unlocked && state?.cheats?.active?.golden_theme) return 'sol_gold';
  return state?.settings?.colorTheme || 'elite';
}

// Whether a 3D color category should render in color, given theme + overrides.
export function colorEnabledFor(category, theme, monoOverrides) {
  if (theme !== 'mono') return true;
  return !!(monoOverrides && monoOverrides[category]);
}

// Whether UI layers should be greyscaled (mono theme + UI-accent override off).
export function monoUIActive(settings) {
  if (!settings) return false;
  return settings.colorTheme === 'mono' && !(settings.monoOverrides && settings.monoOverrides.uiAccent);
}

// Desaturate a THREE.Color to its luminance (mutates and returns the color).
export function desaturateColor(color) {
  const lum = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  color.setRGB(lum, lum, lum);
  return color;
}

// Desaturate every material color in an Object3D (ships, stations, carriers).
export function desaturateObject3D(obj) {
  if (!obj) return obj;
  obj.traverse(child => {
    if (child.material && child.material.color) {
      desaturateColor(child.material.color);
    }
  });
  return obj;
}