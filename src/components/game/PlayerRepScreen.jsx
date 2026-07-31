// Player Reputation — per-faction standing
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { FACTIONS, getRepLevel, adjustRep } from '@/lib/playerRep';
import { Award, Coins, Handshake, UserX } from 'lucide-react';

export default function PlayerRepScreen() {
  const { state, update, addCredits } = useGameState();
  const factionRep = state.factionRep || {};
  const isSandbox = state.saveMode === 'sandbox';

  const handleDonate = (factionId, amount, repGain) => {
    const cost = isSandbox ? 0 : amount;
    if (!isSandbox && state.credits < cost) return;
    if (!isSandbox) addCredits(-cost);
    update(prev => ({
      ...prev,
      factionRep: { ...prev.factionRep, [factionId]: adjustRep(prev.factionRep, factionId, repGain) },
    }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Faction Reputation</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Your standing with each galactic faction. High reputation unlocks better missions and station discounts. Low reputation restricts access.</div>
      </div>

      {/* Faction cards */}
      <div className="space-y-2">
        {FACTIONS.map(faction => {
          const rep = factionRep[faction.id] || 0;
          const level = getRepLevel(rep);
          const pct = ((rep + 100) / 2);
          return (
            <div key={faction.id} className="border border-orange-900 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: faction.color, boxShadow: `0 0 4px ${faction.color}` }} />
                  <span className="text-orange-300 text-xs font-bold">{faction.name}</span>
                </div>
                <span className={`text-[10px] font-bold ${level.color}`}>{level.label}</span>
              </div>
              <p className="text-orange-700 text-[10px]">{faction.desc}</p>
              <div className="text-[9px] text-orange-600">{level.desc}</div>
              {/* Reputation bar */}
              <div className="relative w-full h-2 bg-black border border-orange-950">
                <div className="absolute top-0 left-1/2 w-px h-full bg-orange-800" />
                <div
                  className={`absolute top-0 h-full ${rep >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                  style={rep >= 0 ? { left: '50%', width: `${pct - 50}%` } : { right: '50%', width: `${50 - pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-red-500">-100</span>
                <span className={`font-bold ${level.color}`}>{rep > 0 ? '+' : ''}{rep}</span>
                <span className="text-green-500">+100</span>
              </div>
              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleDonate(faction.id, 100000, 5)}
                  disabled={!isSandbox && state.credits < 100000}
                  className="flex-1 py-1 border border-green-700 text-green-500 hover:bg-green-950/30 text-[9px] font-bold disabled:opacity-30 flex items-center justify-center gap-1"
                >
                  <Handshake className="w-2.5 h-2.5" /> DONATE 100K (+5)
                </button>
                <button
                  onClick={() => handleDonate(faction.id, 1000000, 20)}
                  disabled={!isSandbox && state.credits < 1000000}
                  className="flex-1 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[9px] font-bold disabled:opacity-30 flex items-center justify-center gap-1"
                >
                  <Coins className="w-2.5 h-2.5" /> DONATE 1M (+20)
                </button>
                {faction.id === 'pirate' && (
                  <button
                    onClick={() => handleDonate(faction.id, 0, -10)}
                    className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[9px] font-bold"
                  >
                    <UserX className="w-2.5 h-2.5" /> BETRAY (−10)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}