// Mission Board — holiday goals, filterable mission list, passenger lounge access.
import React, { useState } from 'react';
import { ClipboardList, Calendar, Users, ListChecks, Crosshair } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { MISSION_TYPES } from '@/lib/gameState';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'combat', label: 'Combat', match: m => m.type === 'bounty' || m.type === 'piracy' },
  { id: 'transport', label: 'Transport', match: m => m.type === MISSION_TYPES.DELIVERY || m.type === MISSION_TYPES.COURIER || m.type === MISSION_TYPES.PASSENGER },
  { id: 'bounty', label: 'Bounty Hunting', match: m => m.type === 'bounty' },
  { id: 'mining', label: 'Mining', match: m => m.type === MISSION_TYPES.MINING },
];

export default function MissionBoard({ onNavigate }) {
  const { state } = useGameState();
  const [filter, setFilter] = useState('all');
  const active = state.activeMissions || [];
  const f = FILTERS.find(x => x.id === filter);
  const list = filter === 'all' ? active : active.filter(m => f.match(m));

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <ClipboardList className="w-4 h-4" /> Mission Board
      </div>

      <button onClick={() => onNavigate('holidays')} className="flex items-center gap-2 w-full px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-xs">
        <Calendar className="w-3.5 h-3.5" /> Holiday Goals
      </button>

      <div className="flex flex-wrap gap-1">
        {FILTERS.map(ff => (
          <button key={ff.id} onClick={() => setFilter(ff.id)} className={`px-2 py-1 border text-[10px] ${filter === ff.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-800 text-orange-700 hover:text-orange-500'}`}>{ff.label}</button>
        ))}
      </div>

      <div className="text-orange-500 text-[10px] uppercase">Accepted Missions</div>
      {list.length === 0 && <div className="text-orange-800 text-xs">No missions match this filter.</div>}
      {list.map(m => (
        <div key={m.id} className="border border-orange-900 bg-black/60 px-3 py-2 text-xs">
          <div className="text-orange-300">{m.title || m.type}</div>
          <div className="text-orange-800 text-[10px]">REWARD {(m.reward || 0).toLocaleString()} CR{m.expires ? ` · EXPIRES ${new Date(m.expires).toLocaleTimeString()}` : ''}</div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-950/50">
        <button onClick={() => onNavigate('chains')} className="flex items-center gap-2 px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-xs">
          <ListChecks className="w-3.5 h-3.5" /> Mission Chains
        </button>
        <button onClick={() => onNavigate('passengers')} className="flex items-center gap-2 px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-xs">
          <Users className="w-3.5 h-3.5" /> Passenger Lounge
        </button>
        <button onClick={() => onNavigate('bountyboard')} className="flex items-center gap-2 px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-xs">
          <Crosshair className="w-3.5 h-3.5" /> Bounty Board
        </button>
        <button onClick={() => onNavigate('missions')} className="flex items-center gap-2 px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-xs">
          <ClipboardList className="w-3.5 h-3.5" /> Full Missions
        </button>
      </div>
    </div>
  );
}