// Conflict Zones — faction warfare combat sites
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateConflictZones, calculateCombatBonds, CZ_TYPES } from '@/lib/conflictZones';
import { generateEnemy } from '@/lib/combat';
import { Swords, Flag, Crosshair, Users } from 'lucide-react';
import CombatScreen from './CombatScreen';

export default function ConflictZoneScreen() {
  const { state, getSystemData, addCredits } = useGameState();
  const [combat, setCombat] = useState(null);
  const [zones, setZones] = useState(null);
  const [chosenSide, setChosenSide] = useState({});

  const systemData = getSystemData();
  const generatedZones = useMemo(() => generateConflictZones(state.currentSystem?.seed, systemData), [state.currentSystem?.seed]);

  // Use local state for zones (to track influence/enemies changes), initialized from generated
  const activeZones = zones || generatedZones;

  const handleEngage = (zone) => {
    const side = chosenSide[zone.id];
    if (!side) return;
    const enemy = generateEnemy(zone.threatLevel);
    const bonds = calculateCombatBonds(zone.threatLevel);
    setCombat({ enemy, bonds, zoneId: zone.id, side });
  };

  const handleCombatEnd = (result) => {
    if (result.victory && combat) {
      setZones(prev => {
        const base = prev || generatedZones;
        return base.map(z => {
          if (z.id !== combat.zoneId) return z;
          const side = combat.side;
          return {
            ...z,
            enemiesRemaining: Math.max(0, z.enemiesRemaining - 1),
            influenceA: z.influenceA + (side === 'A' ? 4 : -4),
            influenceB: z.influenceB + (side === 'B' ? 4 : -4),
          };
        });
      });
    }
    setCombat(null);
  };

  if (combat) {
    return <CombatScreen enemy={combat.enemy} context="conflict" bonds={combat.bonds} onEnd={handleCombatEnd} />;
  }

  if (activeZones.length === 0) {
    return (
      <div className="p-4 text-center text-orange-500">
        <Swords className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active conflict zones in this system.</p>
        <p className="text-orange-700 text-xs mt-1">Conflict zones appear in populated systems with faction tension.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="border border-red-700 p-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-500" />
          <h2 className="text-red-300 font-bold uppercase">Conflict Zones — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Choose a faction side and engage enemy ships. Earn combat bonds for each kill.</div>
      </div>

      {activeZones.map(zone => (
        <div key={zone.id} className="border border-orange-900 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-300 font-bold text-xs">{zone.type.label} Conflict Zone</div>
              <div className="text-[10px] text-orange-700">{zone.type.desc}</div>
            </div>
            <div className="text-[10px] text-orange-600">ENEMIES: {zone.enemiesRemaining}</div>
          </div>

          {/* Influence bars */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <Flag className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400 w-32 truncate">{zone.factionA}</span>
              <div className="flex-1 h-1.5 bg-black border border-orange-950">
                <div className="h-full bg-blue-600" style={{ width: `${zone.influenceA}%` }} />
              </div>
              <span className="text-orange-600">{zone.influenceA}%</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <Flag className="w-3 h-3 text-red-400" />
              <span className="text-red-400 w-32 truncate">{zone.factionB}</span>
              <div className="flex-1 h-1.5 bg-black border border-orange-950">
                <div className="h-full bg-red-600" style={{ width: `${zone.influenceB}%` }} />
              </div>
              <span className="text-orange-600">{zone.influenceB}%</span>
            </div>
          </div>

          {/* Side selection + engage */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChosenSide(prev => ({ ...prev, [zone.id]: 'A' }))}
              className={`px-2 py-1 text-[10px] border ${chosenSide[zone.id] === 'A' ? 'border-blue-500 bg-blue-950/30 text-blue-300' : 'border-blue-900 text-blue-700'}`}
            >
              {zone.factionA}
            </button>
            <button
              onClick={() => setChosenSide(prev => ({ ...prev, [zone.id]: 'B' }))}
              className={`px-2 py-1 text-[10px] border ${chosenSide[zone.id] === 'B' ? 'border-red-500 bg-red-950/30 text-red-300' : 'border-red-900 text-red-700'}`}
            >
              {zone.factionB}
            </button>
            <button
              onClick={() => handleEngage(zone)}
              disabled={!chosenSide[zone.id] || zone.enemiesRemaining === 0}
              className="ml-auto px-3 py-1.5 border border-red-600 text-red-400 hover:bg-red-950/30 text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
            >
              <Crosshair className="w-3 h-3" /> ENGAGE
            </button>
          </div>
          {zone.enemiesRemaining === 0 && <div className="text-green-500 text-[10px] text-center">Zone cleared — faction victory!</div>}
        </div>
      ))}
    </div>
  );
}