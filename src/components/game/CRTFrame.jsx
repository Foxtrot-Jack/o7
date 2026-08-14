// Clean frame wrapper — no CRT glow, scanlines, or screen effects.
// Renders crisp, readable text on a plain black background.
import React from 'react';
import { FONTS } from '@/lib/fonts';

export default function CRTFrame({ children, enabled = true, brightness = 100, theme = 'elite', customColor = null, textRGB = null, fontFamily = 'courier', fontScale = 100, display = {} }) {
  const font = FONTS[fontFamily] || FONTS.courier;
  const rootFontSize = Math.round(16 * (fontScale / 100));
  const filters = [`brightness(${brightness}%)`];
  if (display.invertColors) filters.push('invert(1)');
  if (display.hueRotate) filters.push(`hue-rotate(${display.hueRotate}deg)`);
  if (display.saturation != null && display.saturation !== 100) filters.push(`saturate(${display.saturation}%)`);
  if (display.contrast != null && display.contrast !== 100) filters.push(`contrast(${display.contrast}%)`);
  const transforms = [];
  if (display.flipHorizontal) transforms.push('scaleX(-1)');
  if (display.flipVertical) transforms.push('scaleY(-1)');
  const filterStyle = { filter: filters.join(' '), '--crt-font': font.family, ...(transforms.length ? { transform: transforms.join(' ') } : {}) };
  const rootStyle = `:root { font-size: ${rootFontSize}px; }`;

  return (
    <div className="crt-container w-full h-full overflow-auto bg-black" style={filterStyle}>
      <style>{rootStyle}</style>
      {children}
    </div>
  );
}