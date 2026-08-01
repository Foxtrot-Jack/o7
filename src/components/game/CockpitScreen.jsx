// Cockpit Screen — viewer + decoration editor for ships, carriers, and stations
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { getCockpitConfig, getCockpitPartsForSlot, computeCockpitCost } from '@/lib/cockpitParts';
import CockpitView from './CockpitView';
import CockpitBuilder3D from './CockpitBuilder3D';
import { Eye, Wrench, Save, Trash2 } from 'lucide-react';

export default function CockpitScreen() {
  const { state, isSandbox, saveCockpitDecoration } = useGameState();
  const [tab, setTab] = useState('view');
  const [target, setTarget] = useState('ship');
  const [carrierId, setCarrierId] = useState(state.fleetCarriers?.[0]?.id || null);
  const [stationId, setStationId] = useState(state.ownedStations?.[0]?.id || null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [design, setDesign] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const shipClass = target === 'ship'
    ? (SHIP_MAP[state.ship.type]?.class || (state.ship.type === 'custom' ? 2 : 1))
    : target === 'carrier' ? 'carrier' : 'station';
  const config = getCockpitConfig(shipClass);

  const savedDecor = target === 'ship'
    ? state.ship.cockpitDecoration || { parts: {} }
    : target === 'carrier'
      ? state.fleetCarriers.find(c => c.id === carrierId)?.cockpitDecoration || { parts: {} }
      : state.ownedStations.find(s => s.id === stationId)?.decoration || { parts: {} };

  const activeDesign = design || savedDecor;
  const activeTargetId = target === 'carrier' ? carrierId : target === 'station' ? stationId : null;

  const handleSelectSlot = useCallback((slotId) => setSelectedSlot(slotId), []);

  const handlePartSelect = useCallback((slotId, partId) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      return {
        ...base,
        parts: { ...base.parts, [slotId]: { partId, scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] } },
      };
    });
  }, [savedDecor]);

  const handleScaleChange = useCallback((slotId, value) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      return { ...base, parts: { ...base.parts, [slotId]: { ...base.parts?.[slotId], scale: value } } };
    });
  }, [savedDecor]);

  const handleRotationChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      const part = base.parts?.[slotId] || {};
      const rotation = [...(part.rotation || [0, 0, 0])];
      rotation[axis] = value;
      return { ...base, parts: { ...base.parts, [slotId]: { ...part, rotation } } };
    });
  }, [savedDecor]);

  const handlePositionChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      const part = base.parts?.[slotId] || {};
      const position = [...(part.position || [0, 0, 0])];
      position[axis] = value;
      return { ...base, parts: { ...base.parts, [slotId]: { ...part, position } } };
    });
  }, [savedDecor]);

  const handleClearSlot = useCallback((slotId) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      const parts = { ...base.parts };
      delete parts[slotId];
      return { ...base, parts };
    });
  }, [savedDecor]);

  const handleSave = () => {
    saveCockpitDecoration(activeDesign, target, activeTargetId);
    setDesign(null);
    setSaveMsg('Decoration saved!');
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const handleReset = () => {
    setDesign(null);
    setSelectedSlot(null);
  };

  const switchTarget = (t) => {
    setTarget(t);
    setDesign(null);
    setSelectedSlot(null);
  };

  const cost = useMemo(() => computeCockpitCost(activeDesign), [activeDesign]);
  const selectedSlotObj = config.slots.find(s => s.id === selectedSlot);
  const availableParts = selectedSlotObj ? getCockpitPartsForSlot(selectedSlotObj) : [];
  const selectedPartRef = selectedSlot ? activeDesign?.parts?.[selectedSlot] : null;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-orange-900/50 bg-black flex-shrink-0 flex-wrap">
        <div className="flex gap-1">
          <button onClick={() => switchTarget('ship')} className={`px-2 py-1 text-[10px] border ${target === 'ship' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>SHIP</button>
          {state.fleetCarriers?.length > 0 && (
            <button onClick={() => switchTarget('carrier')} className={`px-2 py-1 text-[10px] border ${target === 'carrier' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>CARRIER</button>
          )}
          {state.ownedStations?.length > 0 && (
            <button onClick={() => switchTarget('station')} className={`px-2 py-1 text-[10px] border ${target === 'station' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>STATION</button>
          )}
        </div>

        {target === 'carrier' && state.fleetCarriers?.length > 1 && (
          <select value={carrierId || ''} onChange={(e) => { setCarrierId(e.target.value); setDesign(null); }} className="bg-black border border-orange-900 text-orange-400 text-[10px] px-1 py-0.5">
            {state.fleetCarriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {target === 'station' && state.ownedStations?.length > 1 && (
          <select value={stationId || ''} onChange={(e) => { setStationId(e.target.value); setDesign(null); }} className="bg-black border border-orange-900 text-orange-400 text-[10px] px-1 py-0.5">
            {state.ownedStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        <div className="text-[10px] text-orange-600 ml-1">{config.name} · {config.slots.length} slots</div>

        <div className="flex gap-1 ml-auto">
          <button onClick={() => setTab('view')} className={`flex items-center gap-1 px-2 py-1 text-[10px] border ${tab === 'view' ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-600'}`}>
            <Eye className="w-3 h-3" /> VIEW
          </button>
          <button onClick={() => setTab('decorate')} className={`flex items-center gap-1 px-2 py-1 text-[10px] border ${tab === 'decorate' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
            <Wrench className="w-3 h-3" /> DECORATE
          </button>
        </div>
      </div>

      {/* Main content */}
      {tab === 'view' ? (
        <div className="flex-1 min-h-0">
          <CockpitView target={target} targetId={activeTargetId} decorationOverride={design} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          <div className="flex-1 min-h-[200px] sm:min-h-0 border-b sm:border-b-0 sm:border-r border-orange-900/50 relative">
            <CockpitBuilder3D design={activeDesign} config={config} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot} />
          </div>

          <div className="w-full sm:w-64 flex-shrink-0 overflow-y-auto p-2 space-y-2 bg-black max-h-[40vh] sm:max-h-none">
            {/* Slot list */}
            <div>
              <div className="text-orange-700 text-[9px] uppercase mb-1">Slots</div>
              <div className="space-y-0.5">
                {config.slots.map(slot => {
                  const hasPart = activeDesign?.parts?.[slot.id]?.partId;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`flex items-center justify-between w-full px-2 py-1 text-[10px] border ${selectedSlot === slot.id ? 'border-green-600 text-green-400 bg-green-950/20' : 'border-orange-950 text-orange-600 hover:text-orange-400'}`}
                    >
                      <span>{slot.label}</span>
                      {hasPart && <span className="text-green-600">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parts palette */}
            {selectedSlotObj && (
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">{selectedSlotObj.category} Items</div>
                <div className="space-y-0.5">
                  {availableParts.map(part => (
                    <button
                      key={part.id}
                      onClick={() => handlePartSelect(selectedSlot, part.id)}
                      className={`flex items-center justify-between w-full px-2 py-1 text-[10px] border ${selectedPartRef?.partId === part.id ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-950 text-orange-600 hover:text-orange-400'}`}
                    >
                      <span>{part.name}</span>
                      <span className="text-orange-800">{part.cost}cr</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adjustment controls */}
            {selectedPartRef?.partId && (
              <div className="space-y-2 border border-orange-950 p-2">
                <div className="text-orange-700 text-[9px] uppercase">Adjust</div>
                <div>
                  <label className="text-[9px] text-orange-600">Scale: {(selectedPartRef.scale || 1).toFixed(1)}x</label>
                  <input type="range" min="0.3" max="3" step="0.1" value={selectedPartRef.scale || 1} onChange={(e) => handleScaleChange(selectedSlot, parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-orange-600">Y Rotation: {selectedPartRef.rotation?.[1] || 0}°</label>
                  <input type="range" min="0" max="360" step="5" value={selectedPartRef.rotation?.[1] || 0} onChange={(e) => handleRotationChange(selectedSlot, 1, parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-orange-600">X Offset: {(selectedPartRef.position?.[0] || 0).toFixed(2)}</label>
                  <input type="range" min="-0.5" max="0.5" step="0.05" value={selectedPartRef.position?.[0] || 0} onChange={(e) => handlePositionChange(selectedSlot, 0, parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-[9px] text-orange-600">Z Offset: {(selectedPartRef.position?.[2] || 0).toFixed(2)}</label>
                  <input type="range" min="-0.5" max="0.5" step="0.05" value={selectedPartRef.position?.[2] || 0} onChange={(e) => handlePositionChange(selectedSlot, 2, parseFloat(e.target.value))} className="w-full" />
                </div>
                <button onClick={() => handleClearSlot(selectedSlot)} className="w-full py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[9px] flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> REMOVE
                </button>
              </div>
            )}

            {/* Cost summary + save */}
            <div className="border border-orange-900 p-2 space-y-1">
              <div className="text-orange-700 text-[9px] uppercase">Total Cost</div>
              <div className="text-orange-400 text-[10px]">{cost.credits.toLocaleString()} CR</div>
              {Object.entries(cost.materials).map(([mat, qty]) => (
                <div key={mat} className="text-orange-600 text-[9px]">{mat}: {qty}</div>
              ))}
              <button onClick={handleSave} className="w-full py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold flex items-center justify-center gap-1">
                <Save className="w-3 h-3" /> SAVE DECORATION
              </button>
              {design && (
                <button onClick={handleReset} className="w-full py-1 border border-orange-900 text-orange-600 hover:text-orange-400 text-[9px]">DISCARD CHANGES</button>
              )}
              {saveMsg && <div className="text-green-500 text-[9px] text-center">{saveMsg}</div>}
              {isSandbox && <div className="text-cyan-700 text-[8px] text-center">SANDBOX: MATERIALS FREE</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}