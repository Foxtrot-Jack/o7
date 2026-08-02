// Menu Text Style settings — independent size + RGB controls for each
// NavBar dropdown group (Explore, Station, Commerce, Fleet, Industry,
// Commander). Contents stay fully visible via the dropdown's scroll area.
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Compass, Home, TrendingUp, Package, Pickaxe, User, Menu } from 'lucide-react';

export const NAV_MENU_GROUPS = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'station', label: 'Station', icon: Home },
  { id: 'commerce', label: 'Commerce', icon: TrendingUp },
  { id: 'fleet', label: 'Fleet', icon: Package },
  { id: 'industry', label: 'Industry', icon: Pickaxe },
  { id: 'commander', label: 'Commander', icon: User },
];

const DEFAULT_RGB = { r: 255, g: 136, b: 0 };

export function getNavGroupStyle(navGroupStyles, groupId) {
  const raw = (navGroupStyles || {})[groupId] || {};
  return {
    size: typeof raw.size === 'number' ? raw.size : 100,
    rgb: raw.rgb || null,
  };
}

function GroupControl({ group }) {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const styles = s.navGroupStyles || {};
  const raw = getNavGroupStyle(styles, group.id);
  const enabled = raw.rgb !== null;
  const rgb = raw.rgb || DEFAULT_RGB;
  const Icon = group.icon;

  const setStyle = (val) => update({ settings: { ...s, navGroupStyles: { ...styles, [group.id]: { ...getNavGroupStyle(styles, group.id), ...val } } } });
  const setChannel = (ch, val) => setStyle({ rgb: { ...(raw.rgb || DEFAULT_RGB), [ch]: val } });
  const toggleRGB = (on) => setStyle({ rgb: on ? { ...DEFAULT_RGB } : null });

  const channels = [
    { label: 'R', key: 'r', value: rgb.r, color: '#ff4444' },
    { label: 'G', key: 'g', value: rgb.g, color: '#44ff44' },
    { label: 'B', key: 'b', value: rgb.b, color: '#4444ff' },
  ];

  return (
    <div className="border border-orange-950/60 bg-black/40 p-2 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-orange-400 text-xs font-bold uppercase">{group.label}</span>
        <span className="ml-auto text-orange-400 text-[10px]">{raw.size}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-orange-700 text-[10px] uppercase w-8">Size</span>
        <input type="range" min="50" max="200" value={raw.size} onChange={e => setStyle({ size: parseInt(e.target.value) })} className="flex-1" />
      </div>
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
            <button onClick={() => setStyle({ rgb: { ...DEFAULT_RGB } })} className="text-orange-700 text-[9px] hover:text-orange-500">↺ Reset</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuTextStyleSettings() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 w-full text-left">
        <Menu className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Menu Text Styles</h3>
        <span className="ml-auto text-orange-700 text-[10px]">{collapsed ? '▸ SHOW' : '▾ HIDE'}</span>
      </button>
      <div className="text-orange-700 text-[10px]">Independent size and color controls for each navigation dropdown. Menu contents stay fully visible and scroll when enlarged.</div>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {NAV_MENU_GROUPS.map(g => <GroupControl key={g.id} group={g} />)}
        </div>
      )}
    </div>
  );
}