// Carrier Crew — NPC crew assigned to fleet carriers.
//
// Carriers need crew to operate services efficiently. Each crew member has a
// role, level, morale, and salary. Crew efficiency boosts carrier income.
// Distinct from ship crew (crew.js) — these are the large carrier staff.

const FIRST_NAMES = ['Marcus', 'Elena', 'Dmitri', 'Yuki', 'Cole', 'Anya', 'Rex', 'Nadia', 'Hugo', 'Lena', 'Boris', 'Iris', 'Finn', 'Vera', 'Kai', 'Zara'];
const LAST_NAMES = ['Okonkwo', 'Voss', 'Reyes', 'Kane', 'Drake', 'Petrov', 'Stone', 'Lazar', 'Holt', 'Black', 'Vega', 'Stern', 'Knox', 'Marsh', 'Diaz', 'Rourke'];

export const CARRIER_CREW_ROLES = [
  { id: 'quartermaster', name: 'Quartermaster', bonus: { efficiency: 0.10 }, bonusLabel: '+10% Income', salary: 8000, hireCost: 150000, desc: 'Manages carrier market operations and trade logistics.' },
  { id: 'engineer', name: 'Chief Engineer', bonus: { efficiency: 0.08, tritiumSavings: 0.15 }, bonusLabel: '+8% Income, -15% Tritium', salary: 7000, hireCost: 140000, desc: 'Optimises reactor and service power draw.' },
  { id: 'purser', name: 'Shipyard Purser', bonus: { efficiency: 0.06 }, bonusLabel: '+6% Income', salary: 6000, hireCost: 120000, desc: 'Oversees shipyard and outfitting sales.' },
  { id: 'medic', name: 'Chief Medic', bonus: { moraleBoost: 5 }, bonusLabel: '+5 Crew Morale', salary: 5000, hireCost: 100000, desc: 'Keeps crew healthy and morale high.' },
  { id: 'security', name: 'Security Chief', bonus: { efficiency: 0.05 }, bonusLabel: '+5% Income', salary: 5500, hireCost: 110000, desc: 'Protects carrier assets and deters piracy.' },
];

export const CARRIER_CREW_ROLE_MAP = CARRIER_CREW_ROLES.reduce((m, r) => { m[r.id] = r; return m; }, {});

export function generateCarrierCrewName() {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${fn} ${ln}`;
}

export const CARRIER_CREW_LEVELS = [
  { level: 1, xpRequired: 0, bonusMult: 1.0, title: 'Rookie' },
  { level: 2, xpRequired: 2000, bonusMult: 1.2, title: 'Trained' },
  { level: 3, xpRequired: 10000, bonusMult: 1.5, title: 'Veteran' },
  { level: 4, xpRequired: 40000, bonusMult: 2.0, title: 'Elite' },
  { level: 5, xpRequired: 200000, bonusMult: 3.0, title: 'Elite I' },
];

export function getCarrierCrewLevel(xp) {
  let idx = 0;
  for (let i = 0; i < CARRIER_CREW_LEVELS.length; i++) {
    if ((xp || 0) >= CARRIER_CREW_LEVELS[i].xpRequired) idx = i;
  }
  return { idx, ...CARRIER_CREW_LEVELS[idx] };
}

// Aggregate bonuses from all carrier crew — used by the economy tick
export function getCarrierCrewBonuses(crew = []) {
  const bonuses = { efficiency: 0, tritiumSavings: 0, moraleBoost: 0 };
  for (const member of crew) {
    const role = CARRIER_CREW_ROLE_MAP[member.role];
    if (!role) continue;
    const level = getCarrierCrewLevel(member.xp || 0);
    const moraleMult = 0.5 + (member.morale ?? 75) / 100;
    for (const [key, val] of Object.entries(role.bonus)) {
      bonuses[key] = (bonuses[key] || 0) + val * level.bonusMult * moraleMult;
    }
  }
  return bonuses;
}

// Calculate salary owed per hour for carrier crew
export function calculateCarrierCrewSalaryRate(crew = []) {
  let total = 0;
  for (const member of crew) {
    const role = CARRIER_CREW_ROLE_MAP[member.role];
    if (!role) continue;
    total += role.salary;
  }
  return total; // CR/hour
}

// Create a new carrier crew member
export function createCarrierCrewMember(roleId) {
  return {
    id: `ccrew_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    role: roleId,
    name: generateCarrierCrewName(),
    xp: 0,
    morale: 75,
    hireDate: Date.now(),
  };
}