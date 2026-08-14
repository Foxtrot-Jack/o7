// Contacts — ships and stations in the current system with fly-to / dock actions.
import React, { useMemo, useState } from 'react';
import { Users, Swords, Anchor, Pickaxe, Recycle, MapPin } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { spawnShip } from '@/lib/starportTraffic';
import { generateCommander } from '@/lib/commanderGenerator';

const RANKS = ['Harmless', 'Novice', 'Competent', 'Expert', 'Master', 'Dangerous'];

export default function ContactsScreen({ onNavigate }) {
  const { state, getSystemData, startCombat } = useGameState();
  const sysData = getSystemData();
  const [confirmId, setConfirmId] = useState(null);
  const confirmOff = state.settings?.disableCombatConfirm;

  const ships = useMemo(() => {
    const names = new Set();
    const list = [];
    for (let i = 0; i < 6; i++) {
      const s = spawnShip(new Set(), names);
      names.add(s.pilot);
      list.push({ ...s, wanted: Math.random() < 0.25, rank: RANKS[Math.floor(Math.random() * RANKS.length)], docked: Math.random() < 0.3 });
    }
    return list;
  }, [sysData?.stations?.[0]?.id]);

  const stations = sysData?.stations || [];
  const bodies = (sysData?.bodies || []).filter(b => b.type === 'planet' || b.type === 'moon');
  const docked = state.currentLocation === 'station';

  const flyTo = (ship) => {
    if (confirmId !== ship.id && !confirmOff) { setConfirmId(ship.id); return; }
    setConfirmId(null);
    // Pull the player ship to the combat location and start combat immediately
    startCombat({ name: ship.shipName, pilot: ship.pilot, hull: 100 + ship.shipClass * 50, damage: 10 + ship.shipClass * 5 }, 'contact');
    onNavigate('system');
  };

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Users className="w-4 h-4" /> Contacts — {state.currentSystem?.name}
      </div>

      {/* Stations */}
      <div className="text-orange-500 text-[10px] uppercase">Stations</div>
      {stations.map(st => (
        <div key={st.id} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
          <Anchor className="w-3.5 h-3.5 text-orange-600" />
          <div className="flex-1">
            <div className="text-orange-300">{st.name}</div>
            <div className="text-orange-800 text-[10px]">FACTION {st.faction || sysData?.faction || '---'}</div>
          </div>
          {docked && state.currentStationId === st.id && <span className="text-green-500 text-[10px]">DOCKED HERE</span>}
        </div>
      ))}

      {/* Ships */}
      <div className="text-orange-500 text-[10px] uppercase">Ships</div>
      {ships.map(s => (
        <div key={s.id} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
          <Swords className="w-3.5 h-3.5 text-orange-600" />
          <div className="flex-1">
            <div className="text-orange-300">{s.pilot} <span className="text-orange-800">— {s.shipName}</span></div>
            <div className="text-orange-800 text-[10px]">RANK {s.rank} · {s.docked ? 'DOCKED' : 'IN SPACE'}{s.wanted ? ' · WANTED' : ''}</div>
          </div>
          {s.docked ? (
            <span className="text-gray-600 text-[10px]">Cannot attack docked</span>
          ) : (
            <button onClick={() => flyTo(s)} className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px]">
              {confirmId === s.id ? 'CONFIRM?' : 'FLY TO'}
            </button>
          )}
        </div>
      ))}

      {/* Bodies with mining/salvage indicators */}
      <div className="text-orange-500 text-[10px] uppercase">Planetary Bodies</div>
      {bodies.map(b => (
        <div key={b.id} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <div className="flex-1 text-orange-300">{b.name || b.designation}</div>
          {b.ring && <span className="flex items-center gap-0.5 text-cyan-600 text-[10px]"><Pickaxe className="w-3 h-3" /> RING</span>}
          {b.landable && <span className="flex items-center gap-0.5 text-cyan-600 text-[10px]"><Recycle className="w-3 h-3" /> SURFACE</span>}
          {b.landable && <button onClick={() => onNavigate('system')} className="px-2 py-1 border border-orange-800 text-orange-500 hover:bg-orange-950/30 text-[10px]">FLY TO</button>}
        </div>
      ))}
    </div>
  );
}