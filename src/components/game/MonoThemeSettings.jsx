// Monochrome settings — granular color-category toggles for the mono theme.
// Start monochrome, switch colors back on one category at a time.
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Palette, Star, Globe, Rocket, Building, Type as TypeIcon, Sun } from 'lucide-react';

const TOGGLES = [
  { key: 'stars', label: 'Star Colors', icon: Star, desc: 'Spectral star colors in the galaxy map and orrery.' },
  { key: 'planets', label: 'Planet Colors', icon: Globe, desc: 'Planet, moon, asteroid, and alien-site colors.' },
  { key: 'ships', label: 'Ship Colors', icon: Rocket, desc: 'Player, NPC, and fleet-carrier model colors.' },
  { key: 'stations', label: 'Station Colors', icon: Building, desc: 'Station and outpost model colors.' },
  { key: 'uiAccent', label: 'Menu & Font Colors', icon: TypeIcon, desc: 'Restore accent colors for menus, borders, and text across the interface.' },
];

export default function MonoThemeSettings() {
  const { state, update } = useGameState();
  const s = state.settings || {};
  const isMono = s.colorTheme === 'mono';
  const overrides = s.monoOverrides || {};

  const setOverride = (key, val) => update({ settings: { ...s, monoOverrides: { ...overrides, [key]: val } } });
  const setAll = (val) => update({ settings: { ...s, monoOverrides: { stars: val, planets: val, ships: val, stations: val, uiAccent: val } } });

  return (
    <div className="space-y-3">
      <div className={`border p-4 space-y-1 ${isMono ? 'border-orange-700' : 'border-orange-900'}`}>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Monochrome Mode</h3>
          <span className={`ml-auto px-2 py-0.5 border text-[10px] ${isMono ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{isMono ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
        <p className="text-orange-700 text-[10px]">Monochrome strips all color for a pure phosphor look. Switch on individual categories below to bring them back one at a time. Select the Monochrome theme in the Color tab to enable.</p>
      </div>

      {!isMono && (
        <div className="text-orange-700 text-[10px] border border-orange-900 p-3">Enable the Monochrome theme in the Color tab to use these toggles.</div>
      )}

      {TOGGLES.map(t => {
        const Icon = t.icon;
        const on = !!overrides[t.key];
        return (
          <div key={t.key} className="border border-orange-900 p-3 flex items-start gap-3">
            <Icon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-orange-400 text-xs font-bold uppercase">{t.label}</div>
              <div className="text-orange-700 text-[10px] mt-0.5">{t.desc}</div>
            </div>
            <button
              onClick={() => setOverride(t.key, !on)}
              disabled={!isMono}
              className={`px-3 py-1 border text-xs flex-shrink-0 ${on ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'} ${!isMono ? 'opacity-40 cursor-not-allowed' : 'hover:border-orange-600'}`}
            >
              {on ? 'ON' : 'OFF'}
            </button>
          </div>
        );
      })}

      <div className="border border-orange-900 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-orange-500 text-xs font-bold uppercase">Quick: All Colors</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setAll(true)} disabled={!isMono} className="flex-1 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] disabled:opacity-40">ALL ON</button>
          <button onClick={() => setAll(false)} disabled={!isMono} className="flex-1 py-1 border border-orange-900 text-orange-700 hover:text-orange-500 text-[10px] disabled:opacity-40">ALL OFF</button>
        </div>
      </div>
    </div>
  );
}