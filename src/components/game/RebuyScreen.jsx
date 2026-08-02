// Rebuy Screen — shown when ship is destroyed (combat or self-destruct)
// Player can pay rebuy cost to restore ship, or respawn in starter ship
import React from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { getDefaultModules, computeShipStats } from '@/lib/shipOutfitting';
import { AlertTriangle, Skull, Coins, Rocket, RotateCcw } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

export default function RebuyScreen() {
  const { state, rebuyShip, respawnWithStarter } = useGameState();
  const pending = state.rebuyPending;
  if (!pending) return null;

  const shipType = SHIP_MAP[pending.shipTypeId];
  const shipName = shipType?.name || 'Unknown Vessel';
  const rebuyCost = pending.rebuyCost;
  const canAfford = pending.canAfford;
  const isSandbox = state.saveMode === 'sandbox';
  const cause = pending.cause || 'destruction';

  return (
    <div className="fixed inset-0 z-[80] bg-black/98 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="border-2 border-red-700 p-4 text-center space-y-2">
          <Skull className="w-10 h-10 mx-auto text-red-500" />
          <h2 className="text-red-400 font-bold text-xl uppercase">Ship Destroyed</h2>
          <p className="text-red-700 text-xs">
            {cause === 'self-destruct'
              ? 'Your ship was self-destructed.'
              : 'Your ship was destroyed in combat.'}
          </p>
        </div>

        {/* Ship info */}
        <div className="border border-orange-900 p-3 space-y-1 text-xs">
          <div className="text-orange-500 font-bold uppercase text-[10px] mb-1">Lost Vessel</div>
          <div className="text-orange-300 font-bold">{shipName}</div>
          <div className="text-orange-700">{shipType?.manufacturer} · Class {shipType?.class}</div>
          <div className="text-red-500 text-[10px] mt-2">⚠ All cargo and cartographic data was lost.</div>
          <div className="text-green-500 text-[10px]">✓ Materials locker preserved.</div>
        </div>

        {/* Rebuy option */}
        <div className={`border-2 p-4 space-y-2 ${canAfford ? 'border-orange-500' : 'border-gray-800 opacity-50'}`}>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-orange-500" />
            <h3 className="text-orange-300 font-bold uppercase text-sm">Insurance Rebuy</h3>
          </div>
          <p className="text-orange-600 text-[10px]">
            Pay the insurance excess to restore your ship with all modules at the last station you visited.
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-700">REBUY COST:</span>
            <span className="text-orange-300 font-bold flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {isSandbox ? 'FREE' : `${rebuyCost.toLocaleString()} CR`}
            </span>
          </div>
          {canAfford ? (
            <button
              onClick={() => { soundEngine.play('confirm'); rebuyShip(); }}
              className="w-full py-2.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold"
            >
              {isSandbox ? 'RESTORE SHIP (FREE)' : `PAY ${rebuyCost.toLocaleString()} CR — RESTORE SHIP`}
            </button>
          ) : (
            <div className="w-full py-2.5 border border-gray-800 text-gray-700 text-xs font-bold text-center">
              INSUFFICIENT CREDITS
            </div>
          )}
        </div>

        {/* Starter ship fallback */}
        {!canAfford && (
          <div className="border-2 border-yellow-700 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-yellow-500" />
              <h3 className="text-yellow-300 font-bold uppercase text-sm">Emergency Starter Ship</h3>
            </div>
            <p className="text-yellow-700 text-[10px]">
              You cannot afford the insurance excess. You will respawn at the last station you visited in a Sparrowhawk Mk-I with no upgrades.
            </p>
            <button
              onClick={() => { soundEngine.play('confirm'); respawnWithStarter(); }}
              className="w-full py-2.5 border border-yellow-700 text-yellow-300 hover:bg-yellow-950/30 text-xs font-bold"
            >
              ACCEPT STARTER SHIP
            </button>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2 text-[10px] text-orange-800">
          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>Your rebuy cost is 5% of the ship's purchase price. Always keep enough credits on hand for insurance.</span>
        </div>
      </div>
    </div>
  );
}