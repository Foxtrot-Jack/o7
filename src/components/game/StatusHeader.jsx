// Status header — shows credits, location, fuel, cargo, rank
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { getCommodityById } from '@/lib/commodities';

export default function StatusHeader() {
  const { state } = useGameState();

  const cargoUsed = state.ship.cargo.reduce((sum, c) => sum + c.qty, 0);
  const systemsVisited = Object.keys(state.discoveredSystems || {}).length;
  const fuelPct = (state.ship.fuel / state.ship.fuelCapacity) * 100;

  const formatCredits = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const securityColor = {
    high: 'text-green-500',
    medium: 'text-yellow-500',
    low: 'text-orange-500',
    anarchy: 'text-red-500',
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 border-b border-orange-900/50 bg-black text-xs">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Credits</span>
          <span className="text-orange-300 font-bold">{formatCredits(state.credits)} CR</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">System</span>
          <span className="text-orange-400">{state.currentSystem.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Location</span>
          <span className="text-orange-400">
            {state.currentLocation === 'station' ? 'Docked' : 'In Supercruise'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Security</span>
          <span className={securityColor[state.currentSystem.security] + ' capitalize'}>
            {state.currentSystem.security}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Fuel</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 border border-orange-800 bg-black">
              <div
                className="h-full transition-all"
                style={{
                  width: `${fuelPct}%`,
                  background: fuelPct > 30 ? '#ff8800' : '#ff2200',
                }}
              />
            </div>
            <span className="text-orange-400">{state.ship.fuel.toFixed(1)}/{state.ship.fuelCapacity}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Cargo</span>
          <span className="text-orange-400">{cargoUsed}/{state.ship.cargoCapacity} T</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Rank</span>
          <span className="text-orange-400">{state.rank.exploration.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Explored</span>
          <span className="text-orange-400">{systemsVisited} / 4B</span>
        </div>
      </div>
    </div>
  );
}