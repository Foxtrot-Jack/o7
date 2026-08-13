// Livery — ship paint color via RGB sliders, applied as the ship's paint job.
import React from 'react';
import { Palette } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { SHIP_MAP } from '@/lib/gameState';

export default function Livery() {
  const { state, update } = useGameState();
  const paint = state.ship?.paintColor || { r: 255, g: 136, b: 0 };
  const set = (k, v) => update({ ship: { ...state.ship, paintColor: { ...paint, [k]: v } } });
  const css = `rgb(${paint.r}, ${paint.g}, ${paint.b})`;
  const shipName = state.ship?.name || SHIP_MAP[state.ship?.type]?.name || 'Ship';

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Palette className="w-4 h-4" /> Livery
      </div>
      <div className="border border-orange-900 bg-black/60 p-4 flex flex-col items-center gap-3">
        <div className="text-orange-700 text-[10px] uppercase">{shipName} Paint Preview</div>
        {/* Simple wireframe-ish ship silhouette tinted by paint color */}
        <svg viewBox="0 0 120 60" className="w-48 h-24">
          <polygon points="10,30 30,15 90,15 110,30 90,45 30,45" fill="none" stroke={css} strokeWidth="2" />
          <polygon points="40,30 60,22 80,30 60,38" fill="none" stroke={css} strokeWidth="1.5" />
          <line x1="30" y1="15" x2="30" y2="45" stroke={css} strokeWidth="1" />
          <line x1="90" y1="15" x2="90" y2="45" stroke={css} strokeWidth="1" />
        </svg>
        <div className="w-10 h-10 border border-orange-800" style={{ background: css }} />
      </div>
      <div className="space-y-3">
        {['r', 'g', 'b'].map(ch => (
          <div key={ch} className="border border-orange-900 bg-black/60 p-3">
            <div className="flex justify-between text-xs text-orange-500 uppercase"><span>{ch === 'r' ? 'Red' : ch === 'g' ? 'Green' : 'Blue'}</span><span className="text-orange-300">{paint[ch]}</span></div>
            <input type="range" min={0} max={255} value={paint[ch]} onChange={e => set(ch, Number(e.target.value))} className="w-full" />
          </div>
        ))}
      </div>
      <div className="text-orange-700 text-[10px]">This color persists as the ship's paint job across all screens.</div>
    </div>
  );
}