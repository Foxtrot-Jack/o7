// Flight Assistant — toggles for auto dock, auto launch, auto land, auto fuel scoop.
import React from 'react';
import { Plane, Anchor, MapPin, Fuel } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

const TOGGLES = [
  { key: 'autodock', label: 'Auto Dock', icon: Anchor },
  { key: 'autolaunch', label: 'Auto Launch', icon: Plane },
  { key: 'autoland', label: 'Auto Land', icon: MapPin },
  { key: 'autofuelscoop', label: 'Auto Fuel Scoop', icon: Fuel },
];

export default function FlightAssistant() {
  const { state, updateSettings } = useGameState();
  const fa = state.settings?.flightAssist || {};
  const toggle = (key) => updateSettings({ flightAssist: { ...fa, [key]: !fa[key] } });
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Plane className="w-4 h-4" /> Flight Assistant
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TOGGLES.map(t => {
          const Icon = t.icon;
          const on = !!fa[t.key];
          return (
            <button key={t.key} onClick={() => toggle(t.key)} className={`flex items-center gap-2 px-3 py-2 border text-xs ${on ? 'border-green-700 text-green-500 bg-green-950/20' : 'border-orange-800 text-orange-600 hover:text-orange-400'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label} <span className="ml-auto">{on ? 'ON' : 'OFF'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}