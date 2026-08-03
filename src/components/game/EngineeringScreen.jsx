// Engineering Screen — apply blueprint upgrades to ship modules using materials
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { MODULES, SLOT_LABELS, SHIP_SLOTS, ENGINEERING_BLUEPRINTS, HARDPOINT_ENGINEERING } from '@/lib/shipOutfitting';
import { getEngineeringCost, canAffordEngineering } from '@/lib/engineering';
import { getStationEngineer } from '@/lib/engineers';
import { FlaskConical, ChevronRight, Check } from 'lucide-react';

export default function EngineeringScreen() {
  const { state, applyEngineering, addCredits, addMaterial, getSystemData } = useGameState();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const isSandbox = state.saveMode === 'sandbox';
  const systemData = getSystemData();
  const engineer = getStationEngineer(state.currentSystem, systemData, isSandbox);

  if (!engineer) {
    return (
      <div className="p-4 text-center text-orange-500">
        <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="font-bold">No Engineer at this Station</p>
        <p className="text-orange-700 text-xs mt-1 max-w-xs mx-auto">Engineering requires a station with Standard tech or better. Resident engineers are found in high-tech and industrial systems — check Starport Services.</p>
      </div>
    );
  }

  const shipType = state.ship.type;
  const slots = SHIP_SLOTS[shipType];
  const modules = state.ship.modules || {};
  const engineering = modules.__engineering || {};

  if (!slots) {
    return <div className="p-4 text-orange-500">Engineering unavailable for this ship type.</div>;
  }

  // Build list of all equipped modules with their slots
  const equippedModules = [];
  for (const [key, maxSize] of Object.entries(slots.core)) {
    const slotKey = `core_${key}`;
    const modId = modules[slotKey];
    const mod = MODULES[modId];
    if (mod) equippedModules.push({ slotKey, slotLabel: SLOT_LABELS[key] || key, mod, slotType: 'core' });
  }
  slots.optional.forEach((maxSize, i) => {
    const slotKey = `opt_${i}`;
    const modId = modules[slotKey];
    const mod = MODULES[modId];
    if (mod) equippedModules.push({ slotKey, slotLabel: `Optional ${i + 1}`, mod, slotType: 'optional' });
  });
  slots.hardpoints.forEach((size, i) => {
    const slotKey = `hp_${i}`;
    const modId = modules[slotKey];
    const mod = MODULES[modId];
    if (mod) equippedModules.push({ slotKey, slotLabel: `Hardpoint ${i + 1}`, mod, slotType: 'hardpoint' });
  });

  const selectedEntry = equippedModules.find(e => e.slotKey === selectedSlot);
  const blueprints = selectedEntry
    ? (ENGINEERING_BLUEPRINTS[selectedEntry.mod.type] || HARDPOINT_ENGINEERING[selectedEntry.mod.type] || [])
    : [];

  const handleApply = (blueprintId, targetLevel) => {
    if (!selectedEntry) return;
    const cost = getEngineeringCost(selectedEntry.mod.type, (engineering[selectedEntry.slotKey]?.level || 0), targetLevel);
    if (!cost) return;
    if (!isSandbox && !canAffordEngineering(state.materials, state.credits, cost)) return;
    if (!isSandbox) {
      addCredits(-cost.credits);
      for (const [mat, qty] of Object.entries(cost.materials)) {
        addMaterial(mat, -qty);
      }
    }
    applyEngineering(selectedEntry.slotKey, blueprintId, targetLevel);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-orange-500" />
        <div>
          <h2 className="text-orange-300 font-bold uppercase">Engineering Workshop</h2>
          <p className="text-cyan-500 text-[10px]">{engineer.name} · Max Grade {engineer.maxGrade}</p>
        </div>
        <span className="text-orange-700 text-[10px] ml-auto">MATERIALS & CREDITS REQUIRED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Module list */}
        <div className="space-y-1">
          <h3 className="text-orange-500 text-xs font-bold uppercase mb-1">Equipped Modules</h3>
          {equippedModules.map(entry => {
            const eng = engineering[entry.slotKey];
            const isSelected = selectedSlot === entry.slotKey;
            return (
              <button
                key={entry.slotKey}
                onClick={() => setSelectedSlot(entry.slotKey)}
                className={`w-full text-left p-2 border text-xs transition-all ${isSelected ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{entry.mod.name}</span>
                  {eng && <span className="text-cyan-500 text-[9px]">G{eng.level} {eng.blueprint}</span>}
                </div>
                <div className="text-[9px] text-orange-800">{entry.slotLabel}</div>
              </button>
            );
          })}
        </div>

        {/* Blueprint panel */}
        <div className="space-y-2">
          {selectedEntry ? (
            <>
              <h3 className="text-orange-500 text-xs font-bold uppercase mb-1">
                Blueprints — {selectedEntry.mod.name}
              </h3>
              {blueprints.length === 0 ? (
                <div className="text-orange-700 text-xs p-2 border border-orange-900">No blueprints available for this module type.</div>
              ) : (
                blueprints.map(bp => {
                  const currentLevel = engineering[selectedEntry.slotKey]?.blueprint === bp.id
                    ? engineering[selectedEntry.slotKey].level : 0;
                  return (
                    <div key={bp.id} className="border border-orange-900 p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-300 font-bold text-xs">{bp.name}</span>
                        <span className="text-cyan-500 text-[9px]">GRADE {currentLevel}/{bp.levels}</span>
                      </div>
                      <p className="text-orange-700 text-[9px]">{bp.desc}</p>
                      {(() => {
                        const nextLevel = currentLevel + 1;
                        const atMax = currentLevel >= bp.levels || nextLevel > engineer.maxGrade;
                        if (atMax) {
                          return (
                            <div className="text-green-500 text-[9px] flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {currentLevel >= bp.levels ? 'MAX GRADE' : `MAX GRADE HERE (G${engineer.maxGrade})`}
                            </div>
                          );
                        }
                        const cost = getEngineeringCost(selectedEntry.mod.type, currentLevel, nextLevel);
                        const canAfford = isSandbox || canAffordEngineering(state.materials, state.credits, cost);
                        return (
                          <button
                            onClick={() => handleApply(bp.id, nextLevel)}
                            disabled={!canAfford}
                            className="w-full py-1 border border-orange-600 text-orange-400 hover:bg-orange-950/30 text-[9px] font-bold disabled:opacity-30 flex items-center justify-center gap-1"
                          >
                            <ChevronRight className="w-3 h-3" />
                            UPGRADE TO G{nextLevel}
                            {!isSandbox && <span className="ml-1">— {cost.credits.toLocaleString()} CR</span>}
                          </button>
                        );
                      })()}
                      {selectedEntry && currentLevel < bp.levels && (() => {
                        const cost = getEngineeringCost(selectedEntry.mod.type, currentLevel, currentLevel + 1);
                        return (
                          <div className="flex flex-wrap gap-1 text-[8px]">
                            {Object.entries(cost.materials).map(([mat, qty]) => (
                              <span key={mat} className={`border px-1 ${(state.materials[mat] || 0) >= qty ? 'text-orange-500 border-orange-900' : 'text-red-500 border-red-900'}`}>
                                {qty}x {mat.replace(/_/g, ' ')} ({state.materials[mat] || 0})
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div className="text-orange-700 text-xs p-4 border border-orange-900 text-center">
              ← Select a module to view available blueprints
            </div>
          )}
        </div>
      </div>
    </div>
  );
}