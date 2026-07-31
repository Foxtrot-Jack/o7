// Black Market — illegal goods trading at anarchy stations
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { COMMODITIES, COMMODITY_MAP } from '@/lib/commodities';
import { makeRng, randInt, randFloat } from '@/lib/prng';
import { getMarketCycle, getPriceModifier, getPriceTrend, getTrendDisplay } from '@/lib/dynamicEconomy';
import { Skull, ShoppingCart, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CONTRABAND_IDS = COMMODITIES.filter(c => c.legality === 1).map(c => c.id);

export default function BlackMarketScreen() {
  const { state, getSystemData, addCredits, addCargo, removeCargo } = useGameState();
  const [tradeAmounts, setTradeAmounts] = useState({});
  const systemData = getSystemData();
  const station = systemData?.stations.find(s => s.id === state.currentStationId);

  const isAnarchy = state.currentSystem?.security === 'anarchy';

  const market = useMemo(() => {
    if (!station || !systemData || !isAnarchy) return [];
    const cycle = getMarketCycle(state.totalJumps);
    return CONTRABAND_IDS.map(commodityId => {
      const commodity = COMMODITY_MAP[commodityId];
      const rng = makeRng(systemData.seed + ':bmarket:' + station.id);
      const basePriceMod = randFloat(rng, 0.6, 0.9); // cheaper at black market
      const dynMod = getPriceModifier(commodity.basePrice, systemData.seed, station.id, cycle);
      const buyPrice = Math.round(commodity.basePrice * basePriceMod * dynMod);
      const sellPrice = Math.round(buyPrice * 0.85);
      const baseBuy = Math.round(commodity.basePrice * basePriceMod);
      const trend = getPriceTrend(buyPrice, baseBuy);
      const stock = randInt(rng, 5, 200);
      return { ...commodity, buyPrice, sellPrice, trend, stock };
    });
  }, [station, systemData, isAnarchy, state.totalJumps]);

  if (!isAnarchy) {
    return (
      <div className="p-4 text-center text-orange-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="text-sm">No black market contacts at this station.</p>
        <p className="text-orange-700 text-xs mt-1">Black markets operate only in anarchy systems.</p>
      </div>
    );
  }

  if (!station) {
    return <div className="p-4 text-orange-500">No station data.</div>;
  }

  const handleBuy = (commodityId, qty, price) => {
    if (state.credits < price * qty) return;
    const cargoUsed = state.ship.cargo.reduce((s, c) => s + c.qty, 0);
    if (cargoUsed + qty > state.ship.cargoCapacity) return;
    addCredits(-(price * qty));
    addCargo(commodityId, qty);
  };

  const handleSell = (commodityId, qty, price) => {
    const item = state.ship.cargo.find(c => c.commodity === commodityId);
    if (!item || item.qty < qty) return;
    addCredits(price * qty);
    removeCargo(commodityId, qty);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="border border-red-800 p-4 flex items-center gap-2">
        <Skull className="w-5 h-5 text-red-500" />
        <h2 className="text-red-300 font-bold uppercase">Black Market — {station.name}</h2>
        <span className="text-red-700 text-[10px] ml-auto">⚠ CARRYING CONTRABAND RISKS SCAN FINES</span>
      </div>

      <div className="space-y-1">
        {market.map(item => {
          const owned = state.ship.cargo.find(c => c.commodity === item.id)?.qty || 0;
          const amount = tradeAmounts[item.id] || 1;
          const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
          const trendDisp = getTrendDisplay(item.trend);
          return (
            <div key={item.id} className="border border-red-950 p-2 flex items-center gap-2 text-xs">
              <div className="flex-1 min-w-0">
                <div className="text-red-300 font-bold truncate">{item.name}</div>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-red-600">BUY: {item.buyPrice.toLocaleString()} CR</span>
                  <span className="text-red-600">SELL: {item.sellPrice.toLocaleString()} CR</span>
                  <span className={trendDisp.color + ' flex items-center gap-0.5'}><TrendIcon className="w-2.5 h-2.5" />{trendDisp.label}</span>
                  <span className="text-orange-800">STOCK: {item.stock}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={amount}
                  onChange={e => setTradeAmounts({ ...tradeAmounts, [item.id]: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-12 bg-black border border-red-900 text-red-300 text-center text-[10px] py-0.5"
                />
                <button
                  onClick={() => handleBuy(item.id, Math.min(amount, item.stock), item.buyPrice)}
                  disabled={state.credits < item.buyPrice * amount || state.ship.cargo.reduce((s, c) => s + c.qty, 0) + amount > state.ship.cargoCapacity}
                  className="px-2 py-1 border border-red-600 text-red-400 hover:bg-red-950/30 text-[9px] font-bold disabled:opacity-30"
                >BUY</button>
                {owned > 0 && (
                  <button
                    onClick={() => handleSell(item.id, Math.min(amount, owned), item.sellPrice)}
                    className="px-2 py-1 border border-orange-600 text-orange-400 hover:bg-orange-950/30 text-[9px] font-bold"
                  >SELL ({owned})</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}