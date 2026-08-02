// Unified UI Text Style settings — size + RGB controls for every screen-content
// grouping, arranged intuitively by area. Applies to screen content only;
// the nav bar, status header, and body list have their own dedicated controls.
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Type } from 'lucide-react';
import { UI_TEXT_GROUPS, getCategoryStyle } from '@/lib/uiTextCategories';

const DEFAULT_RGB = { r: 255, g: 136, b: 0 };

function CategoryControl({ group, cat }) {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const styles = s.uiTextStyles || {};
  const raw = getCategoryStyle(styles, cat.id);
  const enabled = raw.rgb !== null;
  const rgb = raw.rgb || DEFAULT_RGB;

  const setStyle = (val) => update({ settings: { ...s, uiTextStyles: { ...styles, [cat.id]: { ...getCategoryStyle(styles, cat.id), ...val } } } });
  const setSize = (size) => setStyle({ size });
  const setRGB = (rgbVal) => setStyle({ rgb: rgbVal });
  const setChannel = (ch, val) => setRGB({ ...rgb, [ch]: val });
  const toggleRGB = (on) => setRGB(on ? { ...DEFAULT_RGB } : null);

  const channels = [
    { label: 'R', key: 'r', value: rgb.r, color: '#ff4444' },
    { label: 'G', key: 'g', value: rgb.g, color: '#44ff44' },
    { label: 'B', key: 'b', value: rgb.b, color: '#4444ff' },
  ];

  return (
    <div className="border border-orange-950/60 bg-black/40 p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-orange-400 text-xs font-bold uppercase">{cat.label}</span>
        <span className="text-orange-700 text-[9px]">{cat.screens.length} screen{cat.screens.length > 1 ? 's' : ''}</span>
      </div>
      {/* Size */}
      <div className="flex items-center gap-2">
        <Type className="w-3 h-3 text-orange-600" />
        <span className="text-orange-700 text-[10px] uppercase w-8">Size</span>
        <input type="range" min="50" max="200" value={raw.size} onChange={e => setSize(parseInt(e.target.value))} className="flex-1" />
        <span className="text-orange-400 text-[10px] w-9 text-right">{raw.size}%</span>
      </div>
      {/* RGB toggle + sliders */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-orange-700 text-[10px] uppercase">Color</span>
          <button onClick={() => toggleRGB(!enabled)} className={`px-2 py-0.5 border text-[9px] ${enabled ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{enabled ? 'RGB ON' : 'RGB OFF'}</button>
        </div>
        {enabled && (
          <div className="space-y-1 pt-1">
            {channels.map(ch => (
              <div key={ch.label} className="flex items-center gap-2">
                <span className="text-[10px] font-bold w-3" style={{ color: ch.color }}>{ch.label}</span>
                <input type="range" min="0" max="255" value={ch.value} onChange={e => setChannel(ch.key, parseInt(e.target.value))} className="flex-1" />
                <span className="text-orange-400 text-[10px] w-7 text-right font-mono">{ch.value}</span>
              </div>
            ))}
            <button onClick={() => setRGB({ ...DEFAULT_RGB })} className="text-orange-700 text-[9px] hover:text-orange-500">↺ Reset</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UITextStyleSettings() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 w-full text-left">
        <Type className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Screen Text Styles</h3>
        <span className="ml-auto text-orange-700 text-[10px]">{collapsed ? '▸ SHOW' : '▾ HIDE'}</span>
      </button>
      <div className="text-orange-700 text-[10px]">Independent size and color controls for every screen grouping (Navigation, Scanning, Services, etc.). Changes apply to the screens under each grouping.</div>
      {!collapsed && (
        <div className="space-y-4">
          {UI_TEXT_GROUPS.map(group => (
            <div key={group.id} className="space-y-2">
              <div className="text-orange-600 text-[11px] font-bold uppercase border-b border-orange-900/40 pb-1">{group.label}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.categories.map(cat => (
                  <CategoryControl key={cat.id} group={group} cat={cat} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}