// SignalScannerPanel — pop-out modular device for detecting USS signal sources.
// Overlays the current screen; does not navigate away. Investigate a signal to
// trigger an encounter or reveal a point of interest.
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateSignalSources, THREAT_LABELS } from '@/lib/signalSources';
import { generateEncounter } from '@/lib/encounters';
import { soundEngine } from '@/lib/soundEngine';
import { Radio, X, Skull, Ghost, Package, Box, Truck, Sparkles, Swords, Target, Search, CheckCircle } from 'lucide-react';

const SIGNAL_ICONS = {
  radio: Radio,
  ghost: Ghost,
  package: Package,
  skull: Skull,
  box: Box,
  truck: Truck,
  sparkles: Sparkles,
  swords: Swords,
  target: Target,
};

const THREAT_COLORS = {
  0: 'text-green-500 border-green-700',
  1: 'text-cyan-500 border-cyan-700',
  2: 'text-amber-500 border-amber-700',
  3: 'text-red-500 border-red-700',
  4: 'text-red-400 border-red-500 animate-pulse',
};

export default function SignalScannerPanel({ onClose }) {
  const { state, update } = useGameState();
  const [scanning, setScanning] = useState(false);
  const [investigated, setInvestigated] = useState(new Set());

  const system = state.currentSystem;
  const sources = useMemo(
    () => generateSignalSources(system, state.activeMissions || []),
    [system?.seed, state.activeMissions]
  );

  const handleInvestigate = useCallback((source) => {
    if (investigated.has(source.id)) return;
    soundEngine.play('fss_tune');
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setInvestigated(prev => new Set(prev).add(source.id));
      if (source.type.encounter) {
        const encounter = generateEncounter(system, source.type.encounter);
        if (encounter) update({ activeEncounter: encounter });
      } else {
        soundEngine.play('select');
      }
    }, 1000);
  }, [investigated, update]);

  return (
    <div className="absolute top-2 left-2 bottom-2 w-72 max-w-[85vw] border border-cyan-700 bg-black/95 flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-cyan-900 p-2">
        <Radio className="w-4 h-4 text-cyan-500" />
        <span className="text-cyan-300 font-bold uppercase text-xs flex-1">Signal Scanner</span>
        <button onClick={onClose} className="text-cyan-700 hover:text-cyan-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* System info */}
      <div className="border-b border-cyan-950 px-2 py-1 text-[10px] text-cyan-700">
        {system?.name || '---'} · {sources.length} signal{sources.length !== 1 ? 's' : ''} detected
      </div>

      {/* Signal list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sources.length === 0 ? (
          <div className="text-cyan-800 text-[10px] text-center py-4">No signal sources detected in this system.</div>
        ) : (
          sources.map(source => {
            const Icon = SIGNAL_ICONS[source.type.icon] || Radio;
            const done = investigated.has(source.id);
            const threatClass = THREAT_COLORS[source.threat] || THREAT_COLORS[1];
            return (
              <div key={source.id} className={`border ${done ? 'border-green-900/50' : 'border-cyan-950'} bg-black/50 p-1.5`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${done ? 'text-green-600' : 'text-cyan-400'}`} />
                  <span className={`text-[10px] font-bold flex-1 truncate ${done ? 'text-green-600' : 'text-cyan-300'}`}>
                    {source.type.name}
                  </span>
                  <span className={`text-[8px] px-1 border ${threatClass}`}>{THREAT_LABELS[source.threat]}</span>
                </div>
                <div className="text-[9px] text-cyan-700 mt-0.5 leading-tight">{source.type.desc}</div>
                {done ? (
                  <div className="flex items-center gap-1 text-[9px] text-green-600 mt-1">
                    <CheckCircle className="w-2.5 h-2.5" /> INVESTIGATED
                  </div>
                ) : (
                  <button
                    onClick={() => handleInvestigate(source)}
                    disabled={scanning}
                    className="w-full mt-1 py-0.5 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-[9px] font-bold disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {scanning ? <><Search className="w-2.5 h-2.5 animate-pulse" /> SCANNING...</> : <><Search className="w-2.5 h-2.5" /> INVESTIGATE</>}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-950 px-2 py-1 text-[8px] text-cyan-800 text-center">
        Pop-out device · close to return to view
      </div>
    </div>
  );
}