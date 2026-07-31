// Power Play Screen — join galactic powers for perks and reputation
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { POWERS, POWER_MAP, getPowerRank, POWER_RANKS } from '@/lib/powerPlay';
import { Crown, LogOut, Star } from 'lucide-react';

export default function PowerPlayScreen() {
  const { state, update, addCredits } = useGameState();
  const pp = state.powerPlay;
  const isSandbox = state.saveMode === 'sandbox';

  const handleJoin = (powerId) => {
    update({ powerPlay: { powerId, reputation: 0, joinedAt: Date.now() } });
  };

  const handleLeave = () => {
    if (!confirm('Leave your power? You will lose all reputation.')) return;
    update({ powerPlay: null });
  };

  const handleDonate = () => {
    const cost = 1000000;
    if (!isSandbox && state.credits < cost) return;
    if (!isSandbox) addCredits(-cost);
    update({
      powerPlay: pp ? { ...pp, reputation: (pp.reputation || 0) + 100000 } : pp,
    });
  };

  const handleConsolidate = () => {
    const now = Date.now();
    const last = pp.lastConsolidation || pp.joinedAt || now;
    const hours = Math.max(0, (now - last) / 3600000);
    const jumps = state.totalJumps - (pp.jumpsAtConsolidation || 0);
    const merits = Math.floor(hours * 1000 + jumps * 500);
    if (merits <= 0) return;
    update({
      powerPlay: { ...pp, reputation: (pp.reputation || 0) + merits, lastConsolidation: now, jumpsAtConsolidation: state.totalJumps },
    });
  };

  const handleUndermine = () => {
    const cost = 5000000;
    if (!isSandbox && state.credits < cost) return;
    if (!isSandbox) addCredits(-cost);
    update({
      powerPlay: { ...pp, reputation: (pp.reputation || 0) + 200000 },
    });
  };

  if (!pp) {
    return (
      <div className="w-full h-full overflow-y-auto p-4 space-y-4">
        <div className="border border-orange-700 p-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Power Play</h2>
        </div>
        <div className="text-orange-600 text-xs">Pledge allegiance to a galactic power. Each power grants unique passive bonuses. You can only serve one power at a time.</div>
        <div className="space-y-3">
          {POWERS.map(power => (
            <div key={power.id} className="border border-orange-900 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: power.color, boxShadow: `0 0 4px ${power.color}` }} />
                <span className="text-orange-300 font-bold text-sm">{power.name}</span>
                <span className="text-orange-700 text-[10px] border border-orange-900 px-1">{power.faction}</span>
              </div>
              <p className="text-orange-600 text-xs mb-1">{power.desc}</p>
              <div className="text-orange-500 text-[10px] mb-2">PERK: {power.perkLabel}</div>
              <button
                onClick={() => handleJoin(power.id)}
                className="px-3 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold"
              >
                PLEDGE ALLEGIANCE
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const power = POWER_MAP[pp.powerId];
  const rank = getPowerRank(pp.reputation || 0);
  const nextRank = POWER_RANKS[rank.idx + 1];
  const repToNext = nextRank ? nextRank.threshold - (pp.reputation || 0) : 0;
  const progressPct = nextRank
    ? Math.min(100, (((pp.reputation || 0) - rank.threshold) / (nextRank.threshold - rank.threshold)) * 100)
    : 100;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full" style={{ background: power.color, boxShadow: `0 0 6px ${power.color}` }} />
        <Crown className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">{power.name}</h2>
        <span className="text-orange-700 text-xs ml-auto">{power.faction}</span>
      </div>

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-600 text-xs">{power.desc}</div>
        <div className="text-orange-500 text-xs">PERK: {power.perkLabel}</div>
      </div>

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-400 font-bold uppercase">Rank: {rank.name}</span>
          <span className="text-orange-600">{(pp.reputation || 0).toLocaleString()} REP</span>
        </div>
        {nextRank && (
          <>
            <div className="w-full h-2 bg-black border border-orange-900">
              <div className="h-full bg-orange-600 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-orange-700 text-[10px]">{repToNext.toLocaleString()} reputation to {nextRank.name}</div>
          </>
        )}
        {!nextRank && <div className="text-green-500 text-xs">MAXIMUM RANK ACHIEVED</div>}
      </div>

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-500" />
          <span className="text-orange-400 text-sm font-bold uppercase">Donate Credits</span>
        </div>
        <div className="text-orange-700 text-[10px]">Donate 1,000,000 CR to gain 100,000 reputation.</div>
        <button
          onClick={handleDonate}
          disabled={!isSandbox && state.credits < 1000000}
          className="w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30"
        >
          {isSandbox ? 'DONATE (FREE)' : 'DONATE 1,000,000 CR'}
        </button>
      </div>

      {/* Merit consolidation */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-500" />
          <span className="text-orange-400 text-sm font-bold uppercase">Consolidate Merits</span>
        </div>
        <div className="text-orange-700 text-[10px]">Convert recent activity (time pledged + jumps completed) into merit reputation.</div>
        <button
          onClick={handleConsolidate}
          className="w-full py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold"
        >
          CONSOLIDATE MERITS
        </button>
      </div>

      {/* Undermine rivals */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-red-500" />
          <span className="text-orange-400 text-sm font-bold uppercase">Undermine Rivals</span>
        </div>
        <div className="text-orange-700 text-[10px]">Fund covert operations against rival powers. Grants 200K reputation.</div>
        <button
          onClick={handleUndermine}
          disabled={!isSandbox && state.credits < 5000000}
          className="w-full py-1.5 border border-red-600 text-red-400 hover:bg-red-950/30 text-xs font-bold disabled:opacity-30"
        >
          {isSandbox ? 'UNDERMINE (FREE)' : 'UNDERMINE — 5,000,000 CR'}
        </button>
      </div>

      <button
        onClick={handleLeave}
        className="w-full py-2 border border-red-800 text-red-500 hover:bg-red-950/30 text-xs font-bold flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" /> ABANDON POWER
      </button>
    </div>
  );
}