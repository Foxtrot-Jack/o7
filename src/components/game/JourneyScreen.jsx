// Auto Journey — select a distant destination and let the shipboard AI
// companion jump system-to-system automatically: charging FSD, jumping,
// scooping or docking to refuel when able, and halting if a stop has no
// fuel source for the next leg. The commander watches each hop as a
// point-to-point hyperspace transit with a progress bar.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import { generateStarsInRange, SOL_SYSTEM, COLONIA_SYSTEM, FAR_REACH_SYSTEM } from '@/lib/galaxy';
import {
  planJourney, summarizeRoute, refuelMethod, hopFuelCost,
  getShipJumpRange, getShipFuelCapacity, hasInfiniteFuel, hasFuelScoop, isScoopable,
} from '@/lib/journeySystem';
import EntertainmentHub from '@/components/game/EntertainmentHub';
import { soundEngine } from '@/lib/soundEngine';
import { Navigation, Route, Search, Star, MapPin, AlertTriangle, Bot, CheckCircle } from 'lucide-react';

const MS_PER_LY = 220;
const MIN_HOP_MS = 1200;
const MAX_HOP_MS = 5000;
const FUEL_PER_LY = 0.5;
const STATION_FUEL_PRICE = 50;

function drawStarNode(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.stroke();
}

