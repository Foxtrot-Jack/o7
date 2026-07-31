// Ship Creator — custom ship designer with snappable low-poly parts
// Sandbox: all parts unlocked. Normal: requires space shipyard built via colonies.
import React, { useState, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { COMMODITY_MAP, COMMODITY_CATEGORIES } from '@/lib/commodities';
import { SHIP_SLOTS, SHIP_PARTS, SHIP_PART_MAP, getPartsForSlot, createEmptyDesign, computeCustomShipStats, SHIPYARD_LEVELS, getShipyardLevel } from '@/lib/shipParts';
import ShipBuilder3D from './ShipBuilder3D';
import { Hammer, Save, Trash2, Box, Package, Wrench, Rocket, Building, TrendingUp } from 'lucide-react';

const SHIPYARD_COST = 100000000;
const SHIPYARD_MIN_COLONIES = 3;

export default function ShipCreator() {
  const { state, isSandbox, saveCustomShip, deleteCustomShip, activateCustomShip, buildShipyard, deliverToShipyard } = useGameState();
  const [tab, setTab] = useState('builder');
  const [design, setDesign] = useState(createEmptyDesign());
  const [selectedSlot, setSelectedSlot] = useState('hull');
  const [shipName, setShipName] = useState('Untitled Vessel');

  const shipyardLevel = isSandbox ? 5 : (state.shipyard ? getShipyardLevel(state.shipyard.infrastructure).level : -1);
  const canAccess = isSandbox || (state.shipyard !== null);

  const handlePartSelect = useCallback((slotId, partId) => {
    setDesign(prev => ({
      ...prev,
      parts: { ...prev.parts, [slotId]: { ...prev.parts[slotId], partId } },
    }));
  }, []);

  const handleScaleChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const part = prev.parts[slotId];
      const scale = [...(part.scale || [1, 1, 1])];
      scale[axis] = value;
      return { ...prev, parts: { ...prev.parts, [slotId]: { ...part, scale } } };
    });
  }, []);

  const handlePositionChange = useCallback((slotId, axis, value) => {
    setDesign(prev => {
      const part = prev.parts[slotId];
      const position = [...(part.position || [0, 0, 0])];
      position[axis] = value;
      return { ...prev, parts: { ...prev.parts, [slotId]: { ...part, position } } };
    });
  }, []);

  const handleClearSlot = useCallback((slotId) => {
    setDesign(prev => ({
      ...prev,
      parts: { ...prev.parts, [slotId]: { partId: null, scale: [1, 1, 1] } },
    }));
  }, []);

  const handleSave = () => {
    const stats = computeCustomShipStats(design);
    saveCustomShip({ ...design, name: shipName, stats });
    setTab('saved');
  };

  const handleLoadDesign = (savedDesign) => {
    setDesign({ name: savedDesign.name, parts: savedDesign.parts });
    setShipName(savedDesign.name);
    setTab('builder');
  };

  const stats = computeCustomShipStats(design);

  if (!canAccess) {
    return (
      <div className="w-full h-full overflow-y-auto p-4 space-y-4">
        <div className="border border-orange-700 p-4 flex items-center gap-2">
          <Hammer className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Shipyard</h2>
        </div>
        <div className="border border-orange-900 p-6 text-center space-y-3">
          <Building className="w-10 h-10 mx-auto text-orange-700" />
          <p className="text-orange-400 text-sm font-bold">No Shipyard Built</p>
          <p className="text-orange-700 text-xs max-w-md mx-auto">
            To design custom ships, you must first build a space shipyard. This requires at least {SHIPYARD_MIN_COLONIES} established colonies to provide the industrial base, plus {SHIPYARD_COST.toLocaleString()} CR in construction costs.
          </p>
          <div className="text-orange-600 text-xs space-y-0.5 max-w-xs mx-auto">
            <div>COLONIES: <span className={state.colonies.length >= SHIPYARD_MIN_COLONIES ? 'text-green-500' : 'text-red-500'}>{state.colonies.length} / {SHIPYARD_MIN_COLONIES}</span></div>
            <div>CREDITS: <span className={state.credits >= SHIPYARD_COST ? 'text-green-500' : 'text-red-500'}>{state.credits.toLocaleString()} / {SHIPYARD_COST.toLocaleString()}</span></div>
          </div>
          <button
            onClick={buildShipyard}
            disabled={state.colonies.length < SHIPYARD_MIN_COLONIES || state.credits < SHIPYARD_COST}
            className="px-6 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-sm font-bold disabled:opacity-30"
          >
            BUILD SHIPYARD — {SHIPYARD_COST.toLocaleString()} CR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-1 border-b border-orange-900/50 p-1">
        <TabButton active={tab === 'builder'} onClick={() => setTab('builder')} icon={Hammer} label="Builder" />
        <TabButton active={tab === 'saved'} onClick={() => setTab('saved')} icon={Box} label={`Saved (${state.customShips?.length || 0})`} />
        {!isSandbox && <TabButton active={tab === 'shipyard'} onClick={() => setTab('shipyard')} icon={Building} label="Shipyard" />}
      </div>

      {tab === 'builder' && (
        <BuilderTab
          design={design}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onPartSelect={handlePartSelect}
          onScaleChange={handleScaleChange}
          onPositionChange={handlePositionChange}
          onClearSlot={handleClearSlot}
          shipName={shipName}
          setShipName={setShipName}
          stats={stats}
          onSave={handleSave}
          shipyardLevel={shipyardLevel}
          isSandbox={isSandbox}
        />
      )}

      {tab === 'saved' && (
        <SavedShipsTab
          ships={state.customShips || []}
          onLoad={handleLoadDesign}
          onDelete={deleteCustomShip}
          onActivate={activateCustomShip}
          isDocked={state.currentLocation === 'station'}
          activeShipId={state.ship.customShipId}
        />
      )}

      {tab === 'shipyard' && !isSandbox && (
        <ShipyardTab
          shipyard={state.shipyard}
          cargo={state.ship.cargo}
          onDeliver={deliverToShipyard}
        />
      )}
    </div>
  );
}

