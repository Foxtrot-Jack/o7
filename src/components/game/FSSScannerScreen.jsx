// FSS Discovery Scanner — per-body frequency tuning (Elite Dangerous style)
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateFSSSignals, getScanProgress, SPECTRUM_RANGES } from '@/lib/fssScanner';
import { Radio, Satellite, ScanLine, CheckCircle, Globe, Star, Layers, Award, Zap, Square } from 'lucide-react';

const SIGNAL_ICONS = {
  star: Star,
  planet: Globe,
  moon: Globe,
  belt: Layers,
};

export default function FSSScannerScreen() {
  const { state, getSystemData, discoverBodyFSS } = useGameState();
  const [tuning, setTuning] = useState(null);
  const [tuneProgress, setTuneProgress] = useState(0);
  const [autoTuning, setAutoTuning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const intervalRef = useRef(null);
  const autoStopRef = useRef(false);

  const systemData = getSystemData();
  const signals = useMemo(() => generateFSSSignals(systemData), [systemData]);

  const discoveredIds = useMemo(() => {
    const set = new Set();
    const d = state.fssDiscoveredBodies || {};
    for (const id in d) { if (d[id]) set.add(id); }
    return set;
  }, [state.fssDiscoveredBodies]);

  const progress = useMemo(() => getScanProgress(signals, discoveredIds), [signals, discoveredIds]);
  const isComplete = progress.found === progress.total && progress.total > 0;
  const alreadyComplete = state.fssScannedSystems?.[state.currentSystem?.seed];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      autoStopRef.current = true;
    };
  }, []);

  const tuneSignal = (signal, onComplete) => {
    const duration = signal.isStar ? 600 : 1200;
    const start = Date.now();
    setTuning(signal);
    setTuneProgress(0);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / duration);
      setTuneProgress(pct);
      if (pct >= 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        const result = discoverBodyFSS(signal.bodyId);
        setTuning(null);
        setTuneProgress(0);
        onComplete?.(result);
      }
    }, 40);
  };

  const handleTune = (signal) => {
    if (discoveredIds.has(signal.bodyId) || tuning || autoTuning) return;
    tuneSignal(signal, (result) => {
      if (result?.systemComplete) {
        setShowCompletion(true);
        setTimeout(() => setShowCompletion(false), 7000);
      }
    });
  };

  const handleAutoTune = () => {
    if (tuning || autoTuning) return;
    const remaining = signals.filter(s => !discoveredIds.has(s.bodyId));
    if (remaining.length === 0) return;
    setAutoTuning(true);
    autoStopRef.current = false;
    tuneNext(remaining, 0);
  };

  const handleStopAuto = () => {
    autoStopRef.current = true;
    setAutoTuning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTuning(null);
    setTuneProgress(0);
  };

  const tuneNext = (remaining, index) => {
    if (autoStopRef.current || index >= remaining.length) {
      setAutoTuning(false);
      return;
    }
    tuneSignal(remaining[index], (result) => {
      if (autoStopRef.current) { setAutoTuning(false); return; }
      if (result?.systemComplete) {
        setShowCompletion(true);
        setAutoTuning(false);
        setTimeout(() => setShowCompletion(false), 7000);
        return;
      }
      setTimeout(() => tuneNext(remaining, index + 1), 150);
    });
  };

  if (!systemData) {
    return <div className="p-4 text-orange-500 text-xs">LOADING SYSTEM DATA...</div>;
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">FSS Discovery Scanner</h2>
          <span className="text-orange-600 text-[10px] ml-auto">{state.currentSystem?.name}</span>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">
          Tune into individual signal sources to discover stellar bodies. Each signal must be resolved independently.
        </div>
      </div>

      {/* Progress counter */}
      <div className="border border-cyan-900 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
            <Satellite className="w-3 h-3" /> Bodies Discovered
          </span>
          <span className="text-cyan-300 font-bold text-sm">{progress.found}/{progress.total}</span>
        </div>
        <div className="w-full h-2.5 bg-black border border-cyan-950">
          <div className="h-full bg-cyan-600 transition-all duration-300" style={{ width: `${progress.pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-orange-600">
          <span>{progress.pct}% complete</span>
          {isComplete ? (
            <span className="text-green-500 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> SYSTEM SCAN COMPLETE
            </span>
          ) : autoTuning ? (
            <button onClick={handleStopAuto} className="text-red-500 hover:text-red-400 flex items-center gap-1 font-bold">
              <Square className="w-3 h-3" /> STOP AUTO-TUNE
            </button>
          ) : tuning ? null : (
            <button onClick={handleAutoTune} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3" /> AUTO-TUNE ALL ({progress.total - progress.found} remaining)
            </button>
          )}
        </div>
      </div>

      {/* Completion notification */}
      {(showCompletion || (alreadyComplete && isComplete)) && (
        <div className="border border-green-600 bg-green-950/20 p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-green-500" />
            <span className="text-green-400 font-bold uppercase text-xs">Full System Scan Complete</span>
          </div>
          <div className="text-[10px] text-green-600">
            All {progress.total} stellar bodies in {state.currentSystem?.name} have been discovered and catalogued.
            {showCompletion && ' A discovery bonus has been credited to your account.'}
          </div>
        </div>
      )}

      {/* Frequency spectrum */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-400 text-[10px] font-bold uppercase">Frequency Spectrum</div>

        {/* Range labels */}
        <div className="relative h-3 flex">
          {SPECTRUM_RANGES.map(r => (
            <div
              key={r.label}
              className="absolute text-[7px] text-orange-800"
              style={{ left: `${r.min}%`, width: `${r.max - r.min}%` }}
            >
              <span className="block text-center truncate">{r.label}</span>
            </div>
          ))}
        </div>

        {/* Spectrum bar with signal markers */}
        <div className="relative h-20 border border-orange-950 bg-black overflow-hidden">
          {/* Waveform background */}
          <div className="absolute inset-0 flex items-end opacity-10">
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 mx-px bg-orange-600"
                style={{ height: `${20 + Math.abs(Math.sin(i * 0.4) * 50)}%` }}
              />
            ))}
          </div>

          {/* Signal markers */}
          {signals.map(signal => {
            const found = discoveredIds.has(signal.bodyId);
            const isTuning = tuning?.bodyId === signal.bodyId;
            const Icon = SIGNAL_ICONS[signal.bodyType] || Globe;
            return (
              <button
                key={signal.id}
                onClick={() => handleTune(signal)}
                disabled={found || tuning || autoTuning}
                className="absolute bottom-0 flex flex-col items-center group"
                style={{ left: `${signal.frequency}%`, transform: 'translateX(-50%)' }}
              >
                {found && (
                  <span className="text-[7px] text-orange-400 mb-0.5 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                    {signal.bodyName}
                  </span>
                )}
                <div
                  className={`transition-all ${
                    isTuning
                      ? 'w-1 h-12 bg-cyan-400'
                      : found
                        ? 'w-0.5 h-8 bg-orange-500'
                        : 'w-0.5 h-3 bg-orange-700 animate-pulse group-hover:h-5 group-hover:bg-orange-500'
                  }`}
                />
                <div
                  className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                    isTuning
                      ? 'bg-cyan-400 animate-ping'
                      : found
                        ? 'bg-orange-400'
                        : 'bg-orange-800 group-hover:bg-orange-500 animate-pulse'
                  }`}
                />
                {found && <Icon className="w-2 h-2 text-orange-500" />}
              </button>
            );
          })}

          {/* Tuning cursor + progress */}
          {tuning && (
            <>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/50 transition-all"
                style={{ left: `${tuning.frequency}%` }}
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-cyan-400 transition-all" style={{ width: `${tuneProgress * 100}%` }} />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-cyan-400 text-[9px] font-bold animate-pulse flex items-center gap-1">
                <ScanLine className="w-3 h-3" /> TUNING... {Math.round(tuneProgress * 100)}%
              </div>
            </>
          )}

          {/* Empty state */}
          {signals.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-orange-800 text-[10px]">
              No signal sources detected.
            </div>
          )}
        </div>

        <div className="text-[9px] text-orange-700 text-center">
          {tuning
            ? `Resolving signal at ${tuning.frequency.toFixed(1)} Hz...`
            : autoTuning
              ? 'Auto-tuning in progress...'
              : 'Tap a signal peak to tune and resolve the body.'}
        </div>
      </div>

      {/* Discovered bodies list */}
      <div className="border border-orange-900 p-3 space-y-1">
        <div className="text-orange-400 text-[10px] font-bold uppercase border-b border-orange-950 pb-1 mb-1">
          Discovered Bodies ({progress.found})
        </div>
        {signals.filter(s => discoveredIds.has(s.bodyId)).length === 0 ? (
          <div className="text-orange-800 text-[10px] text-center py-2">
            No bodies discovered yet. Tune signals above to begin.
          </div>
        ) : (
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {signals.filter(s => discoveredIds.has(s.bodyId)).map(signal => {
              const Icon = SIGNAL_ICONS[signal.bodyType] || Globe;
              return (
                <div key={signal.id} className="flex items-center gap-2 text-[10px] py-0.5 border-b border-orange-950/30">
                  <Icon className={`w-3 h-3 flex-shrink-0 ${signal.isStar ? 'text-yellow-500' : signal.isBelt ? 'text-orange-600' : 'text-orange-400'}`} />
                  <span className="text-orange-300 flex-1 truncate">{signal.bodyName}</span>
                  <span className="text-orange-700 text-[9px] uppercase">
                    {signal.isStar ? `Class ${signal.starClass}` : signal.isBelt ? 'Belt' : signal.planetTypeName || signal.bodyType}
                  </span>
                  <span className="text-orange-500 text-[9px] flex-shrink-0">{signal.scanValue.toLocaleString()} CR</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}