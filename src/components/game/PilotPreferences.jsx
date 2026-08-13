// Pilot Preferences — interface brightness, clock, orbital lines, crimes, NPC icons.
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

const TOGGLES = [
  { key: 'displayClock', label: 'Display Clock' },
  { key: 'orbitalLines', label: 'Orbital Lines (Orrery)' },
  { key: 'crimesAgainstPlayer', label: 'Crimes Against Player' },
  { key: 'npcShipIcons', label: 'NPC Ship Icons (Orrery)' },
];

export default function PilotPreferences() {
  const { state, updateSettings } = useGameState();
  const s = state.settings || {};
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <SlidersHorizontal className="w-4 h-4" /> Pilot Preferences
      </div>
      <div className="border border-orange-900 bg-black/60 p-3 space-y-2">
        <div className="flex justify-between text-xs text-orange-500"><span>Interface Brightness</span><span className="text-orange-300">{s.textBrightness || 100}%</span></div>
        <input type="range" min={50} max={150} value={s.textBrightness || 100} onChange={e => updateSettings({ textBrightness: Number(e.target.value) })} className="w-full" />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {TOGGLES.map(t => {
          const on = !!s[t.key];
          return (
            <button key={t.key} onClick={() => updateSettings({ [t.key]: !on })} className={`flex items-center px-3 py-2 border text-xs ${on ? 'border-green-700 text-green-500 bg-green-950/20' : 'border-orange-800 text-orange-600 hover:text-orange-400'}`}>
              {t.label} <span className="ml-auto">{on ? 'ON' : 'OFF'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}