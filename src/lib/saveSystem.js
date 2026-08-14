// Robust save system — protects player progress against crashes and bugs.
//
// Strategy:
//  1. Validate BEFORE writing — a gutted/corrupt state is never persisted,
//     so the previous good save survives (the in-memory session may glitch,
//     but localStorage keeps the good copy; reload restores it).
//  2. Rolling backup — before overwriting the main save, the current valid
//     main save is copied to a `_bak` key. On load, if the main save is
//     missing/invalid, the backup is restored automatically.
//  3. The ONLY way data is permanently erased is an explicit clearSave()
//     (the "Reset / Clear Save" button).
//
// This means: even if a bug produces a destroyed state object, the player
// never loses their saved progress — they just reload and continue from
// the last good autosave.

const BACKUP_SUFFIX = '_bak';

// A save is valid only if it carries the essential player fields. This is the
// guard that prevents a half-built state object from overwriting a good save.
export function isValidSave(parsed, expectedSaveMode) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  if (!parsed.ship || typeof parsed.ship !== 'object') return false;
  if (typeof parsed.credits !== 'number' || !isFinite(parsed.credits)) return false;
  if (expectedSaveMode && parsed.saveMode && parsed.saveMode !== expectedSaveMode) return false;
  return true;
}

// Write the state to the main key, backing up the previous good save first.
// Returns true on success, false if the write was blocked or failed.
export function safeWriteSave(key, state) {
  try {
    if (!isValidSave(state, state?.saveMode)) {
      console.warn('Save write blocked: state failed validation — preserving existing save.');
      return false;
    }
    const json = JSON.stringify(state);
    if (!json) return false;

    // Back up the current main save (only if it is itself valid — never back
    // up a corrupt main over a good backup).
    try {
      const current = localStorage.getItem(key);
      if (current) {
        let curParsed = null;
        try { curParsed = JSON.parse(current); } catch (e) { curParsed = null; }
        if (isValidSave(curParsed, state.saveMode)) {
          localStorage.setItem(key + BACKUP_SUFFIX, current);
        }
      }
    } catch (e) { /* backup failure must not block the main write */ }

    localStorage.setItem(key, json);
    return true;
  } catch (e) {
    console.error('Safe save write failed:', e);
    return false;
  }
}

// Migrate a loaded save to the current version. Each migration step patches
// the save in place so old saves are always forward-compatible — players never
// lose progress from an update unless the save itself is corrupt.
const LATEST_SAVE_VERSION = 2;
export function migrateSave(parsed) {
  if (!parsed || typeof parsed !== 'object') return parsed;
  const v = parsed.version || 0;
  // Version 0→1: saves without a version field — no structural change needed,
  // the merge in GameStateProvider handles missing fields.
  // Version 1→2: adds factionRep, missionChains, etc. — all defaulted by merge.
  // Future migrations go here, each guarded by its version check.
  parsed.version = LATEST_SAVE_VERSION;
  return parsed;
}

// Load the best available save: main first, then backup. If the main is
// invalid but the backup is good, the backup is restored to the main key so
// subsequent loads are clean. Returns parsed state or null.
export function loadSave(key, expectedSaveMode) {
  // 1. Try the main save.
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      if (isValidSave(parsed, expectedSaveMode)) {
        parsed = migrateSave(parsed);
        // Seed a backup if one doesn't exist yet.
        try {
          if (!localStorage.getItem(key + BACKUP_SUFFIX)) localStorage.setItem(key + BACKUP_SUFFIX, raw);
        } catch (e) {}
        return parsed;
      }
      console.warn('Main save invalid — attempting backup recovery.');
    }
  } catch (e) { /* localStorage may be unavailable */ }

  // 2. Fall back to the backup.
  try {
    const bakRaw = localStorage.getItem(key + BACKUP_SUFFIX);
    if (bakRaw) {
      let bakParsed = null;
      try { bakParsed = JSON.parse(bakRaw); } catch (e) { bakParsed = null; }
      if (isValidSave(bakParsed, expectedSaveMode)) {
        bakParsed = migrateSave(bakParsed);
        // Restore the backup into the main slot.
        try { localStorage.setItem(key, bakRaw); } catch (e) {}
        console.info('Recovered save from backup.');
        return bakParsed;
      }
    }
  } catch (e) {}

  return null;
}

// Permanently erase a save and its backup. This is the ONLY sanctioned path
// to data loss (the explicit "Clear Save" / "Reset" action).
export function clearSave(key) {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(key + BACKUP_SUFFIX);
  } catch (e) {}
}