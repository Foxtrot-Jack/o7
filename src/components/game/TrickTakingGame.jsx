// Void Trick — follow-suit trick-taking. Suit = ship class (1–4). Must follow
// the led suit if you can; highest of the led suit wins the trick. 7 tricks.
import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import PlayCard from './PlayCard';

function shuffle(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

export default function TrickTakingGame({ playerCards, opponentCards, onClose, onComplete }) {
  const [pHand, setPHand] = useState(() => shuffle(playerCards).slice(0, 7));
  const [oHand, setOHand] = useState(() => shuffle(opponentCards).slice(0, 7));
  const [lead, setLead] = useState('player');
  const [trickCards, setTrickCards] = useState([]); // [{by, card}]
  const [pTricks, setPTricks] = useState(0);
  const [oTricks, setOTricks] = useState(0);
  const [trickNo, setTrickNo] = useState(0);
  const [log, setLog] = useState('You lead the first trick. Play a card.');

  const done = trickNo >= 7;
  const result = useMemo(() => ({ won: pTricks >= 4 }), [pTricks]);

  const ledSuit = trickCards.length ? trickCards[0].card.class : null;

  const playerPlay = (cardIdx) => {
    if (lead !== 'player' || trickCards.length >= 2 || done) return;
    const card = pHand[cardIdx];
    if (ledSuit != null && pHand.some(c => c.class === ledSuit) && card.class !== ledSuit) {
      setLog('You must follow the led suit.');
      return;
    }
    const newTrick = [...trickCards, { by: 'player', card }];
    setTrickCards(newTrick);
    setPHand(prev => prev.filter((_, i) => i !== cardIdx));
    // AI responds
    const o = aiPlay(oHand, card.class);
    if (o) {
      const finalTrick = [...newTrick, { by: 'ai', card: o.card }];
      setTrickCards(finalTrick);
      setOHand(prev => prev.filter((_, i) => i !== o.idx));
      resolveTrick(finalTrick);
    }
  };

  const aiPlay = (hand, suit) => {
    if (!hand.length) return null;
    const inSuit = hand.map((c, i) => ({ c, i })).filter(x => x.c.class === suit);
    if (suit != null && inSuit.length) {
      // play highest of suit (try to win)
      inSuit.sort((a, b) => b.c.power - a.c.power);
      return { card: inSuit[0].c, idx: inSuit[0].i };
    }
    // no suit to follow (or leading) — play highest power
    const sorted = hand.map((c, i) => ({ c, i })).sort((a, b) => b.c.power - a.c.power);
    return { card: sorted[0].c, idx: sorted[0].i };
  };

  const resolveTrick = (trick) => {
    const suit = trick[0].card.class;
    const inSuit = trick.filter(t => t.card.class === suit);
    const winner = inSuit.sort((a, b) => b.card.power - a.card.power)[0];
    const playerWon = winner.by === 'player';
    setTimeout(() => {
      if (playerWon) setPTricks(t => t + 1); else setOTricks(t => t + 1);
      setTrickNo(t => t + 1);
      setTrickCards([]);
      setLead(playerWon ? 'player' : 'ai');
      setLog(playerWon ? 'You win the trick. Lead again.' : 'Foe wins the trick. Foe leads next.');
      if (!playerWon) {
        // AI leads next trick
        setTimeout(() => aiLead(), 600);
      }
    }, 700);
  };

  const aiLead = () => {
    if (done || !oHand.length) return;
    const o = aiPlay(oHand, null);
    if (!o) return;
    const newTrick = [{ by: 'ai', card: o.card }];
    setTrickCards(newTrick);
    setOHand(prev => prev.filter((_, i) => i !== o.idx));
    setLog(`Foe leads with ${o.card.name}. Follow suit (${['I', 'II', 'III', 'IV'][o.card.class - 1]}) if you can.`);
  };

  // When AI has led, player must follow
  const followPlay = (cardIdx) => {
    if (lead !== 'ai' || trickCards.length !== 1) return;
    const card = pHand[cardIdx];
    const suit = trickCards[0].card.class;
    if (pHand.some(c => c.class === suit) && card.class !== suit) { setLog('You must follow the led suit.'); return; }
    const newTrick = [...trickCards, { by: 'player', card }];
    setTrickCards(newTrick);
    setPHand(prev => prev.filter((_, i) => i !== cardIdx));
    resolveTrick(newTrick);
  };

  const onCardClick = (idx) => {
    if (lead === 'player' && trickCards.length === 0) playerPlay(idx);
    else if (lead === 'ai' && trickCards.length === 1) followPlay(idx);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-md border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Void Trick</h3>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-green-400">YOU {pTricks}</span><span className="text-red-400">FOE {oTricks}</span>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className="text-orange-700 text-[9px]">Suit = ship class. Follow the led suit if you can; highest of that suit wins the trick. 7 tricks.</div>

        <div className="flex justify-center gap-3 min-h-32 items-center">
          {trickCards.map((t, i) => (
            <div key={i} className={`flex flex-col items-center ${t.by === 'player' ? '' : '-scale-x-100'}`}>
              <PlayCard card={t.card} size="md" />
            </div>
          ))}
          {trickCards.length === 0 && <span className="text-orange-800 text-[10px]">{log}</span>}
        </div>

        <div className="text-orange-600 text-[9px] uppercase">{log}</div>

        <div className="space-y-1">
          <div className="text-orange-600 text-[9px] uppercase">Your Hand</div>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {pHand.length === 0 && <span className="text-orange-800 text-[10px]">No cards left.</span>}
            {pHand.map((c, i) => {
              const canFollow = lead !== 'ai' || trickCards.length !== 1 || trickCards[0].card.class !== c.class || !pHand.some(x => x.class === trickCards[0].card.class) || c.class === trickCards[0].card.class;
              return <PlayCard key={c.id + i} card={c} size="sm" dim={!canFollow} onClick={() => onCardClick(i)} />;
            })}
          </div>
        </div>

        {done && (
          <>
            <div className={`text-center text-sm font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? 'VICTORY' : 'DEFEAT'}</div>
            <button onClick={() => onComplete(result.won)} className="w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold uppercase">Continue</button>
          </>
        )}
      </div>
    </div>
  );
}