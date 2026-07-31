// Cartography — review and sell exploration data with regional bonuses
import React, { useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { CARTOGRAPHY_REGIONS, getRegionForDistance } from '@/lib/cartography';
import { distance3D, SOL_SYSTEM } from '@/lib/galaxy';
import { ScrollText, MapPin, Globe, Coins, Award } from 'lucide-react';

export default function CartographyScreen() {
  const { state, sellExplorationData } = useGameState();

  const data = useMemo(() => {
    const scannedCount = Object.keys(state.scannedBodies || {}).length;
    const systemsDiscovered = Object.keys(state.discoveredSystems || {}).length;
    const firstDiscoveries = Object.values(state.discoveredSystems || {}).filter(s => s.firstDiscovered && !s.bonusSold).length;
    const surfaceCount = Object.keys(state.surfaceDiscoveries || {}).length;

    let totalValue = 0;
    for (const scan of Object.values(state.scannedBodies || {})) totalValue += scan.value || 0;
    for (const [seed, sys] of Object.entries(state.discoveredSystems || {})) {
      if (sys.firstDiscovered && !sys.bonusSold) totalValue += 5000 + (sys.bodyCount || 0) * 500;
    }
    for (const disc of Object.values(state.surfaceDiscoveries || {})) totalValue += disc.value || 0;

    // Regional breakdown from flight log
    const byRegion = {};
    for (const region of CARTOGRAPHY_REGIONS) byRegion[region.id] = { region, systemCount: 0, firstCount: 0 };
    const logSeeds = new Set((state.flightLog || []).map(e => e.seed));
    for (const entry of state.flightLog || []) {
      const dist = distance3D(entry, SOL_SYSTEM);
      const region = getRegionForDistance(dist);
      byRegion[region.id].systemCount++;
      if (state.discoveredSystems?.[entry.seed]?.firstDiscovered) byRegion[region.id].firstCount++;
    }

    return { scannedCount, systemsDiscovered, firstDiscoveries, surfaceCount, totalValue, byRegion };
  }, [state.scannedBodies, state.discoveredSystems, state.surfaceDiscoveries, state.flightLog]);

  const hasData = data.totalValue > 0;
  const atStation = state.currentLocation === 'station';

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Universal Cartographics</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Review and sell your exploration data. Regional bonuses apply based on distance from Sol.</div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat icon={Globe} label="Bodies Scanned" value={data.scannedCount} />
        <Stat icon={MapPin} label="Systems Found" value={data.systemsDiscovered} />
        <Stat icon={Award} label="First Discoveries" value={data.firstDiscoveries} />
        <Stat icon={Coins} label="Data Value" value={`${data.totalValue.toLocaleString()} CR`} />
      </div>

      {/* Regional breakdown */}
      <div className="border border-orange-900 p-3 space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Regional Breakdown</h3>
        <div className="space-y-1">
          {CARTOGRAPHY_REGIONS.map(region => {
            const rd = data.byRegion[region.id];
            if (!rd || rd.systemCount === 0) return null;
            return (
              <div key={region.id} className="flex items-center justify-between text-[10px] border border-orange-950 p-1.5">
                <div>
                  <span className="text-orange-300">{region.name}</span>
                  <span className="text-orange-700 ml-2">{region.desc}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-600">{rd.systemCount} systems</span>
                  <span className="text-yellow-500">{rd.firstCount} first</span>
                  <span className="text-green-500">×{region.bonus} bonus</span>
                </div>
              </div>
            );
          })}
          {Object.values(data.byRegion).every(rd => rd.systemCount === 0) && (
            <div className="text-orange-700 text-[10px] text-center py-2">No flight log data yet. Explore the galaxy to build your cartography records.</div>
          )}
        </div>
      </div>

      {/* Sell data */}
      {hasData ? (
        <div className="border border-green-800 p-3 space-y-2">
          <div className="text-green-400 text-xs font-bold">TOTAL PAYOUT: {data.totalValue.toLocaleString()} CR</div>
          {!atStation && <div className="text-orange-600 text-[10px]">⚠ Must be docked at a station to sell exploration data.</div>}
          <button
            onClick={sellExplorationData}
            disabled={!atStation}
            className="w-full py-2 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold disabled:opacity-30"
          >
            SELL ALL EXPLORATION DATA
          </button>
        </div>
      ) : (
        <div className="border border-orange-900 p-4 text-center text-orange-600 text-xs">
          <ScrollText className="w-6 h-6 mx-auto mb-1 opacity-50" />
          No unsold exploration data. Scan bodies and discover systems to earn credits.
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="border border-orange-950 p-2">
      <div className="text-orange-700 text-[10px] uppercase flex items-center gap-1">{Icon && <Icon className="w-2.5 h-2.5" />}{label}</div>
      <div className="text-orange-300 font-bold text-sm">{value}</div>
    </div>
  );
}