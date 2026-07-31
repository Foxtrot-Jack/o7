// Market Screen — commodity trading with dynamic prices
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { COMMODITIES, COMMODITY_CATEGORIES, COMMODITY_MAP, ECONOMY_TYPES } from '@/lib/commodities';
import { makeRng, randInt, randFloat } from '@/lib/prng';
import { ShoppingCart, ArrowUp, ArrowDown, Package } from 'lucide-react';

export default function MarketScreen() {
  const { state, getSystemData, addCredits, addCargo, removeCargo } = useGameState();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tradeAmounts, setTradeAmounts] = useState({});

  const systemData = getSystemData();
  const station = systemData?.stations.find(s => s.id === state.currentStationId);

  // Generate market prices deterministically from system seed + station
  const market = useMemo(() => {
    if (!station || !systemData) return [];
    const rng = makeRng(systemData.seed + ':market:' + station.id);
    const economy = station.economy;

    return COMMODITIES.map(commodity => {
      // Base price modified by economy
      let priceMod = 1.0;
      const isProduced = economy.produces.includes(commodity.category);
      const isConsumed = economy.consumes.includes(commodity.category);

      if (isProduced) priceMod *= 0.7; // cheaper to buy
      if (isConsumed) priceMod *= 1.4; // more expensive to buy, but sells for more

      // Random fluctuation
      priceMod *= randFloat(rng, 0.85, 1.15);

      // Restricted items cost more
      if (commodity.legality === 1) priceMod *= 1.5;

      const buyPrice = Math.round(commodity.basePrice * priceMod);
      const sellPrice = Math.round(buyPrice * 0.82); // sell back at 82% of buy

      // Supply and demand levels
      let supply = randInt(rng, 0, 100);
      let demand = randInt(rng, 0, 100);
      if (isProduced) supply = Math.min(100, supply + 40);
      if (isConsumed) demand = Math.min(100, demand + 40);

      // Stock available
      const stock = isProduced ? randInt(rng, 50, 5000) : randInt(rng, 0, 500);

      return {
        ...commodity,
        buyPrice,
        sellPrice,
        supply,
        demand,
        stock,
      };
    });
  }, [station, systemData]);

  const cargoUsed = state.ship.cargo.reduce((sum, c) => sum + c.qty, 0);
  const cargoFree = state.ship.cargoCapacity - cargoUsed;

  const handleBuy = (commodityId) => {
    const amount = tradeAmounts[commodityId] || 1;
    const item = market.find(m => m.id === commodityId);
    if (!item) return;
    const cost = item.buyPrice * amount;
    if (cost > state.credits) { alert('INSUFFICIENT CREDITS'); return; }
    if (amount > cargoFree) { alert('INSUFFICIENT CARGO SPACE'); return; }
    if (amount > item.stock) { alert('INSUFFICIENT STOCK'); return; }

    addCredits(-cost);
    addCargo(commodityId, amount);
    setTradeAmounts(prev => ({ ...prev, [commodityId]: 1 }));
  };

  const handleSell = (commodityId) => {
    const amount = tradeAmounts[commodityId] || 1;
    const item = market.find(m => m.id === commodityId);
    if (!item) return;
    const cargoItem = state.ship.cargo.find(c => c.commodity === commodityId);
    if (!cargoItem || amount > cargoItem.qty) { alert('INSUFFICIENT CARGO'); return; }

    const revenue = item.sellPrice * amount;
    addCredits(revenue);
    removeCargo(commodityId, amount);
    setTradeAmounts(prev => ({ ...prev, [commodityId]: 1 }));
  };

  const setAmount = (commodityId, amount) => {
    setTradeAmounts(prev => ({ ...prev, [commodityId]: Math.max(1, amount) }));
  };

  const categories = ['all', ...Object.values(COMMODITY_CATEGORIES)];
  const filteredMarket = selectedCategory === 'all'
    ? market
    : market.filter(m => m.category === selectedCategory);

  const getLevelLabel = (level) => {
    if (level < 10) return { label: 'Very Low', color: 'text-red-500' };
    if (level < 30) return { label: 'Low', color: 'text-orange-500' };
    if (level < 60) return { label: 'Medium', color: 'text-yellow-500' };
    if (level < 85) return { label: 'High', color: 'text-green-500' };
    return { label: 'Very High', color: 'text-green-400' };
  };

  if (!station) {
    return <div className="p-4 text-orange-500">Must be docked at a station to access the market.</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase">Commodity Market — {station.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-orange-600">CREDITS: <span className="text-orange-300">{state.credits.toLocaleString()} CR</span></span>
          <span className="text-orange-600">CARGO: <span className="text-orange-300">{cargoUsed}/{state.ship.cargoCapacity} T</span></span>
          <span className="text-orange-600">ECONOMY: <span className="text-orange-300">{station.economy.name}</span></span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto p-2 border-b border-orange-900/50">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-1 text-[10px] whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                : 'border-transparent text-orange-700 hover:text-orange-500'
            }`}
          >
            {cat === 'all' ? 'ALL' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Market table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-black border-b border-orange-900">
            <tr className="text-orange-700 uppercase text-[10px]">
              <th className="text-left p-2">Commodity</th>
              <th className="text-right p-2">Buy</th>
              <th className="text-right p-2">Sell</th>
              <th className="text-center p-2 hidden sm:table-cell">Supply</th>
              <th className="text-center p-2 hidden sm:table-cell">Demand</th>
              <th className="text-right p-2 hidden sm:table-cell">Stock</th>
              <th className="text-center p-2">Cargo</th>
              <th className="text-center p-2">Qty</th>
              <th className="text-center p-2">Trade</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarket.map(item => {
              const cargoItem = state.ship.cargo.find(c => c.commodity === item.id);
              const cargoQty = cargoItem?.qty || 0;
              const supplyInfo = getLevelLabel(item.supply);
              const demandInfo = getLevelLabel(item.demand);
              const amount = tradeAmounts[item.id] || 1;

              return (
                <tr key={item.id} className="border-b border-orange-950/50 hover:bg-orange-950/10">
                  <td className="p-2">
                    <div className="text-orange-400">{item.name}</div>
                    <div className="text-orange-800 text-[9px]">{item.category}</div>
                    {item.legality === 1 && <span className="text-red-600 text-[9px]">⚠ RESTRICTED</span>}
                  </td>
                  <td className="text-right p-2 text-orange-300">{item.buyPrice.toLocaleString()}</td>
                  <td className="text-right p-2 text-orange-500">{item.sellPrice.toLocaleString()}</td>
                  <td className="text-center p-2 hidden sm:table-cell">
                    <span className={supplyInfo.color}>{supplyInfo.label}</span>
                  </td>
                  <td className="text-center p-2 hidden sm:table-cell">
                    <span className={demandInfo.color}>{demandInfo.label}</span>
                  </td>
                  <td className="text-right p-2 hidden sm:table-cell text-orange-600">{item.stock.toLocaleString()}</td>
                  <td className="text-center p-2 text-orange-500">{cargoQty}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 bg-black border border-orange-900 text-orange-400 text-center text-xs py-0.5"
                      />
                      <button onClick={() => setAmount(item.id, Math.min(item.stock, cargoFree))} className="text-[9px] px-1 border border-orange-800 text-orange-600">M</button>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleBuy(item.id)}
                        disabled={item.buyPrice * amount > state.credits || amount > cargoFree || amount > item.stock}
                        className="text-[10px] px-2 py-0.5 border border-green-800 text-green-600 hover:bg-green-950/30 disabled:opacity-20 flex items-center gap-1"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />BUY
                      </button>
                      <button
                        onClick={() => handleSell(item.id)}
                        disabled={cargoQty < amount}
                        className="text-[10px] px-2 py-0.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 disabled:opacity-20 flex items-center gap-1"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />SELL
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Current cargo summary */}
      {state.ship.cargo.length > 0 && (
        <div className="border-t border-orange-900 p-2">
          <div className="text-orange-700 text-[10px] uppercase mb-1 flex items-center gap-1">
            <Package className="w-3 h-3" /> Cargo Hold
          </div>
          <div className="flex flex-wrap gap-2">
            {state.ship.cargo.map(c => {
              const comm = COMMODITY_MAP[c.commodity];
              return (
                <div key={c.commodity} className="text-[10px] text-orange-500 border border-orange-900 px-2 py-0.5">
                  {comm?.name || c.commodity}: {c.qty}T
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}