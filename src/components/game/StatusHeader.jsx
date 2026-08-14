// Status header — shows credits, location, fuel, cargo, rank
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { getCommodityById } from '@/lib/commodities';
import { getActiveHolidays, getNextHoliday } from '@/lib/publicHolidays';
import GalacticTicker from '@/components/game/GalacticTicker';

export default function StatusHeader() {
  const { state } = useGameState();
  const statusRGB = state.settings?.statusTextRGB || null;
  const statusShadow = statusRGB
    ? `0 0 3px rgba(${statusRGB.r},${statusRGB.g},${statusRGB.b},0.8), 0 0 6px rgba(${statusRGB.r},${statusRGB.g},${statusRGB.b},0.4)`
    : undefined;
  const headerStyle = {
    zoom: (state.settings?.uiScale?.statusHeader ?? 100) / 100,
    textShadow: statusShadow,
  };

  const cargoUsed = (state.ship?.cargo || []).reduce((sum, c) => sum + c.qty, 0);
  const systemsVisited = Object.keys(state.discoveredSystems || {}).length;
  const fuelPct = state.ship?.fuelCapacity ? (state.ship.fuel / state.ship.fuelCapacity) * 100 : 0;

  const formatCredits = (n) => {
    if (n == null) return '0';
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

  const activeHolidays = getActiveHolidays();
  const nextHoliday = getNextHoliday();

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 border-b border-orange-900/50 bg-black text-xs" style={headerStyle}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Commander</span>
          <span className="text-orange-300 font-bold">{state.commanderName || 'CMDR Unknown'}</span>
          {state.isFounderSignIn && <span className="text-yellow-500 text-[9px] border border-yellow-700 px-1 ml-1">FOUNDER</span>}
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Credits</span>
          <span className="text-orange-300 font-bold">{formatCredits(state.credits)} CR</span>
          {state.saveMode === 'sandbox' && <span className="text-cyan-400 text-[9px] border border-cyan-700 px-1 ml-1">SANDBOX</span>}
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">System</span>
          <span className="text-orange-400">{state.currentSystem?.name || '---'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Location</span>
          <span className="text-orange-400">
            {(() => {
              if (state.currentLocation === 'station') return `Docked — ${state.lastVisitedStation?.stationName || 'Station'}`;
              if (state.currentLocation === 'surface') {
                const sysData = state.currentSystemData;
                const body = sysData?.bodies?.find(b => b.id === state.currentSurfaceBody);
                return `Surface — ${body?.name || body?.designation || 'Unknown'}`;
              }
              if (state.lastOrbitBodyId) {
                const sysData = state.currentSystemData;
                const body = sysData?.bodies?.find(b => b.id === state.lastOrbitBodyId);
                if (body) return `In Orbit — ${body.name || body.designation}`;
              }
              return 'In Flight';
            })()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Security</span>
          <span className={(securityColor[state.currentSystem?.security] || 'text-orange-500') + ' capitalize'}>
            {state.currentSystem?.security || '---'}
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
            <span className="text-orange-400">{(state.ship?.fuel ?? 0).toFixed(1)}/{state.ship?.fuelCapacity ?? 0}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Cargo</span>
          <span className="text-orange-400">{cargoUsed}/{state.ship?.cargoCapacity ?? 0} T</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Rank</span>
          <span className="text-orange-400">{state.rank?.exploration?.name || '---'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-orange-700 text-[10px] uppercase">Explored</span>
          <span className="text-orange-400">{systemsVisited} / 4B</span>
        </div>
        {activeHolidays.length > 0 ? (
          <div className="flex flex-col">
            <span className="text-green-700 text-[10px] uppercase">Holiday</span>
            <span className="text-green-400 font-bold flex items-center gap-1">
              <span className="text-sm">{activeHolidays[0].icon}</span>
              <span className="text-[10px]">{activeHolidays[0].name} ({activeHolidays[0].daysLeft}d)</span>
            </span>
          </div>
        ) : nextHoliday ? (
          <div className="flex flex-col">
            <span className="text-yellow-700 text-[10px] uppercase">Next Holiday</span>
            <span className="text-yellow-500 flex items-center gap-1">
              <span className="text-sm">{nextHoliday.icon}</span>
              <span className="text-[10px]">{nextHoliday.daysUntil}d</span>
            </span>
          </div>
        ) : null}
      </div>
      <div className="w-full basis-full"><GalacticTicker /></div>
    </div>
  );
}