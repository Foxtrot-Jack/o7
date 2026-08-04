// Galactic Ticker — scrolling Galnet marquee on the main HUD combining live
// community goal progress with the current system's faction BGS states.
import React, { useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { getTimeRemaining } from '@/lib/communityGoals';
import { generateFactionStates, getFactionStateInfo } from '@/lib/bgs';
import { Radio } from 'lucide-react';

let styleInjected = false;
function ensureStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const el = document.createElement('style');
  el.textContent = '@keyframes galTickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}';
  document.head.appendChild(el);
}

export default function GalacticTicker() {
  const { state, getSystemData } = useGameState();
  ensureStyle();

  const items = useMemo(() => {
    const out = [];
    for (const g of (state.communityGoals || [])) {
      if (g.claimed) continue;
      const pct = g.target ? Math.min(100, Math.round((g.progress / g.target) * 100)) : 0;
      out.push({ id: g.id, text: `${g.icon} COMMUNITY GOAL — ${g.desc}: ${pct}% (${getTimeRemaining(g.deadline)})` });
    }
    const sys = state.currentSystem;
    if (sys) {
      const factions = generateFactionStates(sys.seed, getSystemData());
      for (const f of factions) {
        const info = getFactionStateInfo(f.state);
        out.push({ id: `${sys.seed}:${f.name}`, text: `${f.name} · ${f.influence}% — ${info.label.toUpperCase()} in ${sys.name}` });
      }
    }
    return out;
  }, [state.communityGoals, state.currentSystem?.seed]);

  if (!items.length) return null;
  // Duplicate the set so translateX(-50%) loops seamlessly.
  const track = [...items, ...items];
  return (
    <div className="flex items-center gap-2 px-3 py-0.5 border-b border-orange-900/50 bg-black text-[10px] text-orange-600 overflow-hidden whitespace-nowrap">
      <span className="text-orange-400 font-bold uppercase flex-shrink-0 pr-2 border-r border-orange-900/50 flex items-center gap-1">
        <Radio className="w-2.5 h-2.5" />GALNET
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="inline-block" style={{ animation: 'galTickerScroll 45s linear infinite' }}>
          {track.map((it, i) => (
            <span key={i} className="inline-block px-6">{it.text}</span>
          ))}
        </div>
      </div>
    </div>
  );
}