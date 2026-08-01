// Public Holidays — real-life calendar events with lucrative profit opportunities
// Tracked by real calendar dates, announced 2 weeks ahead, lasting 7 days
// Separate from community goals — these are calendar-fixed lore events

export const PUBLIC_HOLIDAYS = [
  {
    id: 'galactic_new_year',
    name: 'Galactic New Year Festival',
    icon: '🎆',
    month: 0, day: 1,
    durationDays: 7,
    countdownDays: 14,
    description: 'The universal new year celebration. All commodity demand surges galaxy-wide.',
    lore: 'When the standard galactic calendar rolls over, the galaxy erupts in celebration. From the Core Worlds to the furthest frontier outpost, stations decorate their docking bays, feasts are prepared, and commodity demand skyrockets. Pilots call it the easiest money of the year — every market doubles its sell prices for the full week.',
    profitType: 'commodity_mult',
    commodityCategories: ['all'],
    profitMult: 2,
    profitSummary: 'ALL commodities sell for 2× normal price at every station.',
  },
  {
    id: 'booze_cruise',
    name: 'The Booze Cruise',
    icon: '🍾',
    month: 1, day: 14,
    durationDays: 7,
    countdownDays: 14,
    description: 'The legendary floating festival. Legal drugs and spirits sell for astronomical prices.',
    lore: 'Once a modest pub crawl among frontier pilots, the Booze Cruise has grown into the galaxy\'s most raucous celebration. Fleets of carriers transform into floating party barges, and the demand for alcohol, tobacco, and recreational substances reaches absurd heights. Savvy traders clear their cargo holds weeks in advance and stockpile every crate of spirits they can find. The payoff is legendary — legal drug commodities sell for ten times their normal value.',
    profitType: 'commodity_mult',
    commodityCategories: ['Legal Drugs'],
    profitMult: 10,
    profitSummary: 'LEGAL DRUGS commodities sell for 10× normal price. Stock up beforehand!',
  },
  {
    id: 'founders_day_core',
    name: 'Founders Day (Core Worlds)',
    icon: '🏛️',
    month: 2, day: 15,
    durationDays: 7,
    countdownDays: 14,
    description: 'Celebrating the founding of Deciat Reach and the Core Worlds bubble.',
    lore: 'On this day, pioneers reflect on the founding of Deciat Reach — the first permanent settlement in what would become the Core Worlds. Cities across the bubble hold parades, and consumer demand for luxury goods and technology spikes as citizens upgrade their homes and businesses in celebration. Traders who stockpile consumer items and technology can sell them for five times the standard rate.',
    profitType: 'commodity_mult',
    commodityCategories: ['Consumer Items', 'Technology'],
    profitMult: 5,
    profitSummary: 'CONSUMER ITEMS and TECHNOLOGY sell for 5× normal price.',
  },
  {
    id: 'spring_trade_fair',
    name: 'Spring Trade Summit',
    icon: '📈',
    month: 3, day: 20,
    durationDays: 7,
    countdownDays: 14,
    description: 'The annual galactic trade summit. All markets see triple demand.',
    lore: 'The Spring Trade Summit brings together the galaxy\'s most powerful trade guilds, corporate conglomerates, and independent haulers for a week of aggressive deal-making. Every faction lowers tariffs and boosts purchase orders to attract business. The result: commodity prices triple across the board, making it the single most profitable week for general trading.',
    profitType: 'commodity_mult',
    commodityCategories: ['all'],
    profitMult: 3,
    profitSummary: 'ALL commodities sell for 3× normal price at every station.',
  },
  {
    id: 'explorers_week',
    name: 'Explorers Week',
    icon: '🔭',
    month: 4, day: 25,
    durationDays: 7,
    countdownDays: 14,
    description: 'Honoring the cartographers who map the unknown. Exploration data payouts tripled.',
    lore: 'Named after the legendary cartographer who first charted the route to Cradle\'s End, Explorers Week celebrates the brave pilots who venture into uncharted space. Universal Cartographics triples its payout rates for all exploration data sold during the festival, making it the ideal time to cash in your scan data. First-discovery bonuses are also tripled.',
    profitType: 'exploration_mult',
    profitMult: 3,
    profitSummary: 'Exploration data sells for 3× normal value at Universal Cartographics.',
  },
  {
    id: 'sol_remembrance',
    name: 'Sol Remembrance Day',
    icon: '🌍',
    month: 6, day: 4,
    durationDays: 7,
    countdownDays: 14,
    description: 'Honoring humanity\'s lost cradle. All commodity prices triple in solemn remembrance.',
    lore: 'On the anniversary of the legendary discovery of Sol — humanity\'s birthplace — the galaxy pauses to remember its origins. Memorial services are held on stations across known space, and the traditional offering of goods to memory vaults drives commodity prices to triple their normal value. Pilots flock to markets with full cargo holds, paying tribute to Earth while earning a fortune.',
    profitType: 'commodity_mult',
    commodityCategories: ['all'],
    profitMult: 3,
    profitSummary: 'ALL commodities sell for 3× normal price at every station.',
  },
  {
    id: 'miners_week',
    name: 'Miners Week',
    icon: '⛏️',
    month: 7, day: 10,
    durationDays: 7,
    countdownDays: 14,
    description: 'Celebrating the extraction industries. Minerals, metals, and raw materials sell for 5×.',
    lore: 'Miners Week honors the asteroid prospectors, planetary miners, and refinery operators who feed the galaxy\'s industrial machine. Mining guilds throw open their vaults and purchase raw materials at five times the standard rate. The demand is so high that even common iron ore becomes a luxury commodity. If you\'ve been holding onto mineral stockpiles, this is the week to sell.',
    profitType: 'commodity_mult',
    commodityCategories: ['Minerals', 'Metals', 'Raw Materials'],
    profitMult: 5,
    profitSummary: 'MINERALS, METALS, and RAW MATERIALS sell for 5× normal price.',
  },
  {
    id: 'colonia_founders',
    name: 'Colonia Founders Day',
    icon: '🌟',
    month: 8, day: 15,
    durationDays: 7,
    countdownDays: 14,
    description: 'Celebrating the founding of Cradle\'s End and the Coreward Reach.',
    lore: 'Colonia Founders Day commemorates the brave colonists who established Cradle\'s End near the galactic core — the furthest major settlement from the Core Worlds. The celebration is marked by technology and consumer goods being shipped in massive quantities to the frontier, and prices for these commodities soar to five times their normal rate. Traders who make the long journey to the Coreward Reach reap enormous rewards.',
    profitType: 'commodity_mult',
    commodityCategories: ['Technology', 'Consumer Items'],
    profitMult: 5,
    profitSummary: 'TECHNOLOGY and CONSUMER ITEMS sell for 5× normal price.',
  },
  {
    id: 'neutron_festival',
    name: 'Neutron Highway Festival',
    icon: '⚡',
    month: 9, day: 31,
    durationDays: 7,
    countdownDays: 14,
    description: 'Celebrating the neutron star highway. Fuel costs halved, all commodities 2×.',
    lore: 'The Neutron Highway Festival celebrates the network of neutron stars that supercharge frame shift drives, enabling jumps up to four times the normal range. During the festival, fuel producers slash prices in solidarity, and the influx of traveling pilots boosts commodity demand across the galaxy. Fuel costs are halved, and all commodities sell for double.',
    profitType: 'commodity_mult',
    commodityCategories: ['all'],
    profitMult: 2,
    fuelCostMult: 0.5,
    profitSummary: 'ALL commodities 2× price + fuel consumption halved for all jumps.',
  },
  {
    id: 'frontier_day',
    name: 'Frontier Day',
    icon: '🚀',
    month: 11, day: 1,
    durationDays: 7,
    countdownDays: 14,
    description: 'Celebrating the frontier spirit. All commodities 2×, colony income doubled.',
    lore: 'Frontier Day honors the pioneers, colonists, and trailblazers who push the boundaries of civilized space. Colonies across the galaxy double their income output, and commodity markets see a universal doubling as frontier settlements stockpile for the winter cycle. It\'s the perfect time to sell goods and collect colony income.',
    profitType: 'commodity_mult',
    commodityCategories: ['all'],
    profitMult: 2,
    colonyIncomeMult: 2,
    profitSummary: 'ALL commodities 2× price + colony passive income doubled.',
  },
];

