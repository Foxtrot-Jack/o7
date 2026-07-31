// Fighter Hangar — build, deploy, and manage ship-launched fighters
import React from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { FIGHTER_TYPES, canDeployFighter, getFighterHangarCapacity } from '@/lib/fighters';
import { Plane, Rocket, UserCheck, Trash2, Power } from 'lucide-react';

export default function FighterScreen() {
  const { state, buildFighter, dismissFighter, update } = useGameState();
  const shipType = SHIP_MAP[state.ship.type];
  const shipClass = shipType?.class || (state.ship.type === 'custom' ? 2 : 1);
  const canDeploy = canDeployFighter(shipClass);
  const capacity = getFighterHangarCapacity(shipClass);
  const fighters = state.fighters || [];
  const activeFighters = fighters.filter(f => f.condition !== 'destroyed');
  const wingmates = state.wingmates || [];
  const isSandbox = state.saveMode === 'sandbox';

  const toggleDeploy = (fighterId) => {
    update(prev => ({
      ...prev,
      fighters: prev.fighters.map(f => f.id === fighterId ? { ...f, deployed: !f.deployed } : f),
    }));
  };

  const assignPilot = (fighterId, pilotId) => {
    update(prev => ({
      ...prev,
      fighters: prev.fighters.map(f => f.id === fighterId ? { ...f, pilotId: f.pilotId === pilotId ? null : pilotId } : f),
    }));
  };

  if (!canDeploy) {
    return (
      <div className="p-4 text-center text-orange-500">
        <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No fighter hangar available.</p>
        <p className="text-orange-700 text-xs mt-1">Fighter hangars require a Class 3 or larger ship.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Fighter Hangar</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">
          Hangar capacity: {activeFighters.length}/{capacity} · Ship class: {shipClass} · Deployed: {fighters.filter(f => f.deployed).length}
        </div>
      </div>

      {/* Active fighters */}
      {fighters.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Deployed Fighters</h3>
          {fighters.map(f => (
            <div key={f.id} className={`border p-2 space-y-2 ${f.deployed ? 'border-cyan-800' : 'border-orange-900'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-300 text-xs font-bold">{f.name}</div>
                  <div className="text-[10px] text-orange-600">DMG: {f.damage} · HULL: {f.hull} · {f.condition === 'destroyed' ? 'DESTROYED' : f.deployed ? 'DEPLOYED' : 'STANDBY'}</div>
                </div>
                <div className="flex gap-1">
                  {f.condition !== 'destroyed' && (
                    <button onClick={() => toggleDeploy(f.id)} className={`px-2 py-1 border text-[10px] font-bold ${f.deployed ? 'border-yellow-700 text-yellow-500' : 'border-cyan-600 text-cyan-400 hover:bg-cyan-950/30'}`}>
                      <Power className="w-3 h-3 inline" /> {f.deployed ? 'RECALL' : 'DEPLOY'}
                    </button>
                  )}
                  <button onClick={() => dismissFighter(f.id)} className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px]">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Pilot assignment */}
              {f.condition !== 'destroyed' && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-[9px] text-orange-700">Pilot:</span>
                  {wingmates.length === 0 && <span className="text-[9px] text-orange-800">No wingmates hired. Autonomous mode (reduced effectiveness).</span>}
                  {wingmates.map(wm => (
                    <button
                      key={wm.id}
                      onClick={() => assignPilot(f.id, wm.id)}
                      className={`text-[9px] border px-1.5 py-0.5 ${f.pilotId === wm.id ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300' : 'border-orange-800 text-orange-600'}`}
                    >
                      <UserCheck className="w-2.5 h-2.5 inline" /> {wm.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Build fighters */}
      <div className="border border-orange-900 p-3 space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Construct Fighter</h3>
        {FIGHTER_TYPES.map(ft => (
          <div key={ft.id} className="border border-orange-950 p-2 flex items-center justify-between">
            <div>
              <div className="text-orange-300 text-xs font-bold">{ft.name}</div>
              <div className="text-[10px] text-orange-600">DMG: {ft.damage} · HULL: {ft.hull} · SPD: {ft.speed} · {ft.desc}</div>
            </div>
            <button
              onClick={() => buildFighter(ft.id)}
              disabled={activeFighters.length >= capacity || (!isSandbox && state.credits < ft.cost)}
              className="px-3 py-1 border border-green-700 text-green-500 hover:bg-green-950/30 text-[10px] font-bold disabled:opacity-30 flex items-center gap-1"
            >
              <Rocket className="w-3 h-3" /> {ft.cost.toLocaleString()} CR
            </button>
          </div>
        ))}
        {activeFighters.length >= capacity && <div className="text-orange-700 text-[10px] text-center">Hangar full. Dismiss a fighter to build a new one.</div>}
      </div>
    </div>
  );
}