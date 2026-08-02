// Mining Screen — lists minable bodies in the system (requires FSS discovery)
// Players select a body to prospect, then mine deposits via the mini-game.
import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Deposits regenerate after this cooldown (5 minutes)
const REGEN_COOLDOWN = 5 * 60 * 1000;
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { COMMODITY_MAP } from '@/lib/commodities';
import { makeRng, randInt, randFloat, pick } from '@/lib/prng';
import { Pickaxe, Gem, Loader, Package, Zap, AlertTriangle, Radio } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

export default function MiningScreen({ onNavigate }) {
  const { state, getSystemData, addCargo, addMaterial, markDepositMined } = useGameState();
  const systemData = getSystemData();
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [mining, setMining] = useState(false);
  const [miningResult, setMiningResult] = useState(null);
  const [cargoWarning, setCargoWarning] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick every second so countdown timers update live
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
  const cargoCapacity = state.ship?.cargoCapacity ?? 0;
  const cargoFull = cargoUsed >= cargoCapacity;

  const systemSeed = state.currentSystem?.seed;
  const fssScanned = state.fssScannedSystems?.[systemSeed];
  const fssDiscovered = state.fssDiscoveredBodies || {};

  // Get minable bodies in the system — ONLY those FSS-discovered
  // Rings are minable if their parent planet is discovered
  const minableBodies = useMemo(() => {
    if (!systemData) return [];
    return systemData.bodies.filter(b => {
      const isMinableType =
        b.type === BODY_TYPES.BELT ||
        b.type === BODY_TYPES.ASTEROID ||
        (b.type === BODY_TYPES.PLANET && b.landable) ||
        b.type === BODY_TYPES.RING;
      if (!isMinableType) return false;
      // Rings show if their parent planet is discovered
      if (b.type === BODY_TYPES.RING) return fssDiscovered[b.parent];
      return fssDiscovered[b.id];
    });
  }, [systemData, fssDiscovered]);

  // Prospecting is deterministic — same body always yields the same deposits.
  const { available, regenerating } = useMemo(() => {
    if (!selectedProspect) return { available: [], regenerating: [] };
    const body = selectedProspect;
    const rng = makeRng(body.id + ':prospect');
    const count = randInt(rng, 3, 8);
    const all = [];

    for (let i = 0; i < count; i++) {
      const materials = body.materials || [];
      if (materials.length === 0) continue;

      const material = pick(rng, materials);
      const yieldQty = randFloat(rng, 0.5, 5) * (material.concentration / 10);
      const isCore = rng() < 0.15;

      all.push({
        id: `${body.id}_ast_${i}`,
        materialId: material.id,
        materialName: COMMODITY_MAP[material.id]?.name || material.id,
        yield: Math.round(yieldQty * 10) / 10,
        concentration: material.concentration,
        isCore,
        value: Math.round((COMMODITY_MAP[material.id]?.basePrice || 100) * yieldQty),
      });
    }

    all.sort((a, b) => b.value - a.value);
    const avail = [];
    const regen = [];
    for (const p of all) {
      const minedAt = state.minedDeposits?.[p.id];
      if (!minedAt) {
        avail.push(p);
      } else {
        const elapsed = now - minedAt;
        if (elapsed >= REGEN_COOLDOWN) {
          avail.push(p);
        } else {
          regen.push({ ...p, regenIn: minedAt + REGEN_COOLDOWN - now });
        }
      }
    }
    return { available: avail, regenerating: regen };
  }, [selectedProspect, state.minedDeposits, now]);

  const handleProspect = useCallback((body) => {
    soundEngine.play('scan');
    setSelectedProspect(body);
    setMiningResult(null);
    setCargoWarning(false);
  }, []);

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

      addMaterial(prospect.materialId, Math.round(yieldQty * 10) / 10);

      const currentCargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
      const cap = state.ship?.cargoCapacity ?? 0;
      const spaceLeft = cap - currentCargoUsed;
      const cargoQty = Math.min(intQty, spaceLeft);

      if (cargoQty > 0) {
        addCargo(prospect.materialId, cargoQty);
      }

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
          {fssScanned ? 'SYSTEM SURVEY COMPLETE' : 'PARTIAL SURVEY'}
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
          <h3 className="text-orange-500 text-xs font-bold uppercase">Minable Bodies in System</h3>

          {/* No FSS scan done yet */}
          {minableBodies.length === 0 && !fssScanned && (
            <div className="border border-cyan-900 bg-black/50 p-4 text-center space-y-2">
              <Radio className="w-8 h-8 mx-auto text-cyan-700" />
              <div className="text-cyan-400 text-xs font-bold uppercase">No Survey Data</div>
              <div className="text-cyan-600 text-[10px]">
                No minable bodies have been discovered yet. Run an FSS scan to reveal asteroid belts, ringed planets, and landable bodies in this system.
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('fss')}
                  className="px-3 py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold"
                >
                  OPEN FSS SCANNER
                </button>
              )}
            </div>
          )}

          {/* FSS scanned but no minable bodies */}
          {minableBodies.length === 0 && fssScanned && (
            <div className="text-orange-700 text-xs text-center py-8 border border-orange-950">
              <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No minable bodies in this system.</p>
              <p className="text-[10px] mt-1">Try another system with asteroid belts or ringed planets.</p>
            </div>
          )}

          {minableBodies.map(body => {
            const bodyDeposits = (() => {
              const rng = makeRng(body.id + ':prospect');
              const count = randInt(rng, 3, 8);
              let total = 0;
              let available = 0;
              let regen = 0;
              for (let i = 0; i < count; i++) {
                const id = `${body.id}_ast_${i}`;
                total++;
                const minedAt = state.minedDeposits?.[id];
                if (!minedAt || now - minedAt >= REGEN_COOLDOWN) {
                  available++;
                } else {
                  regen++;
                }
              }
              return { total, available, regen };
            })();
            const isRing = body.type === BODY_TYPES.RING;
            const parentName = isRing
              ? systemData.bodies.find(b => b.id === body.parent)?.designation
              : null;
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
                    <div className="text-orange-400">
                      {isRing ? `${parentName} Ring` : body.designation}
                    </div>
                    <div className="text-orange-700 text-[10px]">
                      {isRing ? `${body.ringType || 'rocky'} ring` : (body.planetTypeName || body.type)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-600 text-[10px]">{body.materials?.length || 0} materials</div>
                    <div className="text-[9px]">
                      <span className="text-orange-500">{bodyDeposits.available}</span>
                      <span className="text-orange-800">/{bodyDeposits.total} avail</span>
                      {bodyDeposits.regen > 0 && (
                        <span className="text-blue-600"> · {bodyDeposits.regen} regen</span>
                      )}
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
            {selectedProspect ? `Prospect Results — ${selectedProspect.designation || 'Ring'}` : 'Prospect Results'}
          </h3>

          {!selectedProspect && (
            <div className="text-orange-700 text-xs text-center py-8">
              <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a target to begin prospecting.</p>
            </div>
          )}

          {selectedProspect && available.length === 0 && regenerating.length === 0 && !mining && (
            <div className="text-orange-700 text-xs text-center py-4 border border-orange-950">
              <Package className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>No deposits found. Try another target.</p>
            </div>
          )}

          {available.map(prospect => (
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

          {/* Regenerating deposits with countdown timers */}
          {regenerating.length > 0 && (
            <div className="border border-blue-900/50 p-2 space-y-1">
              <div className="text-blue-500 text-[10px] uppercase font-bold flex items-center gap-1">
                <Loader className="w-3 h-3" /> Regenerating Deposits
              </div>
              {regenerating.map(prospect => {
                const mins = Math.floor(prospect.regenIn / 60000);
                const secs = Math.floor((prospect.regenIn % 60000) / 1000);
                return (
                  <div key={prospect.id} className="flex items-center justify-between text-[10px] py-0.5">
                    <span className={`${prospect.isCore ? 'text-yellow-600' : 'text-blue-600'}`}>
                      {prospect.isCore && '★ '}{prospect.materialName}
                    </span>
                    <span className="text-blue-500 font-mono">
                      {mins}:{String(secs).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

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