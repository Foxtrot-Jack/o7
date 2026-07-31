// Mission Chains — multi-part story arcs
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateMissionChain, getChainProgress } from '@/lib/missionChains';
import { ListChecks, BookOpen, Plus, CheckCircle, Circle, Award } from 'lucide-react';

export default function MissionChainScreen() {
  const { state, update, addCredits } = useGameState();
  const chains = state.missionChains || [];
  const [newChain, setNewChain] = useState(null);
  const isSandbox = state.saveMode === 'sandbox';

  const handleAccept = () => {
    const chain = generateMissionChain();
    setNewChain(null);
    update(prev => ({ ...prev, missionChains: [...(prev.missionChains || []), chain] }));
  };

  const handleAdvanceStep = (chainId) => {
    update(prev => ({
      ...prev,
      missionChains: prev.missionChains.map(c => {
        if (c.id !== chainId) return c;
        const steps = [...c.steps];
        steps[c.currentStep] = { ...steps[c.currentStep], completed: true };
        const newStep = c.currentStep + 1;
        const isComplete = newStep >= steps.length;
        if (isComplete) {
          addCredits(c.finalReward);
        } else {
          addCredits(c.stepReward);
        }
        return { ...c, steps, currentStep: newStep };
      }),
    }));
  };

  const handleAbandon = (chainId) => {
    update(prev => ({ ...prev, missionChains: prev.missionChains.filter(c => c.id !== chainId) }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Mission Chains</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Multi-part story missions with escalating rewards and unique titles. Each step advances the narrative.</div>
      </div>

      {/* New chain */}
      <button
        onClick={() => { const c = generateMissionChain(); setNewChain(c); }}
        className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold flex items-center justify-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" /> SEEK CHAIN MISSION
      </button>

      {newChain && (
        <div className="border border-cyan-800 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-xs font-bold">{newChain.title}</span>
          </div>
          <p className="text-orange-600 text-[10px]">{newChain.desc}</p>
          <div className="text-[10px] text-orange-700">{newChain.steps.length} steps · {newChain.stepReward.toLocaleString()} CR/step · {newChain.finalReward.toLocaleString()} CR completion bonus</div>
          <div className="flex gap-1">
            <button onClick={handleAccept} className="flex-1 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">ACCEPT</button>
            <button onClick={() => setNewChain(null)} className="px-3 py-1.5 border border-orange-800 text-orange-500 hover:bg-orange-950/30 text-[10px]">DECLINE</button>
          </div>
        </div>
      )}

      {/* Active chains */}
      {chains.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Active Chains</h3>
          {chains.map(chain => {
            const progress = getChainProgress(chain);
            const isComplete = progress.done >= progress.total;
            return (
              <div key={chain.id} className={`border p-3 space-y-2 ${isComplete ? 'border-green-800' : 'border-orange-900'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-orange-300 text-xs font-bold">{chain.title}</span>
                  <span className="text-[10px] text-orange-700">{progress.done}/{progress.total}</span>
                </div>
                <p className="text-orange-600 text-[10px]">{chain.desc}</p>
                {/* Steps */}
                <div className="space-y-1">
                  {chain.steps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-1 text-[10px] ${step.completed ? 'text-green-500' : i === chain.currentStep ? 'text-orange-400' : 'text-orange-800'}`}>
                      {step.completed ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      <span>{step.desc}</span>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-black border border-orange-950">
                  <div className={`h-full ${isComplete ? 'bg-green-600' : 'bg-orange-600'}`} style={{ width: `${progress.pct}%` }} />
                </div>
                {!isComplete ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAdvanceStep(chain.id)}
                      className="flex-1 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> COMPLETE STEP ({chain.stepReward.toLocaleString()} CR)
                    </button>
                    <button onClick={() => handleAbandon(chain.id)} className="px-2 py-1.5 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px]">ABANDON</button>
                  </div>
                ) : (
                  <div className="text-green-500 text-[10px] flex items-center gap-1">
                    <Award className="w-3 h-3" /> CHAIN COMPLETE — Title earned: "{chain.earnedTitle}" · {chain.finalReward.toLocaleString()} CR bonus claimed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}