function getHolidayStartDate(holiday, year) {
  return new Date(year, holiday.month, holiday.day);
}

export function getActiveHolidays(date = new Date()) {
  return PUBLIC_HOLIDAYS.filter(h => {
    const start = getHolidayStartDate(h, date.getFullYear());
    const end = new Date(start.getTime() + h.durationDays * 86400000);
    return date >= start && date < end;
  }).map(h => {
    const start = getHolidayStartDate(h, date.getFullYear());
    const end = new Date(start.getTime() + h.durationDays * 86400000);
    const daysLeft = Math.ceil((end.getTime() - date.getTime()) / 86400000);
    return { ...h, startDate: start, endDate: end, daysLeft };
  });
}

export function getUpcomingHolidays(date = new Date()) {
  const upcoming = [];
  for (const h of PUBLIC_HOLIDAYS) {
    let start = getHolidayStartDate(h, date.getFullYear());
    if (date >= new Date(start.getTime() + h.durationDays * 86400000)) {
      start = getHolidayStartDate(h, date.getFullYear() + 1);
    }
    const countdownStart = new Date(start.getTime() - h.countdownDays * 86400000);
    if (date >= countdownStart && date < start) {
      const daysUntil = Math.ceil((start.getTime() - date.getTime()) / 86400000);
      upcoming.push({ ...h, startDate: start, daysUntil });
    }
  }
  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getNextHoliday(date = new Date()) {
  let next = null;
  let minDiff = Infinity;
  for (const h of PUBLIC_HOLIDAYS) {
    let start = getHolidayStartDate(h, date.getFullYear());
    if (date >= new Date(start.getTime() + h.durationDays * 86400000)) {
      start = getHolidayStartDate(h, date.getFullYear() + 1);
    }
    const diff = start.getTime() - date.getTime();
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      next = { ...h, startDate: start, daysUntil: Math.ceil(diff / 86400000) };
    }
  }
  return next;
}

export function getHolidayMarketMultiplier(commodityCategory, date = new Date()) {
  const active = getActiveHolidays(date);
  let mult = 1;
  for (const h of active) {
    if (h.profitType === 'commodity_mult') {
      if (h.commodityCategories.includes('all') || h.commodityCategories.includes(commodityCategory)) {
        mult *= h.profitMult;
      }
    }
  }
  return mult;
}

export function getHolidayFuelMultiplier(date = new Date()) {
  const active = getActiveHolidays(date);
  let mult = 1;
  for (const h of active) {
    if (h.fuelCostMult) mult *= h.fuelCostMult;
  }
  return mult;
}

export function getHolidayColonyIncomeMult(date = new Date()) {
  const active = getActiveHolidays(date);
  let mult = 1;
  for (const h of active) {
    if (h.colonyIncomeMult) mult *= h.colonyIncomeMult;
  }
  return mult;
}

export function getHolidayExplorationMult(date = new Date()) {
  const active = getActiveHolidays(date);
  let mult = 1;
  for (const h of active) {
    if (h.profitType === 'exploration_mult') mult *= h.profitMult;
  }
  return mult;
}

export function formatHolidayDate(holiday, year = new Date().getFullYear()) {
  const date = getHolidayStartDate(holiday, year);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}