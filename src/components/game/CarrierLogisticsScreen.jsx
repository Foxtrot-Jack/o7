// Carrier Logistics — multi-jump route planning and tritium management
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { getRouteSummary } from '@/lib/carrierLogistics';
import { Route, Fuel, Navigation, Plus, X, Rocket, MapPin } from 'lucide-react';

export default function CarrierLogisticsScreen() {
  const { state, jumpCarrier, update } = useGameState();
  const carriers = state.fleetCarriers || [];
  const [selectedCarrierId, setSelectedCarrierId] = useState(carriers[0]?.id || null);
  const [route, setRoute] = useState([]);
  const isSandbox = state.saveMode === 'sandbox';

  const carrier = carriers.find(c => c.id === selectedCarrierId);

  const availableDestinations = useMemo(() => {
    return (state.bookmarkedSystems || []).filter(s => s.seed !== carrier?.systemSeed);
  }, [state.bookmarkedSystems, carrier?.systemSeed]);

  const routeSummary = useMemo(() => {
    if (!carrier?.system) return { jumps: 0, distance: 0, tritium: 0 };
    return getRouteSummary(carrier.system, route);
  }, [carrier, route]);

  const addToRoute = (system) => {
    setRoute(prev => [...prev, system]);
  };

  const removeFromRoute = (idx) => {
    setRoute(prev => prev.filter((_, i) => i !== idx));
  };

  const executeNextJump = () => {
    if (!carrier || route.length === 0) return;
    const next = route[0];
    jumpCarrier(carrier.id, next);
    setRoute(prev => prev.slice(1));
  };

  if (carriers.length === 0) {
    return (
      <div className="p-4 text-center text-orange-500">
        <Route className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No fleet carriers owned.</p>
        <p className="text-orange-700 text-xs mt-1">Purchase a fleet carrier at a high-population system.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Carrier Logistics</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Plan multi-jump routes for your fleet carrier. Tritium cost is calculated per jump based on distance.</div>
      </div>

      {/* Carrier selector */}
      <div className="flex flex-wrap gap-1">
        {carriers.map(c => (
          <button
            key={c.id}
            onClick={() => { setSelectedCarrierId(c.id); setRoute([]); }}
            className={`px-3 py-1 text-xs border ${selectedCarrierId === c.id ? 'border-orange-500 bg-orange-950/30 text-orange-300' : 'border-orange-900 text-orange-600'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {carrier && (
        <>
          {/* Carrier status */}
          <div className="border border-orange-900 p-3 grid grid-cols-3 gap-2 text-xs">
            <div className="text-orange-600">SYSTEM: <span className="text-orange-300">{carrier.systemName}</span></div>
            <div className="text-orange-600">TRITIUM: <span className="text-orange-300">{carrier.tritium}/{carrier.tritiumCapacity}</span></div>
            <div className="text-orange-600">BANK: <span className="text-orange-300">{(carrier.bankBalance || 0).toLocaleString()} CR</span></div>
          </div>

          {/* Planned route */}
          <div className="border border-orange-900 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-orange-500" />
              <h3 className="text-orange-500 text-xs font-bold uppercase">Planned Route</h3>
            </div>
            {route.length === 0 ? (
              <div className="text-orange-700 text-[10px]">No destinations added. Select from bookmarked systems below.</div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-orange-600">
                    <MapPin className="w-2.5 h-2.5" /> {carrier.systemName} (current)
                  </div>
                  {route.map((dest, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-orange-400 pl-4">
                      <span className="text-orange-700">→</span> {dest.name}
                      <button onClick={() => removeFromRoute(i)} className="ml-auto text-red-600 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                {/* Route summary */}
                <div className="grid grid-cols-3 gap-2 text-[10px] border border-orange-950 p-2">
                  <div className="text-orange-600">JUMPS: <span className="text-orange-300">{routeSummary.jumps}</span></div>
                  <div className="text-orange-600">DISTANCE: <span className="text-orange-300">{routeSummary.distance} LY</span></div>
                  <div className="text-orange-600">TRITIUM: <span className={carrier.tritium >= routeSummary.tritium ? 'text-green-400' : 'text-red-400'}>{routeSummary.tritium}</span></div>
                </div>
                {/* Execute next jump */}
                <button
                  onClick={executeNextJump}
                  disabled={route.length === 0 || (!isSandbox && carrier.tritium < Math.ceil(getRouteSummary(carrier.system, [route[0]]).tritium))}
                  className="w-full py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
                >
                  <Rocket className="w-3.5 h-3.5" /> EXECUTE NEXT JUMP → {route[0]?.name}
                </button>
              </>
            )}
          </div>

          {/* Available destinations */}
          <div className="border border-orange-900 p-3 space-y-2">
            <h3 className="text-orange-500 text-xs font-bold uppercase">Bookmarked Systems</h3>
            {availableDestinations.length === 0 ? (
              <div className="text-orange-700 text-[10px]">No bookmarked systems available. Bookmark systems in the Galaxy Map to add them as route destinations.</div>
            ) : (
              <div className="space-y-1">
                {availableDestinations.map(sys => (
                  <button
                    key={sys.seed}
                    onClick={() => addToRoute(sys)}
                    className="w-full flex items-center justify-between border border-orange-950 p-1.5 text-xs text-orange-400 hover:bg-orange-950/30"
                  >
                    <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> {sys.name}</span>
                    <span className="text-[9px] text-orange-700">{sys.starClass?.class || '?'} · {sys.security || '?'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}