// Navigation bar — provides access to all screens from any screen
import React from 'react';
import { Compass, Store, Package, ClipboardList, Pickaxe, Telescope, Home, Map, Rocket, Layers, Anchor, Trophy, Settings, Wrench, MapPin, TrendingUp } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'galaxy', label: 'Galaxy Map', icon: Map },
  { id: 'system', label: 'System', icon: Compass },
  { id: 'exploration', label: 'Exploration', icon: Telescope },
  { id: 'station', label: 'Station', icon: Home },
  { id: 'market', label: 'Market', icon: Store },
  { id: 'ship', label: 'Ship', icon: Package },
  { id: 'fleet', label: 'Fleet', icon: Layers },
  { id: 'carriers', label: 'Carriers', icon: Anchor },
  { id: 'missions', label: 'Missions', icon: ClipboardList },
  { id: 'mining', label: 'Mining', icon: Pickaxe },
  { id: 'colonization', label: 'Colonies', icon: Rocket },
  { id: 'achievements', label: 'Awards', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'outfitting', label: 'Outfitting', icon: Wrench },
  { id: 'survey', label: 'Survey', icon: MapPin },
  { id: 'trade', label: 'Trade', icon: TrendingUp },
];

export default function NavBar({ currentScreen, onNavigate, location }) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 border-b border-orange-900/50 bg-black">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        const isStationOnly = ['station', 'market'].includes(item.id);
        const isDisabled = isStationOnly && location !== 'station';

        return (
          <button
            key={item.id}
            onClick={() => !isDisabled && onNavigate(item.id)}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap border transition-all ${
              isActive
                ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                : isDisabled
                  ? 'border-gray-800 text-gray-700 cursor-not-allowed'
                  : 'border-transparent text-orange-600 hover:border-orange-800 hover:text-orange-400'
            }`}
            title={isDisabled ? 'Dock at a station to access' : item.label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}