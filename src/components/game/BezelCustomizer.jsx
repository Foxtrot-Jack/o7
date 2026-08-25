// BezelCustomizer — modal for assigning actions to bezel button slots.
// Opened via long-press on any bezel button. Saves to settings.bezelLayout.
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { soundEngine } from '@/lib/soundEngine';
import { BEZEL_ACTIONS, BEZEL_ACTION_CATEGORIES, DEFAULT_LAYOUTS } from '@/lib/bezelContexts';

const SIDE_LABELS = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' };

export default function BezelCustomizer({ context, side, index, onClose }) {
  const { state, update } = useGameState();
  const [search, setSearch] = useState('');

  const bezelLayout = state.settings?.bezelLayout || {};
  const contextLayout = bezelLayout[context] || {};
  const currentSide = contextLayout[side] || DEFAULT_LAYOUTS[context]?.[side] || [];
  const currentActionId = currentSide[index];
  const currentAction = currentActionId ? BEZEL_ACTIONS[currentActionId] : null;

  const saveSlot = (actionId) => {
    soundEngine.play('click');
    const defaultSide = DEFAULT_LAYOUTS[context]?.[side] || [];
    const existing = contextLayout[side] ? [...contextLayout[side]] : [...defaultSide];
    while (existing.length <= index) existing.push(null);
    existing[index] = actionId;

    const newLayout = {
      ...bezelLayout,
      [context]: { ...contextLayout, [side]: existing },
    };
    update({ settings: { ...state.settings, bezelLayout: newLayout } });
    onClose();
  };

  const clearSlot = () => {
    soundEngine.play('back');
    const defaultSide = DEFAULT_LAYOUTS[context]?.[side] || [];
    const existing = contextLayout[side] ? [...contextLayout[side]] : [...defaultSide];
    while (existing.length <= index) existing.push(null);
    existing[index] = null;

    const newLayout = {
      ...bezelLayout,
      [context]: { ...contextLayout, [side]: existing },
    };
    update({ settings: { ...state.settings, bezelLayout: newLayout } });
    onClose();
  };

  const filteredCategories = BEZEL_ACTION_CATEGORIES.map(cat => ({
    ...cat,
    actions: cat.actions.filter(id => {
      if (!search) return true;
      const action = BEZEL_ACTIONS[id];
      return action && action.label.toLowerCase().includes(search.toLowerCase());
    }),
  })).filter(cat => cat.actions.length > 0);

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="border border-orange-800 bg-black max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-orange-900 p-3">
          <h3 className="text-orange-400 text-sm font-bold uppercase">
            {SIDE_LABELS[side]} #{index + 1} — {context}
          </h3>
          <button onClick={onClose} className="text-orange-700 hover:text-orange-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-orange-900">
          <div className="text-orange-700 text-[10px] uppercase mb-1">Current</div>
          <div className="text-orange-400 text-xs">
            {currentAction ? currentAction.label : 'Empty slot'}
          </div>
          {currentAction && (
            <button onClick={clearSlot} className="mt-2 text-[10px] text-red-700 hover:text-red-500 border border-red-900 px-2 py-0.5">
              CLEAR SLOT
            </button>
          )}
        </div>

        <div className="p-3 border-b border-orange-900">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actions..."
            className="w-full bg-black border border-orange-900 px-2 py-1 text-xs text-orange-400 placeholder-orange-800 outline-none focus:border-orange-500"
          />
        </div>

        <div className="p-2 space-y-2">
          {filteredCategories.map(cat => (
            <div key={cat.id}>
              <div className="text-orange-700 text-[10px] uppercase mb-1">{cat.label}</div>
              <div className="grid grid-cols-2 gap-1">
                {cat.actions.map(actionId => {
                  const action = BEZEL_ACTIONS[actionId];
                  if (!action) return null;
                  const Icon = action.icon;
                  const isCurrent = currentActionId === actionId;
                  return (
                    <button
                      key={actionId}
                      onClick={() => saveSlot(actionId)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-left border ${
                        isCurrent ? 'border-orange-500 text-orange-300 bg-orange-950/30'
                          : 'border-orange-950 text-orange-600 hover:bg-orange-950/20 hover:text-orange-400'
                      }`}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}