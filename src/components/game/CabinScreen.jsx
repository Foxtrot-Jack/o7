// Cabin Screen — living quarters viewer, decoration editor, and interior map
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { computeCockpitCost } from '@/lib/cockpitParts';
import { getCabinConfig, genCabinSlots, getCabinPartsForSlot, CABIN_TEXTURES, CABIN_THEMES, getThemeSurfaces, DEFAULT_SURFACE_COLORS } from '@/lib/cabinConfig';
import CabinView from './CabinView';
import CabinBuilder3D from './CabinBuilder3D';
import { Eye, Wrench, Map, Save, Trash2, Palette } from 'lucide-react';

export default function CabinScreen({ onNavigate }) {
  const { state, isSandbox, saveCockpitDecoration, switchSave } = useGameState();
  const [tab, setTab] = useState('view');
  const [target, setTarget] = useState('ship');
  const [carrierId, setCarrierId] = useState(state.fleetCarriers?.[0]?.id || null);
  const [stationId, setStationId] = useState(state.ownedStations?.[0]?.id || null);
  const [room, setRoom] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSurface, setSelectedSurface] = useState('floor');
  const [design, setDesign] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const shipClass = target === 'ship'
    ? (SHIP_MAP[state.ship.type]?.class || (state.ship.type === 'custom' ? 2 : 1))
    : target === 'carrier' ? 'carrier' : 'station';
  const config = getCabinConfig(shipClass);

  const savedDecor = target === 'ship'
    ? state.ship.cockpitDecoration || { parts: {} }
    : target === 'carrier'
      ? state.fleetCarriers.find(c => c.id === carrierId)?.cockpitDecoration || { parts: {} }
      : state.ownedStations.find(s => s.id === stationId)?.decoration || { parts: {} };

  const activeDesign = design || savedDecor;
  const activeTargetId = target === 'carrier' ? carrierId : target === 'station' ? stationId : null;
  const roomKey = room === 0 ? 'parts' : 'room1Parts';
  const cabinSlots = useMemo(() => genCabinSlots(config, room), [config, room]);

  const handleSelectSlot = useCallback((slotId) => setSelectedSlot(slotId), []);

  const handlePartSelect = useCallback((slotId, partId) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      const rk = room === 0 ? 'parts' : 'room1Parts';
      return { ...base, [rk]: { ...(base[rk] || {}), [slotId]: { partId, scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] } } };
    });
  }, [savedDecor, room]);

  const handleScaleChange = useCallback((slotId, value) => {
    const rk = roomKey;
    setDesign(prev => {
      const base = prev || savedDecor;
      const parts = base[rk] || {};
      return { ...base, [rk]: { ...parts, [slotId]: { ...parts[slotId], scale: value } } };
    });
  }, [savedDecor, roomKey]);

  const handleRotationChange = useCallback((slotId, axis, value) => {
    const rk = roomKey;
    setDesign(prev => {
      const base = prev || savedDecor;
      const parts = base[rk] || {};
      const part = parts[slotId] || {};
      const rotation = [...(part.rotation || [0, 0, 0])];
      rotation[axis] = value;
      return { ...base, [rk]: { ...parts, [slotId]: { ...part, rotation } } };
    });
  }, [savedDecor, roomKey]);

  const handlePositionChange = useCallback((slotId, axis, value) => {
    const rk = roomKey;
    setDesign(prev => {
      const base = prev || savedDecor;
      const parts = base[rk] || {};
      const part = parts[slotId] || {};
      const position = [...(part.position || [0, 0, 0])];
      position[axis] = value;
      return { ...base, [rk]: { ...parts, [slotId]: { ...part, position } } };
    });
  }, [savedDecor, roomKey]);

  const handleClearSlot = useCallback((slotId) => {
    const rk = roomKey;
    setDesign(prev => {
      const base = prev || savedDecor;
      const parts = { ...(base[rk] || {}) };
      delete parts[slotId];
      return { ...base, [rk]: parts };
    });
  }, [savedDecor, roomKey]);

  const handleSurfaceChange = useCallback((surface, field, value) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      const surfaces = { ...(base.surfaces || {}) };
      const roomSurfaces = { ...(surfaces[room] || {}) };
      const current = roomSurfaces[surface] || { texture: 'solid', rgb: DEFAULT_SURFACE_COLORS[surface] || [26, 13, 0] };
      roomSurfaces[surface] = { ...current, [field]: value };
      surfaces[room] = roomSurfaces;
      return { ...base, surfaces };
    });
  }, [savedDecor, room]);

  const handleThemeChange = useCallback((theme) => {
    setDesign(prev => {
      const base = prev || savedDecor;
      return { ...base, theme, surfaces: getThemeSurfaces(theme) };
    });
  }, [savedDecor]);

  const handleSave = () => {
    saveCockpitDecoration(activeDesign, target, activeTargetId);
    setDesign(null);
    setSaveMsg('Decoration saved!');
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const handleReset = () => { setDesign(null); setSelectedSlot(null); };

  const switchTarget = (t) => { setTarget(t); setDesign(null); setSelectedSlot(null); setRoom(0); };
  const switchRoom = (r) => { setRoom(r); setDesign(null); setSelectedSlot(null); };

  const cost = useMemo(() => computeCockpitCost(activeDesign), [activeDesign]);
  const selectedSlotObj = cabinSlots.find(s => s.id === selectedSlot);
  const availableParts = selectedSlotObj ? getCabinPartsForSlot(selectedSlotObj) : [];
  const selectedPartRef = selectedSlot ? activeDesign?.[roomKey]?.[selectedSlot] : null;

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

        <div className="text-[10px] text-orange-600 ml-1">{config.name}</div>

        {config.rooms > 1 && (
          <div className="flex gap-1">
            <button onClick={() => switchRoom(0)} className={`px-2 py-1 text-[10px] border ${room === 0 ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-600'}`}>LIVING QTRS</button>
            <button onClick={() => switchRoom(1)} className={`px-2 py-1 text-[10px] border ${room === 1 ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-600'}`}>CUSTOM RM</button>
          </div>
        )}

        <div className="flex gap-1 ml-auto">
          <button onClick={() => setTab('view')} className={`flex items-center gap-1 px-2 py-1 text-[10px] border ${tab === 'view' ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-600'}`}>
            <Eye className="w-3 h-3" /> VIEW
          </button>
          <button onClick={() => setTab('decorate')} className={`flex items-center gap-1 px-2 py-1 text-[10px] border ${tab === 'decorate' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
            <Wrench className="w-3 h-3" /> DECORATE
          </button>
          <button onClick={() => setTab('map')} className={`flex items-center gap-1 px-2 py-1 text-[10px] border ${tab === 'map' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
            <Map className="w-3 h-3" /> MAP
          </button>
          <button onClick={() => setTab('surfaces')} className={`flex items-center gap-1 px-2 py-1 text-[10px] border ${tab === 'surfaces' ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
            <Palette className="w-3 h-3" /> SURFACES
          </button>
        </div>
      </div>

      {/* Main content */}
      {tab === 'view' ? (
        <div className="flex-1 min-h-0">
          <CabinView target={target} targetId={activeTargetId} room={room} onNavigate={onNavigate} onExitGame={switchSave} onRoomChange={switchRoom} decorationOverride={design} />
        </div>
      ) : tab === 'decorate' ? (
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          <div className="flex-1 min-h-[200px] sm:min-h-0 border-b sm:border-b-0 sm:border-r border-orange-900/50 relative">
            <CabinBuilder3D design={activeDesign} config={config} room={room} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot} />
          </div>
          <div className="w-full sm:w-64 flex-shrink-0 overflow-y-auto p-2 space-y-2 bg-black max-h-[40vh] sm:max-h-none">
            <div>
              <div className="text-orange-700 text-[9px] uppercase mb-1">Slots — {room === 0 ? 'Living Quarters' : 'Custom Room'}</div>
              <div className="space-y-0.5">
                {cabinSlots.map(slot => {
                  const hasPart = activeDesign?.[roomKey]?.[slot.id]?.partId;
                  return (
                    <button key={slot.id} onClick={() => setSelectedSlot(slot.id)} className={`flex items-center justify-between w-full px-2 py-1 text-[10px] border ${selectedSlot === slot.id ? 'border-green-600 text-green-400 bg-green-950/20' : 'border-orange-950 text-orange-600 hover:text-orange-400'}`}>
                      <span>{slot.label}</span>
                      {hasPart && <span className="text-green-600">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSlotObj && (
              <div>
                <div className="text-orange-700 text-[9px] uppercase mb-1">{selectedSlotObj.category} Items</div>
                <div className="space-y-0.5">
                  {availableParts.map(part => (
                    <button key={part.id} onClick={() => handlePartSelect(selectedSlot, part.id)} className={`flex items-center justify-between w-full px-2 py-1 text-[10px] border ${selectedPartRef?.partId === part.id ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-950 text-orange-600 hover:text-orange-400'}`}>
                      <span>{part.name}</span>
                      <span className="text-orange-800">{part.cost}cr</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            <div className="border border-orange-900 p-2 space-y-1">
              <div className="text-orange-700 text-[9px] uppercase">Total Cost (both rooms)</div>
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
      ) : tab === 'surfaces' ? (
        <CabinSurfaces config={config} room={room} decoration={activeDesign} selectedSurface={selectedSurface} onSelectSurface={setSelectedSurface} onSurfaceChange={handleSurfaceChange} onThemeChange={handleThemeChange} currentTheme={activeDesign?.theme || 'rustic'} />
      ) : (
        <CabinInteriorMap config={config} room={room} decoration={activeDesign} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot} />
      )}
    </div>
  );
}

