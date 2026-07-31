// Discovery Database — track all discovered stellar, planetary, and biological phenomena
import React, { useMemo } from 'react';
import { useGameState } from '@/lib/gameState';
import { STAR_CLASSES, PLANET_TYPES, SPECIAL_DISCOVERIES, getDiscoveryStats } from '@/lib/codexDatabase';
import { BookOpen, Star, Globe, Leaf, Award, CheckCircle, Circle } from 'lucide-react';

export default function DiscoveryDatabase() {
  const { state } = useGameState();
  const achievements = state.achievements || {};
  const codex = state.exobiologyCodex || {};
  const fd = achievements.firstDiscoveries || {};

  const stats = useMemo(() => getDiscoveryStats(achievements, codex), [achievements, codex]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Discovery Database</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">A living record of every stellar body, planet type, and biological species you've encountered across the galaxy.</div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox icon={Star} label="Bodies Scanned" value={stats.bodiesScanned} />
        <StatBox icon={Globe} label="Systems Surveyed" value={stats.systemsScanned} />
        <StatBox icon={Award} label="First Discoveries" value={Object.keys(fd).length} />
        <StatBox icon={Leaf} label="Species Catalogued" value={stats.species.found} />
      </div>

      {/* Stellar bodies */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-500 text-xs font-bold uppercase">Stellar Bodies ({stats.stars.found}/{stats.stars.total})</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {STAR_CLASSES.map(s => {
            const found = fd[`star_${s.id}`];
            return (
              <div key={s.id} className={`border p-1.5 text-[10px] flex items-center gap-1 ${found ? 'border-green-900 text-green-400' : 'border-orange-950 text-orange-800'}`}>
                {found ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Circle className="w-3 h-3" />}
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: found ? `0 0 3px ${s.color}` : 'none' }} />
                <span className="truncate">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planet types */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-500 text-xs font-bold uppercase">Planet Types ({stats.planets.found}/{stats.planets.total})</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {PLANET_TYPES.map(p => {
            const found = fd[`planet_${p.id}`];
            return (
              <div key={p.id} className={`border p-1.5 text-[10px] flex items-center gap-1 ${found ? 'border-green-900 text-green-400' : 'border-orange-950 text-orange-800'}`}>
                {found ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Circle className="w-3 h-3" />}
                <span className="truncate">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special discoveries */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-500 text-xs font-bold uppercase">Milestones ({stats.special.found}/{stats.special.total})</h3>
        </div>
        <div className="space-y-1">
          {SPECIAL_DISCOVERIES.map(s => {
            const found = s.check(achievements);
            const entry = found ? (fd[s.id] || fd[s.id.replace(/_/g, '_')] || Object.values(fd).find(v => v && typeof v === 'object')) : null;
            return (
              <div key={s.id} className={`border p-1.5 text-[10px] flex items-center gap-2 ${found ? 'border-yellow-800 text-yellow-400' : 'border-orange-950 text-orange-800'}`}>
                {found ? <CheckCircle className="w-3 h-3 text-yellow-500" /> : <Circle className="w-3 h-3" />}
                <span>{s.name}</span>
                {found && entry?.system && <span className="text-orange-700 ml-auto">@ {entry.system}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Biological species */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-500 text-xs font-bold uppercase">Biological Species ({stats.species.found}/{stats.species.total})</h3>
        </div>
        <div className="space-y-1">
          {Object.entries(codex).length > 0 ? (
            Object.entries(codex).map(([id, entry]) => (
              <div key={id} className="border border-green-900 p-1.5 text-[10px] flex items-center justify-between text-green-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{entry.speciesName}</span>
                  <span className="text-orange-700">×{entry.count}</span>
                </div>
                <span className="text-orange-700">First: {entry.firstSystem}</span>
              </div>
            ))
          ) : (
            <div className="text-orange-700 text-[10px] text-center py-2">No species discovered. Land on bodies with biological signals and use the Exobiology scanner.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="border border-orange-950 p-2">
      <div className="text-orange-700 text-[10px] uppercase flex items-center gap-1">{Icon && <Icon className="w-2.5 h-2.5" />}{label}</div>
      <div className="text-orange-300 font-bold text-sm">{value}</div>
    </div>
  );
}