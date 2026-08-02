// Encounter System — random events during interstellar travel
// Menu-driven: pirate ambush, distress beacons, smugglers, salvage, scans, anomalies

export const ENCOUNTER_TYPES = [
  {
    id: 'pirate_ambush',
    name: 'Pirate Ambush',
    icon: 'skull',
    description: 'A hostile vessel drops from supercruise, weapons hot! They demand you dump cargo or be destroyed.',
    securityWeight: { anarchy: 4, low: 3, medium: 2, high: 0 },
    options: [
      { id: 'fight', label: 'Engage', desc: 'Fight back with your weapons' },
      { id: 'flee', label: 'Flee', desc: 'Attempt to jump away' },
      { id: 'pay', label: 'Pay Off', desc: 'Dump cargo or pay credits' },
    ],
  },
  {
    id: 'distress_beacon',
    name: 'Distress Beacon',
    icon: 'radio',
    description: 'A weak distress signal pulses from a stranded vessel nearby. They request assistance.',
    securityWeight: { anarchy: 1, low: 2, medium: 2, high: 2 },
    options: [
      { id: 'help', label: 'Render Aid', desc: 'Approach and assist' },
      { id: 'ignore', label: 'Ignore', desc: 'Continue your journey' },
    ],
  },
  {
    id: 'smuggler_offer',
    name: 'Smuggler Contact',
    icon: 'package',
    description: 'An unmarked ship hails you privately: "I have merchandise the authorities would rather you not carry. Interested?"',
    securityWeight: { anarchy: 3, low: 2, medium: 1, high: 0 },
    options: [
      { id: 'buy', label: 'Buy Contraband', desc: 'Purchase illegal goods cheap' },
      { id: 'decline', label: 'Decline', desc: 'Refuse the offer' },
    ],
  },
  {
    id: 'abandoned_ship',
    name: 'Derelict Vessel',
    icon: 'ghost',
    description: 'A derelict ship drifts silently in the void. No life signs detected. Salvageable materials may be aboard.',
    securityWeight: { anarchy: 2, low: 2, medium: 1, high: 1 },
    options: [
      { id: 'salvage', label: 'Salvage', desc: 'Board and strip the vessel' },
      { id: 'ignore', label: 'Move On', desc: 'Leave it alone' },
    ],
  },
  {
    id: 'police_scan',
    name: 'Security Scan',
    icon: 'shield',
    description: 'System security forces are conducting routine scans of passing vessels. "Heave to and submit to inspection."',
    securityWeight: { anarchy: 0, low: 1, medium: 3, high: 4 },
    options: [
      { id: 'comply', label: 'Comply', desc: 'Submit to scan' },
      { id: 'flee', label: 'Run', desc: 'Attempt to escape' },
    ],
  },
  {
    id: 'anomaly',
    name: 'Space Anomaly',
    icon: 'zap',
    description: 'Your sensors detect an unusual energy reading emanating from a nearby region of space. The data is unlike anything in your records.',
    securityWeight: { anarchy: 1, low: 1, medium: 1, high: 1 },
    options: [
      { id: 'investigate', label: 'Investigate', desc: 'Approach the anomaly' },
      { id: 'avoid', label: 'Avoid', desc: 'Steer clear' },
    ],
  },
  {
    id: 'intercepted_comms',
    name: 'Intercepted Transmission',
    icon: 'radio',
    description: 'Your wake scanner catches a fragment of encrypted mission data from a departing vessel. The coordinates and contract details are partially readable.',
    securityWeight: { anarchy: 2, low: 2, medium: 1, high: 1 },
    options: [
      { id: 'steal', label: 'Steal Mission', desc: 'Decode and claim the contract for yourself' },
      { id: 'ignore', label: 'Discard', desc: 'Delete the data — not worth the risk' },
    ],
  },
];

const CONTRABAND_GOODS = ['narcotics', 'performance_enhancers', 'pathogen_culture', 'encrypted_data', 'combat_drones'];
const SALVAGE_MATERIALS = ['iron', 'nickel', 'carbon', 'phosphorus', 'germanium', 'tin', 'tungsten', 'mercury', 'platinum', 'palladium'];
const RARE_MATERIALS = ['iridium', 'painite', 'pristine_diamond', 'low_temp_diamond', 'void_opals', 'alexandrite'];

export function shouldTriggerEncounter(system) {
  const baseChance = { anarchy: 0.22, low: 0.14, medium: 0.08, high: 0.04 };
  const chance = baseChance[system?.security] || 0.1;
  return Math.random() < chance;
}

