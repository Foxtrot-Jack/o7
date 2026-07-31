// Achievements & Exploration Progress
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Trophy, Star, Globe, Map, Telescope, Award, Rocket, Ship } from 'lucide-react';

const DEFS = [
  { id: 'neutron_star', name: 'Neutron Star Pioneer', desc: 'First discovery of a neutron star', section: 'firstDiscoveries', icon: Star },
  { id: 'black_hole', name: 'Black Hole Voyager', desc: 'First discovery of a black hole', section: 'firstDiscoveries', icon: Star },
  { id: 'ammonia_world', name: 'Ammonia World Discoverer', desc: 'First discovery of an ammonia world', section: 'firstDiscoveries', icon: Globe },
  { id: 'earth_like', name: 'Earth-Like Finder', desc: 'First discovery of an Earth-like world', section: 'firstDiscoveries', icon: Globe },
  { id: 'water_world', name: 'Water World Surveyor', desc: 'First discovery of a water world', section: 'firstDiscoveries', icon: Globe },
  { id: 'habitable_world', name: 'Habitable World Trailblazer', desc: 'First discovery of a habitable world', section: 'firstDiscoveries', icon: Globe },
  { id: 'first_carrier', name: 'Fleet Commander', desc: 'Purchased your first fleet carrier', section: 'milestones', icon: Ship },
  { id: 'first_colony', name: 'Colonial Pioneer', desc: 'Established your first colony', section: 'milestones', icon: Rocket },
];

const GALAXY_SIZE = 4000000000;

export default function AchievementsScreen() {
  const { state } = useGameState();
  const ach = state.achievements || {};
  const systemsVisited = Object.keys(state.discoveredSystems || {}).length;
  const bodiesScanned = Object.keys(state.scannedBodies || {}).length;
  const systemsScanned = ach.systemsScanned || 0;
  const galaxyPct = (systemsVisited / GALAXY_SIZE) * 100;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Commander Achievements</h2>
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
        <h3 className="text-orange-500 text-sm font-bold uppercase flex items-center gap-2"><Award className="w-4 h-4" /> First Discoveries & Milestones</h3>
        {DEFS.map(d => {
          const data = ach[d.section]?.[d.id];
          const earned = !!data;
          const Icon = d.icon;
          return (
            <div key={d.id} className={`border p-2 flex items-center gap-3 ${earned ? 'border-orange-600' : 'border-orange-950 opacity-50'}`}>
              <Icon className={`w-5 h-5 ${earned ? 'text-orange-400' : 'text-orange-800'}`} />
              <div className="flex-1">
                <div className={`text-xs font-bold ${earned ? 'text-orange-300' : 'text-orange-700'}`}>{d.name}</div>
                <div className="text-[10px] text-orange-700">{d.desc}</div>
                {earned && data.system && <div className="text-[10px] text-green-600">✓ Found in {data.system}</div>}
                {earned && !data.system && <div className="text-[10px] text-green-600">✓ Achieved</div>}
              </div>
              {earned && <span className="text-green-500 text-lg">✓</span>}
            </div>
          );
        })}
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