// Carrier Command — unified fleet carrier management dashboard
import React, { useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { getCarrierSummary, getServiceStatus } from '@/lib/carrierCommand';
import { LayoutDashboard, Anchor, Fuel, Coins, Package, Settings, Ship as ShipIcon } from 'lucide-react';

export default function CarrierCommandScreen() {
  const { state, update, collectCarrierIncome, renameCarrier } = useGameState();
  const carriers = state.fleetCarriers || [];

  if (carriers.length === 0) {
    return (
      <div className="p-4 text-center text-orange-500">
        <LayoutDashboard className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No fleet carriers owned.</p>
        <p className="text-orange-700 text-xs mt-1">Purchase a fleet carrier at a high-population system.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Carrier Command Dashboard</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Unified management for all fleet carriers — revenue, tritium, docked ships, services, and orders in one view.</div>
      </div>

      {carriers.map(carrier => {
        const summary = getCarrierSummary(carrier, state.ownedShips);
        const services = getServiceStatus(carrier);
        return (
          <div key={carrier.id} className="border border-orange-900 p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-orange-500" />
                <span className="text-orange-300 text-xs font-bold">{carrier.name}</span>
                <span className="text-[9px] text-orange-700 border border-orange-950 px-1">{summary.systemName}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="border border-orange-950 p-1.5">
                <Fuel className="w-3 h-3 mx-auto text-orange-500" />
                <div className="text-[9px] text-orange-700 uppercase">Tritium</div>
                <div className="text-orange-300 text-xs font-bold">{summary.tritium}/{summary.tritiumCapacity}</div>
              </div>
              <div className="border border-orange-950 p-1.5">
                <Coins className="w-3 h-3 mx-auto text-green-500" />
                <div className="text-[9px] text-orange-700 uppercase">Revenue</div>
                <div className="text-green-400 text-xs font-bold">{summary.pendingRevenue.toLocaleString()}</div>
              </div>
              <div className="border border-orange-950 p-1.5">
                <Package className="w-3 h-3 mx-auto text-orange-500" />
                <div className="text-[9px] text-orange-700 uppercase">Orders</div>
                <div className="text-orange-300 text-xs font-bold">{summary.orders}</div>
              </div>
              <div className="border border-orange-950 p-1.5">
                <ShipIcon className="w-3 h-3 mx-auto text-orange-500" />
                <div className="text-[9px] text-orange-700 uppercase">Ships</div>
                <div className="text-orange-300 text-xs font-bold">{summary.dockedShips}</div>
              </div>
            </div>

            {/* Collect revenue */}
            {summary.pendingRevenue > 0 && (
              <button
                onClick={() => collectCarrierIncome(carrier.id)}
                className="w-full py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
              >
                <Coins className="w-3 h-3" /> COLLECT {summary.pendingRevenue.toLocaleString()} CR
              </button>
            )}

            {/* Services */}
            <div className="border-t border-orange-950 pt-2">
              <div className="text-[9px] text-orange-700 uppercase mb-1 flex items-center gap-1"><Settings className="w-2.5 h-2.5" /> Services</div>
              <div className="flex flex-wrap gap-1">
                {services.map(svc => (
                  <span key={svc.id} className={`text-[9px] border px-1.5 py-0.5 ${svc.enabled ? 'border-green-900 text-green-600' : 'border-orange-950 text-orange-800'}`}>
                    {svc.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Docked ships */}
            {summary.shipList.length > 0 && (
              <div className="border-t border-orange-950 pt-2">
                <div className="text-[9px] text-orange-700 uppercase mb-1 flex items-center gap-1"><ShipIcon className="w-2.5 h-2.5" /> Docked Ships</div>
                <div className="space-y-0.5">
                  {summary.shipList.map(ship => (
                    <div key={ship.id} className="text-[10px] text-orange-400 flex justify-between">
                      <span>{ship.customName || ship.typeId}</span>
                      <span className="text-orange-700">{ship.typeId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}