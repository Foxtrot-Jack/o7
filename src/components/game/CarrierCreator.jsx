// Carrier Creator — design custom fleet carriers with structural elements
import React, { useState, useCallback, useMemo } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { CARRIER_SLOTS, CARRIER_PART_MAP, getCarrierPartsForSlot, createEmptyCarrierDesign, computeCarrierStats } from '@/lib/carrierParts';
import ShipBuilder3D from './ShipBuilder3D';
import { encodeShareCode, decodeShareCode } from '@/lib/badgeUtils';
import { Hammer, Save, Trash2, Box, Anchor, Share2, Download, Check, Copy } from 'lucide-react';

export default function CarrierCreator() {
  const { state, isSandbox, saveCustomCarrierDesign, deleteCustomCarrierDesign, applyCarrierDesign } = useGameState();
  const [tab, setTab] = useState('builder');
  const [design, setDesign] = useState(createEmptyCarrierDesign());
  const [selectedSlot, setSelectedSlot] = useState('hull');
  const [carrierName, setCarrierName] = useState('Untitled Carrier');

  const hasGuilded = (state.fleetCarriers || []).some(c => c.isGuilded);
  const level = isSandbox || hasGuilded ? 5 : (state.shipyard ? Math.min(5, Math.floor(state.shipyard.infrastructure / 20)) : 0);
  const allSlots = useMemo(() => {
    const extras = (design.extraSlots || []).map(s => ({ id: s.id, label: s.id.replace('struct_extra_', 'Extra '), category: 'structural', pos: s.pos }));
    return [...CARRIER_SLOTS, ...extras];
  }, [design.extraSlots]);

  const handleAddExtraSlot = useCallback(() => {
    setDesign(prev => {
      const newSlot = { id: `struct_extra_${Date.now()}`, pos: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 4] };
      return {
        ...prev,
        extraSlots: [...(prev.extraSlots || []), newSlot],
        parts: { ...prev.parts, [newSlot.id]: { partId: null, scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] } },
      };
    });
  }, []);

  const handlePartSelect = useCallback((slotId, partId) => {
    setDesign(prev => ({ ...prev, parts: { ...prev.parts, [slotId]: { ...prev.parts[slotId], partId } } }));
  }, []);

  const handleScaleChange = useCallback((slotId, axis, value) => {
    setDesign(prev => { const p = prev.parts[slotId]; const s = [...(p.scale || [1,1,1])]; s[axis] = value; return { ...prev, parts: { ...prev.parts, [slotId]: { ...p, scale: s } } }; });
  }, []);
  const handlePositionChange = useCallback((slotId, axis, value) => {
    setDesign(prev => { const p = prev.parts[slotId]; const s = [...(p.position || [0,0,0])]; s[axis] = value; return { ...prev, parts: { ...prev.parts, [slotId]: { ...p, position: s } } }; });
  }, []);
  const handleRotationChange = useCallback((slotId, axis, value) => {
    setDesign(prev => { const p = prev.parts[slotId]; const s = [...(p.rotation || [0,0,0])]; s[axis] = value; return { ...prev, parts: { ...prev.parts, [slotId]: { ...p, rotation: s } } }; });
  }, []);
  const handleClearSlot = useCallback((slotId) => {
    setDesign(prev => ({ ...prev, parts: { ...prev.parts, [slotId]: { partId: null, scale: [1,1,1] } } }));
  }, []);

  if ((state.fleetCarriers || []).length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Anchor className="w-10 h-10 mx-auto text-orange-700 opacity-50" />
          <p className="text-orange-500 text-sm font-bold uppercase">Carrier Yard Locked</p>
          <p className="text-orange-700 text-xs max-w-xs">You must own a Fleet Carrier before you can design custom carrier configurations.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => { saveCustomCarrierDesign({ ...design, name: carrierName }); setTab('saved'); };
  const handleLoadDesign = (saved) => { setDesign({ name: saved.name, parts: saved.parts }); setCarrierName(saved.name); setTab('builder'); };

  const stats = computeCarrierStats(design);
  const carriersHere = state.fleetCarriers.filter(c => c.systemSeed === state.currentSystem.seed);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-1 border-b border-orange-900/50 p-1 flex-wrap">
        <TabButton active={tab === 'builder'} onClick={() => setTab('builder')} icon={Hammer} label="Builder" />
        <TabButton active={tab === 'saved'} onClick={() => setTab('saved')} icon={Box} label={`Saved (${state.customCarrierDesigns?.length || 0})`} />
      </div>

      {tab === 'builder' && (
        <BuilderTab
          design={design} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot}
          onPartSelect={handlePartSelect} onScaleChange={handleScaleChange} onPositionChange={handlePositionChange}
          onRotationChange={handleRotationChange} onClearSlot={handleClearSlot}
          carrierName={carrierName} setCarrierName={setCarrierName} stats={stats} onSave={handleSave} level={level} isSandbox={isSandbox}
          slots={allSlots} hasGuilded={hasGuilded} onAddExtraSlot={handleAddExtraSlot}
        />
      )}

      {tab === 'saved' && (
        <SavedCarriersTab
          designs={state.customCarrierDesigns || []}
          carriers={carriersHere}
          onLoad={handleLoadDesign}
          onDelete={deleteCustomCarrierDesign}
          onApply={applyCarrierDesign}
        />
      )}
    </div>
  );
}

