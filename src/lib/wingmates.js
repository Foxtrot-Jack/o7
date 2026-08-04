// Wingmates — hired NPC pilots that provide combat support

export const PILOT_RANKS = [
  { rank: 0, label: 'Rookie', hireCost: 50000, weeklyCost: 2500, combatSkill: 0.3 },
  { rank: 1, label: 'Competent', hireCost: 200000, weeklyCost: 10000, combatSkill: 0.5 },
  { rank: 2, label: 'Expert', hireCost: 500000, weeklyCost: 25000, combatSkill: 0.7 },
  { rank: 3, label: 'Master', hireCost: 1500000, weeklyCost: 75000, combatSkill: 0.9 },
  { rank: 4, label: 'Elite', hireCost: 5000000, weeklyCost: 250000, combatSkill: 1.2 },
];

const FIRST_NAMES = ['Jax', 'Vera', 'Kai', 'Zara', 'Rook', 'Nyx', 'Drax', 'Iris', 'Cole', 'Ryn', 'Sable', 'Fen', 'Mara', 'Dex', 'Lyra', 'Orin'];
const LAST_NAMES = ['Voss', 'Kane', 'Reyes', 'Xu', 'Drake', 'Cross', 'Stone', 'Vale', 'Rourke', 'Sinclair', 'Kovac', 'Maddox', 'Thorne', 'Pike'];

export function generatePilot() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const rankIdx = Math.floor(Math.random() * PILOT_RANKS.length);
  const r = PILOT_RANKS[rankIdx];
  return {
    id: `pilot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: `CMDR ${first} ${last}`,
    rank: r.rank,
    rankLabel: r.label,
    hireCost: r.hireCost,
    weeklyCost: r.weeklyCost,
    combatSkill: r.combatSkill,
  };
}

export function generatePilotRoster(count = 4) {
  return Array.from({ length: count }, generatePilot);
}

// Compute combat bonuses from active wingmates
export function getWingmateBonuses(wingmates) {
  if (!wingmates || wingmates.length === 0) return null;
  let damageBonus = 0;
  let speedBonus = 0;
  const extraAttacks = [];
  for (const wm of wingmates) {
    if (!wm.active) continue;
    const baseDmg = 2 * 15 * wm.combatSkill; // class 2 ship baseline
    damageBonus += baseDmg * 0.3;
    extraAttacks.push({ name: wm.name, damage: baseDmg });
    speedBonus += 0.03;
  }
  if (extraAttacks.length === 0) return null;
  return { damageBonus, speedBonus, extraAttacks };
}