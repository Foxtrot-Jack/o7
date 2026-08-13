// Navigation bar — 5-tab menu (Navigation, External, Deploy, Comms, Settings)
// Supports nested folders (3+ levels deep) via recursive rendering.
import React, { useState, useRef, useEffect } from 'react';
import { Package, Map, Cpu, MessageSquare, Settings, Compass, ClipboardList, Users, Swords, LayoutDashboard, User, Layers, Hammer, Anchor, Building, Newspaper, BookOpen, Globe, Trophy, Crosshair, Boxes, Activity, Plane, SlidersHorizontal, BarChart3, Eye, Briefcase, MapPin, Calendar, AlertTriangle, ListChecks, Award, Palette, Network, Radio, Sparkles, ChevronDown, Lock, ChevronRight } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { soundEngine } from '@/lib/soundEngine';
import { getNavGroupStyle } from '@/components/game/MenuTextStyleSettings';

const STATION_ONLY_SCREENS = ['station', 'market', 'outfitting', 'materialtrader', 'crew', 'blackmarket', 'engineering', 'bountyboard', 'passengers', 'multicrew', 'cartography', 'maintenance', 'dockcam', 'missionboard', 'stationcontacts', 'livery', 'advmaintenance', 'colonization'];
const CARRIER_REQUIRED_SCREENS = ['carriercreator'];

// ---- Nav tree definition ----
// node = item { id, label, icon } | folder { label, icon?, children: [node] }
const NAV_TABS = [
  {
    id: 'nav', label: 'Navigation', icon: Map, align: 'left',
    children: [
      {
        label: 'Navigation', icon: Compass, children: [
          { id: 'system', label: 'Orrery Contact List', icon: Compass },
          { id: 'galaxy', label: 'Galaxy Map', icon: Map },
          { id: 'system', label: 'Orrery Viewer', icon: Eye },
        ],
      },
      {
        label: 'Transactions', icon: ClipboardList, children: [
          { id: 'missions', label: 'Missions', icon: ClipboardList },
          { id: 'passengers', label: 'Passengers', icon: Users },
          { id: 'factionassignments', label: 'Faction Assignments', icon: ListChecks, dev: true },
          { id: 'holidays', label: 'Holidays', icon: Calendar },
          { id: 'bountyboard', label: 'Bounty Claims', icon: Crosshair },
          { id: 'crime', label: 'Fines & Personal Bounties', icon: AlertTriangle },
        ],
      },
      {
        label: 'Contacts', icon: Users, children: [
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'conflictzone', label: 'Conflict Zones', icon: Swords },
        ],
      },
    ],
  },
  {
    id: 'external', label: 'External', icon: Package, align: 'left',
    children: [
      {
        label: 'Home', icon: LayoutDashboard, children: [
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'ranks', label: 'Ranks', icon: Trophy },
          { label: 'Player Identity', icon: User, children: [
            { id: 'profile', label: 'Player Profile', icon: User },
            { id: 'titles', label: 'Player Titles', icon: Award },
            { id: 'rep', label: 'Player Reputation', icon: Award },
            { id: 'badgemaker', label: 'Badge Maker', icon: Palette },
          ]},
          { label: 'Fleet', icon: Layers, children: [
            { id: 'fleet', label: 'Fleet Manager', icon: Layers },
            { id: 'presets', label: 'Loadout Presets', icon: SlidersHorizontal },
            { id: 'shipcreator', label: 'Shipyard', icon: Hammer },
            { id: 'carriercreator', label: 'Carrier Yard', icon: Hammer },
            { id: 'warpgates', label: 'Warp Gates', icon: Network },
          ]},
          { label: 'Fleet Carriers', icon: Anchor, children: [
            { id: 'carriers', label: 'Carriers', icon: Anchor },
            { id: 'carrierlogistics', label: 'Carrier Logistics', icon: MapPin },
            { id: 'carriercommand', label: 'Carrier Command', icon: LayoutDashboard },
            { id: 'carrierinterior', label: 'Carrier Interior', icon: Package },
          ]},
          { label: 'Factions', icon: Building, children: [
            { id: 'canisstella', label: 'Canis Stella', icon: Building },
          ]},
          { id: 'galnet', label: 'News', icon: Newspaper },
          { label: 'Codex', icon: BookOpen, children: [
            { id: 'codex', label: 'Codex', icon: BookOpen },
            { id: 'discoveries', label: 'Discoveries', icon: BookOpen },
            { id: 'achievements', label: 'Awards', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboards', icon: Trophy },
            { label: 'World', icon: Globe, children: [
              { id: 'galnet', label: 'StarNet News', icon: Newspaper },
              { id: 'goals', label: 'Community Goals', icon: Trophy },
              { id: 'holidays', label: 'Public Holidays', icon: Calendar },
              { id: 'events', label: 'Cosmic Events', icon: Radio },
            ]},
          ]},
        ],
      },
      { id: 'modules', label: 'Modules', icon: Cpu },
      { id: 'firegroups', label: 'Fire Groups', icon: Crosshair },
      {
        label: 'Ship', icon: Package, children: [
          { id: 'shipfunctions', label: 'Functions', icon: Cpu },
          { id: 'flightassist', label: 'Flight Assistant', icon: Plane },
          { id: 'pilotprefs', label: 'Pilot Preferences', icon: SlidersHorizontal },
          { id: 'shipstats', label: 'Statistics', icon: BarChart3 },
          { label: 'Ship Cabin', icon: Eye, children: [
            { id: 'cabin', label: 'Cabin', icon: Eye },
            { id: 'roommanager', label: 'Room Manager', icon: LayoutDashboard },
            { id: 'aquarium', label: 'Aquarium', icon: Eye },
            { id: 'garden', label: 'Garden', icon: Boxes },
            { id: 'geneticslab', label: 'Genetics Lab', icon: Cpu },
          ]},
        ],
      },
      {
        label: 'Inventory', icon: Boxes, children: [
          { id: 'cargo', label: 'Ship Cargo', icon: Package },
          { id: 'refinery', label: 'Refinery', icon: Cpu, dev: true },
          { id: 'materialslocker', label: 'Materials', icon: Boxes },
          { id: 'synthesis', label: 'Synthesis', icon: Cpu },
          { id: 'passengers', label: 'Passengers', icon: Users },
        ],
      },
      {
        label: 'Statuses', icon: Activity, children: [
          { id: 'bgs', label: 'System Factions', icon: Activity },
          { id: 'rep', label: 'Reputation', icon: Award },
          { id: 'sessionlog', label: 'Session Log', icon: ClipboardList, dev: true },
          { label: 'Finance', icon: Briefcase, children: [
            { id: 'company', label: 'Company', icon: Briefcase },
            { id: 'marketai', label: 'Market Analysis', icon: BarChart3 },
            { id: 'trade', label: 'Trade Tools', icon: Map },
            { id: 'stationbuilder', label: 'Infrastructure', icon: Building },
          ]},
        ],
      },
    ],
  },
  {
    id: 'deploy', label: 'Deploy', icon: Cpu, align: 'left',
    items: [
      { id: 'disembark', label: 'Commander Disembarkment', icon: User, dev: true },
      { id: 'fighters', label: 'Fighter Hangar', icon: Plane },
      { id: 'srv', label: 'SRV Rover', icon: MapPin },
      { id: 'cheats', label: 'Extras', icon: Sparkles },
    ],
  },
  {
    id: 'comms', label: 'Comms', icon: MessageSquare, align: 'right', direct: 'comms',
  },
  {
    id: 'settings', label: 'Settings', icon: Settings, align: 'right',
    items: [
      { id: 'devfeatures', label: 'Features In Progress', icon: Cpu },
      { id: 'plannedfeatures', label: 'Planned Features', icon: ListChecks },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'controllerconfig', label: 'Controller Config', icon: Cpu },
    ],
  },
];

