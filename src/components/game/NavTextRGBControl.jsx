// Independent RGB color control for the navigation bar & dropdown menu text.
// Separate from the global Text RGB so nav/menus can have their own glow tint.
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Sliders } from 'lucide-react';

const DEFAULT_RGB = { r: 255, g: 136, b: 0 }; // Elite Orange

export default function NavTextRGBControl() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const navTextRGB = s.navTextRGB || null;
  const enabled = navTextRGB !== null;
  const rgb = navTextRGB || DEFAULT_RGB;
  const [open, setOpen] = useState(false);

  const set = (val) => update({ settings: { ...s, navTextRGB: val } });
  const setChannel = (ch, val) => set({ ...rgb, [ch]: val });
  const toggle = (on) => set(on ? { ...DEFAULT_RGB } : null);

  const channels = [
    { label: 'R', key: 'r', value: rgb.r, color: '#ff4444' },
    { label: 'G', key: 'g', value: rgb.g, color: '#44ff44' },
    { label: 'B', key: 'b', value: rgb.b, color: '#4444ff' },
  ];

  return (
    <div className="border-t border-orange-900/50 pt-2 space-y-2">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left">
        <Sliders className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-orange-500 text-xs font-bold uppercase">Navigation &amp; Menu Text Color</span>
        <span className={`ml-auto px-2 py-0.5 border text-[10px] ${enabled ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{enabled ? 'ON' : 'OFF'}</span>
      </button>
      <div className="text-orange-700 text-[10px]">An independent RGB tint for the navigation bar and dropdown menus. Overrides the global text color for nav/menus only.</div>
      {open && (
        <div className="space-y-2">
          {enabled ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-orange-900 flex-shrink-0" style={{ background: `rgb(${rgb.r},${rgb.g},${rgb.b})`, boxShadow: `0 0 8px rgb(${rgb.r},${rgb.g},${rgb.b})` }} />
                <span className="text-orange-700 text-[10px]">Live preview in the nav bar above.</span>
              </div>
              {channels.map(ch => (
                <div key={ch.label} className="flex items-center gap-2">
                  <span className="text-xs font-bold w-4" style={{ color: ch.color }}>{ch.label}</span>
                  <input type="range" min="0" max="255" value={ch.value} onChange={e => setChannel(ch.key, parseInt(e.target.value))} className="flex-1" />
                  <span className="text-orange-400 text-xs w-8 text-right font-mono">{ch.value}</span>
                </div>
              ))}
              <button onClick={() => set({ ...DEFAULT_RGB })} className="text-orange-700 text-[10px] hover:text-orange-500">↺ Reset to Elite Orange</button>
            </>
          ) : (
            <button onClick={() => toggle(true)} className="w-full py-1.5 border border-orange-700 text-orange-500 hover:bg-orange-950/30 text-[10px] font-bold">
              ENABLE NAV TEXT COLOR
            </button>
          )}
        </div>
      )}
    </div>
  );
}