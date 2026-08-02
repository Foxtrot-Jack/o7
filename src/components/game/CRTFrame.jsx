// CRT visual effect wrapper — scanlines, glow, curvature, flicker, theme support
import React from 'react';
import { THEMES, buildCustomTheme } from '@/lib/themes';
import { FONTS } from '@/lib/fonts';

export default function CRTFrame({ children, enabled = true, brightness = 100, theme = 'elite', customColor = null, textRGB = null, fontFamily = 'courier', fontScale = 100, display = {} }) {
  const baseTheme = THEMES[theme] || THEMES.elite;
  const t = customColor ? buildCustomTheme(customColor) : baseTheme;
  // Text color override — takes priority over theme/custom color for the text glow only
  const shadow = textRGB ? `rgba(${textRGB.r},${textRGB.g},${textRGB.b},0.8)` : t.shadow;
  const shadowDim = textRGB ? `rgba(${textRGB.r},${textRGB.g},${textRGB.b},0.2)` : t.shadowDim;
  const font = FONTS[fontFamily] || FONTS.courier;
  const rootFontSize = Math.round(16 * (fontScale / 100));
  const filters = [`brightness(${brightness}%)`];
  if (display.invertColors) filters.push('invert(1)');
  if (display.hueRotate) filters.push(`hue-rotate(${display.hueRotate}deg)`);
  if (display.saturation != null && display.saturation !== 100) filters.push(`saturate(${display.saturation}%)`);
  if (display.contrast != null && display.contrast !== 100) filters.push(`contrast(${display.contrast}%)`);
  if (!customColor) {
    if (t.hueRotate) filters.push(`hue-rotate(${t.hueRotate}deg)`);
  }
  const transforms = [];
  if (display.flipHorizontal) transforms.push('scaleX(-1)');
  if (display.flipVertical) transforms.push('scaleY(-1)');
  const filterStyle = { filter: filters.join(' '), '--crt-font': font.family, ...(transforms.length ? { transform: transforms.join(' ') } : {}) };
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

      <div className="crt-scanlines pointer-events-none absolute inset-0 z-20" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)' }} />
      <div className="crt-vignette pointer-events-none absolute inset-0 z-20" style={{ boxShadow: 'inset 0 0 120px 20px rgba(0,0,0,0.4)', borderRadius: '8px' }} />
      <div className="crt-glow pointer-events-none absolute inset-0 z-20" style={{ background: `radial-gradient(ellipse at center, ${t.glow} 0%, rgba(0,0,0,0) 70%)` }} />
      <div className="crt-flicker pointer-events-none absolute inset-0 z-20" style={{ background: t.flicker, animation: 'crtFlicker 0.15s infinite' }} />

      <style>{`
        ${rootStyle}
        @keyframes crtFlicker { 0% { opacity: 0.9; } 50% { opacity: 1; } 100% { opacity: 0.95; } }
        .crt-container { font-family: 'Courier New', monospace; text-shadow: 0 0 3px ${shadow}, 0 0 6px ${shadowDim}; }
        .crt-container * { text-shadow: inherit; }
        .crt-container::before { content: ''; position: absolute; inset: 0; z-index: 30; pointer-events: none; background: linear-gradient(180deg, ${t.gradient} 0%, transparent 50%, ${t.gradient} 100%); }
      `}</style>
    </div>
  );
}