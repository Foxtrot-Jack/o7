// Trade Routes — Inara-like trade route finder
// Finds best buy/sell opportunities between current system and all reachable systems
import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { COMMODITIES, COMMODITY_CATEGORIES } from '@/lib/commodities';
import { generateStarsInRange, distance3D } from '@/lib/galaxy';
import { generateSystem } from '@/lib/system';
import { TrendingUp, Loader, RefreshCw, ArrowRight } from 'lucide-react';

const SEARCH_RADIUS = 250;

export default function TradeRoutes() {
  const { state, getSystemData } = useGameState();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [opportunities, setOpportunities] = useState([]);

  const currentSystemData = getSystemData();
  const currentEconomy = currentSystemData?.economy;

  const computeRoutes = useCallback(() => {
    setLoading(true);
    setProgress(0);
    setProgressLabel('Scanning star systems...');
    setOpportunities([]);

    setTimeout(() => {
      const center = state.currentSystem;
      const stars = generateStarsInRange(center.x, center.y, center.z, SEARCH_RADIUS);
      const populated = stars
        .filter(s => s.seed !== center.seed && s.population > 0)
        .map(s => ({ ...s, dist: distance3D(center, s) }))
        .sort((a, b) => a.dist - b.dist);

      if (populated.length === 0) {
        setProgressLabel('');
        setLoading(false);
        return;
      }

      setProgressLabel(`Analyzing ${populated.length} populated systems...`);
      const opps = [];
      const chunkSize = 20;
      let idx = 0;

      const processChunk = () => {
        const end = Math.min(idx + chunkSize, populated.length);
        for (let i = idx; i < end; i++) {
          const star = populated[i];
          const sysData = generateSystem(star.seed, star.starClass);
          const targetEconomy = sysData.economy;

          const fwdCategories = (currentEconomy?.produces || []).filter(c => (targetEconomy?.consumes || []).includes(c));
          const fwdBest = findBestCommodity(fwdCategories);
          if (fwdBest) {
            opps.push({
              system: star.name, seed: star.seed, distance: star.dist,
              economy: targetEconomy.name, commodity: fwdBest.name,
              buyPrice: Math.round(fwdBest.basePrice * 0.6),
              sellPrice: Math.round(fwdBest.basePrice * 1.4),
              profit: Math.round(fwdBest.basePrice * 0.8),
              direction: 'forward',
            });
          }

          const retCategories = (targetEconomy?.produces || []).filter(c => (currentEconomy?.consumes || []).includes(c));
          const retBest = findBestCommodity(retCategories);
          if (retBest) {
            opps.push({
              system: star.name, seed: star.seed, distance: star.dist,
              economy: targetEconomy.name, commodity: retBest.name + ' (return)',
              buyPrice: Math.round(retBest.basePrice * 0.6),
              sellPrice: Math.round(retBest.basePrice * 1.4),
              profit: Math.round(retBest.basePrice * 0.8),
              direction: 'return',
            });
          }
        }
        idx = end;
        setProgress(Math.round((idx / populated.length) * 100));
        if (idx < populated.length) {
          setProgressLabel(`Analyzing ${populated.length} systems... (${idx}/${populated.length})`);
          setTimeout(processChunk, 0);
        } else {
          opps.sort((a, b) => (b.profit / b.distance) - (a.profit / a.distance));
          setOpportunities(opps);
          setLoading(false);
        }
      };
      processChunk();
    }, 50);
  }, [state.currentSystem, currentEconomy]);

  useEffect(() => { computeRoutes(); }, [computeRoutes]);

  return (
    <div className="p-4 space-y-3">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase text-sm">Trade Terminal — {state.currentSystem.name}</h2>
        </div>
        <div className="text-xs text-orange-600 space-y-0.5">
          <div>ECONOMY: <span className="text-orange-300">{currentEconomy?.name || 'Unknown'}</span></div>
          <div>PRODUCES: <span className="text-orange-300">{(currentEconomy?.produces || []).join(', ') || '—'}</span></div>
          <div>CONSUMES: <span className="text-orange-300">{(currentEconomy?.consumes || []).join(', ') || '—'}</span></div>
          <div>SCAN RADIUS: <span className="text-orange-300">{SEARCH_RADIUS} LY (no result cap)</span></div>
        </div>
        <button onClick={computeRoutes} disabled={loading} className="mt-2 px-3 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] flex items-center gap-1 disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> REFRESH SCAN
        </button>
      </div>

      {loading ? (
        <div className="border border-orange-900 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 text-orange-500 animate-spin" />
            <span className="text-orange-600 text-xs">{progressLabel}</span>
          </div>
          <div className="w-full h-2 bg-black border border-orange-900">
            <div className="h-full bg-orange-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-orange-700 text-[10px] text-right">{progress}%</div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center text-orange-700 py-8 text-xs">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-40" />
          No profitable trade routes found within range.
        </div>
      ) : (
        <div className="space-y-1.5">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Trade Opportunities ({opportunities.length})</h3>
          {opportunities.map((opp, i) => (
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