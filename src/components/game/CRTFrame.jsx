// CRT visual effect wrapper — scanlines, glow, curvature, flicker, theme support
import React from 'react';
import { THEMES } from '@/lib/themes';

export default function CRTFrame({ children, enabled = true, brightness = 100, theme = 'elite' }) {
  const t = THEMES[theme] || THEMES.elite;
  const filters = [`brightness(${brightness}%)`];
  if (t.grayscale) filters.push('grayscale(1)');
  if (t.hueRotate) filters.push(`hue-rotate(${t.hueRotate}deg)`);
  const filterStyle = { filter: filters.join(' ') };

  if (!enabled) return <div className="w-full h-full" style={filterStyle}>{children}</div>;

  return (
    <div className="crt-container relative w-full h-full overflow-hidden bg-black" style={filterStyle}>
      <div className="crt-content relative z-10 w-full h-full">
        {children}
      </div>

      <div className="crt-scanlines pointer-events-none absolute inset-0 z-20" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)' }} />
      <div className="crt-vignette pointer-events-none absolute inset-0 z-20" style={{ boxShadow: 'inset 0 0 150px 40px rgba(0,0,0,0.8)', borderRadius: '8px' }} />
      <div className="crt-glow pointer-events-none absolute inset-0 z-20" style={{ background: `radial-gradient(ellipse at center, ${t.glow} 0%, rgba(0,0,0,0) 70%)` }} />
      <div className="crt-flicker pointer-events-none absolute inset-0 z-20" style={{ background: t.flicker, animation: 'crtFlicker 0.15s infinite' }} />

      <style>{`
        @keyframes crtFlicker { 0% { opacity: 0.9; } 50% { opacity: 1; } 100% { opacity: 0.95; } }
        .crt-container { font-family: 'Courier New', monospace; text-shadow: 0 0 2px ${t.shadow}, 0 0 8px ${t.shadowDim}; }
        .crt-container * { text-shadow: inherit; }
        .crt-container::before { content: ''; position: absolute; inset: 0; z-index: 30; pointer-events: none; background: linear-gradient(180deg, ${t.gradient} 0%, transparent 50%, ${t.gradient} 100%); }
      `}</style>
    </div>
  );
}