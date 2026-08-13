// Modules manager — lists installed ship modules with power toggle.
import React, { useState } from 'react';
import { Cpu, Power } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { MODULES } from '@/lib/shipOutfitting';

const SLOT_LABELS = { core_pp: 'Power Plant', core_thr: 'Thrusters', core_fsd: 'FSD', core_ls: 'Life Support', core_sen: 'Sensors', core_pd: 'Power Distributor' };

export default function ModulesManager() {
  const { state, update } = useGameState();
  const modules = state.ship?.modules || {};
  const powered = state.ship?.modulePower || {};
  const [_, force] = useState(0);

  const entries = Object.entries(modules).filter(([k]) => k !== '__engineering');
  const toggle = (key) => {
    const cur = powered[key] !== false;
    update({ ship: { ...state.ship, modulePower: { ...powered, [key]: !cur } } });
    force(x => x + 1);
  };

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Cpu className="w-4 h-4" /> Modules
      </div>
      <div className="text-orange-700 text-[10px]">Toggle power on each installed module. Powered-down modules draw no power.</div>
      {entries.map(([key, modId]) => {
        const mod = MODULES[modId] || {};
        const isOn = powered[key] !== false;
        const label = SLOT_LABELS[key] || mod.name || key;
        return (
          <div key={key} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
            <Cpu className="w-3.5 h-3.5 text-orange-600" />
            <div className="flex-1">
              <div className="text-orange-300">{label}</div>
              <div className="text-orange-800 text-[10px] uppercase">{mod.category || 'module'} · {mod.class || ''}{mod.size || ''} · {mod.statLabel || ''} {mod.power || mod.shield || mod.damage || mod.cargo || ''}</div>
            </div>
            <button onClick={() => toggle(key)} className={`flex items-center gap-1 px-2 py-1 border ${isOn ? 'border-green-700 text-green-500' : 'border-gray-700 text-gray-600'}`}>
              <Power className="w-3 h-3" /> {isOn ? 'ON' : 'OFF'}
            </button>
          </div>
        );
      })}
    </div>
  );
}