// Features In Progress — lists features currently under development.
import React from 'react';
import { Cpu } from 'lucide-react';

const IN_PROGRESS = [
  'Faction Assignments — faction-specific mission chains',
  'Commander Disembarkment — on-foot exploration',
  'Refinery — refined material processing view',
  'Session Log — per-session activity history',
  'Station Contacts: Administration, Combat Bonds, Search & Rescue',
  'Livery — ship paint color application across all screens',
  'Mission Board — filterable station mission list',
  'Passenger Lounge — group & personal transport contracts',
  'Contacts — fly-to combat with confirmation toggle',
];

export default function FeaturesInProgress() {
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Cpu className="w-4 h-4" /> Features In Progress
      </div>
      {IN_PROGRESS.map(f => (
        <div key={f} className="flex items-center gap-2 border border-orange-900 bg-black/60 px-3 py-2 text-xs text-orange-500">
          <Cpu className="w-3.5 h-3.5 text-orange-700" /> {f}
        </div>
      ))}
    </div>
  );
}