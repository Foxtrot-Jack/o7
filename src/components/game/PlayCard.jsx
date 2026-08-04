// PlayCard — shared visual for a collectible card. Renders procedural art
// (manufacturer glyph + origin-system starfield/planet sigil) over a rarity
// frame; foil copies get a gold border, a ✦ marker, and a stamped serial.
import React from 'react';
import { MFR_COLORS, foilSerial } from '@/lib/cardDeck';
import CardArt from './CardArt';

const RARITY_STYLE = {
  Common: { ring: '', tag: 'text-orange-700', stripe: 'bg-orange-800' },
  Rare: { ring: 'shadow-[0_0_4px_rgba(90,150,255,0.55)]', tag: 'text-blue-400', stripe: 'bg-blue-600' },
  Epic: { ring: 'shadow-[0_0_5px_rgba(180,100,255,0.6)]', tag: 'text-purple-400', stripe: 'bg-purple-600' },
  Legendary: { ring: 'shadow-[0_0_6px_rgba(255,210,70,0.8)]', tag: 'text-amber-300', stripe: 'bg-amber-500' },
};

export default function PlayCard({ card, faceDown, size = 'md', selected, onClick, dim, foil, origin }) {
  const sizes = { sm: 'w-11 h-16', md: 'w-16 h-24', lg: 'w-20 h-28' };
  const w = sizes[size] || sizes.md;
  if (!card) return <div className={`${w} border border-orange-950/60 bg-black/40`} />;
  if (faceDown) return (
    <button onClick={onClick} className={`${w} border border-orange-700 bg-orange-950/40 flex items-center justify-center text-orange-600 text-xl select-none`}>◆</button>
  );
  const color = MFR_COLORS[card.mfrKey] || '#ff8800';
  const r = RARITY_STYLE[card.rarity] || RARITY_STYLE.Common;
  const isFoil = !!foil;
  return (
    <button onClick={onClick} className={`relative ${w} border-2 bg-black flex flex-col p-0.5 leading-none overflow-hidden ${selected ? 'ring-2 ring-cyan-400' : ''} ${dim ? 'opacity-40' : ''} ${r.ring}`} style={{ borderColor: isFoil ? '#ffd24a' : color }}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${r.stripe}`} />
      {isFoil && <div className="absolute top-0 right-0 text-[6px] text-amber-300 font-bold leading-none px-0.5">✦</div>}
      <div className="text-[6px] text-orange-700 text-center w-full truncate mt-0.5">{card.manufacturer}</div>
      <div className="relative flex-1 min-h-0 w-full">
        <CardArt card={card} origin={origin} />
        <div className="absolute top-0 right-0 text-[10px] font-bold leading-none px-0.5" style={{ color }}>{card.power}</div>
        <div className={`absolute bottom-0 left-0 text-[6px] leading-none px-0.5 ${r.tag}`}>{card.rarity}</div>
      </div>
      <div className="text-[6px] text-orange-500 text-center w-full truncate px-0.5">{card.name}</div>
      <div className="flex justify-between w-full text-[6px] text-orange-700 px-0.5">
        <span>F{card.firepower}</span><span>S{card.speed}</span><span>A{card.armor}</span>
      </div>
      {isFoil && size !== 'sm' && <div className="text-[5px] text-amber-400/80 w-full text-center">✦{foilSerial(card.id)}</div>}
    </button>
  );
}