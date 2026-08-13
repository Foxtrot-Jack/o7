// Fire Groups — assign weapons to groups 1-5.
import React from 'react';
import { Crosshair } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { MODULES } from '@/lib/shipOutfitting';

export default function FireGroups() {
  const { state, update } = useGameState();
  const modules = state.ship?.modules || {};
  const groups = state.ship?.fireGroups || {};
  const weapons = Object.entries(modules).filter(([k]) => k.startsWith('hp_'));

  const assign = (key, g) => {
    update({ ship: { ...state.ship, fireGroups: { ...groups, [key]: g } } });
  };

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Crosshair className="w-4 h-4" /> Fire Groups
      </div>
      <div className="text-orange-700 text-[10px]">Assign each weapon a group (1-5). Weapons sharing a number fire together.</div>
      {weapons.length === 0 && <div className="text-orange-700 text-xs">No weapons installed.</div>}
      {weapons.map(([key, modId]) => {
        const mod = MODULES[modId] || {};
        const cur = groups[key] || 1;
        return (
          <div key={key} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
            <Crosshair className="w-3.5 h-3.5 text-orange-600" />
            <div className="flex-1">
              <div className="text-orange-300">{mod.name || key}</div>
              <div className="text-orange-800 text-[10px]">DMG {mod.damage || 0}</div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(g => (
                <button key={g} onClick={() => assign(key, g)} className={`w-6 h-6 border text-xs ${cur === g ? 'border-orange-500 bg-orange-950/50 text-orange-300' : 'border-orange-800 text-orange-700 hover:text-orange-500'}`}>{g}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}