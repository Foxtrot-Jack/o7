// MiningPanel — inline mining UI embedded in the SystemOrrery body info panel
// Shows prospecting results for the orbiting body and allows mining deposits directly
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { COMMODITY_MAP } from '@/lib/commodities';
import { makeRng, randInt, randFloat, pick } from '@/lib/prng';
import { Loader, Zap, Package, AlertTriangle } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

const REGEN_COOLDOWN = 5 * 60 * 1000;

export default function MiningPanel({ body }) {
  const { state, addCargo, addMaterial, markDepositMined } = useGameState();
  const [mining, setMining] = useState(false);
  const [miningResult, setMiningResult] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Live countdown tick
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset result when body changes
  useEffect(() => {
    setMiningResult(null);
    setMining(false);
  }, [body?.id]);

  const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
  const cargoCapacity = state.ship?.cargoCapacity ?? 0;
  const cargoFull = cargoUsed >= cargoCapacity;

  // Deterministic prospecting — same body always yields same deposits
  const { available, regenerating } = useMemo(() => {
    if (!body) return { available: [], regenerating: [] };
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
      if (!minedAt || now - minedAt >= REGEN_COOLDOWN) {
        avail.push(p);
      } else {
        regen.push({ ...p, regenIn: minedAt + REGEN_COOLDOWN - now });
      }
    }
    return { available: avail, regenerating: regen };
  }, [body, state.minedDeposits, now]);

  const handleMine = useCallback((prospect) => {
    if (cargoFull) {
      soundEngine.play('error');
      return;
    }
    soundEngine.play('mining');
    setMining(true);
    setTimeout(() => {
      setMining(false);
      const yieldQty = prospect.isCore ? prospect.yield * 3 : prospect.yield;
      const intQty = Math.max(1, Math.floor(yieldQty));
      addMaterial(prospect.materialId, Math.round(yieldQty * 10) / 10);
      const currentCargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
      const spaceLeft = cargoCapacity - currentCargoUsed;
      const cargoQty = Math.min(intQty, spaceLeft);
      if (cargoQty > 0) addCargo(prospect.materialId, cargoQty);
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
  }, [addMaterial, addCargo, markDepositMined, cargoFull, cargoCapacity, state.ship]);

  if (!body) return null;

  return (
    <div className="border-t border-orange-900 pt-1 space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-orange-700 uppercase">Mining — Prospecting</span>
        <span className="text-orange-600">
          Cargo: <span className={cargoFull ? 'text-red-500' : 'text-orange-400'}>{cargoUsed}/{cargoCapacity}T</span>
        </span>
      </div>

      {/* Available deposits */}
      {available.length === 0 && regenerating.length === 0 && !mining && (
        <div className="text-orange-700 text-[10px] text-center py-1">No deposits found.</div>
      )}

      {available.map(prospect => (
        <div key={prospect.id} className="border border-orange-950 p-1 text-[10px]">
          <div className="flex items-start justify-between">
            <div>
              <span className={prospect.isCore ? 'text-yellow-400 font-bold' : 'text-orange-300'}>
                {prospect.isCore && '★ '}{prospect.materialName}
              </span>
              <span className="text-orange-700 ml-1">{prospect.yield}T</span>
            </div>
            <span className="text-orange-500">{prospect.value.toLocaleString()}CR</span>
          </div>
          <button
            onClick={() => handleMine(prospect)}
            disabled={mining || cargoFull}
            className="mt-0.5 w-full py-0.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[9px] flex items-center justify-center gap-1 disabled:opacity-30"
          >
            {mining ? <Loader className="w-2.5 h-2.5 animate-spin" /> : <Zap className="w-2.5 h-2.5" />}
            {mining ? 'MINING...' : cargoFull ? 'CARGO FULL' : 'MINE'}
          </button>
        </div>
      ))}

      {/* Regenerating deposits */}
      {regenerating.length > 0 && (
        <div className="space-y-0.5">
          {regenerating.map(prospect => {
            const mins = Math.floor(prospect.regenIn / 60000);
            const secs = Math.floor((prospect.regenIn % 60000) / 1000);
            return (
              <div key={prospect.id} className="flex items-center justify-between text-[9px]">
                <span className="text-blue-600">{prospect.isCore && '★ '}{prospect.materialName}</span>
                <span className="text-blue-500 font-mono">{mins}:{String(secs).padStart(2, '0')}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Mining result */}
      {miningResult && (
        <div className="border border-green-800 p-1 text-[10px] bg-green-950/20">
          <div className="text-green-400 font-bold flex items-center gap-1">
            <Package className="w-2.5 h-2.5" />
            +{miningResult.qty}T {miningResult.material} → CARGO
          </div>
          <div className="text-green-600 text-[9px]">
            +{miningResult.lockerQty} to locker · {miningResult.value.toLocaleString()}CR
            {miningResult.isCore && ' · CORE'}
          </div>
          {miningResult.cargoFull && (
            <div className="text-red-500 text-[9px] flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> Cargo full — excess discarded
            </div>
          )}
        </div>
      )}
    </div>
  );
}