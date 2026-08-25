// BootSequence — CRT power-up animation that plays once on first load.
// A bright horizontal line expands vertically, flickers, then fades to reveal
// the main menu. Evokes a 90s CRT monitor warming up without leaving any
// persistent screen effects on the clean UI that follows.
import React, { useState, useEffect, useRef } from 'react';

const BOOT_LINES = [
  'PILOTS\' GUILD TERMINAL v1.2.3',
  '© 3301 FEDERATION OF PILOTS',
  '',
  'INITIALIZING CORE SYSTEMS...',
  'LOADING STELLAR CARTOGRAPHY DB...',
  'CALIBRATING FSD DRIVE...',
  'CONNECTING TO GALNET...',
  'AUTHENTICATING PILOT CREDENTIALS...',
  '',
  'SYSTEM READY',
];

export default function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState('line'); // line -> expand -> flicker -> text -> fade
  const [lineScaleY, setLineScaleY] = useState(0.01);
  const [flicker, setFlicker] = useState(false);
  const [textLines, setTextLines] = useState([]);
  const [fade, setFade] = useState(false);
  const audioStarted = useRef(false);

  useEffect(() => {
    const timers = [];

    // Phase 1: Thin horizontal line appears (0-200ms)
    timers.push(setTimeout(() => {
      setLineScaleY(0.01);
    }, 0));

    // Phase 2: Line expands vertically (200-700ms)
    timers.push(setTimeout(() => {
      setPhase('expand');
      setLineScaleY(1);
    }, 200));

    // Phase 3: Flicker (700-1100ms)
    timers.push(setTimeout(() => {
      setPhase('flicker');
      let f = 0;
      const flickerInterval = setInterval(() => {
        setFlicker(prev => !prev);
        f++;
        if (f > 5) clearInterval(flickerInterval);
      }, 60);
      timers.push(flickerInterval);
    }, 700));

    // Phase 4: Boot text lines appear (1100ms+)
    timers.push(setTimeout(() => {
      setPhase('text');
      setFlicker(false);
      BOOT_LINES.forEach((line, i) => {
        timers.push(setTimeout(() => {
          setTextLines(prev => [...prev, line]);
        }, i * 120));
      });
    }, 1100));

    // Phase 5: Fade out and complete
    const totalTextTime = 1100 + BOOT_LINES.length * 120 + 400;
    timers.push(setTimeout(() => {
      setPhase('fade');
      setFade(true);
    }, totalTextTime));

    timers.push(setTimeout(() => {
      onComplete();
    }, totalTextTime + 500));

    return () => timers.forEach(t => {
      if (typeof t === 'function') t();
      else clearTimeout(t);
    });
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      {/* Expanding line phase */}
      {(phase === 'line' || phase === 'expand' || phase === 'flicker') && (
        <div
          className="w-full bg-orange-500 transition-all duration-500 ease-out"
          style={{
            height: '100%',
            transform: `scaleY(${lineScaleY})`,
            transformOrigin: 'center',
            opacity: flicker ? 0.3 : 1,
          }}
        />
      )}

      {/* Boot text phase */}
      {phase === 'text' && (
        <div className="w-full h-full p-6 sm:p-10 overflow-hidden">
          <div className="text-orange-400 text-xs sm:text-sm space-y-1 max-w-md">
            {textLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-orange-700">{`>`}</span>
                <span className={line === 'SYSTEM READY' ? 'text-green-500 font-bold' : ''}>
                  {line || '\u00A0'}
                </span>
                {i === textLines.length - 1 && (
                  <span className="inline-block w-2 h-3 bg-orange-400 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}