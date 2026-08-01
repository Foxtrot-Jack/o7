// Exploration Screen — scan data management, sell cartographics data, discovery log
import React, { useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { distance3D } from '@/lib/galaxy';
import { getHolidayExplorationMult } from '@/lib/publicHolidays';
import { Telescope, DollarSign, Star, Globe, Map, Award, BookOpen } from 'lucide-react';

export default function ExplorationScreen() {
  const { state, getSystemData, sellExplorationData, addCredits } = useGameState();
  const systemData = getSystemData();
  const holidayMult = getHolidayExplorationMult();

  // Calculate sellable vs locked (within 20 LY of origin) scan value
  const { sellableValue, lockedValue } = useMemo(() => {
    const cur = state.currentSystem;
    const MIN_DIST = 20;
    let sellable = 0;
    let locked = 0;
    for (const scan of Object.values(state.scannedBodies)) {
      if (scan.originCoords && distance3D(cur, scan.originCoords) < MIN_DIST) {
        locked += scan.value || 0;
      } else {
        sellable += scan.value || 0;
      }
    }
    for (const sys of Object.values(state.discoveredSystems)) {
      if (sys.firstDiscovered && !sys.bonusSold) {
        const val = 5000 + (sys.bodyCount || 0) * 500;
        if (sys.originCoords && distance3D(cur, sys.originCoords) < MIN_DIST) {
          locked += val;
        } else {
          sellable += val;
        }
      }
    }
    for (const map of Object.values(state.surfaceMaps || {})) {
      if (!map.missionLocked) {
        if (map.originCoords && distance3D(cur, map.originCoords) < MIN_DIST) {
          locked += map.value || 0;
        } else {
          sellable += map.value || 0;
        }
      }
    }
    return { sellableValue: sellable, lockedValue: locked };
  }, [state.scannedBodies, state.discoveredSystems, state.surfaceMaps, state.currentSystem]);

  const scannedBodyCount = Object.keys(state.scannedBodies).length;
  const discoveredSystemCount = Object.keys(state.discoveredSystems).length;
  const firstDiscoveredCount = Object.values(state.discoveredSystems).filter(s => s.firstDiscovered).length;
  const unsoldBonusCount = Object.values(state.discoveredSystems).filter(s => s.firstDiscovered && !s.bonusSold).length;

  const handleSell = () => {
    if (sellableValue === 0) return;
    sellExplorationData();
    if (holidayMult > 1) {
      addCredits(Math.round(sellableValue * (holidayMult - 1)));
    }
  };

  const explorationRank = state.rank.exploration;
  const nextRankThreshold = getNextRankThreshold(explorationRank.rank);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-orange-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Telescope className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Universal Cartographics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <StatBox label="Explorer Rank" value={explorationRank.name} icon={Award} />
          <StatBox label="Systems Discovered" value={discoveredSystemCount.toString()} icon={Star} />
          <StatBox label="First Discoveries" value={firstDiscoveredCount.toString()} icon={Globe} />
          <StatBox label="Bodies Scanned" value={scannedBodyCount.toString()} icon={Map} />
        </div>
        {/* Rank progress */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-orange-700 mb-1">
            <span>RANK PROGRESS</span>
            <span>{explorationRank.points.toLocaleString()} / {nextRankThreshold.toLocaleString()} XP</span>
          </div>
          <div className="w-full h-1.5 bg-black border border-orange-900">
            <div
              className="h-full bg-orange-600"
              style={{ width: `${Math.min(100, (explorationRank.points / nextRankThreshold) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sell exploration data */}
      <div className="border border-orange-900 p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Sell Exploration Data</h3>
        </div>
        {sellableValue > 0 ? (
          <>
            <div className="text-xs text-orange-600 mb-3">
              You have <span className="text-orange-300">{scannedBodyCount}</span> unsold body scans
              and <span className="text-orange-300">{unsoldBonusCount}</span> unsold first discovery bonuses.
            </div>
            <div className="text-2xl text-orange-300 font-bold mb-1">
              {Math.round(sellableValue * holidayMult).toLocaleString()} CR
            </div>
            {holidayMult > 1 && (
              <div className="text-green-500 text-[10px] mb-3">
                ✨ Holiday bonus active — {holidayMult}× exploration data value! (Base: {sellableValue.toLocaleString()} CR)
              </div>
            )}
            {holidayMult === 1 && <div className="mb-3" />}
            <button
              onClick={handleSell}
              className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-sm font-bold"
            >
              SELL ALL DATA — {sellableValue.toLocaleString()} CR
            </button>
            {lockedValue > 0 && (
              <div className="mt-3 text-[10px] text-yellow-600 border border-yellow-900 bg-yellow-950/10 p-2">
                ⚠ {lockedValue.toLocaleString()} CR in data is locked — must travel 20+ LY from where it was obtained to sell.
              </div>
            )}
          </>
        ) : lockedValue > 0 ? (
          <div className="text-xs text-orange-700 text-center py-4">
            <div className="mb-2">No sellable data at this location.</div>
            <div className="text-yellow-600">⚠ {lockedValue.toLocaleString()} CR locked — travel 20+ LY from origin to sell.</div>
          </div>
        ) : (
          <div className="text-xs text-orange-700 text-center py-4">
            No unsold exploration data. Scan celestial bodies in the System Map to earn credits.
          </div>
        )}
      </div>

      {/* Discovery log */}
      <div className="border border-orange-900 p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Discovery Log</h3>
        </div>
        {Object.values(state.discoveredSystems).length === 0 ? (
          <div className="text-xs text-orange-700 text-center py-4">
            No systems discovered yet. Jump to new systems to begin exploring.
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {Object.values(state.discoveredSystems).slice().reverse().map((sys, i) => (
              <div key={i} className="flex items-center justify-between border-b border-orange-950/50 py-1 text-xs">
                <div>
                  <span className="text-orange-400">{sys.name}</span>
                  {sys.firstDiscovered && <span className="text-yellow-500 text-[10px] ml-2">★ FIRST DISCOVERY</span>}
                </div>
                <div className="text-orange-700 text-[10px]">
                  {sys.bodyCount || '?'} bodies
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sold data history */}
      {state.soldExplorationData.length > 0 && (
        <div className="border border-orange-900 p-4">
          <h3 className="text-orange-400 text-sm font-bold uppercase mb-2">Transaction History</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {state.soldExplorationData.slice().reverse().map((entry, i) => (
              <div key={i} className="flex justify-between text-xs text-orange-600 border-b border-orange-950/50 py-1">
                <span>{entry.bodies} bodies sold</span>
                <span className="text-orange-400">+{entry.value.toLocaleString()} CR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Surface maps */}
      {Object.keys(state.surfaceMaps || {}).length > 0 && (
        <div className="border border-orange-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-400 text-sm font-bold uppercase">Planetary Surface Maps ({Object.keys(state.surfaceMaps).length})</h3>
          </div>
          <div className="text-xs text-orange-700 mb-2">
            Surface maps are obtained by completing full probe scans. Mission-locked maps cannot be sold until the mission is completed.
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {Object.entries(state.surfaceMaps).map(([mapId, map]) => (
              <div key={mapId} className="flex items-center justify-between border-b border-orange-950/50 py-1 text-xs">
                <div>
                  <span className="text-orange-400">{map.bodyName}</span>
                  <span className="text-orange-700 text-[10px] ml-2">{map.systemName}</span>
                </div>
                {map.missionLocked ? (
                  <span className="text-yellow-500 text-[10px] border border-yellow-900 px-1.5 py-0.5">🔒 MISSION LOCKED</span>
                ) : (
                  <span className="text-orange-300 text-[10px]">{map.value.toLocaleString()} CR</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current system bodies */}
      {systemData && (
        <div className="border border-orange-900 p-4">
          <h3 className="text-orange-400 text-sm font-bold uppercase mb-2">
            Current System: {state.currentSystem.name} — {systemData.bodyCount} Bodies
          </h3>
          <div className="text-xs text-orange-700 mb-2">
            Scan bodies in the System Map (Orrery) view to earn exploration credits.
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="border border-orange-900 p-2">
      <div className="flex items-center gap-1 text-orange-700 text-[10px] uppercase mb-0.5">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-orange-300 font-bold text-sm">{value}</div>
    </div>
  );
}

function getNextRankThreshold(currentRank) {
  const thresholds = [0, 1000, 5000, 15000, 50000, 150000, 400000, 900000, 2000000, 5000000, 10000000, 25000000, 50000000, 100000000];
  return thresholds[Math.min(currentRank + 1, thresholds.length - 1)] || 100000000;
}