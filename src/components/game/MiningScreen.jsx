// Mining Screen — prospect and mine asteroids for raw materials
// Prospecting is deterministic per body; depleted deposits persist in game state.
// Mined materials fill cargo (sellable at stations) and the materials locker.
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { COMMODITY_MAP } from '@/lib/commodities';
import { makeRng, randInt, randFloat, pick } from '@/lib/prng';
import { Pickaxe, Gem, Loader, Package, Zap, AlertTriangle } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

export default function MiningScreen() {
  const { state, getSystemData, addCargo, addMaterial, markDepositMined } = useGameState();
  const systemData = getSystemData();
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [mining, setMining] = useState(false);
  const [miningResult, setMiningResult] = useState(null);
  const [cargoWarning, setCargoWarning] = useState(false);

  const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
  const cargoCapacity = state.ship?.cargoCapacity ?? 0;
  const cargoFull = cargoUsed >= cargoCapacity;

  // Get minable bodies in the system
  const minableBodies = useMemo(() => {
    if (!systemData) return [];
    return systemData.bodies.filter(b =>
      b.type === BODY_TYPES.BELT ||
      b.type === BODY_TYPES.ASTEROID ||
      (b.type === BODY_TYPES.PLANET && b.landable)
    );
  }, [systemData]);

  // Prospecting is deterministic — same body always yields the same deposits.
  // Already-mined deposits are filtered out via state.minedDeposits.
  const prospects = useMemo(() => {
    if (!selectedProspect) return [];
    const body = selectedProspect;
    const rng = makeRng(body.id + ':prospect');
    const count = randInt(rng, 3, 8);
    const found = [];

    for (let i = 0; i < count; i++) {
      const materials = body.materials || [];
      if (materials.length === 0) continue;

      const material = pick(rng, materials);
      const yieldQty = randFloat(rng, 0.5, 5) * (material.concentration / 10);
      const isCore = rng() < 0.15;

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

    found.sort((a, b) => b.value - a.value);
    // Filter out depleted deposits
    return found.filter(p => !state.minedDeposits?.[p.id]);
  }, [selectedProspect, state.minedDeposits]);

  // Prospect a body — select it and compute deterministic deposits
  const handleProspect = useCallback((body) => {
    soundEngine.play('scan');
    setSelectedProspect(body);
    setMiningResult(null);
    setCargoWarning(false);
  }, []);

  // Mine a specific prospect — fills cargo and materials locker
  const handleMine = useCallback((prospect) => {
    if (cargoFull) {
      soundEngine.play('error');
      setCargoWarning(true);
      return;
    }

    soundEngine.play('mining');
    setMining(true);
    setCargoWarning(false);

    setTimeout(() => {
      setMining(false);
      const yieldQty = prospect.isCore ? prospect.yield * 3 : prospect.yield;
      const intQty = Math.max(1, Math.floor(yieldQty));

      // Always add to materials locker (for synthesis / engineering)
      addMaterial(prospect.materialId, Math.round(yieldQty * 10) / 10);

      // Add to cargo — all mined materials are tradeable commodities.
      // Respect remaining cargo capacity.
      const currentCargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
      const cap = state.ship?.cargoCapacity ?? 0;
      const spaceLeft = cap - currentCargoUsed;
      const cargoQty = Math.min(intQty, spaceLeft);

      if (cargoQty > 0) {
        addCargo(prospect.materialId, cargoQty);
      }

      // Mark deposit as depleted so it stays mined permanently
      markDepositMined(prospect.id);

      setMiningResult({
        material: prospect.materialName,
        qty: cargoQty,
        lockerQty: Math.round(yieldQty * 10) / 10,
        value: prospect.value * (prospect.isCore ? 3 : 1),
        isCore: prospect.isCore,
        cargoFull: cargoQty < intQty,
      });
    }, 1500);
  }, [addMaterial, addCargo, markDepositMined, cargoFull, state.ship]);

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

      {/* Cargo status bar */}
      <div className={`border-b p-2 flex items-center gap-2 ${cargoFull ? 'border-red-700 bg-red-950/20' : 'border-orange-900/50'}`}>
        <Package className={`w-3.5 h-3.5 ${cargoFull ? 'text-red-500' : 'text-orange-500'}`} />
        <span className="text-[10px] uppercase text-orange-700">Cargo Hold</span>
        <div className="flex-1 h-3 bg-black border border-orange-950 relative">
          <div
            className={`h-full transition-all ${cargoFull ? 'bg-red-600' : 'bg-orange-600'}`}
            style={{ width: `${cargoCapacity > 0 ? Math.min(100, (cargoUsed / cargoCapacity) * 100) : 0}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] text-orange-300">
            {cargoUsed} / {cargoCapacity} T
          </span>
        </div>
        {cargoFull && (
          <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> FULL
          </span>
        )}
      </div>

      {cargoFull && (
        <div className="border-b border-red-800 bg-red-950/20 p-2 text-red-400 text-[10px] text-center">
          ⚠ CARGO HOLD FULL — RETURN TO STATION TO OFFLOAD AND SELL MINERALS
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: Select body to prospect */}
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Select Prospecting Target</h3>
          {minableBodies.length === 0 && (
            <div className="text-orange-700 text-xs">No minable bodies in this system.</div>
          )}
          {minableBodies.map(body => {
            const bodyDeposits = (() => {
              const rng = makeRng(body.id + ':prospect');
              const count = randInt(rng, 3, 8);
              let total = 0;
              let mined = 0;
              for (let i = 0; i < count; i++) {
                const id = `${body.id}_ast_${i}`;
                total++;
                if (state.minedDeposits?.[id]) mined++;
              }
              return { total, remaining: total - mined };
            })();
            return (
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
                    <div className="text-[9px]">
                      <span className="text-orange-500">{bodyDeposits.remaining}</span>
                      <span className="text-orange-800">/{bodyDeposits.total} deposits</span>
                    </div>
                    {body.valuable && <div className="text-yellow-500 text-[10px]">★ VALUABLE</div>}
                  </div>
                </div>
              </button>
            );
          })}
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
            <div className="text-orange-700 text-xs text-center py-4 border border-orange-950">
              <Package className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>All deposits depleted. Try another target.</p>
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
                disabled={mining || cargoFull}
                className="mt-1 w-full py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[10px] flex items-center justify-center gap-1 disabled:opacity-30"
              >
                {mining ? <Loader className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {mining ? 'MINING...' : cargoFull ? 'CARGO FULL' : 'MINE DEPOSIT'}
              </button>
            </div>
          ))}

          {miningResult && (
            <div className="border border-green-800 p-2 text-xs bg-green-950/20">
              <div className="text-green-400 font-bold flex items-center gap-1">
                <Package className="w-3 h-3" />
                MINED: {miningResult.qty}T {miningResult.material} → CARGO
              </div>
              <div className="text-green-600 text-[10px]">
                +{miningResult.lockerQty} to materials locker
              </div>
              <div className="text-green-600 text-[10px]">
                Est. market value: {miningResult.value.toLocaleString()} CR
                {miningResult.isCore && ' · CORE DEPOSIT BONUS'}
              </div>
              {miningResult.cargoFull && (
                <div className="text-red-500 text-[10px] mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Cargo hold full — remaining material discarded
                </div>
              )}
            </div>
          )}

          {/* Cargo manifest */}
          {(state.ship?.cargo || []).length > 0 && (
            <div className="border border-orange-900 p-2 text-xs mt-3">
              <div className="text-orange-700 text-[10px] uppercase mb-1">Cargo Manifest (sell at station)</div>
              <div className="flex flex-wrap gap-1">
                {state.ship.cargo.map(c => (
                  <span key={c.commodity} className="text-[9px] text-orange-400 border border-orange-950 px-1">
                    {COMMODITY_MAP[c.commodity]?.name || c.commodity}: {c.qty}T
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Material locker summary */}
          {Object.keys(state.materials).length > 0 && (
            <div className="border border-orange-900 p-2 text-xs">
              <div className="text-orange-700 text-[10px] uppercase mb-1">Material Locker (synthesis)</div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
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