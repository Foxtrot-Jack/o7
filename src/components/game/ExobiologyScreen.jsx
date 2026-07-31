// Exobiology — scan biological samples and build the species Codex
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateBioSignals, calculateExobioPayout, SAMPLES_REQUIRED, BIO_TYPES } from '@/lib/exobiology';
import { Leaf, Dna, FlaskConical, BookOpen, CheckCircle, MapPin } from 'lucide-react';

export default function ExobiologyScreen() {
  const { state, getSystemData, addCredits, recordExobiology } = useGameState();
  const [scanning, setScanning] = useState(null);
  const [samples, setSamples] = useState({});
  const [completed, setCompleted] = useState(new Set());

  const systemData = getSystemData();
  const body = systemData?.bodies.find(b => b.id === state.currentSurfaceBody);

  const bioSignals = useMemo(() => {
    if (!body) return [];
    const existing = (body.surfaceSignals || []).filter(s => s.type === 'biological');
    if (existing.length > 0) {
      return existing.map(s => ({
        id: s.id,
        speciesId: s.id,
        name: s.name,
        baseValue: 10000 + Math.floor(Math.random() * 15000),
        color: '#aaffaa',
      }));
    }
    return generateBioSignals(body.id, body.planetType);
  }, [body?.id]);

  if (!body || state.currentLocation !== 'surface') {
    return (
      <div className="p-4 text-center text-orange-500">
        <Leaf className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No surface body active.</p>
        <p className="text-orange-700 text-xs mt-1">Land on a mapped body with biological signals to begin exobiology scanning.</p>
      </div>
    );
  }

  const handleScan = (signal) => {
    if (completed.has(signal.id)) return;
    setScanning(signal.id);
    setTimeout(() => {
      const current = samples[signal.id] || 0;
      const newCount = current + 1;
      setSamples(prev => ({ ...prev, [signal.id]: newCount }));

      if (newCount >= SAMPLES_REQUIRED) {
        const payout = calculateExobioPayout(signal);
        addCredits(payout);
        recordExobiology(signal.speciesId || signal.id, signal.name, body.name || body.designation, state.currentSystem.name);
        setCompleted(prev => new Set([...prev, signal.id]));
        setScanning(null);
      } else {
        setScanning(null);
      }
    }, 800);
  };

  const codex = state.exobiologyCodex || {};

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Exobiology Scanner — {body.name || body.designation}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Collect {SAMPLES_REQUIRED} samples per species to complete genetic analysis. Completed analyses pay out immediately and are recorded in your Codex.</div>
      </div>

      {/* Bio signals */}
      <div className="space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Detected Biological Signals</h3>
        {bioSignals.length === 0 && <div className="text-orange-700 text-[10px]">No biological signals detected on this body.</div>}
        {bioSignals.map(signal => {
          const sampleCount = samples[signal.id] || 0;
          const isComplete = completed.has(signal.id);
          const isScanning = scanning === signal.id;
          return (
            <div key={signal.id} className={`border p-2 space-y-1 ${isComplete ? 'border-green-800' : 'border-orange-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dna className="w-3.5 h-3.5" style={{ color: signal.color }} />
                  <div>
                    <div className="text-orange-300 text-xs font-bold">{signal.name}</div>
                    <div className="text-[9px] text-orange-700">Base value: {signal.baseValue.toLocaleString()} CR</div>
                  </div>
                </div>
                {isComplete ? (
                  <span className="text-green-500 text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> COMPLETE</span>
                ) : (
                  <button
                    onClick={() => handleScan(signal)}
                    disabled={isScanning}
                    className={`px-3 py-1 border text-[10px] font-bold ${isScanning ? 'border-orange-950 text-orange-800 animate-pulse' : 'border-cyan-500 text-cyan-300 hover:bg-cyan-950/30'} disabled:opacity-50`}
                  >
                    {isScanning ? 'SCANNING...' : 'SCAN SAMPLE'}
                  </button>
                )}
              </div>
              {/* Sample progress */}
              <div className="flex items-center gap-1">
                {[...Array(SAMPLES_REQUIRED)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 border ${i < sampleCount ? 'bg-cyan-600 border-cyan-400' : 'border-orange-950'}`} />
                ))}
                <span className="text-[10px] text-orange-600 ml-1">{sampleCount}/{SAMPLES_REQUIRED}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Codex */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-500 text-xs font-bold uppercase">Species Codex ({Object.keys(codex).length}/{BIO_TYPES.length})</h3>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {Object.entries(codex).map(([speciesId, entry]) => (
            <div key={speciesId} className="text-[10px] border border-orange-950 p-1.5 flex items-center justify-between">
              <div>
                <span className="text-orange-300">{entry.speciesName}</span>
                <span className="text-orange-700 ml-2">×{entry.count}</span>
              </div>
              <div className="text-orange-600 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {entry.firstSystem}
              </div>
            </div>
          ))}
          {Object.keys(codex).length === 0 && <div className="text-orange-700 text-[10px] text-center py-2">No species discovered yet.</div>}
        </div>
      </div>
    </div>
  );
}