export default function JourneyScreen() {
  const { state, setCurrentSystem, refuel, addCredits, update } = useGameState();
  const [phase, setPhase] = useState('plan'); // plan | travel | arrived | halted
  const [dest, setDest] = useState(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [useNeutron, setUseNeutron] = useState(true);
  const [plan, setPlan] = useState(null);
  const [summary, setSummary] = useState(null);
  const [startErr, setStartErr] = useState('');
  const [log, setLog] = useState([]);
  const [hopIndex, setHopIndex] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('');
  const [showActivities, setShowActivities] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const hopStartRef = useRef(0);
  const hopDurRef = useRef(0);
  const hopIndexRef = useRef(0);
  const routeRef = useRef(null);
  const originNameRef = useRef('');
  const fuelRef = useRef(0);
  const creditsRef = useRef(0);
  const capRef = useRef(0);
  const infiniteRef = useRef(false);
  const sandboxRef = useRef(false);
  const hasScoopRef = useRef(false);
  const runningRef = useRef(false);

  const jumpRange = getShipJumpRange(state);

  const addLog = useCallback((msg, type = 'info') => {
    setLog(prev => [...prev.slice(-50), { id: Date.now() + Math.random(), msg, type }]);
  }, []);

  // ---- planning: search by name ----
  const handleSearch = () => {
    if (!search.trim()) return;
    setSearching(true); setSearchErr(''); setPlan(null); setSummary(null); setDest(null);
    const center = state.currentSystem;
    const ring = (r) => {
      setTimeout(() => {
        const stars = generateStarsInRange(center.x, center.y, center.z, r);
        const found = stars.find(s => s.name.toLowerCase() === search.trim().toLowerCase());
        if (found) { setDest(found); setSearching(false); }
        else if (r < 2000) ring(r < 200 ? 200 : r < 400 ? 400 : r < 800 ? 800 : r < 1200 ? 1200 : 2000);
        else { setSearchErr(`System "${search}" not found within 2000 LY.`); setSearching(false); }
      }, 40);
    };
    ring(100);
  };

  const plot = useCallback(() => {
    if (!dest) { setPlan(null); setSummary(null); return; }
    const res = planJourney(state.currentSystem, dest, jumpRange, useNeutron);
    setPlan(res);
    setSummary(res.route?.length ? summarizeRoute(res.route, state) : null);
  }, [dest, state, jumpRange, useNeutron]);

  useEffect(() => { plot(); }, [plot]);

  // ---- begin journey ----
  const begin = () => {
    const route = plan?.route;
    if (!route?.length) return;
    const firstCost = hopFuelCost(route[0].jumpDist, state);
    let fuel = state.ship?.fuel ?? 0;
    const cap = getShipFuelCapacity(state);
    // preflight refuel if we can't make the first jump
    if (fuel < firstCost && !hasInfiniteFuel(state)) {
      const method = refuelMethod(state.currentSystem, hasFuelScoop(state));
      const need = cap - fuel;
      if (method === 'scoop') {
        refuel(need); fuel = cap; addLog('Pre-flight: scooped fuel — tank full.', 'scoop');
      } else if (method === 'station') {
        const c = state.saveMode === 'sandbox' ? 0 : Math.ceil(need * STATION_FUEL_PRICE);
        if (state.saveMode === 'sandbox' || state.credits >= c) {
          refuel(need); if (state.saveMode !== 'sandbox') addCredits(-c); fuel = cap;
          addLog(`Pre-flight: refueled at station${state.saveMode === 'sandbox' ? '' : ' (' + c + ' CR)'}.`, 'station');
        } else { setStartErr('Insufficient fuel for first jump and cannot afford a refuel here.'); return; }
      } else { setStartErr('Insufficient fuel for first jump and no fuel source at current system. Refuel before departing.'); return; }
    }
    setStartErr('');
    routeRef.current = route;
    originNameRef.current = state.currentSystem?.name || 'ORIGIN';
    fuelRef.current = fuel;
    creditsRef.current = state.credits;
    capRef.current = cap;
    infiniteRef.current = hasInfiniteFuel(state);
    sandboxRef.current = state.saveMode === 'sandbox';
    hasScoopRef.current = hasFuelScoop(state);
    hopIndexRef.current = 0;
    runningRef.current = true;
    setHopIndex(0);
    setLog([]);
    soundEngine.play('select');
    addLog(`Journey engaged — ${route.length} jumps to ${route[route.length - 1].star.name}. Stand by.`, 'info');
    setPhase('travel');
  };

  // ---- start a hop animation ----
  const startHop = useCallback((i) => {
    const route = routeRef.current;
    const hop = route[i];
    hopIndexRef.current = i;
    hopStartRef.current = performance.now();
    hopDurRef.current = Math.min(MAX_HOP_MS, Math.max(MIN_HOP_MS, hop.jumpDist * MS_PER_LY));
    setHopIndex(i);
    setPhaseLabel(`JUMP ${i + 1}/${route.length} → ${hop.star.name.toUpperCase()}`);
    addLog(`Charging FSD — jump ${i + 1}/${route.length} to ${hop.star.name} (${hop.jumpDist.toFixed(1)} LY).`, 'charge');
  }, [addLog]);

  // ---- on arrival at a hop's star: apply jump, decide refuel, advance or halt ----
  const handleArrival = useCallback((i) => {
    const route = routeRef.current;
    const hop = route[i];
    const star = hop.star;
    const cost = infiniteRef.current ? 0 : Math.ceil(hop.jumpDist * FUEL_PER_LY);
    if (!infiniteRef.current) fuelRef.current = Math.max(0, fuelRef.current - cost);
    setCurrentSystem(star);
    addLog(`Arrived ${star.name} — ${hop.jumpDist.toFixed(1)} LY${hop.fromNeutron ? ' [neutron boost]' : ''}. Fuel ${fuelRef.current.toFixed(1)}/${capRef.current}T.`, 'jump');
    if (i >= route.length - 1) {
      runningRef.current = false;
      addLog(`Destination reached: ${star.name}. Journey complete.`, 'success');
      const totalDist = route.reduce((s, h) => s + h.jumpDist, 0);
      update(prev => ({ commanderLog: [...(prev.commanderLog || []), { id: Date.now() + Math.random(), ts: Date.now(), text: `Completed journey to ${star.name} — ${route.length} jumps, ${totalDist.toFixed(0)} LY.`, type: 'journey' }].slice(-200) }));
      setPhaseLabel('JOURNEY COMPLETE');
      setPhase('arrived');
      return;
    }
    const nextCost = infiniteRef.current ? 0 : Math.ceil(route[i + 1].jumpDist * FUEL_PER_LY);
    const method = refuelMethod(star, hasScoopRef.current);
    const need = Math.max(0, capRef.current - fuelRef.current);
    // Enough fuel for the next leg — opportunistic free scoop top-up, then go.
    if (fuelRef.current >= nextCost || infiniteRef.current) {
      if (method === 'scoop' && fuelRef.current < capRef.current) {
        refuel(need); fuelRef.current = capRef.current;
        addLog(`Scooping fuel at ${star.name} — tank full.`, 'scoop');
      }
      startHop(i + 1);
      return;
    }
    // Need fuel — refuel here if we can, else halt.
    if (!method) {
      runningRef.current = false;
      addLog(`JOURNEY HALTED at ${star.name}. Insufficient fuel for next jump to ${route[i + 1].star.name} (need ${nextCost}T, have ${fuelRef.current.toFixed(1)}T) — no fuel source in this system.`, 'halt');
      setPhaseLabel('JOURNEY HALTED — NO FUEL SOURCE');
      setPhase('halted');
      return;
    }
    if (method === 'scoop') {
      refuel(need); fuelRef.current = capRef.current;
      addLog(`Fuel critical — scooping at ${star.name}. Tank full.`, 'scoop');
      startHop(i + 1);
    } else { // station
      const c = sandboxRef.current ? 0 : Math.ceil(need * STATION_FUEL_PRICE);
      if (sandboxRef.current || creditsRef.current >= c) {
        refuel(need);
        if (!sandboxRef.current) { addCredits(-c); creditsRef.current -= c; }
        fuelRef.current = capRef.current;
        addLog(`Refueled at ${star.name} station${sandboxRef.current ? ' (free)' : ' (' + c + ' CR)'}.`, 'station');
        startHop(i + 1);
      } else {
        runningRef.current = false;
        addLog(`JOURNEY HALTED at ${star.name}. Cannot afford station refuel (${c} CR) for next jump.`, 'halt');
        setPhaseLabel('JOURNEY HALTED — INSUFFICIENT CREDITS');
        setPhase('halted');
      }
    }
  }, [setCurrentSystem, refuel, addCredits, update, addLog, startHop]);

  // ---- abort ----
  const abort = () => {
    runningRef.current = false;
    soundEngine.play('back');
    addLog('Journey aborted by Commander. Returning to manual control.', 'halt');
    setPhaseLabel('JOURNEY ABORTED');
    setPhase('plan');
  };

  // ---- travel render loop ----
  useEffect(() => {
    if (phase !== 'travel') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const streaks = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() * 1.5 + 0.3, sp: Math.random() * 0.5 + 0.15,
    }));

    const resize = () => {
      const p = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const w = p.clientWidth, h = p.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (ts) => {
      if (!runningRef.current) return;
      const route = routeRef.current;
      const i = hopIndexRef.current;
      const hop = route[i];
      const elapsed = ts - hopStartRef.current;
      const dur = hopDurRef.current;
      const prog = Math.min(1, elapsed / dur);
      const w = canvas.clientWidth, h = canvas.clientHeight;

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      // hyperspace streaks
      for (const st of streaks) {
        const sx = (st.x * w + st.sp * prog * w * 1.8) % w;
        const sy = st.y * h * 0.7;
        ctx.strokeStyle = `rgba(255,170,68,${0.25 + st.s * 0.18})`;
        ctx.lineWidth = st.s;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 8 - prog * 16, sy); ctx.stroke();
      }
      // route line
      const leftX = w * 0.12, rightX = w * 0.88, midY = h * 0.42;
      ctx.strokeStyle = 'rgba(255,136,0,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.moveTo(leftX, midY); ctx.lineTo(rightX, midY); ctx.stroke(); ctx.setLineDash([]);
      drawStarNode(ctx, leftX, midY, 5, '#ffaa44');
      drawStarNode(ctx, rightX, midY, 6, '#44ff88');
      // ship
      const sxp = leftX + (rightX - leftX) * prog;
      ctx.save(); ctx.translate(sxp, midY);
      ctx.fillStyle = '#ff8800';
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -4); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,136,0,0.55)';
      ctx.beginPath(); ctx.arc(-8, 0, 3 + prog * 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // labels
      ctx.font = 'bold 10px "Courier New", monospace'; ctx.textAlign = 'center';
      const prevName = i === 0 ? originNameRef.current : route[i - 1].star.name;
      ctx.fillStyle = 'rgba(255,170,68,0.85)';
      ctx.fillText(prevName.toUpperCase(), leftX, midY - 16);
      ctx.fillStyle = 'rgba(68,255,136,0.85)';
      ctx.fillText(hop.star.name.toUpperCase(), rightX, midY - 16);
      ctx.fillStyle = 'rgba(255,136,0,0.6)'; ctx.font = '9px "Courier New", monospace';
      ctx.fillText(`${hop.jumpDist.toFixed(1)} LY`, w / 2, midY - 16);
      // hop progress bar
      const barY = h * 0.72, barW = w * 0.76, barH = 12;
      ctx.strokeStyle = '#ff8800'; ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.12, barY, barW, barH);
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(w * 0.12, barY, barW * prog, barH);
      // overall + fuel readout
      const overall = (i + prog) / route.length;
      ctx.font = '9px "Courier New", monospace';
      ctx.fillStyle = 'rgba(255,170,68,0.7)'; ctx.textAlign = 'left';
      ctx.fillText(`OVERALL ${Math.round(overall * 100)}%`, w * 0.12, barY + 26);
      ctx.fillStyle = 'rgba(255,170,68,0.7)'; ctx.textAlign = 'right';
      ctx.fillText(`FUEL ${fuelRef.current.toFixed(1)}/${capRef.current}T`, w * 0.88, barY + 26);
      ctx.textAlign = 'left';

      if (prog >= 1) {
        handleArrival(i);
        if (!runningRef.current) return;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [phase, handleArrival]);

  // ---- render ----
  const fuelOnboard = state.ship?.fuel ?? 0;
  const fuelCap = state.ship?.fuelCapacity ?? fuelOnboard;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* header */}
      <div className="border border-orange-700 p-3 flex items-center gap-2 flex-shrink-0">
        <Navigation className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Auto Journey</h2>
        <span className="ml-auto text-orange-700 text-[10px] uppercase">Ship AI Companion</span>
      </div>

      {phase === 'plan' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* status */}
          <div className="border border-orange-900 p-2 text-[10px] text-orange-600 space-y-0.5">
            <div>CURRENT: <span className="text-orange-300">{state.currentSystem?.name}</span></div>
            <div className="flex gap-4">
              <span>JUMP RANGE: <span className="text-orange-300">{jumpRange.toFixed(1)} LY</span></span>
              <span>FUEL: <span className="text-orange-300">{fuelOnboard.toFixed(1)}/{fuelCap}T</span></span>
              <span>SCOOP: <span className={hasFuelScoop(state) ? 'text-green-500' : 'text-red-500'}>{hasFuelScoop(state) ? 'INSTALLED' : 'NONE'}</span></span>
            </div>
          </div>

          {/* search */}
          <div className="border border-orange-900 p-2 space-y-2">
            <div className="flex gap-1">
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Destination system name..."
                className="flex-1 bg-black border border-orange-900 text-orange-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500"
              />
              <button onClick={handleSearch} disabled={searching} className="px-3 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-50 flex items-center gap-1">
                {searching ? <Navigation className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} FIND
              </button>
            </div>
            {searchErr && <div className="flex items-center gap-1 text-red-400 text-[10px]"><AlertTriangle className="w-3 h-3" /> {searchErr}</div>}
            <label className="flex items-center gap-1.5 text-[10px] text-orange-600 cursor-pointer">
              <input type="checkbox" checked={useNeutron} onChange={e => setUseNeutron(e.target.checked)} />
              Use neutron star highway (4x jump boost from neutron stars)
            </label>
          </div>

          {/* known locations */}
          <div className="border border-orange-900 p-2 space-y-1.5">
            <div className="text-orange-500 text-[10px] font-bold uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Known Locations</div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => { setDest(COLONIA_SYSTEM); setSearch(''); setSearchErr(''); }}
                className={`flex items-center gap-1 px-2 py-1 border text-[10px] ${dest?.seed === COLONIA_SYSTEM.seed ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300' : 'border-cyan-900 text-cyan-600 hover:border-cyan-700'}`}>
                <Star className="w-2.5 h-2.5" /> Cradle's End
              </button>
              <button onClick={() => { setDest(FAR_REACH_SYSTEM); setSearch(''); setSearchErr(''); }}
                className={`flex items-center gap-1 px-2 py-1 border text-[10px] ${dest?.seed === FAR_REACH_SYSTEM.seed ? 'border-purple-500 bg-purple-950/20 text-purple-300' : 'border-purple-900 text-purple-600 hover:border-purple-700'}`}>
                <Star className="w-2.5 h-2.5" /> Vagrant's Horizon
              </button>
              {state.saveMode === 'sandbox' && (
                <button onClick={() => { setDest(SOL_SYSTEM); setSearch(''); setSearchErr(''); }}
                  className={`flex items-center gap-1 px-2 py-1 border text-[10px] ${dest?.seed === SOL_SYSTEM.seed ? 'border-yellow-500 bg-yellow-950/20 text-yellow-300' : 'border-yellow-900 text-yellow-600 hover:border-yellow-700'}`}>
                  <Star className="w-2.5 h-2.5" /> Sol
                </button>
              )}
              {state.bookmarkedSystems?.map(bm => (
                <button key={bm.seed} onClick={() => { setDest(bm); setSearch(''); setSearchErr(''); }}
                  className={`flex items-center gap-1 px-2 py-1 border text-[10px] ${dest?.seed === bm.seed ? 'border-yellow-500 bg-yellow-950/20 text-yellow-300' : 'border-orange-900 text-orange-600 hover:border-orange-700'}`}>
                  <Star className="w-2.5 h-2.5" /> {bm.name}
                </button>
              ))}
            </div>
          </div>

          {/* destination + route preview */}
          {dest && (
            <div className="border border-orange-700 p-2 space-y-2">
              <div className="text-orange-300 text-xs font-bold uppercase flex items-center gap-1"><Route className="w-3.5 h-3.5" /> Destination: {dest.name}</div>
              {plan?.error && <div className="flex items-center gap-1 text-red-400 text-[10px]"><AlertTriangle className="w-3 h-3" /> {plan.error}</div>}
              {summary && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-orange-600">
                  <div>JUMPS: <span className="text-orange-300">{summary.jumps}</span></div>
                  <div>DISTANCE: <span className="text-orange-300">{summary.totalDist.toFixed(1)} LY</span></div>
                  <div>FUEL NEEDED: <span className="text-orange-300">{summary.totalFuel}T</span></div>
                  <div>ON BOARD: <span className={fuelOnboard >= summary.totalFuel ? 'text-green-500' : 'text-yellow-400'}>{fuelOnboard.toFixed(1)}T</span></div>
                  <div>NEUTRON BOOSTS: <span className="text-cyan-400">{summary.neutronCount}</span></div>
                  <div>SCOOP STOPS: <span className="text-green-500">{summary.scoopStops}</span></div>
                  <div>STATION STOPS: <span className="text-orange-300">{summary.stationStops}</span></div>
                  <div>NO-FUEL ZONES: <span className={summary.deadZones > 0 ? 'text-red-400' : 'text-green-500'}>{summary.deadZones}</span></div>
                </div>
              )}
              {summary?.deadZones > 0 && (
                <div className="flex items-center gap-1 text-yellow-500 text-[10px] border border-yellow-900/50 p-1">
                  <AlertTriangle className="w-3 h-3" /> {summary.deadZones} stop(s) have no fuel source — the AI will halt there if fuel runs low.
                </div>
              )}
              {startErr && <div className="flex items-center gap-1 text-red-400 text-[10px]"><AlertTriangle className="w-3 h-3" /> {startErr}</div>}
              <button onClick={begin} disabled={!plan?.route?.length} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> BEGIN JOURNEY
              </button>
            </div>
          )}

          {!dest && !searching && (
            <div className="text-center text-orange-700 py-8 text-xs">
              <Route className="w-6 h-6 mx-auto mb-2 opacity-40" />
              Select a destination and the shipboard AI will jump, refuel, and repeat until you arrive.
            </div>
          )}
        </div>
      )}

      {(phase === 'travel' || phase === 'arrived' || phase === 'halted') && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 border-b border-orange-900/50 flex items-center justify-between text-[10px] flex-shrink-0">
            <span className="text-orange-400 uppercase flex items-center gap-1"><Bot className="w-3 h-3" /> {phaseLabel}</span>
            {phase === 'travel' ? (
              <div className="flex items-center gap-1.5">
                <button onClick={() => setShowActivities(v => !v)} className={`px-2 py-0.5 border text-[10px] font-bold ${showActivities ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30' : 'border-cyan-800 text-cyan-500 hover:bg-cyan-950/30'}`}>ACTIVITIES</button>
                <button onClick={abort} className="px-2 py-0.5 border border-red-800 text-red-400 hover:bg-red-950/30 text-[10px] font-bold">ABORT</button>
              </div>
            ) : (
              <button onClick={() => { setPhase('plan'); setPlan(null); setSummary(null); setDest(null); }} className="px-2 py-0.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold">RETURN</button>
            )}
          </div>

          {/* point-to-point transit view */}
          <div className="relative flex-1 min-h-0">
            {phase === 'travel' ? (
              <>
                <canvas ref={canvasRef} className="absolute inset-0" />
                {showActivities && (
                  <div className="absolute inset-0 z-20 bg-black/95 overflow-y-auto">
                    <div className="sticky top-0 z-10 flex justify-end p-1 bg-black border-b border-orange-900/50">
                      <button onClick={() => setShowActivities(false)} className="px-2 py-0.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] font-bold">CLOSE ACTIVITIES</button>
                    </div>
                    <EntertainmentHub embedded />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                {phase === 'arrived' ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                    <div className="text-green-400 font-bold uppercase">Journey Complete</div>
                    <div className="text-orange-500 text-xs">{routeRef.current?.[routeRef.current.length - 1]?.star?.name} reached after {routeRef.current?.length} jumps.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                    <div className="text-red-400 font-bold uppercase">Journey Halted</div>
                    <div className="text-orange-500 text-xs max-w-md">{log[log.length - 1]?.msg}</div>
                    <div className="text-orange-700 text-[10px]">Refuel or reroute, then begin a new journey.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ship AI companion log */}
          <div className="border-t border-orange-900/60 bg-black/90 px-2 py-1.5 max-h-32 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-1 text-orange-700 text-[8px] uppercase border-b border-orange-950/50 pb-0.5 mb-0.5 flex-shrink-0">
              <Bot className="w-2.5 h-2.5" /> Ship AI Companion — Transit Log
            </div>
            <div className="overflow-y-auto space-y-0.5 text-[10px]">
              {log.slice(-8).map(l => (
                <div key={l.id} className={
                  l.type === 'halt' ? 'text-red-400' :
                  l.type === 'success' ? 'text-green-400' :
                  l.type === 'scoop' ? 'text-cyan-400' :
                  l.type === 'station' ? 'text-orange-300' :
                  l.type === 'jump' ? 'text-orange-400' :
                  l.type === 'charge' ? 'text-yellow-500' :
                  'text-orange-600'
                }>{l.msg}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}