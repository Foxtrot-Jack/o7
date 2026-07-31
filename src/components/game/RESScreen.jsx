// Resource Extraction Sites — high-yield mining with pirate risk
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateRESSites, rollRESYield, RES_TYPES } from '@/lib/res';
import { generateEnemy } from '@/lib/combat';
import { Pickaxe, Gem, AlertTriangle, Skull } from 'lucide-react';
import CombatScreen from './CombatScreen';

export default function RESScreen() {
  const { state, getSystemData, addMaterial } = useGameState();
  const [combat, setCombat] = useState(null);
  const [miningLog, setMiningLog] = useState([]);
  const [activeSite, setActiveSite] = useState(null);

  const systemData = getSystemData();
  const sites = useMemo(() => generateRESSites(state.currentSystem?.seed, systemData), [state.currentSystem?.seed]);

  const handleMine = (site) => {
    setActiveSite(site);
    const yield_ = rollRESYield(site.yieldMult);
    addMaterial(yield_.materialId, yield_.qty);
    setMiningLog(prev => [`» Mined ${yield_.qty}x ${yield_.materialId.replace(/_/g, ' ')} (+${Math.round(site.yieldMult * 100)}% yield)`, ...prev].slice(0, 8));

    // Pirate risk
    if (Math.random() < site.pirateChance) {
      const threat = site.type.id === 'hazardous' ? 3 : site.type.id === 'pristine' ? 2 : 1;
      const enemy = generateEnemy(threat);
      setMiningLog(prev => [`⚠ PIRATE DETECTED — ${enemy.name} approaching!`, ...prev].slice(0, 8));
      setCombat({ enemy });
    }
  };

  if (combat) {
    return <CombatScreen enemy={combat.enemy} context="res" onEnd={() => setCombat(null)} />;
  }

  if (sites.length === 0) {
    return (
      <div className="p-4 text-center text-orange-500">
        <Pickaxe className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No resource extraction sites in this system.</p>
        <p className="text-orange-700 text-xs mt-1">RES sites appear near planetary rings and asteroid belts.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-3">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Pickaxe className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Resource Extraction Sites — {state.currentSystem?.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">High-yield mining hotspots. Higher yields come with greater pirate risk.</div>
      </div>

      {/* Mining log */}
      {miningLog.length > 0 && (
        <div className="border border-orange-900 p-2 space-y-0.5">
          <div className="text-[10px] text-orange-700 uppercase">Mining Log</div>
          {miningLog.map((entry, i) => (
            <div key={i} className={`text-[10px] ${entry.includes('PIRATE') ? 'text-red-400 font-bold' : 'text-orange-500'}`}>{entry}</div>
          ))}
        </div>
      )}

      {/* RES sites */}
      <div className="space-y-2">
        {sites.map(site => (
          <div key={site.id} className={`border p-3 space-y-2 ${site.type.id === 'hazardous' ? 'border-red-900' : site.type.id === 'pristine' ? 'border-cyan-900' : 'border-orange-900'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-bold text-xs ${site.type.id === 'hazardous' ? 'text-red-300' : site.type.id === 'pristine' ? 'text-cyan-300' : 'text-orange-300'}`}>
                  {site.type.label} — {site.bodyName}
                </div>
                <div className="text-[10px] text-orange-700">{site.type.desc}</div>
              </div>
              <div className="text-right text-[10px] space-y-0.5">
                <div className="text-green-500">YIELD: +{Math.round((site.yieldMult - 1) * 100)}%</div>
                <div className={site.pirateChance > 0.2 ? 'text-red-500' : 'text-yellow-500'}>RISK: {Math.round(site.pirateChance * 100)}%</div>
              </div>
            </div>
            <button
              onClick={() => handleMine(site)}
              className="w-full py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
            >
              <Gem className="w-3 h-3" /> PROSPECT & MINE
            </button>
          </div>
        ))}
      </div>

      {activeSite && (
        <div className="border border-orange-900 p-2 text-[10px] text-orange-600 text-center">
          Last site: {activeSite.bodyName} · Click again to continue mining
        </div>
      )}
    </div>
  );
}