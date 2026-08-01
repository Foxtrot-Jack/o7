// Canis Stella — micro faction system with corporate rank ladder and guilded carriers

export const CANIS_STELLA_RANKS = [
  { name: 'Prospect', threshold: 0, desc: 'Entry-level recruit' },
  { name: 'Associate', threshold: 500, desc: 'Probationary member' },
  { name: 'Analyst', threshold: 2000, desc: 'Data operations' },
  { name: 'Specialist', threshold: 5000, desc: 'Field operations' },
  { name: 'Coordinator', threshold: 12000, desc: 'Regional oversight' },
  { name: 'Manager', threshold: 30000, desc: 'Department lead' },
  { name: 'Senior Manager', threshold: 75000, desc: 'Multi-system operations' },
  { name: 'Director', threshold: 150000, desc: 'Sector command' },
  { name: 'Vice President', threshold: 350000, desc: 'Division leadership' },
  { name: 'Senior VP', threshold: 750000, desc: 'Executive council' },
  { name: 'Executive VP', threshold: 1500000, desc: 'C-suite adjacent' },
  { name: 'Chief Operating Officer', threshold: 3000000, desc: 'Day-to-day sovereignty' },
  { name: 'Chief Executive Officer', threshold: 6000000, desc: 'Founder — top of the corporate food chain' },
];

export const CEO_TITLE = 'Corporate Sovereign of Canis Stella';
export const GUILDED_CARRIER_COST = 25000000000; // 25 billion
export const GUILDED_MULTIPLIER = 25;
export const GUILDED_VISUAL_SCALE = 1.5;

export const MISSION_REP_REWARD = 50;

export function getCanisStellaRank(reputation) {
  let rankIdx = 0;
  for (let i = 0; i < CANIS_STELLA_RANKS.length; i++) {
    if (reputation >= CANIS_STELLA_RANKS[i].threshold) rankIdx = i;
  }
  return { rank: rankIdx, ...CANIS_STELLA_RANKS[rankIdx] };
}

export function isCEO(reputation) {
  return reputation >= CANIS_STELLA_RANKS[CANIS_STELLA_RANKS.length - 1].threshold;
}

export function getNextRank(reputation) {
  const current = getCanisStellaRank(reputation);
  if (current.rank >= CANIS_STELLA_RANKS.length - 1) return null;
  return CANIS_STELLA_RANKS[current.rank + 1];
}

export function hasGuildedCarrier(state) {
  return (state.fleetCarriers || []).some(c => c.isGuilded);
}