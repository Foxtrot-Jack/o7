// Station Screen — docking services overview (reworked layout)
// Refuel/Repair/Refit at top, starport services below
import React, { useState } from 'react';
import { useGameState, getOutfittingLevel, OUTFITTING_LEVELS } from '@/lib/gameState';
import { Home, Fuel, Wrench, ShoppingCart, Ship as ShipIcon, Telescope, Map, Pickaxe, Rocket, LogOut, ClipboardList, Settings as SettingsIcon, ArrowLeftRight, FlaskConical, Users, Skull, Crosshair, UserCheck, ScrollText, Save } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';
import { getStationEngineer } from '@/lib/engineers';

export default function StationScreen({ onNavigate }) {
  const { state, getSystemData, leaveStation, refuel, addCredits, repairShip, manualSave } = useGameState();
  const [refuelAmount, setRefuelAmount] = useState(0);
  const [saveFlash, setSaveFlash] = useState(false);
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
  const fuelNeeded = (state.ship?.fuelCapacity ?? 0) - (state.ship?.fuel ?? 0);
  const refuelCost = isSandbox ? 0 : Math.ceil(refuelAmount * 50);
  const fullRefuelCost = isSandbox ? 0 : Math.ceil(fuelNeeded * 50);
  const outfittingLevelIndex = Math.max(0, Math.min(4, getOutfittingLevel(state.currentSystem, systemData, isSandbox) - 1));
  const outfittingLevel = OUTFITTING_LEVELS[outfittingLevelIndex];
  const engineer = getStationEngineer(state.currentSystem, systemData, isSandbox);

  const handleRefuel = () => {
    if (refuelAmount <= 0) return;
    if (!isSandbox && refuelCost > state.credits) return;
    soundEngine.play('confirm');
    refuel(refuelAmount);
    if (!isSandbox) addCredits(-refuelCost);
    setRefuelAmount(0);
  };

  const handleFullRefuel = () => {
    if (fuelNeeded <= 0) return;
    if (!isSandbox && fullRefuelCost > state.credits) return;
    soundEngine.play('confirm');
    refuel(fuelNeeded);
    if (!isSandbox) addCredits(-fullRefuelCost);
  };

  const handleManualSave = () => {
    const ok = manualSave();
    soundEngine.play(ok ? 'confirm' : 'error');
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const stationTypeNames = {
    coriolis: 'Coriolis Starport',
    orbis: 'Orbis Starport',
    outpost: 'Outpost',
    planetary: 'Planetary Port',
    megaship: 'Megaship',
    asteroid: 'Asteroid Base',
  };

  // Integrity for repair
  const integrity = state.ship?.integrity ?? 100;
  const damage = 100 - integrity;
  const repairCost = isSandbox ? 0 : Math.ceil(damage * 10000);
  const intColor = integrity > 70 ? 'text-green-500' : integrity > 30 ? 'text-yellow-500' : 'text-red-500';
  const barColor = integrity > 70 ? 'bg-green-600' : integrity > 30 ? 'bg-yellow-600' : 'bg-red-600';

  // Starport services grouped
  const serviceGroups = [
    {
      label: 'Trade & Missions',
      services: [
        { icon: ShoppingCart, label: 'Commodity Market', available: station.services.market, nav: 'market' },
        { icon: ClipboardList, label: 'Mission Board', available: station.services.missions, nav: 'missions' },
        { icon: Crosshair, label: 'Bounty Board', available: true, nav: 'bountyboard' },
        { icon: UserCheck, label: 'Passenger Lounge', available: true, nav: 'passengers' },
        { icon: Skull, label: 'Black Market', available: state.currentSystem?.security === 'anarchy', nav: 'blackmarket' },
      ],
    },
    {
      label: 'Ships & Outfitting',
      services: [
        { icon: ShipIcon, label: 'Shipyard', available: true, nav: 'ship' },
        { icon: Wrench, label: 'Outfitting', available: true, nav: 'outfitting' },
        { icon: FlaskConical, label: 'Engineering', available: !!engineer, note: engineer ? `${engineer.name} · G${engineer.maxGrade}` : null, nav: 'engineering' },
        { icon: ArrowLeftRight, label: 'Material Trader', available: true, nav: 'materialtrader' },
        { icon: FlaskConical, label: 'Synthesis', available: true, nav: 'synthesis' },
      ],
    },
    {
      label: 'Crew & Support',
      services: [
        { icon: Users, label: 'Crew Quarters', available: true, nav: 'crew' },
        { icon: Users, label: 'Multi-Crew', available: true, nav: 'multicrew' },
        { icon: ScrollText, label: 'Cartographics', available: station.services.cartographics, nav: 'cartography' },
        { icon: Telescope, label: 'Exploration', available: true, nav: 'exploration' },
        { icon: Pickaxe, label: 'Refinery & Mining', available: true, nav: 'mining' },
        { icon: Rocket, label: 'Colonization', available: true, nav: 'colonization' },
      ],
    },
    {
      label: 'Navigation',
      services: [
        { icon: Map, label: 'Galaxy Map', available: true, nav: 'galaxy' },
        { icon: Home, label: 'System Map', available: true, nav: 'system' },
      ],
    },
  ];

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
            <p className="text-orange-700 text-xs">DISTANCE FROM STAR: {(station.distanceFromStar ?? 0).toFixed(1)} LS</p>
          </div>
          <div className="text-right">
            <p className="text-orange-700 text-xs uppercase">System</p>
            <p className="text-orange-400 text-sm">{state.currentSystem?.name || '---'}</p>
            <p className="text-orange-700 text-xs capitalize">{state.currentSystem?.security || 'unknown'} Security</p>
          </div>
        </div>
      </div>

      {/* === TOP BAR: Refuel / Repair / Refit side by side === */}
      <div className="grid grid-cols-3 gap-2">
        {/* Refuel */}
        <div className="border border-orange-900 p-3 bg-black space-y-2">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-400 text-xs font-bold uppercase">Refuel</h3>
          </div>
          <div className="text-[10px] text-orange-600">
            FUEL: <span className="text-orange-300">{(state.ship?.fuel ?? 0).toFixed(1)}/{state.ship?.fuelCapacity ?? 0}</span>
          </div>
          {fuelNeeded > 0 ? (
            <>
              <input
                type="range" min="0" max={fuelNeeded} step="0.5"
                value={refuelAmount}
                onChange={(e) => setRefuelAmount(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-orange-400">{refuelAmount.toFixed(1)} T</span>
                <span className="text-orange-600">{isSandbox ? 'FREE' : `${refuelCost} CR`}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setRefuelAmount(fuelNeeded)} className="flex-1 text-[9px] px-1 py-1 border border-orange-800 text-orange-500 hover:bg-orange-950/50">MAX</button>
                <button onClick={handleRefuel} disabled={refuelAmount <= 0 || (!isSandbox && refuelCost > state.credits)} className="flex-1 text-[9px] px-1 py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 disabled:opacity-30">REFUEL</button>
              </div>
              <button onClick={handleFullRefuel} disabled={!isSandbox && fullRefuelCost > state.credits} className="w-full text-[9px] py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 disabled:opacity-30">
                {isSandbox ? 'FULL (FREE)' : `FULL — ${fullRefuelCost} CR`}
              </button>
            </>
          ) : (
            <p className="text-green-500 text-[10px]">Fuel tank full.</p>
          )}
        </div>

        {/* Repair */}
        <div className="border border-orange-900 p-3 bg-black space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-400 text-xs font-bold uppercase">Repair</h3>
          </div>
          <div className="text-[10px]">
            HULL: <span className={intColor}>{integrity.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-black border border-orange-900">
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${integrity}%` }} />
          </div>
          {damage > 0 ? (
            <button
              onClick={() => { soundEngine.play('confirm'); repairShip(damage); if (!isSandbox) addCredits(-repairCost); }}
              disabled={!isSandbox && state.credits < repairCost}
              className="w-full text-[9px] py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 disabled:opacity-30 font-bold"
            >
              {isSandbox ? 'FULL REPAIR (FREE)' : `REPAIR — ${repairCost.toLocaleString()} CR`}
            </button>
          ) : (
            <p className="text-green-500 text-[10px]">All systems nominal.</p>
          )}
        </div>

        {/* Refit / Outfitting quick access */}
        <div className="border border-orange-900 p-3 bg-black space-y-2">
          <div className="flex items-center gap-2">
            <ShipIcon className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-400 text-xs font-bold uppercase">Refit</h3>
          </div>
          <div className="text-[10px] text-orange-600">
            TECH: <span className="text-orange-300">{outfittingLevel.name}</span>
          </div>
          <div className="text-[9px] text-orange-700">{outfittingLevel.desc}</div>
          {engineer ? (
            <div className="text-[9px] text-cyan-500 border-t border-orange-950 pt-1">ENGINEER: <span className="text-cyan-400">{engineer.name}</span> · G{engineer.maxGrade}</div>
          ) : (
            <div className="text-[9px] text-orange-800 border-t border-orange-950 pt-1">No resident engineer</div>
          )}
          <button onClick={() => onNavigate('outfitting')} className="w-full text-[9px] py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 font-bold">
            OUTFITTING
          </button>
          <button onClick={() => onNavigate('ship')} className="w-full text-[9px] py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30">
            SHIPYARD
          </button>
        </div>
      </div>

      {/* Manual Save button */}
      <button
        onClick={handleManualSave}
        className={`w-full py-2 border flex items-center justify-center gap-2 text-xs font-bold transition-all ${saveFlash ? 'border-green-600 text-green-400 bg-green-950/30' : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'}`}
      >
        <Save className="w-4 h-4" />
        {saveFlash ? '✓ GAME SAVED' : 'SAVE GAME'}
      </button>

      {/* === STARPORT SERVICES below === */}
      <div>
        <h3 className="text-orange-500 text-sm font-bold mb-2 uppercase">Starport Services</h3>
        <div className="space-y-3">
          {serviceGroups.map(group => (
            <div key={group.label}>
              <div className="text-orange-700 text-[10px] uppercase mb-1 border-b border-orange-950 pb-0.5">{group.label}</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                {group.services.map(svc => (
                  <ServiceButton key={svc.nav} icon={svc.icon} label={svc.label} available={svc.available} onClick={() => onNavigate(svc.nav)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

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

function ServiceButton({ icon: Icon, label, available, note, onClick }) {
  return (
    <button
      onClick={available ? () => { soundEngine.play('click'); onClick(); } : undefined}
      disabled={!available}
      className={`flex flex-col items-center gap-0.5 p-2 border transition-all ${
        available
          ? 'border-orange-800 text-orange-400 hover:border-orange-500 hover:bg-orange-950/30'
          : 'border-gray-900 text-gray-700 cursor-not-allowed'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[9px] text-center leading-tight">{label}</span>
      {available && note && <span className="text-[8px] text-cyan-600 text-center leading-tight">{note}</span>}
      {!available && <span className="text-[8px] text-gray-800">N/A</span>}
    </button>
  );
}