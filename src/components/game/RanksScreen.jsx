// Ranks — displays proficiency in combat, exploration, trade, mining, exobiology.
import React from 'react';
import { Trophy } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

const COMBAT_RANKS = ['Harmless', 'Mostly Harmless', 'Novice', 'Competent', 'Expert', 'Master', 'Dangerous', 'Deadly', 'Elite'];
const EXO_RANKS = ['Dirigible', 'Collector', 'Cataloguer', 'Taxonomist', 'Ecologist', 'Geneticist', 'Elite'];

function rankFor(points, table) {
  const idx = Math.min(table.length - 1, Math.floor((points || 0) / 100));
  return { name: table[idx], level: idx + 1, max: table.length };
}

function Bar({ label, rank }) {
  const pct = Math.round((rank.level / rank.max) * 100);
  return (
    <div className="border border-orange-900 bg-black/60 p-3">
      <div className="flex justify-between text-xs">
        <span className="text-orange-500 uppercase">{label}</span>
        <span className="text-orange-300 font-bold">{rank.name}</span>
      </div>
      <div className="h-2 bg-orange-950/50 mt-2">
        <div className="h-full bg-orange-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-orange-800 text-[10px] mt-1">Rank {rank.level}/{rank.max}</div>
    </div>
  );
}

export default function RanksScreen() {
  const { state } = useGameState();
  const r = state.rank || {};
  const combat = rankFor(state.totalKills || 0, COMBAT_RANKS);
  const exoCount = Object.keys(state.exobiologyCodex || {}).length;
  const exo = rankFor(exoCount * 10, EXO_RANKS);
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Trophy className="w-4 h-4" /> Ranks
      </div>
      <Bar label="Combat" rank={combat} />
      <Bar label="Exploration" rank={{ name: r.exploration?.name || 'Aimless', level: (r.exploration?.rank || 0) + 1, max: 9 }} />
      <Bar label="Trade" rank={{ name: r.trade?.name || 'Penniless', level: (r.trade?.rank || 0) + 1, max: 9 }} />
      <Bar label="Mining" rank={{ name: r.mining?.name || 'Defendant', level: (r.mining?.rank || 0) + 1, max: 9 }} />
      <Bar label="Exobiology" rank={exo} />
    </div>
  );
}