// Brick Breaker — arcade classic in the CRT aesthetic. Mouse or arrow keys
// move the paddle; clear every brick before you run out of lives.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw, Play } from 'lucide-react';

const COLS = 10, ROWS = 5;

export default function BrickBreakerGame({ onClose, onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const statusRef = useRef('ready');
  const doneRef = useRef(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('ready');

  const build = useCallback(() => {
    const bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) bricks.push({ r, c, alive: true });
    return { bricks, ball: { x: 0.5, y: 0.7, vx: 0.012, vy: -0.012, r: 0.012 }, paddle: 0.5 };
  }, []);

  const reset = useCallback(() => {
    gameRef.current = build();
    livesRef.current = 3; scoreRef.current = 0; statusRef.current = 'ready'; doneRef.current = false;
    setLives(3); setScore(0); setStatus('ready');
  }, [build]);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const p = canvas.parentElement; const dpr = window.devicePixelRatio || 1;
      const w = p.clientWidth, h = p.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const move = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      if (gameRef.current) gameRef.current.paddle = Math.max(0.08, Math.min(0.92, x / rect.width));
    };
    const key = (e) => {
      if (!gameRef.current) return;
      if (e.key === 'ArrowLeft') gameRef.current.paddle = Math.max(0.08, gameRef.current.paddle - 0.05);
      if (e.key === 'ArrowRight') gameRef.current.paddle = Math.min(0.92, gameRef.current.paddle + 0.05);
    };
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('keydown', key);
    return () => { canvas.removeEventListener('mousemove', move); canvas.removeEventListener('touchmove', move); window.removeEventListener('keydown', key); };
  }, []);

  useEffect(() => {
    let raf;
    const step = () => {
      const canvas = canvasRef.current; const g = gameRef.current;
      if (canvas && g) {
        const ctx = canvas.getContext('2d'); const w = canvas.clientWidth, h = canvas.clientHeight;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
        const brickH = Math.max(10, h * 0.05), brickTop = h * 0.08, gap = 3;
        const bw = w / COLS - gap;
        for (const br of g.bricks) {
          if (!br.alive) continue;
          const bx = br.c * (w / COLS), by = brickTop + br.r * (brickH + gap);
          ctx.fillStyle = br.r < 2 ? '#ff8800' : br.r < 4 ? '#ffaa44' : '#ffd068';
          ctx.fillRect(bx, by, bw, brickH - gap);
        }
        if (statusRef.current === 'playing' && !doneRef.current) {
          const b = g.ball;
          b.x += b.vx; b.y += b.vy;
          if (b.x < b.r) { b.x = b.r; b.vx = -b.vx; }
          if (b.x > 1 - b.r) { b.x = 1 - b.r; b.vx = -b.vx; }
          if (b.y < b.r) { b.y = b.r; b.vy = -b.vy; }
          const padW = 0.18, padY = h - 14;
          const px = (g.paddle - padW / 2) * w;
          if (b.vy > 0 && b.y * h >= padY && b.y * h <= padY + 12 && b.x * w >= px && b.x * w <= px + padW * w) {
            b.vy = -Math.abs(b.vy); b.vx = ((b.x - g.paddle) / (padW / 2)) * 0.02;
          }
          if (b.y > 1) {
            livesRef.current -= 1; setLives(livesRef.current);
            if (livesRef.current <= 0) { statusRef.current = 'lost'; setStatus('lost'); doneRef.current = true; onComplete && onComplete(false); }
            else { b.x = 0.5; b.y = 0.7; b.vx = 0.012; b.vy = -0.012; }
          }
          for (const br of g.bricks) {
            if (!br.alive) continue;
            const bx = br.c * (w / COLS), by = brickTop + br.r * (brickH + gap);
            if (b.x * w >= bx && b.x * w <= bx + bw && b.y * h >= by && b.y * h <= by + brickH) {
              br.alive = false; b.vy = -b.vy;
              scoreRef.current += 1; setScore(scoreRef.current);
              if (g.bricks.every(x => !x.alive)) { statusRef.current = 'won'; setStatus('won'); doneRef.current = true; onComplete && onComplete(true); }
              break;
            }
          }
        }
        ctx.fillStyle = '#ff8800';
        ctx.beginPath(); ctx.arc(g.ball.x * w, g.ball.y * h, 5, 0, Math.PI * 2); ctx.fill();
        const padW = 0.18;
        ctx.fillStyle = '#ffaa44';
        ctx.fillRect((g.paddle - padW / 2) * w, h - 14, padW * w, 8);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const start = () => { statusRef.current = 'playing'; setStatus('playing'); };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-orange-700 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <h3 className="text-orange-300 font-bold uppercase text-sm">Brick Breaker</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-orange-400">SCORE {score}</span>
            <span className="text-red-400">LIVES {lives}</span>
            <button onClick={onClose}><X className="w-4 h-4 text-orange-700" /></button>
          </div>
        </div>
        <div className="relative w-full h-64 border border-orange-900 bg-black">
          <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
          {status !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
              {status === 'ready' && <><div className="text-orange-400 text-xs text-center px-4">Move the paddle with mouse or ← → keys. Clear every brick.</div><button onClick={start} className="px-4 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold flex items-center gap-1"><Play className="w-3 h-3" /> LAUNCH</button></>}
              {status === 'won' && <><div className="text-green-400 font-bold text-sm">SECTOR CLEARED</div><button onClick={reset} className="px-3 py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-xs flex items-center gap-1"><RotateCcw className="w-3 h-3" /> AGAIN</button></>}
              {status === 'lost' && <><div className="text-red-400 font-bold text-sm">SHIP LOST</div><button onClick={reset} className="px-3 py-1.5 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-xs flex items-center gap-1"><RotateCcw className="w-3 h-3" /> RETRY</button></>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}