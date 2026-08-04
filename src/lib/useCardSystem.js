// useCardSystem — card collection operations built on the gameState `update`
// setter, so they don't need to live inside gameState.jsx (which is at capacity).
// Functions compute from the current render's `state` and persist via `update`.
import { useCallback } from 'react';
import { useGameState } from './gameState';
import { pickStationCard, getCard, ALL_CARD_IDS } from './cardDeck';

export function useCardSystem() {
  const { state, update } = useGameState();

  const grantStationCard = useCallback((station) => {
    if (!station || station.systemSeed == null) return null;
    const drawKey = `${station.systemSeed}:${station.stationId}`;
    const owned = state.cards?.owned || {};
    if (state.cards?.drawnStations?.[drawKey]) return null;
    const card = pickStationCard(station, owned);
    if (!card) return null;
    update(prev => {
      const cards = prev.cards || { owned: {}, drawnStations: {}, deckRewards: {} };
      if (cards.drawnStations?.[drawKey]) return {};
      return {
        cards: {
          ...cards,
          owned: { ...cards.owned, [card.id]: (cards.owned[card.id] || 0) + 1 },
          drawnStations: { ...cards.drawnStations, [drawKey]: card.id },
        },
      };
    });
    return card;
  }, [state.cards, update]);

  const tradeDuplicates = useCallback((giveId, wantId) => {
    const owned = state.cards?.owned || {};
    const cost = wantId ? 5 : 3;
    if ((owned[giveId] || 0) <= cost) return null;
    let target = wantId;
    if (!target) {
      const missing = ALL_CARD_IDS.filter(id => !(owned[id] > 0));
      if (!missing.length) return null;
      target = missing[Math.floor(Math.random() * missing.length)];
    } else if (owned[target] > 0) {
      return null;
    }
    update(prev => {
      const cards = prev.cards || { owned: {}, drawnStations: {}, deckRewards: {} };
      const o = { ...cards.owned };
      if ((o[giveId] || 0) <= cost) return {};
      o[giveId] -= cost;
      if (o[giveId] <= 0) delete o[giveId];
      o[target] = (o[target] || 0) + 1;
      return { cards: { ...cards, owned: o } };
    });
    return getCard(target);
  }, [state.cards, update]);

  const wagerResolve = useCallback((myCardId, oppCardId, playerWon) => {
    update(prev => {
      const cards = prev.cards || { owned: {}, drawnStations: {} };
      const o = { ...cards.owned };
      if (playerWon) {
        o[oppCardId] = (o[oppCardId] || 0) + 1;
      } else if ((o[myCardId] || 0) > 0) {
        o[myCardId] -= 1;
        if (o[myCardId] <= 0) delete o[myCardId];
      }
      return { cards: { ...cards, owned: o } };
    });
  }, [update]);

  return { grantStationCard, tradeDuplicates, wagerResolve };
}