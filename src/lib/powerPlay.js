// Power Play — join galactic powers for reputation, perks, and bonuses

export const POWERS = [
  {
    id: 'Mahon', name: 'Edmund Mahon', faction: 'Alliance',
    color: '#44aa44', desc: 'Trade-focused power. Bonuses to commodity profits and contract income.',
    perk: { tradeProfit: 0.10, contractIncome: 0.10 },
    perkLabel: '+10% trade profit, +10% contract income',
  },
  {
    id: 'Lavigny', name: 'Arissa Lavigny-Duval', faction: 'Empire',
    color: '#aa44aa', desc: 'Imperial authority. Bonuses to mission rewards and outfitting discounts.',
    perk: { missionReward: 0.15, outfittingDiscount: 0.10 },
    perkLabel: '+15% mission rewards, -10% outfitting cost',
  },
  {
    id: 'Hudson', name: 'Zachary Hudson', faction: 'Federation',
    color: '#4488cc', desc: 'Federal military. Bonuses to ship stats and repair efficiency.',
    perk: { shipStats: 0.05, repairCost: 0.20 },
    perkLabel: '+5% ship stats, -20% repair cost',
  },
  {
    id: 'Antal', name: 'Pranav Antal', faction: 'Utopia',
    color: '#ccaa44', desc: 'Exploration-focused. Bonuses to scan value and data selling.',
    perk: { scanValue: 0.20, dataBonus: 0.10 },
    perkLabel: '+20% scan value, +10% data sell bonus',
  },
  {
    id: 'Winters', name: 'Felicia Winters', faction: 'Federation',
    color: '#44ccaa', desc: 'Medical and humanitarian. Bonuses to colony growth and happiness.',
    perk: { colonyGrowth: 0.25, colonyHappiness: 10 },
    perkLabel: '+25% colony growth, +10 colony happiness',
  },
  {
    id: 'Patreus', name: 'Denton Patreus', faction: 'Empire',
    color: '#cc4444', desc: 'Military supplier. Bonuses to weapon damage and carrier income.',
    perk: { weaponDamage: 0.10, carrierIncome: 0.15 },
    perkLabel: '+10% weapon damage, +15% carrier income',
  },
];

export const POWER_MAP = POWERS.reduce((m, p) => { m[p.id] = p; return m; }, {});

export const POWER_RANKS = [
  { name: 'Outsider', threshold: 0 },
  { name: 'Supporter', threshold: 10000 },
  { name: 'Sycophant', threshold: 50000 },
  { name: 'Confidant', threshold: 200000 },
  { name: 'Agent', threshold: 500000 },
  { name: 'Champion', threshold: 1000000 },
  { name: 'Vanguard', threshold: 5000000 },
  { name: 'Patron', threshold: 10000000 },
];

export function getPowerRank(reputation) {
  let idx = 0;
  for (let i = 0; i < POWER_RANKS.length; i++) {
    if (reputation >= POWER_RANKS[i].threshold) idx = i;
  }
  return { idx, ...POWER_RANKS[idx] };
}

export function getPowerPerks(powerId) {
  const power = POWER_MAP[powerId];
  return power ? power.perk : {};
}