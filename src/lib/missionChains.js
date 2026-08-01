// Mission Chains — multi-part story arcs with branching outcomes

export const CHAIN_TEMPLATES = [
  {
    id: 'missing_person',
    title: 'The Lost Surveyor',
    desc: 'A surveyor vanished during a deep-space expedition. Track their last known trajectory.',
    steps: [
      { desc: 'Scan the last known system for anomalous signals', type: 'scan' },
      { desc: 'Travel to the signal origin system', type: 'travel' },
      { desc: 'Recover the surveyor\'s black box from the debris field', type: 'recover' },
    ],
    stepReward: 100000,
    finalReward: 500000,
    earnedTitle: 'The Finder',
  },
  {
    id: 'trade_war',
    title: 'Trade War',
    desc: 'Two factions are locked in a bitter trade dispute. Choose a side and tip the balance.',
    steps: [
      { desc: 'Deliver 10 tons of cargo to your chosen faction', type: 'deliver' },
      { desc: 'Eliminate 3 rival faction traders', type: 'combat' },
      { desc: 'Broker a ceasefire at the negotiation station', type: 'travel' },
    ],
    stepReward: 150000,
    finalReward: 750000,
    earnedTitle: 'The Broker',
  },
  {
    id: 'pirate_king',
    title: 'Pirate King Takedown',
    desc: 'A notorious pirate king is terrorizing the trade lanes. Build a case and take them down.',
    steps: [
      { desc: 'Collect 3 intelligence reports from informants', type: 'collect' },
      { desc: 'Interdict and defeat 2 pirate lieutenants', type: 'combat' },
      { desc: 'Confront the Pirate King at their hideout', type: 'combat' },
      { desc: 'Recover the stolen cargo cache', type: 'recover' },
    ],
    stepReward: 200000,
    finalReward: 1500000,
    earnedTitle: 'Pirate Slayer',
  },
  {
    id: 'alien_artifact',
    title: 'The Alien Artifact',
    desc: 'Strange readings point to an alien artifact of immense value. Race against rival scavengers.',
    steps: [
      { desc: 'Scan 3 systems for anomalous energy signatures', type: 'scan' },
      { desc: 'Travel to the artifact\'s location', type: 'travel' },
      { desc: 'Decode the alien lock mechanism', type: 'decode' },
      { desc: 'Extract the artifact safely', type: 'recover' },
    ],
    stepReward: 250000,
    finalReward: 2000000,
    earnedTitle: 'Xenoarchaeologist',
  },
];

export function generateMissionChain() {
  const template = CHAIN_TEMPLATES[Math.floor(Math.random() * CHAIN_TEMPLATES.length)];
  return {
    id: `chain_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: template.title,
    desc: template.desc,
    steps: template.steps.map(s => ({ ...s, completed: false })),
    currentStep: 0,
    stepReward: template.stepReward,
    finalReward: template.finalReward,
    earnedTitle: template.earnedTitle || template.title,
    startedAt: Date.now(),
  };
}

export function getChainProgress(chain) {
  const total = chain.steps.length;
  const done = chain.steps.filter(s => s.completed).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}