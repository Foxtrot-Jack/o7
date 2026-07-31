// Loadout Presets — save and apply module configurations
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { createPreset, getModuleSummary, canApplyPreset, PRESET_SUGGESTIONS } from '@/lib/loadoutPresets';
import { Save, Upload, Trash2, Package, Layers } from 'lucide-react';

export default function LoadoutPresetScreen() {
  const { state, update, isSandbox } = useGameState();
  const presets = state.loadoutPresets || [];
  const [presetName, setPresetName] = useState('');
  const isDocked = state.currentLocation === 'station';

  const handleSave = () => {
    if (!presetName.trim()) return;
    const preset = createPreset(presetName, state.ship.type, state.ship.modules);
    update(prev => ({ ...prev, loadoutPresets: [...(prev.loadoutPresets || []), preset] }));
    setPresetName('');
  };

  const handleApply = (preset) => {
    if (!canApplyPreset(preset, state.ship.type)) return;
    if (!isDocked) return;
    update(prev => ({
      ...prev,
      ship: { ...prev.ship, modules: { ...preset.modules } },
    }));
  };

  const handleDelete = (presetId) => {
    update(prev => ({ ...prev, loadoutPresets: prev.loadoutPresets.filter(p => p.id !== presetId) }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Save className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Loadout Presets</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Save your current module configuration as a named preset. Apply presets instantly at stations to switch between exploration, combat, cargo, and mining builds.</div>
      </div>

      {/* Save current */}
      <div className="border border-orange-900 p-3 space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Save Current Loadout</h3>
        <div className="text-[10px] text-orange-700">Ship: {state.ship.name} ({state.ship.type})</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Preset name (e.g. Exploration Build)"
            value={presetName}
            onChange={e => setPresetName(e.target.value)}
            className="flex-1 bg-black border border-orange-900 text-orange-400 text-xs px-2 py-1"
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold disabled:opacity-30 flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> SAVE
          </button>
        </div>
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1">
          {PRESET_SUGGESTIONS.map(s => (
            <button key={s.name} onClick={() => setPresetName(s.name)} className="text-[9px] border border-orange-950 text-orange-600 hover:text-orange-400 px-1.5 py-0.5" title={s.desc}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Saved presets */}
      {presets.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Saved Presets</h3>
          {presets.map(preset => {
            const summary = getModuleSummary(preset.modules);
            const compatible = canApplyPreset(preset, state.ship.type);
            return (
              <div key={preset.id} className={`border p-3 space-y-2 ${compatible ? 'border-orange-900' : 'border-red-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-orange-500" />
                    <div>
                      <div className="text-orange-300 text-xs font-bold">{preset.name}</div>
                      <div className="text-[9px] text-orange-700">{preset.shipType}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleApply(preset)}
                      disabled={!compatible || !isDocked}
                      className="px-2 py-1 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[9px] font-bold disabled:opacity-30 flex items-center gap-1"
                      title={!compatible ? 'Wrong ship type' : !isDocked ? 'Dock to apply' : 'Apply preset'}
                    >
                      <Upload className="w-3 h-3" /> APPLY
                    </button>
                    <button onClick={() => handleDelete(preset.id)} className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[9px]">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {!compatible && <div className="text-[9px] text-red-500">⚠ Ship type mismatch — saved for {preset.shipType}</div>}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(summary).map(([type, count]) => (
                    <span key={type} className="text-[9px] border border-orange-950 text-orange-600 px-1.5 py-0.5 flex items-center gap-0.5">
                      <Package className="w-2 h-2 inline" /> {type} ×{count}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-orange-900 p-4 text-center text-orange-600 text-xs">
          <Save className="w-6 h-6 mx-auto mb-1 opacity-50" />
          No saved presets. Name and save your current module configuration above.
        </div>
      )}
      {!isDocked && <div className="text-[10px] text-orange-700 text-center">⚠ Dock at a station to apply presets.</div>}
    </div>
  );
}