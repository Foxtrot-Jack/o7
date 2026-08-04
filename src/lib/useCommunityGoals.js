// Community goals functions — extracted as a hook to keep gameState.jsx lean.
// Mirrors the original inline definitions; operates via setState patches.
import { useCallback } from 'react';
import { generateCommunityGoals } from './communityGoals';
import { COMMODITY_MAP } from './commodities';

export function useCommunityGoals(setState) {
  const refreshCommunityGoals = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      const goals = prev.communityGoals || [];
      const hasActive = goals.some(g => !g.claimed && g.deadline > now);
      if (hasActive && goals.length > 0) return prev;
      return { ...prev, communityGoals: generateCommunityGoals(), lastGoalRefresh: now };
    });
  }, [setState]);

  const contributeToGoal = useCallback((goalId) => {
    let result = { contributed: 0 };
    setState(prev => {
      const goal = (prev.communityGoals || []).find(g => g.id === goalId);
      if (!goal || goal.completed || goal.claimed) return prev;
      if (goal.type === 'trade' || goal.type === 'construction') {
        const cargo = prev.ship.cargo.map(c => ({ ...c }));
        let contributed = 0;
        for (const item of cargo) {
          const comm = COMMODITY_MAP[item.commodity];
          if (comm && comm.category === goal.commodityCategory) {
            const need = goal.target - goal.progress;
            const give = Math.min(item.qty, need);
            item.qty -= give;
            contributed += give;
          }
        }
        if (contributed === 0) return prev;
        result.contributed = contributed;
        return {
          ...prev,
          ship: { ...prev.ship, cargo: cargo.filter(c => c.qty > 0) },
          communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, progress: Math.min(g.target, g.progress + contributed), completed: g.progress + contributed >= g.target } : g),
        };
      }
      if (goal.type === 'mining') {
        const matId = goal.materialId;
        const have = prev.materials?.[matId] || 0;
        if (have === 0) return prev;
        const need = goal.target - goal.progress;
        const give = Math.min(have, need);
        result.contributed = give;
        return {
          ...prev,
          materials: { ...prev.materials, [matId]: have - give },
          communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, progress: Math.min(g.target, g.progress + give), completed: g.progress + give >= g.target } : g),
        };
      }
      if (goal.type === 'exploration') {
        const scanCount = Object.keys(prev.scannedBodies || {}).length;
        const mapCount = Object.keys(prev.mappedBodies || {}).length;
        const available = goal.desc.includes('Map') ? mapCount : scanCount;
        const alreadyCounted = goal.lastContributedCount || 0;
        const newScans = Math.max(0, available - alreadyCounted);
        if (newScans === 0) return prev;
        const need = goal.target - goal.progress;
        const give = Math.min(newScans, need);
        result.contributed = give;
        return {
          ...prev,
          communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, progress: Math.min(g.target, g.progress + give), completed: g.progress + give >= g.target, lastContributedCount: alreadyCounted + give } : g),
        };
      }
      return prev;
    });
    return result;
  }, [setState]);

  const contributeCombatKill = useCallback(() => {
    setState(prev => ({ ...prev, communityGoals: (prev.communityGoals || []).map(g => g.type === 'combat' && !g.completed && !g.claimed ? { ...g, progress: Math.min(g.target, g.progress + 1), completed: g.progress + 1 >= g.target } : g) }));
  }, [setState]);

  const claimGoalReward = useCallback((goalId) => {
    setState(prev => {
      const goal = (prev.communityGoals || []).find(g => g.id === goalId);
      if (!goal || !goal.completed || goal.claimed) return prev;
      return {
        ...prev,
        credits: prev.credits + goal.reward,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + goal.reward,
        communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, claimed: true } : g),
      };
    });
  }, [setState]);

  return { refreshCommunityGoals, contributeToGoal, contributeCombatKill, claimGoalReward };
}