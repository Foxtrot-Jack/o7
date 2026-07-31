// Material Trader Screen — exchange raw materials at different grades
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { ALL_MATERIAL_IDS, MATERIAL_GRADES, MATERIAL_NAMES, GRADE_NAMES, getGiveAmount } from '@/lib/materialTrader';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';

export default function MaterialTraderScreen() {
  const { state, update } = useGameState();
  const [giveMat, setGiveMat] = useState(null);
  const [recvMat, setRecvMat] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  const materials = state.materials || {};
  const ownedMats = ALL_MATERIAL_IDS.filter(m => (materials[m] || 0) > 0);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  const giveGrade = giveMat ? MATERIAL_GRADES[giveMat] : 0;
  const recvGrade = recvMat ? MATERIAL_GRADES[recvMat] : 0;
  const giveAmount = giveMat && recvMat ? getGiveAmount(giveGrade, recvGrade) : 0;
  const totalGive = giveAmount * qty;
  const maxQty = giveMat && recvMat ? Math.floor((materials[giveMat] || 0) / giveAmount) : 0;

  const handleTrade = () => {
    if (!giveMat || !recvMat) return;
    if ((materials[giveMat] || 0) < totalGive) { flash('Not enough material to trade.'); return; }
    const newMats = { ...materials };
    newMats[giveMat] -= totalGive;
    newMats[recvMat] = (newMats[recvMat] || 0) + qty;
    update({ materials: newMats });
    flash(`Traded ${totalGive} ${MATERIAL_NAMES[giveMat]} for ${qty} ${MATERIAL_NAMES[recvMat]}.`);
    if (newMats[giveMat] <= 0) setGiveMat(null);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <ArrowLeftRight className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Material Trader</h2>
      </div>

      <div className="text-orange-600 text-xs">
        Exchange raw materials at grade-based ratios. Same-grade swaps cost 6:1. Upgrading costs more; downgrading costs less.
      </div>

      {/* Trade interface */}
      <div className="border border-orange-900 p-3 space-y-3">
        {/* Give selector */}
        <div>
          <div className="text-orange-500 text-[10px] font-bold uppercase mb-1">Give (Your Materials)</div>
          {ownedMats.length === 0 ? (
            <div className="text-orange-800 text-xs py-2">No materials available. Mine asteroids or collect surface deposits.</div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {ownedMats.map(matId => (
                <button
                  key={matId}
                  onClick={() => setGiveMat(matId)}
                  className={`px-2 py-1 border text-[10px] ${giveMat === matId ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}
                >
                  {MATERIAL_NAMES[matId]} ({materials[matId]}) · G{MATERIAL_GRADES[matId]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Receive selector */}
        {giveMat && (
          <div>
            <div className="text-orange-500 text-[10px] font-bold uppercase mb-1">Receive</div>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {ALL_MATERIAL_IDS.filter(m => m !== giveMat).map(matId => (
                <button
                  key={matId}
                  onClick={() => setRecvMat(matId)}
                  className={`px-2 py-1 border text-[10px] ${recvMat === matId ? 'border-green-500 bg-green-950/30 text-green-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}
                >
                  {MATERIAL_NAMES[matId]} · G{MATERIAL_GRADES[matId]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trade summary */}
        {giveMat && recvMat && (
          <div className="border-t border-orange-900 pt-2 space-y-2">
            <div className="flex items-center justify-center gap-3 text-xs">
              <span className="text-orange-300">{totalGive} {MATERIAL_NAMES[giveMat]}</span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
              <span className="text-green-400">{qty} {MATERIAL_NAMES[recvMat]}</span>
            </div>
            <div className="text-center text-orange-700 text-[10px]">
              Ratio: {giveAmount}:1 · {GRADE_NAMES[giveGrade]} → {GRADE_NAMES[recvGrade]}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600 text-[10px]">QTY:</span>
              <input
                type="range" min="1" max={Math.max(1, maxQty)} value={qty}
                onChange={e => setQty(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-orange-400 text-xs w-8">{qty}</span>
            </div>
            <button
              onClick={handleTrade}
              disabled={maxQty < 1}
              className="w-full py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold disabled:opacity-30"
            >
              EXECUTE TRADE
            </button>
            {msg && <div className="text-center text-orange-500 text-[10px]">{msg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}