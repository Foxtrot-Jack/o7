// Sudoku — fill the 9×9 grid so every row, column, and 3×3 box holds 1–9.
// Givens are fixed; tap a cell then a number. Conflicts highlight in red.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RotateCcw, Eraser } from 'lucide-react';

function ok(g, r, c, n) {
  for (let i = 0; i < 9; i++) { if (g[r][i] === n || g[i][c] === n) return false; }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[br + i][bc + j] === n) return false;
  return true;
}
function fullBoard() {
  const g = Array.from({ length: 9 }, () => Array(9).fill(0));
  const solve = () => {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (g[r][c] === 0) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      for (const n of nums) if (ok(g, r, c, n)) { g[r][c] = n; if (solve()) return true; g[r][c] = 0; }
      return false;
    }
    return true;
  };
  solve(); return g;
}
function makePuzzle(sol, remove = 42) {
  const p = sol.map(r => [...r]); let rm = 0;
  while (rm < remove) { const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9); if (p[r][c] !== 0) { p[r][c] = 0; rm++; } }
  return p;
}
function conflicts(b) {
  const res = Array.from({ length: 9 }, () => Array(9).fill(false));
  const mark = (cells) => {
    const seen = {};
    for (const [r, c] of cells) {
      const v = b[r][c]; if (!v) continue;
      if (seen[v]) { seen[v].forEach(p => { res[p[0]][p[1]] = true; }); res[r][c] = true; seen[v].push([r, c]); }
      else seen[v] = [[r, c]];
    }
  };
  for (let r = 0; r < 9; r++) mark(Array.from({ length: 9 }, (_, c) => [r, c]));
  for (let c = 0; c < 9; c++) mark(Array.from({ length: 9 }, (_, r) => [r, c]));
  for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
    const cells = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push([br * 3 + i, bc * 3 + j]); mark(cells);
  }
  return res;
}

export default function SudokuGame({ onClose, onComplete }) {
  const [given, setGiven] = useState(null);
  const [board, setBoard] = useState(null);
  const [sel, setSel] = useState([0, 0]);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  const newGame = useCallback(() => {
    const sol = fullBoard(); const p = makePuzzle(sol);
    setGiven(p.map(r => [...r])); setBoard(p.map(r => [...r])); setSel([0, 0]); setDone(false); doneRef.current = false;
  }, []);
  useEffect(() => { newGame(); }, [newGame]);

  if (!board) return null;
  const conf = conflicts(board);

  const setCell = (n) => {
    if (done) return;
    const [r, c] = sel; if (given[r][c]) return;
    setBoard(prev => {
      const nb = prev.map(row => [...row]); nb[r][c] = n;
      const fullGrid = nb.every(row => row.every(v => v !== 0));
      const anyConf = conflicts(nb).some(row => row.some(Boolean));
      if (fullGrid && !anyConf && !doneRef.current) { doneRef.current = true; setDone(true); onComplete && onComplete(true); }
      return nb;
    });
  };
  const clearCell = () => {
    const [r, c] = sel; if (given[r][c]) return;
    setBoard(prev => { const nb = prev.map(row => [...row]); nb[r][c] = 0; return nb; });
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-sm border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Sudoku</h3>
          <div className="flex items-center gap-1">
            <button onClick={newGame} className="px-2 py-0.5 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" />NEW</button>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-px bg-orange-900/40 border border-orange-900">
          {board.map((row, r) => row.map((v, c) => {
            const isGiven = given[r][c];
            const isSel = sel[0] === r && sel[1] === c;
            const bad = conf[r][c];
            const boxEdge = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-orange-600' : '';
            return (
              <button key={`${r}-${c}`} onClick={() => setSel([r, c])}
                className={`aspect-square text-xs ${isSel ? 'bg-orange-950/60' : 'bg-black'} ${boxEdge} ${isGiven ? 'text-orange-300 font-bold' : 'text-cyan-400'} ${bad ? 'text-red-500' : ''}`}>
                {v || ''}
              </button>
            );
          }))}
        </div>
        <div className="grid grid-cols-9 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => setCell(n)} className="py-1.5 border border-orange-800 text-orange-400 hover:bg-orange-950/40 text-xs font-bold">{n}</button>
          ))}
        </div>
        <button onClick={clearCell} className="w-full py-1 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center justify-center gap-1"><Eraser className="w-3 h-3" />CLEAR CELL</button>
        {done && <div className="text-center text-green-400 font-bold text-sm">SOLVED!</div>}
      </div>
    </div>
  );
}