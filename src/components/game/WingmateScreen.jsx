// Wingmate Manager — hire and dismiss NPC combat pilots
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { generatePilotRoster, PILOT_RANKS, getWingmateBonuses } from '@/lib/wingmates';
import { Users, UserPlus, UserMinus, Star, Coins } from 'lucide-react';

export default function WingmateScreen() {
  const { state, hireWingmate, dismissWingmate } = useGameState();
  const [roster] = useState(() => generatePilotRoster(5));
  const wingmates = state.wingmates || [];
  const isSandbox = state.saveMode === 'sandbox';
  const bonuses = getWingmateBonuses(wingmates);
  const totalWeekly = wingmates.reduce((sum, w) => sum + (w.weeklyCost || 0), 0);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Wingmate Roster</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Hire NPC pilots to fight alongside you in combat. Up to 4 active wingmates.</div>
      </div>

      {/* Active wingmates */}
      {wingmates.length > 0 && (
        <div className="border border-orange-900 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-orange-500 text-xs font-bold uppercase">Active Wingmates ({wingmates.length}/4)</h3>
            <span className="text-orange-600 text-[10px]">Weekly Cost: {totalWeekly.toLocaleString()} CR</span>
          </div>
          {bonuses && (
            <div className="text-[10px] text-green-500 border border-green-950 p-1">
              Combat Bonus: +{Math.round(bonuses.damageBonus)} DMG · +{Math.round(bonuses.speedBonus * 100)}% Flee · {bonuses.extraAttacks.length} extra attack(s)
            </div>
          )}
          {wingmates.map(wm => (
            <div key={wm.id} className="border border-orange-950 p-2 flex items-center justify-between">
              <div>
                <div className="text-orange-300 text-xs font-bold">{wm.name}</div>
                <div className="text-[10px] text-orange-600">{wm.rankLabel} · Skill: {Math.round(wm.combatSkill * 100)}% · {wm.weeklyCost.toLocaleString()} CR/wk</div>
              </div>
              <button onClick={() => dismissWingmate(wm.id)} className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px] flex items-center gap-1">
                <UserMinus className="w-3 h-3" /> DISMISS
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pilots for hire */}
      <div className="border border-orange-900 p-3 space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Pilots Available for Hire</h3>
        {roster.map(pilot => {
          const alreadyHired = wingmates.some(w => w.id === pilot.id);
          const canAfford = isSandbox || state.credits >= pilot.hireCost;
          const slotsFull = wingmates.length >= 4;
          return (
            <div key={pilot.id} className="border border-orange-950 p-2 flex items-center justify-between">
              <div>
                <div className="text-orange-300 text-xs font-bold">{pilot.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-orange-600">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-yellow-500" /> {pilot.rankLabel}
                  </span>
                  <span>Skill: {Math.round(pilot.combatSkill * 100)}%</span>
                  <span>Hire: {pilot.hireCost.toLocaleString()} CR</span>
                  <span>{pilot.weeklyCost.toLocaleString()} CR/wk</span>
                </div>
              </div>
              <button
                onClick={() => hireWingmate(pilot)}
                disabled={alreadyHired || !canAfford || slotsFull}
                className="px-3 py-1 border border-green-700 text-green-500 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> {alreadyHired ? 'HIRED' : slotsFull ? 'FULL' : 'HIRE'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Rank reference */}
      <div className="border border-orange-900 p-3">
        <h3 className="text-orange-500 text-xs font-bold uppercase mb-2">Pilot Ranks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {PILOT_RANKS.map(r => (
            <div key={r.rank} className="text-[10px] text-orange-600 flex items-center justify-between border-b border-orange-950 pb-0.5">
              <span className="text-orange-400">{r.label}</span>
              <span>{r.hireCost.toLocaleString()} CR · Skill {Math.round(r.combatSkill * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}