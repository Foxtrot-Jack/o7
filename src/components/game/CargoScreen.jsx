// Ship Cargo — current cargo with info + jettison (fines apply if docked).
import React, { useState } from 'react';
import { Package, Info, Trash2 } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { COMMODITY_MAP } from '@/lib/commodities';

export default function CargoScreen() {
  const { state, removeCargo, addCredits } = useGameState();
  const cargo = state.ship?.cargo || [];
  const docked = state.currentLocation === 'station';
  const [info, setInfo] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const jettison = (commodityId, qty) => {
    if (docked) addCredits(-5000); // station fine for littering
    removeCargo(commodityId, qty);
    setConfirm(null);
  };

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Package className="w-4 h-4" /> Ship Cargo
      </div>
      <div className="text-orange-700 text-[10px]">Cargo capacity: {cargo.reduce((s, c) => s + c.qty, 0)} / {state.ship?.cargoCapacity || 0} T</div>
      {cargo.length === 0 && <div className="text-orange-800 text-xs">Cargo hold empty.</div>}
      {cargo.map(c => {
        const comm = COMMODITY_MAP[c.commodity] || {};
        return (
          <div key={c.commodity} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
            <Package className="w-3.5 h-3.5 text-orange-600" />
            <div className="flex-1">
              <div className="text-orange-300">{comm.name || c.commodity} <span className="text-orange-800">×{c.qty}</span></div>
              <div className="text-orange-800 text-[10px] uppercase">{comm.category || 'commodity'}</div>
            </div>
            <button onClick={() => setInfo(info === c.commodity ? null : c.commodity)} className="p-1 border border-orange-800 text-orange-500 hover:text-orange-400"><Info className="w-3 h-3" /></button>
            {confirm === c.commodity ? (
              <button onClick={() => jettison(c.commodity, c.qty)} className="px-2 py-1 border border-red-700 text-red-500 text-[10px]">CONFIRM</button>
            ) : (
              <button onClick={() => setConfirm(c.commodity)} className="p-1 border border-red-800 text-red-500 hover:bg-red-950/30"><Trash2 className="w-3 h-3" /></button>
            )}
          </div>
        );
      })}
      {info && (
        <div className="border border-orange-800 bg-black/60 p-2 text-[10px] text-orange-600">
          {COMMODITY_MAP[info]?.description || 'No information available.'}
        </div>
      )}
      {docked && <div className="text-red-700 text-[10px]">⚠ Jettisoning while docked incurs a 5,000 CR station fine.</div>}
    </div>
  );
}