export function generateEncounter(system) {
  const security = system?.security || 'medium';
  const weighted = [];
  for (const enc of ENCOUNTER_TYPES) {
    const w = enc.securityWeight[security] || 1;
    for (let i = 0; i < w; i++) weighted.push(enc);
  }
  const chosen = weighted[Math.floor(Math.random() * weighted.length)];
  return { ...chosen, systemName: system?.name || 'Unknown', timestamp: Date.now() };
}

export function resolveEncounter(encounter, optionId, gameState) {
  const { ship } = gameState;
  const hasContraband = (ship.cargo || []).some(c => CONTRABAND_GOODS.includes(c.commodity));
  const shipDamage = ship.integrity ?? 100;
  const totalWeapons = Object.values(ship.modules || {})
    .filter(id => typeof id === 'string' && ['pl_1e', 'pl_2e', 'pl_3e', 'pl_4e', 'mc_1e', 'mc_2e', 'can_2e', 'can_3e', 'pa_2e', 'pa_3e'].includes(id))
    .reduce((sum, id) => sum + (id.includes('can') ? 25 : id.includes('pa') ? 50 : 12) * parseInt(id.match(/\d/)?.[0] || 1), 0);

  const outcome = {
    message: '',
    creditsChange: 0,
    damage: 0,
    cargoGained: [],
    cargoLost: [],
    materialsGained: [],
    bounty: 0,
  };

  switch (encounter.id) {
    case 'pirate_ambush': {
      if (optionId === 'fight') {
        if (totalWeapons > 30) {
          outcome.message = 'You exchange fire and destroy the pirate vessel! A bounty reward has been credited.';
          outcome.bounty = Math.floor(Math.random() * 50000) + 10000;
          outcome.creditsChange = outcome.bounty;
          outcome.damage = Math.floor(Math.random() * 10) + 3;
        } else {
          outcome.message = 'Your weapons are too weak. The pirate tears through your hull before you escape.';
          outcome.damage = Math.floor(Math.random() * 20) + 10;
        }
      } else if (optionId === 'flee') {
        if (Math.random() > 0.4) {
          outcome.message = 'You punch the FSD and escape, but take a few hits on the way out.';
          outcome.damage = Math.floor(Math.random() * 8) + 2;
        } else {
          outcome.message = 'The pirate disables your engines. You lose cargo before security arrives.';
          outcome.cargoLost = (ship.cargo || []).slice(0, 1).map(c => c.commodity);
          outcome.damage = Math.floor(Math.random() * 15) + 5;
        }
      } else {
        const payoff = Math.min(gameState.credits, Math.floor(Math.random() * 50000) + 10000);
        outcome.message = `You transfer ${payoff.toLocaleString()} CR to the pirate. They depart satisfied.`;
        outcome.creditsChange = -payoff;
      }
      break;
    }
    case 'distress_beacon': {
      if (optionId === 'help') {
        const trap = Math.random() < 0.25;
        if (trap) {
          outcome.message = 'It was a trap! Pirates ambush you as you approach.';
          outcome.damage = Math.floor(Math.random() * 15) + 5;
          outcome.creditsChange = -(Math.floor(Math.random() * 30000) + 5000);
        } else {
          const reward = Math.floor(Math.random() * 80000) + 20000;
          outcome.message = `The stranded pilot thanks you and transfers ${reward.toLocaleString()} CR as a reward.`;
          outcome.creditsChange = reward;
          if (Math.random() < 0.3) {
            const mat = SALVAGE_MATERIALS[Math.floor(Math.random() * SALVAGE_MATERIALS.length)];
            outcome.materialsGained.push({ materialId: mat, qty: Math.floor(Math.random() * 5) + 1 });
          }
        }
      } else {
        outcome.message = 'You ignore the distress beacon and continue on your way.';
      }
      break;
    }
    case 'smuggler_offer': {
      if (optionId === 'buy') {
        const good = CONTRABAND_GOODS[Math.floor(Math.random() * CONTRABAND_GOODS.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        const cost = Math.floor(Math.random() * 30000) + 5000;
        if (gameState.credits >= cost) {
          outcome.message = `You acquire ${qty} units of ${good.replace(/_/g, ' ')} for ${cost.toLocaleString()} CR.`;
          outcome.creditsChange = -cost;
          outcome.cargoGained.push({ commodity: good, qty });
        } else {
          outcome.message = 'You cannot afford the smuggler\'s price. They depart in disgust.';
        }
      } else {
        outcome.message = 'You decline the offer. The smuggler disappears into the void.';
      }
      break;
    }
    case 'abandoned_ship': {
      if (optionId === 'salvage') {
        const matCount = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < matCount; i++) {
          const isRare = Math.random() < 0.15;
          const pool = isRare ? RARE_MATERIALS : SALVAGE_MATERIALS;
          const mat = pool[Math.floor(Math.random() * pool.length)];
          const existing = outcome.materialsGained.find(m => m.materialId === mat);
          if (existing) existing.qty += Math.floor(Math.random() * 3) + 1;
          else outcome.materialsGained.push({ materialId: mat, qty: Math.floor(Math.random() * 3) + 1 });
        }
        const credits = Math.floor(Math.random() * 50000) + 10000;
        outcome.message = `You strip the derelict. Salvage: ${outcome.materialsGained.map(m => `${m.qty}x ${m.materialId.replace(/_/g, ' ')}`).join(', ')} and ${credits.toLocaleString()} CR in valuables.`;
        outcome.creditsChange = credits;
      } else {
        outcome.message = 'You leave the derelict to drift in the void.';
      }
      break;
    }
    case 'police_scan': {
      if (optionId === 'comply') {
        if (hasContraband) {
          const fine = Math.floor(Math.random() * 100000) + 20000;
          outcome.message = `Contraband detected! Your illegal goods are confiscated and you are fined ${fine.toLocaleString()} CR.`;
          outcome.creditsChange = -fine;
          outcome.cargoLost = (ship.cargo || []).filter(c => CONTRABAND_GOODS.includes(c.commodity)).map(c => c.commodity);
        } else {
          outcome.message = 'The scan finds nothing unusual. You are cleared to proceed.';
        }
      } else {
        if (Math.random() > 0.5) {
          outcome.message = 'You outrun the security forces and escape into supercruise.';
          outcome.damage = Math.floor(Math.random() * 5) + 1;
        } else {
          const fine = Math.floor(Math.random() * 200000) + 50000;
          outcome.message = `Security forces disable your ship. You are fined ${fine.toLocaleString()} CR and your cargo is seized.`;
          outcome.creditsChange = -fine;
          outcome.damage = Math.floor(Math.random() * 15) + 5;
          outcome.cargoLost = (ship.cargo || []).map(c => c.commodity);
        }
      }
      break;
    }
    case 'anomaly': {
      if (optionId === 'investigate') {
        const danger = Math.random() < 0.35;
        if (danger) {
          outcome.message = 'The anomaly destabilizes your FSD. Your ship takes damage, but you collect strange data worth credits.';
          outcome.damage = Math.floor(Math.random() * 20) + 5;
          outcome.creditsChange = Math.floor(Math.random() * 60000) + 20000;
        } else {
          const mat = RARE_MATERIALS[Math.floor(Math.random() * RARE_MATERIALS.length)];
          const qty = Math.floor(Math.random() * 4) + 2;
          outcome.message = `You collect anomalous materials from the phenomenon: ${qty}x ${mat.replace(/_/g, ' ')}.`;
          outcome.materialsGained.push({ materialId: mat, qty });
          outcome.creditsChange = Math.floor(Math.random() * 40000) + 10000;
        }
      } else {
        outcome.message = 'You steer clear of the anomaly and continue safely.';
      }
      break;
    }
    case 'intercepted_comms': {
      if (optionId === 'steal') {
        const types = ['delivery', 'courier', 'mining', 'salvage'];
        const stolenType = types[Math.floor(Math.random() * types.length)];
        const reward = Math.floor(Math.random() * 150000) + 50000;
        const stolenMission = {
          id: `stolen_${Date.now()}`,
          type: stolenType,
          reward,
          destinationSystem: { name: gameState.currentSystem.name, seed: gameState.currentSystem.seed },
          stolen: true,
          desc: 'Intercepted contract — origin unknown.',
          accepted: true,
        };
        outcome.message = `You decode the transmission and claim the contract. A ${stolenType} mission worth ${reward.toLocaleString()} CR is now yours.`;
        outcome.stolenMission = stolenMission;
        if (Math.random() < 0.2) {
          outcome.crimeFlag = 'hacking';
          outcome.message += ' Your interception was traced — notoriety increased.';
        }
      } else {
        outcome.message = 'You purge the intercepted data and continue on your way.';
      }
      break;
    }
    default:
      outcome.message = 'Nothing happens.';
  }

  return outcome;
}