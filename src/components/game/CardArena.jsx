// Card Arena — choose a manufacturer deck, a game type, and an optional wager
// card. Win → take the foe's wagered card; lose → forfeit your wagered card.
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { useCardSystem } from '@/lib/useCardSystem';
import { CARD_MANUFACTURERS, getOwnedCardIds, getCard, mfrCardIds, getMissingCardIds } from '@/lib/cardDeck';
import { soundEngine } from '@/lib/soundEngine';
import PlayCard from './PlayCard';
import LaneSkirmishGame from './LaneSkirmishGame';
import StatDuelGame from './StatDuelGame';
import TrickTakingGame from './TrickTakingGame';
import { Swords, Zap, Spade, Layers, Coins } from 'lucide-react';

const GAMES = [
  { id: 'lane', name: 'Lane Skirmish', desc: 'Play 3 cards into 3 lanes; win the most lanes by firepower.', Comp: LaneSkirmishGame, icon: Swords },
  { id: 'stat', name: 'Stat Duel', desc: 'Top-Trumps — pick a stat each trick; best of 5.', Comp: StatDuelGame, icon: Zap },
  { id: 'trick', name: 'Void Trick', desc: 'Follow-suit trick-taking over 7 tricks.', Comp: TrickTakingGame, icon: Spade },
];

export default function CardArena() {
  const { state, addCredits, update } = useGameState();
  const { wagerResolve } = useCardSystem();
  const owned = state.cards?.owned || {};
  const [mfr, setMfr] = useState(CARD_MANUFACTURERS[0].key);
  const [gameId, setGameId] = useState(null);
  const [wagerId, setWagerId] = useState(null);
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);

  const playerCards = useMemo(() => getOwnedCardIds(owned, mfr).map(getCard), [owned, mfr]);
  const canPlay = playerCards.length >= 1;

  const oppMfr = useMemo(() => {
    const others = CARD_MANUFACTURERS.filter(m => m.key !== mfr);
    return others[Math.floor(Math.random() * others.length)].key;
  }, [mfr, active]);
  const opponentCards = useMemo(() => mfrCardIds(oppMfr).map(getCard), [oppMfr]);

  // Wager candidates: any owned card id
  const wagerCandidates = useMemo(() => Object.keys(owned).filter(id => owned[id] > 0), [owned]);

  const launch = () => {
    if (!gameId || !canPlay) return;
    soundEngine.play('select');
    setResult(null);
    setActive(gameId);
  };

  const onComplete = (playerWon) => {
    let oppWagerId = null;
    const missing = getMissingCardIds(owned, oppMfr);
    oppWagerId = missing.length ? missing[Math.floor(Math.random() * missing.length)] : mfrCardIds(oppMfr)[Math.floor(Math.random() * 100)];
    if (wagerId) wagerResolve(wagerId, oppWagerId, playerWon);
    const reward = playerWon ? 75000 : 0;
    if (reward) addCredits(reward);
    update(prev => ({ commanderLog: [...(prev.commanderLog || []), { id: Date.now() + Math.random(), ts: Date.now(), text: `Card duel (${GAMES.find(g => g.id === active)?.name}) — ${playerWon ? 'won' : 'lost'}${wagerId ? (playerWon ? ' (won foe card)' : ' (forfeit wager)') : ''}${reward ? ` (+${reward.toLocaleString()} CR)` : ''}`, type: 'game' }].slice(-200) }));
    setResult({ playerWon, oppWagerId });
    setActive(null);
    setWagerId(null);
  };

  if (active) {
    const Game = GAMES.find(g => g.id === active).Comp;
    return <Game playerCards={playerCards} opponentCards={opponentCards} onClose={() => { setActive(null); }} onComplete={onComplete} />;
  }

  return (
    <div className="space-y-3">
      {result && (
        <div className={`border p-2 text-xs ${result.playerWon ? 'border-green-700 text-green-400' : 'border-red-800 text-red-400'}`}>
          {result.playerWon ? `Victory! You claimed the foe's card: ${getCard(result.oppWagerId)?.name}.` : 'Defeat. Your wagered card was forfeit.'}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-orange-500 text-[10px] uppercase font-bold">Your Deck</div>
        <div className="text-orange-700 text-[9px]">Choose the manufacturer whose cards you'll play with. Your collection for that maker forms your battle deck.</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {CARD_MANUFACTURERS.map(m => {
            const count = getOwnedCardIds(owned, m.key).length;
            return (
              <button key={m.key} onClick={() => { setMfr(m.key); }} className={`border p-1.5 text-left ${mfr === m.key ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900'}`}>
                <div className="text-[10px] font-bold" style={{ color: m.color }}>{m.name}</div>
                <div className="text-[8px] text-orange-700">{count}/100 cards</div>
              </button>
            );
          })}
        </div>
        <div className="text-orange-700 text-[9px] mt-1">Selected deck: <span className="text-orange-400">{playerCards.length} cards</span> {canPlay ? '' : '(need at least 1)'}</div>
      </div>

      <div className="space-y-1">
        <div className="text-orange-500 text-[10px] uppercase font-bold">Game</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
          {GAMES.map(g => {
            const Icon = g.icon;
            return (
              <button key={g.id} onClick={() => { setGameId(g.id); soundEngine.play('click'); }} disabled={!canPlay} className={`border p-2 text-left flex flex-col gap-1 ${gameId === g.id ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900'} ${!canPlay ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-1 text-orange-300 text-[11px] font-bold"><Icon className="w-3 h-3" /> {g.name}</div>
                <div className="text-[8px] text-orange-700 leading-tight">{g.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-orange-500 text-[10px] uppercase font-bold flex items-center gap-1"><Layers className="w-3 h-3" /> Wager (optional — winner takes the card)</div>
        <div className="text-orange-700 text-[9px]">{wagerId ? `Staked: ${getCard(wagerId)?.name} (${getCard(wagerId)?.manufacturer})` : 'No card wagered — play for credits only.'}</div>
        <details className="border border-orange-900">
          <summary className="text-orange-600 text-[9px] px-2 py-1 cursor-pointer">Pick a card to stake ({wagerCandidates.length} owned)</summary>
          <div className="flex flex-wrap gap-1 p-2 max-h-40 overflow-y-auto">
            {wagerCandidates.map(id => (
              <PlayCard key={id} card={getCard(id)} size="sm" selected={wagerId === id} onClick={() => { setWagerId(wagerId === id ? null : id); soundEngine.play('click'); }} />
            ))}
          </div>
        </details>
      </div>

      <button onClick={launch} disabled={!gameId || !canPlay} className={`w-full py-2 border text-xs font-bold uppercase flex items-center justify-center gap-1 ${gameId && canPlay ? 'border-orange-500 text-orange-300 hover:bg-orange-950/40' : 'border-orange-900 text-orange-800'}`}>
        <Coins className="w-3 h-3" /> {gameId && canPlay ? 'Begin Duel' : 'Select a game'}
      </button>
    </div>
  );
}