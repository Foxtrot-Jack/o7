// Surface Survey — simulated landing on a planet/moon
// Menu-driven: survey biological, geological, and mineral signals
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { BODY_TYPES } from '@/lib/system';
import { Rocket, Dna, Mountain, Gem, CheckCircle, Radio, MapPin } from 'lucide-react';

const SIGNAL_ICONS = {
  biological: Dna,
  geological: Mountain,
  mineral: Gem,
};

const SIGNAL_COLORS = {
  biological: 'text-green-400 border-green-800',
  geological: 'text-orange-400 border-orange-800',
  mineral: 'text-cyan-400 border-cyan-800',
};

export default function SurfaceSurvey({ onNavigate }) {
  const { state, getSystemData, collectSurfaceDiscovery, departSurface } = useGameState();
  const [scanning, setScanning] = useState(null);
  const systemData = getSystemData();

  if (!systemData || !state.currentSurfaceBody) {
    return (
      <div className="p-4 text-center text-orange-500">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No surface location active.</p>
        <p className="text-orange-700 text-xs mt-1">Land on a mapped body from the System orrery.</p>
      </div>
    );
  }

  const body = systemData.bodies.find(b => b.id === state.currentSurfaceBody);
  if (!body) {
    return <div className="p-4 text-orange-500">Body not found in system data.</div>;
  }

  const signals = body.surfaceSignals || [];
  const discoveries = state.surfaceDiscoveries || {};

  const handleSurvey = (signal) => {
    const key = `${body.id}:${signal.id}`;
    if (discoveries[key]) return;
    setScanning(signal.id);
    setTimeout(() => {
      collectSurfaceDiscovery(body.id, signal);
      setScanning(null);
    }, 800);
  };

  const collectedCount = signals.filter(s => discoveries[`${body.id}:${s.id}`]).length;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border border-orange-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Surface Survey — {body.name || body.designation}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="text-orange-600">TYPE: <span className="text-orange-300">{body.planetTypeName}</span></div>
          <div className="text-orange-600">GRAVITY: <span className="text-orange-300">{body.gravity?.toFixed(2)} G</span></div>
          <div className="text-orange-600">TEMP: <span className="text-orange-300">{Math.round(body.temperature)} K</span></div>
          <div className="text-orange-600">ATMOS: <span className="text-orange-300">{body.atmosphere ? 'Yes' : 'No'}</span></div>
        </div>
        <div className="text-orange-600 text-[10px] mt-2">
          STATUS: LANDED · SIGNALS FOUND: {signals.length} · SURVEYED: {collectedCount}/{signals.length}
        </div>
      </div>

      {/* Surface signals */}
      {signals.length === 0 ? (
        <div className="border border-orange-900 p-4 text-center">
          <Radio className="w-8 h-8 mx-auto mb-2 text-orange-700 opacity-50" />
          <p className="text-orange-600 text-sm">No surface signals detected on this body.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Surface Signals — Available for Survey</h3>
          {signals.map(signal => {
            const key = `${body.id}:${signal.id}`;
            const collected = discoveries[key];
            const isScanning = scanning === signal.id;
            const Icon = SIGNAL_ICONS[signal.type] || Radio;
            return (
              <div key={signal.id} className={`border p-3 text-xs ${collected ? 'border-green-900 opacity-60' : SIGNAL_COLORS[signal.type]}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <div className="font-bold">{signal.name}</div>
                      <div className="text-[9px] uppercase opacity-70">{signal.type} · Value: {signal.value.toLocaleString()} CR</div>
                    </div>
                  </div>
                  {collected ? (
                    <span className="text-green-500 text-[10px] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> SURVEYED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSurvey(signal)}
                      disabled={isScanning}
                      className={`px-3 py-1 border text-[10px] font-bold ${isScanning ? 'border-orange-900 text-orange-800 animate-pulse' : 'border-orange-500 text-orange-300 hover:bg-orange-950/50'}`}
                    >
                      {isScanning ? 'SCANNING...' : 'SURVEY'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deploy SRV */}
      <button
        onClick={() => { if (onNavigate) onNavigate('srv'); }}
        className="w-full py-2.5 border border-cyan-500 text-cyan-300 hover:bg-cyan-950/30 text-xs font-bold"
      >
        🚗 DEPLOY SRV ROVER
      </button>

      {/* Depart button */}
      <button
        onClick={() => { departSurface(); if (onNavigate) onNavigate('system'); }}
        className="w-full py-2.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold"
      >
        ↑ DEPART FROM SURFACE — RETURN TO ORBIT
      </button>
    </div>
  );
}