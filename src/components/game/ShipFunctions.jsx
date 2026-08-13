// Ship Functions — ship model + system toggles (lights, gear, scoop, beacon, reboot/repair, self-destruct).
import React from 'react';
import { Cpu, Lightbulb, Plane, Package, Siren, Wrench, Skull } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

const TOGGLES = [
  { key: 'lights', label: 'External Lights', icon: Lightbulb },
  { key: 'gear', label: 'Landing Gear', icon: Plane },
  { key: 'scoop', label: 'Cargo Scoop', icon: Package },
  { key: 'beacon', label: 'Emergency Beacon', icon: Siren },
];

export default function ShipFunctions() {
  const { state, update, repairShip, selfDestruct } = useGameState();
  const systems = state.ship?.systems || {};

  const toggle = (key) => {
    update({ ship: { ...state.ship, systems: { ...systems, [key]: !systems[key] } } });
  };

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Cpu className="w-4 h-4" /> Ship Functions
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TOGGLES.map(t => {
          const Icon = t.icon;
          const on = !!systems[t.key];
          return (
            <button key={t.key} onClick={() => toggle(t.key)} className={`flex items-center gap-2 px-3 py-2 border text-xs ${on ? 'border-green-700 text-green-500 bg-green-950/20' : 'border-orange-800 text-orange-600 hover:text-orange-400'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label} <span className="ml-auto">{on ? 'ON' : 'OFF'}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-950/50">
        <button onClick={() => repairShip(20)} className="flex items-center gap-2 px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-xs">
          <Wrench className="w-3.5 h-3.5" /> Reboot / Repair
        </button>
        <button onClick={() => selfDestruct()} className="flex items-center gap-2 px-3 py-2 border border-red-800 text-red-500 hover:bg-red-950/30 text-xs">
          <Skull className="w-3.5 h-3.5" /> Self Destruct
        </button>
      </div>
    </div>
  );
}