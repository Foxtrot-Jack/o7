// Custom RGB color picker — overrides the theme color across the entire interface
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Palette, RotateCcw } from 'lucide-react';

const DEFAULT_COLOR = '#ff8800';

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 255, g: 136, b: 0 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

export default function ColorCustomizer() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const customColor = s.customColor ?? null;
  const enabled = customColor !== null;
  const color = customColor || DEFAULT_COLOR;
  const { r, g, b } = hexToRgb(color);

  const setEnabled = (on) => {
    update({ settings: { ...s, customColor: on ? DEFAULT_COLOR : null } });
  };

  const setHex = (hex) => {
    update({ settings: { ...s, customColor: hex } });
  };

  const setChannel = (channel, val) => {
    const next = { r, g, b, [channel]: val };
    setHex(rgbToHex(next.r, next.g, next.b));
  };

  const channels = [
    { label: 'R', key: 'r', value: r, color: '#ff4444' },
    { label: 'G', key: 'g', value: g, color: '#44ff44' },
    { label: 'B', key: 'b', value: b, color: '#4444ff' },
  ];

  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Custom RGB Color</h3>
        </div>
        <button onClick={() => setEnabled(!enabled)} className={`px-3 py-1 border text-xs ${enabled ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="text-orange-700 text-[10px]">
        Override the theme with a custom RGB color. Applies to the entire interface — text, glow, scanlines, and 3D views.
      </div>

      {enabled && (
        <>
          {/* Color preview + native picker */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded border border-orange-900 flex-shrink-0" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
            <div className="flex-1 space-y-1">
              <div className="text-orange-400 text-xs font-mono uppercase">{color}</div>
              <input type="color" value={color} onChange={e => setHex(e.target.value)} className="w-full h-8 bg-black border border-orange-900 cursor-pointer" />
            </div>
          </div>

          {/* RGB channel sliders */}
          <div className="space-y-2">
            {channels.map(ch => (
              <div key={ch.label} className="flex items-center gap-2">
                <span className="text-xs font-bold w-4" style={{ color: ch.color }}>{ch.label}</span>
                <input type="range" min="0" max="255" value={ch.value} onChange={e => setChannel(ch.key, parseInt(e.target.value))} className="flex-1" />
                <span className="text-orange-400 text-xs w-8 text-right font-mono">{ch.value}</span>
              </div>
            ))}
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-2">
            <span className="text-orange-700 text-[10px] uppercase">Hex</span>
            <input
              type="text"
              value={color}
              onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) setHex(v); }}
              className="flex-1 bg-black border border-orange-900 text-orange-300 px-2 py-1 text-xs font-mono"
              maxLength={7}
            />
          </div>

          {/* Reset */}
          <button onClick={() => setHex(DEFAULT_COLOR)} className="w-full py-1.5 border border-orange-700 text-orange-500 hover:bg-orange-950/30 text-[10px] flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> RESET TO DEFAULT
          </button>
        </>
      )}
    </div>
  );
}