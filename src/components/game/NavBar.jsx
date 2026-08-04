// Navigation bar — ED4-style six-tab menu flow (Internal, External, Cons, Role, Misc, Settings)
import React, { useState, useRef, useEffect } from 'react';
import { Package, Crosshair, Users, User, LayoutGrid, Settings, Cpu, Radar, Boxes, Map, Compass, Telescope, Radio, MapPin, Store, ScrollText, Wrench, FlaskConical, ArrowLeftRight, Anchor, Route, LayoutDashboard, Hammer, DoorOpen, Layers, Plane, ClipboardList, ListChecks, TrendingUp, Brain, Briefcase, Skull, UserCheck, Newspaper, Activity, Crown, AlertTriangle, Target, Calendar, Zap, BookOpen, Sparkles, Medal, Palette, Award, Trophy, Pickaxe, Rocket, Building, Network, Fish, Leaf, Eye, Gamepad2, ChevronDown, Lock, Save, Swords, Gem } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { soundEngine } from '@/lib/soundEngine';
import { getNavGroupStyle } from '@/components/game/MenuTextStyleSettings';

const NAV_TABS = [
  {
    id: 'internal', label: 'Internal', icon: Cpu, align: 'left',
    folders: [
      {
        label: 'Navigation', items: [
          { id: 'galaxy', label: 'Galaxy Map', icon: Map },
          { id: 'system', label: 'System', icon: Compass },
        ],
      },
      {
        label: 'Modules', items: [
          { id: 'outfitting', label: 'Outfitting', icon: Wrench },
          { id: 'engineering', label: 'Engineering', icon: FlaskConical },
          { id: 'synthesis', label: 'Synthesis', icon: FlaskConical },
          { id: 'materialtrader', label: 'Material Trader', icon: ArrowLeftRight },
          { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        ],
      },
      {
        label: 'Ship', items: [
          { id: 'ship', label: 'Ship', icon: Package },
          { id: 'shipcreator', label: 'Ship Yard', icon: Hammer },
          { id: 'presets', label: 'Loadout Presets', icon: Save },
        ],
      },
      {
        label: 'Data', items: [
          { id: 'exploration', label: 'Exploration', icon: Telescope },
          { id: 'cartography', label: 'Cartographics', icon: ScrollText },
        ],
      },
    ],
  },
  {
    id: 'external', label: 'External', icon: Radar, align: 'left',
    folders: [
      {
        label: 'Deployed', items: [
          { id: 'fighters', label: 'Fighter Hangar', icon: Plane },
          { id: 'srv', label: 'SRV Rover', icon: MapPin },
        ],
      },
      {
        label: 'Squadron', items: [
          { id: 'fleet', label: 'Fleet Manager', icon: Layers },
          { id: 'wingmates', label: 'Wingmates', icon: Users },
          { id: 'multicrew', label: 'Multi-Crew', icon: Users },
          { id: 'crew', label: 'Crew Quarters', icon: Users },
        ],
      },
      {
        label: 'Field Ops', items: [
          { id: 'mining', label: 'Mining', icon: Pickaxe },
          { id: 'res', label: 'Mining Sites', icon: Gem },
          { id: 'piracy', label: 'Piracy', icon: Skull },
          { id: 'conflictzone', label: 'Conflict Zones', icon: Swords },
        ],
      },
      {
        label: 'Scanning', items: [
          { id: 'fss', label: 'FSS Scanner', icon: Radio },
          { id: 'survey', label: 'Surface Survey', icon: MapPin },
          { id: 'exobiology', label: 'Exobiology', icon: Leaf },
        ],
      },
    ],
  },
  {
    id: 'cons', label: 'Cons', icon: Store, align: 'left',
    items: [
      { id: 'station', label: 'Station Services', icon: Store },
    ],
    folders: [
      {
        label: 'Missions', items: [
          { id: 'missions', label: 'Missions', icon: ClipboardList },
          { id: 'chains', label: 'Mission Chains', icon: ListChecks },
          { id: 'bountyboard', label: 'Bounty Board', icon: Crosshair },
          { id: 'passengers', label: 'Passenger Lounge', icon: UserCheck },
        ],
      },
      {
        label: 'Trade', items: [
          { id: 'market', label: 'Market', icon: Store },
          { id: 'marketai', label: 'Market Analysis', icon: Brain },
          { id: 'trade', label: 'Trade Tools', icon: TrendingUp },
          { id: 'blackmarket', label: 'Black Market', icon: Skull },
          { id: 'company', label: 'Company', icon: Briefcase },
        ],
      },
      {
        label: 'World', items: [
          { id: 'galnet', label: 'StarNet News', icon: Newspaper },
          { id: 'bgs', label: 'Faction Status', icon: Activity },
          { id: 'powerplay', label: 'Power Play', icon: Crown },
          { id: 'crime', label: 'Crime Status', icon: AlertTriangle },
          { id: 'goals', label: 'Community Goals', icon: Target },
          { id: 'holidays', label: 'Public Holidays', icon: Calendar },
          { id: 'events', label: 'Cosmic Events', icon: Zap },
        ],
      },
    ],
  },
  {
    id: 'role', label: 'Role', icon: Medal, align: 'right',
    folders: [
      {
        label: 'Identity', items: [
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'titles', label: 'Titles', icon: Medal },
          { id: 'rep', label: 'Reputation', icon: Award },
          { id: 'badgemaker', label: 'Badge Maker', icon: Palette },
        ],
      },
      {
        label: 'Progress', items: [
          { id: 'achievements', label: 'Awards', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
        ],
      },
      {
        label: 'Reference', items: [
          { id: 'codex', label: 'Codex', icon: BookOpen },
          { id: 'discoveries', label: 'Discoveries', icon: BookOpen },
        ],
      },
    ],
  },
  {
    id: 'misc', label: 'Misc', icon: Boxes, align: 'right',
    folders: [
      {
        label: 'Colonization', items: [
          { id: 'colonization', label: 'Colonies', icon: Rocket },
          { id: 'stationbuilder', label: 'Station Builder', icon: Building },
          { id: 'stationcreator', label: 'Station Creator', icon: Hammer },
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
        label: 'Infrastructure', items: [
          { id: 'warpgates', label: 'Warp Gates', icon: Network },
          { id: 'canisstella', label: 'Canis Stella', icon: Building },
        ],
      },
      {
        label: 'Extras', items: [
          { id: 'cheats', label: 'Cheats', icon: Sparkles },
        ],
      },
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: Settings, align: 'right',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'controllerconfig', label: 'Controller Config', icon: Gamepad2 },
    ],
  },
];

const STATION_ONLY_SCREENS = ['station', 'market', 'outfitting', 'materialtrader', 'synthesis', 'crew', 'blackmarket', 'engineering', 'bountyboard', 'passengers', 'multicrew', 'cartography', 'maintenance'];
const CARRIER_REQUIRED_SCREENS = ['carriercreator'];

// Flatten all items from a tab (whether foldered or flat) for active-check
function getAllItems(tab) {
  const flat = tab.items || [];
  if (tab.folders) return [...flat, ...tab.folders.flatMap(f => f.items)];
  return flat;
}

export default function NavBar({ currentScreen, onNavigate, location, tutorialTarget }) {
  const [openTab, setOpenTab] = useState(null);
  const [openSubfolder, setOpenSubfolder] = useState(null);
  const navRef = useRef(null);
  const { state } = useGameState();
  const navTextRGB = state.settings?.navTextRGB || null;
  const navShadow = navTextRGB
    ? `0 0 3px rgba(${navTextRGB.r},${navTextRGB.g},${navTextRGB.b},0.8), 0 0 6px rgba(${navTextRGB.r},${navTextRGB.g},${navTextRGB.b},0.4)`
    : undefined;
  const navGroupStyles = state.settings?.navGroupStyles || {};

  // Tutorial: auto-open the relevant tab/folder to reveal the highlighted item
  useEffect(() => {
    if (!tutorialTarget) return;
    if (tutorialTarget.tab) {
      setOpenTab(tutorialTarget.tab);
      if (tutorialTarget.folder) {
        setOpenSubfolder(`${tutorialTarget.tab}:${tutorialTarget.folder}`);
      } else {
        setOpenSubfolder(null);
      }
    }
  }, [tutorialTarget]);

  // Click-outside closes dropdowns — disabled while a tutorial target is active
  useEffect(() => {
    if (!openTab || tutorialTarget) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenTab(null);
        setOpenSubfolder(null);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openTab, tutorialTarget]);

  const handleItemClick = (item) => {
    const isStationOnly = STATION_ONLY_SCREENS.includes(item.id);
    if (isStationOnly && location !== 'station') { soundEngine.play('error'); return; }
    const isCarrierRequired = CARRIER_REQUIRED_SCREENS.includes(item.id);
    if (isCarrierRequired && (state.fleetCarriers || []).length === 0) { soundEngine.play('error'); return; }
    soundEngine.play('click');
    onNavigate(item.id);
    if (!tutorialTarget) {
      setOpenTab(null);
      setOpenSubfolder(null);
    }
  };

  const handleTabClick = (tab) => {
    const isOpen = openTab === tab.id;
    soundEngine.play(isOpen ? 'back' : 'select');
    setOpenTab(isOpen ? null : tab.id);
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

  const renderItem = (item, tutTarget) => {
    if (item.id === 'cheats' && !state.cheats?.unlocked) return null;
    const ItemIcon = item.icon;
    const itemDisabled = isItemDisabled(item.id);
    const itemActive = currentScreen === item.id;
    const tutItem = tutTarget?.item === item.id;
    return (
      <button
        key={item.id}
        data-tut-item={item.id}
        onClick={() => handleItemClick(item)}
        disabled={itemDisabled}
        className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs whitespace-nowrap text-left border-b border-orange-950/50 last:border-b-0 transition-all ${
          itemActive
            ? 'bg-orange-950/40 text-orange-300'
            : itemDisabled
              ? 'text-gray-700 cursor-not-allowed'
              : 'text-orange-600 hover:bg-orange-950/30 hover:text-orange-400'
        } ${tutItem ? 'ring-1 ring-cyan-400 animate-pulse' : ''}`}
      >
        <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{item.label}</span>
        {itemDisabled && <Lock className="w-2.5 h-2.5 ml-auto" />}
      </button>
    );
  };

  return (
    <nav ref={navRef} className="relative z-[100] flex flex-col border-b border-orange-900/50 bg-black" style={{ zoom: (state.settings?.uiScale?.navPanel ?? 100) / 100, textShadow: navShadow, fontFamily: "var(--crt-font, 'Courier New', 'Lucida Console', monospace)" }}>
      {/* Tab bar — each tab owns its dropdown so panels anchor under their parent.
          overflow-visible (not overflow-x-auto) so dropdown panels are not clipped
          vertically — setting one axis to auto forces the other to auto too, which
          would cut off the dropdown. */}
      <div className="flex items-stretch overflow-visible">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const allItems = getAllItems(tab);
          const hasActive = allItems.some(i => i.id === currentScreen);
          const isOpen = openTab === tab.id;
          const gs = getNavGroupStyle(navGroupStyles, tab.id);
          const gsShadow = gs.rgb ? `0 0 3px rgba(${gs.rgb.r},${gs.rgb.g},${gs.rgb.b},0.8), 0 0 6px rgba(${gs.rgb.r},${gs.rgb.g},${gs.rgb.b},0.4)` : undefined;
          const tabStyle = (gs.size !== 100 || gsShadow) ? { zoom: gs.size / 100, textShadow: gsShadow } : undefined;
          const tutTab = tutorialTarget?.tab === tab.id && !tutorialTarget?.item;

          return (
            <div key={tab.id} className="relative flex-shrink-0" style={tabStyle}>
              <button
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-all ${
                  hasActive
                    ? 'border-orange-500 bg-orange-950/30 text-orange-300'
                    : isOpen
                      ? 'border-orange-700 bg-orange-950/20 text-orange-300'
                      : 'border-transparent text-orange-600 hover:border-orange-800 hover:text-orange-400'
                } ${tutTab ? 'ring-1 ring-cyan-400 animate-pulse' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <ChevronDown className={`w-2.5 h-2.5 ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel — positioned under THIS tab */}
              {isOpen && (
                <div className={`absolute top-full ${tab.align === 'right' ? 'right-0' : 'left-0'} mt-0.5 min-w-[180px] max-h-[70vh] overflow-y-auto border border-orange-800 bg-black z-[100] shadow-lg shadow-black`}>
                  {/* Flat items (no folders) */}
                  {tab.items && tab.items.map(item => renderItem(item, tutorialTarget))}

                  {/* Foldered items with accordion expansion */}
                  {tab.folders && tab.folders.map((folder) => {
                    const folderKey = `${tab.id}:${folder.label}`;
                    const folderOpen = openSubfolder === folderKey;
                    const folderHasActive = folder.items.some(i => i.id === currentScreen);
                    return (
                      <div key={folder.label} className="border-b border-orange-950/50 last:border-b-0">
                        <button
                          onClick={() => handleFolderClick(folderKey)}
                          className={`flex items-center gap-1.5 w-full px-3 py-1.5 text-xs whitespace-nowrap text-left transition-all ${
                            folderHasActive
                              ? 'text-orange-300'
                              : folderOpen
                                ? 'text-orange-400 bg-orange-950/20'
                                : 'text-orange-700 hover:text-orange-500'
                          }`}
                        >
                          <span className={`inline-block w-2 text-center transition-transform ${folderOpen ? 'rotate-90' : ''}`}>&#9656;</span>
                          <span>{folder.label}</span>
                          <span className="ml-auto text-orange-800">{folder.items.length}</span>
                        </button>
                        {folderOpen && (
                          <div className="bg-black/50">
                            {folder.items.map(item => renderItem(item, tutorialTarget))}
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
      </div>
    </nav>
  );
}