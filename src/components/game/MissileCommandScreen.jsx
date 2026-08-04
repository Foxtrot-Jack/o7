// Missile Command — retro arcade mini-game (Atari 1980 homage).
// Defend six cities from incoming ICBMs using three missile batteries.
// Tap/click the sky to launch a counter-missile from the nearest armed base;
// it detonates at the target and destroys any enemy warhead caught in the blast.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Crosshair, Shield, Rocket, Trophy, RotateCcw } from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

const BASE_MISSILES = 10;
const CITY_COUNT = 6;
const EXPLOSION_MAX = 38;
const EXPLOSION_GROW = 90; // per second
const EXPLOSION_HOLD = 0.35;
const COUNTER_SPEED = 360; // px/s
const ENEMY_BASE_SPEED = 38; // px/s wave 1
const ENEMY_SPEED_RAMP = 8;
const MIRV_CHANCE_BASE = 0.18;
const MIRV_CHANCE_RAMP = 0.04;

export default function MissileCommandScreen() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const sizeRef = useRef({ w: 800, h: 500 });

  // Mutable game state in a ref — updated every frame, no re-render needed
  const game = useRef({
    bases: [], cities: [], enemies: [], counters: [], explosions: [],
    crosshair: { x: 400, y: 250 },
    wave: 1, score: 0, toSpawn: 0, spawnTimer: 0, waveActive: false,
    waveCooldown: 0, gameOver: false, high: 0,
  });

  // React state mirror for the HUD (updated at a throttled rate)
  const [hud, setHud] = useState({ wave: 1, score: 0, missiles: 30, cities: 6, gameOver: false, high: 0 });
  const [started, setStarted] = useState(false);

  // Load high score
  useEffect(() => {
    const h = parseInt(localStorage.getItem('starfarer_mc_high') || '0', 10);
    game.current.high = h;
    setHud(s => ({ ...s, high: h }));
  }, []);

  const setupWorld = useCallback(() => {
    const { w, h } = sizeRef.current;
    const groundY = h - 60;
    const bases = [
      { x: w * 0.08, y: groundY, missiles: BASE_MISSILES, alive: true },
      { x: w * 0.5, y: groundY, missiles: BASE_MISSILES, alive: true },
      { x: w * 0.92, y: groundY, missiles: BASE_MISSILES, alive: true },
    ];
    // 6 cities spread across, avoiding base positions
    const cityX = [0.22, 0.32, 0.42, 0.58, 0.68, 0.78].map(f => w * f);
    const cities = cityX.map(x => ({ x, y: groundY, alive: true }));
    Object.assign(game.current, {
      bases, cities, enemies: [], counters: [], explosions: [],
      wave: 1, score: 0, toSpawn: 0, spawnTimer: 0, waveActive: false,
      waveCooldown: 1.5, gameOver: false,
    });
    setHud({ wave: 1, score: 0, missiles: 30, cities: 6, gameOver: false, high: game.current.high });
  }, []);

  const startWave = useCallback((wave) => {
    const g = game.current;
    g.bases.forEach(b => { b.missiles = BASE_MISSILES; b.alive = true; });
    const count = 8 + Math.floor(wave * 1.5);
    g.toSpawn = count;
    g.spawnTimer = 0.5;
    g.waveActive = true;
  }, []);

  const startGame = useCallback(() => {
    setupWorld();
    setStarted(true);
    soundEngine.play('click');
  }, [setupWorld]);

  const restart = useCallback(() => {
    setupWorld();
    setStarted(true);
    soundEngine.play('click');
  }, [setupWorld]);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [started]);

  // Input — aim crosshair + fire
  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = game.current;
    const toLocal = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };
    const onMove = (e) => { const p = toLocal(e); g.crosshair.x = p.x; g.crosshair.y = p.y; };
    const onDown = (e) => {
      e.preventDefault();
      const p = toLocal(e);
      g.crosshair.x = p.x; g.crosshair.y = p.y;
      fire(p.x, p.y);
    };
    const fire = (tx, ty) => {
      if (g.gameOver || !g.waveActive) return;
      // nearest alive base with missiles
      let best = null, bd = Infinity;
      for (const b of g.bases) {
        if (!b.alive || b.missiles <= 0) continue;
        const d = Math.abs(b.x - tx);
        if (d < bd) { bd = d; best = b; }
      }
      if (!best) { soundEngine.play('error'); return; }
      best.missiles--;
      const dx = tx - best.x, dy = ty - best.y;
      const dist = Math.hypot(dx, dy) || 1;
      g.counters.push({
        x: best.x, y: best.y, tx, ty,
        vx: (dx / dist) * COUNTER_SPEED, vy: (dy / dist) * COUNTER_SPEED,
      });
      soundEngine.play('select');
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
  }, [started]);

  // Main loop
  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let hudTimer = 0;

    const spawnEnemy = (wave) => {
      const g = game.current;
      const { w, h } = sizeRef.current;
      const groundY = h - 60;
      const targets = [...g.cities, ...g.bases].filter(t => t.alive);
      if (!targets.length) return;
      const tgt = targets[Math.floor(Math.random() * targets.length)];
      const sx = Math.random() * w;
      const sy = -10;
      const speed = ENEMY_BASE_SPEED + ENEMY_SPEED_RAMP * (wave - 1);
      const dx = tgt.x - sx, dy = groundY - sy;
      const dist = Math.hypot(dx, dy) || 1;
      const splitChance = MIRV_CHANCE_BASE + MIRV_CHANCE_RAMP * (wave - 1);
      g.enemies.push({
        x: sx, y: sy,
        vx: (dx / dist) * speed, vy: (dy / dist) * speed,
        tx: tgt.x, ty: groundY,
        splitAt: wave > 2 && Math.random() < splitChance ? 0.4 + Math.random() * 0.3 : null,
        split: false,
      });
    };

    const explode = (x, y) => {
      game.current.explosions.push({ x, y, r: 2, phase: 'grow', t: 0 });
      soundEngine.play('alert');
    };

    const step = (ts) => {
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000 || 0);
      lastTsRef.current = ts;
      const g = game.current;

      if (!g.gameOver) {
        // wave management
        if (!g.waveActive) {
          g.waveCooldown -= dt;
          if (g.waveCooldown <= 0) startWave(g.wave);
        } else {
          if (g.toSpawn > 0) {
            g.spawnTimer -= dt;
            if (g.spawnTimer <= 0) {
              spawnEnemy(g.wave);
              g.toSpawn--;
              g.spawnTimer = Math.max(0.35, 1.4 - g.wave * 0.08) * (0.6 + Math.random() * 0.8);
            }
          } else if (g.enemies.length === 0) {
            // wave cleared — bonus
            const cityBonus = g.cities.filter(c => c.alive).length * 100;
            const misBonus = g.bases.reduce((s, b) => s + b.missiles, 0) * 10;
            g.score += cityBonus + misBonus;
            g.wave++;
            g.waveActive = false;
            g.waveCooldown = 2.0;
            soundEngine.play('click');
          }
        }

        // spawn counter-missile trails handled by counters array
        // update counters
        for (const c of g.counters) {
          c.x += c.vx * dt; c.y += c.vy * dt;
          if (Math.hypot(c.x - c.tx, c.y - c.ty) < 6) {
            explode(c.tx, c.ty);
            c.dead = true;
          }
        }
        g.counters = g.counters.filter(c => !c.dead);

        // update enemies
        for (const e of g.enemies) {
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (e.splitAt != null && !e.split && e.y > sizeRef.current.h * e.splitAt) {
            e.split = true;
            const { w, h } = sizeRef.current;
            const groundY = h - 60;
            const targets = [...g.cities, ...g.bases].filter(t => t.alive);
            if (targets.length) {
              for (let i = 0; i < 2; i++) {
                const tgt = targets[Math.floor(Math.random() * targets.length)];
                const sx = e.x, sy = e.y;
                const dx = tgt.x - sx, dy = groundY - sy;
                const dist = Math.hypot(dx, dy) || 1;
                const speed = Math.hypot(e.vx, e.vy) * 1.05;
                g.enemies.push({ x: sx, y: sy, vx: (dx / dist) * speed, vy: (dy / dist) * speed, tx: tgt.x, ty: groundY, splitAt: null, split: false });
              }
            }
            e.dead = true;
          }
          // reached ground?
          if (e.y >= sizeRef.current.h - 60) {
            // destroy whatever is near impact
            const impactX = e.x;
            for (const c of g.cities) {
              if (c.alive && Math.abs(c.x - impactX) < 26) { c.alive = false; }
            }
            for (const b of g.bases) {
              if (b.alive && Math.abs(b.x - impactX) < 24) { b.alive = false; b.missiles = 0; }
            }
            explode(impactX, sizeRef.current.h - 60);
            e.dead = true;
          }
        }
        g.enemies = g.enemies.filter(e => !e.dead);

        // update explosions
        for (const ex of g.explosions) {
          ex.t += dt;
          if (ex.phase === 'grow') {
            ex.r += EXPLOSION_GROW * dt;
            if (ex.r >= EXPLOSION_MAX) { ex.r = EXPLOSION_MAX; ex.phase = 'hold'; }
          } else if (ex.phase === 'hold') {
            if (ex.t > EXPLOSION_HOLD) ex.phase = 'shrink';
          } else {
            ex.r -= EXPLOSION_GROW * dt;
            if (ex.r <= 0) ex.dead = true;
          }
          // destroy enemies within radius
          for (const e of g.enemies) {
            if (!e.dead && Math.hypot(e.x - ex.x, e.y - ex.y) < ex.r) {
              e.dead = true;
              g.score += 25;
            }
          }
        }
        g.explosions = g.explosions.filter(e => !e.dead);

        // game over check
        const citiesAlive = g.cities.some(c => c.alive);
        const basesWithMissiles = g.bases.some(b => b.alive && b.missiles > 0);
        if (!citiesAlive && g.enemies.length === 0 && g.waveActive) {
          g.gameOver = true;
          if (g.score > g.high) {
            g.high = g.score;
            localStorage.setItem('starfarer_mc_high', String(g.score));
          }
          soundEngine.play('error');
        }
        // also game over if no cities left at all
        if (!g.cities.some(c => c.alive) && !g.gameOver) {
          // allow current wave enemies to finish, handled above
        }
      }

      // HUD throttle
      hudTimer += dt;
      if (hudTimer > 0.15) {
        hudTimer = 0;
        setHud({
          wave: g.wave,
          score: g.score,
          missiles: g.bases.reduce((s, b) => s + (b.alive ? b.missiles : 0), 0),
          cities: g.cities.filter(c => c.alive).length,
          gameOver: g.gameOver,
          high: g.high,
        });
      }

      // ---- render ----
      const { w, h } = sizeRef.current;
      const groundY = h - 60;
      ctx.clearRect(0, 0, w, h);
      // sky
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      // ground
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
      ctx.fillStyle = 'rgba(255,136,0,0.08)';
      ctx.fillRect(0, groundY, w, h - groundY);

      // cities
      for (const c of g.cities) {
        if (!c.alive) continue;
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(c.x - 12, c.y - 18, 24, 18);
        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) ctx.fillRect(c.x - 9 + i * 8, c.y - 14, 5, 10);
      }
      // bases
      for (const b of g.bases) {
        if (!b.alive) continue;
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(b.x - 18, b.y); ctx.lineTo(b.x, b.y - 14); ctx.lineTo(b.x + 18, b.y); ctx.closePath();
        ctx.fill();
        // missile pips
        const cols = 5, rows = 2;
        for (let i = 0; i < b.missiles; i++) {
          const r = Math.floor(i / cols), c = i % cols;
          ctx.fillStyle = '#ffaa44';
          ctx.fillRect(b.x - 14 + c * 6, b.y - 4 - r * 5, 3, 3);
        }
      }
      // enemy missile trails + heads
      for (const e of g.enemies) {
        ctx.strokeStyle = 'rgba(255,80,80,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(e.x - e.vx * 0.4, e.y - e.vy * 0.4); ctx.lineTo(e.x, e.y); ctx.stroke();
        ctx.fillStyle = '#ff4444';
        ctx.beginPath(); ctx.arc(e.x, e.y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      // counter-missile trails
      for (const c of g.counters) {
        ctx.strokeStyle = '#44ff88';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(c.x - c.vx * 0.08, c.y - c.vy * 0.08); ctx.lineTo(c.x, c.y); ctx.stroke();
      }
      // explosions
      for (const ex of g.explosions) {
        const alpha = ex.phase === 'shrink' ? ex.r / EXPLOSION_MAX : 1;
        ctx.fillStyle = `rgba(255,200,60,${0.5 * alpha})`;
        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255,136,0,${0.9 * alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2); ctx.stroke();
      }
      // crosshair
      if (!g.gameOver) {
        const { x, y } = g.crosshair;
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 10, y); ctx.lineTo(x - 3, y);
        ctx.moveTo(x + 3, y); ctx.lineTo(x + 10, y);
        ctx.moveTo(x, y - 10); ctx.lineTo(x, y - 3);
        ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 10);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started]);

  // Initialize world on start
  useEffect(() => {
    if (started) setupWorld();
  }, [started, setupWorld]);

  if (!started) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <Crosshair className="w-12 h-12 text-orange-500 mx-auto" />
            <h2 className="text-orange-400 text-2xl font-bold uppercase tracking-widest">Missile Command</h2>
            <p className="text-orange-700 text-xs">Defend the six cities from incoming ICBMs. Tap the sky to launch a counter-missile from the nearest armed battery. Each battery carries 10 missiles per wave.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-left">
            <div className="border border-orange-900 p-2"><div className="text-orange-500 uppercase">High Score</div><div className="text-orange-300 text-lg font-bold">{hud.high.toLocaleString()}</div></div>
            <div className="border border-orange-900 p-2"><div className="text-orange-500 uppercase">Controls</div><div className="text-orange-400">Tap / Click sky</div></div>
          </div>
          <button onClick={startGame} className="w-full py-3 border-2 border-orange-500 text-orange-300 hover:bg-orange-950/40 text-sm font-bold uppercase tracking-widest">
            <Rocket className="w-4 h-4 inline mr-2" />Begin Defense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-orange-900/60 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-orange-500 uppercase flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {hud.score.toLocaleString()}</span>
          <span className="text-orange-700">HI {hud.high.toLocaleString()}</span>
        </div>
        <div className="text-orange-400 uppercase">Wave {hud.wave}</div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 flex items-center gap-1"><Rocket className="w-3.5 h-3.5" /> {hud.missiles}</span>
          <span className="text-green-500 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {hud.cities}/{CITY_COUNT}</span>
        </div>
      </div>
      {/* Play field */}
      <div className="relative flex-1 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
        {hud.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-10">
            <div className="text-center space-y-4">
              <h2 className="text-red-500 text-3xl font-bold uppercase tracking-widest">The End</h2>
              <div className="text-orange-400 text-sm">Final Score: <span className="text-orange-300 font-bold">{hud.score.toLocaleString()}</span></div>
              <div className="text-orange-700 text-xs">Reached Wave {hud.wave}</div>
              <button onClick={restart} className="px-6 py-2 border-2 border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold uppercase tracking-widest">
                <RotateCcw className="w-4 h-4 inline mr-2" />Redeploy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}