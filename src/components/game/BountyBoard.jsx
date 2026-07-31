// Bounty Board — accept bounty hunting contracts at stations
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateEnemy } from '@/lib/combat';
import { Skull, Crosshair, Trash2, Coins } from 'lucide-react';
import CombatScreen from './CombatScreen';

const PIRATE_NAMES = ['Red Corsair', 'Ghost Hunter', 'Iron Claw', 'Nightshade', 'Void Reaver', 'Dread Siren', 'Black Scythe', 'Ash Marauder'];
const SHIP_NAMES = ['Sidewinder Mk-I', 'Eagle Mk-II', 'Viper Mk-III', 'Cobra Mk-III', 'Vulture', 'Mamba'];

export default function BountyBoard() {
  const { state, addBountyMission, completeBountyMission } = useGameState();
  const [combat, setCombat] = useState(null);

  const contracts = useMemo(() => {
    const seed = state.currentSystem?.seed || 'default';
    let s = 0;
    for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) | 0;
    const rng = () => { s = (s * 1103515245 + 12345) | 0; return ((s >>> 16) & 0x7fff) / 0x7fff; };
    const count = 3 + Math.floor(rng() * 4);
    return Array.from({ length: count }, (_, i) => {
      const threat = 1 + Math.floor(rng() * 3);
      return {
        id: `bounty_${seed}_${i}`,
        targetName: PIRATE_NAMES[Math.floor(rng() * PIRATE_NAMES.length)],
        targetShip: SHIP_NAMES[Math.min(threat - 1, SHIP_NAMES.length - 1)],
        threatLevel: threat,
        reward: Math.round((5000 + threat * 12000) * (0.8 + rng() * 0.4)),
        faction: ['Pilots Federation', 'Federation Navy', 'Local Security'][Math.floor(rng() * 3)],
      };
    });
  }, [state.currentSystem?.seed]);

  const handleAccept = (contract) => {
    addBountyMission({ ...contract, acceptedAt: Date.now() });
  };

  const handleEngage = (mission) => {
    const enemy = generateEnemy(mission.threatLevel);
    enemy.name = mission.targetName;
    enemy.ship = mission.targetShip;
    setCombat({ enemy, missionId: mission.id });
  };

  const handleCombatEnd = () => {
    setCombat(null);
  };

  if (combat) {
    return <CombatScreen enemy={combat.enemy} context="bounty" missionId={combat.missionId} onEnd={handleCombatEnd} />;
  }

  const activeMissions = state.bountyMissions || [];

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Bounty Board — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Wanted criminals in this system. Accept a contract, then engage to collect the bounty.</div>
      </div>

      {/* Active contracts */}
      {activeMissions.length > 0 && (
        <div className="border border-red-900 p-3 space-y-2">
          <h3 className="text-red-400 text-xs font-bold uppercase">Active Contracts</h3>
          {activeMissions.map(m => (
            <div key={m.id} className="border border-red-950 p-2 flex items-center justify-between">
              <div>
                <div className="text-red-300 text-xs font-bold">{m.targetName} — {m.targetShip}</div>
                <div className="text-orange-600 text-[10px]">THREAT: {'★'.repeat(m.threatLevel)} · REWARD: {m.reward.toLocaleString()} CR · FACTION: {m.faction}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEngage(m)} className="px-3 py-1 border border-red-600 text-red-400 hover:bg-red-950/30 text-[10px] font-bold flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> ENGAGE
                </button>
                <button onClick={() => completeBountyMission(m.id)} className="px-2 py-1 border border-orange-900 text-orange-700 hover:text-orange-500 text-[10px]">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available contracts */}
      <div className="border border-orange-900 p-3 space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Available Bounties</h3>
        {contracts.map(c => {
          const alreadyAccepted = activeMissions.some(m => m.id === c.id);
          return (
            <div key={c.id} className="border border-orange-950 p-2 flex items-center justify-between">
              <div>
                <div className="text-orange-300 text-xs font-bold">{c.targetName} — {c.targetShip}</div>
                <div className="text-orange-600 text-[10px]">THREAT: {'★'.repeat(c.threatLevel)} · REWARD: {c.reward.toLocaleString()} CR · FACTION: {c.faction}</div>
              </div>
              <button
                onClick={() => handleAccept(c)}
                disabled={alreadyAccepted}
                className="px-3 py-1 border border-orange-600 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
              >
                <Coins className="w-3 h-3" /> {alreadyAccepted ? 'ACCEPTED' : 'ACCEPT'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}