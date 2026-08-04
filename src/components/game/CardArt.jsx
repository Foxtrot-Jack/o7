// CardArt — renders the procedural art for a collectible card: a manufacturer
// glyph (primary) over a starfield seeded by the card's origin system, with a
// planet sigil colored by that system's dominant planet type. Pure render of
// values computed in cardArt.getCardArt.
import React from 'react';
import { MFR_GLYPHS, getCardArt } from '@/lib/cardArt';
import { MFR_COLORS } from '@/lib/cardDeck';

export default function CardArt({ card, origin }) {
  if (!card) return null;
  const art = getCardArt(card, origin);
  const glyph = MFR_GLYPHS[card.mfrKey] || MFR_GLYPHS.omega;
  const mfrColor = MFR_COLORS[card.mfrKey] || '#ff8800';
  const isGas = art.planetType?.startsWith('gas_giant') || art.planetType?.startsWith('helium') || art.planetType?.startsWith('ammonia_giant');

  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* Origin starfield — density from population, tint from faction/security */}
      {art.dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={art.accent} opacity={0.45} />
      ))}

      {/* Manufacturer glyph — the deck-defining emblem */}
      <g stroke={mfrColor} strokeWidth={0.9} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {glyph.map((sh, i) => {
          if (sh.t === 'path') return <path key={i} d={sh.d} />;
          if (sh.t === 'circle') return <circle key={i} cx={sh.cx} cy={sh.cy} r={sh.r} />;
          if (sh.t === 'line') return <line key={i} x1={sh.x1} y1={sh.y1} x2={sh.x2} y2={sh.y2} />;
          return null;
        })}
      </g>

      {/* Origin planet sigil — colored by the origin system's dominant planet type */}
      <g>
        <circle cx={4.6} cy={19.4} r={2.1} fill={art.planetColor} opacity={0.9} stroke={art.accent} strokeWidth={0.3} />
        {isGas && (
          <ellipse cx={4.6} cy={19.4} rx={3.1} ry={0.7} fill="none" stroke={art.planetColor} strokeWidth={0.3} opacity={0.6} />
        )}
      </g>
    </svg>
  );
}