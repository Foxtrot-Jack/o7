// SRV Surface Rover — deploy and explore surface locations for materials and POIs
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateSRVLocations, hasSRVHangar } from '@/lib/srv';
import { Rocket, Gem, Radio, Ghost, Sparkles, Flame, Landmark, CheckCircle, MapPin, Crosshair } from 'lucide-react';

const POI_ICONS = {
  material_cache: Gem,
  data_beacon: Radio,
  wreckage: Ghost,
  crystalline_growth: Sparkles,
  geological_vent: Flame,
  ancient_obelisk: Landmark,
};

export default function SRVRover({ onNavigate }) {
  const { state, getSystemData, addMaterial, addCredits, departSurface } = useGameState();
  const [scanning, setScanning] = useState(null);
  const [collected, setCollected] = useState({});
  const [driving, setDriving] = useState(false);

  const systemData = getSystemData();
  const body = systemData?.bodies.find(b => b.id === state.currentSurfaceBody);

  const locations = useMemo(() => {
    if (!body) return [];
    return generateSRVLocations(body.id, body.planetType);
  }, [body?.id]);

  if (!body) {
    return (
      <div className="p-4 text-center text-orange-500">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No surface location active.</p>
        <p className="text-orange-700 text-xs mt-1">Land on a mapped body from the System orrery first.</p>
      </div>
    );
  }

  const hasHangar = hasSRVHangar(state.ship.modules);

  if (!hasHangar) {
    return (
      <div className="p-4 text-center text-orange-500">
        <Rocket className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No Planetary Vehicle Hangar installed.</p>
        <p className="text-orange-700 text-xs mt-1">Install an SRV hangar at an Outfitting bay to deploy a surface rover.</p>
        <button onClick={() => onNavigate && onNavigate('system')} className="mt-3 px-4 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold">RETURN TO ORBIT</button>
      </div>
    );
  }

  const handleScan = (loc) => {
    if (collected[loc.id]) return;
    setScanning(loc.id);
    setDriving(true);
    setTimeout(() => {
      if (loc.materials) {
        for (const mat of loc.materials) {
          addMaterial(mat.id, mat.qty);
        }
      }
      if (loc.credits > 0) {
        addCredits(loc.credits);
      }
      setCollected({ ...collected, [loc.id]: true });
      setScanning(null);
      setDriving(false);
    }, 1200);
  };

  const collectedCount = Object.keys(collected).length;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="border border-orange-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">SRV Deployment — {body.name || body.designation}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-orange-600">TYPE: <span className="text-orange-300">{body.planetTypeName}</span></div>
          <div className="text-orange-600">GRAVITY: <span className="text-orange-300">{body.gravity?.toFixed(2)} G</span></div>
          <div className="text-orange-600">TEMP: <span className="text-orange-300">{Math.round(body.temperature)} K</span></div>
        </div>
        <div className="text-orange-600 text-[10px] mt-2">
          LOCATIONS SCANNED: {collectedCount}/{locations.length}
        </div>
      </div>

      <div className="border border-orange-900 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Crosshair className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-500 text-xs font-bold uppercase">Surface Scanner — Detected Locations</h3>
        </div>
        <div className="space-y-1">
          {locations.map(loc => {
            const isCollected = collected[loc.id];
            const isScanning = scanning === loc.id;
            const Icon = POI_ICONS[loc.poiType?.id] || Gem;
            return (
              <div key={loc.id} className={`border p-2 text-xs ${isCollected ? 'border-green-900 opacity-60' : 'border-orange-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="font-bold text-orange-300">{loc.name}</div>
                      <div className="text-[9px] text-orange-700">
                        {loc.type === 'poi' ? 'POINT OF INTEREST' : 'MINERAL DEPOSIT'}
                        {loc.credits > 0 && ` · ${loc.credits.toLocaleString()} CR`}
                        {loc.materials?.length > 0 && ` · ${loc.materials.length} material types`}
                      </div>
                    </div>
                  </div>
                  {isCollected ? (
                    <span className="text-green-500 text-[10px] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> COLLECTED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleScan(loc)}
                      disabled={isScanning || driving}
                      className={`px-3 py-1 border text-[10px] font-bold ${isScanning ? 'border-orange-900 text-orange-800 animate-pulse' : 'border-cyan-500 text-cyan-300 hover:bg-cyan-950/30'} disabled:opacity-50`}
                    >
                      {isScanning ? 'DRIVING...' : 'DRIVE & SCAN'}
                    </button>
                  )}
                </div>
                {isCollected && loc.materials?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {loc.materials.map((m, i) => (
                      <span key={i} className="text-[8px] text-cyan-500 border border-cyan-900 px-1">
                        +{m.qty}x {m.id.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => { departSurface(); if (onNavigate) onNavigate('system'); }}
        className="w-full py-2.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold"
      >
        ↑ RECALL SRV — DEPART FROM SURFACE
      </button>
    </div>
  );
}