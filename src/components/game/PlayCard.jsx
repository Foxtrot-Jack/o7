// PlayCard — shared visual for a collectible card. Used by the binder and games.
import React from 'react';
import { MFR_COLORS } from '@/lib/cardDeck';

export default function PlayCard({ card, faceDown, size = 'md', selected, onClick, dim }) {
  const sizes = { sm: 'w-11 h-16', md: 'w-16 h-24', lg: 'w-20 h-28' };
  const w = sizes[size] || sizes.md;
  if (!card) return <div className={`${w} border border-orange-950/60 bg-black/40`} />;
  if (faceDown) return (
    <button onClick={onClick} className={`${w} border border-orange-700 bg-orange-950/40 flex items-center justify-center text-orange-600 text-xl select-none`}>◆</button>
  );
  const color = MFR_COLORS[card.mfrKey] || '#ff8800';
  return (
    <button onClick={onClick} className={`${w} border-2 bg-black flex flex-col items-center justify-between p-1 leading-none ${selected ? 'ring-2 ring-cyan-400' : ''} ${dim ? 'opacity-40' : ''}`} style={{ borderColor: color }}>
      <div className="text-[6px] text-orange-700 text-center w-full truncate">{card.manufacturer}</div>
      <div className="text-center">
        <div className="text-[11px] font-bold" style={{ color }}>{card.power}</div>
        <div className="text-[6px] text-orange-800">PWR</div>
      </div>
      <div className="text-[6px] text-orange-500 text-center w-full truncate px-0.5">{card.name}</div>
      <div className="flex justify-between w-full text-[6px] text-orange-700">
        <span>F{card.firepower}</span><span>S{card.speed}</span><span>A{card.armor}</span>
      </div>
    </button>
  );
}