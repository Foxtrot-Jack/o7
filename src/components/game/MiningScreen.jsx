// Mining Screen — prospect and mine asteroids for raw materials
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { COMMODITY_MAP } from '@/lib/commodities';
import { makeRng, randInt, randFloat, pick } from '@/lib/prng';
import { Pickaxe, Gem, Loader, Package, Zap } from 'lucide-react';

export default function MiningScreen() {
  const { state, getSystemData, addCargo, addMaterial } = useGameState();
  const systemData = getSystemData();
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [mining, setMining] = useState(false);
  const [miningResult, setMiningResult] = useState(null);
  const [prospects, setProspects] = useState([]);

  // Get minable bodies in the system
  const minableBodies = useMemo(() => {
    if (!systemData) return [];
    return systemData.bodies.filter(b =>
      b.type === BODY_TYPES.BELT ||
      b.type === BODY_TYPES.ASTEROID ||
      (b.type === BODY_TYPES.PLANET && b.landable)
    );
  }, [systemData]);

  // Prospect a body — find specific asteroids to mine
  const handleProspect = useCallback((body) => {
    setSelectedProspect(body);
    const rng = makeRng(body.id + ':prospect:' + Date.now());
    const count = randInt(rng, 3, 8);
    const found = [];

    for (let i = 0; i < count; i++) {
      // Pick from body's materials
      const materials = body.materials || [];
      if (materials.length === 0) continue;

      const material = pick(rng, materials);
      const yieldQty = randFloat(rng, 0.5, 5) * (material.concentration / 10);
      const isCore = rng() < 0.15; // 15% chance of a core deposit

      found.push({
        id: `${body.id}_ast_${i}`,
        materialId: material.id,
        materialName: COMMODITY_MAP[material.id]?.name || material.id,
        yield: Math.round(yieldQty * 10) / 10,
        concentration: material.concentration,
        isCore,
        value: Math.round((COMMODITY_MAP[material.id]?.basePrice || 100) * yieldQty),
      });
    }

    // Sort by value descending
    found.sort((a, b) => b.value - a.value);
    setProspects(found);
    setMiningResult(null);
  }, []);

  // Mine a specific prospect
  const handleMine = useCallback((prospect) => {
    setMining(true);
    setTimeout(() => {
      setMining(false);
      const yieldQty = prospect.isCore ? prospect.yield * 3 : prospect.yield;

      // Add to refinery/materials
      addMaterial(prospect.materialId, Math.round(yieldQty * 10) / 10);

      // If it's a tradeable commodity, also add to cargo
      const comm = COMMODITY_MAP[prospect.materialId];
      if (comm && comm.category === 'Raw') {
        const cargoUsed = state.ship.cargo.reduce((s, c) => s + c.qty, 0);
        if (cargoUsed < state.ship.cargoCapacity) {
          addCargo(prospect.materialId, Math.max(1, Math.floor(yieldQty)));
        }
      }

      setMiningResult({
        material: prospect.materialName,
        qty: Math.round(yieldQty * 10) / 10,
        value: prospect.value * (prospect.isCore ? 3 : 1),
        isCore: prospect.isCore,
      });

      // Remove the prospected asteroid
      setProspects(prev => prev.filter(p => p.id !== prospect.id));
    }, 1500);
  }, [addMaterial, addCargo, state.ship]);

  if (!systemData) {
    return <div className="p-4 text-orange-500">Loading system data...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pickaxe className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase text-sm">Mining & Refinery Operations</span>
        </div>
        <div className="text-xs text-orange-600">
          {state.currentLocation === 'station' ? 'STATION-BASED PROSPECTING' : 'IN-SYSTEM PROSPECTING'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: Select body to prospect */}
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Select Prospecting Target</h3>
          {minableBodies.length === 0 && (
            <div className="text-orange-700 text-xs">No minable bodies in this system.</div>
          )}
          {minableBodies.map(body => (
            <button
              key={body.id}
              onClick={() => handleProspect(body)}
              className={`w-full text-left border p-2 text-xs transition-all ${
                selectedProspect?.id === body.id
                  ? 'border-orange-500 bg-orange-950/30'
                  : 'border-orange-900 hover:border-orange-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-400">{body.designation}</div>
                  <div className="text-orange-700 text-[10px]">{body.planetTypeName || body.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-orange-600 text-[10px]">{body.materials?.length || 0} materials</div>
                  {body.valuable && <div className="text-yellow-500 text-[10px]">★ VALUABLE</div>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Prospecting results */}
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">
            {selectedProspect ? `Prospect Results — ${selectedProspect.designation}` : 'Prospect Results'}
          </h3>

          {!selectedProspect && (
            <div className="text-orange-700 text-xs text-center py-8">
              <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a target to begin prospecting.</p>
            </div>
          )}

          {selectedProspect && prospects.length === 0 && !mining && (
            <div className="text-orange-700 text-xs text-center py-4">
              No deposits found. Try another target.
            </div>
          )}

          {prospects.map(prospect => (
            <div key={prospect.id} className="border border-orange-900 p-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`font-bold ${prospect.isCore ? 'text-yellow-400' : 'text-orange-300'}`}>
                    {prospect.isCore && '★ '}{prospect.materialName}
                  </div>
                  <div className="text-orange-700 text-[10px]">
                    YIELD: {prospect.yield}T · CONC: {prospect.concentration.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-400">{prospect.value.toLocaleString()} CR</div>
                  {prospect.isCore && <div className="text-yellow-500 text-[9px]">CORE DEPOSIT</div>}
                </div>
              </div>
              <button
                onClick={() => handleMine(prospect)}
                disabled={mining}
                className="mt-1 w-full py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[10px] flex items-center justify-center gap-1 disabled:opacity-30"
              >
                {mining ? <Loader className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {mining ? 'MINING...' : 'MINE DEPOSIT'}
              </button>
            </div>
          ))}

          {miningResult && (
            <div className="border border-green-800 p-2 text-xs bg-green-950/20">
              <div className="text-green-400 font-bold flex items-center gap-1">
                <Package className="w-3 h-3" />
                MINED: {miningResult.qty}T {miningResult.material}
              </div>
              <div className="text-green-600 text-[10px]">
                Est. value: {miningResult.value.toLocaleString()} CR
                {miningResult.isCore && ' · CORE DEPOSIT BONUS'}
              </div>
            </div>
          )}

          {/* Material locker summary */}
          {Object.keys(state.materials).length > 0 && (
            <div className="border border-orange-900 p-2 text-xs mt-3">
              <div className="text-orange-700 text-[10px] uppercase mb-1">Material Locker</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(state.materials).map(([id, qty]) => (
                  <span key={id} className="text-[9px] text-orange-500 border border-orange-950 px-1">
                    {COMMODITY_MAP[id]?.name || id}: {qty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}