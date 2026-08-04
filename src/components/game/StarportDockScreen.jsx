// Starport Dock Camera — idle screen watching NPC ships land and depart at
// the current station's landing pads, with a dedicated traffic comms HUD.
// Founder pilots (contributor aliases) are highlighted so credits people can
// spot their NPC at the dock.
import React, { useState, useEffect, useRef } from 'react';
import { Plane, Radio, Star, Activity } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { createPads, spawnShip, tickStarport } from '@/lib/starportTraffic';
import { soundEngine } from '@/lib/soundEngine';

const STATE_LABEL = {
  approaching: 'APPROACH',
  docking: 'DOCKING',
  docked: 'DOCKED',
  departing: 'DEPARTING',
};
const STATE_COLOR = {
  approaching: 'text-cyan-400',
  docking: 'text-yellow-400',
  docked: 'text-green-500',
  departing: 'text-orange-400',
};
const MSG_COLOR = {
  station: 'text-green-500',
  request: 'text-cyan-400',
  traffic: 'text-orange-300',
};
const MSG_PREFIX = {
  station: '[STATION]',
  request: '[REQUEST]',
  traffic: '[TRAFFIC]',
};

export default function StarportDockScreen() {
  const { state, getSystemData } = useGameState();
  const systemData = getSystemData();
  const station = systemData?.stations?.find(s => s.id === state.currentStationId);

  const [pads, setPads] = useState(() => createPads(8));
  const [queue, setQueue] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sightings, setSightings] = useState(0);

  const padsRef = useRef(pads); padsRef.current = pads;
  const queueRef = useRef(queue); queueRef.current = queue;
  const stationName = station?.name || 'Station';

  // Seed initial traffic + station-open line
  useEffect(() => {
    if (!station) return;
    setQueue([spawnShip(), spawnShip(), spawnShip()]);
    setMessages([{ type: 'station', line: `${station.name} Traffic Control online. Monitoring 8 pads.`, founder: false }]);
  }, [station?.id]);

  // Simulation tick
  useEffect(() => {
    if (!station) return;
    let last = Date.now();
    const tick = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(1000, now - last);
      last = now;
      const { pads: np, queue: nq, events } = tickStarport(padsRef.current, queueRef.current, dt);
      setPads(np);
      setQueue(nq);
      if (events.length) {
        setMessages(prev => {
          const next = [...prev, ...events.map(e => ({ type: 'traffic', line: e.line, founder: e.founder }))];
          return next.length > 9 ? next.slice(next.length - 9) : next;
        });
        soundEngine.play('click');
      }
    }, 250);
    return () => clearInterval(tick);
  }, [station?.id]);

  // New arrivals
  useEffect(() => {
    if (!station) return;
    const sp = setInterval(() => {
      const active = queueRef.current.length + padsRef.current.filter(p => p.ship).length;
      if (active >= 12) return;
      if (Math.random() < 0.55) {
        const ship = spawnShip();
        setQueue(q => [...q, ship]);
        setMessages(prev => {
          const next = [...prev, { type: 'request', line: `${ship.shipName} (${ship.pilot}) requesting docking clearance.`, founder: ship.founder }];
          return next.length > 9 ? next.slice(next.length - 9) : next;
        });
        if (ship.founder) setSightings(s => s + 1);
      }
    }, 4500);
    return () => clearInterval(sp);
  }, [station?.id]);

  if (!station) {
    return (
      <div className="w-full h-full flex items-center justify-center text-orange-500 p-4 text-center">
        <p>No station data available.</p>
      </div>
    );
  }

  const activeCount = pads.filter(p => p.ship).length;

  return (
    <div className="w-full h-full flex flex-col p-3 gap-3 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-900/50 pb-2">
        <div>
          <h2 className="text-orange-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Plane className="w-4 h-4" /> Starport Dock Camera
          </h2>
          <p className="text-orange-700 text-[10px]">{station.name} · {activeCount}/8 pads occupied · {queue.length} holding</p>
        </div>
        <div className="flex items-center gap-1.5 border border-cyan-900/60 bg-cyan-950/20 px-2 py-1">
          <Star className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-400 text-[10px] uppercase">Founder Sightings</span>
          <span className="text-cyan-300 text-xs font-bold">{sightings}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Landing pads */}
        <div className="lg:col-span-2 space-y-2">
          <div className="text-orange-700 text-[9px] uppercase flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" /> Landing Pads
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pads.map(pad => {
              const s = pad.ship;
              const progress = s && s.duration ? Math.min(1, s.timer / s.duration) : 0;
              return (
                <div
                  key={pad.id}
                  className={`relative border p-2 h-28 flex flex-col justify-between transition-colors ${
                    s
                      ? s.founder
                        ? 'border-cyan-700 bg-cyan-950/10'
                        : 'border-orange-800 bg-orange-950/10'
                      : 'border-orange-950/60 bg-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 text-[10px] font-bold">PAD {pad.id}</span>
                    {s && (
                      <span className={`text-[9px] ${STATE_COLOR[s.state]}`}>{STATE_LABEL[s.state]}</span>
                    )}
                  </div>
                  {/* Pad circle with ship marker */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-14 h-14 rounded-full border border-orange-900/70 flex items-center justify-center">
                      {s ? (
                        <Plane
                          className={`w-6 h-6 ${s.founder ? 'text-cyan-400' : 'text-orange-400'} ${s.state === 'departing' ? 'rotate-180' : ''}`}
                          style={{ opacity: s.state === 'docked' ? 1 : 0.55 + progress * 0.4 }}
                        />
                      ) : (
                        <span className="text-orange-900 text-[8px]">EMPTY</span>
                      )}
                    </div>
                  </div>
                  {s ? (
                    <div className="truncate">
                      <div className={`text-[10px] truncate ${s.founder ? 'text-cyan-300' : 'text-orange-300'}`}>
                        {s.founder && <Star className="w-2 h-2 inline mr-0.5 text-cyan-400" />}{s.shipName}
                      </div>
                      <div className={`text-[9px] truncate ${s.founder ? 'text-cyan-600' : 'text-orange-700'}`}>
                        {s.pilot}
                      </div>
                      {/* progress bar */}
                      <div className="h-0.5 bg-orange-950/60 mt-0.5">
                        <div
                          className={`h-full ${s.state === 'docked' ? 'bg-green-600' : 'bg-orange-600'}`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-orange-900 text-center">— available —</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Holding pattern */}
          <div className="mt-2">
            <div className="text-orange-700 text-[9px] uppercase mb-1">Holding Pattern · {queue.length}</div>
            <div className="border border-orange-950/60 bg-black/40 p-2 min-h-[3rem]">
              {queue.length === 0 ? (
                <span className="text-orange-900 text-[10px]">Pattern clear.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {queue.map(s => (
                    <span
                      key={s.id}
                      className={`text-[10px] px-1.5 py-0.5 border ${s.founder ? 'border-cyan-700 text-cyan-300 bg-cyan-950/20' : 'border-orange-900 text-orange-500 bg-black/40'}`}
                    >
                      {s.founder && <Star className="w-2 h-2 inline mr-0.5 text-cyan-400" />}
                      {s.shipName} · {s.pilot}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comms HUD */}
        <div className="border border-orange-900/50 bg-black/80 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 text-orange-700 text-[9px] uppercase border-b border-orange-950/50 px-2 py-1.5">
            <Radio className="w-3 h-3" /> Traffic Comms
            <span className="ml-auto text-orange-900">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-[10px]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.founder ? 'text-cyan-300' : (MSG_COLOR[m.type] || 'text-orange-400')}
                style={{ opacity: 0.35 + ((i + 1) / messages.length) * 0.65 }}
              >
                <span className="text-orange-800 text-[8px]">{MSG_PREFIX[m.type] || ''}</span>{m.founder && <span className="text-cyan-700 text-[8px]"> ★</span>} {m.line}
              </div>
            ))}
            {messages.length === 0 && <div className="text-orange-900 text-[10px]">— awaiting traffic —</div>}
          </div>
        </div>
      </div>
    </div>
  );
}