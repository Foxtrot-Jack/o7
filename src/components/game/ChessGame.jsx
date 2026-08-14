// Chess — full rules vs the ship AI (no castling / en passant). Player is White.
import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const SYM = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };

function initialBoard() {
  const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) { b[0][c] = { t: back[c], c: 'b' }; b[1][c] = { t: 'p', c: 'b' }; b[6][c] = { t: 'p', c: 'w' }; b[7][c] = { t: back[c], c: 'w' }; }
  return b;
}
function clone(b) { return b.map(r => r.map(p => p ? { ...p } : null)); }
function inB(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function slide(b, r, c, col, dirs, moves) {
  const opp = col === 'w' ? 'b' : 'w';
  for (const [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    while (inB(nr, nc)) { const t = b[nr][nc]; if (!t) moves.push({ from: [r, c], to: [nr, nc] }); else { if (t.c === opp) moves.push({ from: [r, c], to: [nr, nc], capture: true }); break; } nr += dr; nc += dc; }
  }
}
function pseudo(b, r, c) {
  const p = b[r][c]; if (!p) return [];
  const moves = []; const opp = p.c === 'w' ? 'b' : 'w';
  const add = (to) => { if (!inB(to[0], to[1])) return; const t = b[to[0]][to[1]]; if (!t || t.c === opp) moves.push({ from: [r, c], to, capture: !!t }); };
  switch (p.t) {
    case 'p': { const dir = p.c === 'w' ? -1 : 1; const start = p.c === 'w' ? 6 : 1; const prom = p.c === 'w' ? 0 : 7;
      if (inB(r + dir, c) && !b[r + dir][c]) moves.push({ from: [r, c], to: [r + dir, c], promote: r + dir === prom });
      if (r === start && inB(r + 2 * dir, c) && !b[r + dir][c] && !b[r + 2 * dir][c]) moves.push({ from: [r, c], to: [r + 2 * dir, c] });
      for (const dc of [-1, 1]) { const nr = r + dir, nc = c + dc; if (inB(nr, nc) && b[nr][nc] && b[nr][nc].c === opp) moves.push({ from: [r, c], to: [nr, nc], capture: true, promote: nr === prom }); }
      break; }
    case 'n': { for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) add([r + dr, c + dc]); break; }
    case 'b': slide(b, r, c, p.c, [[1, 1], [1, -1], [-1, 1], [-1, -1]], moves); break;
    case 'r': slide(b, r, c, p.c, [[1, 0], [-1, 0], [0, 1], [0, -1]], moves); break;
    case 'q': slide(b, r, c, p.c, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]], moves); break;
    case 'k': { for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) add([r + dr, c + dc]); break; }
  }
  return moves;
}
function applyMove(b, m) { const n = clone(b); const p = n[m.from[0]][m.from[1]]; n[m.to[0]][m.to[1]] = m.promote ? { t: 'q', c: p.c } : p; n[m.from[0]][m.from[1]] = null; return n; }
function findKing(b, col) { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (p && p.t === 'k' && p.c === col) return [r, c]; } return null; }
function attacked(b, r, c, by) {
  for (let rr = 0; rr < 8; rr++) for (let cc = 0; cc < 8; cc++) { const p = b[rr][cc]; if (!p || p.c !== by) continue;
    if (p.t === 'p') { const dir = p.c === 'w' ? -1 : 1; if (rr + dir === r && (cc - 1 === c || cc + 1 === c)) return true; }
    else { const ms = pseudo(b, rr, cc); if (ms.some(m => m.to[0] === r && m.to[1] === c)) return true; } }
  return false;
}
function inCheck(b, col) { const k = findKing(b, col); if (!k) return false; return attacked(b, k[0], k[1], col === 'w' ? 'b' : 'w'); }
function legalMoves(b, col) { const out = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (!p || p.c !== col) continue; for (const m of pseudo(b, r, c)) { if (!inCheck(applyMove(b, m), col)) out.push(m); } } return out; }
function gameStatus(b, col) { const ms = legalMoves(b, col); if (!ms.length) return inCheck(b, col) ? 'checkmate' : 'stalemate'; return 'ongoing'; }
function evalBoard(b) { let s = 0; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (p) s += (p.c === 'w' ? 1 : -1) * VAL[p.t]; } return s; }
function aiMove(b) {
  const moves = legalMoves(b, 'b'); if (!moves.length) return null;
  // small opening randomization
  if (b[6][4] && b[6][4].t === 'p' && b[1][4] && b[1][4].t === 'p' && Math.random() < 0.5) {
    const opens = [{ from: [6, 4], to: [4, 4] }, { from: [6, 3], to: [4, 3] }, { from: [6, 2], to: [4, 2] }].filter(m => moves.some(x => x.from[0] === m.from[0] && x.from[1] === m.from[1] && x.to[0] === m.to[0] && x.to[1] === m.to[1]));
    if (opens.length) return opens[Math.floor(Math.random() * opens.length)];
  }
  let best = null, bestVal = Infinity;
  for (const m of moves) {
    const nb = applyMove(b, m);
    const wm = legalMoves(nb, 'w');
    let wbest = wm.length ? -Infinity : evalBoard(nb);
    for (const w of wm) { const v = evalBoard(applyMove(nb, w)); if (v > wbest) wbest = v; }
    if (wbest < bestVal) { bestVal = wbest; best = m; }
  }
  return best;
}

