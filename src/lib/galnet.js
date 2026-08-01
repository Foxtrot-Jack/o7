// StarNet News Feed — procedurally generated in-universe news articles
// Categories: political, economic, exploration, community, anomalies

const FACTION_NAMES = ['Republic', 'Dynasty', 'Coalition', 'Independent Coalition', 'Pilots Guild', 'Shadow Council'];
const SYSTEM_PREFIXES = ['New', 'Alpha', 'Beta', 'Delta', 'Epsilon', 'Theta', 'Kappa', 'Sigma', 'Omega', 'Tau'];
const SYSTEM_SUFFIXES = ['Reach', 'Horizon', 'Verge', 'Crossing', 'Anchor', 'Gate', 'Fall', 'Rise', 'Drift', 'Beacon'];

function randomFrom(arr, seed) {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

export const NEWS_CATEGORIES = {
  political: { label: 'Political', color: 'text-blue-400', icon: 'landmark' },
  economic: { label: 'Economic', color: 'text-green-400', icon: 'trending-up' },
  exploration: { label: 'Exploration', color: 'text-cyan-400', icon: 'telescope' },
  community: { label: 'Community', color: 'text-yellow-400', icon: 'users' },
  anomalies: { label: 'Anomalies', color: 'text-purple-400', icon: 'alert-triangle' },
};

const TEMPLATES = {
  political: [
    (s) => `${randomFrom(FACTION_NAMES, s)} declares expanded trade routes through the ${randomFrom(SYSTEM_PREFIXES, s+0.1)} ${randomFrom(SYSTEM_SUFFIXES, s+0.2)} system, citing growing civilian demand.`,
    (s) => `Tensions rise as ${randomFrom(FACTION_NAMES, s+0.3)} and ${randomFrom(FACTION_NAMES, s+0.7)} dispute mining rights in the outer rim.`,
    (s) => `The ${randomFrom(FACTION_NAMES, s+0.5)} Senate approves a new defense budget, commissioning three capital-class vessels for frontier patrol.`,
    (s) => `Diplomatic relations between ${randomFrom(FACTION_NAMES, s+0.2)} and ${randomFrom(FACTION_NAMES, s+0.8)} show signs of improvement after summit talks.`,
    (s) => `Civil unrest reported in the ${randomFrom(SYSTEM_PREFIXES, s+0.4)} ${randomFrom(SYSTEM_SUFFIXES, s+0.9)} system as citizens protest fuel rationing.`,
  ],
  economic: [
    (s) => `Tritium futures spike 12% as carrier operators stockpile ahead of the projected supply shortage in ${randomFrom(SYSTEM_PREFIXES, s+0.1)} ${randomFrom(SYSTEM_SUFFIXES, s+0.2)}.`,
    (s) => `Rare mineral markets surge following the discovery of a high-yield ${randomFrom(['painite', 'void opal', 'alexandrite', 'low temperature diamond'], s+0.3)} deposit.`,
    (s) => `Trade analysts report a 23% increase in luxury goods shipments through ${randomFrom(SYSTEM_PREFIXES, s+0.5)} ${randomFrom(SYSTEM_SUFFIXES, s+0.6)} this quarter.`,
    (s) => `Commodity prices fluctuate as ${randomFrom(FACTION_NAMES, s+0.7)} announces new import tariffs on industrial materials.`,
    (s) => `Mining corporations report record profits from deep-core extraction operations in the outer galactic arm.`,
  ],
  exploration: [
    (s) => `Cartographics confirms the discovery of a new Earth-like world in the ${randomFrom(SYSTEM_PREFIXES, s+0.1)} ${randomFrom(SYSTEM_SUFFIXES, s+0.2)} system. First discovery bonus pending.`,
    (s) => `Explorers returning from the galactic rim report unprecedented concentrations of biological signals on ammonia worlds.`,
    (s) => `A pilot has charted a new neutron star corridor, reducing travel time to the frontier by 40 jumps.`,
    (s) => `The Pilots Federation awards an Elite rank to a commander for mapping over 10,000 stellar bodies in a single expedition.`,
    (s) => `Ancient ruins discovered on a remote moon in the ${randomFrom(SYSTEM_PREFIXES, s+0.3)} ${randomFrom(SYSTEM_SUFFIXES, s+0.4)} system. Archaeological teams dispatched.`,
  ],
  community: [
    (s) => `Weekly community goal targets delivered: pilots contribute record tonnage to the ${randomFrom(SYSTEM_PREFIXES, s+0.1)} ${randomFrom(SYSTEM_SUFFIXES, s+0.2)} relief effort.`,
    (s) => `The Pilots Federation announces a new initiative rewarding commanders who chart unexplored regions near the galactic core.`,
    (s) => `Carrier owners rally to support a trade convoy through a pirate-infested corridor. Volunteer escorts requested.`,
    (s) => `Community milestone: pilots collectively deliver over 50 million tonnes of supplies to frontier colonies this month.`,
    (s) => `A charity auction for rare exploration data raises 2 billion credits for displaced colonists in the outer systems.`,
  ],
  anomalies: [
    (s) => `Astronomers detect an unexplained energy signature emanating from a region near ${randomFrom(SYSTEM_PREFIXES, s+0.1)} ${randomFrom(SYSTEM_SUFFIXES, s+0.2)}. Investigation ongoing.`,
    (s) => `Multiple pilots report anomalous sensor readings during hyperspace jumps through the northern arm. FSD manufacturers investigating.`,
    (s) => `A derelict megaship of unknown origin drifts through the ${randomFrom(SYSTEM_PREFIXES, s+0.3)} ${randomFrom(SYSTEM_SUFFIXES, s+0.4)} system. No life signs detected.`,
    (s) => `Thargoid-like surface formations discovered on a barren world. Scientists divided on their origin.`,
    (s) => `Time dilation anomalies reported near a black hole in the deep frontier. Pilots advised to maintain safe distance.`,
  ],
};

export function generateNews(gameState) {
  const seed = (gameState.totalJumps || 0) * 7 + Math.floor(Date.now() / 3600000);
  const articles = [];
  const categories = Object.keys(TEMPLATES);
  let s = seed * 0.1234;

  for (let i = 0; i < 12; i++) {
    const cat = categories[Math.floor(s * categories.length) % categories.length];
    const templates = TEMPLATES[cat];
    const template = templates[Math.floor(s * templates.length) % templates.length];
    s += 0.371;
    articles.push({
      id: `news_${i}_${Math.floor(s * 1000000)}`,
      category: cat,
      headline: template(s),
      timestamp: Date.now() - Math.floor(s * 86400000),
    });
  }

  // Inject dynamic articles from game state
  if (gameState.communityGoals?.length > 0) {
    const goal = gameState.communityGoals.find(g => !g.claimed) || gameState.communityGoals[0];
    if (goal) {
      articles.unshift({
        id: 'news_goal_active',
        category: 'community',
        headline: `Active community goal: ${goal.desc}. Progress at ${Math.round((goal.progress / goal.target) * 100)}%.`,
        timestamp: Date.now(),
      });
    }
  }
  if (gameState.powerPlay) {
    articles.unshift({
      id: 'news_power',
      category: 'political',
      headline: `${gameState.powerPlay.powerName} consolidates influence. Rank ${gameState.powerPlay.rank} commanders report increased operational support.`,
      timestamp: Date.now() - 3600000,
    });
  }

  return articles;
}