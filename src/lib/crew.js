// Crew system — hire NPC co-pilots that provide passive ship bonuses

const FIRST_NAMES = ['James', 'Elena', 'Viktor', 'Maya', 'Rex', 'Anya', 'Cole', 'Nadia', 'Dmitri', 'Sara', 'Hugo', 'Lena', 'Boris', 'Iris', 'Finn', 'Vera'];
const LAST_NAMES = ['Carter', 'Voss', 'Reyes', 'Kane', 'Drake', 'Petrov', 'Stone', 'Lazar', 'Holt', 'Reyes', 'Black', 'Vega', 'Stern', 'Knox', 'Marsh', 'Diaz'];

export const CREW_ROLES = [
  { id: 'pilot', name: 'Pilot', bonus: { jumpRange: 0.05 }, bonusLabel: '+5% Jump Range', salary: 5000, hireCost: 100000, desc: 'Skilled navigator who optimises FSD plotting.' },
  { id: 'engineer', name: 'Shield Engineer', bonus: { shield: 0.10 }, bonusLabel: '+10% Shield Strength', salary: 4000, hireCost: 80000, desc: 'Tunes shield generators for maximum resilience.' },
  { id: 'gunner', name: 'Weapons Officer', bonus: { damage: 0.08 }, bonusLabel: '+8% Weapon Damage', salary: 4500, hireCost: 90000, desc: 'Precision targeting specialist for hardpoint systems.' },
  { id: 'sensor', name: 'Sensor Operator', bonus: { scanValue: 0.15 }, bonusLabel: '+15% Scan Value', salary: 3000, hireCost: 60000, desc: 'Enhances scan resolution for richer exploration data.' },
  { id: 'mechanic', name: 'Chief Mechanic', bonus: { wearReduction: 0.50 }, bonusLabel: '-50% Wear Rate', salary: 3500, hireCost: 70000, desc: 'Keeps modules running smoothly, reducing jump wear.' },
];

export const CREW_ROLE_MAP = CREW_ROLES.reduce((m, r) => { m[r.id] = r; return m; }, {});

export function generateCrewName() {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${fn} ${ln}`;
}

export const CREW_LEVELS = [
  { level: 1, xpRequired: 0, bonusMult: 1.0, title: 'Rookie' },
  { level: 2, xpRequired: 1000, bonusMult: 1.2, title: 'Trained' },
  { level: 3, xpRequired: 5000, bonusMult: 1.5, title: 'Veteran' },
  { level: 4, xpRequired: 20000, bonusMult: 2.0, title: 'Elite' },
  { level: 5, xpRequired: 100000, bonusMult: 3.0, title: 'Elite I' },
];

export function getCrewLevel(xp) {
  const totalXp = (xp || 0) + Math.floor(((Date.now() - 0) / 3600000) * 0); // stored XP only
  let idx = 0;
  for (let i = 0; i < CREW_LEVELS.length; i++) {
    if (totalXp >= CREW_LEVELS[i].xpRequired) idx = i;
  }
  return { idx, ...CREW_LEVELS[idx] };
}

export function getCrewTotalXp(member) {
  const hoursServed = (Date.now() - (member.hireDate || Date.now())) / 3600000;
  return (member.xp || 0) + Math.floor(hoursServed * 50);
}

export function getCrewBonuses(crew) {
  const bonuses = { jumpRange: 0, shield: 0, damage: 0, scanValue: 0, wearReduction: 0 };
  for (const member of crew || []) {
    const role = CREW_ROLE_MAP[member.role];
    if (!role) continue;
    const level = getCrewLevel(getCrewTotalXp(member));
    for (const [key, val] of Object.entries(role.bonus)) {
      bonuses[key] = (bonuses[key] || 0) + val * level.bonusMult;
    }
  }
  return bonuses;
}

export function calculateSalaryOwed(crew) {
  let total = 0;
  const now = Date.now();
  for (const member of crew || []) {
    const role = CREW_ROLE_MAP[member.role];
    if (!role) continue;
    const hours = (now - (member.lastPaid || member.hireDate)) / 3600000;
    total += role.salary * hours;
  }
  return Math.floor(total);
}

export function applyCrewBonusesToStats(stats, crew) {
  const b = getCrewBonuses(crew);
  return {
    ...stats,
    jumpRange: Math.round(stats.jumpRange * (1 + b.jumpRange) * 10) / 10,
    shield: Math.round(stats.shield * (1 + b.shield)),
    totalDamage: Math.round(stats.totalDamage * (1 + b.damage)),
  };
}