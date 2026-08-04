// Canis Stella faction functions — extracted as a hook to keep gameState.jsx lean
import { useCallback } from 'react';
import { CANIS_STELLA_RANKS, CEO_TITLE, GUILDED_CARRIER_COST } from './canisStella';
import { getMissingCardIds, randomCardFromMfr, makeCardGrant } from './cardDeck';

// Grant n Canis Stella cards (missing-first) into prev.cards.owned, with foil rolls.
function grantCanisCards(prev, n) {
  const o = prev.cards?.owned || {};
  const missing = getMissingCardIds(o, 'canis_stella');
  const ids = [];
  for (let i = 0; i < n; i++) {
    if (missing.length) ids.push(missing.splice(Math.floor(Math.random() * missing.length), 1)[0]);
    else ids.push(randomCardFromMfr('canis_stella').id);
  }
  return makeCardGrant(prev, ids);
}

export function useCanisStellaFunctions(setState) {
  const joinCanisStella = useCallback(() => {
    setState(prev => ({ ...prev, canisStella: { ...prev.canisStella, stance: 'member', reputation: prev.canisStella?.reputation || 0 }, ...grantCanisCards(prev, 3) }));
  }, [setState]);

  const opposeCanisStella = useCallback(() => {
    setState(prev => ({ ...prev, canisStella: { ...prev.canisStella, stance: 'opposed' } }));
  }, [setState]);

  const addCanisStellaRep = useCallback((amount) => {
    setState(prev => {
      if (prev.canisStella?.stance !== 'member') return prev;
      const newRep = (prev.canisStella.reputation || 0) + amount;
      const nowCEO = newRep >= CANIS_STELLA_RANKS[CANIS_STELLA_RANKS.length - 1].threshold;
      return {
        ...prev,
        canisStella: { ...prev.canisStella, reputation: newRep, isCEO: prev.canisStella.isCEO || nowCEO },
        ...(nowCEO && !prev.canisStella.isCEO ? { playerTitle: CEO_TITLE } : {}),
        ...grantCanisCards(prev, 1),
      };
    });
  }, [setState]);

  const buyGuildedCarrier = useCallback((name) => {
    setState(prev => {
      if ((prev.fleetCarriers || []).some(c => c.isGuilded)) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < GUILDED_CARRIER_COST) return prev;
      const carrier = {
        id: `carrier_guilded_${Date.now()}`,
        name: name || 'Guilded Carrier',
        isGuilded: true,
        systemSeed: prev.currentSystem.seed,
        systemName: prev.currentSystem.name,
        system: prev.currentSystem,
        tritium: 2500,
        tritiumCapacity: 25000,
        shipCapacity: 500,
        bankBalance: 0,
        services: { market: true, shipyard: true, outfitting: true, refuel: true, repair: true },
        orders: [],
        lastIncomeCollection: Date.now(),
        interior: { roomItems: [], savedPlants: [], barTab: 0 },
        design: null,
        cockpitDecoration: { parts: {} },
      };
      return { ...prev, credits: prev.credits - (isSb ? 0 : GUILDED_CARRIER_COST), fleetCarriers: [...prev.fleetCarriers, carrier] };
    });
  }, [setState]);

  const claimGuildedCarrierAsCEO = useCallback((name) => {
    setState(prev => {
      if (!prev.canisStella?.isCEO) return prev;
      if ((prev.fleetCarriers || []).some(c => c.isGuilded)) return prev;
      const carrier = {
        id: `carrier_guilded_${Date.now()}`,
        name: name || 'Canis Stella Sovereign',
        isGuilded: true,
        systemSeed: prev.currentSystem.seed,
        systemName: prev.currentSystem.name,
        system: prev.currentSystem,
        tritium: 2500,
        tritiumCapacity: 25000,
        shipCapacity: 500,
        bankBalance: 0,
        services: { market: true, shipyard: true, outfitting: true, refuel: true, repair: true },
        orders: [],
        lastIncomeCollection: Date.now(),
        interior: { roomItems: [], savedPlants: [], barTab: 0 },
        design: null,
        cockpitDecoration: { parts: {} },
      };
      return { ...prev, fleetCarriers: [...prev.fleetCarriers, carrier], playerTitle: CEO_TITLE };
    });
  }, [setState]);

  const startOwnFaction = useCallback((factionName) => {
    setState(prev => ({ ...prev, canisStella: { ...prev.canisStella, ownFactionName: factionName }, playerTitle: `Sovereign of ${factionName}` }));
  }, [setState]);

  return { joinCanisStella, opposeCanisStella, addCanisStellaRep, buyGuildedCarrier, claimGuildedCarrierAsCEO, startOwnFaction };
}