function BuilderTab({ design, selectedSlot, onSelectSlot, onPartSelect, onScaleChange, onPositionChange, onClearSlot, shipName, setShipName, stats, onSave, shipyardLevel, isSandbox }) {
  const slot = SHIP_SLOTS.find(s => s.id === selectedSlot);
  const availableParts = getPartsForSlot(selectedSlot, shipyardLevel);
  const currentPart = design.parts[selectedSlot]?.partId ? SHIP_PART_MAP[design.parts[selectedSlot].partId] : null;
  const currentScale = design.parts[selectedSlot]?.scale || [1, 1, 1];
  const currentPosition = design.parts[selectedSlot]?.position || [0, 0, 0];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* 3D Preview */}
      <div className="flex-1 min-h-[200px] border-b lg:border-b-0 lg:border-r border-orange-900/50">
        <ShipBuilder3D design={design} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot} />
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 overflow-y-auto p-3 space-y-3">
        {/* Slot selector */}
        <div>
          <div className="text-orange-700 text-[10px] uppercase mb-1">Mount Slots</div>
          <div className="grid grid-cols-2 gap-1">
            {SHIP_SLOTS.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSlot(s.id)}
                className={`px-2 py-1 border text-[10px] text-left ${selectedSlot === s.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
              >
                {s.label}
                {design.parts[s.id]?.partId && <span className="text-green-600 ml-1">●</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Part selector */}
        <div>
          <div className="text-orange-700 text-[10px] uppercase mb-1">{slot?.label} — Available Parts</div>
          {availableParts.length === 0 ? (
            <div className="text-orange-800 text-[10px]">No parts available at this shipyard level.</div>
          ) : (
            <div className="space-y-1">
              {availableParts.map(p => (
                <button
                  key={p.id}
                  onClick={() => onPartSelect(selectedSlot, p.id)}
                  className={`w-full px-2 py-1 border text-[10px] text-left flex items-center justify-between ${design.parts[selectedSlot]?.partId === p.id ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}
                >
                  <span>{p.name}</span>
                  <span className="text-orange-800">Lv{p.unlockLevel}</span>
                </button>
              ))}
              {currentPart && (
                <button onClick={() => onClearSlot(selectedSlot)} className="w-full px-2 py-1 border border-red-900 text-red-600 text-[10px] hover:bg-red-950/30">REMOVE PART</button>
              )}
            </div>
          )}
        </div>

        {/* Scale sliders */}
        {currentPart && (
          <div className="border border-orange-900 p-2 space-y-2">
            <div className="text-orange-700 text-[10px] uppercase">Resize Part</div>
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis}>
                <div className="flex justify-between text-[9px] text-orange-700"><span>SCALE {axis}</span><span>{currentScale[i].toFixed(1)}x</span></div>
                <input type="range" min="0.3" max="3" step="0.1" value={currentScale[i]} onChange={e => onScaleChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Position sliders */}
        {currentPart && (
          <div className="border border-orange-900 p-2 space-y-2">
            <div className="text-orange-700 text-[10px] uppercase">Move Part</div>
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis}>
                <div className="flex justify-between text-[9px] text-orange-700"><span>POS {axis}</span><span>{currentPosition[i].toFixed(1)}</span></div>
                <input type="range" min="-3" max="3" step="0.1" value={currentPosition[i]} onChange={e => onPositionChange(selectedSlot, i, parseFloat(e.target.value))} className="w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Ship stats */}
        <div className="border border-orange-900 p-2 space-y-1 text-[10px]">
          <div className="text-orange-700 uppercase">Ship Statistics</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-orange-600">
            <div>CARGO: <span className="text-orange-300">{stats.cargoCapacity}T</span></div>
            <div>FUEL: <span className="text-orange-300">{stats.fuelCapacity}T</span></div>
            <div>JUMP: <span className="text-orange-300">{stats.jumpRange}LY</span></div>
            <div>COST: <span className="text-orange-300">{stats.cost.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Name & save */}
        <div className="space-y-2">
          <input type="text" value={shipName} onChange={e => setShipName(e.target.value)} placeholder="Ship name..." className="w-full bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500" />
          <button onClick={onSave} disabled={!shipName.trim()} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30">
            <Save className="w-3.5 h-3.5" /> SAVE DESIGN
          </button>
        </div>

        {isSandbox && <div className="text-cyan-600 text-[9px] text-center">SANDBOX: ALL PARTS UNLOCKED</div>}
      </div>
    </div>
  );
}

