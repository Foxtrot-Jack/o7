// Dock Camera — starport traffic observer, restyled as a Missile Command vector scene.
// Pads line the bottom; NPC ships cruise an orbital arc above, break off to approach,
// dock, and depart. Click any ship to identify the pilot and what they are up to.
// Radio chatter ticker streams live traffic events and ambient comms.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radar, Radio, X, Rocket, Anchor, Award, MapPin } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { spawnShip, createPads, tickStarport } from '@/lib/starportTraffic';
import { generateChatter } from '@/lib/radioChatter';
import { LANDMARK_SYSTEMS } from '@/lib/galaxy';
import { soundEngine } from '@/lib/soundEngine';

const PAD_COUNT = 8;
const SHIP_HIT_RADIUS = 18;

const ACTIVITIES = [
  'Trading at the market', 'Refueling tanks', 'Repairing hull damage',
  'Outfitting new modules', 'Transferring crew', 'Awaiting cargo load',
  'Taking shore leave', 'Meeting a contact', 'Selling exploration data',
  'Engineering upgrades', 'Restocking limpets', 'Picking up a passenger',
];
const DESTINATIONS = LANDMARK_SYSTEMS.map(l => l.name).length
  ? LANDMARK_SYSTEMS.map(l => l.name)
  : ['the frontier', 'a core system', 'a colony'];

function smooth(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }
function pickFrom(arr, seed) { return arr[Math.abs(seed) % arr.length]; }
function hashId(id) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return h; }

const STATE_LABEL = {
  holding: 'HOLDING — awaiting clearance',
  approaching: 'APPROACHING',
  docking: 'LANDING SEQUENCE',
  docked: 'DOCKED',
  departing: 'DEPARTING',
};

