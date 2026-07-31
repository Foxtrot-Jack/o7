// Passenger Lounge — accept and complete passenger transport missions
import React, { useState, useMemo } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { generatePassengerMissions, getPassengerCapacity, isPassengerMissionReady, PASSENGER_TYPES } from '@/lib/passengers';
import { Users, MapPin, Clock, CheckCircle, Coins, UserCheck } from 'lucide-react';

export default function PassengerScreen() {
  const { state, addPassengerMission, completePassengerMission } = useGameState();
  const [refreshKey, setRefreshKey] = useState(0);

  const shipType = SHIP_MAP[state.ship.type];
  const shipClass = shipType?.class || (state.ship.type === 'custom' ? 2 : 1);
  const capacity = getPassengerCapacity(shipClass);
  const activeMissions = state.passengerMissions || [];
  const usedCapacity = activeMissions.reduce((sum, m) => sum + m.passengers, 0);
  const freeCapacity = capacity - usedCapacity;

  const availableMissions = useMemo(() => {
    if (capacity === 0) return [];
    return generatePassengerMissions(state.currentSystem?.seed, shipClass, 6);
  }, [state.currentSystem?.seed, shipClass, refreshKey]);

  if (capacity === 0) {
    return (
      <div className="p-4 text-center text-orange-500">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No passenger cabin capacity.</p>
        <p className="text-orange-700 text-xs mt-1">Your ship (Class {shipClass}) cannot fit passenger cabins. Upgrade to a Class 2+ ship.</p>
      </div>
    );
  }

  const handleComplete = (mission) => {
    if (!isPassengerMissionReady(mission)) return;
    if (state.currentLocation !== 'station') return;
    completePassengerMission(mission.id);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Passenger Lounge — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">
          Cabin Capacity: {usedCapacity}/{capacity} · Free: {freeCapacity} · {state.currentLocation === 'station' ? 'At station — can complete missions' : 'In transit — dock to complete'}
        </div>
      </div>

      {/* Active passenger missions */}
      {activeMissions.length > 0 && (
        <div className="border border-cyan-900 p-3 space-y-2">
          <h3 className="text-cyan-400 text-xs font-bold uppercase">Active Contracts</h3>
          {activeMissions.map(m => {
            const ready = isPassengerMissionReady(m);
            const atStation = state.currentLocation === 'station';
            return (
              <div key={m.id} className={`border p-2 ${ready ? 'border-green-800' : 'border-cyan-950'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-cyan-300 text-xs font-bold">{m.type.label} — {m.passengers} passenger(s)</div>
                    <div className="text-[10px] text-orange-600 flex items-center gap-3">
                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {m.destination}</span>
                      <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" /> {m.reward.toLocaleString()} CR</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {m.jumpsCompleted}/{m.jumpsRequired} jumps</span>
                    </div>
                  </div>
                  {ready ? (
                    atStation ? (
                      <button onClick={() => handleComplete(m)} className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> COMPLETE
                      </button>
                    ) : (
                      <span className="text-green-600 text-[10px]">Dock to complete</span>
                    )
                  ) : (
                    <span className="text-cyan-600 text-[10px]">{m.jumpsRequired - m.jumpsCompleted} jump(s) left</span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-black border border-cyan-950 mt-1">
                  <div className="h-full bg-cyan-600 transition-all" style={{ width: `${(m.jumpsCompleted / m.jumpsRequired) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available missions */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Available Transport</h3>
          <button onClick={() => setRefreshKey(k => k + 1)} className="text-[10px] text-orange-600 hover:text-orange-400 border border-orange-900 px-2 py-0.5">REFRESH</button>
        </div>
        {availableMissions.map(m => {
          const canAccept = m.passengers <= freeCapacity;
          return (
            <div key={m.id} className="border border-orange-950 p-2 flex items-center justify-between">
              <div>
                <div className="text-orange-300 text-xs font-bold">{m.type.label} — {m.passengers} passenger(s)</div>
                <div className="text-[10px] text-orange-600 flex items-center gap-3">
                  <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> → {m.destination}</span>
                  <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" /> {m.reward.toLocaleString()} CR</span>
                  <span>{m.jumpsRequired} jump(s) required</span>
                </div>
                <div className="text-[9px] text-orange-700 mt-0.5">{m.type.desc}</div>
              </div>
              <button
                onClick={() => addPassengerMission(m)}
                disabled={!canAccept}
                className="px-3 py-1 border border-orange-600 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" /> {canAccept ? 'ACCEPT' : 'FULL'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}