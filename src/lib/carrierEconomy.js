// Carrier Economy — background simulation for fleet carriers.
//
// Each carrier generates passive income based on its enabled services, the
// population of the system it's parked in, and its NPC crew's efficiency.
// Tritium is consumed for upkeep, and crew salaries are paid from the
// carrier's bank balance. The simulation advances on real elapsed time
// (like the founder BGS sim), so a long absence simply accrues more income.
//
// Income is stored as `pendingIncome` per carrier and claimed manually from
// the Carrier screen, so the player always sees the number grow.

// Income per hour per service, scaled by system population
const SERVICE_BASE_INCOME = {
  market: 50000,      // 50k CR/h base
  shipyard: 80000,   // 80k CR/h base
  outfitting: 60000, // 60k CR/h base
  refuel: 20000,     // 20k CR/h base
  repair: 25000,     // 25k CR/h base
};

// Tritium upkeep per hour per enabled service
const SERVICE_TRITIUM_UPKEEP = {
  market: 2,
  shipyard: 3,
  outfitting: 2,
  refuel: 4,
  repair: 3,
};

// Population multiplier — higher population systems generate more income
function populationMultiplier(population) {
  if (!population || population <= 0) return 0.1;   // deep space — minimal
  if (population < 1000) return 0.3;
  if (population < 100000) return 0.5;
  if (population < 10000000) return 0.8;
  if (population < 1000000000) return 1.0;
  if (population < 10000000000) return 1.5;
  return 2.0; // capital systems
}

// Calculate per-hour income for a carrier given its services, system, and crew
export function calculateCarrierIncomeRate(carrier, systemPopulation, crewBonuses = {}) {
  let rate = 0;
  for (const [service, enabled] of Object.entries(carrier.services || {})) {
    if (!enabled) continue;
    const base = SERVICE_BASE_INCOME[service] || 0;
    rate += base * populationMultiplier(systemPopulation);
  }
  // Crew efficiency bonus (0-50% based on crew morale + level)
  const efficiencyMult = 1 + (crewBonuses.efficiency || 0);
  return Math.round(rate * efficiencyMult);
}

// Calculate per-hour tritium upkeep for a carrier, reduced by crew tritiumSavings
export function calculateCarrierTritiumUpkeep(carrier, crewBonuses = {}) {
  let upkeep = 0;
  for (const [service, enabled] of Object.entries(carrier.services || {})) {
    if (!enabled) continue;
    upkeep += SERVICE_TRITIUM_UPKEEP[service] || 0;
  }
  const savings = Math.min(0.5, crewBonuses.tritiumSavings || 0); // cap at 50% savings
  return Math.max(1, Math.round(upkeep * (1 - savings)));
}

// Advance a single carrier's economy by elapsed milliseconds.
// Returns a partial carrier object with updated fields, or null if no change.
export function tickCarrierEconomy(carrier, elapsedMs, crewBonuses = {}) {
  if (!carrier) return null;
  const hours = elapsedMs / 3600000;
  if (hours <= 0) return null;

  const system = carrier.system || {};
  const population = system.population || 0;

  const incomeRate = calculateCarrierIncomeRate(carrier, population, crewBonuses);
  const tritiumUpkeep = calculateCarrierTritiumUpkeep(carrier, crewBonuses);

  const incomeEarned = Math.round(incomeRate * hours);
  const tritiumConsumed = Math.round(tritiumUpkeep * hours);

  // Tritium runs out — income halved when dry
  const hasFuel = (carrier.tritium || 0) > 0;
  const finalIncome = hasFuel ? incomeEarned : Math.round(incomeEarned * 0.3);

  return {
    pendingIncome: (carrier.pendingIncome || 0) + finalIncome,
    tritium: Math.max(0, (carrier.tritium || 0) - tritiumConsumed),
  };
}

// Collect pending income from a carrier — transfers to carrier bank balance
export function collectCarrierIncome(carrier) {
  const amount = carrier.pendingIncome || 0;
  if (amount <= 0) return { carrier, collected: 0 };
  return {
    carrier: { ...carrier, pendingIncome: 0, bankBalance: (carrier.bankBalance || 0) + amount },
    collected: amount,
  };
}

// Withdraw credits from carrier bank to player
export function withdrawFromCarrier(carrier, amount) {
  const available = carrier.bankBalance || 0;
  const withdraw = Math.min(amount, available);
  return {
    carrier: { ...carrier, bankBalance: available - withdraw },
    withdrawn: withdraw,
  };
}

// Deposit credits from player to carrier bank
export function depositToCarrier(carrier, amount) {
  return {
    carrier: { ...carrier, bankBalance: (carrier.bankBalance || 0) + amount },
    deposited: amount,
  };
}