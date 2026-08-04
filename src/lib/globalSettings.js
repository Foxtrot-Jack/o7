// Global personalization settings — shared across all save slots so a
// commander's display, theme, audio, and control preferences persist no matter
// which save is loaded or how the preview reloads.
//
// Stability model: each save records `_gts` (the global timestamp it last
// synced to); the global store records `_ts` (the timestamp of the last real
// personalization change). On load, a save only adopts the global store's
// personalization if the global store is NEWER than the save's last sync — so
// a stale or default global store can never downgrade a save holding newer
// preferences. The global timestamp advances only when personalization
// actually changes (not on every state save), and partial writes (the pre-game
// panel) deep-merge so they never wipe a save's nested settings.

const GLOBAL_KEY = 'starfarer_global_settings';
const PER_SAVE_FIELDS = ['tutorialsSeen', '_gts'];

function stripPerSave(settings) {
  if (!settings || typeof settings !== 'object') return null;
  const out = { ...settings };
  for (const f of PER_SAVE_FIELDS) delete out[f];
  return out;
}

function isPlainObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

// Deep-merge global personalization over save settings: global wins per field,
// but nested objects merge so a partial global (e.g. the pre-game panel, which
// only stores a handful of fields) never replaces a save's nested settings
// (sound, gestures, display, …) wholesale.
function mergeGlobalOverSave(settings, global) {
  const out = { ...settings };
  for (const key of Object.keys(global)) {
    if (key === '_ts') continue;
    if (isPlainObj(global[key]) && isPlainObj(out[key])) {
      out[key] = { ...out[key], ...global[key] };
    } else {
      out[key] = global[key];
    }
  }
  return out;
}

function snapshotWithoutTs(obj) {
  if (!obj) return null;
  const { _ts, ...rest } = obj;
  return rest;
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
    const existing = loadGlobalSettings();
    // Preserve the existing sync timestamp unless personalization actually
    // changed — so routine saves (and adopting global into a fresh save) never
    // make the global store "newer" with the same values, which would let it
    // override other saves holding identical preferences.
    const changed = JSON.stringify(snapshotWithoutTs(existing)) !== JSON.stringify(snap);
    snap._ts = changed ? Date.now() : (existing?._ts || 0);
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(snap));
  } catch (e) { /* localStorage may be unavailable */ }
}

// Merge global personalization into a save's settings on load, preserving
// per-save fields (tutorialsSeen) and recording the sync point (_gts).
export function applyGlobalSettings(settings) {
  const global = loadGlobalSettings();
  const tutorialsSeen = settings?.tutorialsSeen || {};
  if (global) {
    const globalTs = global._ts || 0;
    const saveTs = settings?._gts || 0;
    if (globalTs > saveTs) {
      // Global has personalization changes this save hasn't seen — share them in.
      const merged = mergeGlobalOverSave(settings, global);
      merged.tutorialsSeen = tutorialsSeen;
      merged._gts = globalTs;
      return merged;
    }
    // Save is up-to-date with the global store — keep its own settings, just
    // record the sync point so a future newer global can still propagate.
    return { ...settings, tutorialsSeen, _gts: globalTs };
  }
  // No global store yet — seed it from this save, inheriting the save's sync
  // point (not "now") so a fresh default save can't make itself newer than a
  // customized save and override it.
  const snap = stripPerSave(settings);
  const ts = settings?._gts || 0;
  if (snap) {
    snap._ts = ts;
    try { localStorage.setItem(GLOBAL_KEY, JSON.stringify(snap)); } catch (e) { /* ignore */ }
  }
  return { ...settings, tutorialsSeen, _gts: ts };
}