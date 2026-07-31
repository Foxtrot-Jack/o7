// Navigation bar — dropdown-grouped access to all screens
import React, { useState, useRef, useEffect } from 'react';
import { Compass, Store, Package, ClipboardList, Pickaxe, Telescope, Home, Map, Rocket, Layers, Anchor, Trophy, Settings, Wrench, MapPin, TrendingUp, User, Hammer, BookOpen, Briefcase, ChevronDown, Lock, Sparkles, Medal } from 'lucide-react';
import { useGameState } from '@/lib/gameState';

const NAV_GROUPS = [
  {
    id: 'explore', label: 'Explore', icon: Compass, align: 'left',
    items: [
      { id: 'galaxy', label: 'Galaxy Map', icon: Map },
      { id: 'system', label: 'System', icon: Compass },
      { id: 'exploration', label: 'Exploration', icon: Telescope },
      { id: 'survey', label: 'Surface Survey', icon: MapPin },
    ],
  },
  {
    id: 'station', label: 'Station', icon: Home, align: 'left', stationOnly: true,
    items: [
      { id: 'station', label: 'Station Services', icon: Home },
      { id: 'market', label: 'Market', icon: Store },
      { id: 'outfitting', label: 'Outfitting', icon: Wrench },
    ],
  },
  {
    id: 'commerce', label: 'Commerce', icon: TrendingUp, align: 'left',
    items: [
      { id: 'trade', label: 'Trade Tools', icon: TrendingUp },
      { id: 'company', label: 'Company', icon: Briefcase },
      { id: 'missions', label: 'Missions', icon: ClipboardList },
    ],
  },
  {
    id: 'fleet', label: 'Fleet', icon: Package, align: 'left',
    items: [
      { id: 'ship', label: 'Ship', icon: Package },
      { id: 'fleet', label: 'Fleet Manager', icon: Layers },
      { id: 'carriers', label: 'Fleet Carriers', icon: Anchor },
      { id: 'shipcreator', label: 'Ship Yard', icon: Hammer },
    ],
  },
  {
    id: 'industry', label: 'Industry', icon: Pickaxe, align: 'right',
    items: [
      { id: 'mining', label: 'Mining', icon: Pickaxe },
      { id: 'colonization', label: 'Colonies', icon: Rocket },
    ],
  },
  {
    id: 'commander', label: 'Commander', icon: User, align: 'right',
    items: [
      { id: 'achievements', label: 'Awards', icon: Trophy },
      { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'codex', label: 'Codex', icon: BookOpen },
      { id: 'cheats', label: 'Cheats', icon: Sparkles },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const STATION_ONLY_SCREENS = ['station', 'market', 'outfitting'];

export default function NavBar({ currentScreen, onNavigate, location }) {
  const [openGroup, setOpenGroup] = useState(null);
  const navRef = useRef(null);
  const { state } = useGameState();

  useEffect(() => {
    if (!openGroup) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openGroup]);

  const handleItemClick = (item) => {
    const isStationOnly = STATION_ONLY_SCREENS.includes(item.id);
    if (isStationOnly && location !== 'station') return;
    onNavigate(item.id);
    setOpenGroup(null);
  };

  return (
    <nav ref={navRef} className="relative z-50 flex items-center gap-1 px-2 py-1.5 border-b border-orange-900/50 bg-black">
      {NAV_GROUPS.map((group) => {
        const Icon = group.icon;
        const hasActive = group.items.some(i => i.id === currentScreen);
        const groupDisabled = group.stationOnly && location !== 'station';
        const isOpen = openGroup === group.id;

        return (
          <div key={group.id} className="relative flex-shrink-0">
            <button
              onClick={() => !groupDisabled && setOpenGroup(isOpen ? null : group.id)}
              disabled={groupDisabled}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs whitespace-nowrap border transition-all ${
                hasActive
                  ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                  : groupDisabled
                    ? 'border-gray-800 text-gray-700 cursor-not-allowed'
                    : isOpen
                      ? 'border-orange-700 bg-orange-950/30 text-orange-300'
                      : 'border-transparent text-orange-600 hover:border-orange-800 hover:text-orange-400'
              }`}
              title={groupDisabled ? 'Dock at a station to access' : group.label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{group.label}</span>
              {groupDisabled ? <Lock className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className={`w-2.5 h-2.5 ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && !groupDisabled && (
              <div className={`absolute top-full ${group.align === 'right' ? 'right-0' : 'left-0'} mt-0.5 min-w-[150px] border border-orange-800 bg-black z-50 shadow-lg shadow-black`}>
                {group.items.map((item) => {
                  if (item.id === 'cheats' && !state.cheats?.unlocked) return null;
                  const ItemIcon = item.icon;
                  const itemDisabled = STATION_ONLY_SCREENS.includes(item.id) && location !== 'station';
                  const itemActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      disabled={itemDisabled}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs whitespace-nowrap text-left border-b border-orange-950/50 last:border-b-0 transition-all ${
                        itemActive
                          ? 'bg-orange-950/40 text-orange-300'
                          : itemDisabled
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-orange-600 hover:bg-orange-950/30 hover:text-orange-400'
                      }`}
                    >
                      <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}