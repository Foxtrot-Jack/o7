// Carrier Interior — interactive rooms aboard your fleet carrier
import React, { useState, useEffect } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import BadgeDisplay from './BadgeDisplay';
import { Beer, BedDouble, Leaf, Trophy, Compass, Telescope, Plus, Trash2, Ship as ShipIcon, Sparkles, DoorOpen, Wine, Anchor } from 'lucide-react';
import CarrierInteriorView from './CarrierInteriorView';
import { ROOM_TYPES } from '@/lib/cabinRooms';
import { CABIN_TEXTURES, CABIN_THEMES, getThemeSurfaces, DEFAULT_SURFACE_COLORS } from '@/lib/cabinConfig';

const ROOMS = [
  { id: 'bar', name: 'Bar', icon: Beer },
  { id: 'quarters', name: 'Quarters', icon: BedDouble },
  { id: 'garden', name: 'Garden', icon: Leaf },
  { id: 'trophy', name: 'Trophy Room', icon: Trophy },
  { id: 'command', name: 'Command Deck', icon: Compass },
  { id: 'observation', name: 'Observation', icon: Telescope },
];

const ALE_TYPES = [
  { name: 'Tritium Ale', cost: 50, desc: 'A refined blend with notes of rocket fuel. Surprisingly smooth.' },
  { name: 'Void Walker', cost: 120, desc: 'Aged in the hull of a decommissioned Roc. Peaty.' },
  { name: 'Neutron Stout', cost: 200, desc: 'Dark as space, strong as a white dwarf. Drink responsibly.' },
  { name: 'Kingfisher Cider', cost: 80, desc: 'Crisp, refreshing, faintly radioactive. A crowd favorite.' },
  { name: 'Sagittarius Shot', cost: 350, desc: 'A shot of pure liquid courage. Named after the galactic core.' },
];

const RUMOR_TEMPLATES = [
  'Pilots report unusual energy readings near {system}. Might be worth investigating.',
  'A trader claims {system} is selling {commodity} at record low prices. Probably a scam.',
  'Rumor has it there\'s an uncharted earth-like world near {system}.',
  'Someone spotted a ghost carrier near {system}. No transponder, no response.',
  'The barkeep says traffic at {system} has dried up. No ships for days.',
  'A prospector swears they struck painite-rich asteroids near {system}.',
  'Word is {system} has a black hole that wasn\'t on any chart.',
  'Heard a commander got rich off a single haul to {system}.',
  'They say the faction at {system} is on the brink of civil war.',
  'A drunk pilot mentioned rare biological signals near {system}.',
  'There\'s talk of an abandoned megaship near {system}.',
  'Someone said {system} station is offering double for exploration data.',
];

const RUMOR_COMMODITIES = ['Void Opals', 'Painite', 'Low Temp Diamonds', 'Alexandrite', 'Tritium', 'Bromellite'];

const GALAXY_FACTS = [
  'The galaxy contains over 400 billion star systems, each with their own secrets.',
  'Neutron stars can boost your frame shift drive up to 4x its normal range.',
  'The rarest commodity in the galaxy is believed to be Soontill Relics.',
  'Some commanders have reported strange signals from the Formidine Rift.',
  'Earth-like worlds can sell for over 3 million credits in exploration data.',
  'The deepest known gravity well was recorded at 77.7 G on a high-mass world.',
  'Black holes produce visual lensing effects but deal no damage to ships.',
  'The oldest known star is estimated to be 13 billion years old.',
  'Some nebulae span hundreds of light years across.',
  'A Commander once crossed the galaxy in a Sparrowhawk. It took 42 days.',
  'Water worlds cover roughly 1 in 50,000 surveyed systems.',
  'The first discovered ammonia world sparked a wave of colonization fever.',
];

const PLANT_COLORS = ['#22cc44', '#44ff66', '#88ff00', '#00cc88', '#66dd44', '#aaff22', '#44ccaa', '#ccff44'];

function generateRumor(systemName) {
  const t = RUMOR_TEMPLATES[Math.floor(Math.random() * RUMOR_TEMPLATES.length)];
  return t.replace('{system}', systemName).replace('{commodity}', RUMOR_COMMODITIES[Math.floor(Math.random() * RUMOR_COMMODITIES.length)]);
}

