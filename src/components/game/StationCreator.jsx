// Station Creator — design custom stations with parts, surface & orbital variants
// No part limit: unlimited modules can be added
import React, { useState, useCallback, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import {
  STATION_TYPES, STATION_SLOTS, STATION_PART_MAP,
  getStationPartsForSlot, getStationModuleParts,
  createEmptyStationDesign, addModuleToDesign, removeModuleFromDesign,
  getAllStationSlots, computeStationStats,
} from '@/lib/stationParts';
import ShipBuilder3D from './ShipBuilder3D';
import { encodeShareCode, decodeShareCode } from '@/lib/badgeUtils';
import { Hammer, Save, Trash2, Box, Building, Plus, Share2, Download, Check, Copy, X } from 'lucide-react';

export default function StationCreator() {
  const { state, isSandbox, saveCustomStationDesign, deleteCustomStationDesign, applyStationDesign } = useGameState();
  const [tab, setTab] = useState('builder');
  const [design, setDesign] = useState(createEmptyStationDesign('orbital'));
  const [selectedSlot, setSelectedSlot] = useState('core');
  const [stationName, setStationName] = useState('Untitled Station');

  const ownedStations = state.ownedStations || [];
  const stationsHere = ownedStations.filter(s => s.systemSeed === state.currentSystem?.seed);

  const allSlots = useMemo(() => getAllStationSlots(design), [design]);

  const handleTypeChange = useCallback((type) => {
    setDesign(prev => {
      const newDesign = { ...prev, type, parts: {}, moduleSlots: [] };
      const fresh = createEmptyStationDesign(type);
      return { ...fresh, name: prev.name };
    });
  }, []);

  const handlePartSelect = useCallback((slotId, partId) => {
    setDesign(prev => ({
      ...prev,
      parts: { ...prev.parts, [slotId]: { ...prev.parts[slotId], partId } },
    }));
  }, []);

  const handleScaleChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const p = prev.parts[slotId]; const s = [...(p.scale || [1,1,1])]; s[axis] = value;
      return { ...prev, parts: { ...prev.parts, [slotId]: { ...p, scale: s } } };
    });
  }, []);
  const handlePositionChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const p = prev.parts[slotId]; const s = [...(p.position || [0,0,0])]; s[axis] = value;
      return { ...prev, parts: { ...prev.parts, [slotId]: { ...p, position: s } } };
    });
  }, []);
  const handleRotationChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const p = prev.parts[slotId]; const s = [...(p.rotation || [0,0,0])]; s[axis] = value;
      return { ...prev, parts: { ...prev.parts, [slotId]: { ...p, rotation: s } } };
    });
  }, []);
  const handleClearSlot = useCallback((slotId) => {
    setDesign(prev => ({ ...prev, parts: { ...prev.parts, [slotId]: { ...prev.parts[slotId], partId: null } } }));
  }, []);

  const handleAddModule = useCallback(() => {
    setDesign(prev => addModuleToDesign(prev));
  }, []);

  const handleRemoveModule = useCallback((moduleId) => {
    setDesign(prev => removeModuleFromDesign(prev, moduleId));
    if (selectedSlot === moduleId) setSelectedSlot('core');
  }, [selectedSlot]);

  const handleSave = () => {
    saveCustomStationDesign({ ...design, name: stationName });
    setTab('saved');
  };
  const handleLoadDesign = (saved) => {
    setDesign({ name: saved.name, type: saved.type || 'orbital', parts: saved.parts, moduleSlots: saved.moduleSlots || [] });
    setStationName(saved.name);
    setTab('builder');
  };

  const stats = computeStationStats(design);

  if (ownedStations.length === 0 && !isSandbox) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Building className="w-10 h-10 mx-auto text-orange-700 opacity-50" />
          <p className="text-orange-500 text-sm font-bold uppercase">Station Yard Locked</p>
          <p className="text-orange-700 text-xs max-w-xs">You must own a station before you can design custom station configurations. Build one at the Station Builder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-1 border-b border-orange-900/50 p-1 flex-wrap">
        <TabButton active={tab === 'builder'} onClick={() => setTab('builder')} icon={Hammer} label="Builder" />
        <TabButton active={tab === 'saved'} onClick={() => setTab('saved')} icon={Box} label={`Saved (${state.customStationDesigns?.length || 0})`} />
      </div>

      {tab === 'builder' && (
        <BuilderTab
          design={design} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot}
          allSlots={allSlots}
          onTypeChange={handleTypeChange}
          onPartSelect={handlePartSelect} onScaleChange={handleScaleChange} onPositionChange={handlePositionChange}
          onRotationChange={handleRotationChange} onClearSlot={handleClearSlot}
          onAddModule={handleAddModule} onRemoveModule={handleRemoveModule}
          stationName={stationName} setStationName={setStationName}
          stats={stats} onSave={handleSave} isSandbox={isSandbox}
        />
      )}

      {tab === 'saved' && (
        <SavedStationsTab
          designs={state.customStationDesigns || []}
          stations={stationsHere}
          onLoad={handleLoadDesign}
          onDelete={deleteCustomStationDesign}
          onApply={applyStationDesign}
        />
      )}
    </div>
  );
}

