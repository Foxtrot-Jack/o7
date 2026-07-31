// Station Builder — construct and manage player-owned orbital stations
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { STATION_ECONOMIES, STATION_SERVICES, STATION_BUILD_COST, calculateStationRevenue } from '@/lib/stationBuilder';
import { Building, Coins, Plus, Factory, MapPin } from 'lucide-react';

export default function StationBuilderScreen() {
  const { state, buildStation, upgradeStationService, collectStationRevenue } = useGameState();
  const [selectedColony, setSelectedColony] = useState(null);
  const [stationName, setStationName] = useState('');
  const [selectedEconomy, setSelectedEconomy] = useState('industrial');
  const ownedStations = state.ownedStations || [];
  const isSandbox = state.saveMode === 'sandbox';
  const coloniesHere = (state.colonies || []).filter(c => c.systemSeed === state.currentSystem?.seed);

  const handleBuild = () => {
    if (!selectedColony) return;
    buildStation(stationName || undefined, selectedEconomy, selectedColony);
    setSelectedColony(null);
    setStationName('');
  };

  const pendingRevenue = (station) => calculateStationRevenue(station, station.lastRevenueCollection);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Station Construction</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Build orbital stations at your colonies. Stations generate passive trade revenue based on economy type and installed services.</div>
      </div>

      {/* Build new station */}
      {coloniesHere.length > 0 ? (
        <div className="border border-orange-900 p-3 space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Build New Station — {STATION_BUILD_COST.toLocaleString()} CR</h3>
          <div className="space-y-1">
            <div className="text-[10px] text-orange-600">Select colony:</div>
            {coloniesHere.map(c => (
              <button key={c.id} onClick={() => setSelectedColony(c.id)} className={`w-full text-left px-2 py-1 text-xs border ${selectedColony === c.id ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-950 text-orange-600'}`}>
                <MapPin className="w-3 h-3 inline mr-1" /> {c.name}
              </button>
            ))}
          </div>
          <input
            type="text" placeholder="Station name (optional)" value={stationName}
            onChange={e => setStationName(e.target.value)}
            className="w-full bg-black border border-orange-900 text-orange-400 text-xs px-2 py-1"
          />
          <div className="flex flex-wrap gap-1">
            {STATION_ECONOMIES.map(e => (
              <button key={e.id} onClick={() => setSelectedEconomy(e.id)} className={`px-2 py-1 text-[10px] border ${selectedEconomy === e.id ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-950 text-orange-600'}`}>
                {e.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-orange-700">{STATION_ECONOMIES.find(e => e.id === selectedEconomy)?.desc}</div>
          <button
            onClick={handleBuild}
            disabled={!selectedColony || (!isSandbox && state.credits < STATION_BUILD_COST)}
            className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/30 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> BUILD STATION ({STATION_BUILD_COST.toLocaleString()} CR)
          </button>
        </div>
      ) : (
        <div className="border border-orange-900 p-3 text-center text-orange-600 text-xs">
          <Factory className="w-6 h-6 mx-auto mb-1 opacity-50" />
          No colonies in this system. Establish a colony first.
        </div>
      )}

      {/* Owned stations */}
      {ownedStations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Owned Stations</h3>
          {ownedStations.map(station => {
            const economy = STATION_ECONOMIES.find(e => e.id === station.economy);
            const revenue = pendingRevenue(station);
            return (
              <div key={station.id} className="border border-orange-900 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-orange-300 font-bold text-xs">{station.name}</div>
                    <div className="text-[10px] text-orange-600">{economy?.label} · {station.systemName}</div>
                  </div>
                  <button
                    onClick={() => collectStationRevenue(station.id)}
                    disabled={revenue <= 0}
                    className="px-3 py-1 border border-green-700 text-green-500 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
                  >
                    <Coins className="w-3 h-3" /> {revenue.toLocaleString()} CR
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(station.services || []).map(svcId => {
                    const svc = STATION_SERVICES.find(s => s.id === svcId);
                    return <span key={svcId} className="text-[9px] border border-green-900 text-green-600 px-1">{svc?.label || svcId}</span>;
                  })}
                </div>
                {/* Install services */}
                <div className="border-t border-orange-950 pt-2 space-y-1">
                  <div className="text-[10px] text-orange-700 uppercase">Install Services</div>
                  <div className="flex flex-wrap gap-1">
                    {STATION_SERVICES.filter(s => !(station.services || []).includes(s.id)).map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => upgradeStationService(station.id, svc.id)}
                        disabled={!isSandbox && state.credits < svc.cost}
                        className="text-[9px] border border-orange-800 text-orange-500 hover:bg-orange-950/30 px-2 py-0.5 disabled:opacity-30"
                      >
                        + {svc.label} ({svc.cost.toLocaleString()})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}