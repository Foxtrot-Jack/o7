// Advanced Maintenance — restock heatsinks, shield cells, repair modules, restock fighters/SRV.
import React from 'react';
import { Wrench, Flame, Shield, Plane, MapPin } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

export default function AdvancedMaintenance() {
  const { state, update, repairShip } = useGameState();
  const isSb = state.saveMode === 'sandbox';
  const restock = (key, cost) => {
    if (!isSb && state.credits < cost) return;
    update(prev => ({ credits: prev.credits - (isSb ? 0 : cost), [key]: (prev[key] || 0) + 3 }));
  };
  const fullRepair = () => {
    if (!isSb && state.credits < 10000) return;
    update(prev => ({ credits: prev.credits - (isSb ? 0 : 10000), ship: { ...prev.ship, integrity: 100, moduleWear: 0 } }));
  };

  const Row = ({ icon: Icon, title, desc, current, cost, onClick }) => (
    <div className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
      <Icon className="w-3.5 h-3.5 text-orange-600" />
      <div className="flex-1">
        <div className="text-orange-300">{title}</div>
        <div className="text-orange-800 text-[10px]">{desc}{current != null && ` · ${current} charges`}</div>
      </div>
      <button onClick={onClick} className="px-2 py-1 border border-orange-800 text-orange-400 hover:bg-orange-950/30 text-[10px]">
        {isSb ? 'RESTOCK' : `${cost.toLocaleString()} CR`}
      </button>
    </div>
  );

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Wrench className="w-4 h-4" /> Advanced Maintenance
      </div>
      <Row icon={Wrench} title="Full Repair" desc="Restore hull integrity & module wear" current={null} cost={10000} onClick={fullRepair} />
      <Row icon={Flame} title="Heat Sink Restock" desc="Restock heat sink charges (+3)" current={state.heatSinkCharges} cost={5000} onClick={() => restock('heatSinkCharges', 5000)} />
      <Row icon={Shield} title="Shield Cell Restock" desc="Restock shield cell charges (+3)" current={state.shieldCellCharges} cost={5000} onClick={() => restock('shieldCellCharges', 5000)} />
      <Row icon={Plane} title="Fighter Restock" desc="Rebuild destroyed ship-launched fighters" current={null} cost={20000} onClick={() => update(prev => ({ fighters: (prev.fighters || []).map(f => ({ ...f, condition: 'ready', damage: 0 })) }))} />
      <Row icon={MapPin} title="SRV Restock" desc="Rebuild destroyed SRV rovers" current={null} cost={10000} onClick={() => update(prev => ({ srvCount: (prev.srvCount || 1) }))} />
    </div>
  );
}