const DIR_DELTAS = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
const DIR_LABELS = { north: 'North', south: 'South', east: 'East', west: 'West' };

export default function CarrierInterior({ onNavigate }) {
  const { state, isSandbox, updateCarrierInterior, buyAle, requestShipTransit, initCarrierRoomGrid, addCarrierRoomAt, customizeCarrierRoomSurface, setCarrierCurrentRoom } = useGameState();
  const [selectedCarrierId, setSelectedCarrierId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [buildDir, setBuildDir] = useState(null);

  const carriersHere = state.fleetCarriers.filter(c => c.systemSeed === state.currentSystem.seed);

  useEffect(() => {
    if (!selectedCarrierId && carriersHere.length > 0) setSelectedCarrierId(carriersHere[0].id);
    if (selectedCarrierId && !carriersHere.find(c => c.id === selectedCarrierId)) setSelectedCarrierId(carriersHere[0]?.id || null);
  }, [carriersHere, selectedCarrierId]);

  useEffect(() => {
    if (selectedCarrierId) initCarrierRoomGrid(selectedCarrierId);
  }, [selectedCarrierId, initCarrierRoomGrid]);

  if (carriersHere.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <DoorOpen className="w-12 h-12 mx-auto text-orange-700 opacity-50" />
          <div className="text-orange-500 text-sm font-bold">No Carrier In This System</div>
          <div className="text-orange-700 text-xs max-w-xs">You need a fleet carrier in the current system to access its interior. Purchase a carrier or jump one here.</div>
          {onNavigate && <button onClick={() => onNavigate('carriers')} className="px-4 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold">GO TO CARRIERS</button>}
        </div>
      </div>
    );
  }

  const carrier = state.fleetCarriers.find(c => c.id === selectedCarrierId) || carriersHere[0];
  const interior = carrier.interior || { roomItems: [], savedPlants: [], barTab: 0 };
  const grid = state.carrierRoomGrid?.[selectedCarrierId] || {};
  const gridKey = state.carrierCurrentRoom?.[selectedCarrierId] || '2,0';
  const [gridX, gridY] = gridKey.split(',').map(Number);
  const room = grid[gridKey] || { type: 'quarters', name: 'Living Quarters', surfaces: {} };

  const handleNavigateDir = (dir) => {
    const [dx, dy] = DIR_DELTAS[dir];
    const newKey = `${gridX + dx},${gridY + dy}`;
    if (grid[newKey]) setCarrierCurrentRoom(selectedCarrierId, newKey);
  };

  const handleBuildDoor = (dir) => { setBuildDir(dir); setActivePanel('build'); };

  const handleInteract = (action) => {
    if (action === 'decorate') { onNavigate?.('cabin'); return; }
    if (action === 'nav-aquarium') { onNavigate?.('aquarium'); return; }
    if (action === 'nav-geneticslab') { onNavigate?.('geneticslab'); return; }
    if (action === 'flora' && room.custom) { onNavigate?.('garden'); return; }
    setActivePanel(action);
  };

  const handleBuild = (roomType, roomName) => {
    const [dx, dy] = DIR_DELTAS[buildDir];
    const ok = addCarrierRoomAt(selectedCarrierId, gridX + dx, gridY + dy, roomType, roomName);
    if (ok) { setActivePanel(null); setBuildDir(null); handleNavigateDir(buildDir); }
  };

  const roomKeys = Object.keys(grid);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {carriersHere.length > 1 && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
          <select value={selectedCarrierId || ''} onChange={e => setSelectedCarrierId(e.target.value)} className="bg-black border border-orange-900 text-orange-300 px-2 py-1 text-xs">
            {carriersHere.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <CarrierInteriorView
        room={room}
        gridX={gridX}
        gridY={gridY}
        grid={grid}
        onNavigate={handleNavigateDir}
        onBuildDoor={handleBuildDoor}
        onInteract={handleInteract}
      />

      {/* Top-right buttons */}
      <div className="absolute top-1 right-1 z-20 flex gap-1">
        <button onClick={() => setActivePanel('surfaces')} className="px-2 py-1 border border-orange-700 bg-black/80 text-orange-400 hover:bg-orange-950/30 text-[9px]">SURFACES</button>
      </div>

      {/* Minimap */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-0.5 max-w-[90%] overflow-x-auto">
        {roomKeys.map(key => {
          const [rx, ry] = key.split(',').map(Number);
          const isCurrent = key === gridKey;
          return (
            <button key={key} onClick={() => setCarrierCurrentRoom(selectedCarrierId, key)} className={`px-1.5 py-0.5 text-[8px] border whitespace-nowrap ${isCurrent ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:text-orange-500'}`} title={grid[key].name}>
              {grid[key].name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Overlay panels */}
      {activePanel && activePanel !== 'build' && activePanel !== 'surfaces' && (
        <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto border border-orange-700 bg-black p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-orange-300 text-sm font-bold uppercase">{room.name}</h3>
              <button onClick={() => setActivePanel(null)} className="text-orange-600 hover:text-orange-400 text-xs">✕ CLOSE</button>
            </div>
            {activePanel === 'drinks' && <BarRoom carrier={carrier} interior={interior} buyAle={buyAle} systemName={state.currentSystem.name} />}
            {activePanel === 'flora' && <GardenRoom carrier={carrier} interior={interior} updateInterior={updateCarrierInterior} surfaceDiscoveries={state.surfaceDiscoveries || {}} systemName={state.currentSystem.name} getSystemData={state.currentSystemData} />}
            {activePanel === 'records' && <TrophyRoom state={state} />}
            {activePanel === 'transit' && <CommandDeck carrier={carrier} state={state} requestShipTransit={requestShipTransit} isSandbox={isSandbox} />}
            {activePanel === 'stargaze' && <ObservationRoom state={state} />}
          </div>
        </div>
      )}

      {/* Surface customization */}
      {activePanel === 'surfaces' && (
        <CarrierSurfacePanel carrierId={selectedCarrierId} gridKey={gridKey} room={room} onSurfaceChange={customizeCarrierRoomSurface} onClose={() => setActivePanel(null)} />
      )}

      {/* Build room dialog */}
      {activePanel === 'build' && buildDir && (
        <BuildRoomDialog dir={buildDir} isSandbox={isSandbox} onBuild={handleBuild} onClose={() => { setActivePanel(null); setBuildDir(null); }} />
      )}
    </div>
  );
}

// ===== SURFACE PANEL =====
function CarrierSurfacePanel({ carrierId, gridKey, room, onSurfaceChange, onClose }) {
  const [selectedSurface, setSelectedSurface] = useState('floor');
  const surfaces = ['floor', 'ceiling', 'wallNorth', 'wallSouth', 'wallEast', 'wallWest'];
  const surfaceLabels = { floor: 'Floor', ceiling: 'Ceiling', wallNorth: 'North Wall', wallSouth: 'South Wall', wallEast: 'East Wall', wallWest: 'West Wall' };
  const currentSurfaces = room.surfaces || {};
  const current = currentSurfaces[selectedSurface] || { texture: 'solid', rgb: DEFAULT_SURFACE_COLORS[selectedSurface] || [26, 13, 0] };

  const handleSurfaceChange = (field, value) => onSurfaceChange(carrierId, gridKey, selectedSurface, field, value);
  const handleTheme = (theme) => {
    const themeSurfaces = getThemeSurfaces(theme);
    for (const [surface, config] of Object.entries(themeSurfaces)) {
      onSurfaceChange(carrierId, gridKey, surface, 'texture', config.texture);
      onSurfaceChange(carrierId, gridKey, surface, 'rgb', config.rgb);
    }
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto border border-orange-700 bg-black p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-orange-300 text-sm font-bold uppercase">Surface Customization</h3>
          <button onClick={onClose} className="text-orange-600 hover:text-orange-400 text-xs">✕ CLOSE</button>
        </div>
        <div>
          <div className="text-orange-700 text-[9px] uppercase mb-1">Theme</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(CABIN_THEMES).map(([id, theme]) => (
              <button key={id} onClick={() => handleTheme(id)} className="px-2 py-1 text-[10px] border border-orange-900 text-orange-600 hover:text-orange-400 hover:border-orange-500">{theme.name}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-orange-700 text-[9px] uppercase mb-1">Surface</div>
          <div className="flex flex-wrap gap-1">
            {surfaces.map(s => (
              <button key={s} onClick={() => setSelectedSurface(s)} className={`px-2 py-1 text-[10px] border ${selectedSurface === s ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>{surfaceLabels[s]}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-orange-700 text-[9px] uppercase mb-1">Texture — {surfaceLabels[selectedSurface]}</div>
          <div className="flex flex-wrap gap-1">
            {CABIN_TEXTURES.map(t => (
              <button key={t.id} onClick={() => handleSurfaceChange('texture', t.id)} className={`px-2 py-1 text-[10px] border ${current.texture === t.id ? 'border-orange-500 text-orange-300 bg-orange-950/30' : 'border-orange-900 text-orange-600'}`}>{t.name}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2 border border-orange-950 p-2">
          <div className="text-orange-700 text-[9px] uppercase">Color (RGB)</div>
          <div>
            <label className="text-[9px] text-red-500">R: {current.rgb[0]}</label>
            <input type="range" min="0" max="255" value={current.rgb[0]} onChange={e => handleSurfaceChange('rgb', [parseInt(e.target.value), current.rgb[1], current.rgb[2]])} className="w-full" />
          </div>
          <div>
            <label className="text-[9px] text-green-500">G: {current.rgb[1]}</label>
            <input type="range" min="0" max="255" value={current.rgb[1]} onChange={e => handleSurfaceChange('rgb', [current.rgb[0], parseInt(e.target.value), current.rgb[2]])} className="w-full" />
          </div>
          <div>
            <label className="text-[9px] text-blue-500">B: {current.rgb[2]}</label>
            <input type="range" min="0" max="255" value={current.rgb[2]} onChange={e => handleSurfaceChange('rgb', [current.rgb[0], current.rgb[1], parseInt(e.target.value)])} className="w-full" />
          </div>
          <div className="w-full h-6 border border-orange-900" style={{ background: `rgb(${current.rgb[0]}, ${current.rgb[1]}, ${current.rgb[2]})` }} />
        </div>
      </div>
    </div>
  );
}

// ===== BUILD ROOM DIALOG =====
function BuildRoomDialog({ dir, isSandbox, onBuild, onClose }) {
  const [roomType, setRoomType] = useState('living');
  const [roomName, setRoomName] = useState('');
  const cost = isSandbox ? 0 : 500000;

  return (
    <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-green-700 bg-black p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-green-400 text-sm font-bold uppercase">Build Room — {DIR_LABELS[dir]}</h3>
          <button onClick={onClose} className="text-orange-600 hover:text-orange-400 text-xs">✕</button>
        </div>
        <div className="text-orange-600 text-[10px]">Construct a new room connected to this wall. The room will be accessible via a door.</div>
        <div>
          <div className="text-orange-700 text-[9px] uppercase mb-1">Room Type</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(ROOM_TYPES).map(([id, rt]) => (
              <button key={id} onClick={() => setRoomType(id)} className={`px-2 py-1 text-[10px] border ${roomType === id ? 'border-green-500 text-green-300 bg-green-950/20' : 'border-orange-900 text-orange-600'}`}>{rt.name}</button>
            ))}
          </div>
          <div className="text-orange-700 text-[9px] mt-1">{ROOM_TYPES[roomType]?.desc}</div>
        </div>
        <input type="text" placeholder="Room name (optional)" value={roomName} onChange={e => setRoomName(e.target.value)} className="w-full bg-black border border-orange-900 text-orange-400 text-[10px] px-2 py-1" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-orange-400">Cost: {isSandbox ? 'FREE' : `${cost.toLocaleString()} CR`}</span>
          <button onClick={() => onBuild(roomType, roomName)} className="px-4 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">BUILD</button>
        </div>
      </div>
    </div>
  );
}

// ===== BAR =====
function BarRoom({ carrier, interior, buyAle, systemName }) {
  const [aleMsg, setAleMsg] = useState('');
  const [rumor, setRumor] = useState('');

  const handleBuyAle = (ale) => {
    buyAle(carrier.id, ale.cost);
    setAleMsg(`You order a ${ale.name}. ${ale.desc}`);
    setTimeout(() => setAleMsg(''), 5000);
  };

  const handleRumor = () => {
    setRumor(generateRumor(systemName));
  };

  return (
    <div className="space-y-3">
      <div className="border border-orange-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Wine className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">The Driftwood Tavern</h3>
        </div>
        <p className="text-orange-700 text-[10px]">A dimly lit bar on the carrier's promenade. The air smells of recycled oxygen and old stories.</p>
        <div className="text-orange-600 text-[10px]">Bar Tab: <span className="text-orange-300">{(interior.barTab || 0).toLocaleString()} CR</span></div>
      </div>

      {aleMsg && <div className="border border-green-900 bg-green-950/20 p-2 text-green-400 text-xs italic">{aleMsg}</div>}

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-500 text-xs font-bold uppercase">Drinks Menu</div>
        {ALE_TYPES.map(ale => (
          <div key={ale.name} className="flex items-center justify-between border border-orange-950 p-2 text-xs">
            <div className="flex-1 min-w-0">
              <div className="text-orange-300 font-bold">{ale.name}</div>
              <div className="text-orange-700 text-[10px]">{ale.desc}</div>
            </div>
            <button onClick={() => handleBuyAle(ale)} className="px-3 py-1 border border-orange-600 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold flex-shrink-0 ml-2">{ale.cost} CR</button>
          </div>
        ))}
      </div>

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-500 text-xs font-bold uppercase">Bar Talk</div>
        <p className="text-orange-700 text-[10px]">Listen for rumors from passing pilots and traders.</p>
        {rumor && <div className="border border-purple-900 bg-purple-950/20 p-2 text-purple-300 text-xs italic">"{rumor}"</div>}
        <button onClick={handleRumor} className="w-full py-1.5 border border-purple-600 text-purple-400 hover:bg-purple-950/30 text-[10px] font-bold">HEAR A RUMOR</button>
      </div>
    </div>
  );
}

// ===== QUARTERS =====
function QuartersRoom({ carrier, interior, updateInterior, savedBadges, onNavigate }) {
  const [newItem, setNewItem] = useState('');
  const [materializingId, setMaterializingId] = useState(null);
  const roomItems = interior.roomItems || [];

  const handleAdd = () => {
    if (!newItem.trim()) return;
    updateInterior(carrier.id, int => ({ ...int, roomItems: [...(int.roomItems || []), { id: `item_${Date.now()}`, name: newItem.trim(), badge: null }] }));
    setNewItem('');
  };

  const handleRemove = (itemId) => {
    updateInterior(carrier.id, int => ({ ...int, roomItems: (int.roomItems || []).filter(i => i.id !== itemId) }));
  };

  const handleMaterialize = (itemId, badge) => {
    updateInterior(carrier.id, int => ({ ...int, roomItems: (int.roomItems || []).map(i => i.id === itemId ? { ...i, badge } : i) }));
    setMaterializingId(null);
  };

  return (
    <div className="space-y-3">
      <div className="border border-orange-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <BedDouble className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Commander's Cabin</h3>
        </div>
        <p className="text-orange-700 text-[10px]">Your personal quarters aboard the carrier. Keep a list of your belongings and materialize them for display.</p>
      </div>

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-500 text-xs font-bold uppercase">Add Item</div>
        <div className="flex gap-1">
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="e.g., Holographic fish tank..." className="flex-1 bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd} disabled={!newItem.trim()} className="px-3 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30"><Plus className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {roomItems.length === 0 ? (
        <div className="border border-orange-900 p-4 text-center text-orange-700 text-xs">Your quarters are empty. Add some items to make it feel like home.</div>
      ) : (
        <div className="space-y-2">
          <div className="text-orange-500 text-xs font-bold uppercase">Your Belongings ({roomItems.length})</div>
          {roomItems.map(item => (
            <div key={item.id} className="border border-orange-900 p-2 flex items-center gap-3 text-xs">
              {item.badge ? (
                <BadgeDisplay badge={item.badge} size={36} />
              ) : (
                <div className="w-9 h-9 border border-dashed border-orange-800 flex items-center justify-center text-orange-800 text-[9px]">?</div>
              )}
              <span className="text-orange-300 flex-1">{item.name}</span>
              <button onClick={() => setMaterializingId(materializingId === item.id ? null : item.id)} className="px-2 py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {item.badge ? 'EDIT' : 'MATERIALIZE'}
              </button>
              <button onClick={() => handleRemove(item.id)} className="text-red-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>

              {materializingId === item.id && (
                <div className="w-full border-t border-orange-900 pt-2 mt-2 col-span-3">
                  <div className="text-cyan-500 text-[10px] uppercase mb-1">Choose a visual representation</div>
                  {savedBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {savedBadges.map(b => (
                        <button key={b.id} onClick={() => handleMaterialize(item.id, b)} className="border border-cyan-900 p-1 hover:border-cyan-500">
                          <BadgeDisplay badge={b} size={32} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-orange-700 text-[10px]">No saved badges. Create one in the Badge Maker first.</div>
                  )}
                  {item.badge && <button onClick={() => handleMaterialize(item.id, null)} className="mt-1 text-red-600 text-[10px]">Remove materialization</button>}
                  {onNavigate && <button onClick={() => onNavigate('badgemaker')} className="mt-1 ml-2 text-cyan-600 text-[10px]">Go to Badge Maker →</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== GARDEN =====
function GardenRoom({ carrier, interior, updateInterior, surfaceDiscoveries, systemName, getSystemData }) {
  const savedPlants = interior.savedPlants || [];
  const bioDiscoveries = Object.entries(surfaceDiscoveries)
    .filter(([key, disc]) => disc.type === 'biological')
    .map(([key, disc]) => ({ key, ...disc }));

  const handlePlant = (disc) => {
    if (savedPlants.find(p => p.id === disc.key)) return;
    const bodyName = getSystemData?.bodies?.find(b => b.id === disc.bodyId)?.name || disc.bodyId || 'Unknown Body';
    const plant = {
      id: disc.key,
      name: disc.name,
      bodyName,
      systemName,
      color: PLANT_COLORS[Math.floor(Math.random() * PLANT_COLORS.length)],
      date: Date.now(),
    };
    updateInterior(carrier.id, int => ({ ...int, savedPlants: [...(int.savedPlants || []), plant] }));
  };

  const handleRemove = (plantId) => {
    updateInterior(carrier.id, int => ({ ...int, savedPlants: (int.savedPlants || []).filter(p => p.id !== plantId) }));
  };

  return (
    <div className="space-y-3">
      <div className="border border-green-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-500" />
          <h3 className="text-green-400 text-sm font-bold uppercase">Botanical Wing</h3>
        </div>
        <p className="text-green-700 text-[10px]">A climate-controlled garden where you can preserve specimens of alien flora discovered on your travels.</p>
      </div>

      {savedPlants.length > 0 && (
        <div className="border border-green-900 p-3 space-y-2">
          <div className="text-green-500 text-xs font-bold uppercase">Cultivated Plants ({savedPlants.length})</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {savedPlants.map(plant => (
              <div key={plant.id} className="border border-green-950 p-2 flex flex-col items-center gap-1 text-center">
                <PlantIcon color={plant.color} size={36} />
                <div className="text-green-300 text-[10px] font-bold">{plant.name}</div>
                <div className="text-green-700 text-[9px]">{plant.bodyName}</div>
                <div className="text-green-800 text-[8px]">{plant.systemName}</div>
                <button onClick={() => handleRemove(plant.id)} className="text-red-700 hover:text-red-500 mt-1"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-500 text-xs font-bold uppercase">Available Specimens</div>
        {bioDiscoveries.length === 0 ? (
          <div className="text-orange-700 text-xs text-center py-3">No biological discoveries to plant. Survey biological signals on planetary surfaces to collect specimens.</div>
        ) : (
          <div className="space-y-1">
            {bioDiscoveries.map(disc => {
              const planted = savedPlants.find(p => p.id === disc.key);
              return (
                <div key={disc.key} className="flex items-center justify-between border border-orange-950 p-2 text-xs">
                  <div>
                    <div className="text-orange-300">{disc.name}</div>
                    <div className="text-orange-700 text-[10px]">From: {disc.bodyId}</div>
                  </div>
                  {planted ? (
                    <span className="text-green-500 text-[10px]">✓ PLANTED</span>
                  ) : (
                    <button onClick={() => handlePlant(disc)} className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">PLANT</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== TROPHY ROOM =====
function TrophyRoom({ state }) {
  const milestones = Object.entries(state.achievements?.milestones || {});
  const records = Object.entries(state.records || {});
  const systemsScanned = state.achievements?.systemsScanned || 0;
  const bodiesScanned = state.achievements?.totalBodiesScanned || 0;
  const firstDiscoveries = Object.keys(state.achievements?.firstDiscoveries || {}).length;

  return (
    <div className="space-y-3">
      <div className="border border-yellow-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h3 className="text-yellow-400 text-sm font-bold uppercase">Hall of Records</h3>
        </div>
        <p className="text-yellow-700 text-[10px]">A display of your greatest achievements and exploration records.</p>
      </div>

      <div className="border border-yellow-900 p-3 space-y-2">
        <div className="text-yellow-500 text-xs font-bold uppercase">Exploration Stats</div>
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Systems" value={systemsScanned} />
          <StatBox label="Bodies" value={bodiesScanned} />
          <StatBox label="First Disc." value={firstDiscoveries} />
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="border border-yellow-900 p-3 space-y-2">
          <div className="text-yellow-500 text-xs font-bold uppercase">Milestones ({milestones.length})</div>
          <div className="space-y-1">
            {milestones.map(([key, m]) => (
              <div key={key} className="flex items-center gap-2 border border-yellow-950 p-2 text-xs">
                <Trophy className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                <span className="text-yellow-400 font-bold">{key.replace(/_/g, ' ').toUpperCase()}</span>
                {m.system && <span className="text-yellow-700 text-[10px]">— {m.system}</span>}
                <span className="text-yellow-800 text-[9px] ml-auto">{new Date(m.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="border border-yellow-900 p-3 space-y-2">
          <div className="text-yellow-500 text-xs font-bold uppercase">Records ({records.length})</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {records.map(([key, r]) => (
              <div key={key} className="border border-yellow-950 p-2 text-xs">
                <div className="text-yellow-700 text-[9px] uppercase">{key.replace(/_/g, ' ')}</div>
                <div className="text-yellow-300 font-bold">{typeof r.value === 'number' ? r.value.toLocaleString() : r.value}</div>
                <div className="text-yellow-800 text-[9px]">{r.bodyName} — {r.systemName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestones.length === 0 && records.length === 0 && (
        <div className="border border-yellow-900 p-4 text-center text-yellow-700 text-xs">No records yet. Get out there and explore the galaxy!</div>
      )}
    </div>
  );
}

// ===== COMMAND DECK =====
function CommandDeck({ carrier, state, requestShipTransit, isSandbox }) {
  const shipsAtCarrier = state.ownedShips.filter(s => s.storedAt?.carrierId === carrier.id);
  const shipsAvailable = state.ownedShips.filter(s => !s.storedAt?.carrierId || s.storedAt?.carrierId !== carrier.id);

  const handleTransit = (shipId) => {
    requestShipTransit(carrier.id, shipId);
  };

  return (
    <div className="space-y-3">
      <div className="border border-cyan-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-500" />
          <h3 className="text-cyan-400 text-sm font-bold uppercase">Bridge — Fleet Command</h3>
        </div>
        <p className="text-cyan-700 text-[10px]">Direct fleet operations from the bridge. Request ships to be transported to this carrier.</p>
      </div>

      {shipsAtCarrier.length > 0 && (
        <div className="border border-green-900 p-3 space-y-2">
          <div className="text-green-500 text-xs font-bold uppercase">Ships At Carrier ({shipsAtCarrier.length})</div>
          <div className="space-y-1">
            {shipsAtCarrier.map(s => (
              <div key={s.id} className="flex items-center gap-2 border border-green-950 p-2 text-xs">
                <ShipIcon className="w-3 h-3 text-green-600" />
                <span className="text-green-300">{s.customName}</span>
                <span className="text-green-700 text-[10px]">({SHIP_MAP[s.typeId]?.name || s.typeId})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-cyan-900 p-3 space-y-2">
        <div className="text-cyan-500 text-xs font-bold uppercase">Request Ship Transit</div>
        <p className="text-cyan-700 text-[10px]">Transport a stored ship to this carrier. Cost is based on ship class.</p>
        {shipsAvailable.length === 0 ? (
          <div className="text-cyan-700 text-xs text-center py-3">No ships available for transit. All stored ships are already here.</div>
        ) : (
          <div className="space-y-1">
            {shipsAvailable.map(s => {
              const shipType = SHIP_MAP[s.typeId];
              const cost = isSandbox ? 0 : (shipType?.class || 1) * 500000;
              const canAfford = isSandbox || state.credits >= cost;
              return (
                <div key={s.id} className="flex items-center justify-between border border-cyan-950 p-2 text-xs">
                  <div>
                    <div className="text-cyan-300">{s.customName}</div>
                    <div className="text-cyan-700 text-[10px]">{shipType?.name || s.typeId} · Class {shipType?.class || 1}</div>
                  </div>
                  <button onClick={() => handleTransit(s.id)} disabled={!canAfford} className="px-3 py-1 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold disabled:opacity-30">
                    {isSandbox ? 'TRANSIT — FREE' : `TRANSIT — ${cost.toLocaleString()} CR`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== OBSERVATION LOUNGE =====
function ObservationRoom({ state }) {
  const [fact, setFact] = useState('');

  const handleStargaze = () => {
    setFact(GALAXY_FACTS[Math.floor(Math.random() * GALAXY_FACTS.length)]);
  };

  const sys = state.currentSystem;
  const sysData = state.currentSystemData;

  return (
    <div className="space-y-3">
      <div className="border border-purple-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Telescope className="w-4 h-4 text-purple-500" />
          <h3 className="text-purple-400 text-sm font-bold uppercase">Observation Lounge</h3>
        </div>
        <p className="text-purple-700 text-[10px]">A panoramic viewport overlooking the stars. Relax, reflect, and gaze into the void.</p>
      </div>

      <div className="border border-purple-900 p-3 space-y-2">
        <div className="text-purple-500 text-xs font-bold uppercase">Current View</div>
        <div className="text-xs space-y-1 text-purple-600">
          <div>SYSTEM: <span className="text-purple-300">{sys.name}</span></div>
          {sysData && (
            <>
              <div>STAR CLASS: <span className="text-purple-300">{sysData.stars?.[0]?.starClass?.class || 'Unknown'}</span></div>
              <div>BODIES: <span className="text-purple-300">{sysData.bodyCount}</span></div>
              <div>FACTION: <span className="text-purple-300">{sysData.faction}</span></div>
              <div>ECONOMY: <span className="text-purple-300">{sysData.economy?.name}</span></div>
            </>
          )}
          <div>SECURITY: <span className="text-purple-300">{sys.security || 'Unknown'}</span></div>
          <div>POPULATION: <span className="text-purple-300">{(sys.population || 0).toLocaleString()}</span></div>
        </div>
      </div>

      {fact && (
        <div className="border border-purple-900 bg-purple-950/20 p-3 text-purple-300 text-xs italic">
          "{fact}"
        </div>
      )}

      <button onClick={handleStargaze} className="w-full py-2 border border-purple-500 text-purple-300 hover:bg-purple-950/30 text-xs font-bold flex items-center justify-center gap-1.5">
        <Telescope className="w-3.5 h-3.5" /> STARGAZE
      </button>

      <div className="border border-purple-900 p-3 text-purple-700 text-[10px] italic text-center">
        The stars stretch infinitely before you. Each one a story, a journey, a memory. You've come a long way, Commander.
      </div>
    </div>
  );
}

// ===== Helper components =====
function StatBox({ label, value }) {
  return (
    <div className="border border-yellow-950 p-2 text-center">
      <div className="text-yellow-300 font-bold text-lg">{value}</div>
      <div className="text-yellow-700 text-[9px] uppercase">{label}</div>
    </div>
  );
}

function PlantIcon({ color, size = 32 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <path d="M20 32 L20 18 Q14 14 10 17 Q8 21 14 24 Q17 21 20 18 Q23 21 26 24 Q32 21 30 17 Q26 14 20 18" fill={color} stroke={color} strokeWidth="0.5" />
      <rect x="16" y="28" width="8" height="8" fill="#8B4513" stroke="#5C2E0C" strokeWidth="0.5" />
    </svg>
  );
}