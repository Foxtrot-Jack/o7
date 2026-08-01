// Warp Gate Network — build and use interstellar warp gates
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { GATE_CREDIT_COST, GATE_MATERIAL_COST, GATE_MATERIAL_LABELS, getGateBuildProgress, canBuildGate } from '@/lib/warpGates';
import { distance3D } from '@/lib/galaxy';
import { Network, Anchor, Zap, Globe } from 'lucide-react';

export default function WarpGateScreen() {
  const { state, buildWarpGate, warpJump } = useGameState();
  const [gateName, setGateName] = useState('');

  const gates = state.warpGates || [];
  const currentGate = gates.find(g => g.systemSeed === state.currentSystem.seed);
  const otherGates = gates.filter(g => g.systemSeed !== state.currentSystem.seed);
  const buildCheck = canBuildGate(state);
  const matProgress = getGateBuildProgress(state.materials);

  const handleBuild = () => {
    buildWarpGate(gateName || `Gate ${String.fromCharCode(65 + gates.length)}`);
    setGateName('');
  };

  const handleJump = (gateId) => {
    warpJump(gateId);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-cyan-700 p-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-500" />
          <h2 className="text-cyan-300 font-bold uppercase">Warp Gate Network</h2>
        </div>
        <div className="text-[10px] text-cyan-600 mt-1">
          Massive structures enabling instantaneous travel between linked systems. Any ship can use an operational gate. Every gate connects to every other gate.
        </div>
      </div>

      {/* Current system status */}
      <div className={`border p-3 ${currentGate ? 'border-green-700' : 'border-orange-900'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 text-xs font-bold uppercase">{state.currentSystem.name}</span>
          {currentGate && <span className="text-green-500 text-[10px]">✓ GATE PRESENT</span>}
        </div>
        {currentGate ? (
          <div className="text-[10px] text-green-600">Warp gate "{currentGate.name}" is operational. Select a destination below to jump.</div>
        ) : (
          <div className="text-[10px] text-orange-600">No warp gate in this system. Build one to connect to the network.</div>
        )}
      </div>

      {/* Jump interface */}
      {currentGate && otherGates.length > 0 && (
        <div className="border border-cyan-900 p-3 space-y-2">
          <div className="text-cyan-400 text-xs font-bold uppercase">Available Destinations</div>
          {otherGates.map(gate => {
            const dist = distance3D(state.currentSystem, gate.system);
            return (
              <div key={gate.id} className="border border-orange-950 p-2 flex items-center justify-between">
                <div>
                  <div className="text-orange-300 text-xs">{gate.name}</div>
                  <div className="text-orange-700 text-[10px]">{gate.systemName} · {dist.toFixed(0)} LY</div>
                </div>
                <button
                  onClick={() => handleJump(gate.id)}
                  className="px-3 py-1.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-[10px] font-bold flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> WARP JUMP
                </button>
              </div>
            );
          })}
        </div>
      )}
      {currentGate && otherGates.length === 0 && (
        <div className="border border-orange-900 p-3 text-center text-orange-700 text-xs">
          No other gates in the network. Build a gate in another system to enable travel.
        </div>
      )}

      {/* Build interface */}
      {!currentGate && (
        <div className="border border-orange-900 p-3 space-y-3">
          <div className="text-orange-400 text-xs font-bold uppercase flex items-center gap-1">
            <Anchor className="w-3 h-3" /> Construct Warp Gate
          </div>

          {/* Requirements checklist */}
          <div className="space-y-1">
            <div className="text-[10px] text-orange-700 uppercase">Requirements</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
              <div className={state.fleetCarriers?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                {state.fleetCarriers?.length > 0 ? '✓' : '✗'} Fleet Carrier Owned
              </div>
              <div className={state.fleetCarriers?.some(c => c.systemSeed === state.currentSystem.seed) ? 'text-green-600' : 'text-red-600'}>
                {state.fleetCarriers?.some(c => c.systemSeed === state.currentSystem.seed) ? '✓' : '✗'} Carrier In System
              </div>
              <div className={state.credits >= GATE_CREDIT_COST ? 'text-green-600' : 'text-red-600'}>
                {state.credits >= GATE_CREDIT_COST ? '✓' : '✗'} {GATE_CREDIT_COST.toLocaleString()} CR
              </div>
              <div className={matProgress.met === matProgress.total ? 'text-green-600' : 'text-red-600'}>
                {matProgress.met === matProgress.total ? '✓' : '✗'} Materials ({matProgress.met}/{matProgress.total})
              </div>
            </div>
          </div>

          {/* Material manifest */}
          <div className="border border-orange-950 p-2 space-y-0.5">
            <div className="text-[10px] text-orange-700 uppercase mb-1">Material Manifest</div>
            {Object.entries(GATE_MATERIAL_COST).map(([mat, qty]) => {
              const have = state.materials[mat] || 0;
              const pct = Math.min(100, (have / qty) * 100);
              return (
                <div key={mat} className="flex items-center gap-2 text-[10px]">
                  <span className={`w-28 truncate ${have >= qty ? 'text-green-600' : 'text-orange-600'}`}>{GATE_MATERIAL_LABELS[mat]}</span>
                  <div className="flex-1 h-1.5 bg-black border border-orange-950">
                    <div className={`h-full ${have >= qty ? 'bg-green-600' : 'bg-orange-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-orange-500 w-24 text-right">{have.toLocaleString()}/{qty.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {/* Gate name input */}
          <input
            type="text"
            value={gateName}
            onChange={(e) => setGateName(e.target.value)}
            placeholder={`Gate ${String.fromCharCode(65 + gates.length)}`}
            maxLength={20}
            className="w-full bg-black border border-orange-900 text-orange-300 text-xs px-2 py-1.5 placeholder-orange-800"
          />

          {/* Build button */}
          <button
            onClick={handleBuild}
            disabled={!buildCheck.can}
            className="w-full py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold disabled:opacity-30"
          >
            {buildCheck.can ? '⚡ CONSTRUCT WARP GATE' : `⚠ ${buildCheck.reason}`}
          </button>
        </div>
      )}

      {/* Gate network overview */}
      <div className="border border-orange-900 p-3 space-y-1">
        <div className="text-orange-400 text-[10px] font-bold uppercase">Gate Network ({gates.length})</div>
        {gates.length === 0 ? (
          <div className="text-orange-700 text-[10px] text-center py-2">No gates constructed. Build your first gate to establish the network.</div>
        ) : (
          gates.map(gate => (
            <div key={gate.id} className="flex items-center justify-between border-b border-orange-950/50 py-1 text-[10px]">
              <div>
                <span className="text-orange-300">{gate.name}</span>
                <span className="text-orange-700 ml-2">{gate.systemName}</span>
              </div>
              {gate.systemSeed === state.currentSystem.seed && (
                <span className="text-green-500">CURRENT</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}