function SavedShipsTab({ ships, onLoad, onDelete, onActivate, isDocked, activeShipId }) {
  if (ships.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-orange-700 text-xs">
        <div className="text-center">
          <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No saved ship designs. Build one in the Builder tab.
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      <h3 className="text-orange-500 text-sm font-bold uppercase">Saved Ship Designs</h3>
      {ships.map(ship => {
        const stats = ship.stats || computeCustomShipStats(ship);
        return (
          <div key={ship.id} className={`border p-3 text-xs ${activeShipId === ship.id ? 'border-green-700' : 'border-orange-900'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-300 font-bold">{ship.name}</span>
              {activeShipId === ship.id && <span className="text-green-500 text-[10px]">✓ ACTIVE</span>}
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-orange-600 mb-2">
              <div>CARGO: <span className="text-orange-300">{stats.cargoCapacity}T</span></div>
              <div>FUEL: <span className="text-orange-300">{stats.fuelCapacity}T</span></div>
              <div>JUMP: <span className="text-orange-300">{stats.jumpRange}LY</span></div>
              <div>COST: <span className="text-orange-300">{stats.cost.toLocaleString()}</span></div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onLoad(ship)} className="flex-1 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px]">EDIT</button>
              {isDocked && activeShipId !== ship.id && (
                <button onClick={() => onActivate(ship.id)} className="flex-1 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px]">ACTIVATE</button>
              )}
              <button onClick={() => onDelete(ship.id)} className="px-2 py-1 border border-red-900 text-red-600 hover:bg-red-950/30 text-[10px]"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ShipyardTab({ shipyard, cargo, onDeliver }) {
  if (!shipyard) return null;
  const levelInfo = getShipyardLevel(shipyard.infrastructure);
  const nextLevel = SHIPYARD_LEVELS.find(l => l.level === levelInfo.level + 1);
  const infraPct = shipyard.infrastructure;
  const nextThreshold = nextLevel ? nextLevel.infraRequired : 100;
  const progressPct = nextLevel ? ((shipyard.infrastructure - levelInfo.infraRequired) / (nextThreshold - levelInfo.infraRequired)) * 100 : 100;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase text-sm">Space Shipyard — {shipyard.systemName}</h2>
        </div>
        <div className="text-xs text-orange-600 space-y-0.5">
          <div>LEVEL: <span className="text-orange-300">{levelInfo.level} — {levelInfo.name}</span></div>
          <div>INFRASTRUCTURE: <span className="text-orange-300">{shipyard.infrastructure}%</span></div>
          <div className="text-orange-700 text-[10px] mt-1">{levelInfo.desc}</div>
        </div>
        {nextLevel && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-orange-700 mb-0.5">
              <span>PROGRESS TO {nextLevel.name.toUpperCase()}</span>
              <span>{shipyard.infrastructure} / {nextThreshold}%</span>
            </div>
            <div className="w-full h-2 bg-black border border-orange-900">
              <div className="h-full bg-orange-600" style={{ width: `${Math.min(100, progressPct)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Deliver materials */}
      <div className="border border-cyan-900 p-3 space-y-2">
        <h3 className="text-cyan-400 text-sm font-bold uppercase flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Deliver Materials</h3>
        <div className="text-orange-700 text-[10px]">Deliver industrial materials to upgrade the shipyard. Higher-value materials contribute more infrastructure.</div>
        {cargo.length === 0 ? (
          <div className="text-orange-700 text-xs text-center py-2">No cargo in hold. Purchase goods at a station market.</div>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {cargo.map(item => {
              const comm = COMMODITY_MAP[item.commodity];
              if (!comm) return null;
              const catKey = Object.entries(COMMODITY_CATEGORIES).find(([k, v]) => v === comm.category)?.[0];
              const boost = { TECHNOLOGY: 5, INDUSTRIAL: 4, METALS: 3, MINERALS: 2, CHEMICALS: 3, RAW: 6 }[catKey] || 1;
              return (
                <div key={item.commodity} className="flex items-center justify-between border border-orange-900 p-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="text-orange-400">{comm.name}</div>
                    <div className="text-orange-700 text-[10px]">{comm.category} · {item.qty}T · +{boost} infra/10T</div>
                  </div>
                  <button onClick={() => onDeliver(item.commodity, item.qty)} className="px-2 py-1 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/50 text-[10px] flex-shrink-0 ml-2">DELIVER</button>
                </div>
              );
            })}
          </div>
        )}
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