function BuilderTab({ design, selectedSlot, onSelectSlot, allSlots, onTypeChange, onPartSelect, onScaleChange, onPositionChange, onRotationChange, onClearSlot, onAddModule, onRemoveModule, stationName, setStationName, stats, onSave, isSandbox }) {
  const slot = allSlots.find(s => s.id === selectedSlot);
  const isModule = slot?.category === 'module';
  const availableParts = isModule
    ? getStationModuleParts(design.type)
    : getStationPartsForSlot(selectedSlot, design.type);
  const currentPart = design.parts[selectedSlot]?.partId ? STATION_PART_MAP[design.parts[selectedSlot].partId] : null;
  const currentScale = design.parts[selectedSlot]?.scale || [1, 1, 1];
  const currentPosition = design.parts[selectedSlot]?.position || [0, 0, 0];
  const currentRotation = design.parts[selectedSlot]?.rotation || [0, 0, 0];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <div className="flex-1 min-h-[200px] border-b lg:border-b-0 lg:border-r border-orange-900/50">
        <ShipBuilder3D design={design} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot}
          slots={allSlots} partMap={STATION_PART_MAP} initialDistance={14} />
      </div>

      <div className="w-full lg:w-72 flex-shrink-0 overflow-y-auto p-3 space-y-3 max-h-[50vh] lg:max-h-none">
        {/* Station type toggle */}
        <div>
          <div className="text-orange-700 text-[10px] uppercase mb-1">Station Type</div>
          <div className="flex gap-1">
            {STATION_TYPES.map(t => (
              <button key={t.id} onClick={() => onTypeChange(t.id)}
                className={`flex-1 px-2 py-1 border text-[10px] ${design.type === t.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Slots + modules */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-orange-700 text-[10px] uppercase">Mount Slots</span>
            <button onClick={onAddModule} className="flex items-center gap-0.5 px-1.5 py-0.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[9px]">
              <Plus className="w-2.5 h-2.5" /> ADD MODULE
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
            {allSlots.map(s => (
              <div key={s.id} className="flex items-center">
                <button onClick={() => onSelectSlot(s.id)}
                  className={`flex-1 px-2 py-1 border text-[10px] text-left ${selectedSlot === s.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>
                  {s.label}
                  {design.parts[s.id]?.partId && <span className="text-green-600 ml-1">●</span>}
                </button>
                {s.category === 'module' && (
                  <button onClick={() => onRemoveModule(s.id)} className="px-1 border border-red-900 text-red-600 hover:bg-red-950/30 text-[9px]">
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="text-cyan-700 text-[9px] mt-1">Modules: {(design.moduleSlots || []).length} — No limit!</div>
        </div>

        {/* Part selector */}
        <div>
          <div className="text-orange-700 text-[10px] uppercase mb-1">{slot?.label} — Parts</div>
          {availableParts.length === 0 ? (
            <div className="text-orange-800 text-[10px]">No parts available for this type.</div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {availableParts.map(p => (
                <button key={p.id} onClick={() => onPartSelect(selectedSlot, p.id)}
                  className={`w-full px-2 py-1 border text-[10px] text-left flex justify-between ${design.parts[selectedSlot]?.partId === p.id ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}>
                  <span>{p.name}</span>
                  <span className="text-orange-800">{(p.cost / 1e6).toFixed(1)}M</span>
                </button>
              ))}
              {currentPart && <button onClick={() => onClearSlot(selectedSlot)} className="w-full px-2 py-1 border border-red-900 text-red-600 text-[10px] hover:bg-red-950/30">REMOVE PART</button>}
            </div>
          )}
        </div>

        {/* Transform controls */}
        {currentPart && (
          <div className="border border-orange-900 p-2">
            <div className="grid grid-cols-3 gap-x-2 gap-y-2">
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">Resize</div>
                {['X', 'Y', 'Z'].map((a, i) => (
                  <div key={a}>
                    <div className="flex justify-between text-[9px] text-orange-700"><span>SCL {a}</span><span>{currentScale[i].toFixed(1)}x</span></div>
                    <input type="range" min="0.3" max="4" step="0.1" value={currentScale[i]} onChange={e => onScaleChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">Move</div>
                {['X', 'Y', 'Z'].map((a, i) => (
                  <div key={a}>
                    <div className="flex justify-between text-[9px] text-orange-700"><span>POS {a}</span><span>{currentPosition[i].toFixed(1)}</span></div>
                    <input type="range" min="-5" max="5" step="0.1" value={currentPosition[i]} onChange={e => onPositionChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">Rotate</div>
                {['X', 'Y', 'Z'].map((a, i) => (
                  <div key={a}>
                    <div className="flex justify-between text-[9px] text-orange-700"><span>ROT {a}</span><span>{currentRotation[i].toFixed(0)}°</span></div>
                    <input type="range" min="-180" max="180" step="5" value={currentRotation[i]} onChange={e => onRotationChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="border border-orange-900 p-2 space-y-1 text-[10px]">
          <div className="text-orange-700 uppercase">Station Stats</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-orange-600">
            <div>DOCKS: <span className="text-orange-300">{stats.dockCapacity}</span></div>
            <div>POP: <span className="text-orange-300">{stats.population.toLocaleString()}</span></div>
            <div>POWER: <span className="text-orange-300">{stats.powerOutput}</span></div>
            <div>DEFENSE: <span className="text-orange-300">{stats.defenseRating}</span></div>
            <div>COMM: <span className="text-orange-300">{stats.commRange}</span></div>
            <div>CARGO: <span className="text-orange-300">{stats.cargoStorage}T</span></div>
            <div className="col-span-2">REVENUE: <span className="text-green-400">{stats.revenuePerHour.toLocaleString()} CR/hr</span></div>
            <div className="col-span-2">COST: <span className="text-orange-300">{stats.cost.toLocaleString()} CR</span></div>
          </div>
        </div>

        {/* Save */}
        <div className="space-y-2">
          <input type="text" value={stationName} onChange={e => setStationName(e.target.value)} placeholder="Station name..." className="w-full bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500" />
          <button onClick={onSave} disabled={!stationName.trim()} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30">
            <Save className="w-3.5 h-3.5" /> SAVE DESIGN
          </button>
        </div>
        {isSandbox && <div className="text-cyan-600 text-[9px] text-center">SANDBOX: ALL PARTS UNLOCKED</div>}
      </div>
    </div>
  );
}

function SavedStationsTab({ designs, stations, onLoad, onDelete, onApply }) {
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = (d) => { setShareCode(encodeShareCode({ _type: 'station', name: d.name, type: d.type, parts: d.parts, moduleSlots: d.moduleSlots }) || ''); };
  const handleCopy = () => { if (!shareCode) return; navigator.clipboard?.writeText(shareCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleImport = () => {
    setImportError('');
    const decoded = decodeShareCode(importCode);
    if (!decoded || decoded._type !== 'station' || !decoded.parts) {
      setImportError('Invalid station blueprint code.');
      return;
    }
    onApply(null, { name: decoded.name || 'Imported Station', type: decoded.type || 'orbital', parts: decoded.parts, moduleSlots: decoded.moduleSlots || [] });
    setImportCode('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h3 className="text-orange-500 text-sm font-bold uppercase">Saved Station Designs</h3>
      {designs.length === 0 ? (
        <div className="text-center text-orange-700 text-xs py-4">
          <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No saved station designs. Build one in the Builder tab.
        </div>
      ) : (
        <div className="space-y-2">
          {designs.map(d => {
            const stats = computeStationStats(d);
            return (
              <div key={d.id} className="border border-orange-900 p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-orange-300 font-bold">{d.name}</span>
                  <span className="text-[9px] text-orange-700 uppercase">{d.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-orange-600 mb-2">
                  <div>DOCKS: <span className="text-orange-300">{stats.dockCapacity}</span></div>
                  <div>POP: <span className="text-orange-300">{stats.population}</span></div>
                  <div>REV: <span className="text-green-400">{(stats.revenuePerHour/1000).toFixed(0)}K/hr</span></div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => onLoad(d)} className="flex-1 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px]">EDIT</button>
                  {stations.length > 0 && (
                    <select onChange={e => { if (e.target.value) { onApply(e.target.value, { name: d.name, type: d.type, parts: d.parts, moduleSlots: d.moduleSlots }); e.target.value = ''; } }} defaultValue="" className="px-1 py-1 border border-green-600 text-green-400 bg-black text-[10px]">
                      <option value="">APPLY TO...</option>
                      {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                  <button onClick={() => handleShare(d)} className="px-2 py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-[10px] flex items-center gap-1"><Share2 className="w-3 h-3" /> SHARE</button>
                  <button onClick={() => onDelete(d.id)} className="px-2 py-1 border border-red-900 text-red-600 hover:bg-red-950/30 text-[10px]"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shareCode && (
        <div className="border border-cyan-900 p-2 space-y-1">
          <div className="text-cyan-500 text-[10px] uppercase">Station Share Code</div>
          <textarea readOnly value={shareCode} className="w-full h-12 bg-black border border-cyan-900 text-cyan-400 p-1.5 text-[9px] resize-none outline-none" />
          <button onClick={handleCopy} className="w-full py-1 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[10px] flex items-center justify-center gap-1">
            {copied ? <><Check className="w-3 h-3" /> COPIED!</> : <><Copy className="w-3 h-3" /> COPY CODE</>}
          </button>
        </div>
      )}

      <div className="border border-green-900 p-2 space-y-1">
        <div className="text-green-500 text-[10px] uppercase flex items-center gap-1"><Download className="w-3 h-3" /> Import Blueprint</div>
        <textarea value={importCode} onChange={e => setImportCode(e.target.value)} placeholder="Paste a station blueprint code here..." className="w-full h-12 bg-black border border-green-900 text-green-400 p-1.5 text-[9px] resize-none outline-none focus:border-green-500" />
        {importError && <div className="text-red-500 text-[10px]">{importError}</div>}
        <button onClick={handleImport} disabled={!importCode.trim()} className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-30">IMPORT BLUEPRINT</button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all ${active ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-transparent text-orange-700 hover:text-orange-500'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}