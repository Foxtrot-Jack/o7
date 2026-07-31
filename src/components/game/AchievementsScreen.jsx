// Achievements & Exploration Progress — 130+ goals
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { ACHIEVEMENT_DEFS } from '@/lib/achievementDefs';
import { Trophy, Star, Globe, Map, Telescope, Award, Rocket, Ship, Coins, Fuel, Anchor, Bookmark, Zap, Mountain, Beaker, Boxes, Hammer, Route, TrendingUp, Pickaxe, Layers, Compass } from 'lucide-react';

const ICON_MAP = { Star, Globe, Map, Telescope, Award, Rocket, Ship, Coins, Fuel, Anchor, Bookmark, Zap, Mountain, Beaker, Boxes, Hammer, Route, TrendingUp, Pickaxe, Trophy, Layers, Compass };

const GALAXY_SIZE = 4000000000;

export default function AchievementsScreen() {
  const { state } = useGameState();
  const ach = state.achievements || {};
  const systemsVisited = Object.keys(state.discoveredSystems || {}).length;
  const bodiesScanned = Object.keys(state.scannedBodies || {}).length;
  const systemsScanned = ach.systemsScanned || 0;
  const galaxyPct = (systemsVisited / GALAXY_SIZE) * 100;

  const isEarned = (def) => {
    if (def.check) return def.check(state);
    if (def.section === 'firstDiscoveries') return !!ach.firstDiscoveries?.[def.id];
    if (def.section === 'milestones') return !!ach.milestones?.[def.id];
    return false;
  };

  const getData = (def) => {
    if (def.section === 'firstDiscoveries') return ach.firstDiscoveries?.[def.id];
    if (def.section === 'milestones') return ach.milestones?.[def.id];
    return null;
  };

  const earnedCount = ACHIEVEMENT_DEFS.filter(isEarned).length;
  const firstDiscoveries = ACHIEVEMENT_DEFS.filter(d => d.section === 'firstDiscoveries');
  const milestones = ACHIEVEMENT_DEFS.filter(d => d.section === 'milestones');

  const renderAchievement = (def) => {
    const earned = isEarned(def);
    const data = getData(def);
    const Icon = ICON_MAP[def.icon] || Award;
    return (
      <div key={def.id} className={`border p-1.5 flex items-center gap-2 ${earned ? 'border-orange-600' : 'border-orange-950 opacity-50'}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${earned ? 'text-orange-400' : 'text-orange-800'}`} />
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-bold ${earned ? 'text-orange-300' : 'text-orange-700'}`}>{def.name}</div>
          <div className="text-[9px] text-orange-700 truncate">{def.desc}</div>
          {earned && data?.system && <div className="text-[9px] text-green-600">✓ {data.system}</div>}
        </div>
        {earned && <span className="text-green-500 text-sm flex-shrink-0">✓</span>}
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Commander Achievements</h2>
        <span className="ml-auto text-orange-500 text-xs">{earnedCount} / {ACHIEVEMENT_DEFS.length}</span>
      </div>

      <div className="border border-orange-900 p-4 space-y-3">
        <h3 className="text-orange-500 text-sm font-bold uppercase flex items-center gap-2"><Telescope className="w-4 h-4" /> Exploration Progress</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Stat label="Systems Visited" value={systemsVisited.toLocaleString()} icon={Map} />
          <Stat label="Systems Scanned" value={systemsScanned.toLocaleString()} icon={Telescope} />
          <Stat label="Bodies Scanned" value={bodiesScanned.toLocaleString()} icon={Globe} />
          <Stat label="Total Jumps" value={(state.totalJumps || 0).toLocaleString()} icon={Star} />
        </div>
        <div className="border-t border-orange-900 pt-3">
          <div className="flex justify-between text-xs text-orange-600 mb-1"><span>GALAXY EXPLORED</span><span className="text-orange-300">{galaxyPct < 0.000001 ? '<0.000001' : galaxyPct.toFixed(6)}%</span></div>
          <div className="w-full h-2 bg-black border border-orange-900"><div className="h-full bg-orange-600" style={{ width: `${Math.max(0.5, galaxyPct)}%` }} /></div>
          <div className="text-orange-700 text-[10px] mt-1">{systemsVisited.toLocaleString()} / {GALAXY_SIZE.toLocaleString()} systems</div>
        </div>
      </div>

      <div className="border border-orange-900 p-4 space-y-2">
        <h3 className="text-orange-500 text-sm font-bold uppercase flex items-center gap-2"><Award className="w-4 h-4" /> First Discoveries ({firstDiscoveries.filter(isEarned).length}/{firstDiscoveries.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {firstDiscoveries.map(renderAchievement)}
        </div>
      </div>

      <div className="border border-orange-900 p-4 space-y-2">
        <h3 className="text-orange-500 text-sm font-bold uppercase flex items-center gap-2"><Trophy className="w-4 h-4" /> Milestones ({milestones.filter(isEarned).length}/{milestones.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {milestones.map(renderAchievement)}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="border border-orange-950 p-2">
      <div className="text-orange-700 text-[10px] uppercase flex items-center gap-1">{Icon && <Icon className="w-2.5 h-2.5" />} {label}</div>
      <div className="text-orange-300 font-bold">{value}</div>
    </div>
  );
}