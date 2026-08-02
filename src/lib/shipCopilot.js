// Ship AI Copilot — contextual, situation-aware advisory engine
// Analyzes game state and generates prioritized advice instead of random chatter.
// Also supports a command interface for player queries (status, route, market, threats).

import { distance3D } from './galaxy';
import { COMMODITY_MAP } from './commodities';

// Priority levels — lower number = more urgent
export const PRIORITY = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
  IDLE: 3,
};

export const PRIORITY_LABELS = {
  0: 'CRITICAL',
  1: 'WARNING',
  2: 'ADVISORY',
  3: 'COCKPIT',
};

export const PRIORITY_COLORS = {
  0: 'text-red-400',
  1: 'text-yellow-400',
  2: 'text-cyan-400',
  3: 'text-orange-500',
};

// Each rule: { id, priority, condition(state, ctx) => bool, message(state, ctx) => string }
const RULES = [
  // ---- CRITICAL ----
  {
    id: 'fuel_empty',
    priority: PRIORITY.CRITICAL,
    condition: (s) => (s.ship.fuel ?? 0) <= 0,
    message: (s) => `Fuel depleted, Commander. FSD inoperable. Locate a scoopable star or call for fuel immediately.`,
  },
  {
    id: 'fuel_low',
    priority: PRIORITY.CRITICAL,
    condition: (s) => {
      const pct = s.ship.fuelCapacity ? (s.ship.fuel / s.ship.fuelCapacity) * 100 : 100;
      return pct > 0 && pct < 15;
    },
    message: (s) => {
      const pct = s.ship.fuelCapacity ? Math.round((s.ship.fuel / s.ship.fuelCapacity) * 100) : 100;
      return `Fuel at ${pct}% — critical reserve. Plot a course to the nearest station or scoop a star now.`;
    },
  },
  {
    id: 'hull_critical',
    priority: PRIORITY.CRITICAL,
    condition: (s) => (s.ship.integrity ?? 100) < 20,
    message: (s) => `Hull integrity at ${Math.round(s.ship.integrity ?? 100)}%. Structural failure imminent — dock and repair at once.`,
  },
  {
    id: 'active_encounter',
    priority: PRIORITY.CRITICAL,
    condition: (s) => !!s.activeEncounter,
    message: (s) => `Hostile contact detected: ${s.activeEncounter?.title || 'unknown threat'}. Review encounter panel and respond.`,
  },
  {
    id: 'active_combat',
    priority: PRIORITY.CRITICAL,
    condition: (s) => !!s.activeCombat,
    message: () => `Weapons free, Commander. Deploy hardpoints and eliminate the threat.`,
  },
  {
    id: 'rebuy_pending',
    priority: PRIORITY.CRITICAL,
    condition: (s) => !!s.rebuyPending && !s.rebuyPending.canAfford,
    message: (s) => `Insurance claim pending. Rebuy cost: ${s.rebuyPending.rebuyCost.toLocaleString()} CR — insufficient funds. Earn credits to rebuy your ship.`,
  },

  // ---- WARNING ----
  {
    id: 'fuel_moderate',
    priority: PRIORITY.WARNING,
    condition: (s) => {
      const pct = s.ship.fuelCapacity ? (s.ship.fuel / s.ship.fuelCapacity) * 100 : 100;
      return pct >= 15 && pct < 35;
    },
    message: (s) => {
      const pct = s.ship.fuelCapacity ? Math.round((s.ship.fuel / s.ship.fuelCapacity) * 100) : 100;
      return `Fuel at ${pct}%. Refuel at the next available opportunity.`;
    },
  },
  {
    id: 'hull_warning',
    priority: PRIORITY.WARNING,
    condition: (s) => {
      const h = s.ship.integrity ?? 100;
      return h >= 20 && h < 50;
    },
    message: (s) => `Hull at ${Math.round(s.ship.integrity ?? 100)}%. Maintenance advised at the next station.`,
  },
  {
    id: 'module_wear',
    priority: PRIORITY.WARNING,
    condition: (s) => (s.ship.moduleWear ?? 0) > 60,
    message: (s) => `Module wear at ${Math.round(s.ship.moduleWear ?? 0)}%. Core systems degrading — schedule AFM repair.`,
  },
  {
    id: 'cargo_full',
    priority: PRIORITY.WARNING,
    condition: (s) => {
      const used = (s.ship.cargo || []).reduce((sum, c) => sum + c.qty, 0);
      return s.ship.cargoCapacity > 0 && used >= s.ship.cargoCapacity * 0.95;
    },
    message: () => `Cargo hold at capacity. Sell or jettison goods before taking on more.`,
  },
  {
    id: 'bounty_active',
    priority: PRIORITY.WARNING,
    condition: (s) => (s.crime?.bounty ?? 0) > 0,
    message: (s) => `Active bounty: ${s.crime.bounty.toLocaleString()} CR on your head. Avoid high-security systems or pay it off at an anarchy station.`,
  },
  {
    id: 'notoriety_high',
    priority: PRIORITY.WARNING,
    condition: (s) => (s.crime?.notoriety ?? 0) >= 5,
    message: (s) => `Notoriety level ${s.crime.notoriety}. Security forces will target you on sight in governed systems.`,
  },
  {
    id: 'heat_sink_low',
    priority: PRIORITY.WARNING,
    condition: (s) => (s.heatSinkCharges ?? 0) === 0 && (s.ship.integrity ?? 100) < 100,
    message: () => `No heat sink charges remaining. Synthesize more or dock to restock before neutron-star jumps.`,
  },

  // ---- INFO / ADVISORY ----
  {
    id: 'route_plotted',
    priority: PRIORITY.INFO,
    condition: (s) => (s.plottedRoute?.length || 0) > 0,
    message: (s) => `Route active. ${s.plottedRoute.length} jump${s.plottedRoute.length === 1 ? '' : 's'} remaining to destination.`,
  },
  {
    id: 'fsd_boost_ready',
    priority: PRIORITY.INFO,
    condition: (s) => !!s.fsdBoost,
    message: () => `FSD boost charged. Next jump will have extended range — make it count.`,
  },
  {
    id: 'exploration_data',
    priority: PRIORITY.INFO,
    condition: (s) => {
      const scanCount = Object.keys(s.scannedBodies || {}).length;
      return scanCount >= 5;
    },
    message: (s) => `${Object.keys(s.scannedBodies || {}).length} bodies scanned. Visit Cartographics to sell exploration data.`,
  },
  {
    id: 'surface_data',
    priority: PRIORITY.INFO,
    condition: (s) => Object.keys(s.surfaceMaps || {}).length >= 3,
    message: (s) => `${Object.keys(s.surfaceMaps || {}).length} surface maps collected. Sell at Cartographics for credit payout.`,
  },
  {
    id: 'missions_active',
    priority: PRIORITY.INFO,
    condition: (s) => (s.activeMissions?.length || 0) >= 3,
    message: (s) => `${s.activeMissions.length} active missions. Check the mission board for deadlines and destinations.`,
  },
  {
    id: 'guardian_blueprints',
    priority: PRIORITY.INFO,
    condition: (s) => {
      const total = Object.values(s.guardianBlueprints || {}).reduce((sum, b) => sum + (b.count || 0), 0);
      return total > 0;
    },
    message: (s) => {
      const total = Object.values(s.guardianBlueprints || {}).reduce((sum, b) => sum + (b.count || 0), 0);
      return `Guardian blueprint fragments acquired (${total} total). Outfitting can now unlock advanced modules.`;
    },
  },
  {
    id: 'low_credits',
    priority: PRIORITY.INFO,
    condition: (s) => s.credits < 50000,
    message: (s) => `Credits low: ${s.credits.toLocaleString()} CR. Consider a courier or mining run to build reserves.`,
  },

  // ---- IDLE / COCKPIT ----
  {
    id: 'idle_all_clear',
    priority: PRIORITY.IDLE,
    condition: (s) => {
      const fuelPct = s.ship.fuelCapacity ? (s.ship.fuel / s.ship.fuelCapacity) * 100 : 100;
      return (s.ship.integrity ?? 100) >= 90 && fuelPct >= 50 && !s.activeEncounter && !s.activeCombat && (s.crime?.bounty ?? 0) === 0;
    },
    message: (s) => `All systems nominal, Commander. ${s.currentSystem?.name || 'Current system'} is quiet — good time to plot your next move.`,
  },
  {
    id: 'idle_scanning',
    priority: PRIORITY.IDLE,
    condition: (s) => s.currentLocation === 'system' && !s.activeEncounter && Object.keys(s.fssDiscoveredBodies || {}).length < 3,
    message: () => `Unscanned bodies detected. Activate the FSS to identify signals in this system.`,
  },
  {
    id: 'idle_docked',
    priority: PRIORITY.IDLE,
    condition: (s) => s.currentLocation === 'station',
    message: () => `Docked and secure. Station services are available — check the market or mission board.`,
  },
];

