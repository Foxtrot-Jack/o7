// Solitaire (Klondike) — click-to-move. Click a card to pick it up (with any
// valid alternating run below it on the tableau), click a destination to place.
// Build the four foundations A→K by suit to win. AUTO sends all safe cards up.
import React, { useState, useCallback } from 'react';
import { X, RotateCcw, Zap } from 'lucide-react';

const SUIT_SYM = ['♠', '♥', '♦', '♣'];
const RANK_LBL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRed = c => c.s === 1 || c.s === 2;

function makeDeck() {
  const d = [];
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) d.push({ s, r, up: false });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}
function deal() {
  const deck = makeDeck();
  const t = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < 7; i++) for (let j = i; j < 7; j++) { const card = deck.pop(); card.up = (j === i); t[j].push(card); }
  deck.forEach(c => c.up = false);
  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau: t };
}
function validRun(cards) {
  for (let k = 0; k < cards.length - 1; k++) {
    if (!cards[k].up || !cards[k + 1].up) return false;
    if (isRed(cards[k]) === isRed(cards[k + 1])) return false;
    if (cards[k].r !== cards[k + 1].r + 1) return false;
  }
  return cards.length === 0 || cards[0].up;
}
function canStack(moving, destTop) {
  if (!destTop) return moving.r === 13;
  return isRed(moving) !== isRed(destTop) && moving.r === destTop.r - 1;
}
function canFound(card, suitIdx, pile) {
  const top = pile[pile.length - 1];
  if (!top) return card.r === 1 && card.s === suitIdx;
  return card.s === suitIdx && card.r === top.r + 1;
}

