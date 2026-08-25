// Shipwright — Hull Frame License upgrade screen for the persistent protagonist ship
import React from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { HULL_FRAME_TIERS, getHullFrame, getNextHullFrame, canUpgradeHullFrame, MAX_HULL_FRAME_TIER } from '@/lib/hullFrames';
import { computeShipStats, getShipSlotsForTier } from '@/lib/shipOutfitting';
import { Wrench, Shield, Package, Fuel, Rocket, Zap, Lock, Check, ChevronRight, Award } from 'lucide-react';

export default function ShipwrightScreen() {
  const { state, upgradeHullFrame } = useGameState();
  const isSandbox = state.saveMode === 'sandbox';
  const currentTier = state.ship?.hullFrameTier || 0;
  const currentFrame = getHullFrame(currentTier);
  const { canUpgrade, reason, next } = canUpgradeHullFrame(state);

  const shipType = SHIP_MAP[state.ship?.type];
  const currentStats = computeShipStats(state.ship?.type, state.ship?.modules, currentTier);
  const nextStats = next ? computeShipStats(state.ship?.type, state.ship?.modules, next.tier) : null;

  const currentSlots = getShipSlotsForTier(state.ship?.type, currentTier);
  const nextSlots = next ? getShipSlotsForTier(state.ship?.type, next.tier) : null;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-orange-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-500" />
          <div>
            <h2 className="text-orange-300 font-bold uppercase">Shipwright</h2>
            <div className="text-orange-700 text-[10px]">Hull Frame License Services</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-orange-400 text-xs">{state.ship?.name || 'Ship'}</div>
          <div className="text-orange-700 text-[10px]">{shipType?.name || state.ship?.type}</div>
        </div>
      </div>

      {/* Current Frame */}
      <div className="border border-cyan-700 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-900 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span className="text-cyan-300 font-bold uppercase text-sm">Current Frame</span>
          </div>
          <span className="text-cyan-500 text-xs font-bold">{currentFrame.license}</span>
        </div>
        <div className="text-cyan-400 text-sm font-bold">{currentFrame.name}</div>
        <div className="text-cyan-600 text-[11px]">{currentFrame.description}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <FrameStat icon={Shield} label="Hull" value={currentFrame.bonuses.hullIntegrity} />
          <FrameStat icon={Package} label="Cargo +" value={currentFrame.bonuses.cargoBonus + 'T'} />
          <FrameStat icon={Fuel} label="Fuel +" value={currentFrame.bonuses.fuelBonus + 'T'} />
          <FrameStat icon={Rocket} label="Jump x" value={currentFrame.bonuses.jumpRangeMult.toFixed(2)} />
          <FrameStat icon={Zap} label="Opt Slots +" value={currentFrame.bonuses.optionalSlotBonus} />
          <FrameStat icon={Zap} label="Hardpts +" value={currentFrame.bonuses.hardpointBonus} />
          <FrameStat icon={Zap} label="Utility +" value={currentFrame.bonuses.utilityBonus} />
          <FrameStat icon={Shield} label="Shield x" value={currentFrame.bonuses.shieldMult.toFixed(2)} />
        </div>
      </div>

      {/* Upgrade Panel */}
      {next ? (
        <div className="border border-orange-600 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-orange-900 pb-2">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-orange-500" />
              <span className="text-orange-300 font-bold uppercase text-sm">Next Upgrade</span>
            </div>
            <span className="text-orange-500 text-xs font-bold">{next.license}</span>
          </div>
          <div className="text-orange-400 text-sm font-bold">{next.name}</div>
          <div className="text-orange-600 text-[11px]">{next.description}</div>

          {/* Comparison: current vs next */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-orange-950 p-2">
              <div className="text-orange-700 text-[10px] uppercase mb-1">Current Stats</div>
              <div className="space-y-0.5 text-orange-500">
                <div>Cargo: {currentStats.cargoCapacity}T</div>
                <div>Jump: {currentStats.jumpRange} LY</div>
                <div>Shield: {currentStats.shield} MJ</div>
                <div>Fuel: {currentStats.fuelCapacity}T</div>
                <div>Hull: {currentFrame.bonuses.hullIntegrity}</div>
                <div>Opt Slots: {currentSlots?.optional?.length || 0}</div>
                <div>Hardpts: {currentSlots?.hardpoints?.length || 0}</div>
              </div>
            </div>
            <div className="border border-green-800 p-2">
              <div className="text-green-700 text-[10px] uppercase mb-1">After Upgrade</div>
              <div className="space-y-0.5 text-green-400">
                <div>Cargo: {nextStats.cargoCapacity}T {nextStats.cargoCapacity > currentStats.cargoCapacity && <span className="text-green-500">▲</span>}</div>
                <div>Jump: {nextStats.jumpRange} LY {nextStats.jumpRange > currentStats.jumpRange && <span className="text-green-500">▲</span>}</div>
                <div>Shield: {nextStats.shield} MJ {nextStats.shield > currentStats.shield && <span className="text-green-500">▲</span>}</div>
                <div>Fuel: {nextStats.fuelCapacity}T {nextStats.fuelCapacity > currentStats.fuelCapacity && <span className="text-green-500">▲</span>}</div>
                <div>Hull: {next.bonuses.hullIntegrity} {next.bonuses.hullIntegrity > currentFrame.bonuses.hullIntegrity && <span className="text-green-500">▲</span>}</div>
                <div>Opt Slots: {nextSlots?.optional?.length || 0} {(nextSlots?.optional?.length || 0) > (currentSlots?.optional?.length || 0) && <span className="text-green-500">▲</span>}</div>
                <div>Hardpts: {nextSlots?.hardpoints?.length || 0} {(nextSlots?.hardpoints?.length || 0) > (currentSlots?.hardpoints?.length || 0) && <span className="text-green-500">▲</span>}</div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="border-t border-orange-900 pt-2 space-y-1 text-xs">
            <div className="text-orange-700 text-[10px] uppercase">Requirements</div>
            <div className="flex items-center justify-between">
              <span className="text-orange-500">Credits</span>
              <span className={isSandbox || state.credits >= next.cost ? 'text-green-400' : 'text-red-400'}>
                {isSandbox ? 'FREE (SANDBOX)' : `${next.cost.toLocaleString()} CR`} {isSandbox || state.credits >= next.cost ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-500">Total Jumps</span>
              <span className={(state.totalJumps || 0) >= next.requirements.jumps ? 'text-green-400' : 'text-red-400'}>
                {next.requirements.jumps} jumps ({state.totalJumps || 0} done) {(state.totalJumps || 0) >= next.requirements.jumps ? '✓' : '✗'}
              </span>
            </div>
          </div>

          {/* Upgrade button */}
          {!canUpgrade ? (
            <div className="border border-red-900 bg-red-950/20 p-2 text-center text-red-400 text-xs">
              ⚠ {reason}
            </div>
          ) : (
            <button
              onClick={upgradeHullFrame}
              className="w-full py-2.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" /> UPGRADE TO {next.name} — {isSandbox ? 'FREE' : `${next.cost.toLocaleString()} CR`}
            </button>
          )}
        </div>
      ) : (
        <div className="border border-yellow-700 p-4 text-center space-y-2">
          <Award className="w-8 h-8 mx-auto text-yellow-500" />
          <div className="text-yellow-300 font-bold uppercase text-sm">Maximum Frame Tier Reached</div>
          <div className="text-yellow-600 text-[11px]">Your ship has been upgraded to the ultimate Capital Frame. No further hull upgrades available.</div>
        </div>
      )}

      {/* Full progression path */}
      <div className="border border-orange-900 p-4 space-y-2">
        <div className="text-orange-700 text-[10px] uppercase border-b border-orange-900 pb-1">Hull Frame Progression Path</div>
        {HULL_FRAME_TIERS.map((frame) => {
          const isCurrent = frame.tier === currentTier;
          const isPast = frame.tier < currentTier;
          const isLocked = frame.tier > currentTier && !isSandbox && (state.totalJumps || 0) < frame.requirements.jumps;
          return (
            <div key={frame.tier} className={`flex items-center gap-2 p-2 border ${isCurrent ? 'border-cyan-600 bg-cyan-950/20' : isPast ? 'border-green-900' : isLocked ? 'border-orange-950 opacity-50' : 'border-orange-900'}`}>
              <div className={`w-6 h-6 flex items-center justify-center border ${isPast ? 'border-green-600 text-green-400' : isCurrent ? 'border-cyan-500 text-cyan-400' : 'border-orange-700 text-orange-600'}`}>
                {isPast ? <Check className="w-3 h-3" /> : isLocked ? <Lock className="w-3 h-3" /> : frame.tier}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : isPast ? 'text-green-400' : 'text-orange-400'}`}>
                  {frame.license} — {frame.name}
                </div>
                <div className="text-orange-700 text-[9px]">{frame.description}</div>
              </div>
              <div className="text-right text-[10px]">
                <div className={isPast ? 'text-green-500' : 'text-orange-600'}>{isSandbox && frame.cost > 0 ? 'FREE' : `${frame.cost.toLocaleString()} CR`}</div>
                <div className="text-orange-800">{frame.requirements.jumps} jumps</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FrameStat({ icon: Icon, label, value }) {
  return (
    <div className="border border-cyan-950 p-1.5 flex items-center gap-1.5">
      <Icon className="w-3 h-3 text-cyan-600 shrink-0" />
      <div>
        <div className="text-cyan-700 text-[9px] uppercase">{label}</div>
        <div className="text-cyan-400 text-xs font-bold">{value}</div>
      </div>
    </div>
  );
}