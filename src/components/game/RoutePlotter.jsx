// Route Plotter — Spansh-like advanced route planning
// Plots multi-jump routes with neutron star highway support
import React, { useState, useMemo } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { generateStarsInRange, distance3D } from '@/lib/galaxy';
import { computeShipStats, getDefaultModules } from '@/lib/shipOutfitting';
import { Route, Search, Zap, Navigation, AlertTriangle } from 'lucide-react';

const CORRIDOR_WIDTH = 25;
const SEGMENT_SIZE = 25;
const MAX_SEGMENTS = 1000;
const MAX_JUMPS = 2000;

export default function RoutePlotter() {
  const { state } = useGameState();
  const [searchName, setSearchName] = useState('');
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [searching, setSearching] = useState(false);
  const [useNeutron, setUseNeutron] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const modules = state.ship.modules || getDefaultModules(state.ship.type);
  const stats = computeShipStats(state.ship.type, modules);
  const jumpRange = Math.max(5, stats.jumpRange);

  const handleSearch = () => {
    if (!searchName.trim()) return;
    setSearching(true);
    setError('');
    setRoute(null);
    setProgress(5);
    setProgressLabel('Initializing search...');

    const searchRing = (radius) => {
      const center = state.currentSystem;
      setProgressLabel(`Searching ${radius} LY radius...`);
      setProgress(Math.min(50, 5 + Math.round((radius / 500) * 45)));
      setTimeout(() => {
        const stars = generateStarsInRange(center.x, center.y, center.z, radius);
        const found = stars.find(s => s.name.toLowerCase() === searchName.trim().toLowerCase());
        if (found) {
          setDestination(found);
          setProgressLabel('Plotting optimized route...');
          setProgress(60);
          setTimeout(() => {
            plotRoute(center, found, jumpRange, useNeutron);
            setProgress(100);
            setSearching(false);
          }, 50);
        } else if (radius < 2000) {
          searchRing(radius < 200 ? 200 : radius < 400 ? 400 : radius < 800 ? 800 : radius < 1200 ? 1200 : 2000);
        } else {
          setError(`System "${searchName}" not found within 2000 LY. Jump closer to your destination.`);
          setSearching(false);
          setProgress(0);
        }
      }, 50);
    };

    searchRing(100);
  };

  const plotRoute = (start, end, range, neutron) => {
    const corridorStars = generateCorridorStars(start, end);
    const jumps = computeGreedyRoute(start, end, corridorStars, range, neutron);
    setRoute(jumps);
  };

  const totalDist = route ? route.reduce((s, j) => s + j.jumpDist, 0) : 0;
  const totalFuel = route ? Math.ceil(route.reduce((s, j) => s + j.jumpDist, 0) * 0.5) : 0;
  const neutronCount = route ? route.filter(j => j.fromNeutron).length : 0;

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Route className="w-4 h-4 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase text-sm">Route Plotter</h2>
        </div>
        <div className="text-xs text-orange-600 space-y-0.5">
          <div>CURRENT: <span className="text-orange-300">{state.currentSystem.name}</span></div>
          <div>JUMP RANGE: <span className="text-orange-300">{jumpRange.toFixed(1)} LY</span> {useNeutron && <span className="text-cyan-400">(4x at neutron stars)</span>}</div>
        </div>
      </div>

      {/* Search */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter destination system name..."
            className="flex-1 bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500"
          />
          <button onClick={handleSearch} disabled={searching} className="px-3 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-50 flex items-center gap-1">
            {searching ? <Navigation className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} PLOT
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-[10px] text-orange-600 cursor-pointer">
          <input type="checkbox" checked={useNeutron} onChange={e => { setUseNeutron(e.target.checked); if (destination) { plotRoute(state.currentSystem, destination, jumpRange, e.target.checked); } }} />
          Use neutron star highway (4x jump boost from neutron stars)
        </label>
        {error && (
          <div className="flex items-center gap-1 text-red-400 text-[10px]">
            <AlertTriangle className="w-3 h-3" /> {error}
          </div>
        )}
        {searching && progress > 0 && (
          <div className="space-y-1">
            <div className="text-orange-600 text-[10px]">{progressLabel}</div>
            <div className="w-full h-1.5 bg-black border border-orange-900">
              <div className="h-full bg-orange-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Route results */}
      {route && (
        <div className="space-y-2">
          <div className="border border-orange-700 p-3 text-xs space-y-1">
            <div className="text-orange-300 font-bold uppercase text-[10px] mb-1">Route Summary</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-orange-600">
              <div>JUMPS: <span className="text-orange-300">{route.length}</span></div>
              <div>DISTANCE: <span className="text-orange-300">{totalDist.toFixed(1)} LY</span></div>
              <div>FUEL COST: <span className="text-orange-300">{totalFuel} T</span></div>
              <div>NEUTRON BOOSTS: <span className="text-cyan-400">{neutronCount}</span></div>
            </div>
          </div>

          <h3 className="text-orange-500 text-xs font-bold uppercase">Jump-by-Jump Route</h3>
          {route.map((jump, i) => (
            <div key={i} className={`border p-2 text-xs ${jump.fromNeutron ? 'border-cyan-800 bg-cyan-950/10' : 'border-orange-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 text-[10px]">#{i + 1}</span>
                  <span className="text-orange-300 font-bold">{jump.name}</span>
                  {jump.fromNeutron && <Zap className="w-3 h-3 text-cyan-400" />}
                  <span className="text-orange-600 text-[9px]">{jump.starClass?.class || '?'}</span>
                </div>
                <div className="text-right">
                  <div className="text-orange-400 text-[10px]">{jump.jumpDist.toFixed(1)} LY</div>
                  <div className="text-orange-700 text-[9px]">{Math.ceil(jump.jumpDist * 0.5)} T fuel</div>
                </div>
              </div>
              {jump.fromNeutron && <div className="text-cyan-500 text-[9px] mt-0.5">⚡ NEUTRON BOOST — 4x range applied</div>}
            </div>
          ))}
          {route.length === 0 && <div className="text-orange-700 text-xs text-center py-4">No route found. Try a closer destination or increase jump range.</div>}
        </div>
      )}

      {!route && !error && !searching && (
        <div className="text-center text-orange-700 py-8 text-xs">
          <Route className="w-6 h-6 mx-auto mb-2 opacity-40" />
          Enter a destination system name above to plot an optimized route.
          <div className="text-[10px] mt-1 text-orange-800">Search radius 2000 LY · No route distance limit · Neutron star routing supported</div>
        </div>
      )}
    </div>
  );
}

function generateCorridorStars(start, end) {
  const allStars = [];
  const seen = new Set();
  const totalDist = distance3D(start, end);
  const numSegments = Math.min(Math.ceil(totalDist / SEGMENT_SIZE), MAX_SEGMENTS);
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const cx = start.x + (end.x - start.x) * t;
    const cy = start.y + (end.y - start.y) * t;
    const cz = start.z + (end.z - start.z) * t;
    const stars = generateStarsInRange(cx, cy, cz, CORRIDOR_WIDTH);
    for (const star of stars) {
      if (!seen.has(star.seed)) { seen.add(star.seed); allStars.push(star); }
    }
  }
  return allStars;
}

function computeGreedyRoute(start, end, allStars, jumpRange, useNeutron) {
  const route = [];
  let pos = { ...start };
  const dest = { x: end.x, y: end.y, z: end.z };
  for (let i = 0; i < MAX_JUMPS; i++) {
    const isNeutron = pos.starClass?.class === 'NS';
    const effectiveRange = isNeutron && useNeutron ? jumpRange * 4 : jumpRange;
    let best = null;
    let bestRemaining = distance3D(pos, dest);
    // Check if we can jump directly to destination
    if (bestRemaining <= effectiveRange) {
      route.push({ name: end.name, starClass: end.starClass, jumpDist: bestRemaining, fromNeutron: isNeutron && useNeutron });
      return route;
    }
    // Find closest star to destination within range
    for (const star of allStars) {
      const jumpDist = distance3D(pos, star);
      if (jumpDist > effectiveRange || jumpDist < 0.5) continue;
      const remaining = distance3D(star, dest);
      if (remaining < bestRemaining) { bestRemaining = remaining; best = star; }
    }
    if (!best) return route; // Stuck — no reachable star closer to destination
    const jumpDist = distance3D(pos, best);
    route.push({ name: best.name, starClass: best.starClass, x: best.x, y: best.y, z: best.z, jumpDist, fromNeutron: isNeutron && useNeutron });
    pos = best;
  }
  return route;
}