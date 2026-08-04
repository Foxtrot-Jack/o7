// Deep-space salvageable wreckage — review discoveries, salvage wrecks,
// and sell unique components.
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { COMPONENT_MAP, getExplorationTier, rarityColor } from '@/lib/wreckage';
import { Recycle, Package, AlertTriangle } from 'lucide-react';

const TIER_NAMES = ['Novice', 'Seasoned', 'Veteran', 'Expert', 'Elite', 'Legendary'];

export default function WreckageScreen() {
  const { state, salvageWreckage, dismissWreckage, sellSalvageComponent } = useGameState();
  const wreck = state.activeWreckage;
  const tier = getExplorationTier(state);
  const comps = state.salvageComponents || {};
  const ownedList = Object.entries(comps).filter(([, q]) => q > 0);

  return (
    <div className="w-full h-full flex flex-col p-3 space-y-3 overflow-auto">
      <div className="border border-orange-700 p-3 flex items-center gap-2 flex-shrink-0">
        <Recycle className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Salvage Operations</h2>
        <span className="ml-auto text-orange-600 text-[10px] uppercase">Tier {tier} · {TIER_NAMES[Math.min(5, tier)]}</span>
      </div>

      <div className="border border-orange-900 p-3 text-orange-600 text-[11px] leading-relaxed flex-shrink-0">
        Deep-space wreckage is more frequent the further you explore — uninhabited systems yield the richest finds. Each discovery drops unique components you can salvage and sell.
      </div>

      {/* Active wreckage */}
      {wreck ? (
        <div className="border border-cyan-700 bg-cyan-950/10 p-3 space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-cyan-300 font-bold uppercase text-sm">{wreck.typeName}</h3>
            <span className="ml-auto text-cyan-700 text-[10px]">IN: {wreck.systemName}</span>
          </div>
          <p className="text-cyan-200 text-xs leading-relaxed">{wreck.description}</p>
          <div className="text-cyan-500 text-[10px] uppercase pt-1">Components detected:</div>
          <div className="space-y-1">
            {wreck.components.map(c => {
              const comp = COMPONENT_MAP[c.componentId];
              if (!comp) return null;
              return (
                <div key={c.componentId} className="flex items-center gap-2 border border-cyan-900/50 px-2 py-1">
                  <Package className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                  <span className={`text-xs ${rarityColor(comp.rarity)}`}>{comp.name}</span>
                  <span className="text-cyan-700 text-[10px] uppercase">{comp.rarity}</span>
                  <span className="ml-auto text-cyan-300 text-xs">x{c.qty}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={salvageWreckage} className="flex-1 py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold">SALVAGE WRECK</button>
            <button onClick={dismissWreckage} className="px-3 py-2 border border-orange-800 text-orange-600 hover:text-orange-400 text-xs">ABANDON</button>
          </div>
        </div>
      ) : (
        <div className="border border-orange-900 p-3 text-orange-700 text-xs italic text-center flex-shrink-0">No salvageable wreckage detected in this system. Jump to new systems to search.</div>
      )}

      {/* Collected components */}
      <div className="border border-orange-900 p-3 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 font-bold uppercase text-sm">Salvaged Components</h3>
          <span className="ml-auto text-orange-700 text-[10px]">{ownedList.length} TYPES</span>
        </div>
        {ownedList.length === 0 ? (
          <div className="text-orange-700 text-xs italic text-center py-2">No components salvaged yet.</div>
        ) : (
          <div className="space-y-1">
            {ownedList.map(([id, qty]) => {
              const comp = COMPONENT_MAP[id];
              if (!comp) return null;
              return (
                <div key={id} className="flex items-center gap-2 border border-orange-950/60 px-2 py-1.5">
                  <Package className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs truncate ${rarityColor(comp.rarity)}`}>{comp.name}</div>
                    <div className="text-orange-700 text-[10px] truncate">{comp.desc}</div>
                  </div>
                  <span className="text-orange-400 text-xs">x{qty}</span>
                  <span className="text-orange-600 text-[10px] hidden sm:inline">{comp.value.toLocaleString()} CR ea</span>
                  <button onClick={() => sellSalvageComponent(id, 1)} className="px-2 py-1 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-[10px]">SELL 1</button>
                  <button onClick={() => sellSalvageComponent(id, qty)} className="px-2 py-1 border border-orange-700 text-orange-300 hover:bg-orange-950/40 text-[10px]">SELL ALL</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}