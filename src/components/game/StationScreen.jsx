// Station Screen — docking services overview
import React, { useState } from 'react';
import { useGameState, getOutfittingLevel, OUTFITTING_LEVELS } from '@/lib/gameState';
import { Home, Fuel, Wrench, ShoppingCart, Ship as ShipIcon, Telescope, Map, Pickaxe, Rocket, LogOut, ClipboardList, Settings as SettingsIcon } from 'lucide-react';

export default function StationScreen({ onNavigate }) {
  const { state, getSystemData, leaveStation, refuel, addCredits } = useGameState();
  const [refuelAmount, setRefuelAmount] = useState(0);
  const systemData = getSystemData();
  const station = systemData?.stations.find(s => s.id === state.currentStationId);

  if (!station) {
    return (
      <div className="w-full h-full flex items-center justify-center text-orange-500 p-4 text-center">
        <div>
          <p className="mb-2">No station data available.</p>
          <button onClick={() => onNavigate('galaxy')} className="text-orange-400 underline">Return to Galaxy Map</button>
        </div>
      </div>
    );
  }

  const isSandbox = state.saveMode === 'sandbox';
  const fuelNeeded = state.ship.fuelCapacity - state.ship.fuel;
  const refuelCost = isSandbox ? 0 : Math.ceil(refuelAmount * 50);
  const fullRefuelCost = isSandbox ? 0 : Math.ceil(fuelNeeded * 50);
  const outfittingLevelIndex = Math.max(0, Math.min(4, getOutfittingLevel(state.currentSystem, systemData, isSandbox) - 1));
  const outfittingLevel = OUTFITTING_LEVELS[outfittingLevelIndex];

  const handleRefuel = () => {
    if (refuelAmount <= 0) return;
    if (!isSandbox && refuelCost > state.credits) return;
    refuel(refuelAmount);
    if (!isSandbox) addCredits(-refuelCost);
    setRefuelAmount(0);
  };

  const handleFullRefuel = () => {
    if (fuelNeeded <= 0) return;
    if (!isSandbox && fullRefuelCost > state.credits) return;
    refuel(fuelNeeded);
    if (!isSandbox) addCredits(-fullRefuelCost);
  };

  const stationTypeNames = {
    coriolis: 'Coriolis Starport',
    orbis: 'Orbis Starport',
    outpost: 'Outpost',
    planetary: 'Planetary Port',
    megaship: 'Megaship',
    asteroid: 'Asteroid Base',
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Station header */}
      <div className="border border-orange-700 p-4 bg-black">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-orange-300 text-lg font-bold">{station.name}</h2>
            <p className="text-orange-600 text-sm">{stationTypeNames[station.type]}</p>
            <p className="text-orange-700 text-xs mt-1">ORBITING: {station.parentName}</p>
            <p className="text-orange-700 text-xs">ECONOMY: {station.economy.name}</p>
            <p className="text-orange-700 text-xs">DISTANCE FROM STAR: {station.distanceFromStar.toFixed(1)} LS</p>
          </div>
          <div className="text-right">
            <p className="text-orange-700 text-xs uppercase">System</p>
            <p className="text-orange-400 text-sm">{state.currentSystem.name}</p>
            <p className="text-orange-700 text-xs capitalize">{state.currentSystem.security} Security</p>
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div>
        <h3 className="text-orange-500 text-sm font-bold mb-2 uppercase">Station Services</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <ServiceButton icon={ShoppingCart} label="Commodity Market" available={station.services.market} onClick={() => onNavigate('market')} />
          <ServiceButton icon={ClipboardList} label="Mission Board" available={station.services.missions} onClick={() => onNavigate('missions')} />
          <ServiceButton icon={ShipIcon} label="Shipyard" available={true} onClick={() => onNavigate('ship')} />
          <ServiceButton icon={Wrench} label="Outfitting" available={true} onClick={() => onNavigate('outfitting')} />
          <ServiceButton icon={Telescope} label="Cartographics" available={station.services.cartographics} onClick={() => onNavigate('exploration')} />
          <ServiceButton icon={Map} label="Galaxy Map" available={true} onClick={() => onNavigate('galaxy')} />
          <ServiceButton icon={Pickaxe} label="Refinery & Mining" available={true} onClick={() => onNavigate('mining')} />
          <ServiceButton icon={Rocket} label="Colonization Office" available={true} onClick={() => onNavigate('colonization')} />
          <ServiceButton icon={Home} label="System Map" available={true} onClick={() => onNavigate('system')} />
        </div>
      </div>

      {/* Outfitting capability */}
      <div className="border border-orange-900 p-3 bg-black">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Outfitting & Engineering</h3>
        </div>
        <div className="text-xs space-y-1">
          <div className="text-orange-600">TECH LEVEL: <span className="text-orange-300">{outfittingLevel.name} ({outfittingLevelIndex + 1}/5)</span></div>
          <div className="text-orange-700 text-[10px]">{outfittingLevel.desc}</div>
          <div className="text-orange-600 mt-1">SHIPYARD STOCK: <span className="text-orange-300">{state.currentSystem.population > 1000000000 ? 'Full Catalogue' : state.currentSystem.population > 1000000 ? 'Standard Range' : state.currentSystem.population > 0 ? 'Limited Selection' : 'Basic Vessels Only'}</span></div>
        </div>
      </div>

      {/* Refuel panel */}
      {station.services.refuel && (
        <div className="border border-orange-900 p-3 bg-black">
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-400 text-sm font-bold uppercase">Refueling Service</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-orange-600">FUEL: <span className="text-orange-300">{state.ship.fuel.toFixed(1)}/{state.ship.fuelCapacity}</span></div>
            <div className="text-orange-600">COST: <span className="text-orange-300">50 CR/T</span></div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min="0"
              max={fuelNeeded}
              step="0.5"
              value={refuelAmount}
              onChange={(e) => setRefuelAmount(parseFloat(e.target.value))}
              className="flex-1 accent-orange-600"
            />
            <span className="text-orange-400 text-xs w-16 text-right">{refuelAmount.toFixed(1)} T</span>
            <button
              onClick={() => setRefuelAmount(fuelNeeded)}
              className="text-[10px] px-2 py-1 border border-orange-800 text-orange-500 hover:bg-orange-950/50"
            >MAX</button>
            <button
              onClick={handleRefuel}
              disabled={refuelAmount <= 0 || (!isSandbox && refuelCost > state.credits)}
              className="text-xs px-3 py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 disabled:opacity-30"
            >{isSandbox ? 'REFUEL (FREE)' : `REFUEL (${refuelCost} CR)`}</button>
          </div>
          {fuelNeeded > 0 && (
            <button
              onClick={handleFullRefuel}
              disabled={!isSandbox && fullRefuelCost > state.credits}
              className="mt-2 w-full text-xs py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 disabled:opacity-30"
            >
              {isSandbox ? 'FULL REFUEL — FREE' : `FULL REFUEL — ${fullRefuelCost} CR`}
            </button>
          )}
        </div>
      )}

      {/* Repair panel */}
      {station.services.repair && (
        <div className="border border-orange-900 p-3 bg-black">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-400 text-sm font-bold uppercase">Maintenance & Repair</h3>
          </div>
          <p className="text-orange-700 text-xs mt-1">Ship integrity: <span className="text-green-500">100%</span> — No repairs needed.</p>
        </div>
      )}

      {/* Undock */}
      <button
        onClick={() => { leaveStation(); onNavigate('system'); }}
        className="w-full py-3 border border-orange-500 text-orange-300 hover:bg-orange-950/50 flex items-center justify-center gap-2 font-bold"
      >
        <LogOut className="w-4 h-4" />
        UNDOCK — ENTER SUPERCRUISE
      </button>
    </div>
  );
}

function ServiceButton({ icon: Icon, label, available, onClick }) {
  return (
    <button
      onClick={available ? onClick : undefined}
      disabled={!available}
      className={`flex flex-col items-center gap-2 p-3 border transition-all ${
        available
          ? 'border-orange-800 text-orange-400 hover:border-orange-500 hover:bg-orange-950/30'
          : 'border-gray-900 text-gray-700 cursor-not-allowed'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] text-center leading-tight">{label}</span>
      {!available && <span className="text-[9px] text-gray-800">UNAVAILABLE</span>}
    </button>
  );
}