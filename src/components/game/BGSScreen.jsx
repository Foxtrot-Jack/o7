// BGS — Background Simulation faction influence display
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateFactionStates, getFactionStateInfo, applyInfluenceChange, FACTION_STATES } from '@/lib/bgs';
import { Activity, Flag, TrendingUp, TrendingDown, Coins } from 'lucide-react';

export default function BGSScreen() {
  const { state, getSystemData, addCredits } = useGameState();
  const systemData = getSystemData();
  const baseFactions = useMemo(() => {
    const f = generateFactionStates(state.currentSystem?.seed, systemData);
    const deltas = state.founderBGS?.[state.currentSystem?.seed];
    if (deltas) for (const fac of f) fac.influence = Math.max(1, Math.min(95, fac.influence + (deltas[fac.name] || 0)));
    return f;
  }, [state.currentSystem?.seed, state.founderBGS]);
  const [factions, setFactions] = useState(null);
  const [log, setLog] = useState([]);

  const activeFactions = factions || baseFactions;

  const supportFaction = (factionName) => {
    const cost = 500000;
    if (state.credits < cost) return;
    addCredits(-cost);
    const updated = applyInfluenceChange(activeFactions, factionName, 3);
    setFactions(updated);
    setLog(prev => [`Supported ${factionName} (+3 influence, -${cost.toLocaleString()} CR)`, ...prev].slice(5));
  };

  const undermineFaction = (factionName) => {
    const cost = 1000000;
    if (state.credits < cost) return;
    addCredits(-cost);
    const updated = applyInfluenceChange(activeFactions, factionName, -5);
    setFactions(updated);
    setLog(prev => [`Undermined ${factionName} (-5 influence, -${cost.toLocaleString()} CR)`, ...prev].slice(5));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Background Simulation — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Faction influence shifts based on player activity. Support factions to gain favor, or undermine rivals.</div>
      </div>

      {/* Faction influence bars */}
      <div className="space-y-2">
        {activeFactions.map((f, i) => {
          const stateInfo = getFactionStateInfo(f.state);
          return (
            <div key={i} className="border border-orange-900 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className={`w-3.5 h-3.5 ${i === 0 ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className="text-orange-300 font-bold text-xs">{f.name}</span>
                </div>
                <span className={`text-[10px] ${stateInfo.color}`}>{stateInfo.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-black border border-orange-950">
                  <div className={`h-full transition-all ${i === 0 ? 'bg-orange-600' : 'bg-orange-700'}`} style={{ width: `${f.influence}%` }} />
                </div>
                <span className="text-orange-400 text-xs font-bold w-10 text-right">{f.influence}%</span>
              </div>
              <div className="text-[9px] text-orange-700">{stateInfo.desc}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => supportFaction(f.name)}
                  disabled={state.credits < 500000}
                  className="px-2 py-0.5 border border-green-800 text-green-600 hover:bg-green-950/30 text-[9px] disabled:opacity-30 flex items-center gap-1"
                >
                  <TrendingUp className="w-2.5 h-2.5" /> Support (500K)
                </button>
                <button
                  onClick={() => undermineFaction(f.name)}
                  disabled={state.credits < 1000000}
                  className="px-2 py-0.5 border border-red-800 text-red-600 hover:bg-red-950/30 text-[9px] disabled:opacity-30 flex items-center gap-1"
                >
                  <TrendingDown className="w-2.5 h-2.5" /> Undermine (1M)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity log */}
      {log.length > 0 && (
        <div className="border border-orange-900 p-2 space-y-0.5">
          <div className="text-[10px] text-orange-700 uppercase">Activity Log</div>
          {log.map((entry, i) => (
            <div key={i} className="text-[10px] text-orange-500 flex items-center gap-1">
              <Coins className="w-2.5 h-2.5" /> {entry}
            </div>
          ))}
        </div>
      )}

      {/* Founder activity feed */}
      {(state.founderActivity || []).length > 0 && (
        <div className="border border-cyan-900 p-2 space-y-1">
          <div className="text-[10px] text-cyan-700 uppercase flex items-center gap-1"><Activity className="w-3 h-3" /> Founder Activity</div>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {(state.founderActivity || []).slice(0, 12).map(e => (
              <div key={e.id} className="text-[10px] text-cyan-600">
                <span className="text-cyan-400 font-bold">{e.alias}</span> {e.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faction states legend */}
      <div className="border border-orange-900 p-3">
        <h3 className="text-orange-500 text-xs font-bold uppercase mb-2">Faction States</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {FACTION_STATES.map(s => (
            <div key={s.id} className="text-[10px] flex items-start gap-1">
              <span className={`font-bold ${s.color}`}>{s.label}</span>
              <span className="text-orange-700">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}