// Voidstrike — space-themed Battleship vs the ship AI. Auto-deploy your
// fleet, then tap the enemy grid to fire. The AI hunts your fleet back.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';

const SIZE = 8;
const SHIPS = [
  { id: 'carrier', name: 'Carrier', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 3 },
  { id: 'frigate', name: 'Frigate', size: 2 },
];

function placeFleet() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const ships = [];
  for (const ship of SHIPS) {
    let ok = false, tries = 0;
    while (!ok && tries++ < 400) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (horiz ? SIZE : SIZE - ship.size + 1));
      const c = Math.floor(Math.random() * (horiz ? SIZE - ship.size + 1 : SIZE));
      let free = true; const cells = [];
      for (let i = 0; i < ship.size; i++) {
        const rr = horiz ? r : r + i, cc = horiz ? c + i : c;
        if (grid[rr][cc] !== 0) { free = false; break; }
        cells.push([rr, cc]);
      }
      if (free) { cells.forEach(([rr, cc]) => grid[rr][cc] = ship.id); ships.push({ ...ship, cells }); ok = true; }
    }
  }
  return { grid, ships };
}
const empty = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

export default function SpaceBattleshipGame({ onClose, onComplete }) {
  const [player, setPlayer] = useState(null);
  const [enemy, setEnemy] = useState(null);
  const [pShots, setPShots] = useState(empty);
  const [eShots, setEShots] = useState(empty);
  const [turn, setTurn] = useState('player');
  const [msg, setMsg] = useState('Tap the enemy grid to fire.');
  const [over, setOver] = useState(null);
  const doneRef = useRef(false);
  const huntRef = useRef([]);

  const deploy = useCallback(() => {
    setPlayer(placeFleet()); setEnemy(placeFleet());
    setPShots(empty()); setEShots(empty());
    setTurn('player'); setMsg('Tap the enemy grid to fire.'); setOver(null); doneRef.current = false; huntRef.current = [];
  }, []);
  useEffect(() => { deploy(); }, [deploy]);

  const fire = (r, c) => {
    if (over || turn !== 'player' || !enemy || pShots[r][c] !== 0) return;
    const ns = pShots.map(row => [...row]);
    const hit = enemy.grid[r][c] !== 0;
    ns[r][c] = hit ? 2 : 1;
    setPShots(ns);
    if (hit) {
      const sid = enemy.grid[r][c];
      const ship = enemy.ships.find(s => s.id === sid);
      const sunk = ship.cells.every(([rr, cc]) => ns[rr][cc] === 2);
      setMsg(sunk ? `${ship.name.toUpperCase()} destroyed!` : 'Direct hit!');
      if (enemy.ships.every(s => s.cells.every(([rr, cc]) => ns[rr][cc] === 2))) {
        setOver('win'); doneRef.current = true; onComplete && onComplete(true); return;
      }
    } else setMsg('Miss — splash.');
    setTurn('enemy');
  };

  useEffect(() => {
    if (turn !== 'enemy' || over || !player) return;
    const t = setTimeout(() => {
      let cand = [];
      for (const [hr, hc] of huntRef.current) {
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = hr + dr, nc = hc + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && eShots[nr][nc] === 0) cand.push([nr, nc]);
        }
      }
      if (!cand.length) { cand = []; for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (eShots[i][j] === 0) cand.push([i, j]); }
      const [r, c] = cand[Math.floor(Math.random() * cand.length)];
      const ns = eShots.map(row => [...row]);
      const hit = player.grid[r][c] !== 0;
      ns[r][c] = hit ? 2 : 1;
      if (hit) huntRef.current = [...huntRef.current, [r, c]];
      setEShots(ns);
      const ship = player.ships.find(s => s.cells.some(([rr, cc]) => rr === r && cc === c));
      if (hit && ship) {
        const sunk = ship.cells.every(([rr, cc]) => ns[rr][cc] === 2);
        if (sunk) huntRef.current = huntRef.current.filter(([rr, cc]) => !ship.cells.some(([sr, sc]) => sr === rr && sc === cc));
        setMsg(sunk ? `Your ${ship.name} is lost!` : 'Enemy hits your fleet!');
      } else setMsg('Enemy misses.');
      if (player.ships.every(s => s.cells.every(([rr, cc]) => ns[rr][cc] === 2))) {
        setOver('lose'); doneRef.current = true; onComplete && onComplete(false); return;
      }
      setTurn('player');
    }, 650);
    return () => clearTimeout(t);
  }, [turn, over, eShots, player, onComplete]);

  const Cell = ({ v, onCell, ship, clickable }) => {
    let bg = 'bg-black';
    if (ship) bg = 'bg-cyan-950/40';
    if (v === 1) bg = 'bg-orange-950/60';
    if (v === 2) bg = ship ? 'bg-red-700' : 'bg-red-900/70';
    return (
      <button disabled={!clickable} onClick={onCell} className={`aspect-square border border-orange-950 ${bg} flex items-center justify-center`}>
        {v === 1 && <span className="text-orange-500 text-[10px]">·</span>}
        {v === 2 && <span className="text-white text-[10px] font-bold">✕</span>}
        {ship && v === 0 && <span className="text-cyan-700 text-[8px]">▣</span>}
      </button>
    );
  };

  if (!player || !enemy) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2">
      <div className="w-full max-w-md border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Voidstrike</h3>
          <div className="flex items-center gap-1">
            <button onClick={deploy} className="px-2 py-0.5 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" />REDEPLOY</button>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className={`text-center text-xs font-bold ${over === 'win' ? 'text-green-400' : over === 'lose' ? 'text-red-400' : 'text-orange-400'}`}>{msg}</div>
        <div className="space-y-1">
          <div className="text-orange-600 text-[9px] uppercase">Enemy Fleet — fire here</div>
          <div className="grid gap-px bg-orange-900/30" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
            {pShots.map((row, r) => row.map((v, c) => (
              <Cell key={`p${r}-${c}`} v={v} clickable={turn === 'player' && !over && v === 0} onCell={() => fire(r, c)} />
            )))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-orange-600 text-[9px] uppercase">Your Fleet</div>
          <div className="grid gap-px bg-orange-900/30" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
            {eShots.map((row, r) => row.map((v, c) => (
              <Cell key={`e${r}-${c}`} v={v} ship={player.grid[r][c] !== 0} clickable={false} />
            )))}
          </div>
        </div>
        {over && <div className={`text-center text-sm font-bold ${over === 'win' ? 'text-green-400' : 'text-red-400'}`}>{over === 'win' ? 'VICTORY — enemy fleet annihilated' : 'DEFEAT — fleet lost'}</div>}
      </div>
    </div>
  );
}