function BuilderTab({ design, selectedSlot, onSelectSlot, onPartSelect, onScaleChange, onPositionChange, onRotationChange, onClearSlot, carrierName, setCarrierName, stats, onSave, level, isSandbox, slots, hasGuilded, onAddExtraSlot }) {
  const slot = slots.find(s => s.id === selectedSlot);
  const availableParts = getCarrierPartsForSlot(selectedSlot, level);
  const currentPart = design.parts[selectedSlot]?.partId ? CARRIER_PART_MAP[design.parts[selectedSlot].partId] : null;
  const currentScale = design.parts[selectedSlot]?.scale || [1, 1, 1];
  const currentPosition = design.parts[selectedSlot]?.position || [0, 0, 0];
  const currentRotation = design.parts[selectedSlot]?.rotation || [0, 0, 0];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <div className="flex-1 min-h-[200px] border-b lg:border-b-0 lg:border-r border-orange-900/50">
        <ShipBuilder3D design={design} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot}
          slots={slots} partMap={CARRIER_PART_MAP} initialDistance={12} />
      </div>

      <div className="w-full lg:w-72 flex-shrink-0 overflow-y-auto p-3 space-y-3 max-h-[50vh] lg:max-h-none">
        <div>
          <div className="text-orange-700 text-[10px] uppercase mb-1">Mount Slots</div>
          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
            {slots.map(s => (
              <button key={s.id} onClick={() => onSelectSlot(s.id)}
                className={`px-2 py-1 border text-[10px] text-left ${selectedSlot === s.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>
                {s.label}
                {design.parts[s.id]?.partId && <span className="text-green-600 ml-1">●</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-orange-700 text-[10px] uppercase mb-1">{slot?.label} — Parts</div>
          {availableParts.length === 0 ? (
            <div className="text-orange-800 text-[10px]">No parts at this level. Upgrade your shipyard.</div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {availableParts.map(p => (
                <button key={p.id} onClick={() => onPartSelect(selectedSlot, p.id)}
                  className={`w-full px-2 py-1 border text-[10px] text-left flex justify-between ${design.parts[selectedSlot]?.partId === p.id ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}>
                  <span>{p.name}</span>
                  <span className="text-orange-800">{p.unlockLevel === 0 ? '✓' : `Lv${p.unlockLevel}`}</span>
                </button>
              ))}
              {currentPart && <button onClick={() => onClearSlot(selectedSlot)} className="w-full px-2 py-1 border border-red-900 text-red-600 text-[10px] hover:bg-red-950/30">REMOVE PART</button>}
            </div>
          )}
        </div>

        {currentPart && (
          <div className="border border-orange-900 p-2">
            <div className="grid grid-cols-3 gap-x-2 gap-y-2">
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">Resize</div>
                {['X', 'Y', 'Z'].map((a, i) => (
                  <div key={a}>
                    <div className="flex justify-between text-[9px] text-orange-700"><span>SCL {a}</span><span>{currentScale[i].toFixed(1)}x</span></div>
                    <input type="range" min="0.3" max="3" step="0.1" value={currentScale[i]} onChange={e => onScaleChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">Move</div>
                {['X', 'Y', 'Z'].map((a, i) => (
                  <div key={a}>
                    <div className="flex justify-between text-[9px] text-orange-700"><span>POS {a}</span><span>{currentPosition[i].toFixed(1)}</span></div>
                    <input type="range" min="-3" max="3" step="0.1" value={currentPosition[i]} onChange={e => onPositionChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
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

        <div className="border border-orange-900 p-2 space-y-1 text-[10px]">
          <div className="text-orange-700 uppercase">Carrier Stats</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-orange-600">
            <div>SHIP CAP: <span className="text-orange-300">{stats.shipCapacity}</span></div>
            <div>TRITIUM: <span className="text-orange-300">{stats.tritiumCapacity}</span></div>
            <div className="col-span-2">COST: <span className="text-orange-300">{stats.cost.toLocaleString()} CR</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <input type="text" value={carrierName} onChange={e => setCarrierName(e.target.value)} placeholder="Carrier name..." className="w-full bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500" />
          <button onClick={onSave} disabled={!carrierName.trim()} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30">
            <Save className="w-3.5 h-3.5" /> SAVE DESIGN
          </button>
        </div>
        {hasGuilded && (
          <>
            <div className="text-yellow-500 text-[9px] text-center border border-yellow-800/50 py-1">★ GUILDED MODE: ALL PARTS UNLOCKED · UNLIMITED SLOTS</div>
            <button onClick={onAddExtraSlot} className="w-full py-1.5 border border-yellow-700 text-yellow-400 hover:bg-yellow-950/30 text-[10px] font-bold">+ ADD STRUCTURAL SLOT</button>
          </>
        )}
        {isSandbox && !hasGuilded && <div className="text-cyan-600 text-[9px] text-center">SANDBOX: ALL PARTS UNLOCKED</div>}
        {!isSandbox && !hasGuilded && level < 5 && <div className="text-orange-800 text-[9px] text-center">Shipyard Level: {level} — Upgrade for more parts</div>}
      </div>
    </div>
  );
}

function SavedCarriersTab({ designs, carriers, onLoad, onDelete, onApply }) {
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = (d) => { setShareCode(encodeShareCode({ _type: 'carrier', name: d.name, parts: d.parts }) || ''); };
  const handleCopy = () => { if (!shareCode) return; navigator.clipboard?.writeText(shareCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h3 className="text-orange-500 text-sm font-bold uppercase">Saved Carrier Designs</h3>
      {designs.length === 0 ? (
        <div className="text-center text-orange-700 text-xs py-4">
          <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No saved carrier designs. Build one in the Builder tab.
        </div>
      ) : (
        <div className="space-y-2">
          {designs.map(d => {
            const stats = computeCarrierStats(d);
            return (
              <div key={d.id} className="border border-orange-900 p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-300 font-bold">{d.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-orange-600 mb-2">
                  <div>SHIP CAP: <span className="text-orange-300">{stats.shipCapacity}</span></div>
                  <div>TRITIUM: <span className="text-orange-300">{stats.tritiumCapacity}</span></div>
                  <div>COST: <span className="text-orange-300">{(stats.cost/1e9).toFixed(1)}B</span></div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => onLoad(d)} className="flex-1 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px]">EDIT</button>
                  {carriers.length > 0 && (
                    <select onChange={e => { if (e.target.value) { onApply(e.target.value, { name: d.name, parts: d.parts }); e.target.value = ''; } }} defaultValue="" className="px-1 py-1 border border-green-600 text-green-400 bg-black text-[10px]">
                      <option value="">APPLY TO...</option>
                      {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          <div className="text-cyan-500 text-[10px] uppercase">Carrier Share Code</div>
          <textarea readOnly value={shareCode} className="w-full h-12 bg-black border border-cyan-900 text-cyan-400 p-1.5 text-[9px] resize-none outline-none" />
          <button onClick={handleCopy} className="w-full py-1 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[10px] flex items-center justify-center gap-1">
            {copied ? <><Check className="w-3 h-3" /> COPIED!</> : <><Copy className="w-3 h-3" /> COPY CODE</>}
          </button>
        </div>
      )}
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