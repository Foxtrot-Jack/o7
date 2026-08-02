// SurfaceScannerMinigame — grid-based signal triangulation on planet surface
import React, { useState, useMemo, useCallback } from 'react';
import { Crosshair, Radar, X, Check, AlertTriangle } from 'lucide-react';

const GRID_SIZE = 6;
const MAX_PROBES = 8;

function generateTarget() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function getHeat(probe, target) {
  const dist = Math.abs(probe.x - target.x) + Math.abs(probe.y - target.y);
  if (dist === 0) return { label: 'SIGNAL', color: 'text-green-400', bg: 'bg-green-950/60', dist };
  if (dist <= 1) return { label: 'BURNING', color: 'text-red-400', bg: 'bg-red-950/40', dist };
  if (dist <= 2) return { label: 'HOT', color: 'text-orange-400', bg: 'bg-orange-950/30', dist };
  if (dist <= 4) return { label: 'WARM', color: 'text-yellow-600', bg: 'bg-yellow-950/20', dist };
  if (dist <= 6) return { label: 'COOL', color: 'text-blue-500', bg: 'bg-blue-950/20', dist };
  return { label: 'COLD', color: 'text-cyan-700', bg: 'bg-cyan-950/10', dist };
}

export default function SurfaceScannerMinigame({ bodyName, onComplete, onClose }) {
  const [target, setTarget] = useState(generateTarget);
  const [probes, setProbes] = useState([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  const handleProbe = useCallback((x, y) => {
    if (won || lost) return;
    if (probes.some(p => p.x === x && p.y === y)) return;
    const newProbes = [...probes, { x, y }];
    setProbes(newProbes);
    if (x === target.x && y === target.y) {
      setWon(true);
    } else if (newProbes.length >= MAX_PROBES) {
      setLost(true);
    }
  }, [probes, target, won, lost]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-cyan-700 bg-black p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900 pb-2">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-cyan-500" />
            <h3 className="text-cyan-300 font-bold uppercase text-sm">Surface Probe Scan</h3>
          </div>
          <button onClick={onClose} disabled={won || lost}><X className="w-4 h-4 text-cyan-700" /></button>
        </div>

        {bodyName && <div className="text-cyan-600 text-[10px]">TARGET BODY: {bodyName}</div>}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-bold ${won ? 'text-green-400' : lost ? 'text-red-400' : 'text-cyan-500'}`}>
            {won ? '✓ SIGNAL ACQUIRED' : lost ? '✗ PROBES EXHAUSTED' : `PROBES: ${probes.length}/${MAX_PROBES}`}
          </span>
          <span className="text-cyan-700 text-[9px]">Triangulate the surface signal</span>
        </div>

        {/* Grid */}
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const probe = probes.find(p => p.x === x && p.y === y);
            const heat = probe ? getHeat(probe, target) : null;
            return (
              <button
                key={idx}
                onClick={() => handleProbe(x, y)}
                disabled={won || lost || !!probe}
                className={`aspect-square border text-[8px] font-bold flex items-center justify-center transition-all ${
                  probe
                    ? `${heat.bg} border-cyan-800 ${heat.color}`
                    : won && x === target.x && y === target.y
                      ? 'border-green-500 bg-green-950/40 text-green-400'
                      : 'border-cyan-950 text-cyan-800 hover:border-cyan-700 hover:bg-cyan-950/20'
                }`}
              >
                {probe ? heat.label : ''}
                {won && x === target.x && y === target.y && !probe && '◎'}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {won && (
          <div className="border border-green-500 bg-green-950/20 p-3 text-center space-y-2">
            <Check className="w-6 h-6 text-green-400 mx-auto" />
            <div className="text-green-300 font-bold text-sm">SIGNAL ACQUIRED</div>
            <div className="text-green-600 text-[10px]">Found in {probes.length} probes</div>
            <button onClick={() => onComplete(true)} className="w-full py-1.5 border border-green-500 text-green-400 hover:bg-green-950/40 text-xs font-bold">
              COLLECT DATA
            </button>
          </div>
        )}
        {lost && (
          <div className="border border-red-700 bg-red-950/20 p-3 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
            <div className="text-red-300 font-bold text-sm">SCAN FAILED</div>
            <div className="text-red-600 text-[10px]">Signal was at ({target.x+1}, {target.y+1})</div>
            <button onClick={() => onComplete(false)} className="w-full py-1.5 border border-red-700 text-red-400 hover:bg-red-950/40 text-xs font-bold">
              ABORT
            </button>
          </div>
        )}

        <div className="text-cyan-800 text-[8px] text-center border-t border-cyan-950 pt-1 flex items-center justify-center gap-1">
          <Crosshair className="w-2.5 h-2.5" /> COLD → COOL → WARM → HOT → BURNING → SIGNAL
        </div>
      </div>
    </div>
  );
}