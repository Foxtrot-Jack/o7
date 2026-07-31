// Maintenance — ship module wear, station repair, and AFMU field repair
import React from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { getWearLabel, getModuleEffectiveness, AFMU_COST, canUseAFMU, getStationRepairCost } from '@/lib/shipMaintenance';
import { Wrench, Settings, Zap, AlertTriangle, Package } from 'lucide-react';

export default function MaintenanceScreen() {
  const { state, addCredits, update, repairShip } = useGameState();
  const isSandbox = state.saveMode === 'sandbox';
  const isDocked = state.currentLocation === 'station';
  const moduleWear = state.ship.moduleWear || 0;
  const wearLabel = getWearLabel(moduleWear);
  const effectiveness = Math.round(getModuleEffectiveness(moduleWear) * 100);
  const shipType = SHIP_MAP[state.ship.type];
  const shipClass = shipType?.class || 1;
  const stationRepairCost = getStationRepairCost(moduleWear, shipClass);
  const materials = state.materials || {};
  const afmuReady = canUseAFMU(materials);

  const handleStationRepair = () => {
    if (moduleWear <= 0) return;
    if (!isSandbox && state.credits < stationRepairCost) return;
    if (!isSandbox) addCredits(-stationRepairCost);
    update(prev => ({ ...prev, ship: { ...prev.ship, moduleWear: 0 } }));
  };

  const handleAFMU = () => {
    if (moduleWear <= 0 || !afmuReady) return;
    update(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        nickel: (prev.materials?.nickel || 0) - AFMU_COST.nickel,
        phosphorus: (prev.materials?.phosphorus || 0) - AFMU_COST.phosphorus,
        chromium: (prev.materials?.chromium || 0) - AFMU_COST.chromium,
      },
      ship: { ...prev.ship, moduleWear: Math.max(0, (prev.ship.moduleWear || 0) - 50) },
    }));
  };

  const handleHullRepair = () => {
    const integrity = state.ship.integrity ?? 100;
    const damage = 100 - integrity;
    if (damage <= 0) return;
    const cost = isSandbox ? 0 : Math.ceil(damage * 10000 * shipClass);
    if (!isSandbox && state.credits < cost) return;
    if (!isSandbox) addCredits(-cost);
    repairShip(damage);
  };

  const hullIntegrity = state.ship.integrity ?? 100;
  const hullDamage = 100 - hullIntegrity;
  const hullRepairCost = isSandbox ? 0 : Math.ceil(hullDamage * 10000 * shipClass);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Ship Maintenance</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Modules degrade with use. High wear reduces FSD range, shield strength, weapon damage, and speed. Repair at stations or use an AFMU in the field.</div>
      </div>

      {/* Module wear status */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-orange-400 text-xs font-bold uppercase">Module Wear</span>
          <span className={`text-xs font-bold ${wearLabel.color}`}>{wearLabel.label}</span>
        </div>
        <div className="w-full h-3 bg-black border border-orange-950">
          <div className={`h-full transition-all ${moduleWear > 60 ? 'bg-red-600' : moduleWear > 30 ? 'bg-yellow-600' : 'bg-green-600'}`} style={{ width: `${moduleWear}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-orange-600">
          <span>{moduleWear.toFixed(1)}% wear</span>
          <span>Effectiveness: <span className={effectiveness < 75 ? 'text-red-400' : 'text-green-400'}>{effectiveness}%</span></span>
        </div>
        {moduleWear > 0 && (
          <div className="text-[9px] text-orange-700 border border-orange-950 p-1.5">
            {moduleWear > 60 ? '⚠ CRITICAL: Modules severely degraded. FSD range, shields, and weapons at reduced capacity.' : moduleWear > 30 ? 'Modules showing significant wear. Performance reduced.' : 'Minor wear detected. All systems operational.'}
          </div>
        )}
      </div>

      {/* Hull integrity */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-orange-400 text-xs font-bold uppercase">Hull Integrity</span>
          <span className={`text-xs font-bold ${hullIntegrity > 70 ? 'text-green-500' : hullIntegrity > 30 ? 'text-yellow-500' : 'text-red-500'}`}>{hullIntegrity.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-black border border-orange-950">
          <div className={`h-full ${hullIntegrity > 70 ? 'bg-green-600' : hullIntegrity > 30 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${hullIntegrity}%` }} />
        </div>
        {hullDamage > 0 ? (
          isDocked ? (
            <button
              onClick={handleHullRepair}
              disabled={!isSandbox && state.credits < hullRepairCost}
              className="w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/30 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
            >
              <Wrench className="w-3 h-3" /> {isSandbox ? 'REPAIR HULL — FREE' : `REPAIR HULL — ${hullRepairCost.toLocaleString()} CR`}
            </button>
          ) : (
            <div className="text-[10px] text-orange-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Dock at a station for hull repairs.</div>
          )
        ) : (
          <div className="text-green-500 text-[10px]">All systems nominal.</div>
        )}
      </div>

      {/* Station repair */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" />
          <span className="text-orange-400 text-xs font-bold uppercase">Station Maintenance Bay</span>
        </div>
        {moduleWear > 0 ? (
          isDocked ? (
            <button
              onClick={handleStationRepair}
              disabled={!isSandbox && state.credits < stationRepairCost}
              className="w-full py-2 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
            >
              <Settings className="w-3 h-3" /> {isSandbox ? 'FULL MODULE SERVICE — FREE' : `FULL MODULE SERVICE — ${stationRepairCost.toLocaleString()} CR`}
            </button>
          ) : (
            <div className="text-[10px] text-orange-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Dock at a station for full module servicing.</div>
          )
        ) : (
          <div className="text-green-500 text-[10px]">Modules in perfect condition.</div>
        )}
      </div>

      {/* AFMU field repair */}
      <div className="border border-blue-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-xs font-bold uppercase">AFMU — Auto Field Maintenance Unit</span>
        </div>
        <div className="text-[10px] text-orange-600">Field-repairable module wear using synthesis materials. Reduces wear by 50% per use. Available anywhere — no station required.</div>
        <div className="flex items-center gap-2 text-[10px]">
          <Package className="w-3 h-3 text-orange-500" />
          <span className="text-orange-600">COST:</span>
          <span className={materials.nickel >= AFMU_COST.nickel ? 'text-green-400' : 'text-red-400'}>Nickel {materials.nickel || 0}/{AFMU_COST.nickel}</span>
          <span className={materials.phosphorus >= AFMU_COST.phosphorus ? 'text-green-400' : 'text-red-400'}>Phosphorus {materials.phosphorus || 0}/{AFMU_COST.phosphorus}</span>
          <span className={materials.chromium >= AFMU_COST.chromium ? 'text-green-400' : 'text-red-400'}>Chromium {materials.chromium || 0}/{AFMU_COST.chromium}</span>
        </div>
        <button
          onClick={handleAFMU}
          disabled={moduleWear <= 0 || !afmuReady}
          className="w-full py-2 border border-blue-500 text-blue-300 hover:bg-blue-950/30 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
        >
          <Zap className="w-3 h-3" /> ACTIVATE AFMU (−50% wear)
        </button>
        {moduleWear <= 0 && <div className="text-green-500 text-[10px] text-center">No wear to repair.</div>}
      </div>
    </div>
  );
}