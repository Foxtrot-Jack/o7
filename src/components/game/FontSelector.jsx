// Font family selector — choose the typeface and size for the entire CRT interface
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Type, RotateCcw } from 'lucide-react';
import { FONT_LIST, DEFAULT_FONT } from '@/lib/fonts';

export default function FontSelector() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const current = s.fontFamily || DEFAULT_FONT;
  const fontScale = s.fontScale ?? 100;

  const setFont = (id) => update({ settings: { ...s, fontFamily: id } });
  const setScale = (val) => update({ settings: { ...s, fontScale: val } });
  const resetAll = () => update({ settings: { ...s, fontFamily: DEFAULT_FONT, fontScale: 100 } });

  return (
    <div className="border border-orange-900 p-4 space-y-3">
      {/* Higher-specificity class to override the crt-container !important font rule,
          so each preview renders in its own typeface. */}
      <style>{`
        .font-selector .font-preview {
          font-family: var(--preview-font, monospace) !important;
        }
      `}</style>
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Font Family</h3>
      </div>
      <div className="text-orange-700 text-[10px]">
        Select a typeface for the entire interface. System fonts load instantly; Google Fonts require a network connection.
      </div>
      <div className="font-selector grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FONT_LIST.map(f => (
          <button
            key={f.id}
            onClick={() => setFont(f.id)}
            className={`border p-2 text-left transition-all ${current === f.id ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900 hover:border-orange-700'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-preview text-orange-400 text-sm font-bold" style={{ '--preview-font': f.family }}>{f.name}</span>
              <span className="font-preview text-orange-700 text-[9px] uppercase" style={{ '--preview-font': f.family }}>{f.type}</span>
            </div>
            <div className="font-preview text-orange-300 text-xs truncate" style={{ '--preview-font': f.family }}>
              The quick brown fox 0123
            </div>
          </button>
        ))}
      </div>

      {/* Font size slider */}
      <div className="border-t border-orange-900/50 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-orange-500 text-xs font-bold uppercase">Font Size</span>
          <span className="text-orange-300 text-xs w-12 text-right">{fontScale}%</span>
        </div>
        <input type="range" min="75" max="150" value={fontScale} onChange={e => setScale(parseInt(e.target.value))} className="w-full" />
        <div className="flex justify-between text-orange-800 text-[9px]">
          <span>75%</span>
          <span>100% (default)</span>
          <span>150%</span>
        </div>
      </div>

      <button onClick={resetAll} className="w-full py-1.5 border border-orange-700 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3 h-3" /> RESET TO DEFAULT
      </button>
    </div>
  );
}