// Flatten a node tree into item ids
function flattenIds(nodes = []) {
  const out = [];
  for (const n of nodes) {
    if (n.id) out.push(n.id);
    if (n.children) out.push(...flattenIds(n.children));
  }
  return out;
}

export default function NavBar({ currentScreen, onNavigate, location, tutorialTarget }) {
  const [openTab, setOpenTab] = useState(null);
  const [openFolders, setOpenFolders] = useState({}); // key path -> bool
  const navRef = useRef(null);
  const { state } = useGameState();
  const navTextRGB = state.settings?.navTextRGB || null;
  const navShadow = navTextRGB
    ? `0 0 3px rgba(${navTextRGB.r},${navTextRGB.g},${navTextRGB.b},0.8), 0 0 6px rgba(${navTextRGB.r},${navTextRGB.g},${navTextRGB.b},0.4)`
    : undefined;
  const navGroupStyles = state.settings?.navGroupStyles || {};

  useEffect(() => {
    if (!tutorialTarget) return;
    if (tutorialTarget.tab) {
      setOpenTab(tutorialTarget.tab);
      setOpenFolders({});
    }
  }, [tutorialTarget]);

  useEffect(() => {
    if (!openTab || tutorialTarget) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenTab(null);
        setOpenFolders({});
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openTab, tutorialTarget]);

  const isItemDisabled = (itemId) =>
    (STATION_ONLY_SCREENS.includes(itemId) && location !== 'station') ||
    (CARRIER_REQUIRED_SCREENS.includes(itemId) && (state.fleetCarriers || []).length === 0);

  const handleItemClick = (item) => {
    if (isItemDisabled(item.id)) { soundEngine.play('error'); return; }
    if (item.id === 'cheats' && !state.cheats?.unlocked) { soundEngine.play('error'); return; }
    soundEngine.play('click');
    onNavigate(item.id);
    if (!tutorialTarget) { setOpenTab(null); setOpenFolders({}); }
  };

  const handleTabClick = (tab) => {
    if (tab.direct) {
      soundEngine.play('click');
      onNavigate(tab.direct);
      return;
    }
    const isOpen = openTab === tab.id;
    soundEngine.play(isOpen ? 'back' : 'select');
    setOpenTab(isOpen ? null : tab.id);
    setOpenFolders({});
  };

  const toggleFolder = (key) => {
    soundEngine.play('select');
    setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderItem = (item, depth) => {
    if (item.id === 'cheats' && !state.cheats?.unlocked) return null;
    const ItemIcon = item.icon;
    const disabled = isItemDisabled(item.id);
    const active = currentScreen === item.id;
    return (
      <button
        key={`${item.id}-${depth}-${item.label}`}
        data-tut-item={item.id}
        onClick={() => handleItemClick(item)}
        disabled={disabled}
        style={depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined}
        className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs whitespace-nowrap text-left border-b border-orange-950/50 last:border-b-0 transition-all ${
          active ? 'bg-orange-950/40 text-orange-300'
            : disabled ? 'text-gray-700 cursor-not-allowed'
            : 'text-orange-600 hover:bg-orange-950/30 hover:text-orange-400'
        }`}
      >
        <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{item.label}</span>
        {item.dev && <span className="ml-auto text-[8px] text-orange-800 uppercase">DEV</span>}
        {disabled && <Lock className="w-2.5 h-2.5 ml-auto" />}
      </button>
    );
  };

  const renderNode = (node, depth, parentKey) => {
    if (node.id !== undefined) return renderItem(node, depth);
    const key = `${parentKey}:${node.label}`;
    const open = !!openFolders[key];
    const childActive = flattenIds(node.children).includes(currentScreen);
    const FolderIcon = node.icon;
    return (
      <div key={key} className="border-b border-orange-950/50 last:border-b-0">
        <button
          onClick={() => toggleFolder(key)}
          style={depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined}
          className={`flex items-center gap-1.5 w-full px-3 py-1.5 text-xs whitespace-nowrap text-left transition-all ${
            childActive ? 'text-orange-300' : open ? 'text-orange-400 bg-orange-950/20' : 'text-orange-700 hover:text-orange-500'
          }`}
        >
          <ChevronRight className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-90' : ''}`} />
          {FolderIcon && <FolderIcon className="w-3.5 h-3.5 flex-shrink-0" />}
          <span>{node.label}</span>
        </button>
        {open && <div className="bg-black/50">{node.children.map(c => renderNode(c, depth + 1, key))}</div>}
      </div>
    );
  };

  return (
    <nav ref={navRef} className="relative z-[100] flex flex-col border-b border-orange-900/50 bg-black" style={{ zoom: (state.settings?.uiScale?.navPanel ?? 100) / 100, textShadow: navShadow, fontFamily: "var(--crt-font, 'Courier New', 'Lucida Console', monospace)" }}>
      <div className="flex items-stretch overflow-visible">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const allIds = tab.direct ? [tab.direct] : flattenIds([...(tab.items || []), ...(tab.children || [])]);
          const hasActive = allIds.includes(currentScreen);
          const isOpen = openTab === tab.id;
          const gs = getNavGroupStyle(navGroupStyles, tab.id);
          const gsShadow = gs.rgb ? `0 0 3px rgba(${gs.rgb.r},${gs.rgb.g},${gs.rgb.b},0.8), 0 0 6px rgba(${gs.rgb.r},${gs.rgb.g},${gs.rgb.b},0.4)` : undefined;
          const tabStyle = (gs.size !== 100 || gsShadow) ? { zoom: gs.size / 100, textShadow: gsShadow } : undefined;
          return (
            <div key={tab.id} className="relative flex-shrink-0" style={tabStyle}>
              <button
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-all ${
                  hasActive ? 'border-orange-500 bg-orange-950/30 text-orange-300'
                    : isOpen ? 'border-orange-700 bg-orange-950/20 text-orange-300'
                    : 'border-transparent text-orange-600 hover:border-orange-800 hover:text-orange-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {!tab.direct && <ChevronDown className={`w-2.5 h-2.5 ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isOpen && !tab.direct && (
                <div className={`absolute top-full ${tab.align === 'right' ? 'right-0' : 'left-0'} mt-0.5 min-w-[200px] max-h-[70vh] overflow-y-auto border border-orange-800 bg-black z-[100] shadow-lg shadow-black`}>
                  {(tab.items || []).map(item => renderItem(item, 0))}
                  {(tab.children || []).map(node => renderNode(node, 0, tab.id))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}