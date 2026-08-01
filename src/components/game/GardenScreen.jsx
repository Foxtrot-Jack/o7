// Garden Screen — display and manage collected flora
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Leaf, ArrowUp, ArrowDown, Search } from 'lucide-react';

export default function GardenScreen() {
  const { state, isSandbox, collectFloraSpecimen, moveFloraToDisplay, moveFloraToStorage, getSystemData } = useGameState();
  const [msg, setMsg] = useState(null);
  const [selected, setSelected] = useState(null);

  const floraCollection = state.floraCollection || { collected: [], displayIds: [], capacity: 8 };
  const collected = floraCollection.collected || [];
  const displayIds = floraCollection.displayIds || [];
  const capacity = floraCollection.capacity || 8;
  const displayFlora = collected.filter(f => displayIds.includes(f.id));
  const storageFlora = collected.filter(f => !displayIds.includes(f.id));

  const handleSearch = () => {
    const systemData = getSystemData();
    if (!systemData?.bodies) { setMsg('No system data available.'); setTimeout(() => setMsg(null), 3000); return; }
    const bioSignals = [];
    for (const body of systemData.bodies) {
      if (body.surfaceSignals) {
        for (const sig of body.surfaceSignals) {
          if (sig.type === 'biological') bioSignals.push({ body, signal: sig });
        }
      }
    }
    if (bioSignals.length === 0) {
      setMsg('No biological signals found. Map planets to discover flora.');
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const { body, signal } = bioSignals[Math.floor(Math.random() * bioSignals.length)];
    const flora = collectFloraSpecimen(signal, body, state.currentSystem.name);
    if (flora) {
      setMsg(`Found: ${flora.species} from ${body.name || body.designation}!`);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div className="w-full h-full overflow-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-orange-400 text-xs font-bold">GARDEN</div>
        <button onClick={handleSearch} className="flex items-center gap-1 px-3 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] font-bold">
          <Search className="w-3 h-3" /> SEARCH FOR FLORA
        </button>
      </div>

      {msg && <div className="text-green-500 text-[10px] text-center border border-green-900 bg-green-950/20 py-1">{msg}</div>}
      {collected.length === 0 && !msg && (
        <div className="text-center text-orange-700 text-[10px] py-8">
          No flora collected. Scan and map planets with biological signals to find specimens.
        </div>
      )}

      {/* Garden display */}
      <div className="relative w-full h-48 border-2 border-green-800 bg-gradient-to-b from-green-950/30 to-amber-950/40 overflow-hidden">
        <div className="absolute bottom-0 inset-x-0 h-1/2" style={{ background: 'linear-gradient(to top, rgba(40,20,5,0.6), transparent)' }} />
        {displayFlora.map((flora, i) => {
          const [r, g, b] = flora.color;
          const x = 10 + (i * 23) % 80;
          const h = 30 + flora.size * 30;
          return (
            <div key={flora.id} className="absolute bottom-0" style={{ left: `${x}%` }}>
              <div style={{ width: '3px', height: `${h}px`, background: `rgb(${r*0.5},${g*0.5},${b*0.5})`, margin: '0 auto' }} />
              <div style={{ width: `${flora.size * 20}px`, height: `${flora.size * 20}px`, background: `rgb(${r},${g},${b})`, borderRadius: '50% 40% 50% 40%', marginTop: -h, marginLeft: -flora.size * 8 + 1, opacity: 0.85 }} />
            </div>
          );
        })}
        <div className="absolute bottom-1 right-2 text-[9px] text-green-700">{displayFlora.length}/{capacity} on display</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* On display */}
        <div className="flex-1 space-y-1">
          <div className="text-green-500 text-[9px] uppercase border-b border-green-900 pb-1">On Display ({displayFlora.length}/{capacity})</div>
          {displayFlora.length === 0 && <div className="text-orange-700 text-[9px] py-2">Garden is empty</div>}
          {displayFlora.map(flora => (
            <FloraRow key={flora.id} flora={flora} selected={selected === flora.id} onSelect={() => setSelected(selected === flora.id ? null : flora.id)} actionLabel="To Storage" actionIcon={ArrowDown} onAction={() => moveFloraToStorage(flora.id)} actionColor="border-orange-700 text-orange-500" />
          ))}
        </div>

        {/* In storage */}
        <div className="flex-1 space-y-1">
          <div className="text-orange-500 text-[9px] uppercase border-b border-orange-900 pb-1">In Storage ({storageFlora.length})</div>
          {storageFlora.length === 0 && <div className="text-orange-700 text-[9px] py-2">No flora in storage</div>}
          {storageFlora.map(flora => (
            <FloraRow key={flora.id} flora={flora} selected={selected === flora.id} onSelect={() => setSelected(selected === flora.id ? null : flora.id)} actionLabel="To Display" actionIcon={ArrowUp} onAction={() => moveFloraToDisplay(flora.id)} actionColor="border-green-600 text-green-400" disabled={displayFlora.length >= capacity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FloraRow({ flora, selected, onSelect, actionLabel, actionIcon: Icon, onAction, actionColor, disabled }) {
  const [r, g, b] = flora.color;
  return (
    <div className={`flex items-center gap-2 border p-1.5 ${selected ? 'border-green-600 bg-green-950/20' : 'border-orange-950'}`}>
      <button onClick={onSelect} className="flex items-center gap-2 flex-1 text-left">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: `rgb(${r},${g},${b})` }} />
        <div>
          <div className="text-orange-300 text-[10px]">{flora.species}</div>
          <div className="text-orange-700 text-[8px]">{flora.originBody} · {flora.pattern}</div>
        </div>
      </button>
      <button onClick={onAction} disabled={disabled} className={`px-2 py-1 border text-[9px] flex items-center gap-1 ${actionColor} disabled:opacity-40`}>
        <Icon className="w-3 h-3" />
      </button>
    </div>
  );
}