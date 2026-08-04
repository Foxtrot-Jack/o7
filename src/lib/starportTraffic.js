// Starport Traffic — simulated landing-pad traffic at the current station.
// NPC ships cycle through approach → docking → docked → departing, emitting
// radio chatter. Founder aliases (from contributors.js) occasionally appear as
// pilots so contributors can spot their NPC at the dock — a secondary
// Founder Sighting channel alongside the random travel encounter.
import { SHIP_TYPES } from './shipRoster';
import { getRandomFounderName, getContributorCount } from './contributors';

const NPC_FIRST = ['Vex', 'Korra', 'Dax', 'Rima', 'Solon', 'Tova', 'Nyx', 'Orin', 'Pax', 'Lira', 'Mira', 'Garr', 'Sable', 'Wren', 'Cade', 'Iolo', 'Rusk', 'Hela', 'Bram', 'Jovan', 'Sera', 'Kade', 'Nima', 'Roan'];
const NPC_LAST = ['Vance', 'Okoro', 'Sund', 'Reza', 'Kell', 'Voss', 'Marr', 'Thane', 'Drake', 'Sol', 'Aza', 'Kor', 'Vell', 'Cross', 'Nimo', 'Hark', 'Falke', 'Orin', 'Bex', 'Sedgewick'];

// Slowed down for a more leisurely, watchable dock scene.
const DURATIONS = {
  approaching: [7000, 13000],
  docking: [5000, 9000],
  docked: [14000, 28000],
  departing: [5500, 10000],
};

let _id = 0;

function randDur(range) {
  return (range[0] + Math.random() * (range[1] - range[0]));
}

function randomPilot() {
  // ~22% founder pilot if any contributors exist
  if (getContributorCount() > 0 && Math.random() < 0.22) {
    const alias = getRandomFounderName();
    if (alias) return { name: alias, founder: true };
  }
  const f = NPC_FIRST[Math.floor(Math.random() * NPC_FIRST.length)];
  const l = NPC_LAST[Math.floor(Math.random() * NPC_LAST.length)];
  return { name: `${f} ${l}`, founder: false };
}

export function spawnShip() {
  const t = SHIP_TYPES[Math.floor(Math.random() * SHIP_TYPES.length)];
  const pilot = randomPilot();
  return {
    id: 'npc_' + (++_id),
    shipName: t.name,
    shipClass: t.class || 1,
    pilot: pilot.name,
    founder: pilot.founder,
    // Per-ship pace multiplier — some pilots fly briskly, others lumber.
    speed: 0.6 + Math.random() * 0.9,
    state: 'holding',
    pad: null,
    timer: 0,
    duration: 0,
  };
}

export function createPads(count = 8) {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, ship: null }));
}

// Advance the simulation by dt ms. Returns new { pads, queue, events }.
// events: chatter lines produced by state transitions this tick.
export function tickStarport(pads, queue, dt) {
  const events = [];
  const newPads = pads.map(p => ({ id: p.id, ship: p.ship ? { ...p.ship } : null }));
  const newQueue = queue.map(s => ({ ...s }));

  // Advance ships occupying pads (approaching / docking / docked / departing)
  for (const pad of newPads) {
    if (!pad.ship) continue;
    const s = pad.ship;
    s.timer += dt;
    if (s.state === 'approaching' && s.timer >= s.duration) {
      s.state = 'docking';
      s.timer = 0;
      s.duration = randDur(DURATIONS.docking) * (s.speed || 1);
      events.push({ line: `${s.shipName} (${s.pilot}) beginning landing sequence, pad ${pad.id}.`, founder: s.founder });
    } else if (s.state === 'docking' && s.timer >= s.duration) {
      s.state = 'docked';
      s.timer = 0;
      s.duration = randDur(DURATIONS.docked) * (s.speed || 1);
      events.push({ line: `${s.shipName} (${s.pilot}) settled on pad ${pad.id}.`, founder: s.founder });
    } else if (s.state === 'docked' && s.timer >= s.duration) {
      s.state = 'departing';
      s.timer = 0;
      s.duration = randDur(DURATIONS.departing) * (s.speed || 1);
      events.push({ line: `${s.shipName} (${s.pilot}) departing pad ${pad.id} — safe skies.`, founder: s.founder });
    } else if (s.state === 'departing' && s.timer >= s.duration) {
      pad.ship = null;
    }
  }

  // Advance holding ships — assign to a free pad when one is available
  for (let i = newQueue.length - 1; i >= 0; i--) {
    const s = newQueue[i];
    s.timer += dt;
    const free = newPads.find(p => !p.ship);
    if (free) {
      s.state = 'approaching';
      s.pad = free.id;
      s.timer = 0;
      s.duration = randDur(DURATIONS.approaching) * (s.speed || 1);
      free.ship = { ...s };
      events.push({ line: `${s.shipName} (${s.pilot}) cleared for approach, pad ${free.id}.`, founder: s.founder });
      newQueue.splice(i, 1);
    }
  }

  return { pads: newPads, queue: newQueue, events };
}