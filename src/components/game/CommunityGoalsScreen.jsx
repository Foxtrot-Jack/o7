// Community Goals Screen — weekly rotating objectives with tiered rewards
import React, { useState, useEffect } from 'react';
import { useGameState } from '@/lib/gameState';
import { getTimeRemaining } from '@/lib/communityGoals';
import { COMMODITY_MAP } from '@/lib/commodities';
import { Target, Clock, Gift, TrendingUp } from 'lucide-react';

export default function CommunityGoalsScreen() {
  const { state, update, addCredits, refreshCommunityGoals, contributeToGoal, claimGoalReward } = useGameState();
  const [, force] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => force(v => v + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const goals = state.communityGoals || [];

  // Auto-refresh if empty or all expired
  useEffect(() => {
    const hasActive = goals.some(g => !g.claimed && getTimeRemaining(g.deadline) !== 'EXPIRED');
    if (goals.length === 0 || !hasActive) {
      refreshCommunityGoals();
    }
  }, []);

  const handleContribute = (goalId) => {
    const result = contributeToGoal(goalId);
    if (result && result.contributed === 0) {
      // No matching cargo/materials
    }
  };

  const handleClaim = (goalId) => {
    claimGoalReward(goalId);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Community Goals</h2>
      </div>

      <div className="text-orange-600 text-xs">
        Galactic objectives that refresh weekly. Contribute resources to fill progress bars and claim credit rewards. Goals expire after 7 days.
      </div>

      {/* Manual refresh */}
      <button
        onClick={() => refreshCommunityGoals()}
        className="px-3 py-1 border border-orange-800 text-orange-500 hover:bg-orange-950/30 text-[10px] font-bold"
      >
        ↻ REFRESH GOALS
      </button>

      {/* Goal cards */}
      <div className="space-y-3">
        {goals.map(goal => {
          const expired = getTimeRemaining(goal.deadline) === 'EXPIRED';
          const pct = Math.min(100, (goal.progress / goal.target) * 100);
          const canContribute = !goal.completed && !goal.claimed && !expired;

          return (
            <div key={goal.id} className={`border p-3 space-y-2 ${goal.claimed ? 'border-green-900 opacity-50' : goal.completed ? 'border-green-700' : expired ? 'border-red-900 opacity-50' : 'border-orange-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.icon}</span>
                  <span className="text-orange-300 font-bold text-sm">{goal.desc}</span>
                </div>
                <span className={`text-[10px] flex items-center gap-1 ${expired ? 'text-red-500' : 'text-orange-600'}`}>
                  <Clock className="w-2.5 h-2.5" /> {getTimeRemaining(goal.deadline)}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-orange-600 mb-1">
                  <span>{goal.progress} / {goal.target}</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-black border border-orange-900">
                  <div className={`h-full transition-all ${goal.completed ? 'bg-green-600' : 'bg-orange-600'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Reward */}
              <div className="flex items-center gap-1 text-orange-500 text-[10px]">
                <Gift className="w-3 h-3" /> REWARD: {goal.reward.toLocaleString()} CR
              </div>

              {/* Tiered rewards */}
              {(() => {
                const pct = (goal.progress / goal.target) * 100;
                const tiers = [
                  { threshold: 100, label: 'Champion', mult: 1.0 },
                  { threshold: 75, label: 'Top Contributor', mult: 0.75 },
                  { threshold: 50, label: 'Achiever', mult: 0.5 },
                  { threshold: 25, label: 'Contributor', mult: 0.25 },
                  { threshold: 10, label: 'Participant', mult: 0.1 },
                ];
                const currentTier = tiers.find(t => pct >= t.threshold) || null;
                const nextTier = [...tiers].reverse().find(t => pct < t.threshold);
                return (
                  <div className="text-[10px] text-orange-600">
                    Tier: <span className="text-orange-400">{currentTier ? currentTier.label : 'None'}</span>
                    {currentTier && <span className="text-green-500 ml-2">({Math.round(goal.reward * currentTier.mult).toLocaleString()} CR)</span>}
                    {nextTier && <span className="text-orange-700 ml-2">→ {nextTier.label} at {nextTier.threshold}%</span>}
                  </div>
                );
              })()}

              {/* Leaderboard */}
              {!goal.claimed && !expired && (
                <div className="border-t border-orange-950 pt-1 space-y-0.5">
                  <div className="text-[9px] text-orange-700 uppercase">Leaderboard</div>
                  {['Cmdr RedNova', 'Cmdr SteelDrift', 'Cmdr VoidRunner'].map((name, i) => (
                    <div key={i} className="text-[9px] text-orange-600 flex justify-between">
                      <span>{i + 1}. {name}</span>
                      <span>{Math.floor(goal.progress * (0.15 - i * 0.04))}</span>
                    </div>
                  ))}
                  <div className="text-[9px] text-cyan-400 flex justify-between font-bold">
                    <span>★ YOU</span>
                    <span>{goal.progress}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {canContribute && (
                  <button
                    onClick={() => handleContribute(goal.id)}
                    className="flex-1 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" /> CONTRIBUTE
                  </button>
                )}
                {goal.completed && !goal.claimed && (
                  <button
                    onClick={() => handleClaim(goal.id)}
                    className="flex-1 py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <Gift className="w-3 h-3" /> CLAIM {goal.reward.toLocaleString()} CR
                  </button>
                )}
                {goal.claimed && <span className="text-green-500 text-[10px] py-1">✓ REWARD CLAIMED</span>}
                {expired && !goal.completed && <span className="text-red-500 text-[10px] py-1">✗ EXPIRED</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}