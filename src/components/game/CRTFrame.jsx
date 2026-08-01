// CRT visual effect wrapper — scanlines, glow, curvature, flicker, theme support
import React from 'react';
import { THEMES, buildCustomTheme } from '@/lib/themes';
import { FONTS } from '@/lib/fonts';

export default function CRTFrame({ children, enabled = true, brightness = 100, theme = 'elite', customColor = null, fontFamily = 'courier', fontScale = 100 }) {
  const baseTheme = THEMES[theme] || THEMES.elite;
  const t = customColor ? buildCustomTheme(customColor) : baseTheme;
  const font = FONTS[fontFamily] || FONTS.courier;
  const rootFontSize = Math.round(16 * (fontScale / 100));
  const filters = [`brightness(${brightness}%)`];
  if (!customColor) {
    if (t.grayscale) filters.push('grayscale(1)');
    if (t.hueRotate) filters.push(`hue-rotate(${t.hueRotate}deg)`);
  }
  const filterStyle = { filter: filters.join(' '), '--crt-font': font.family };
  const rootStyle = `:root { font-size: ${rootFontSize}px; }`;

  if (!enabled) return (
    <div className="crt-container w-full h-full overflow-hidden bg-black" style={filterStyle}>
      <style>{rootStyle}</style>
      {children}
    </div>
  );

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
        ${rootStyle}
        @keyframes crtFlicker { 0% { opacity: 0.9; } 50% { opacity: 1; } 100% { opacity: 0.95; } }
        .crt-container { font-family: 'Courier New', monospace; text-shadow: 0 0 2px ${t.shadow}, 0 0 8px ${t.shadowDim}; }
        .crt-container * { text-shadow: inherit; }
        .crt-container::before { content: ''; position: absolute; inset: 0; z-index: 30; pointer-events: none; background: linear-gradient(180deg, ${t.gradient} 0%, transparent 50%, ${t.gradient} 100%); }
      `}</style>
    </div>
  );
}