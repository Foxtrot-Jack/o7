// Controller Config Screen — rebind keys and gamepad buttons with multi-bind support
import React, { useState, useEffect } from 'react';
import { Gamepad2, Plus, X, RotateCcw, Keyboard } from 'lucide-react';
import { inputSystem } from '@/lib/inputSystem';
import { KEYBIND_CATEGORIES } from '@/lib/keybinds';
import { soundEngine } from '@/lib/soundEngine';

export default function ControllerConfigScreen() {
  const [bindings, setBindings] = useState(inputSystem.getBindings());
  const [capturingAction, setCapturingAction] = useState(null);

  const refresh = () => setBindings({ ...inputSystem.getBindings() });

  const handleAddBinding = (actionId) => {
    soundEngine.play('click');
    setCapturingAction(actionId);
    inputSystem.startCapture((binding) => {
      if (binding) {
        // Auto-resolve conflicts: remove this binding from any other action
        const conflicts = inputSystem.findConflicts(binding, actionId);
        for (const cId of conflicts) {
          const result = inputSystem.findConflicts(binding, cId);
          if (result.length === 0) {
            // findConflicts returns action IDs, need the index
            const cBindings = inputSystem.getBindingsForAction(cId);
            for (let i = 0; i < cBindings.length; i++) {
              if (inputSystem._bindingEquals(cBindings[i], binding)) {
                inputSystem.removeBinding(cId, i);
                break;
              }
            }
          }
        }
        inputSystem.addBinding(actionId, binding);
        refresh();
      }
      setCapturingAction(null);
    });
  };

  const handleRemoveBinding = (actionId, index) => {
    soundEngine.play('back');
    inputSystem.removeBinding(actionId, index);
    refresh();
  };

  const handleResetAll = () => {
    if (confirm('Reset ALL keybindings to defaults?')) {
      soundEngine.play('click');
      inputSystem.resetToDefaults();
      refresh();
    }
  };

  const handleCancelCapture = () => {
    inputSystem.cancelCapture();
    setCapturingAction(null);
  };

  useEffect(() => {
    return () => inputSystem.cancelCapture();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase text-sm">Controller Configuration</span>
        </div>
        <button
          onClick={handleResetAll}
          className="px-2 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          RESET ALL
        </button>
      </div>

      {/* Instructions */}
      <div className="px-3 py-2 border-b border-orange-900/50 text-[10px] text-orange-700 leading-relaxed">
        Press <span className="text-orange-400">+ ADD</span> to bind a key or gamepad button.
        Each action supports multiple bindings for multi-controller support.
        Conflicts are auto-resolved. Press <span className="text-orange-400">ESC</span> to cancel capture.
      </div>

      {/* Binding list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {KEYBIND_CATEGORIES.map(category => (
          <div key={category.id}>
            <div className="text-orange-500 font-bold uppercase text-xs mb-1 border-b border-orange-900/50 pb-1">
              {category.icon} {category.label}
            </div>
            <div className="space-y-1">
              {category.actions.map(action => {
                const actionBindings = bindings[action.id] || [];
                return (
                  <div key={action.id} className="flex items-center justify-between gap-2 border border-orange-950/50 px-2 py-1.5">
                    <div className="text-orange-400 text-xs flex-1 min-w-0 truncate">{action.label}</div>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {actionBindings.map((binding, idx) => (
                        <span key={idx} className="flex items-center gap-1 border border-orange-800 bg-orange-950/30 px-1.5 py-0.5 text-[10px] text-orange-300">
                          {binding.type === 'gamepad' ? <Gamepad2 className="w-2.5 h-2.5" /> : <Keyboard className="w-2.5 h-2.5" />}
                          {inputSystem.formatBinding(binding)}
                          <button onClick={() => handleRemoveBinding(action.id, idx)} className="text-orange-700 hover:text-red-500 ml-0.5">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      {actionBindings.length === 0 && (
                        <span className="text-orange-800 text-[10px] italic">unbound</span>
                      )}
                      {capturingAction === action.id ? (
                        <button onClick={handleCancelCapture} className="border border-cyan-500 text-cyan-300 px-2 py-0.5 text-[10px] animate-pulse">
                          PRESS ANY KEY...
                        </button>
                      ) : (
                        <button onClick={() => handleAddBinding(action.id)} className="flex items-center gap-1 border border-orange-700 text-orange-500 hover:bg-orange-950/30 px-2 py-0.5 text-[10px]">
                          <Plus className="w-2.5 h-2.5" /> ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Capture overlay */}
      {capturingAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none">
          <div className="border border-cyan-700 bg-black p-6 text-center pointer-events-auto">
            <div className="text-cyan-300 font-bold uppercase text-sm mb-2">Awaiting Input</div>
            <div className="text-cyan-600 text-[10px] mb-3">Press any key or gamepad button to bind.</div>
            <button onClick={handleCancelCapture} className="px-3 py-1 border border-cyan-700 text-cyan-500 hover:bg-cyan-950/30 text-[10px]">
              CANCEL (ESC)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}