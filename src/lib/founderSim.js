// Founder BGS simulation — the credited founders fly as active AI pilots.
//
// Explorers chart and claim nearby systems (First Discovered by <alias>),
// giving the "first discovered" label real meaning. Traders, miners and combat
// pilots shift faction influence in systems they work and generate an
// activity feed the player can read in the BGS screen.
//
// The simulation advances on real elapsed time. The explorer-speed slider is
// the ONLY cap (per builder preference): full speed lets founders compete
// with the player in real time; low speed barely moves them while away.
import { useCallback } from 'react';
import { generateStarsInRange } from './galaxy';
import { generateSystemFromStar } from './system';
import { getFounderPilots, isFounderAlias, findFounderByAlias } from './contributors';

export const DEFAULT_FOUNDER_SETTINGS = { explorationEnabled: true, explorerSpeed: 50, spawnSelfInGalaxy: false };

const EXPLORER_BASE_MS = 12 * 3600 * 1000;    // 1 discovery / 12h at 100% speed
const NONEXPLORER_BASE_MS = 6 * 3600 * 1000;  // 1 job / 6h
const MAX_ACTIONS_PER_TICK = 50;

function makeEntry(alias, role, text, system) {
  return { id: `fa_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, alias, role, text, system, date: Date.now() };
}

function safeSystemData(star) {
  try { return generateSystemFromStar(star); } catch { return { bodyCount: 0 }; }
}

function pickUndiscoveredStar(center, discovered) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const stars = generateStarsInRange(center.x, center.y, center.z, 100 + attempt * 80);
    const avail = stars.filter(s => !discovered[s.seed]);
    if (avail.length) return avail[Math.floor(Math.random() * avail.length)];
  }
  return null;
}

function pickActivitySystem(prev, discovered) {
  if (prev.currentSystem) return { name: prev.currentSystem.name, seed: prev.currentSystem.seed };
  const entries = Object.values(discovered);
  if (entries.length) return { name: entries[Math.floor(Math.random() * entries.length)].name, seed: null };
  return null;
}

function generateJobEntry(f, target) {
  const sysName = target?.name || 'the frontier';
  if (f.role === 'trader') return makeEntry(f.alias, 'trader', `completed a lucrative trade run in ${sysName}`, sysName);
  if (f.role === 'miner') return makeEntry(f.alias, 'miner', `struck a rich mineral vein in ${sysName}`, sysName);
  return makeEntry(f.alias, 'combat', `engaged hostiles patrolling ${sysName}`, sysName);
}

function jobFaction(role) {
  if (role === 'trader') return 'Merchant Guild';
  return 'Local Independents';
}

function nudgeBGS(founderBGS, seed, faction, delta) {
  if (!seed || !faction) return;
  const cur = founderBGS[seed] || {};
  founderBGS[seed] = { ...cur, [faction]: Math.max(-20, Math.min(20, (cur[faction] || 0) + delta)) };
}

export function useFounderSim(setState) {
  const tickFounders = useCallback((elapsedMs) => {
    setState(prev => {
      const cfg = { ...DEFAULT_FOUNDER_SETTINGS, ...(prev.settings?.founders || {}) };
      const signedFounder = prev.commanderName && isFounderAlias(prev.commanderName) ? findFounderByAlias(prev.commanderName) : null;
      const founders = signedFounder && !cfg.spawnSelfInGalaxy
        ? getFounderPilots().filter(f => f.alias !== signedFounder.alias)
        : getFounderPilots();
      const simPrev = prev.founderSim || { progress: {}, lastTick: Date.now() };
      if (founders.length === 0) {
        return { ...prev, founderSim: { progress: simPrev.progress || {}, lastTick: Date.now() } };
      }
      const speed = Math.max(0, Math.min(100, cfg.explorerSpeed || 0)) / 100;
      const progress = { ...simPrev.progress };
      const discovered = { ...(prev.discoveredSystems || {}) };
      let activity = [...(prev.founderActivity || [])];
      const founderBGS = { ...(prev.founderBGS || {}) };
      const center = prev.currentSystem || { x: 0, y: 0, z: 0 };

      for (const f of founders) {
        if (f.role === 'explorer') {
          if (!cfg.explorationEnabled) continue;
          const period = speed > 0 ? EXPLORER_BASE_MS / speed : Infinity;
          let p = (progress[f.alias] || 0) + (period > 0 ? elapsedMs / period : 0);
          let claims = 0;
          while (p >= 1 && claims < MAX_ACTIONS_PER_TICK) {
            const star = pickUndiscoveredStar(center, discovered);
            if (!star) break;
            const sd = safeSystemData(star);
            discovered[star.seed] = {
              name: star.name,
              firstDiscovered: false,
              discoveredBy: f.alias,
              bodyCount: sd?.bodyCount || 0,
              scanValue: 0,
              originCoords: { x: star.x, y: star.y, z: star.z },
            };
            activity.unshift(makeEntry(f.alias, 'explorer', `charted ${star.name}`, star.name));
            p -= 1; claims++;
          }
          progress[f.alias] = p;
        } else {
          const period = NONEXPLORER_BASE_MS;
          let p = (progress[f.alias] || 0) + elapsedMs / period;
          let acts = 0;
          while (p >= 1 && acts < MAX_ACTIONS_PER_TICK) {
            const target = pickActivitySystem(prev, discovered);
            activity.unshift(generateJobEntry(f, target));
            if (target?.seed) nudgeBGS(founderBGS, target.seed, jobFaction(f.role), f.role === 'combat' ? 1 : 2);
            p -= 1; acts++;
          }
          progress[f.alias] = p;
        }
      }

      return {
        ...prev,
        discoveredSystems: discovered,
        founderActivity: activity.slice(0, 60),
        founderBGS,
        founderSim: { progress, lastTick: Date.now() },
      };
    });
  }, [setState]);

  return { tickFounders };
}