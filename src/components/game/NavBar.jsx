// Navigation bar — dropdown-grouped access with nested subfolder accordions
import React, { useState, useRef, useEffect } from 'react';
import { Compass, Store, Package, ClipboardList, Pickaxe, Telescope, Home, Map, Rocket, Layers, Anchor, Trophy, Settings, Wrench, MapPin, TrendingUp, User, Hammer, BookOpen, Briefcase, ChevronDown, Lock, Sparkles, Medal, Palette, DoorOpen, ArrowLeftRight, FlaskConical, Users, Crown, Target, Skull, Newspaper, Crosshair, Swords, AlertTriangle, Gem, UserCheck, Building, ScrollText, Plane, Activity, Leaf, Route, Radio, ListChecks, Award, Save, Brain, LayoutDashboard, Network, Eye, Fish, Calendar, Gamepad2, Zap } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { soundEngine } from '@/lib/soundEngine';
import { getNavGroupStyle } from '@/components/game/MenuTextStyleSettings';

const NAV_GROUPS = [
  {
    id: 'explore', label: 'Explore', icon: Compass, align: 'left',
    folders: [
      {
        label: 'Navigation', items: [
          { id: 'galaxy', label: 'Galaxy Map', icon: Map },
          { id: 'system', label: 'System', icon: Compass },
        ],
      },
      {
        label: 'Scanning', items: [
          { id: 'exploration', label: 'Exploration', icon: Telescope },
          { id: 'fss', label: 'FSS Scanner', icon: Radio },
          { id: 'survey', label: 'Surface Survey', icon: MapPin },
          { id: 'srv', label: 'SRV Rover', icon: Crosshair },
        ],
      },
      {
        label: 'Field Ops', items: [
          { id: 'conflictzone', label: 'Conflict Zones', icon: Swords },
          { id: 'res', label: 'Mining Sites', icon: Gem },
          { id: 'piracy', label: 'Piracy', icon: Skull },
          { id: 'exobiology', label: 'Exobiology', icon: Leaf },
        ],
      },
    ],
  },
  {
    id: 'station', label: 'Station', icon: Home, align: 'left', stationOnly: true,
    folders: [
      {
        label: 'Services', items: [
          { id: 'station', label: 'Station Services', icon: Home },
          { id: 'market', label: 'Market', icon: Store },
          { id: 'cartography', label: 'Cartographics', icon: ScrollText },
          { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        ],
      },
      {
        label: 'Outfitting', items: [
          { id: 'outfitting', label: 'Outfitting', icon: Wrench },
          { id: 'engineering', label: 'Engineering', icon: FlaskConical },
          { id: 'synthesis', label: 'Synthesis', icon: FlaskConical },
          { id: 'materialtrader', label: 'Material Trader', icon: ArrowLeftRight },
        ],
      },
      {
        label: 'Personnel', items: [
          { id: 'multicrew', label: 'Multi-Crew', icon: Users },
          { id: 'crew', label: 'Crew Quarters', icon: Users },
          { id: 'passengers', label: 'Passenger Lounge', icon: UserCheck },
        ],
      },
      {
        label: 'Underworld', items: [
          { id: 'blackmarket', label: 'Black Market', icon: Skull },
          { id: 'bountyboard', label: 'Bounty Board', icon: Crosshair },
        ],
      },
    ],
  },
  {
    id: 'commerce', label: 'Commerce', icon: TrendingUp, align: 'left',
    items: [
      { id: 'missions', label: 'Missions', icon: ClipboardList },
      { id: 'chains', label: 'Mission Chains', icon: ListChecks },
      { id: 'trade', label: 'Trade Tools', icon: TrendingUp },
      { id: 'marketai', label: 'Market Analysis', icon: Brain },
      { id: 'company', label: 'Company', icon: Briefcase },
    ],
  },
  {
    id: 'fleet', label: 'Fleet', icon: Package, align: 'left',
    folders: [
      {
        label: 'Ship', items: [
          { id: 'ship', label: 'Ship', icon: Package },
          { id: 'presets', label: 'Loadout Presets', icon: Save },
          { id: 'shipcreator', label: 'Ship Yard', icon: Hammer },
        ],
      },
      {
        label: 'Carriers', items: [
          { id: 'carriers', label: 'Fleet Carriers', icon: Anchor },
          { id: 'carrierlogistics', label: 'Carrier Logistics', icon: Route },
          { id: 'carriercommand', label: 'Carrier Command', icon: LayoutDashboard },
          { id: 'carriercreator', label: 'Carrier Yard', icon: Hammer },
          { id: 'carrierinterior', label: 'Carrier Interior', icon: DoorOpen },
        ],
      },
      {
        label: 'Cabin', items: [
          { id: 'cabin', label: 'Cabin', icon: Eye },
          { id: 'roommanager', label: 'Room Manager', icon: LayoutDashboard },
          { id: 'aquarium', label: 'Aquarium', icon: Fish },
          { id: 'garden', label: 'Garden', icon: Leaf },
          { id: 'geneticslab', label: 'Genetics Lab', icon: FlaskConical },
        ],
      },
      {
        label: 'Squadron', items: [
          { id: 'fleet', label: 'Fleet Manager', icon: Layers },
          { id: 'wingmates', label: 'Wingmates', icon: Users },
          { id: 'fighters', label: 'Fighter Hangar', icon: Plane },
        ],
      },
      {
        label: 'Infrastructure', items: [
          { id: 'warpgates', label: 'Warp Gates', icon: Network },
        ],
      },
    ],
  },
  {
    id: 'industry', label: 'Industry', icon: Pickaxe, align: 'right',
    items: [
      { id: 'mining', label: 'Mining', icon: Pickaxe },
      { id: 'colonization', label: 'Colonies', icon: Rocket },
      { id: 'stationbuilder', label: 'Station Builder', icon: Building },
      { id: 'stationcreator', label: 'Station Creator', icon: Hammer },
    ],
  },
  {
    id: 'commander', label: 'Commander', icon: User, align: 'right',
    folders: [
      {
        label: 'Identity', items: [
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'titles', label: 'Titles', icon: Medal },
          { id: 'badgemaker', label: 'Badge Maker', icon: Palette },
          { id: 'rep', label: 'Reputation', icon: Award },
        ],
      },
      {
        label: 'Progress', items: [
          { id: 'achievements', label: 'Awards', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
          { id: 'goals', label: 'Community Goals', icon: Target },
        ],
      },
      {
        label: 'World', items: [
          { id: 'galnet', label: 'StarNet News', icon: Newspaper },
          { id: 'holidays', label: 'Public Holidays', icon: Calendar },
          { id: 'events', label: 'Cosmic Events', icon: Zap },
        ],
      },
      {
        label: 'Status', items: [
          { id: 'crime', label: 'Crime Status', icon: AlertTriangle },
          { id: 'bgs', label: 'Faction Status', icon: Activity },
          { id: 'powerplay', label: 'Power Play', icon: Crown },
          { id: 'canisstella', label: 'Canis Stella', icon: Building },
        ],
      },
      {
        label: 'Reference', items: [
          { id: 'codex', label: 'Codex', icon: BookOpen },
          { id: 'discoveries', label: 'Discoveries', icon: BookOpen },
          { id: 'cheats', label: 'Cheats', icon: Sparkles },
        ],
      },
      {
        label: 'System', items: [
          { id: 'controllerconfig', label: 'Controller Config', icon: Gamepad2 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ],
      },
    ],
  },
];

const STATION_ONLY_SCREENS = ['station', 'market', 'outfitting', 'materialtrader', 'synthesis', 'crew', 'blackmarket', 'engineering', 'bountyboard', 'passengers', 'multicrew', 'cartography'];
const CARRIER_REQUIRED_SCREENS = ['carriercreator'];

// Flatten all items from a group (whether foldered or flat) for active-check
function getAllItems(group) {
  if (group.folders) return group.folders.flatMap(f => f.items);
  return group.items || [];
}

export default function NavBar({ currentScreen, onNavigate, location }) {
  const [openGroup, setOpenGroup] = useState(null);
  const [openSubfolder, setOpenSubfolder] = useState(null);
  const navRef = useRef(null);
  const { state } = useGameState();
  const navTextRGB = state.settings?.navTextRGB || null;
  const navShadow = navTextRGB
    ? `0 0 3px rgba(${navTextRGB.r},${navTextRGB.g},${navTextRGB.b},0.8), 0 0 6px rgba(${navTextRGB.r},${navTextRGB.g},${navTextRGB.b},0.4)`
    : undefined;
  const navGroupStyles = state.settings?.navGroupStyles || {};

  useEffect(() => {
    if (!openGroup) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenGroup(null);
        setOpenSubfolder(null);
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
    if (isStationOnly && location !== 'station') { soundEngine.play('error'); return; }
    const isCarrierRequired = CARRIER_REQUIRED_SCREENS.includes(item.id);
    if (isCarrierRequired && (state.fleetCarriers || []).length === 0) { soundEngine.play('error'); return; }
    soundEngine.play('click');
    onNavigate(item.id);
    setOpenGroup(null);
    setOpenSubfolder(null);
  };

  const handleGroupClick = (group) => {
    const isOpen = openGroup === group.id;
    soundEngine.play(isOpen ? 'back' : 'select');
    setOpenGroup(isOpen ? null : group.id);
    setOpenSubfolder(null);
  };

  const handleFolderClick = (folderKey) => {
    const isOpen = openSubfolder === folderKey;
    soundEngine.play(isOpen ? 'back' : 'select');
    setOpenSubfolder(isOpen ? null : folderKey);
  };

  const isItemDisabled = (itemId) =>
    (STATION_ONLY_SCREENS.includes(itemId) && location !== 'station') ||
    (CARRIER_REQUIRED_SCREENS.includes(itemId) && (state.fleetCarriers || []).length === 0);

  const renderItem = (item) => {
    if (item.id === 'cheats' && !state.cheats?.unlocked) return null;
    const ItemIcon = item.icon;
    const itemDisabled = isItemDisabled(item.id);
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
        {itemDisabled && <Lock className="w-2.5 h-2.5 ml-auto" />}
      </button>
    );
  };

  return (
    <nav ref={navRef} className="relative z-[100] flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-orange-900/50 bg-black" style={{ zoom: (state.settings?.uiScale?.navPanel ?? 100) / 100, textShadow: navShadow }}>
      {NAV_GROUPS.map((group) => {
        const Icon = group.icon;
        const allItems = getAllItems(group);
        const hasActive = allItems.some(i => i.id === currentScreen);
        const groupDisabled = group.stationOnly && location !== 'station';
        const isOpen = openGroup === group.id;
        const gs = getNavGroupStyle(navGroupStyles, group.id);
        const gsShadow = gs.rgb ? `0 0 3px rgba(${gs.rgb.r},${gs.rgb.g},${gs.rgb.b},0.8), 0 0 6px rgba(${gs.rgb.r},${gs.rgb.g},${gs.rgb.b},0.4)` : undefined;
        const groupStyle = (gs.size !== 100 || gsShadow) ? { zoom: gs.size / 100, textShadow: gsShadow } : undefined;

        return (
          <div key={group.id} className="relative flex-shrink-0" style={groupStyle}>
            <button
              onClick={() => { if (!groupDisabled) handleGroupClick(group); }}
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
              <div className={`absolute top-full ${group.align === 'right' ? 'right-0' : 'left-0'} mt-0.5 min-w-[160px] max-h-[70vh] overflow-y-auto border border-orange-800 bg-black z-[100] shadow-lg shadow-black`}>
                {/* Flat items (no folders) */}
                {group.items && group.items.map(item => renderItem(item))}

                {/* Foldered items with accordion expansion */}
                {group.folders && group.folders.map((folder) => {
                  const folderKey = `${group.id}:${folder.label}`;
                  const folderOpen = openSubfolder === folderKey;
                  const folderHasActive = folder.items.some(i => i.id === currentScreen);
                  return (
                    <div key={folder.label} className="border-b border-orange-950/50 last:border-b-0">
                      <button
                        onClick={() => handleFolderClick(folderKey)}
                        className={`flex items-center gap-1.5 w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap text-left transition-all ${
                          folderHasActive
                            ? 'text-orange-300'
                            : folderOpen
                              ? 'text-orange-400 bg-orange-950/20'
                              : 'text-orange-700 hover:text-orange-500'
                        }`}
                      >
                        <span className={`inline-block w-2 text-center transition-transform ${folderOpen ? 'rotate-90' : ''}`}>▸</span>
                        <span>{folder.label}</span>
                        <span className="ml-auto text-orange-800">{folder.items.length}</span>
                      </button>
                      {folderOpen && (
                        <div className="bg-black/50">
                          {folder.items.map(item => renderItem(item))}
                        </div>
                      )}
                    </div>
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