// Lane Skirmish — build a 30-card battle deck, play 3 cards into 3 lanes, win
// the most lanes by total firepower. Quick single-round duel vs the AI.
import React, { useState, useMemo } from 'react';
import { X, RotateCcw } from 'lucide-react';
import PlayCard from './PlayCard';

function shuffle(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

export default function LaneSkirmishGame({ playerCards, opponentCards, onClose, onComplete }) {
  const [pDeck] = useState(() => shuffle(playerCards).slice(0, 30));
  const [oDeck] = useState(() => shuffle(opponentCards).slice(0, 30));
  const [hand, setHand] = useState(() => pDeck.slice(0, 5));
  const [lanes, setLanes] = useState([null, null, null]);
  const [oppLanes, setOppLanes] = useState(() => {
    const oh = shuffle(opponentCards).slice(0, 3);
    return oh;
  });
  const [revealed, setRevealed] = useState(false);

  const place = (cardIdx) => {
    const laneIdx = lanes.findIndex(l => l === null);
    if (laneIdx === -1) return;
    const card = hand[cardIdx];
    setLanes(prev => { const n = [...prev]; n[laneIdx] = card; return n; });
    setHand(prev => prev.filter((_, i) => i !== cardIdx));
  };

  const result = useMemo(() => {
    if (!revealed) return null;
    let pw = 0, ow = 0;
    for (let i = 0; i < 3; i++) {
      const p = lanes[i]?.power || 0;
      const o = oppLanes[i]?.power || 0;
      if (p > o) pw++; else if (o > p) ow++;
    }
    return { pw, ow, won: pw >= 2 };
  }, [revealed, lanes, oppLanes]);

  const finish = () => onComplete(result.won);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-xl border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Lane Skirmish</h3>
          <div className="flex items-center gap-1">
            {revealed && <button onClick={() => finish()} className="px-2 py-0.5 border border-orange-700 text-orange-300 text-[10px] hover:bg-orange-950/40">{result.won ? 'CLAIM WIN' : 'ACCEPT LOSS'}</button>}
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className="text-orange-700 text-[9px]">Click a hand card to place it in the next open lane. Win 2 of 3 lanes by firepower.</div>

        <div className="space-y-1">
          <div className="text-orange-600 text-[9px] uppercase">Enemy Lanes</div>
          <div className="flex gap-2 justify-center">
            {oppLanes.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <PlayCard card={c} faceDown={!revealed} size="sm" />
                {revealed && <span className="text-[8px] text-red-400">PWR {c?.power}</span>}
                {revealed && lanes[i] && <span className={`text-[9px] font-bold ${(lanes[i].power || 0) > (c?.power || 0) ? 'text-green-400' : 'text-orange-800'}`}>{(lanes[i].power || 0) > (c?.power || 0) ? 'WON' : 'LOST'}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-orange-600 text-[9px] uppercase">Your Lanes</div>
          <div className="flex gap-2 justify-center">
            {lanes.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <PlayCard card={c} size="sm" />
                {revealed && <span className="text-[8px] text-green-400">PWR {c?.power || 0}</span>}
              </div>
            ))}
          </div>
        </div>

        {!revealed ? (
          <div className="space-y-1">
            <div className="text-orange-600 text-[9px] uppercase">Your Hand — click to place</div>
            <div className="flex gap-2 justify-center flex-wrap">
              {hand.length === 0 && <span className="text-orange-800 text-[10px]">All lanes filled — reveal!</span>}
              {hand.map((c, i) => <PlayCard key={c.id} card={c} size="sm" onClick={() => place(i)} />)}
            </div>
            {lanes.every(l => l !== null) && (
              <button onClick={() => setRevealed(true)} className="w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold uppercase">Reveal & Resolve</button>
            )}
          </div>
        ) : (
          <div className={`text-center text-sm font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
            {result.pw}–{result.ow} lanes · {result.won ? 'VICTORY' : 'DEFEAT'}
          </div>
        )}
      </div>
    </div>
  );
}