export default function DockCameraScreen() {
  const { state, getSystemData } = useGameState();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const sizeRef = useRef({ w: 800, h: 500 });

  const simRef = useRef({ pads: createPads(PAD_COUNT), queue: [] });
  const metaRef = useRef({}); // id -> { lastState, orbitAngle, startX, startY }
  const cursorRef = useRef({ x: -100, y: -100 });
  const spawnTimerRef = useRef(0);

  const [selectedId, setSelectedId] = useState(null);
  const [chatter, setChatter] = useState([]);
  const [hud, setHud] = useState({ transit: 0, docked: 0, waiting: 0 });
  const selectedRef = useRef(null);
  const systemData = getSystemData();
  const stationName = systemData?.stations?.[0]?.name || systemData?.name || 'STATION';

  // Ambient chatter on a slow timer
  useEffect(() => {
    if (!systemData) return;
    const seed = generateChatter(systemData, state);
    setChatter(c => [...c.slice(-5), { id: Date.now(), line: seed.message, type: seed.type, founder: false }]);
    const iv = setInterval(() => {
      const msg = generateChatter(systemData, state);
      setChatter(c => [...c.slice(-5), { id: Date.now(), line: msg.message, type: msg.type, founder: false }]);
    }, 14000);
    return () => clearInterval(iv);
  }, [systemData?.seed]);

  const pushEvents = useCallback((events) => {
    if (!events.length) return;
    setChatter(prev => {
      const next = [...prev];
      for (const ev of events) {
        next.push({ id: Date.now() + Math.random(), line: ev.line, type: 'station_traffic', founder: ev.founder });
      }
      return next.slice(-8);
    });
  }, []);

  const orbitPoint = (angle) => {
    const { w, h } = sizeRef.current;
    const groundY = Math.floor(h * 0.74);
    // orbit centered on the station body, arcing over the deck
    const cx = w / 2, cy = groundY - 10, rx = w * 0.42, ry = h * 0.34;
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
  };

  const computePos = (ship, pad) => {
    const meta = metaRef.current[ship.id] || (metaRef.current[ship.id] = { lastState: ship.state, orbitAngle: Math.random() * Math.PI * 2, orbitDir: Math.random() < 0.5 ? 1 : -1, startX: 0, startY: 0, dir: 1 });
    const { w, h } = sizeRef.current;
    const groundY = Math.floor(h * 0.74);
    const padY = groundY - 7;
    const approachAlt = groundY - 44;
    const padW = w / PAD_COUNT;
    const padX = pad ? (pad.id - 0.5) * padW : w / 2;

    // detect state transition — record start anchor + travel direction
    if (meta.lastState !== ship.state) {
      if (ship.state === 'approaching') {
        // enter from a random screen edge — simulates different origin systems
        const r = Math.random();
        if (r < 0.3) { meta.startX = -28; meta.startY = approachAlt - Math.random() * (approachAlt * 0.7); }
        else if (r < 0.6) { meta.startX = w + 28; meta.startY = approachAlt - Math.random() * (approachAlt * 0.7); }
        else if (r < 0.8) { meta.startX = Math.random() * w; meta.startY = -28; }
        else { meta.startX = Math.random() * w * 0.5; meta.startY = -28; } // top-left bias
        meta.dir = meta.startX < padX ? 1 : -1; // level heading toward pad
      } else if (ship.state === 'docking') {
        meta.startX = padX; meta.startY = approachAlt;
      } else if (ship.state === 'departing') {
        // exit toward a random edge — simulates different destinations
        const r = Math.random();
        if (r < 0.3) { meta.exitX = -28; meta.exitY = approachAlt - Math.random() * (approachAlt * 0.7); }
        else if (r < 0.6) { meta.exitX = w + 28; meta.exitY = approachAlt - Math.random() * (approachAlt * 0.7); }
        else if (r < 0.8) { meta.exitX = Math.random() * w; meta.exitY = -28; }
        else { meta.exitX = w - Math.random() * w * 0.5; meta.exitY = -28; } // top-right bias
        meta.dir = meta.exitX < padX ? -1 : 1; // level heading toward exit
        meta.startX = padX; meta.startY = padY;
      }
      meta.lastState = ship.state;
    }

    const p = ship.duration > 0 ? Math.min(1, ship.timer / ship.duration) : 1;
    const hdng = meta.dir > 0 ? 0 : Math.PI; // level heading (left/right) for vertical maneuvers
    let x, y, heading;
    switch (ship.state) {
      case 'holding': {
        meta.orbitAngle += 0.0028 * meta.orbitDir;
        const op = orbitPoint(meta.orbitAngle);
        x = op.x; y = op.y;
        heading = Math.atan2(Math.cos(meta.orbitAngle), -Math.sin(meta.orbitAngle)) + Math.PI / 2;
        break;
      }
      case 'approaching': {
        // inbound from the chosen edge to above the pad
        const sp = smooth(p);
        x = lerp(meta.startX, padX, sp);
        y = lerp(meta.startY, approachAlt, sp);
        heading = Math.atan2(approachAlt - meta.startY, padX - meta.startX);
        break;
      }
      case 'docking': {
        // level off and descend vertically onto the pad
        x = padX;
        y = lerp(meta.startY, padY, smooth(p));
        heading = hdng;
        break;
      }
      case 'docked': {
        x = padX; y = padY;
        heading = hdng;
        break;
      }
      case 'departing': {
        if (p < 0.4) {
          // vertical lift off the pad, level
          x = padX;
          y = lerp(padY, approachAlt, smooth(p / 0.4));
          heading = hdng;
        } else {
          // outbound toward the chosen edge
          const sp = smooth((p - 0.4) / 0.6);
          x = lerp(padX, meta.exitX, sp);
          y = lerp(approachAlt, meta.exitY, sp);
          heading = Math.atan2(meta.exitY - approachAlt, meta.exitX - padX);
        }
        break;
      }
      default:
        x = padX; y = padY; heading = hdng;
    }
    return { x, y, heading };
  };

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent.clientWidth, hh = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr; canvas.height = hh * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = hh + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h: hh };
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Input — move cursor + click to select
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const toLocal = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };
    const onMove = (e) => { const p = toLocal(e); cursorRef.current = p; };
    const onDown = (e) => {
      const p = toLocal(e);
      cursorRef.current = p;
      // find nearest ship
      const ships = collectShips();
      let best = null, bd = SHIP_HIT_RADIUS;
      for (const s of ships) {
        const d = Math.hypot(s.pos.x - p.x, s.pos.y - p.y);
        if (d < bd) { bd = d; best = s; }
      }
      soundEngine.play(best ? 'select' : 'click');
      setSelectedId(best ? best.ship.id : null);
    };
    const collectShips = () => {
      const { pads, queue } = simRef.current;
      const out = [];
      for (const pad of pads) if (pad.ship) out.push({ ship: pad.ship, pad, pos: computePos(pad.ship, pad) });
      for (const ship of queue) out.push({ ship, pad: null, pos: computePos(ship, null) });
      return out;
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchstart', onDown);
    };
  }, []);

  // Main loop — simulation + render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let hudTimer = 0;

    const step = (ts) => {
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000 || 0);
      lastTsRef.current = ts;

      // spawn ships into the holding queue
      spawnTimerRef.current -= dt;
      const occupied = simRef.current.pads.filter(p => p.ship).length + simRef.current.queue.length;
      if (spawnTimerRef.current <= 0 && occupied < PAD_COUNT + 7) {
        simRef.current.queue.push(spawnShip());
        spawnTimerRef.current = 1.6 + Math.random() * 2.4;
      }

      // advance sim (ms)
      const res = tickStarport(simRef.current.pads, simRef.current.queue, dt * 1000);
      simRef.current.pads = res.pads;
      simRef.current.queue = res.queue;
      pushEvents(res.events);
      // clean stale meta
      const liveIds = new Set([...res.pads.flatMap(p => p.ship ? [p.ship.id] : []), ...res.queue.map(s => s.id)]);
      for (const id of Object.keys(metaRef.current)) if (!liveIds.has(id)) delete metaRef.current[id];

      // HUD throttle
      hudTimer += dt;
      if (hudTimer > 0.2) {
        hudTimer = 0;
        const transit = res.pads.filter(p => p.ship && (p.ship.state === 'approaching' || p.ship.state === 'docking' || p.ship.state === 'departing')).length;
        const docked = res.pads.filter(p => p.ship && p.ship.state === 'docked').length;
        setHud({ transit, docked, waiting: res.queue.length });
      }

      // ---- render ----
      const { w, h } = sizeRef.current;
      const groundY = Math.floor(h * 0.74);
      ctx.clearRect(0, 0, w, h);
      // sky
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      // starfield
      ctx.fillStyle = 'rgba(255,136,0,0.5)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97.3) % w, sy = (i * 53.7) % (groundY - 40);
        ctx.fillRect(sx, sy, 1, 1);
      }
      // orbit arc (dashed) — centered on the station, arcs over the deck
      const ox = w / 2, oy = groundY - 10, orx = w * 0.42, ory = h * 0.34;
      ctx.strokeStyle = 'rgba(255,136,0,0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(ox, oy, orx, ory, 0, Math.PI, Math.PI * 2); // upper arc only
      ctx.stroke();
      ctx.setLineDash([]);

      // station landing deck — bottom quarter of the screen
      const deckH = h - groundY;
      ctx.fillStyle = 'rgba(255,136,0,0.06)';
      ctx.fillRect(0, groundY, w, deckH);
      // deck top edge
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
      // structural ribs
      ctx.strokeStyle = 'rgba(255,136,0,0.28)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const yy = groundY + (deckH / 5) * i;
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke();
      }
      // hangar bays along the deck face
      for (let i = 0; i < 10; i++) {
        const bx = (i + 0.5) * (w / 10);
        ctx.strokeStyle = 'rgba(255,136,0,0.4)';
        ctx.strokeRect(bx - 12, groundY + 8, 24, deckH - 16);
      }

      // control tower (left side of deck)
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.04, groundY); ctx.lineTo(w * 0.04, groundY - 28);
      ctx.lineTo(w * 0.075, groundY - 34); ctx.lineTo(w * 0.11, groundY - 28);
      ctx.lineTo(w * 0.11, groundY); ctx.stroke();
      ctx.fillStyle = 'rgba(255,136,0,0.12)';
      ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.075, groundY - 34); ctx.lineTo(w * 0.075, groundY - 48); ctx.stroke();
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(w * 0.075 - 2, groundY - 50, 4, 4);

      // station name placard on the deck
      ctx.fillStyle = 'rgba(255,136,0,0.65)';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(stationName.toUpperCase(), w * 0.14, groundY - 8);

      // pads — landing plates on the deck surface
      const padW = w / PAD_COUNT;
      for (let i = 0; i < PAD_COUNT; i++) {
        const px = i * padW + padW / 2;
        const ship = res.pads[i]?.ship;
        const occupied = !!ship;
        const docked = ship && ship.state === 'docked';
        const padCol = docked ? '#44ff88' : occupied ? '#ff8800' : 'rgba(255,136,0,0.55)';
        // pad plate
        ctx.fillStyle = occupied ? 'rgba(255,136,0,0.14)' : 'rgba(255,136,0,0.05)';
        ctx.fillRect(px - padW / 2 + 6, groundY - 3, padW - 12, 16);
        ctx.strokeStyle = padCol;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - padW / 2 + 6, groundY - 3, padW - 12, 16);
        // landing zone ring + crosshair
        ctx.strokeStyle = padCol;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, groundY + 5, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 4, groundY + 5); ctx.lineTo(px + 4, groundY + 5);
        ctx.moveTo(px, groundY + 1); ctx.lineTo(px, groundY + 9);
        ctx.stroke();
        // glow when in use
        if (occupied) {
          ctx.fillStyle = docked ? 'rgba(68,255,136,0.12)' : 'rgba(255,136,0,0.12)';
          ctx.beginPath(); ctx.arc(px, groundY + 5, 15, 0, Math.PI * 2); ctx.fill();
        }
        // placard number
        ctx.fillStyle = padCol;
        ctx.font = 'bold 9px "Courier New", monospace';
        ctx.fillText('P' + (i + 1), px - 7, groundY - 7);
      }

      // ships
      const drawShip = (ship, pad, pos) => {
        const sel = selectedId === ship.id;
        const color = ship.founder ? '#44ff88' : '#ffaa44';
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.heading);
        // trail
        ctx.strokeStyle = ship.founder ? 'rgba(68,255,136,0.35)' : 'rgba(255,170,68,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-2, 0); ctx.stroke();
        // hull (triangle)
        ctx.fillStyle = color;
        // elongated hull pointing in travel direction (left/right)
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(-2, -5); ctx.lineTo(-7, -3); ctx.lineTo(-5, 0);
        ctx.lineTo(-7, 3); ctx.lineTo(-2, 5); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // engine glow
        ctx.fillStyle = ship.founder ? 'rgba(68,255,136,0.8)' : 'rgba(255,170,68,0.8)';
        ctx.fillRect(-7, -1.5, 2, 3);
        ctx.restore();
        // selection ring
        if (sel) {
          ctx.strokeStyle = '#44ff88';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2); ctx.stroke();
        }
        // founder marker
        if (ship.founder) {
          ctx.fillStyle = '#44ff88';
          ctx.beginPath(); ctx.arc(pos.x + 6, pos.y - 6, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      };
      for (const pad of res.pads) if (pad.ship) drawShip(pad.ship, pad, computePos(pad.ship, pad));
      for (const ship of res.queue) {
        const pos = computePos(ship, null);
        if (pos.y > groundY - 4) continue; // passing behind the station
        drawShip(ship, null, pos);
      }

      // crosshair
      const cur = cursorRef.current;
      if (cur.x >= 0) {
        ctx.strokeStyle = 'rgba(255,136,0,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cur.x - 8, cur.y); ctx.lineTo(cur.x - 3, cur.y);
        ctx.moveTo(cur.x + 3, cur.y); ctx.lineTo(cur.x + 8, cur.y);
        ctx.moveTo(cur.x, cur.y - 8); ctx.lineTo(cur.x, cur.y - 3);
        ctx.moveTo(cur.x, cur.y + 3); ctx.lineTo(cur.x, cur.y + 8);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [selectedId, pushEvents]);

  // Resolve selected ship snapshot for the side panel
  useEffect(() => {
    if (!selectedId) { selectedRef.current = null; return; }
    const all = [...simRef.current.pads.flatMap(p => p.ship ? [p.ship] : []), ...simRef.current.queue];
    selectedRef.current = all.find(s => s.id === selectedId) || null;
  }, [selectedId, hud]);

  const sel = selectedRef.current;

  const purposeFor = (ship) => {
    const h = hashId(ship.id);
    if (ship.state === 'holding') return 'Holding pattern — awaiting pad clearance.';
    if (ship.state === 'approaching') return `Cleared for approach to pad ${ship.pad}.`;
    if (ship.state === 'docking') return `Landing sequence engaged on pad ${ship.pad}.`;
    if (ship.state === 'departing') return `Departing — outbound for ${pickFrom(DESTINATIONS, h)}.`;
    return pickFrom(ACTIVITIES, h);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-orange-900/60 text-xs">
        <div className="flex items-center gap-2 text-orange-400 uppercase">
          <Radar className="w-4 h-4" /> Dock Camera
        </div>
        <div className="text-orange-500 uppercase tracking-widest">{stationName}</div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 flex items-center gap-1"><Rocket className="w-3 h-3" /> {hud.transit} TRANSIT</span>
          <span className="text-green-500 flex items-center gap-1"><Anchor className="w-3 h-3" /> {hud.docked} DOCKED</span>
          <span className="text-orange-700 flex items-center gap-1"><MapPin className="w-3 h-3" /> {hud.waiting} HOLD</span>
        </div>
      </div>

      {/* Scene + side panel */}
      <div className="relative flex-1 flex overflow-hidden">
        <div className="relative flex-1 overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
        </div>

        {/* Selection panel */}
        {sel && (
          <div className="w-56 border-l border-orange-900/60 bg-black/90 p-3 space-y-2 text-xs overflow-y-auto">
            <div className="flex items-center justify-between border-b border-orange-900/50 pb-1">
              <span className="text-orange-500 uppercase text-[10px]">Contact</span>
              <button onClick={() => setSelectedId(null)} className="text-orange-700 hover:text-orange-400"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <div className="text-orange-300 font-bold">{sel.shipName}</div>
              <div className="text-orange-700 text-[10px]">CLASS {sel.shipClass} VESSEL</div>
            </div>
            <div className="border-t border-orange-950/50 pt-1">
              <div className="text-orange-600 text-[10px] uppercase">Pilot</div>
              <div className="flex items-center gap-1.5">
                <span className="text-orange-300">{sel.pilot}</span>
                {sel.founder && <span className="flex items-center gap-0.5 text-green-500 text-[9px] border border-green-800 px-1"><Award className="w-2.5 h-2.5" />FOUNDER</span>}
              </div>
            </div>
            <div className="border-t border-orange-950/50 pt-1">
              <div className="text-orange-600 text-[10px] uppercase">Status</div>
              <div className="text-cyan-400">{STATE_LABEL[sel.state] || sel.state}</div>
              {sel.pad && <div className="text-orange-700 text-[10px]">PAD {sel.pad}</div>}
            </div>
            <div className="border-t border-orange-950/50 pt-1">
              <div className="text-orange-600 text-[10px] uppercase">Activity</div>
              <div className="text-orange-400 leading-relaxed">{purposeFor(sel)}</div>
            </div>
            <div className="border-t border-orange-950/50 pt-1 text-[10px] text-orange-700">
              Click another ship to identify it.
            </div>
          </div>
        )}
      </div>

      {/* Live traffic comms — below the landing deck */}
      <div className="border-t border-orange-900/60 bg-black/90 px-3 py-1.5 text-[10px] space-y-0.5 max-h-28 overflow-hidden">
        <div className="flex items-center gap-1 text-orange-700 text-[8px] uppercase border-b border-orange-950/50 pb-0.5 mb-0.5">
          <Radio className="w-2.5 h-2.5" /> Live Traffic Comms
        </div>
        {chatter.slice(-5).map((c) => (
          <div key={c.id} className={c.founder ? 'text-green-400 truncate' : 'text-orange-500 truncate'}>
            {c.founder && <span className="text-green-600 text-[8px]">[FOUNDER] </span>}
            {c.line}
          </div>
        ))}
      </div>
    </div>
  );
}