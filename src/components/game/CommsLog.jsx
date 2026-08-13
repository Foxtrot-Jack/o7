// Comms Log — AI copilot, system messages, NPC messages, event log, BGS log.
import React, { useState } from 'react';
import { MessageSquare, Newspaper, Users, Activity, Radio } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import ShipCopilot from './ShipCopilot';

const TABS = [
  { id: 'copilot', label: 'AI Copilot', icon: MessageSquare },
  { id: 'system', label: 'System Messages', icon: Newspaper },
  { id: 'npc', label: 'NPC Messages', icon: Users },
  { id: 'events', label: 'Event Log', icon: Radio },
  { id: 'bgs', label: 'BGS Log', icon: Activity },
];

export default function CommsLog() {
  const { state } = useGameState();
  const [tab, setTab] = useState('copilot');
  const flightLog = state.flightLog || [];
  const founderActivity = state.founderActivity || [];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex border-b border-orange-900/50 bg-black">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 ${tab === t.id ? 'border-orange-500 text-orange-300 bg-orange-950/20' : 'border-transparent text-orange-700 hover:text-orange-500'}`}>
              <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto p-3">
        {tab === 'copilot' && <ShipCopilot />}
        {tab === 'system' && (
          <div className="space-y-1 text-xs text-orange-500">
            <div className="text-orange-700 text-[10px] uppercase mb-1">System-specific messages</div>
            {flightLog.length === 0 ? <div className="text-orange-800">No system messages yet.</div> :
              flightLog.slice(-20).reverse().map((l, i) => <div key={i} className="truncate">▸ Jumped to {l.name}</div>)}
          </div>
        )}
        {tab === 'npc' && (
          <div className="space-y-1 text-xs text-orange-500">
            <div className="text-orange-700 text-[10px] uppercase mb-1">NPC messages directed at you</div>
            <div className="text-orange-800">No incoming NPC messages.</div>
          </div>
        )}
        {tab === 'events' && (
          <div className="space-y-1 text-xs text-orange-500">
            <div className="text-orange-700 text-[10px] uppercase mb-1">Player-facing in-game events</div>
            {state.activeEncounter && <div className="text-cyan-500">▸ Encounter active in {state.currentSystem?.name}</div>}
            {state.activeWreckage && <div className="text-cyan-500">▸ Wreckage discovered</div>}
            {!state.activeEncounter && !state.activeWreckage && <div className="text-orange-800">No active events.</div>}
          </div>
        )}
        {tab === 'bgs' && (
          <div className="space-y-1 text-xs text-orange-500">
            <div className="text-orange-700 text-[10px] uppercase mb-1">Background simulation actions</div>
            {founderActivity.length === 0 ? <div className="text-orange-800">No BGS activity logged.</div> :
              founderActivity.slice(-20).reverse().map((a, i) => <div key={i} className="truncate">▸ {a.message || a.action || JSON.stringify(a)}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}