// Encounter Screen — modal overlay for random travel encounters
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { resolveEncounter } from '@/lib/encounters';
import { Skull, Radio, Package, Ghost, Shield, Zap, User, AlertTriangle } from 'lucide-react';

const ENCOUNTER_ICONS = {
  skull: Skull,
  radio: Radio,
  package: Package,
  ghost: Ghost,
  shield: Shield,
  zap: Zap,
  user: User,
};

export default function EncounterScreen() {
  const { state, resolveEncounterAction } = useGameState();
  const [outcome, setOutcome] = useState(null);
  const encounter = state.activeEncounter;

  if (!encounter) return null;
  const Icon = ENCOUNTER_ICONS[encounter.icon] || AlertTriangle;

  const handleChoose = (optionId) => {
    const result = resolveEncounter(encounter, optionId, state);
    resolveEncounterAction(result);
    setOutcome(result);
  };

  const handleDismiss = () => {
    setOutcome(null);
    resolveEncounterAction(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-orange-600 bg-black p-6 space-y-4">
        {!outcome ? (
          <>
            <div className="flex items-center gap-3 border-b border-orange-900 pb-3">
              <Icon className="w-8 h-8 text-orange-500" />
              <div>
                <h2 className="text-orange-300 font-bold uppercase text-lg">{encounter.name}</h2>
                <div className="text-orange-700 text-[10px]">IN-SYSTEM: {encounter.systemName}</div>
                {encounter.pilotName && (
                  <div className="text-cyan-600 text-[10px] uppercase">PILOT: {encounter.pilotName}</div>
                )}
              </div>
            </div>
            <p className="text-orange-400 text-sm leading-relaxed">{encounter.description}</p>
            <div className="space-y-2">
              {encounter.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleChoose(opt.id)}
                  className="w-full text-left p-3 border border-orange-800 hover:border-orange-500 hover:bg-orange-950/30 transition-all"
                >
                  <div className="text-orange-300 font-bold text-sm">{opt.label}</div>
                  <div className="text-orange-600 text-[10px]">{opt.desc}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-orange-900 pb-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-orange-300 font-bold uppercase">Encounter Resolved</h2>
            </div>
            <p className="text-orange-400 text-sm leading-relaxed">{outcome.message}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {outcome.creditsChange !== 0 && (
                <div className={outcome.creditsChange > 0 ? 'text-green-400' : 'text-red-400'}>
                  CREDITS: {outcome.creditsChange > 0 ? '+' : ''}{outcome.creditsChange.toLocaleString()}
                </div>
              )}
              {outcome.damage > 0 && (
                <div className="text-red-400">HULL DAMAGE: -{outcome.damage.toFixed(1)}%</div>
              )}
              {outcome.cargoGained.length > 0 && (
                <div className="text-green-400">CARGO: {outcome.cargoGained.map(c => `${c.qty}x ${c.commodity.replace(/_/g, ' ')}`).join(', ')}</div>
              )}
              {outcome.cargoLost.length > 0 && (
                <div className="text-red-400">CARGO LOST: {outcome.cargoLost.map(c => c.replace(/_/g, ' ')).join(', ')}</div>
              )}
              {outcome.materialsGained.length > 0 && (
                <div className="text-cyan-400">MATERIALS: {outcome.materialsGained.map(m => `${m.qty}x ${m.materialId.replace(/_/g, ' ')}`).join(', ')}</div>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold"
            >
              CONTINUE
            </button>
          </>
        )}
      </div>
    </div>
  );
}