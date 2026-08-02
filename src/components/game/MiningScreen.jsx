// Mining Screen — read-only list of minable bodies in the system
// Mining itself happens inline in the System Orrery body info panel when orbiting
// Undiscovered bodies show as "?" until FSS scan reveals them
import React, { useState, useEffect, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { COMMODITY_MAP } from '@/lib/commodities';
import { makeRng, randInt } from '@/lib/prng';
import { Pickaxe, Gem, Package, Radio } from 'lucide-react';

const REGEN_COOLDOWN = 5 * 60 * 1000;

export default function MiningScreen({ onNavigate }) {
  const { state, getSystemData } = useGameState();
  const systemData = getSystemData();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cargoUsed = (state.ship?.cargo || []).reduce((s, c) => s + c.qty, 0);
  const cargoCapacity = state.ship?.cargoCapacity ?? 0;

  const systemSeed = state.currentSystem?.seed;
  const fssScanned = state.fssScannedSystems?.[systemSeed];
  const fssDiscovered = state.fssDiscoveredBodies || {};

  // All minable bodies — regardless of FSS discovery (undiscovered ones show as "?")
  const minableBodies = useMemo(() => {
    if (!systemData) return [];
    return systemData.bodies.filter(b => {
      const isMinableType =
        b.type === BODY_TYPES.BELT ||
        b.type === BODY_TYPES.ASTEROID ||
        (b.type === BODY_TYPES.PLANET && b.landable) ||
        b.type === BODY_TYPES.RING;
      return isMinableType;
    });
  }, [systemData]);

  const bodyDepositInfo = useMemo(() => {
    return minableBodies.map(body => {
      const rng = makeRng(body.id + ':prospect');
      const count = randInt(rng, 3, 8);
      let available = 0;
      let regen = 0;
      for (let i = 0; i < count; i++) {
        const id = `${body.id}_ast_${i}`;
        const minedAt = state.minedDeposits?.[id];
        if (!minedAt || now - minedAt >= REGEN_COOLDOWN) available++;
        else regen++;
      }
      return { body, total: count, available, regen };
    });
  }, [minableBodies, state.minedDeposits, now]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pickaxe className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase text-sm">Mining Survey — Minable Bodies</span>
        </div>
        <div className="text-xs text-orange-600">
          {fssScanned ? 'SYSTEM SURVEY COMPLETE' : 'PARTIAL SURVEY'}
        </div>
      </div>

      {/* Cargo status bar */}
      <div className="border-b border-orange-900/50 p-2 flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-[10px] uppercase text-orange-700">Cargo Hold</span>
        <div className="flex-1 h-3 bg-black border border-orange-950 relative">
          <div
            className="h-full transition-all bg-orange-600"
            style={{ width: `${cargoCapacity > 0 ? Math.min(100, (cargoUsed / cargoCapacity) * 100) : 0}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] text-orange-300">
            {cargoUsed} / {cargoCapacity} T
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-orange-700 text-[10px] uppercase border-b border-orange-950 pb-1">
          Travel to a body in the System Map to mine its deposits
        </div>

        {/* No minable bodies at all */}
        {minableBodies.length === 0 && (
          <div className="text-orange-700 text-xs text-center py-8 border border-orange-950">
            <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No minable bodies in this system.</p>
          </div>
        )}

        {/* FSS scan prompt — shown when system not fully scanned */}
        {!fssScanned && minableBodies.length > 0 && (
          <div className="border border-cyan-900 bg-black/50 p-3 text-center space-y-2">
            <Radio className="w-6 h-6 mx-auto text-cyan-700" />
            <div className="text-cyan-400 text-xs font-bold uppercase">Partial Survey</div>
            <div className="text-cyan-600 text-[10px]">
              Some bodies remain undiscovered. Run an FSS scan to reveal them.
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

        {/* Body list — read only, with "?" for undiscovered */}
        {bodyDepositInfo.map(({ body, total, available, regen }) => {
          const isRing = body.type === BODY_TYPES.RING;
          const isDiscovered = isRing ? fssDiscovered[body.parent] : fssDiscovered[body.id];

          // Undiscovered body — show "?" placeholder
          if (!isDiscovered) {
            return (
              <div key={body.id} className="border border-orange-950 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 text-lg font-bold">?</span>
                  <div>
                    <div className="text-orange-800">UNDISCOVERED</div>
                    <div className="text-orange-900 text-[10px]">FSS scan required to reveal</div>
                  </div>
                </div>
              </div>
            );
          }

          const parentName = isRing
            ? systemData.bodies.find(b => b.id === body.parent)?.designation
            : null;
          return (
            <div key={body.id} className="border border-orange-900 p-2 text-xs">
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
                    <span className="text-orange-500">{available}</span>
                    <span className="text-orange-800">/{total} avail</span>
                    {regen > 0 && <span className="text-blue-600"> · {regen} regen</span>}
                  </div>
                  {body.valuable && <div className="text-yellow-500 text-[10px]">★ VALUABLE</div>}
                </div>
              </div>
              {/* Material list */}
              {body.materials && body.materials.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-orange-950">
                  {body.materials.slice(0, 6).map(m => (
                    <span key={m.id} className="text-[9px] text-orange-500 border border-orange-950 px-1">
                      {COMMODITY_MAP[m.id]?.name || m.id} ({m.concentration.toFixed(0)}%)
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => onNavigate?.('system')}
                className="mt-1 w-full py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-[9px] font-bold"
              >
                → GO TO SYSTEM MAP TO MINE
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}