function CabinSurfaces({ config, room, decoration, selectedSurface, onSelectSurface, onSurfaceChange, onThemeChange, currentTheme }) {
  const surfaces = ['floor', 'ceiling', 'wallFront', 'wallBack', 'wallLeft', 'wallRight'];
  const surfaceLabels = { floor: 'Floor', ceiling: 'Ceiling', wallFront: 'Front Wall', wallBack: 'Back Wall', wallLeft: 'Left Wall', wallRight: 'Right Wall' };
  const currentSurfaces = decoration?.surfaces?.[room] || {};
  const currentConfig = currentSurfaces[selectedSurface] || { texture: 'solid', rgb: DEFAULT_SURFACE_COLORS[selectedSurface] || [26, 13, 0] };

  return (
    <div className="w-full h-full overflow-auto p-3 space-y-3">
      <div>
        <div className="text-orange-700 text-[9px] uppercase mb-1">Preset Theme</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(CABIN_THEMES).map(([id, theme]) => (
            <button key={id} onClick={() => onThemeChange(id)} className={`px-2 py-1 text-[10px] border ${currentTheme === id ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-600'}`}>
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-orange-700 text-[9px] uppercase mb-1">Surface — {room === 0 ? 'Living Quarters' : 'Custom Room'}</div>
        <div className="flex flex-wrap gap-1">
          {surfaces.map(s => (
            <button key={s} onClick={() => onSelectSurface(s)} className={`px-2 py-1 text-[10px] border ${selectedSurface === s ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
              {surfaceLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-orange-700 text-[9px] uppercase mb-1">Texture — {surfaceLabels[selectedSurface]}</div>
        <div className="flex flex-wrap gap-1">
          {CABIN_TEXTURES.map(t => (
            <button key={t.id} onClick={() => onSurfaceChange(selectedSurface, 'texture', t.id)} className={`px-2 py-1 text-[10px] border ${currentConfig.texture === t.id ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 border border-orange-950 p-2">
        <div className="text-orange-700 text-[9px] uppercase">Color (RGB)</div>
        <div>
          <label className="text-[9px] text-red-500">R: {currentConfig.rgb[0]}</label>
          <input type="range" min="0" max="255" step="1" value={currentConfig.rgb[0]} onChange={(e) => onSurfaceChange(selectedSurface, 'rgb', [parseInt(e.target.value), currentConfig.rgb[1], currentConfig.rgb[2]])} className="w-full" />
        </div>
        <div>
          <label className="text-[9px] text-green-500">G: {currentConfig.rgb[1]}</label>
          <input type="range" min="0" max="255" step="1" value={currentConfig.rgb[1]} onChange={(e) => onSurfaceChange(selectedSurface, 'rgb', [currentConfig.rgb[0], parseInt(e.target.value), currentConfig.rgb[2]])} className="w-full" />
        </div>
        <div>
          <label className="text-[9px] text-blue-500">B: {currentConfig.rgb[2]}</label>
          <input type="range" min="0" max="255" step="1" value={currentConfig.rgb[2]} onChange={(e) => onSurfaceChange(selectedSurface, 'rgb', [currentConfig.rgb[0], currentConfig.rgb[1], parseInt(e.target.value)])} className="w-full" />
        </div>
        <div className="w-full h-6 border border-orange-900" style={{ background: `rgb(${currentConfig.rgb[0]}, ${currentConfig.rgb[1]}, ${currentConfig.rgb[2]})` }} />
      </div>
    </div>
  );
}

function CabinInteriorMap({ config, room, decoration, selectedSlot, onSelectSlot }) {
  const slots = genCabinSlots(config, room);
  const hasWindow = room === 0;
  const roomKey = room === 0 ? 'parts' : 'room1Parts';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-auto">
      <div className="text-orange-400 text-xs mb-2">{room === 0 ? 'LIVING QUARTERS' : 'CUSTOMIZATION ROOM'} — TOP DOWN VIEW</div>
      <div className="relative border-2 border-orange-700 bg-black/50" style={{ width: 'min(90%, 450px)', aspectRatio: `${config.width} / ${config.depth}` }}>
        <div className="absolute top-0 inset-x-0 h-1 bg-orange-800" />
        {hasWindow && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-cyan-500" />}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-orange-800" />
        {room === 0 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-2 border border-orange-700 bg-orange-950/50" />}
        <div className="absolute left-0 inset-y-0 w-1 bg-orange-800" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-green-600" />
        <div className="absolute right-0 inset-y-0 w-1 bg-orange-800" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10" style={{ background: (room === 0 && config.rooms > 1) ? '#ffaa00' : '#ff4444' }} />
        {slots.map(slot => {
          const xPct = ((slot.pos[0] + config.width / 2) / config.width) * 100;
          const zPct = ((slot.pos[2] + config.depth / 2) / config.depth) * 100;
          const hasPart = decoration?.[roomKey]?.[slot.id]?.partId;
          return (
            <button
              key={slot.id}
              onClick={() => onSelectSlot?.(slot.id)}
              className={`absolute w-2.5 h-2.5 rounded-full border -translate-x-1/2 -translate-y-1/2 cursor-pointer ${selectedSlot === slot.id ? 'border-green-400 bg-green-600' : hasPart ? 'border-orange-400 bg-orange-600' : 'border-orange-800 bg-orange-950 hover:bg-orange-900'}`}
              style={{ left: `${xPct}%`, top: `${zPct}%` }}
              title={slot.label}
            />
          );
        })}
      </div>
      <div className="text-orange-700 text-[9px] mt-2">TAP A SLOT TO SELECT IT FOR DECORATING</div>
    </div>
  );
}