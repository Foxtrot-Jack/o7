// Founder simulation settings — toggle founder exploration and set explorer speed.
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Users, Compass } from 'lucide-react';
import { isFounderAlias } from '@/lib/contributors';

export default function FounderSettings() {
  const { state, update } = useGameState();
  const s = state.settings?.founders || { explorationEnabled: true, explorerSpeed: 50 };
  const set = (k, v) => update({ settings: { ...state.settings, founders: { ...s, [k]: v } } });

  return (
    <div className="border border-orange-900 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Founder Simulation</h3>
      </div>
      <div className="text-orange-700 text-[10px]">The credited founders fly as active AI pilots. Explorers chart and claim systems (First Discovered by them); traders, miners and combat pilots shift faction influence. Their activity appears in the BGS feed.</div>

      <div className="border border-orange-950/60 bg-black/40 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-orange-500" />
          <h4 className="text-orange-400 text-xs font-bold uppercase">Founder Exploration</h4>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-orange-600 text-xs">Let founder explorers discover &amp; claim systems</span>
          <button onClick={() => set('explorationEnabled', !s.explorationEnabled)} className={`px-3 py-1 border text-xs ${s.explorationEnabled ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{s.explorationEnabled ? 'ON' : 'OFF'}</button>
        </div>
        <div className="text-orange-700 text-[10px]">When on, founder explorers compete with you for First Discovered. Turn off to keep all discoveries to yourself.</div>
      </div>

      {isFounderAlias(state.commanderName) && (
        <div className="border border-orange-950/60 bg-black/40 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <h4 className="text-orange-400 text-xs font-bold uppercase">Spawn Me In The Galaxy</h4>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-600 text-xs">Let your founder alias fly the BGS as an AI pilot</span>
            <button onClick={() => set('spawnSelfInGalaxy', !s.spawnSelfInGalaxy)} className={`px-3 py-1 border text-xs ${s.spawnSelfInGalaxy ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{s.spawnSelfInGalaxy ? 'ON' : 'OFF'}</button>
          </div>
          <div className="text-orange-700 text-[10px]">When on, your alias charts systems, trades, and shifts influence in your name alongside the other founders. Off by default, so your alias stays dormant unless you choose to join the simulation.</div>
        </div>
      )}

      <div className="border border-orange-950/60 bg-black/40 p-3 space-y-2">
        <h4 className="text-orange-400 text-xs font-bold uppercase">Explorer Speed</h4>
        <div className="flex items-center gap-3">
          <input type="range" min="0" max="100" value={s.explorerSpeed ?? 50} onChange={e => set('explorerSpeed', parseInt(e.target.value))} className="flex-1" />
          <span className="text-orange-300 text-xs w-12 text-right">{s.explorerSpeed ?? 50}%</span>
        </div>
        <div className="flex justify-between text-[9px] text-orange-700"><span>Low (barely moves)</span><span>Full (real-time race)</span></div>
        <div className="text-orange-700 text-[10px]">The only cap on how fast founders explore while you're away. Low keeps the galaxy mostly yours; full lets you race your virtual rivals.</div>
      </div>
    </div>
  );
}