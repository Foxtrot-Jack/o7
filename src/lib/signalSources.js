// Signal Sources — procedurally generated USS (Unidentified Signal Sources)
// detected by the Signal Scanner pop-out device. Distinct from FSS body signals:
// these are points of interest, encounters, and mission targets in the system.
import { makeRng, shuffle } from './prng';

export const SIGNAL_TYPES = {
  distress: {
    id: 'distress',
    name: 'Distress Beacon',
    icon: 'radio',
    threat: 1,
    color: 'cyan',
    desc: 'A weak distress signal from a stranded vessel requesting assistance.',
    encounter: 'distress_beacon',
  },
  derelict: {
    id: 'derelict',
    name: 'Derelict Vessel',
    icon: 'ghost',
    threat: 2,
    color: 'orange',
    desc: 'A drifting ship with no life signs. Salvageable materials may be aboard.',
    encounter: 'abandoned_ship',
  },
  smuggler: {
    id: 'smuggler',
    name: 'Smuggler Contact',
    icon: 'package',
    threat: 2,
    color: 'amber',
    desc: 'An unmarked ship hailing privately with contraband for sale.',
    encounter: 'smuggler_offer',
  },
  pirate: {
    id: 'pirate',
    name: 'Pirate Ambush',
    icon: 'skull',
    threat: 3,
    color: 'red',
    desc: 'A hostile vessel lying in wait, weapons hot.',
    encounter: 'pirate_ambush',
  },
  debris: {
    id: 'debris',
    name: 'Debris Field',
    icon: 'box',
    threat: 1,
    color: 'gray',
    desc: 'Scattered wreckage from a previous engagement. Materials may be recoverable.',
    encounter: null,
  },
  convoy: {
    id: 'convoy',
    name: 'Convoy Beacon',
    icon: 'truck',
    threat: 0,
    color: 'green',
    desc: 'A merchant convoy traveling under escort. Trade opportunities available.',
    encounter: null,
  },
  anomaly: {
    id: 'anomaly',
    name: 'Anomalous Signal',
    icon: 'sparkles',
    threat: 2,
    color: 'purple',
    desc: 'An unusual energy signature of unknown origin.',
    encounter: null,
  },
  combat: {
    id: 'combat',
    name: 'Combat Aftermath',
    icon: 'swords',
    threat: 3,
    color: 'red',
    desc: 'Residual weapon discharges. A recent battle occurred here.',
    encounter: null,
  },
  mission: {
    id: 'mission',
    name: 'Mission Target',
    icon: 'target',
    threat: 0,
    color: 'yellow',
    desc: 'A signal matching one of your active mission objectives.',
    encounter: null,
  },
};

// Generate signal sources for a system based on seed, security, population, and player state
export function generateSignalSources(system, activeMissions = []) {
  if (!system || !system.seed) return [];
  const rng = makeRng(`${system.seed}:signals`);
  const security = system.security || 'medium';
  const population = system.population || 0;

  const sources = [];

  // Base count influenced by population and security
  const baseCount = 2 + Math.floor((population > 0 ? 3 : 1) + (rng() * 3));

  // Weighted pool based on security level
  const pool = [];
  const addWeighted = (typeId, weight) => {
    for (let i = 0; i < weight; i++) pool.push(typeId);
  };

  addWeighted('distress', security === 'high' ? 3 : 2);
  addWeighted('derelict', 2);
  addWeighted('debris', 2);
  addWeighted('convoy', population > 0 ? 3 : 1);
  addWeighted('anomaly', 1);
  addWeighted('combat', security === 'anarchy' ? 3 : security === 'low' ? 2 : 1);
  addWeighted('smuggler', security === 'anarchy' ? 3 : security === 'low' ? 2 : 1);
  addWeighted('pirate', security === 'anarchy' ? 4 : security === 'low' ? 3 : security === 'medium' ? 1 : 0);

  // Pick from the weighted pool
  const picked = shuffle(rng, pool).slice(0, Math.min(baseCount, pool.length));

  for (const typeId of picked) {
    const type = SIGNAL_TYPES[typeId];
    if (!type) continue;
    sources.push({
      id: `${system.seed}:sig:${typeId}:${sources.length}`,
      typeId,
      type,
      threat: type.threat,
      investigated: false,
    });
  }

  // Add mission target signals if any active missions target this system
  for (const mission of activeMissions || []) {
    if (mission.destinationSystem?.seed === system.seed) {
      sources.push({
        id: `${system.seed}:mission:${mission.id}`,
        typeId: 'mission',
        type: SIGNAL_TYPES.mission,
        threat: 0,
        investigated: false,
        missionId: mission.id,
        missionName: mission.name || mission.type,
      });
    }
  }

  return sources;
}

export const THREAT_LABELS = {
  0: 'HARMLESS',
  1: 'LOW',
  2: 'MODERATE',
  3: 'HIGH',
  4: 'EXTREME',
};