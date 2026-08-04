// Stat Duel — Top-Trumps style. Each trick both reveal a card; pick a stat;
// higher wins the trick. Best of 5. Quick duel vs the AI.
import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import PlayCard from './PlayCard';

function shuffle(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
const STATS = [
  { key: 'firepower', label: 'Firepower' },
  { key: 'speed', label: 'Speed' },
  { key: 'armor', label: 'Armor' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'power', label: 'Power' },
];

export default function StatDuelGame({ playerCards, opponentCards, onClose, onComplete }) {
  const [pDeck] = useState(() => shuffle(playerCards));
  const [oDeck] = useState(() => shuffle(opponentCards));
  const [trick, setTrick] = useState(0);
  const [pWins, setPWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const [pCard, setPCard] = useState(() => pDeck[0]);
  const [oCard, setOCard] = useState(() => oDeck[0]);
  const [revealed, setRevealed] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const done = trick >= 5;
  const result = useMemo(() => ({ won: pWins >= 3 }), [pWins]);

  const pick = (statKey) => {
    if (revealed || done) return;
    const pv = pCard[statKey], ov = oCard[statKey];
    const win = pv > ov;
    setRevealed(true);
    setLastResult({ statKey, pv, ov, win, tie: pv === ov });
    if (win) setPWins(w => w + 1); else if (pv < ov) setOWins(w => w + 1);
  };

  const next = () => {
    const nt = trick + 1;
    setTrick(nt);
    setPCard(pDeck[nt] || pDeck[nt % pDeck.length]);
    setOCard(oDeck[nt] || oDeck[nt % oDeck.length]);
    setRevealed(false);
    setLastResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-md border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Stat Duel</h3>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-green-400">YOU {pWins}</span><span className="text-red-400">FOE {oWins}</span>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className="text-orange-700 text-[9px]">Pick a stat on your card. Higher value wins the trick. Best of 5.</div>
        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <PlayCard card={pCard} size="md" />
            <span className="text-[9px] text-green-500">YOUR CARD</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <PlayCard card={oCard} faceDown={!revealed} size="md" />
            <span className="text-[9px] text-red-500">FOE CARD</span>
          </div>
        </div>
        {!done && !revealed && (
          <div className="grid grid-cols-5 gap-1">
            {STATS.map(s => (
              <button key={s.key} onClick={() => pick(s.key)} className="py-1.5 border border-orange-800 text-orange-400 hover:bg-orange-950/40 text-[10px] font-bold">{s.label}<div className="text-orange-300">{pCard[s.key]}</div></button>
            ))}
          </div>
        )}
        {revealed && lastResult && (
          <div className={`text-center text-xs font-bold ${lastResult.tie ? 'text-orange-400' : lastResult.win ? 'text-green-400' : 'text-red-400'}`}>
            {STATS.find(s => s.key === lastResult.statKey).label}: {lastResult.pv} vs {lastResult.ov} — {lastResult.tie ? 'TIE' : lastResult.win ? 'YOU WIN' : 'FOE WINS'}
          </div>
        )}
        {revealed && !done && <button onClick={next} className="w-full py-1.5 border border-orange-700 text-orange-300 hover:bg-orange-950/40 text-xs font-bold uppercase">Next Trick</button>}
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