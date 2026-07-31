// Market Analysis — AI-powered trade reports and price tracking
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { base44 } from '@/api/base44Client';
import { generatePriceSnapshot, findBestDeals, generateReportPrompt } from '@/lib/marketAnalysis';
import { Brain, TrendingUp, TrendingDown, RefreshCw, Coins } from 'lucide-react';

export default function MarketAnalysisScreen() {
  const { state, getSystemData } = useGameState();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const systemData = getSystemData();

  const prices = useMemo(() => generatePriceSnapshot(state.currentSystem?.seed, systemData), [state.currentSystem?.seed, systemData]);
  const deals = useMemo(() => findBestDeals(prices), [prices]);

  const handleReport = async () => {
    setLoading(true);
    setReport('');
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: generateReportPrompt(state.currentSystem),
        add_context_from_internet: false,
      });
      setReport(typeof res === 'string' ? res : JSON.stringify(res));
    } catch (e) {
      setReport('Market analysis unavailable at this time. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Market Analysis — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">AI-powered galactic market reports and commodity price analysis. Identify the best buys and sells in the current system.</div>
      </div>

      {/* AI Report */}
      <div className="border border-blue-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <h3 className="text-blue-300 text-xs font-bold uppercase">AI Market Report</h3>
        </div>
        <button
          onClick={handleReport}
          disabled={loading}
          className={`w-full py-1.5 border text-xs font-bold flex items-center justify-center gap-1 ${loading ? 'border-blue-950 text-blue-800 animate-pulse' : 'border-blue-500 text-blue-300 hover:bg-blue-950/30'}`}
        >
          {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> ANALYZING...</> : <><Brain className="w-3 h-3" /> GENERATE REPORT</>}
        </button>
        {report && (
          <div className="border border-blue-950 p-2 text-[10px] text-orange-400 leading-relaxed whitespace-pre-line">
            {report}
          </div>
        )}
      </div>

      {/* Best deals */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-green-900 p-3 space-y-1">
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase">
            <TrendingDown className="w-3 h-3" /> Best Buys
          </div>
          {deals.bestBuys.map((d, i) => (
            <div key={i} className="text-[10px] text-orange-400 flex justify-between">
              <span>{d.name}</span>
              <span className="text-green-500">{d.price.toLocaleString()} CR</span>
            </div>
          ))}
        </div>
        <div className="border border-red-900 p-3 space-y-1">
          <div className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase">
            <TrendingUp className="w-3 h-3" /> Best Sells
          </div>
          {deals.bestSells.map((d, i) => (
            <div key={i} className="text-[10px] text-orange-400 flex justify-between">
              <span>{d.name}</span>
              <span className="text-red-400">{d.price.toLocaleString()} CR</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price table */}
      <div className="border border-orange-900 p-3 space-y-1">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Commodity Prices (Snapshot)</h3>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {prices.map((p, i) => (
            <div key={i} className="text-[10px] flex items-center justify-between border-b border-orange-950/50 pb-0.5">
              <span className="text-orange-400">{p.name}</span>
              <span className="text-orange-700">{p.category.slice(0, 8)}</span>
              <span className={p.variance > 1 ? 'text-green-500' : 'text-red-500'}>{p.price.toLocaleString()} CR</span>
              <span className={`text-[9px] ${p.variance > 1 ? 'text-green-700' : 'text-red-700'}`}>{p.variance > 1 ? '↑' : '↓'}{Math.abs(Math.round((p.variance - 1) * 100))}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}