export default function ChessGame({ onClose, onComplete }) {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState('w');
  const [sel, setSel] = useState(null);
  const [dests, setDests] = useState([]);
  const [status, setStatus] = useState('Your move (White).');
  const [over, setOver] = useState(null);
  const [thinking, setThinking] = useState(false);

  const select = (r, c) => {
    if (over || turn !== 'w' || thinking) return;
    if (sel) { const mv = dests.find(d => d.to[0] === r && d.to[1] === c); if (mv) { playMove(mv); return; } }
    const p = board[r][c];
    if (p && p.c === 'w') { setSel([r, c]); setDests(legalMoves(board, 'w').filter(m => m.from[0] === r && m.from[1] === c)); }
    else { setSel(null); setDests([]); }
  };

  const playMove = (mv) => {
    const nb = applyMove(board, mv);
    setBoard(nb); setSel(null); setDests([]);
    const st = gameStatus(nb, 'b');
    if (st === 'checkmate') { setStatus('Checkmate — you win!'); setOver('win'); onComplete && onComplete(true); return; }
    if (st === 'stalemate') { setStatus('Stalemate — draw.'); setOver('draw'); onComplete && onComplete(false); return; }
    setTurn('b'); setStatus('AI thinking…'); setThinking(true);
  };

  useEffect(() => {
    if (turn !== 'b' || over) return;
    const t = setTimeout(() => {
      const mv = aiMove(board);
      if (!mv) { const st = gameStatus(board, 'b'); setOver('lose'); setStatus(st === 'checkmate' ? 'Checkmate — you lose.' : 'Stalemate — draw.'); onComplete && onComplete(false); return; }
      const nb = applyMove(board, mv);
      setBoard(nb);
      const st = gameStatus(nb, 'w');
      if (st === 'checkmate') { setStatus('Checkmate — you lose.'); setOver('lose'); onComplete && onComplete(false); return; }
      if (st === 'stalemate') { setStatus('Stalemate — draw.'); setOver('draw'); onComplete && onComplete(false); return; }
      setTurn('w'); setStatus('Your move.'); setThinking(false);
    }, 450);
    return () => clearTimeout(t);
  }, [turn, board, over, onComplete]);

  const reset = () => { setBoard(initialBoard()); setTurn('w'); setSel(null); setDests([]); setStatus('Your move (White).'); setOver(null); setThinking(false); };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-sm border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Chess</h3>
          <div className="flex items-center gap-1">
            <button onClick={reset} className="px-2 py-0.5 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" />NEW</button>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className={`text-center text-xs font-bold ${over === 'win' ? 'text-green-400' : over === 'lose' ? 'text-red-400' : 'text-orange-400'}`}>{status}</div>
        <div className="grid grid-cols-8 gap-px bg-orange-900/30 border border-orange-900 select-none">
          {board.map((row, r) => row.map((p, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = sel && sel[0] === r && sel[1] === c;
            const isDest = dests.some(d => d.to[0] === r && d.to[1] === c);
            return (
              <button key={`${r}-${c}`} onClick={() => select(r, c)}
                className={`aspect-square flex items-center justify-center text-2xl ${dark ? 'bg-orange-950/60' : 'bg-black'} ${isSel ? 'ring-2 ring-cyan-400' : ''} ${isDest ? 'bg-cyan-900/50' : ''}`}>
                {p && <span className={p.c === 'w' ? 'text-orange-100' : 'text-orange-900'}>{SYM[p.t]}</span>}
                {isDest && !p && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
              </button>
            );
          }))}
        </div>
        <div className="text-orange-700 text-[9px] text-center">Click a White piece, then a highlighted square. Pawn promotion auto-queens. No castling or en passant.</div>
      </div>
    </div>
  );
}