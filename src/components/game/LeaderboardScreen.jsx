// Leaderboard — player's personal exploration records
import React from 'react';
import { Flame, Snowflake, Gauge, Hourglass, Sun, Moon, Globe, ArrowDown, Feather, Target, Expand, Trophy, Star } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

const RECORD_DEFS = [
  { key: 'hottest_planet', label: 'Hottest Planet', icon: Flame, color: '#ff4422', fmt: v => `${Math.round(v)} K` },
  { key: 'coldest_planet', label: 'Coldest Planet', icon: Snowflake, color: '#44aaff', fmt: v => `${Math.round(v)} K` },
  { key: 'fastest_orbit', label: 'Fastest Orbit', icon: Gauge, color: '#88ff44', fmt: v => `${v.toFixed(1)} days` },
  { key: 'slowest_orbit', label: 'Slowest Orbit', icon: Hourglass, color: '#ffaa44', fmt: v => `${v.toFixed(1)} days` },
  { key: 'smallest_sun', label: 'Smallest Star', icon: Sun, color: '#ffcc66', fmt: v => `${v.toFixed(2)} R☉` },
  { key: 'largest_sun', label: 'Largest Star', icon: Sun, color: '#ff8844', fmt: v => `${v.toFixed(2)} R☉` },
  { key: 'most_moons', label: 'Most Moons', icon: Moon, color: '#aaccff', fmt: v => `${v} moons` },
  { key: 'largest_planet', label: 'Largest Planet', icon: Globe, color: '#cc9966', fmt: v => `${v.toFixed(2)} R⊕` },
  { key: 'smallest_planet', label: 'Smallest Planet', icon: Globe, color: '#99ccaa', fmt: v => `${v.toFixed(2)} R⊕` },
  { key: 'highest_gravity', label: 'Highest Gravity', icon: ArrowDown, color: '#ff66aa', fmt: v => `${v.toFixed(2)} g` },
  { key: 'lowest_gravity', label: 'Lowest Gravity', icon: Feather, color: '#aaffff', fmt: v => `${v.toFixed(2)} g` },
  { key: 'closest_to_star', label: 'Closest to Star', icon: Target, color: '#ffaa00', fmt: v => `${v.toFixed(2)} AU` },
  { key: 'farthest_from_star', label: 'Farthest from Star', icon: Expand, color: '#6688ff', fmt: v => `${v.toFixed(2)} AU` },
];

export default function LeaderboardScreen() {
  const { state } = useGameState();
  const records = state.records || {};
  const totalSet = RECORD_DEFS.filter(r => records[r.key]).length;

  return (
    <div className="p-4 space-y-3">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase text-sm">Commander Leaderboard</h2>
        </div>
        <div className="text-xs text-orange-600">
          PERSONAL EXPLORATION RECORDS · <span className="text-orange-300">{totalSet}/{RECORD_DEFS.length}</span> CATEGORIES CLAIMED
        </div>
        <div className="w-full h-1.5 bg-black border border-orange-900 mt-2">
          <div className="h-full bg-orange-600 transition-all" style={{ width: `${(totalSet / RECORD_DEFS.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {RECORD_DEFS.map((rec) => {
          const entry = records[rec.key];
          const Icon = rec.icon;
          return (
            <div
              key={rec.key}
              className={`border p-3 flex items-center gap-3 ${entry ? 'border-orange-700 bg-orange-950/10' : 'border-orange-950 opacity-50'}`}
            >
              <div
                className="w-9 h-9 flex items-center justify-center border flex-shrink-0"
                style={{ borderColor: entry ? rec.color : '#442200', color: entry ? rec.color : '#553300' }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-orange-700 uppercase font-bold">{rec.label}</div>
                {entry ? (
                  <>
                    <div className="text-orange-300 text-sm font-bold truncate" style={{ color: rec.color }}>{rec.fmt(entry.value)}</div>
                    <div className="text-[9px] text-orange-600 truncate">
                      {entry.bodyName} · {entry.systemName}
                    </div>
                  </>
                ) : (
                  <div className="text-orange-800 text-xs italic">— No record yet —</div>
                )}
              </div>
              {entry && <Star className="w-3 h-3 text-orange-500 flex-shrink-0" fill="currentColor" />}
            </div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-orange-800 pt-2">
        Records are set automatically when you scan bodies via the System view or FSS scanner.
      </div>
    </div>
  );
}