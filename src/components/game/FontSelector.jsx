// Font family selector — choose the typeface for the entire CRT interface
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Type, RotateCcw } from 'lucide-react';
import { FONT_LIST, DEFAULT_FONT } from '@/lib/fonts';

export default function FontSelector() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const current = s.fontFamily || DEFAULT_FONT;

  const setFont = (id) => update({ settings: { ...s, fontFamily: id } });

  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Font Family</h3>
      </div>
      <div className="text-orange-700 text-[10px]">
        Select a typeface for the entire interface. System fonts load instantly; Google Fonts require a network connection.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FONT_LIST.map(f => (
          <button
            key={f.id}
            onClick={() => setFont(f.id)}
            className={`border p-2 text-left transition-all ${current === f.id ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900 hover:border-orange-700'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-orange-400 text-xs">{f.name}</span>
              <span className="text-orange-700 text-[9px] uppercase">{f.type}</span>
            </div>
            <div style={{ fontFamily: f.family }} className="text-orange-300 text-sm truncate">
              The quick brown fox 0123
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => setFont(DEFAULT_FONT)} className="w-full py-1.5 border border-orange-700 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3 h-3" /> RESET TO DEFAULT
      </button>
    </div>
  );
}