// Evaluate all rules, return sorted by priority
export function getAdvice(state) {
  const triggered = [];
  for (const rule of RULES) {
    try {
      if (rule.condition(state)) {
        triggered.push({
          id: rule.id,
          priority: rule.priority,
          message: rule.message(state),
        });
      }
    } catch (e) {
      // rule error — skip
    }
  }
  triggered.sort((a, b) => a.priority - b.priority);
  return triggered;
}

// ---- Command queries ----
// Player can ask the copilot specific questions via a menu
export const COPILOT_COMMANDS = [
  { id: 'status', label: 'Status Report', desc: 'Full ship systems overview' },
  { id: 'route', label: 'Route Analysis', desc: 'Jump range, fuel cost, ETA' },
  { id: 'market', label: 'Market Brief', desc: 'Trading recommendations' },
  { id: 'threats', label: 'Threat Assessment', desc: 'Encounters, bounties, security' },
  { id: 'missions', label: 'Mission Status', desc: 'Active contracts overview' },
  { id: 'advice', label: 'Copilot Advice', desc: 'What should I do next?' },
];

export function runCopilotCommand(commandId, state) {
  switch (commandId) {
    case 'status':
      return statusReport(state);
    case 'route':
      return routeAnalysis(state);
    case 'market':
      return marketBrief(state);
    case 'threats':
      return threatAssessment(state);
    case 'missions':
      return missionStatus(state);
    case 'advice':
      return topAdvice(state);
    default:
      return 'Unknown command.';
  }
}