export default function SolitaireGame({ onClose, onComplete }) {
  const [g, setG] = useState(deal);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);

  const newGame = useCallback(() => { setG(deal()); setSel(null); setDone(false); setMoves(0); }, []);

  const draw = () => {
    setG(prev => {
      if (prev.stock.length) {
        const c = prev.stock[prev.stock.length - 1];
        return { ...prev, stock: prev.stock.slice(0, -1), waste: [...prev.waste, { ...c, up: true }] };
      }
      if (prev.waste.length) return { ...prev, stock: prev.waste.slice().reverse().map(c => ({ ...c, up: false })), waste: [] };
      return prev;
    });
    setSel(null);
  };

  const srcCards = (pile, idx) => {
    if (pile === 'w') return g.waste.length ? [g.waste[g.waste.length - 1]] : [];
    if (pile.startsWith('f')) { const f = g.foundations[+pile[1]]; return f.length ? [f[f.length - 1]] : []; }
    if (pile.startsWith('t')) { const col = +pile.slice(1); return g.tableau[col].slice(idx); }
    return [];
  };

  const clickCard = (pile, idx) => {
    if (done) return;
    if (sel) {
      if (sel.pile === pile) { setSel(null); return; }
      const moving = srcCards(sel.pile, sel.idx);
      if (!moving.length) { setSel(null); return; }
      tryMove(moving, sel.pile, sel.idx, pile);
    } else {
      if (pile === 'w') { if (g.waste.length) setSel({ pile: 'w', idx: g.waste.length - 1 }); return; }
      if (pile.startsWith('f')) { const f = g.foundations[+pile[1]]; if (f.length) setSel({ pile, idx: f.length - 1 }); return; }
      if (pile.startsWith('t')) {
        const col = +pile.slice(1); const col0 = g.tableau[col];
        if (idx >= col0.length || !col0[idx].up) return;
        if (!validRun(col0.slice(idx))) return;
        setSel({ pile, idx });
      }
    }
  };

  const tryMove = (moving, srcPile, srcIdx, dstPile) => {
    setG(prev => {
      let ok = false;
      if (dstPile.startsWith('f') && moving.length === 1) { const si = +dstPile[1]; if (canFound(moving[0], si, prev.foundations[si])) ok = true; }
      else if (dstPile.startsWith('t')) { const col = +dstPile.slice(1); const top = prev.tableau[col][prev.tableau[col].length - 1]; if (canStack(moving[0], top)) ok = true; }
      if (!ok) { setSel(null); return prev; }
      const ng = { stock: prev.stock, waste: [...prev.waste], foundations: prev.foundations.map(f => [...f]), tableau: prev.tableau.map(c => [...c]) };
      if (srcPile === 'w') ng.waste.pop();
      else if (srcPile.startsWith('f')) ng.foundations[+srcPile[1]].pop();
      else if (srcPile.startsWith('t')) { const col = +srcPile.slice(1); ng.tableau[col] = ng.tableau[col].slice(0, srcIdx); }
      if (dstPile.startsWith('f')) ng.foundations[+dstPile[1]].push(moving[0]);
      else if (dstPile.startsWith('t')) { const col = +dstPile.slice(1); ng.tableau[col] = [...ng.tableau[col], ...moving]; }
      if (srcPile.startsWith('t')) { const col = +srcPile.slice(1); const c0 = ng.tableau[col]; if (c0.length && !c0[c0.length - 1].up) c0[c0.length - 1].up = true; }
      setSel(null); setMoves(m => m + 1);
      if (ng.foundations.reduce((s, f) => s + f.length, 0) === 52) { setDone(true); onComplete && onComplete(true); }
      return ng;
    });
  };

  const auto = () => {
    setG(prev => {
      const ng = { stock: prev.stock, waste: [...prev.waste], foundations: prev.foundations.map(f => [...f]), tableau: prev.tableau.map(c => [...c]) };
      let changed = true;
      while (changed) {
        changed = false;
        if (ng.waste.length) {
          const c = ng.waste[ng.waste.length - 1];
          for (let si = 0; si < 4; si++) if (canFound(c, si, ng.foundations[si])) { ng.waste.pop(); ng.foundations[si].push(c); changed = true; break; }
        }
        for (let col = 0; col < 7; col++) {
          const c0 = ng.tableau[col]; if (!c0.length) continue;
          const c = c0[c0.length - 1]; if (!c.up) continue;
          for (let si = 0; si < 4; si++) if (canFound(c, si, ng.foundations[si])) {
            ng.tableau[col] = c0.slice(0, -1);
            if (ng.tableau[col].length && !ng.tableau[col][ng.tableau[col].length - 1].up) ng.tableau[col][ng.tableau[col].length - 1].up = true;
            ng.foundations[si].push(c); changed = true; break;
          }
        }
      }
      if (ng.foundations.reduce((s, f) => s + f.length, 0) === 52) { setDone(true); onComplete && onComplete(true); }
      return ng;
    });
    setSel(null);
  };

  const Card = ({ c, selected }) => {
    if (!c) return <div className="w-8 h-11 border border-orange-950/60 bg-black/40" />;
    if (!c.up) return <div className="w-8 h-11 border border-orange-800 bg-orange-950/30 flex items-center justify-center text-orange-700 text-[10px]">▣</div>;
    const col = isRed(c) ? 'text-red-400' : 'text-orange-300';
    return <div className={`w-8 h-11 border border-orange-700 bg-black flex flex-col items-center justify-center ${col} ${selected ? 'ring-2 ring-cyan-400' : ''}`}>
      <span className="text-[10px] leading-none font-bold">{RANK_LBL[c.r]}</span><span className="text-[11px] leading-none">{SUIT_SYM[c.s]}</span>
    </div>;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-2xl border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Solitaire</h3>
          <div className="flex items-center gap-2 text-[10px] text-orange-700">
            <span>MOVES {moves}</span>
            <button onClick={auto} className="px-2 py-0.5 border border-cyan-700 text-cyan-500 hover:bg-cyan-950/30 text-[10px] flex items-center gap-1"><Zap className="w-2.5 h-2.5" />AUTO</button>
            <button onClick={newGame} className="px-2 py-0.5 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" />NEW</button>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className="text-orange-800 text-[9px]">Click a card to pick it up, click a destination to place. Foundations A→K by suit; tableau builds down, alternating colors.</div>
        <div className="flex gap-3 items-start">
          <button onClick={draw} className="flex flex-col items-center gap-1">
            <Card c={g.stock[g.stock.length - 1]} />
            <span className="text-[8px] text-orange-700">{g.stock.length} LEFT</span>
          </button>
          <div onClick={() => clickCard('w', 0)}><Card c={g.waste[g.waste.length - 1]} selected={sel && sel.pile === 'w'} /></div>
          <div className="flex gap-1 ml-auto">
            {g.foundations.map((f, si) => (
              <div key={si} onClick={() => clickCard(`f${si}`, f.length - 1)}>
                <Card c={f[f.length - 1]} selected={sel && sel.pile === `f${si}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-center pt-1">
          {g.tableau.map((col, ci) => (
            <div key={ci} className="flex flex-col" onClick={() => { if (sel) { const moving = srcCards(sel.pile, sel.idx); if (moving.length) tryMove(moving, sel.pile, sel.idx, `t${ci}`); } }}>
              {col.length === 0 && <div className="w-8 h-11 border border-dashed border-orange-950/60" />}
              {col.map((c, i) => (
                <div key={i} style={{ marginTop: i === 0 ? 0 : -32 }} onClick={(e) => { e.stopPropagation(); clickCard(`t${ci}`, i); }}>
                  <Card c={c} selected={sel && sel.pile === `t${ci}` && sel.idx <= i} />
                </div>
              ))}
            </div>
          ))}
        </div>
        {done && <div className="text-center text-green-400 font-bold text-sm py-1">CLEARED — foundations complete!</div>}
      </div>
    </div>
  );
}