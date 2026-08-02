// Self-Destruct Screen — 10-second countdown with abort option
import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/lib/gameState';
import { Bomb, X } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

const COUNTDOWN_SECONDS = 10;

export default function SelfDestructScreen({ onCancel }) {
  const { selfDestruct } = useGameState();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [aborted, setAborted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    soundEngine.play('alert');
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          selfDestruct();
          return 0;
        }
        soundEngine.play('click');
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selfDestruct]);

  const handleAbort = () => {
    if (aborted) return;
    setAborted(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    soundEngine.play('confirm');
    setTimeout(() => onCancel(), 300);
  };

  const pct = (countdown / COUNTDOWN_SECONDS) * 100;
  const isCritical = countdown <= 3;

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className={`border-2 p-6 space-y-3 ${isCritical ? 'border-red-600 animate-pulse' : 'border-orange-700'}`}>
          <Bomb className={`w-12 h-12 mx-auto ${isCritical ? 'text-red-500' : 'text-orange-500'}`} />
          <h2 className="text-red-400 font-bold text-xl uppercase">Self-Destruct Initiated</h2>
          <div className={`text-6xl font-bold ${isCritical ? 'text-red-500' : 'text-orange-400'}`}>
            {countdown}
          </div>
          <div className="w-full h-3 bg-black border border-red-900">
            <div
              className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-600' : 'bg-orange-600'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-orange-700 text-[10px]">
            Ship will be destroyed. All cargo and cartographic data will be lost. Materials will be preserved.
          </p>
        </div>

        <button
          onClick={handleAbort}
          disabled={aborted}
          className="w-full py-3 border-2 border-green-600 text-green-400 hover:bg-green-950/30 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
          ABORT SELF-DESTRUCT
        </button>

        {aborted && (
          <p className="text-green-500 text-xs font-bold">SELF-DESTRUCT ABORTED</p>
        )}
      </div>
    </div>
  );
}