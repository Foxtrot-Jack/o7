// Global personalization settings — shared across all save slots so a
// commander's display, theme, audio, and control preferences persist no
// matter which save is loaded or how the preview reloads.
// Per-save progress fields (e.g. tutorialsSeen) stay with their save.

const GLOBAL_KEY = 'starfarer_global_settings';
const PER_SAVE_FIELDS = ['tutorialsSeen'];

function stripPerSave(settings) {
  if (!settings || typeof settings !== 'object') return null;
  const out = { ...settings };
  for (const f of PER_SAVE_FIELDS) delete out[f];
  return out;
}

export function loadGlobalSettings() {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch (e) { return null; }
}

export function saveGlobalSettings(settings) {
  try {
    const snap = stripPerSave(settings);
    if (!snap) return;
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(snap));
  } catch (e) { /* localStorage may be unavailable */ }
}

// Merge global personalization over a save's settings, preserving per-save
// fields. Seeds the global store from `settings` on first run so existing
// preferences carry over to the other save slot.
export function applyGlobalSettings(settings) {
  const global = loadGlobalSettings();
  if (global) {
    return { ...settings, ...global, tutorialsSeen: settings?.tutorialsSeen || {} };
  }
  saveGlobalSettings(settings);
  return settings;
}