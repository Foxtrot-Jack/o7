// Genetics Lab — edit fish and flora specimens
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { hasRoomType } from '@/lib/cabinRooms';
import { SPECIMEN_PATTERNS, PART_SHAPES, MAX_FISH_PARTS, MAX_FLORA_PARTS, getPartStyle } from '@/lib/specimens';
import { FlaskConical, Fish, Leaf, Save, Lock } from 'lucide-react';

export default function GeneticsLabScreen() {
  const { state, isSandbox, editSpecimen } = useGameState();
  const [specimenType, setSpecimenType] = useState('fish');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [msg, setMsg] = useState(null);

  // Check if any carrier has a genetics room
  const hasGeneticsRoom = (state.fleetCarriers || []).some(c => hasRoomType('carrier', c.id, 'genetics', state));
  const EDIT_COST = 50000;

  if (!hasGeneticsRoom && !isSandbox) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Lock className="w-8 h-8 text-orange-700 mx-auto" />
          <div className="text-orange-500 text-xs font-bold uppercase">Genetics Lab Locked</div>
          <div className="text-orange-700 text-[10px] max-w-xs">Build a Genetics Lab room on a fleet carrier to unlock specimen editing.</div>
        </div>
      </div>
    );
  }

  const collected = specimenType === 'fish'
    ? (state.aquaticLife?.collected || [])
    : (state.floraCollection?.collected || []);

  const selected = collected.find(s => s.id === selectedId);
  const activeDraft = draft || selected;

  const handleSelect = (id) => {
    setSelectedId(id);
    setDraft(null);
  };

  const handleChange = (field, value) => {
    setDraft(prev => {
      const base = prev || selected;
      if (!base) return null;
      return { ...base, [field]: value };
    });
  };

  const handleColorChange = (channel, value) => {
    setDraft(prev => {
      const base = prev || selected;
      if (!base) return null;
      const color = [...(base.color || [128, 128, 128])];
      color[channel] = value;
      return { ...base, color };
    });
  };

  const handleSave = () => {
    if (!activeDraft || !selectedId) return;
    editSpecimen(selectedId, specimenType, {
      color: activeDraft.color,
      size: activeDraft.size,
      pattern: activeDraft.pattern,
      species: activeDraft.species,
    });
    setMsg('Specimen modified successfully!');
    setDraft(null);
    setTimeout(() => setMsg(null), 3000);
  };

  const hasChanges = draft && JSON.stringify(draft) !== JSON.stringify(selected);

  return (
    <div className="w-full h-full overflow-auto p-3 space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-orange-500" />
        <span className="text-orange-400 text-xs font-bold">GENETICS LAB</span>
      </div>

      {/* Specimen type selector */}
      <div className="flex gap-1">
        <button onClick={() => { setSpecimenType('fish'); setSelectedId(null); setDraft(null); }} className={`flex items-center gap-1 px-3 py-1.5 text-[10px] border ${specimenType === 'fish' ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-600'}`}>
          <Fish className="w-3 h-3" /> FISH ({(state.aquaticLife?.collected || []).length})
        </button>
        <button onClick={() => { setSpecimenType('flora'); setSelectedId(null); setDraft(null); }} className={`flex items-center gap-1 px-3 py-1.5 text-[10px] border ${specimenType === 'flora' ? 'border-green-500 text-green-300 bg-green-950/20' : 'border-orange-900 text-orange-600'}`}>
          <Leaf className="w-3 h-3" /> FLORA ({(state.floraCollection?.collected || []).length})
        </button>
      </div>

      {collected.length === 0 ? (
        <div className="text-center text-orange-700 text-[10px] py-8">
          No {specimenType === 'fish' ? 'aquatic life' : 'flora'} collected yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Specimen list */}
          <div className="w-full sm:w-48 space-y-0.5 max-h-64 sm:max-h-96 overflow-y-auto">
            {collected.map(s => {
              const [r, g, b] = s.color;
              return (
                <button key={s.id} onClick={() => handleSelect(s.id)} className={`flex items-center gap-2 w-full px-2 py-1 text-[10px] border text-left ${selectedId === s.id ? 'border-green-600 text-green-400 bg-green-950/20' : 'border-orange-950 text-orange-600 hover:text-orange-400'}`}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: `rgb(${r},${g},${b})` }} />
                  <span className="truncate">{s.species}</span>
                  {s.edited && <span className="text-[8px] text-cyan-700">★</span>}
                </button>
              );
            })}
          </div>

          {/* Editor */}
          {activeDraft ? (
            <div className="flex-1 space-y-2">
              {msg && <div className="text-green-500 text-[10px] border border-green-900 bg-green-950/20 py-1 px-2">{msg}</div>}

              {/* Preview */}
              <div className="flex items-center gap-3 border border-orange-900 p-2">
                <div className="flex items-end flex-shrink-0">
                  {(activeDraft.parts || [{ shape: 'sphere', size: 1 }]).map((part, i) => (
                    <div key={i} style={getPartStyle(part.shape, part.size * activeDraft.size * 0.6, activeDraft.color)} className={i > 0 ? '-ml-1' : ''} />
                  ))}
                </div>
                <div>
                  <div className="text-orange-300 text-[10px]">{activeDraft.species}</div>
                  <div className="text-orange-700 text-[8px]">{activeDraft.originBody}</div>
                </div>
              </div>

              {/* Species name */}
              <div>
                <label className="text-[9px] text-orange-600">Species Name</label>
                <input type="text" value={activeDraft.species} onChange={(e) => handleChange('species', e.target.value)} className="w-full bg-black border border-orange-900 text-orange-400 text-[10px] px-2 py-1" />
              </div>

              {/* Color RGB */}
              <div className="border border-orange-950 p-2 space-y-1">
                <div className="text-orange-700 text-[9px] uppercase">Color</div>
                <div>
                  <label className="text-[9px] text-red-500">R: {activeDraft.color[0]}</label>
                  <input type="range" min="0" max="255" value={activeDraft.color[0]} onChange={(e) => handleColorChange(0, parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-green-500">G: {activeDraft.color[1]}</label>
                  <input type="range" min="0" max="255" value={activeDraft.color[1]} onChange={(e) => handleColorChange(1, parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-blue-500">B: {activeDraft.color[2]}</label>
                  <input type="range" min="0" max="255" value={activeDraft.color[2]} onChange={(e) => handleColorChange(2, parseInt(e.target.value))} className="w-full" />
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="text-[9px] text-orange-600">Size: {activeDraft.size.toFixed(1)}x</label>
                <input type="range" min="0.3" max="3" step="0.1" value={activeDraft.size} onChange={(e) => handleChange('size', parseFloat(e.target.value))} className="w-full" />
              </div>

              {/* Pattern */}
              <div>
                <label className="text-[9px] text-orange-600 uppercase">Pattern</label>
                <div className="flex flex-wrap gap-1">
                  {SPECIMEN_PATTERNS.map(p => (
                    <button key={p} onClick={() => handleChange('pattern', p)} className={`px-2 py-0.5 text-[9px] border ${activeDraft.pattern === p ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parts editor */}
              <div className="border border-orange-950 p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-orange-700 text-[9px] uppercase">Parts ({(activeDraft.parts || []).length}/{specimenType === 'fish' ? MAX_FISH_PARTS : MAX_FLORA_PARTS})</span>
                  {(activeDraft.parts || []).length < (specimenType === 'fish' ? MAX_FISH_PARTS : MAX_FLORA_PARTS) && (
                    <button onClick={() => handleChange('parts', [...(activeDraft.parts || []), { id: `part_${Date.now()}`, shape: 'sphere', size: 1.0 }])} className="px-2 py-0.5 border border-green-700 text-green-500 text-[9px]">+ ADD PART</button>
                  )}
                </div>
                {(activeDraft.parts || []).map((part, i) => (
                  <div key={part.id || i} className="flex items-center gap-1 border border-orange-950 p-1">
                    <span className="text-[9px] text-orange-600 w-3">{i + 1}</span>
                    <select value={part.shape} onChange={(e) => { const np = [...(activeDraft.parts || [])]; np[i] = { ...part, shape: e.target.value }; handleChange('parts', np); }} className="bg-black border border-orange-900 text-orange-400 text-[9px] px-1 py-0.5 flex-1">
                      {PART_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="range" min="0.3" max="2" step="0.1" value={part.size} onChange={(e) => { const np = [...(activeDraft.parts || [])]; np[i] = { ...part, size: parseFloat(e.target.value) }; handleChange('parts', np); }} className="w-12" />
                    <button onClick={() => handleChange('parts', (activeDraft.parts || []).filter((_, idx) => idx !== i))} className="px-1 py-0.5 border border-red-800 text-red-500 text-[9px]">✕</button>
                  </div>
                ))}
              </div>

              {/* Save */}
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={!hasChanges} className="flex-1 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-40">
                  <Save className="w-3 h-3" /> {isSandbox ? 'APPLY (FREE)' : `APPLY (${EDIT_COST.toLocaleString()} CR)`}
                </button>
                {hasChanges && (
                  <button onClick={() => setDraft(null)} className="px-3 py-1.5 border border-orange-900 text-orange-600 text-[10px]">RESET</button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-orange-700 text-[10px]">
              Select a specimen to edit
            </div>
          )}
        </div>
      )}
    </div>
  );
}