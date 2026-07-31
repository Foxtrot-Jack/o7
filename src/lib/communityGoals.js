// Community Goals — weekly rotating objectives with tiered rewards

export const GOAL_TYPES = [
  { type: 'trade', desc: 'Deliver Technology goods', commodityCategory: 'Technology', icon: '📦' },
  { type: 'trade', desc: 'Deliver Medical supplies', commodityCategory: 'Medical', icon: '💊' },
  { type: 'trade', desc: 'Deliver Industrial materials', commodityCategory: 'Industrial Materials', icon: '🏭' },
  { type: 'trade', desc: 'Deliver Foods', commodityCategory: 'Foods', icon: '🌾' },
  { type: 'mining', desc: 'Supply raw Platinum', materialId: 'platinum', icon: '⛏️' },
  { type: 'mining', desc: 'Supply Painite ore', materialId: 'painite', icon: '💎' },
  { type: 'mining', desc: 'Supply Low-Temp Diamonds', materialId: 'low_temp_diamond', icon: '🔷' },
  { type: 'mining', desc: 'Supply Tritium fuel', materialId: 'tritium', icon: '⛽' },
  { type: 'exploration', desc: 'Scan stellar bodies', icon: '🔭' },
  { type: 'exploration', desc: 'Map planetary surfaces', icon: '🛰️' },
  { type: 'combat', desc: 'Bounty hunting sweep — eliminate hostiles', icon: '⚔️' },
  { type: 'construction', desc: 'Deliver Metals for station construction', commodityCategory: 'Metals', icon: '🏗️' },
  { type: 'construction', desc: 'Deliver Technology for megaship project', commodityCategory: 'Technology', icon: '🚀' },
];

export const GOAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateCommunityGoals() {
  const numGoals = 3 + Math.floor(Math.random() * 2);
  const shuffled = [...GOAL_TYPES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numGoals);
  return selected.map((g, i) => {
    const target = g.type === 'trade'
      ? Math.floor(50 + Math.random() * 150)
      : g.type === 'mining'
        ? Math.floor(20 + Math.random() * 80)
        : Math.floor(10 + Math.random() * 40);
    const rewardPerUnit = g.type === 'trade' ? 50000 : g.type === 'mining' ? 100000 : 200000;
    const reward = target * rewardPerUnit;
    return {
      id: `goal_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      type: g.type,
      desc: g.desc,
      icon: g.icon,
      commodityCategory: g.commodityCategory || null,
      materialId: g.materialId || null,
      target,
      progress: 0,
      reward,
      deadline: Date.now() + GOAL_DURATION,
      completed: false,
      claimed: false,
    };
  });
}

export function getTimeRemaining(deadline) {
  const ms = deadline - Date.now();
  if (ms <= 0) return 'EXPIRED';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

export const REWARD_TIERS = [
  { threshold: 100, label: 'Champion', mult: 1.0 },
  { threshold: 75, label: 'Top Contributor', mult: 0.75 },
  { threshold: 50, label: 'Achiever', mult: 0.5 },
  { threshold: 25, label: 'Contributor', mult: 0.25 },
  { threshold: 10, label: 'Participant', mult: 0.1 },
];

export function getCurrentTier(progressPct) {
  for (const t of REWARD_TIERS) {
    if (progressPct >= t.threshold) return t;
  }
  return null;
}

export function generateLeaderboard(goalProgress, playerContribution) {
  const names = ['Cmdr RedNova', 'Cmdr SteelDrift', 'Cmdr VoidRunner', 'Cmdr NebulaHunter', 'Cmdr Ironclad'];
  const entries = names.map((name, i) => ({
    name,
    contribution: Math.floor(goalProgress * (0.18 - i * 0.03)),
  }));
  entries.push({ name: 'YOU', contribution: playerContribution, isPlayer: true });
  return entries.sort((a, b) => b.contribution - a.contribution);
}