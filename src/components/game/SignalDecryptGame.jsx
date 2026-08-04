// Signal Decrypt — memory/sequence minigame (Simon-style). Repeat the
// alien transmission pattern; it grows each round. Playable standalone.
import React, { useState, useRef } from 'react';
import { Radio, X, Check, AlertTriangle, RotateCcw, Play } from 'lucide-react';

const PADS = [
  { id: 0, border: 'border-orange-500', glow: 'bg-orange-500/50', text: 'text-orange-300' },
  { id: 1, border: 'border-cyan-500', glow: 'bg-cyan-500/50', text: 'text-cyan-300' },
  { id: 2, border: 'border-green-500', glow: 'bg-green-500/50', text: 'text-green-300' },
  { id: 3, border: 'border-purple-500', glow: 'bg-purple-500/50', text: 'text-purple-300' },
];
const MAX_ROUND = 8;

export default function SignalDecryptGame({ onComplete, onClose }) {
  const [seq, setSeq] = useState([]);
  const [inputIdx, setInputIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | show | input | over | win
  const [flash, setFlash] = useState(-1);
  const phaseRef = useRef('idle');

  const playShow = (s) => {
    setPhase('show'); phaseRef.current = 'show'; setInputIdx(0); setFlash(-1);
    let i = 0;
    const next = () => {
      if (i >= s.length) { setFlash(-1); setPhase('input'); phaseRef.current = 'input'; return; }
      setFlash(s[i]);
      setTimeout(() => { setFlash(-1); i++; setTimeout(next, 220); }, 480);
    };
    setTimeout(next, 450);
  };

  const start = () => {
    const s = [Math.floor(Math.random() * 4)];
    setSeq(s); playShow(s);
  };

  const press = (id) => {
    if (phaseRef.current !== 'input') return;
    setFlash(id); setTimeout(() => setFlash(-1), 180);
    if (seq[inputIdx] === id) {
      const ni = inputIdx + 1;
      if (ni >= seq.length) {
        if (seq.length >= MAX_ROUND) { setPhase('win'); phaseRef.current = 'win'; }
        else {
          const ns = [...seq, Math.floor(Math.random() * 4)];
          setSeq(ns);
          setTimeout(() => playShow(ns), 600);
        }
      } else setInputIdx(ni);
    } else {
      setPhase('over'); phaseRef.current = 'over';
    }
  };

  const score = phase === 'win' ? MAX_ROUND : Math.max(0, seq.length - 1);
  const restart = () => { setSeq([]); setInputIdx(0); setPhase('idle'); phaseRef.current = 'idle'; setFlash(-1); };
  const finish = () => onComplete(score);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-purple-700 bg-black p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-purple-900 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-500" />
            <h3 className="text-purple-300 font-bold uppercase text-sm">Signal Decrypt</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-purple-700" /></button>
        </div>

        <div className="flex justify-between text-[10px] text-purple-600 uppercase">
          <span>Round {phase === 'win' ? MAX_ROUND : (seq.length || 0)}/{MAX_ROUND}</span>
          <span>
            {phase === 'show' ? 'TRANSMITTING…' : phase === 'input' ? 'REPEAT PATTERN' : phase === 'over' ? '✗ SIGNAL LOST' : phase === 'win' ? '✓ DECRYPTED' : 'AWAITING'}
          </span>
        </div>

        {/* pad grid */}
        <div className="grid grid-cols-2 gap-2">
          {PADS.map(p => (
            <button
              key={p.id}
              onClick={() => press(p.id)}
              disabled={phase !== 'input'}
              className={`aspect-square border-2 ${p.border} ${flash === p.id ? p.glow : 'bg-black'} ${phase === 'input' ? 'hover:bg-orange-950/20 cursor-pointer' : 'opacity-70'} transition-all flex items-center justify-center`}>
              <span className={`text-3xl ${p.text} ${flash === p.id ? 'scale-125' : ''} transition-transform`}>◈</span>
            </button>
          ))}
        </div>

        {phase === 'idle' && (
          <button onClick={start} className="w-full py-2.5 border border-purple-500 text-purple-300 hover:bg-purple-950/40 text-sm font-bold uppercase flex items-center justify-center gap-2">
            <Play className="w-3.5 h-3.5" /> Begin Transmission
          </button>
        )}

        {(phase === 'over' || phase === 'win') && (
          <div className="space-y-2">
            <div className={`text-center border py-2 ${phase === 'win' ? 'border-green-600 bg-green-950/20' : 'border-red-700 bg-red-950/20'}`}>
              {phase === 'win'
                ? <><Check className="w-5 h-5 text-green-400 mx-auto mb-1" /><div className="text-green-300 font-bold text-sm">DECRYPTED</div><div className="text-green-500 text-xs">{MAX_ROUND} rounds cleared</div></>
                : <><AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" /><div className="text-red-300 font-bold text-sm">SIGNAL LOST</div><div className="text-red-500 text-xs">Decoded {score} round{score !== 1 ? 's' : ''}</div></>}
            </div>
            <div className="flex gap-2">
              <button onClick={restart} className="flex-1 py-2 border border-purple-900 text-purple-500 hover:bg-purple-950/30 text-xs font-bold flex items-center justify-center gap-1">
                <RotateCcw className="w-3 h-3" /> RETRY
              </button>
              <button onClick={finish} className="flex-1 py-2 border border-purple-500 text-purple-300 hover:bg-purple-950/40 text-xs font-bold">COLLECT</button>
            </div>
          </div>
        )}

        <div className="text-purple-800 text-[8px] text-center border-t border-purple-950 pt-1">
          Watch the pattern, then repeat it. Pattern grows each round.
        </div>
      </div>
    </div>
  );
}