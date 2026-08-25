// Carrier Economy tick hook — advances all fleet carriers' background economy
// on real elapsed time. Generates passive income, consumes tritium upkeep,
// pays crew salaries from carrier bank balances, and accrues crew XP.
//
// Mirrors the useFounderSim pattern: called with elapsed ms, updates state
// via setState. Income is stored as pendingIncome per carrier and claimed
// manually from the Carrier screen.
import { useCallback } from 'react';
import { tickCarrierEconomy } from './carrierEconomy';
import { getCarrierCrewBonuses, calculateCarrierCrewSalaryRate, CARRIER_CREW_ROLE_MAP } from './carrierCrew';

const CREW_XP_PER_HOUR = 100; // crew gain 100 XP/hour while employed

export function useCarrierEconomy(setState) {
  const tickCarrierEconomies = useCallback((elapsedMs) => {
    setState(prev => {
      if (!prev.fleetCarriers || prev.fleetCarriers.length === 0) return prev;
      const hours = elapsedMs / 3600000;
      if (hours <= 0) return prev;

      const updatedCarriers = prev.fleetCarriers.map(carrier => {
        const crew = carrier.crew || [];
        const crewBonuses = getCarrierCrewBonuses(crew);

        // Economy tick (income + tritium)
        const econUpdate = tickCarrierEconomy(carrier, elapsedMs, crewBonuses);
        if (!econUpdate) return carrier;

        let updated = { ...carrier, ...econUpdate };

        // Crew salary — paid from carrier bank balance
        if (crew.length > 0) {
          const salaryRate = calculateCarrierCrewSalaryRate(crew);
          const salaryOwed = Math.round(salaryRate * hours);
          const bankBalance = updated.bankBalance || 0;
          if (salaryOwed > 0) {
            // If bank can't cover salary, morale drops
            if (bankBalance >= salaryOwed) {
              updated.bankBalance = bankBalance - salaryOwed;
            } else {
              // Partial payment — morale penalty
              updated.bankBalance = 0;
              updated.crew = crew.map(c => ({ ...c, morale: Math.max(0, (c.morale ?? 75) - 10) }));
            }
          }
        }

        // Crew XP accrual + morale recovery (docked in a populated system)
        if (crew.length > 0) {
          const isPopulated = (carrier.system?.population || 0) > 0;
          updated.crew = (updated.crew || crew).map(c => ({
            ...c,
            xp: (c.xp || 0) + Math.round(CREW_XP_PER_HOUR * hours),
            morale: isPopulated
              ? Math.min(100, (c.morale ?? 75) + Math.round(2 * hours))
              : Math.max(0, (c.morale ?? 75) - Math.round(1 * hours)),
          }));
        }

        return updated;
      });

      return { ...prev, fleetCarriers: updatedCarriers };
    });
  }, [setState]);

  return { tickCarrierEconomies };
}