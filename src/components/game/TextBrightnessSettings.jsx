// Text Brightness & RGB color control — brightness multiplier + text glow tint
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Sun, Sliders } from 'lucide-react';

const DEFAULT_RGB = { r: 255, g: 136, b: 0 }; // Elite Orange

export default function TextBrightnessSettings() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const textRGB = s.textRGB || null;
  const enabled = textRGB !== null;
  const rgb = textRGB || DEFAULT_RGB;
  const [showRGB, setShowRGB] = useState(false);

  const set = (key, val) => update({ settings: { ...s, [key]: val } });
  const setChannel = (ch, val) => set('textRGB', { ...rgb, [ch]: val });
  const toggleRGB = (on) => set('textRGB', on ? { ...DEFAULT_RGB } : null);

  const channels = [
    { label: 'R', key: 'r', value: rgb.r, color: '#ff4444' },
    { label: 'G', key: 'g', value: rgb.g, color: '#44ff44' },
    { label: 'B', key: 'b', value: rgb.b, color: '#4444ff' },
  ];

  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sun className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Text Brightness</h3>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min="50" max="600" value={s.textBrightness || 100} onChange={e => set('textBrightness', parseInt(e.target.value))} className="flex-1" />
        <span className="text-orange-300 text-xs w-12">{s.textBrightness || 100}%</span>
      </div>
      <div className="text-orange-700 text-[10px]">Increase for dim screens. 100% is default. Up to 600% for a glaring high-contrast glow that remains readable on black.</div>

      {/* RGB sub-category — collapsible */}
      <button onClick={() => setShowRGB(!showRGB)} className="flex items-center gap-2 w-full text-left border-t border-orange-900/50 pt-2">
        <Sliders className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-orange-500 text-xs font-bold uppercase">Text Color (RGB)</span>
        <span className={`ml-auto px-2 py-0.5 border text-[10px] ${enabled ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{enabled ? 'ON' : 'OFF'}</span>
      </button>
      {showRGB && (
        <div className="space-y-2">
          {enabled ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-orange-900 flex-shrink-0" style={{ background: `rgb(${rgb.r},${rgb.g},${rgb.b})`, boxShadow: `0 0 8px rgb(${rgb.r},${rgb.g},${rgb.b})` }} />
                <span className="text-orange-700 text-[10px]">Tints the text glow independently of the overall color theme.</span>
              </div>
              {channels.map(ch => (
                <div key={ch.label} className="flex items-center gap-2">
                  <span className="text-xs font-bold w-4" style={{ color: ch.color }}>{ch.label}</span>
                  <input type="range" min="0" max="255" value={ch.value} onChange={e => setChannel(ch.key, parseInt(e.target.value))} className="flex-1" />
                  <span className="text-orange-400 text-xs w-8 text-right font-mono">{ch.value}</span>
                </div>
              ))}
              <button onClick={() => set('textRGB', { ...DEFAULT_RGB })} className="text-orange-700 text-[10px] hover:text-orange-500">↺ Reset to Elite Orange</button>
            </>
          ) : (
            <button onClick={() => toggleRGB(true)} className="w-full py-1.5 border border-orange-700 text-orange-500 hover:bg-orange-950/30 text-[10px] font-bold">
              ENABLE CUSTOM TEXT COLOR
            </button>
          )}
        </div>
      )}
    </div>
  );
}