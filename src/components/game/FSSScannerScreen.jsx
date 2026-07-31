// FSS Scanner — Full Spectrum Scanner frequency tuning minigame
import React, { useState, useMemo, useEffect } from 'react';
import { useGameState } from '@/lib/gameState';
import { FSS_BANDS, generateFSSSignals, getBodiesInBand, getScanProgress } from '@/lib/fssScanner';
import { Radio, Satellite, ScanLine, CheckCircle, Globe, Star, Moon } from 'lucide-react';

export default function FSSScannerScreen() {
  const { state, getSystemData, fssScanSystem } = useGameState();
  const [tunedBands, setTunedBands] = useState([]);
  const [tuning, setTuning] = useState(null);
  const [revealedBodies, setRevealedBodies] = useState([]);

  const systemData = getSystemData();
  const signals = useMemo(() => generateFSSSignals(systemData), [systemData]);
  const progress = useMemo(() => getScanProgress(signals, tunedBands), [signals, tunedBands]);

  const handleTune = (bandId) => {
    if (tunedBands.includes(bandId) || tuning) return;
    setTuning(bandId);
    setTimeout(() => {
      const found = getBodiesInBand(signals, bandId);
      setRevealedBodies(prev => [...prev, ...found]);
      setTunedBands(prev => [...prev, bandId]);
      setTuning(null);
    }, 1200);
  };

  const handleCompleteScan = () => {
    fssScanSystem();
  };

  const isFullyScanned = tunedBands.length === FSS_BANDS.length;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Full Spectrum Scanner — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Tune into each frequency band to discover stellar bodies, signal sources, and asteroid fields. Complete all bands for a full system scan bonus.</div>
      </div>

      {/* Progress */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-400 font-bold uppercase">Scan Progress</span>
          <span className="text-orange-300">{progress.found}/{progress.total} bodies · {progress.pct}%</span>
        </div>
        <div className="w-full h-2 bg-black border border-orange-950">
          <div className="h-full bg-cyan-600 transition-all" style={{ width: `${progress.pct}%` }} />
        </div>
      </div>

      {/* Frequency bands */}
      <div className="space-y-2">
        {FSS_BANDS.map(band => {
          const isTuned = tunedBands.includes(band.id);
          const isTuning = tuning === band.id;
          const bodiesInBand = revealedBodies.filter(b => b.band === band.id);
          return (
            <div key={band.id} className={`border p-3 space-y-2 ${isTuned ? 'border-cyan-800' : 'border-orange-900'}`}>
              <button
                onClick={() => handleTune(band.id)}
                disabled={isTuned || isTuning}
                className={`w-full flex items-center justify-between text-left ${isTuning ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: band.color, boxShadow: isTuned ? `0 0 6px ${band.color}` : 'none' }} />
                  <div>
                    <div className="text-orange-300 text-xs font-bold">{band.name}</div>
                    <div className="text-[9px] text-orange-700">{band.range}</div>
                  </div>
                </div>
                {isTuned ? <CheckCircle className="w-4 h-4 text-cyan-500" /> : isTuning ? <ScanLine className="w-4 h-4 text-orange-500 animate-pulse" /> : <Satellite className="w-4 h-4 text-orange-600" />}
              </button>
              {/* Revealed bodies */}
              {isTuned && bodiesInBand.length > 0 && (
                <div className="border-t border-orange-950 pt-1 space-y-0.5">
                  {bodiesInBand.map(b => (
                    <div key={b.id} className="text-[10px] text-orange-400 flex items-center gap-1">
                      {b.signalType === 'stellar' ? <Star className="w-2.5 h-2.5" /> : b.signalType === 'planetary' ? <Globe className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                      {b.bodyName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete scan */}
      {isFullyScanned && (
        <div className="border border-green-700 p-3 space-y-2">
          <div className="text-green-400 text-xs font-bold uppercase">✓ Full System Scan Complete</div>
          <div className="text-[10px] text-orange-600">All frequency bands tuned. System data value significantly increased.</div>
          <button
            onClick={handleCompleteScan}
            className="w-full py-2 border border-green-500 text-green-300 hover:bg-green-950/30 text-xs font-bold"
          >
            REGISTER SYSTEM SCAN DATA
          </button>
        </div>
      )}
    </div>
  );
}