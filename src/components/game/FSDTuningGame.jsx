// FSD Tuning — reflex minigame. Stop a charging marker inside the green
// resonance zone to tune your Frame Shift Drive. 5 rounds; closer to the
// zone center yields more charge. Playable standalone from Entertainment.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, X, Check, RotateCcw } from 'lucide-react';

const ROUNDS = 5;
const SPEED = 95; // % per second

export default function FSDTuningGame({ onComplete, onClose }) {
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState(0);
  const [green, setGreen] = useState({ start: 40, width: 14 });
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const rafRef = useRef(0);
  const frozenRef = useRef(false);

  // New green zone each round.
  useEffect(() => {
    if (done) return;
    setGreen({ start: 10 + Math.random() * 60, width: 7 + Math.random() * 9 });
    posRef.current = 0; dirRef.current = 1;
    frozenRef.current = false;
  }, [round, done]);

  // Marker oscillator — runs while mounted; freezes when frozen/done.
  useEffect(() => {
    let last = performance.now();
    const step = (ts) => {
      const dt = (ts - last) / 1000; last = ts;
      if (!frozenRef.current && !done) {
        let p = posRef.current + dirRef.current * SPEED * dt;
        let d = dirRef.current;
        if (p >= 100) { p = 100; d = -1; }
        if (p <= 0) { p = 0; d = 1; }
        posRef.current = p; dirRef.current = d; setPos(p);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [done]);

  const tune = useCallback(() => {
    if (done || frozenRef.current) return;
    frozenRef.current = true;
    const p = posRef.current;
    const center = green.start + green.width / 2;
    const inZone = p >= green.start && p <= green.start + green.width;
    const gain = inZone ? Math.max(10, Math.round(100 - Math.abs(p - center) * 5)) : 0;
    setResult({ inZone, gain });
    setScore(s => s + gain);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) setDone(true);
      else setRound(r => r + 1);
      setResult(null);
    }, 850);
  }, [done, green, round]);

  const restart = () => {
    setRound(0); setScore(0); setResult(null); setDone(false);
  };

  const finish = () => onComplete(score);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-orange-700 bg-black p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-300 font-bold uppercase text-sm">FSD Resonance Tuning</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
        </div>

        <div className="flex justify-between text-[10px] text-orange-600 uppercase">
          <span>Round {Math.min(round + (done ? 0 : 1), ROUNDS)}/{ROUNDS}</span>
          <span>Charge: <span className="text-orange-300">{score}</span></span>
        </div>

        {/* the tuning bar */}
        <div className="relative h-10 border border-orange-900 bg-black overflow-hidden">
          {/* green zone */}
          <div className="absolute top-0 bottom-0 bg-green-600/30 border-x border-green-500"
            style={{ left: `${green.start}%`, width: `${green.width}%` }} />
          {/* center line of zone */}
          <div className="absolute top-0 bottom-0 w-px bg-green-400"
            style={{ left: `${green.start + green.width / 2}%` }} />
          {/* marker */}
          <div className="absolute top-0 bottom-0 w-1 bg-orange-400 shadow-[0_0_6px_rgba(255,136,0,0.9)]"
            style={{ left: `${pos}%` }} />
          {/* scan grid */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-orange-950/60 last:border-r-0" />
            ))}
          </div>
        </div>

        {result && (
          <div className={`text-center text-xs font-bold ${result.inZone ? 'text-green-400' : 'text-red-400'}`}>
            {result.inZone ? <><Check className="w-3 h-3 inline mr-1" /> LOCKED +{result.gain} CHARGE</> : '✗ MISSED ZONE'}
          </div>
        )}

        {!done ? (
          <button onClick={tune}
            className="w-full py-3 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-sm font-bold uppercase tracking-widest">
            ⚡ TUNE FSD
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-center border border-green-700 bg-green-950/20 py-2">
              <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-green-300 font-bold text-sm">TUNING COMPLETE</div>
              <div className="text-green-500 text-xs">Total charge: {score}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={restart} className="flex-1 py-2 border border-orange-900 text-orange-500 hover:bg-orange-950/30 text-xs font-bold flex items-center justify-center gap-1">
                <RotateCcw className="w-3 h-3" /> RETRY
              </button>
              <button onClick={finish} className="flex-1 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold">
                COLLECT
              </button>
            </div>
          </div>
        )}

        <div className="text-orange-800 text-[8px] text-center border-t border-orange-950 pt-1">
          Stop the marker in the green zone. Closer to center = more charge.
        </div>
      </div>
    </div>
  );
}