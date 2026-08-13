// Station Contacts — sub-service directory for the docked station.
import React from 'react';
import { Users, Building, Crosshair, Skull, LifeBuoy, Rocket, ArrowLeftRight } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

export default function StationContacts({ onNavigate }) {
  const { state } = useGameState();
  const sysData = state.currentSystemData;
  // Materials trader availability — present in higher-economy systems
  const hasMaterialTrader = (sysData?.economy?.name && /Industrial|Mining|Refinery|High Tech/i.test(sysData.economy.name)) || state.saveMode === 'sandbox';

  const items = [
    { id: 'administration', label: 'Administration', icon: Building, dev: true },
    { id: 'bountyboard', label: 'Combat Bonds', icon: Crosshair },
    { id: 'blackmarket', label: 'Black Market', icon: Skull },
    { id: 'searchrescue', label: 'Search & Rescue', icon: LifeBuoy, dev: true },
    { id: 'colonization', label: 'Colonization', icon: Rocket },
    { id: 'materialtrader', label: 'Materials Trader', icon: ArrowLeftRight, disabled: !hasMaterialTrader },
  ];

  return (
    <div className="w-full h-full overflow-auto p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <Users className="w-4 h-4" /> Station Contacts
      </div>
      {items.map(it => {
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            disabled={it.disabled}
            onClick={() => onNavigate(it.id)}
            className={`flex items-center gap-2 w-full px-3 py-2 border text-xs ${it.disabled ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-orange-800 text-orange-400 hover:bg-orange-950/30'}`}
          >
            <Icon className="w-3.5 h-3.5" /> {it.label}
            {it.dev && <span className="ml-auto text-[8px] text-orange-800 uppercase">DEV</span>}
            {it.disabled && <span className="ml-auto text-[8px] text-gray-700 uppercase">N/A</span>}
          </button>
        );
      })}
    </div>
  );
}