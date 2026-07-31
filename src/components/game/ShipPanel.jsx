// Ship Panel — ship info, cargo management, shipyard, course plotting
import React, { useState } from 'react';
import { useGameState, SHIP_TYPES, SHIP_MAP, getAvailableShipsAtStation } from '@/lib/gameState';
import { COMMODITY_MAP } from '@/lib/commodities';
import { Package, Fuel, Ship as ShipIcon, Map, Trash2, ShoppingBag, Wrench } from 'lucide-react';

export default function ShipPanel({ onNavigate }) {
  const { state, buyShip, addCredits, removeCargo, refuel } = useGameState();
  const [tab, setTab] = useState('overview');
  const currentShip = SHIP_MAP[state.ship.type];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShipIcon },
    { id: 'cargo', label: 'Cargo Hold', icon: Package },
    { id: 'shipyard', label: 'Shipyard', icon: ShoppingBag },
    { id: 'navigation', label: 'Navigation', icon: Map },
    { id: 'outfitting', label: 'Outfitting', icon: Wrench },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center gap-3">
        <ShipIcon className="w-5 h-5 text-orange-500" />
        <div>
          <h2 className="text-orange-300 font-bold text-sm">{state.ship.name}</h2>
          <p className="text-orange-700 text-xs">{currentShip?.manufacturer} · Class {currentShip?.class}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-orange-900/50 p-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all ${
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
        {tab === 'overview' && <ShipOverview ship={state.ship} shipType={currentShip} />}
        {tab === 'cargo' && <CargoHold cargo={state.ship.cargo} onJettison={(id, qty) => removeCargo(id, qty)} />}
        {tab === 'shipyard' && (
          <Shipyard
            currentShip={state.ship.type}
            credits={state.credits}
            isDocked={state.currentLocation === 'station'}
            onBuy={(id) => buyShip(id)}
            system={state.currentSystem}
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

function ShipOverview({ ship, shipType }) {
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

      {/* Ship wireframe visual */}
      <div className="border border-orange-900 p-4 flex justify-center">
        <svg width="200" height="120" viewBox="0 0 200 120" className="text-orange-500">
          {/* Simple wireframe ship */}
          <polygon points="100,10 160,80 140,100 100,90 60,100 40,80" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points="100,10 100,90" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <polygon points="40,80 160,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <line x1="100" y1="90" x2="80" y2="110" stroke="currentColor" strokeWidth="0.5" />
          <line x1="100" y1="90" x2="120" y2="110" stroke="currentColor" strokeWidth="0.5" />
          <line x1="60" y1="100" x2="60" y2="115" stroke="currentColor" strokeWidth="0.5" />
          <line x1="140" y1="100" x2="140" y2="115" stroke="currentColor" strokeWidth="0.5" />
        </svg>
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

function Shipyard({ currentShip, credits, isDocked, onBuy, system }) {
  if (!isDocked) {
    return (
      <div className="text-center text-orange-700 py-8">
        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Shipyard available when docked at a station.</p>
        <p className="text-[10px] mt-1">Manage stored ships in the Fleet screen.</p>
      </div>
    );
  }
  const availableShips = getAvailableShipsAtStation(system);
  const stockLabel = system?.population > 1000000000 ? 'FULL CATALOGUE' : system?.population > 1000000 ? 'STANDARD RANGE' : system?.population > 0 ? 'LIMITED SELECTION' : 'BASIC VESSELS ONLY';
  return (
    <div className="space-y-2">
      <h3 className="text-orange-500 text-sm font-bold uppercase mb-2">Shipyard — Available Vessels</h3>
      <div className="text-orange-700 text-[10px] mb-2">STOCK LEVEL: <span className="text-orange-400">{stockLabel}</span></div>
      {[...SHIP_TYPES].filter(s => availableShips.has(s.id)).sort((a, b) => a.cost - b.cost).map(ship => {
        const isCurrent = ship.id === currentShip;
        const canAfford = credits >= ship.cost;
        return (
          <div key={ship.id} className={`border p-3 text-xs ${isCurrent ? 'border-green-700' : 'border-orange-900'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-orange-300 font-bold">{ship.name}</div>
                <div className="text-orange-700 text-[10px]">{ship.manufacturer} · Class {ship.class} · {ship.multirole ? 'Multirole' : 'Specialist'}</div>
              </div>
              <div className="text-right">
                <div className="text-orange-400">{ship.cost === 0 ? 'STARTER' : `${ship.cost.toLocaleString()} CR`}</div>
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
                  if (canAfford) {
                    onBuy(ship.id);
                  } else {
                    alert('INSUFFICIENT CREDITS');
                  }
                }}
                disabled={!canAfford}
                className="mt-2 w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 disabled:opacity-30 text-[10px]"
              >
                {canAfford ? 'PURCHASE' : 'INSUFFICIENT CREDITS'}
              </button>
            )}
            {isCurrent && <div className="mt-2 text-center text-green-600 text-[10px]">✓ CURRENTLY PILOTED</div>}
          </div>
        );
      })}
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