function statusReport(s) {
  const fuel = s.ship.fuel ?? 0;
  const fuelCap = s.ship.fuelCapacity ?? 1;
  const fuelPct = Math.round((fuel / fuelCap) * 100);
  const integrity = Math.round(s.ship.integrity ?? 100);
  const moduleWear = Math.round(s.ship.moduleWear ?? 0);
  const cargoUsed = (s.ship.cargo || []).reduce((sum, c) => sum + c.qty, 0);
  const cargoPct = s.ship.cargoCapacity ? Math.round((cargoUsed / s.ship.cargoCapacity) * 100) : 0;
  const heatSinks = s.heatSinkCharges ?? 0;
  const shieldCells = s.shieldCellCharges ?? 0;
  const lines = [
    `SHIP: ${s.ship.name || s.ship.type} | ${s.currentSystem?.name || 'unknown space'}`,
    `FUEL: ${fuel.toFixed(1)}/${fuelCap}T (${fuelPct}%)  |  HULL: ${integrity}%  |  WEAR: ${moduleWear}%`,
    `CARGO: ${cargoUsed}/${s.ship.cargoCapacity}T (${cargoPct}%)  |  CREDITS: ${s.credits.toLocaleString()} CR`,
    `HEAT SINKS: ${heatSinks}  |  SHIELD CELLS: ${shieldCells}  |  FSD BOOST: ${s.fsdBoost ? 'CHARGED' : 'none'}`,
    `LOCATION: ${s.currentLocation?.toUpperCase()}  |  JUMPS: ${s.totalJumps ?? 0}  |  LY TRAVELED: ${Math.round(s.lightYearsTraveled ?? 0)}`,
  ];
  return lines.join('\n');
}

