// Aquarium Screen — display and manage collected aquatic life
import React, { useState, useRef, useEffect } from 'react';
import { useGameState } from '@/lib/gameState';
import { Fish, ArrowUp, ArrowDown, Search } from 'lucide-react';

export default function AquariumScreen() {
  const { state, isSandbox, collectAquaticLife, moveAquaticToTank, moveAquaticToStorage, getSystemData } = useGameState();
  const [msg, setMsg] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);

  const aquaticLife = state.aquaticLife || { collected: [], tankIds: [], tankCapacity: 8 };
  const collected = aquaticLife.collected || [];
  const tankIds = aquaticLife.tankIds || [];
  const tankCapacity = aquaticLife.tankCapacity || 8;
  const tankFish = collected.filter(f => tankIds.includes(f.id));
  const storageFish = collected.filter(f => !tankIds.includes(f.id));

  // Animate fish positions
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const systemData = getSystemData();
    if (!systemData?.bodies) { setMsg('No system data available.'); setTimeout(() => setMsg(null), 3000); return; }
    const waterWorlds = systemData.bodies.filter(b => b.type === 'planet' && (b.planetType === 'water_world' || b.planetType === 'earthlike'));
    if (waterWorlds.length === 0) {
      setMsg('No water worlds or earth-like planets in this system.');
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const body = waterWorlds[Math.floor(Math.random() * waterWorlds.length)];
    const fish = collectAquaticLife(body, state.currentSystem.name);
    if (fish) {
      setMsg(`Found: ${fish.species} from ${body.name || body.designation}!`);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const fishPos = (id, i) => {
    const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const speed = 0.5 + (seed % 100) / 200;
    const x = ((tick * speed * 0.3 + seed) % 100);
    const y = 20 + Math.sin(tick * 0.05 + seed) * 15 + (i * 7 % 40);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="w-full h-full overflow-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-orange-400 text-xs font-bold">AQUARIUM</div>
        <button onClick={handleSearch} className="flex items-center gap-1 px-3 py-1.5 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[10px] font-bold">
          <Search className="w-3 h-3" /> SEARCH SYSTEM FOR LIFE
        </button>
      </div>

      {msg && <div className="text-green-500 text-[10px] text-center border border-green-900 bg-green-950/20 py-1">{msg}</div>}
      {collected.length === 0 && !msg && (
        <div className="text-center text-orange-700 text-[10px] py-8">
          No aquatic life collected. Visit water worlds or earth-like planets and search for specimens.
        </div>
      )}

      {/* Tank display */}
      <div className="relative w-full h-48 border-2 border-cyan-800 bg-gradient-to-b from-cyan-950/40 to-blue-950/60 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(0,100,200,0.03) 5px, rgba(0,100,200,0.03) 6px)' }} />
        {tankFish.map((fish, i) => {
          const pos = fishPos(fish.id, i);
          const [r, g, b] = fish.color;
          return (
            <div key={fish.id} className="absolute transition-all duration-100" style={pos}>
              <div className="flex items-center" style={{ transform: `scaleX(${Math.cos(tick * 0.05 + fish.id.length) > 0 ? 1 : -1})` }}>
                <div style={{ width: `${fish.size * 12}px`, height: `${fish.size * 8}px`, background: `rgb(${r},${g},${b})`, borderRadius: '50% 20% 20% 50%', opacity: 0.9 }} />
                <div style={{ width: `${fish.size * 6}px`, height: `${fish.size * 6}px`, background: `rgb(${r},${g},${b})`, opacity: 0.7, clipPath: 'polygon(0 50%, 100% 0, 100% 100%)', marginLeft: -2 }} />
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-1 right-2 text-[9px] text-cyan-700">{tankFish.length}/{tankCapacity} in tank</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* In tank */}
        <div className="flex-1 space-y-1">
          <div className="text-cyan-500 text-[9px] uppercase border-b border-cyan-900 pb-1">In Tank ({tankFish.length}/{tankCapacity})</div>
          {tankFish.length === 0 && <div className="text-orange-700 text-[9px] py-2">Tank is empty</div>}
          {tankFish.map(fish => (
            <FishRow key={fish.id} fish={fish} selected={selected === fish.id} onSelect={() => setSelected(selected === fish.id ? null : fish.id)} actionLabel="To Storage" actionIcon={ArrowDown} onAction={() => moveAquaticToStorage(fish.id)} actionColor="border-orange-700 text-orange-500" />
          ))}
        </div>

        {/* In storage */}
        <div className="flex-1 space-y-1">
          <div className="text-orange-500 text-[9px] uppercase border-b border-orange-900 pb-1">In Storage ({storageFish.length})</div>
          {storageFish.length === 0 && <div className="text-orange-700 text-[9px] py-2">No fish in storage</div>}
          {storageFish.map(fish => (
            <FishRow key={fish.id} fish={fish} selected={selected === fish.id} onSelect={() => setSelected(selected === fish.id ? null : fish.id)} actionLabel="To Tank" actionIcon={ArrowUp} onAction={() => moveAquaticToTank(fish.id)} actionColor="border-cyan-600 text-cyan-400" disabled={tankFish.length >= tankCapacity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FishRow({ fish, selected, onSelect, actionLabel, actionIcon: Icon, onAction, actionColor, disabled }) {
  const [r, g, b] = fish.color;
  return (
    <div className={`flex items-center gap-2 border p-1.5 ${selected ? 'border-green-600 bg-green-950/20' : 'border-orange-950'}`}>
      <button onClick={onSelect} className="flex items-center gap-2 flex-1 text-left">
        <div className="w-4 h-3 rounded-full flex-shrink-0" style={{ background: `rgb(${r},${g},${b})` }} />
        <div>
          <div className="text-orange-300 text-[10px]">{fish.species}</div>
          <div className="text-orange-700 text-[8px]">{fish.originBody} · {fish.pattern}</div>
        </div>
      </button>
      <button onClick={onAction} disabled={disabled} className={`px-2 py-1 border text-[9px] flex items-center gap-1 ${actionColor} disabled:opacity-40`}>
        <Icon className="w-3 h-3" />
      </button>
    </div>
  );
}