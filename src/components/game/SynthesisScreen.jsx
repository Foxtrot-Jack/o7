// Synthesis Screen — craft consumables and effects from raw materials
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { SYNTHESIS_RECIPES, canSynthesize } from '@/lib/synthesis';
import { MATERIAL_NAMES } from '@/lib/materialTrader';
import { FlaskConical, Check, X } from 'lucide-react';

export default function SynthesisScreen() {
  const { state, synthesize } = useGameState();
  const isSandbox = state.saveMode === 'sandbox';
  const [msg, setMsg] = useState('');
  const materials = state.materials || {};

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  const handleSynthesize = (recipeId) => {
    const result = synthesize(recipeId);
    if (result) {
      flash(`${result.name} synthesized! ${result.effectLabel}`);
    } else {
      flash('Not enough materials.');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Synthesis</h2>
      </div>

      {isSandbox && (
        <div className="border border-cyan-700 bg-cyan-950/20 p-2 text-center text-cyan-400 text-xs">
          SANDBOX: Synthesis is free — materials are not required or consumed.
        </div>
      )}
      <div className="text-orange-600 text-xs">
        Convert raw materials from your Ship Locker into consumable effects. {isSandbox ? 'In sandbox, nothing is consumed.' : 'Materials are consumed on synthesis.'}
      </div>

      {msg && (
        <div className="border border-orange-700 bg-orange-950/20 p-2 text-center text-orange-400 text-xs">
          {msg}
        </div>
      )}

      {/* FSD boost indicator */}
      {state.fsdBoost && (
        <div className="border border-cyan-700 bg-cyan-950/20 p-2 text-center text-cyan-400 text-xs flex items-center justify-center gap-2">
          <Check className="w-3 h-3" /> FSD INJECTION ACTIVE — Next jump has 2x range
        </div>
      )}

      <div className="space-y-3">
        {SYNTHESIS_RECIPES.map(recipe => {
          const can = isSandbox || canSynthesize(recipe, materials);
          return (
            <div key={recipe.id} className={`border p-3 space-y-2 ${can ? 'border-orange-900' : 'border-orange-950 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <span className="text-orange-300 font-bold text-sm">{recipe.name}</span>
                <span className="text-orange-500 text-[10px] border border-orange-900 px-1">{recipe.effectLabel}</span>
              </div>
              <p className="text-orange-600 text-xs">{recipe.desc}</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(recipe.inputs).map(([matId, qty]) => {
                  const have = materials[matId] || 0;
                  const enough = have >= qty;
                  return (
                    <span key={matId} className={`text-[10px] border px-1.5 py-0.5 flex items-center gap-1 ${enough ? 'border-green-800 text-green-500' : 'border-red-800 text-red-500'}`}>
                      {enough ? <Check className="w-2 h-2" /> : <X className="w-2 h-2" />}
                      {MATERIAL_NAMES[matId] || matId} ({have}/{qty})
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => handleSynthesize(recipe.id)}
                disabled={!can}
                className="w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30"
              >
                SYNTHESIZE
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}