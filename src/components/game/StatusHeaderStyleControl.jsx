// Independent font sizing + RGB color control for the upper Status Header panel.
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Sliders, Type } from 'lucide-react';

const DEFAULT_RGB = { r: 255, g: 136, b: 0 }; // Elite Orange

export default function StatusHeaderStyleControl() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const sizePct = s.uiScale?.statusHeader ?? 100;
  const statusTextRGB = s.statusTextRGB || null;
  const enabled = statusTextRGB !== null;
  const rgb = statusTextRGB || DEFAULT_RGB;
  const [open, setOpen] = useState(false);

  const setSize = (val) => update({ settings: { ...s, uiScale: { ...(s.uiScale || {}), statusHeader: val } } });
  const setRGB = (val) => update({ settings: { ...s, statusTextRGB: val } });
  const setChannel = (ch, val) => setRGB({ ...rgb, [ch]: val });
  const toggle = (on) => setRGB(on ? { ...DEFAULT_RGB } : null);

  const channels = [
    { label: 'R', key: 'r', value: rgb.r, color: '#ff4444' },
    { label: 'G', key: 'g', value: rgb.g, color: '#44ff44' },
    { label: 'B', key: 'b', value: rgb.b, color: '#4444ff' },
  ];

  return (
    <div className="border-t border-orange-900/50 pt-2 space-y-2">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left">
        <Sliders className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-orange-500 text-xs font-bold uppercase">Status Header (Top Bar)</span>
        <span className={`ml-auto px-2 py-0.5 border text-[10px] ${enabled ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{enabled ? 'RGB ON' : 'RGB OFF'}</span>
      </button>
      <div className="text-orange-700 text-[10px]">Resizes and tints the upper status bar (credits, system, fuel, cargo). Independent of the nav bar.</div>
      {open && (
        <div className="space-y-3">
          {/* Font size */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3 text-orange-500" />
              <span className="text-orange-600 text-[10px] uppercase">Font Scale</span>
              <span className="text-orange-400 text-xs ml-auto w-10 text-right">{sizePct}%</span>
            </div>
            <input type="range" min="50" max="200" value={sizePct} onChange={e => setSize(parseInt(e.target.value))} className="w-full" />
          </div>
          {/* RGB */}
          {enabled ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-orange-900 flex-shrink-0" style={{ background: `rgb(${rgb.r},${rgb.g},${rgb.b})`, boxShadow: `0 0 8px rgb(${rgb.r},${rgb.g},${rgb.b})` }} />
                <span className="text-orange-700 text-[10px]">Live preview in the top status bar.</span>
              </div>
              {channels.map(ch => (
                <div key={ch.label} className="flex items-center gap-2">
                  <span className="text-xs font-bold w-4" style={{ color: ch.color }}>{ch.label}</span>
                  <input type="range" min="0" max="255" value={ch.value} onChange={e => setChannel(ch.key, parseInt(e.target.value))} className="flex-1" />
                  <span className="text-orange-400 text-xs w-8 text-right font-mono">{ch.value}</span>
                </div>
              ))}
              <button onClick={() => setRGB({ ...DEFAULT_RGB })} className="text-orange-700 text-[10px] hover:text-orange-500">↺ Reset to Elite Orange</button>
              <button onClick={() => toggle(false)} className="text-orange-700 text-[10px] hover:text-orange-500 block">✕ Disable RGB</button>
            </>
          ) : (
            <button onClick={() => toggle(true)} className="w-full py-1.5 border border-orange-700 text-orange-500 hover:bg-orange-950/30 text-[10px] font-bold">
              ENABLE STATUS HEADER RGB
            </button>
          )}
        </div>
      )}
    </div>
  );
}