function routeAnalysis(s) {
  const route = s.plottedRoute || [];
  if (route.length === 0) {
    return 'No route plotted. Open the Galaxy Map to plot a course to your destination.';
  }
  let totalDist = 0;
  for (let i = 0; i < route.length; i++) {
    const a = i === 0 ? s.currentSystem : route[i - 1];
    const b = route[i];
    totalDist += distance3D(a, b);
  }
  const fuelPerLy = 0.5;
  const fuelNeeded = Math.ceil(totalDist * fuelPerLy);
  const hasFuel = (s.ship.fuel ?? 0) >= fuelNeeded;
  const lines = [
    `ROUTE: ${route.length} jumps  |  ${totalDist.toFixed(1)} LY total`,
    `FUEL NEEDED: ~${fuelNeeded}T  |  ON BOARD: ${(s.ship.fuel ?? 0).toFixed(1)}T  |  ${hasFuel ? 'SUFFICIENT' : 'INSUFFICIENT — refuel required'}`,
    `DESTINATION: ${route[route.length - 1]?.name || 'unknown'}`,
  ];
  if (!hasFuel) {
    lines.push('WARNING: Plot an intermediate refueling stop or scoop fuel en route.');
  }
  return lines.join('\n');
}

function marketBrief(s) {
  const sysData = s.currentSystemData;
  if (!sysData) return 'System data unavailable.';
  const stations = sysData.stations || [];
  if (stations.length === 0) return 'No stations in this system. No market data available.';
  const cargo = s.ship.cargo || [];
  if (cargo.length === 0) {
    return `Cargo hold empty. Dock at ${stations[0]?.name || 'a station'} and check the market for profitable goods.`;
  }
  const lines = [`CARGO ON BOARD: ${cargo.map(c => `${COMMODITY_MAP[c.commodity]?.name || c.commodity} x${c.qty}`).join(', ')}`];
  lines.push('Dock at a station and open the Market screen to check sell prices. Compare across stations for the best margins.');
  return lines.join('\n');
}

function threatAssessment(s) {
  const lines = [];
  const sec = s.currentSystem?.security || 'unknown';
  lines.push(`SYSTEM SECURITY: ${sec.toUpperCase()}`);
  if (s.activeEncounter) {
    lines.push(`ACTIVE THREAT: ${s.activeEncounter.title || 'unknown'} — respond via the encounter panel.`);
  } else {
    lines.push('ACTIVE THREAT: none detected.');
  }
  if (s.activeCombat) {
    lines.push('COMBAT: engaged. Deploy weapons and manage shields.');
  }
  const bounty = s.crime?.bounty ?? 0;
  const noto = s.crime?.notoriety ?? 0;
  if (bounty > 0) {
    lines.push(`BOUNTY: ${bounty.toLocaleString()} CR  |  NOTORIETY: ${noto}`);
    if (sec === 'high') lines.push('WARNING: High-security system — authorities may scan and engage.');
  } else {
    lines.push('CRIMINAL RECORD: clean.');
  }
  return lines.join('\n');
}

function missionStatus(s) {
  const missions = s.activeMissions || [];
  if (missions.length === 0) return 'No active missions. Visit a station mission board to accept contracts.';
  const lines = [`ACTIVE MISSIONS: ${missions.length}`];
  for (const m of missions.slice(0, 5)) {
    const dest = m.destinationSystem?.name || m.destinationSystem || 'unknown';
    lines.push(`- ${m.type?.toUpperCase() || 'MISSION'} → ${dest}  |  ${m.reward?.toLocaleString() || 0} CR`);
  }
  if (missions.length > 5) lines.push(`...and ${missions.length - 5} more.`);
  return lines.join('\n');
}

function topAdvice(s) {
  const advice = getAdvice(s);
  if (advice.length === 0) return 'No immediate concerns, Commander. You are clear to proceed.';
  // Return top 3 most urgent
  const top = advice.slice(0, 3);
  return top.map((a, i) => `[${PRIORITY_LABELS[a.priority]}] ${a.message}`).join('\n');
}