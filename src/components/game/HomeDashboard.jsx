// Home dashboard — quick-access hub showing credits, rebuy, and primary links.
import React from 'react';
import { LayoutDashboard, User, Layers, Anchor, Building, Newspaper, BookOpen, Trophy, Cpu } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { SHIP_MAP } from '@/lib/gameState';

const LINKS = [
  { id: 'profile', label: 'Player Profile', icon: User },
  { id: 'fleet', label: 'Fleet Manager', icon: Layers },
  { id: 'carriers', label: 'Fleet Carriers', icon: Anchor },
  { id: 'canisstella', label: 'Canis Stella', icon: Building },
  { id: 'galnet', label: 'News', icon: Newspaper },
  { id: 'codex', label: 'Codex', icon: BookOpen },
  { id: 'ranks', label: 'Ranks', icon: Trophy },
];

export default function HomeDashboard({ onNavigate }) {
  const { state, getRebuyCost } = useGameState();
  const rebuy = state.ship?.type ? getRebuyCost(state.ship.type) : 0;
  const fmt = (n) => (n || 0).toLocaleString();

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-4">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <LayoutDashboard className="w-4 h-4" /> Home
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-orange-900 bg-black/60 p-3">
          <div className="text-orange-700 text-[10px] uppercase">Credit Balance</div>
          <div className="text-orange-300 font-bold text-lg">{fmt(state.credits)} CR</div>
        </div>
        <div className="border border-orange-900 bg-black/60 p-3">
          <div className="text-orange-700 text-[10px] uppercase">Current Ship Rebuy</div>
          <div className="text-red-400 font-bold text-lg">{fmt(rebuy)} CR</div>
          <div className="text-orange-800 text-[10px]">{state.ship?.name || '---'}</div>
        </div>
      </div>
      <div className="border border-orange-900 bg-black/60 p-3">
        <div className="text-orange-500 text-[10px] uppercase mb-2">Quick Access</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LINKS.map(l => {
            const Icon = l.icon;
            return (
              <button key={l.id} onClick={() => onNavigate(l.id)} className="flex items-center gap-2 px-3 py-2 border border-orange-800 text-orange-400 hover:bg-orange-950/40 hover:text-orange-300 text-xs">
                <Icon className="w-3.5 h-3.5" /> {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}