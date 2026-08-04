// Ship Panel — ship info, cargo, materials, shipyard, course plotting
import React, { useState } from 'react';
import { useGameState, SHIP_TYPES, SHIP_MAP, getAvailableShipsAtStation } from '@/lib/gameState';
import { COMMODITY_MAP } from '@/lib/commodities';
import { Package, Fuel, Ship as ShipIcon, Map, Trash2, ShoppingBag, Wrench, FlaskConical, ArrowUpDown, RefreshCw } from 'lucide-react';
import MaterialsLocker from './MaterialsLocker';
import ShipModelViewer from './ShipModelViewer';

export default function ShipPanel({ onNavigate }) {
  const { state, buyShip, addCredits, removeCargo, refuel, switchShip, transferShip, renameShip, getRebuyCost, update } = useGameState();
  const [tab, setTab] = useState('overview');
  const currentShip = SHIP_MAP[state.ship?.type] || SHIP_MAP['sidewinder'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShipIcon },
    { id: 'cargo', label: 'Cargo', icon: Package },
    { id: 'materials', label: 'Materials', icon: FlaskConical },
    { id: 'shipyard', label: 'Shipyard', icon: ShoppingBag },
    { id: 'navigation', label: 'Navigation', icon: Map },
    { id: 'outfitting', label: 'Outfitting', icon: Wrench },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center gap-3">
        <ShipIcon className="w-5 h-5 text-orange-500" />
        <div className="flex-1">
          <h2 className="text-orange-300 font-bold text-sm">{state.ship?.name || 'Unknown Vessel'}</h2>
          <p className="text-orange-700 text-xs">{currentShip?.manufacturer} · Class {currentShip?.class}</p>
        </div>
        {state.ship?.type !== 'custom' && (
          <div className="text-right text-[10px]">
            <div className="text-orange-700 uppercase">Rebuy</div>
            <div className="text-orange-400">{getRebuyCost(state.ship.type).toLocaleString()} CR</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-orange-900/50 p-1 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                  : 'border-transparent text-orange-700 hover:text-orange-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && <ShipOverview ship={state.ship || {}} shipType={currentShip} customShips={state.customShips || []} showShipCopilot={state.settings?.showShipCopilot !== false} onToggleShipCopilot={() => update({ settings: { ...state.settings, showShipCopilot: !(state.settings?.showShipCopilot !== false) } })} showRadioChatter={state.settings?.showRadioChatter !== false} onToggleRadioChatter={() => update({ settings: { ...state.settings, showRadioChatter: !(state.settings?.showRadioChatter !== false) } })} />}
        {tab === 'cargo' && <CargoHold cargo={state.ship?.cargo || []} onJettison={(id, qty) => removeCargo(id, qty)} />}
        {tab === 'materials' && <MaterialsLocker />}
        {tab === 'shipyard' && (
          <Shipyard
            currentShip={state.ship?.type}
            credits={state.credits}
            isDocked={state.currentLocation === 'station'}
            onBuy={(id) => buyShip(id)}
            onSwitch={(id) => switchShip(id)}
            onTransfer={(id) => transferShip(id)}
            onRename={renameShip}
            system={state.currentSystem}
            isSandbox={state.saveMode === 'sandbox'}
            ownedShips={state.ownedShips || []}
            currentStationId={state.currentStationId}
            currentSystemSeed={state.currentSystem?.seed}
            getRebuyCost={getRebuyCost}
          />
        )}
        {tab === 'navigation' && (
          <NavigationPanel onNavigate={onNavigate} />
        )}
        {tab === 'outfitting' && (
          <div className="text-center py-8 space-y-3">
            <Wrench className="w-8 h-8 mx-auto text-orange-500" />
            <p className="text-orange-300 text-sm font-bold">Outfitting & Engineering</p>
            <p className="text-orange-700 text-xs">Swap modules, install weapons, upgrade cargo racks, and apply engineering modifications.</p>
            <button
              onClick={() => onNavigate('outfitting')}
              disabled={state.currentLocation !== 'station'}
              className="px-4 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30"
            >
              {state.currentLocation === 'station' ? 'OPEN OUTFITTING' : 'DOCK AT STATION FIRST'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ShipOverview({ ship, shipType, customShips, showShipCopilot, onToggleShipCopilot, showRadioChatter, onToggleRadioChatter }) {
  const stats = [
    { label: 'Manufacturer', value: shipType?.manufacturer },
    { label: 'Ship Class', value: `Class ${shipType?.class}` },
    { label: 'Role', value: shipType?.multirole ? 'Multirole' : 'Specialist' },
    { label: 'Cargo Capacity', value: `${ship.cargoCapacity} T` },
    { label: 'Fuel Capacity', value: `${ship.fuelCapacity} T` },
    { label: 'Max Jump Range', value: `${shipType?.jumpRange} LY` },
    { label: 'Current Fuel', value: `${ship.fuel.toFixed(1)} T` },
    { label: 'Cargo Used', value: `${ship.cargo.reduce((s, c) => s + c.qty, 0)} T` },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-orange-900 p-4">
        <h3 className="text-orange-500 text-sm font-bold uppercase mb-3">Ship Specifications</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {stats.map(s => (
            <div key={s.label} className="flex justify-between border-b border-orange-950/50 pb-1">
              <span className="text-orange-700">{s.label}</span>
              <span className="text-orange-300">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D rotating ship model */}
      <div className="border border-orange-900 p-2">
        <div className="text-orange-700 text-[9px] uppercase mb-1 text-center">Wireframe Model — Drag to Rotate · Pinch to Zoom</div>
        <ShipModelViewer ship={ship} customShips={customShips} />
      </div>

      {/* Cockpit HUD settings */}
      <div className="border border-orange-900 p-4 space-y-2">
        <h3 className="text-orange-500 text-sm font-bold uppercase">Cockpit HUD</h3>
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-orange-300">Ship AI Copilot</div>
            <div className="text-orange-700 text-[10px]">Show the copilot advice panel above the body info panel in the system orrery.</div>
          </div>
          <button
            onClick={onToggleShipCopilot}
            className={`px-3 py-1 border text-[10px] font-bold ${showShipCopilot ? 'border-green-600 text-green-400' : 'border-orange-900 text-orange-700'}`}
          >
            {showShipCopilot ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-orange-300">Radio Chatter</div>
            <div className="text-orange-700 text-[10px]">Show the comms channel ticker above the body info panel in the system orrery.</div>
          </div>
          <button
            onClick={onToggleRadioChatter}
            className={`px-3 py-1 border text-[10px] font-bold ${showRadioChatter ? 'border-green-600 text-green-400' : 'border-orange-900 text-orange-700'}`}
          >
            {showRadioChatter ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CargoHold({ cargo, onJettison }) {
  if (cargo.length === 0) {
    return (
      <div className="text-center text-orange-700 py-8">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Cargo hold is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-orange-500 text-sm font-bold uppercase mb-2">Cargo Manifest</h3>
      {cargo.map(item => {
        const comm = COMMODITY_MAP[item.commodity];
        return (
          <div key={item.commodity} className="flex items-center justify-between border border-orange-900 p-2 text-xs">
            <div>
              <div className="text-orange-400">{comm?.name || item.commodity}</div>
              <div className="text-orange-700 text-[10px]">{comm?.category}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-300">{item.qty} T</span>
              <button
                onClick={() => onJettison(item.commodity, item.qty)}
                className="px-2 py-1 border border-red-900 text-red-600 hover:bg-red-950/30 text-[10px] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                JETTISON
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SORT_OPTIONS = [
  { id: 'cost', label: 'Price', icon: '💰' },
  { id: 'name', label: 'Name', icon: '📋' },
  { id: 'cargo', label: 'Cargo', icon: '📦' },
  { id: 'jumpRange', label: 'Range', icon: '🚀' },
  { id: 'class', label: 'Class', icon: '⭐' },
  { id: 'manufacturer', label: 'Maker', icon: '🏭' },
];

function Shipyard({ currentShip, credits, isDocked, onBuy, onSwitch, onTransfer, onRename, system, isSandbox, ownedShips, currentStationId, currentSystemSeed, getRebuyCost }) {
  const [yardTab, setYardTab] = useState('buy');
  const [sortBy, setSortBy] = useState('cost');
  const [sortAsc, setSortAsc] = useState(true);
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  if (!isDocked) {
    return (
      <div className="text-center text-orange-700 py-8">
        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Shipyard available when docked at a station.</p>
      </div>
    );
  }

  const availableShips = getAvailableShipsAtStation(system, isSandbox);
  const manufacturers = ['all', ...new Set(SHIP_TYPES.map(s => s.manufacturer))];

  let shipsToShow = [...SHIP_TYPES].filter(s => availableShips.has(s.id));
  if (manufacturerFilter !== 'all') {
    shipsToShow = shipsToShow.filter(s => s.manufacturer === manufacturerFilter);
  }
  // Sort keys that don't match the ship field name 1:1.
  const SORT_FIELD = { cargo: 'cargoCapacity', jumpRange: 'jumpRange', cost: 'cost', class: 'class' };
  shipsToShow.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'manufacturer') cmp = a.manufacturer.localeCompare(b.manufacturer);
    else cmp = (a[SORT_FIELD[sortBy] || sortBy] || 0) - (b[SORT_FIELD[sortBy] || sortBy] || 0);
    return sortAsc ? cmp : -cmp;
  });

  const stockLabel = system?.population > 1000000000 ? 'FULL CATALOGUE' : system?.population > 1000000 ? 'STANDARD RANGE' : system?.population > 0 ? 'LIMITED SELECTION' : 'BASIC VESSELS ONLY';

  const handleSort = (key) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  };

  const handleRenameSubmit = (shipId) => {
    if (renameValue.trim()) onRename(shipId, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div className="space-y-3">
      {/* Sub-tabs: Buy vs Stored */}
      <div className="flex gap-1">
        <button onClick={() => setYardTab('buy')} className={`flex-1 py-1.5 text-xs border ${yardTab === 'buy' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>
          <ShoppingBag className="w-3 h-3 inline mr-1" /> PURCHASE
        </button>
        <button onClick={() => setYardTab('stored')} className={`flex-1 py-1.5 text-xs border ${yardTab === 'stored' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>
          <RefreshCw className="w-3 h-3 inline mr-1" /> STORED ({ownedShips.length})
        </button>
      </div>

      {yardTab === 'buy' && (
        <>
          {/* Sort + filter controls */}
          <div className="border border-orange-900 p-2 space-y-2">
            <div className="flex items-center gap-1 text-[10px]">
              <ArrowUpDown className="w-3 h-3 text-orange-600" />
              <span className="text-orange-700 uppercase">Sort:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSort(opt.id)}
                  className={`px-1.5 py-0.5 border ${sortBy === opt.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
                >
                  {opt.label}{sortBy === opt.id ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] flex-wrap">
              <span className="text-orange-700 uppercase">Maker:</span>
              {manufacturers.slice(0, 8).map(m => (
                <button
                  key={m}
                  onClick={() => setManufacturerFilter(m)}
                  className={`px-1.5 py-0.5 border ${manufacturerFilter === m ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
                >
                  {m === 'all' ? 'ALL' : m.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="text-orange-700 text-[10px]">STOCK: <span className="text-orange-400">{stockLabel}</span> · {shipsToShow.length} vessels available</div>
          </div>

          {/* Ship list */}
          {shipsToShow.map(ship => {
            const isCurrent = ship.id === currentShip;
            const canAfford = isSandbox || credits >= ship.cost;
            const rebuy = getRebuyCost(ship.id);
            return (
              <div key={ship.id} className={`border p-3 text-xs ${isCurrent ? 'border-green-700' : 'border-orange-900'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-orange-300 font-bold">{ship.name}</div>
                    <div className="text-orange-700 text-[10px]">{ship.manufacturer} · Class {ship.class} · {ship.multirole ? 'Multirole' : 'Specialist'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400">{isSandbox ? 'FREE' : ship.cost === 0 ? 'STARTER' : `${ship.cost.toLocaleString()} CR`}</div>
                    <div className="text-orange-700 text-[9px]">Rebuy: {rebuy.toLocaleString()} CR</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-orange-600">
                  <div>Cargo: <span className="text-orange-400">{ship.cargoCapacity}T</span></div>
                  <div>Fuel: <span className="text-orange-400">{ship.fuelCapacity}T</span></div>
                  <div>Jump: <span className="text-orange-400">{ship.jumpRange}LY</span></div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => {
                      if (canAfford) onBuy(ship.id);
                      else alert('INSUFFICIENT CREDITS');
                    }}
                    disabled={!isSandbox && !canAfford}
                    className="mt-2 w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 disabled:opacity-30 text-[10px]"
                  >
                    {isSandbox ? 'PURCHASE (FREE)' : canAfford ? 'PURCHASE' : 'INSUFFICIENT CREDITS'}
                  </button>
                )}
                {isCurrent && <div className="mt-2 text-center text-green-600 text-[10px]">✓ CURRENTLY PILOTED</div>}
              </div>
            );
          })}
        </>
      )}

      {yardTab === 'stored' && (
        <div className="space-y-2">
          {ownedShips.length === 0 ? (
            <div className="text-center text-orange-700 py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No stored ships.</p>
              <p className="text-[10px] mt-1">Purchase a new ship to store your current one here.</p>
            </div>
          ) : (
            ownedShips.map(stored => {
              const shipType = SHIP_MAP[stored.typeId];
              if (!shipType) return null;
              const atThisStation = stored.storedAt?.systemSeed === currentSystemSeed && stored.storedAt?.stationId === currentStationId;
              const atThisSystem = stored.storedAt?.systemSeed === currentSystemSeed;
              const rebuy = getRebuyCost(stored.typeId);
              const transferCost = isSandbox ? 0 : Math.ceil(shipType.cost * 0.01) + 10000;
              return (
                <div key={stored.id} className={`border p-3 text-xs ${atThisStation ? 'border-green-800' : 'border-orange-900'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {renamingId === stored.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(stored.id)}
                            maxLength={24}
                            autoFocus
                            className="bg-black border border-orange-700 text-orange-300 px-1 py-0.5 text-xs w-full"
                          />
                          <button onClick={() => handleRenameSubmit(stored.id)} className="px-1 py-0.5 border border-orange-500 text-orange-400 text-[9px]">OK</button>
                        </div>
                      ) : (
                        <div className="text-orange-300 font-bold cursor-pointer hover:text-orange-500" onClick={() => { setRenamingId(stored.id); setRenameValue(stored.customName || shipType.name); }}>
                          {stored.customName || shipType.name} ✎
                        </div>
                      )}
                      <div className="text-orange-700 text-[10px]">{shipType.manufacturer} · Class {shipType.class}</div>
                      <div className="text-orange-600 text-[10px] mt-0.5">
                        {atThisStation ? <span className="text-green-500">✓ At this station</span> :
                         atThisSystem ? <span className="text-yellow-600">In this system (different station)</span> :
                         <span>Stored at: {stored.storedAt?.systemName || 'Unknown'}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-700 text-[9px]">Rebuy: {rebuy.toLocaleString()} CR</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-orange-600">
                    <div>Cargo: <span className="text-orange-400">{shipType.cargoCapacity}T</span></div>
                    <div>Fuel: <span className="text-orange-400">{shipType.fuelCapacity}T</span></div>
                    <div>Jump: <span className="text-orange-400">{shipType.jumpRange}LY</span></div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {atThisStation ? (
                      <button onClick={() => onSwitch(stored.id)} className="flex-1 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">
                        SWITCH TO THIS SHIP
                      </button>
                    ) : (
                      <button
                        onClick={() => { if (isSandbox || credits >= transferCost) onTransfer(stored.id); else alert('INSUFFICIENT CREDITS FOR TRANSFER'); }}
                        disabled={!isSandbox && credits < transferCost}
                        className="flex-1 py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] disabled:opacity-30"
                      >
                        {isSandbox ? 'TRANSFER (FREE)' : `TRANSFER — ${transferCost.toLocaleString()} CR`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function NavigationPanel({ onNavigate }) {
  const { state } = useGameState();

  return (
    <div className="space-y-3">
      <h3 className="text-orange-500 text-sm font-bold uppercase mb-2">Navigation Computer</h3>
      <div className="border border-orange-900 p-3 text-xs space-y-2">
        <div className="text-orange-700 uppercase text-[10px]">Current System</div>
        <div className="text-orange-300 font-bold">{state.currentSystem.name}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-orange-600">
          <div>POSITION: <span className="text-orange-400">{state.currentSystem.x.toFixed(0)}, {state.currentSystem.y.toFixed(0)}, {state.currentSystem.z.toFixed(0)}</span></div>
          <div>STAR TYPE: <span className="text-orange-400">{state.currentSystem.starClass?.name}</span></div>
          <div>SECURITY: <span className="text-orange-400 capitalize">{state.currentSystem.security}</span></div>
          <div>POPULATION: <span className="text-orange-400">{state.currentSystem.population > 0 ? state.currentSystem.population.toLocaleString() : 'Uninhabited'}</span></div>
        </div>
      </div>

      <div className="border border-orange-900 p-3 text-xs space-y-2">
        <div className="text-orange-700 uppercase text-[10px]">Ship Status</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-orange-600">
          <div>FUEL: <span className="text-orange-400">{state.ship.fuel.toFixed(1)}/{state.ship.fuelCapacity} T</span></div>
          <div>JUMPS REMAINING: <span className="text-orange-400">{Math.floor(state.ship.fuel / 4)}</span></div>
        </div>
      </div>

      <div className="border border-orange-900 p-3 text-xs space-y-2">
        <div className="text-orange-700 uppercase text-[10px]">Flight Logs</div>
        <div className="text-orange-600">TOTAL JUMPS: <span className="text-orange-400">{state.totalJumps}</span></div>
        <div className="text-orange-600">TOTAL PROFIT: <span className="text-orange-400">{state.totalProfit.toLocaleString()} CR</span></div>
        <div className="text-orange-600">DISCOVERED SYSTEMS: <span className="text-orange-400">{Object.keys(state.discoveredSystems).length}</span></div>
        <div className="text-orange-600">SCANNED BODIES: <span className="text-orange-400">{Object.keys(state.scannedBodies).length}</span></div>
        <div className="text-orange-600">ACTIVE COLONIES: <span className="text-orange-400">{state.colonies.length}</span></div>
      </div>

      <button
        onClick={() => onNavigate('galaxy')}
        className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold"
      >
        OPEN GALAXY MAP — PLOT COURSE
      </button>
    </div>
  );
}