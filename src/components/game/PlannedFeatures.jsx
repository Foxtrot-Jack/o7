// Planned Features — roadmap of upcoming systems.
import React from 'react';
import { ListChecks } from 'lucide-react';

const PLANNED = [
  'Multi-crew cooperative ship operations',
  'Expanded BGS faction warfare and territory control',
  'Player-owned station economies and trade routes',
  'Deeper engineering blueprint tree',
  'Procedural mission chains with branching outcomes',
  'Surface vehicle expansion and rover upgrades',
  'Galactic leaderboard seasons and rewards',
];

export default function PlannedFeatures() {
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <ListChecks className="w-4 h-4" /> Planned Features
      </div>
      {PLANNED.map(f => (
        <div key={f} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs text-orange-500">
          <ListChecks className="w-3.5 h-3.5 text-orange-700" /> {f}
        </div>
      ))}
    </div>
  );
}