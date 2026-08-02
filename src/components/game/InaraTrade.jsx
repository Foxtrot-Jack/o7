// InaraTrade — lightweight Inara-style trade route finder
// Replaces the heavy TradeRoutes scanner that caused freezing (1000 LY radius)
// Uses a small search radius and caps results for smooth performance
import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { COMMODITIES, COMMODITY_CATEGORIES, COMMODITY_MAP } from '@/lib/commodities';
import { generateStarsInRange, distance3D } from '@/lib/galaxy';
import { generateSystem } from '@/lib/system';
import { calculateRoute } from '@/lib/routeCalculator';
import { computeShipStats } from '@/lib/shipOutfitting';
import { TrendingUp, Loader, RefreshCw, ArrowRight, Search, Navigation } from 'lucide-react';

const SEARCH_RADIUS = 40;
const MAX_SYSTEMS = 20;
const MAX_RESULTS = 30;

export default function InaraTrade() {
  const { state, getSystemData, plotRoute } = useGameState();
  const [loading, setLoading] = useState(false);
  const [plottedSystem, setPlottedSystem] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [commodityFilter, setCommodityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSystemData = getSystemData();
  const currentEconomy = currentSystemData?.economy;

  const computeRoutes = useCallback(() => {
    setLoading(true);
    setOpportunities([]);

    setTimeout(() => {
      const center = state.currentSystem;
      const stars = generateStarsInRange(center.x, center.y, center.z, SEARCH_RADIUS);
      const populated = stars
        .filter(s => s.seed !== center.seed && s.population > 0)
        .map(s => ({ ...s, dist: distance3D(center, s) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, MAX_SYSTEMS);

      const opps = [];
      for (const star of populated) {
        const sysData = generateSystem(star.seed, star.starClass);
        const targetEconomy = sysData.economy;

        const oppBase = { system: star.name, seed: star.seed, star, distance: star.dist, economy: targetEconomy.name };
        if (commodityFilter !== 'all') {
          const comm = COMMODITY_MAP[commodityFilter];
          if (comm) {
            const catKey = Object.entries(COMMODITY_CATEGORIES).find(([k, v]) => v === comm.category)?.[0];
            if (catKey) {
              if ((currentEconomy?.produces || []).includes(catKey) && (targetEconomy?.consumes || []).includes(catKey)) {
                opps.push({ ...oppBase, commodity: comm.name, buyPrice: Math.round(comm.basePrice * 0.6), sellPrice: Math.round(comm.basePrice * 1.4), profit: Math.round(comm.basePrice * 0.8), direction: 'forward' });
              }
              if ((targetEconomy?.produces || []).includes(catKey) && (currentEconomy?.consumes || []).includes(catKey)) {
                opps.push({ ...oppBase, commodity: comm.name + ' (return)', buyPrice: Math.round(comm.basePrice * 0.6), sellPrice: Math.round(comm.basePrice * 1.4), profit: Math.round(comm.basePrice * 0.8), direction: 'return' });
              }
            }
          }
        } else {
          const fwdCategories = (currentEconomy?.produces || []).filter(c => (targetEconomy?.consumes || []).includes(c));
          const fwdBest = findBestCommodity(fwdCategories);
          if (fwdBest) {
            opps.push({ ...oppBase, commodity: fwdBest.name, buyPrice: Math.round(fwdBest.basePrice * 0.6), sellPrice: Math.round(fwdBest.basePrice * 1.4), profit: Math.round(fwdBest.basePrice * 0.8), direction: 'forward' });
          }
          const retCategories = (targetEconomy?.produces || []).filter(c => (currentEconomy?.consumes || []).includes(c));
          const retBest = findBestCommodity(retCategories);
          if (retBest) {
            opps.push({ ...oppBase, commodity: retBest.name + ' (return)', buyPrice: Math.round(retBest.basePrice * 0.6), sellPrice: Math.round(retBest.basePrice * 1.4), profit: Math.round(retBest.basePrice * 0.8), direction: 'return' });
          }
        }
      }
      opps.sort((a, b) => (b.profit / b.distance) - (a.profit / a.distance));
      setOpportunities(opps.slice(0, MAX_RESULTS));
      setLoading(false);
    }, 50);
  }, [state.currentSystem, currentEconomy, commodityFilter]);

  useEffect(() => { computeRoutes(); }, [computeRoutes]);

  const filteredOpps = searchQuery
    ? opportunities.filter(o => o.system.toLowerCase().includes(searchQuery.toLowerCase()) || o.commodity.toLowerCase().includes(searchQuery.toLowerCase()))
    : opportunities;

  const handlePlotRoute = (opp) => {
    if (!opp.star) return;
    const stats = computeShipStats(state.ship.type, state.ship.modules || {});
    const jumpRange = stats.jumpRange || 10;
    const route = calculateRoute(state.currentSystem, opp.star, jumpRange, true);
    plotRoute(route.length > 0 ? route : [{ name: opp.star.name, starClass: opp.star.starClass, x: opp.star.x, y: opp.star.y, z: opp.star.z, jumpDist: opp.distance, fromNeutron: false }]);
    setPlottedSystem(opp.system);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase text-sm">Inara Trade Terminal — {state.currentSystem.name}</h2>
        </div>
        <div className="text-xs text-orange-600 space-y-0.5">
          <div>ECONOMY: <span className="text-orange-300">{currentEconomy?.name || 'Unknown'}</span></div>
          <div>PRODUCES: <span className="text-orange-300">{(currentEconomy?.produces || []).join(', ') || '—'}</span></div>
          <div>CONSUMES: <span className="text-orange-300">{(currentEconomy?.consumes || []).join(', ') || '—'}</span></div>
          <div>SCAN RADIUS: <span className="text-orange-300">{SEARCH_RADIUS} LY · MAX {MAX_SYSTEMS} SYSTEMS · TOP {MAX_RESULTS} ROUTES</span></div>
        </div>
        <button onClick={computeRoutes} disabled={loading} className="mt-2 px-3 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] flex items-center gap-1 disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> REFRESH SCAN
        </button>
      </div>

      <div className="border border-orange-900 p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <Search className="w-3 h-3 text-orange-700 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search system or commodity..."
            className="flex-1 bg-black border border-orange-900 text-orange-300 px-2 py-1 text-xs outline-none focus:border-orange-500 placeholder:text-orange-800"
          />
        </div>
        <select value={commodityFilter} onChange={e => setCommodityFilter(e.target.value)} className="flex-1 bg-black border border-orange-900 text-orange-300 px-2 py-1 text-xs outline-none focus:border-orange-500">
          <option value="all">All Commodities</option>
          {COMMODITIES.filter(c => c.legality === 0).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="border border-orange-900 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 text-orange-500 animate-spin" />
            <span className="text-orange-600 text-xs">Scanning nearby systems...</span>
          </div>
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className="text-center text-orange-700 py-8 text-xs">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-40" />
          {searchQuery ? 'No routes match your search.' : 'No profitable trade routes found within range.'}
        </div>
      ) : (
        <div className="space-y-1.5">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Trade Opportunities ({filteredOpps.length})</h3>
          {filteredOpps.map((opp, i) => (
            <div key={i} className={`border p-2 text-xs ${opp.direction === 'return' ? 'border-cyan-900 bg-cyan-950/10' : 'border-orange-900'}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-300 font-bold">{opp.system}</span>
                  <ArrowRight className="w-3 h-3 text-orange-700" />
                  <span className="text-orange-500 text-[10px]">{opp.economy}</span>
                  {opp.direction === 'return' && <span className="text-cyan-500 text-[9px] border border-cyan-800 px-1">RETURN</span>}
                </div>
                <span className="text-orange-400 text-[10px]">{opp.distance.toFixed(1)} LY</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-orange-600">
                <div>COMM: <span className="text-orange-300 truncate">{opp.commodity}</span></div>
                <div>BUY: <span className="text-green-400">{opp.buyPrice.toLocaleString()}</span></div>
                <div>SELL: <span className="text-orange-300">{opp.sellPrice.toLocaleString()}</span></div>
                <div>PROFIT: <span className="text-green-400 font-bold">+{opp.profit.toLocaleString()}</span></div>
              </div>
              <div className="text-[9px] text-orange-700 mt-0.5">PROFIT/LY: {Math.round(opp.profit / opp.distance).toLocaleString()} CR</div>
              <button
                onClick={() => handlePlotRoute(opp)}
                className={`mt-1 w-full px-2 py-0.5 border text-[9px] flex items-center justify-center gap-1 transition-all ${plottedSystem === opp.system ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300' : 'border-orange-800 text-orange-500 hover:bg-orange-950/30'}`}
              >
                <Navigation className="w-2.5 h-2.5" /> {plottedSystem === opp.system ? 'ROUTE PLOTTED ✓' : 'PLOT ROUTE'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function findBestCommodity(categories) {
  if (!categories || categories.length === 0) return null;
  let best = null;
  for (const cat of categories) {
    const catName = COMMODITY_CATEGORIES[cat] || cat;
    const comm = COMMODITIES.find(c => c.category === catName && c.legality === 0);
    if (comm && (!best || comm.basePrice > best.basePrice)) best = comm;
  }
  return best;
}