// Bezel Context System — 24 persistent function buttons (F1-F24) arranged
// around 4 screen bezels (top, right, bottom, left). Buttons auto-populate
// based on the current game context. Players can customize slot assignments.
import {
  Map, Eye, Compass, Radar, Radio, Store, ArrowLeftRight, ClipboardList,
  Wrench, Ship, Users, FlaskConical, ScrollText, Palette, Boxes, Package,
  Cpu, Crosshair, Plane, SlidersHorizontal, BarChart3, Trophy, Award,
  Newspaper, BookOpen, Globe, Calendar, Activity, AlertTriangle, ListChecks,
  Sparkles, Settings, Rocket, Anchor, Building, MapPin,
  Swords, Layers, Hammer, Network, Briefcase, User, LayoutDashboard,
  MessageSquare, Save, ArrowLeft
} from 'lucide-react';

// ============================================================
// BEZEL ACTIONS — all assignable button actions
// ============================================================
export const BEZEL_ACTIONS = {
  // ---- Navigation ----
  galaxy: { id: 'galaxy', label: 'Galaxy Map', icon: Map, screen: 'galaxy' },
  system: { id: 'system', label: 'Orrery Viewer', icon: Eye, screen: 'system' },
  navcon: { id: 'navcon', label: 'NavCon', icon: Compass, screen: 'galaxy' }, // Phase 4: popout
  back: { id: 'back', label: 'Back', icon: ArrowLeft, action: 'back' },

  // ---- Scanners (main button with sub-buttons) ----
  scanners: {
    id: 'scanners', label: 'Scanners', icon: Radar, isMain: true,
    subButtons: {
      sys_scanner: { id: 'sys_scanner', label: 'System Scanner', icon: Radar, action: 'open_sys_scanner' },
      sig_scanner: { id: 'sig_scanner', label: 'Signal Scanner', icon: Radio, action: 'open_sig_scanner' },
    },
  },
  sys_scanner: { id: 'sys_scanner', label: 'System Scanner', icon: Radar, action: 'open_sys_scanner' },
  sig_scanner: { id: 'sig_scanner', label: 'Signal Scanner', icon: Radio, action: 'open_sig_scanner' },
  fss: { id: 'fss', label: 'FSS Scanner', icon: Radar, screen: 'fss' },

  // ---- Station Services (station-only) ----
  shipwright: { id: 'shipwright', label: 'Shipwright', icon: Wrench, screen: 'shipwright', stationOnly: true },
  outfitting: { id: 'outfitting', label: 'Outfitting', icon: Cpu, screen: 'outfitting', stationOnly: true },
  market: { id: 'market', label: 'Market', icon: Store, screen: 'market', stationOnly: true },
  missionboard: { id: 'missionboard', label: 'Mission Board', icon: ClipboardList, screen: 'missionboard', stationOnly: true },
  crew: { id: 'crew', label: 'Crew Lounge', icon: Users, screen: 'crew', stationOnly: true },
  engineering: { id: 'engineering', label: 'Engineering', icon: FlaskConical, screen: 'engineering', stationOnly: true },
  cartography: { id: 'cartography', label: 'Cartographics', icon: ScrollText, screen: 'cartography', stationOnly: true },
  livery: { id: 'livery', label: 'Livery', icon: Palette, screen: 'livery', stationOnly: true },
  maintenance: { id: 'maintenance', label: 'Maintenance', icon: Wrench, screen: 'maintenance', stationOnly: true },
  materialtrader: { id: 'materialtrader', label: 'Material Trader', icon: ArrowLeftRight, screen: 'materialtrader', stationOnly: true },
  blackmarket: { id: 'blackmarket', label: 'Black Market', icon: Store, screen: 'blackmarket', stationOnly: true },
  passengers: { id: 'passengers', label: 'Passenger Lounge', icon: Users, screen: 'passengers', stationOnly: true },
  multicrew: { id: 'multicrew', label: 'Multi-Crew', icon: Users, screen: 'multicrew', stationOnly: true },
  dockcam: { id: 'dockcam', label: 'Dock Camera', icon: Radar, screen: 'dockcam', stationOnly: true },
  stationcontacts: { id: 'stationcontacts', label: 'Contacts', icon: Users, screen: 'stationcontacts', stationOnly: true },
  advmaintenance: { id: 'advmaintenance', label: 'Adv. Maintenance', icon: Wrench, screen: 'advmaintenance', stationOnly: true },
  colonization: { id: 'colonization', label: 'Colonization', icon: Globe, screen: 'colonization', stationOnly: true },
  station: { id: 'station', label: 'Station Services', icon: Building, screen: 'station', stationOnly: true },
  bountyboard: { id: 'bountyboard', label: 'Bounty Board', icon: Crosshair, screen: 'bountyboard', stationOnly: true },

  // ---- Ship ----
  ship: { id: 'ship', label: 'Ship', icon: Ship, screen: 'ship' },
  modules: { id: 'modules', label: 'Modules', icon: Cpu, screen: 'modules' },
  firegroups: { id: 'firegroups', label: 'Fire Groups', icon: Crosshair, screen: 'firegroups' },
  shipfunctions: { id: 'shipfunctions', label: 'Ship Functions', icon: Cpu, screen: 'shipfunctions' },
  flightassist: { id: 'flightassist', label: 'Flight Assistant', icon: Plane, screen: 'flightassist' },
  pilotprefs: { id: 'pilotprefs', label: 'Pilot Prefs', icon: SlidersHorizontal, screen: 'pilotprefs' },
  shipstats: { id: 'shipstats', label: 'Ship Stats', icon: BarChart3, screen: 'shipstats' },
  cabin: { id: 'cabin', label: 'Cabin', icon: Eye, screen: 'cabin' },
  roommanager: { id: 'roommanager', label: 'Room Manager', icon: LayoutDashboard, screen: 'roommanager' },
  aquarium: { id: 'aquarium', label: 'Aquarium', icon: Eye, screen: 'aquarium' },
  garden: { id: 'garden', label: 'Garden', icon: Boxes, screen: 'garden' },
  geneticslab: { id: 'geneticslab', label: 'Genetics Lab', icon: Cpu, screen: 'geneticslab' },

  // ---- Inventory ----
  cargo: { id: 'cargo', label: 'Cargo', icon: Package, screen: 'cargo' },
  materialslocker: { id: 'materialslocker', label: 'Materials', icon: Boxes, screen: 'materialslocker' },
  synthesis: { id: 'synthesis', label: 'Synthesis', icon: FlaskConical, screen: 'synthesis' },

  // ---- Fleet ----
  fleet: { id: 'fleet', label: 'Fleet', icon: Layers, screen: 'fleet' },
  carriers: { id: 'carriers', label: 'Carriers', icon: Anchor, screen: 'carriers' },
  carrierlogistics: { id: 'carrierlogistics', label: 'Carrier Logistics', icon: MapPin, screen: 'carrierlogistics' },
  carriercommand: { id: 'carriercommand', label: 'Carrier Command', icon: LayoutDashboard, screen: 'carriercommand' },
  carrierinterior: { id: 'carrierinterior', label: 'Carrier Interior', icon: Package, screen: 'carrierinterior' },
  carriercreator: { id: 'carriercreator', label: 'Carrier Yard', icon: Hammer, screen: 'carriercreator', carrierRequired: true },
  shipcreator: { id: 'shipcreator', label: 'Shipyard', icon: Hammer, screen: 'shipcreator' },
  warpgates: { id: 'warpgates', label: 'Warp Gates', icon: Network, screen: 'warpgates' },
  fighters: { id: 'fighters', label: 'Fighter Hangar', icon: Plane, screen: 'fighters' },
  presets: { id: 'presets', label: 'Loadout Presets', icon: SlidersHorizontal, screen: 'presets' },
  wingmates: { id: 'wingmates', label: 'Wingmates', icon: Users, screen: 'wingmates' },

  // ---- Commander ----
  codex: { id: 'codex', label: 'Codex', icon: BookOpen, screen: 'codex' },
  profile: { id: 'profile', label: 'Profile', icon: User, screen: 'profile' },
  settings: { id: 'settings', label: 'Settings', icon: Settings, screen: 'settings' },
  controllerconfig: { id: 'controllerconfig', label: 'Controller Config', icon: Cpu, screen: 'controllerconfig' },
  canisstella: { id: 'canisstella', label: 'Canis Stella', icon: Building, screen: 'canisstella' },
  cheats: { id: 'cheats', label: 'Extras', icon: Sparkles, screen: 'cheats', dev: true },
  achievements: { id: 'achievements', label: 'Awards', icon: Trophy, screen: 'achievements' },
  leaderboard: { id: 'leaderboard', label: 'Leaderboards', icon: Trophy, screen: 'leaderboard' },
  ranks: { id: 'ranks', label: 'Ranks', icon: Award, screen: 'ranks' },
  galnet: { id: 'galnet', label: 'News', icon: Newspaper, screen: 'galnet' },
  holidays: { id: 'holidays', label: 'Holidays', icon: Calendar, screen: 'holidays' },
  events: { id: 'events', label: 'Cosmic Events', icon: Calendar, screen: 'events' },
  bgs: { id: 'bgs', label: 'System Factions', icon: Activity, screen: 'bgs' },
  crime: { id: 'crime', label: 'Crime Status', icon: AlertTriangle, screen: 'crime' },
  rep: { id: 'rep', label: 'Reputation', icon: Award, screen: 'rep' },
  powerplay: { id: 'powerplay', label: 'Power Play', icon: Award, screen: 'powerplay' },
  titles: { id: 'titles', label: 'Titles', icon: Award, screen: 'titles' },
  goals: { id: 'goals', label: 'Community Goals', icon: Trophy, screen: 'goals' },
  badgemaker: { id: 'badgemaker', label: 'Badge Maker', icon: Palette, screen: 'badgemaker' },
  discoveries: { id: 'discoveries', label: 'Discoveries', icon: BookOpen, screen: 'discoveries' },

  // ---- Commerce ----
  trade: { id: 'trade', label: 'Trade Tools', icon: ArrowLeftRight, screen: 'trade' },
  marketai: { id: 'marketai', label: 'Market Analysis', icon: BarChart3, screen: 'marketai' },
  company: { id: 'company', label: 'Company', icon: Briefcase, screen: 'company' },
  chains: { id: 'chains', label: 'Mission Chains', icon: ClipboardList, screen: 'chains' },

  // ---- Missions ----
  missions: { id: 'missions', label: 'Missions', icon: ClipboardList, screen: 'missions' },
  piracy: { id: 'piracy', label: 'Piracy', icon: Swords, screen: 'piracy' },
  journey: { id: 'journey', label: 'Journey', icon: Map, screen: 'journey' },
  wreckage: { id: 'wreckage', label: 'Wreckage', icon: AlertTriangle, screen: 'wreckage' },

  // ---- Deploy ----
  srv: { id: 'srv', label: 'SRV Rover', icon: MapPin, screen: 'srv' },
  exobiology: { id: 'exobiology', label: 'Exobiology', icon: FlaskConical, screen: 'exobiology' },
  res: { id: 'res', label: 'Mining Sites', icon: Hammer, screen: 'res' },
  conflictzone: { id: 'conflictzone', label: 'Conflict Zones', icon: Swords, screen: 'conflictzone' },
  contacts: { id: 'contacts', label: 'Contacts', icon: Users, screen: 'contacts' },
  comms: { id: 'comms', label: 'Comms Log', icon: MessageSquare, screen: 'comms' },

  // ---- Other ----
  home: { id: 'home', label: 'Main', icon: LayoutDashboard, screen: 'home' },
  exploration: { id: 'exploration', label: 'Exploration', icon: Compass, screen: 'exploration' },
  mining: { id: 'mining', label: 'Mining', icon: Hammer, screen: 'mining' },
  survey: { id: 'survey', label: 'Surface Survey', icon: MapPin, screen: 'survey' },
  stationbuilder: { id: 'stationbuilder', label: 'Infrastructure', icon: Building, screen: 'stationbuilder' },
  stationcreator: { id: 'stationcreator', label: 'Station Creator', icon: Building, screen: 'stationcreator' },
  devfeatures: { id: 'devfeatures', label: 'In Progress', icon: Cpu, screen: 'devfeatures' },
  plannedfeatures: { id: 'plannedfeatures', label: 'Planned', icon: ListChecks, screen: 'plannedfeatures' },

  // ---- Special Actions ----
  launch: { id: 'launch', label: 'Launch', icon: Rocket, action: 'launch' },
  save: { id: 'save', label: 'Save', icon: Save, action: 'save' },
  selfdestruct: { id: 'selfdestruct', label: 'Self-Destruct', icon: AlertTriangle, action: 'selfdestruct' },
};

// ============================================================
// BEZEL ACTION CATEGORIES — for the customizer UI
// ============================================================
export const BEZEL_ACTION_CATEGORIES = [
  { id: 'navigation', label: 'Navigation', actions: ['galaxy', 'system', 'navcon', 'back'] },
  { id: 'scanners', label: 'Scanners', actions: ['scanners', 'sys_scanner', 'sig_scanner', 'fss'] },
  { id: 'station', label: 'Station Services', actions: ['shipwright', 'market', 'missionboard', 'crew', 'engineering', 'cartography', 'livery', 'maintenance', 'materialtrader', 'blackmarket', 'passengers', 'multicrew', 'dockcam', 'stationcontacts', 'advmaintenance', 'colonization', 'station', 'bountyboard'] },
  { id: 'ship', label: 'Ship', actions: ['ship', 'modules', 'firegroups', 'shipfunctions', 'flightassist', 'pilotprefs', 'shipstats', 'cabin', 'roommanager', 'aquarium', 'garden', 'geneticslab'] },
  { id: 'inventory', label: 'Inventory', actions: ['cargo', 'materialslocker', 'synthesis'] },
  { id: 'fleet', label: 'Fleet', actions: ['fleet', 'carriers', 'carrierlogistics', 'carriercommand', 'carrierinterior', 'carriercreator', 'shipcreator', 'warpgates', 'fighters', 'presets', 'wingmates'] },
  { id: 'commander', label: 'Commander', actions: ['codex', 'profile', 'settings', 'controllerconfig', 'canisstella', 'achievements', 'leaderboard', 'ranks', 'galnet', 'holidays', 'events', 'bgs', 'crime', 'rep', 'powerplay', 'titles', 'goals', 'badgemaker', 'discoveries', 'cheats'] },
  { id: 'commerce', label: 'Commerce', actions: ['trade', 'marketai', 'company', 'chains', 'missions'] },
  { id: 'deploy', label: 'Deploy', actions: ['srv', 'exobiology', 'res', 'conflictzone', 'contacts', 'comms', 'piracy', 'journey', 'wreckage'] },
  { id: 'other', label: 'Other', actions: ['home', 'exploration', 'mining', 'survey', 'stationbuilder', 'stationcreator', 'devfeatures', 'plannedfeatures'] },
  { id: 'special', label: 'Special Actions', actions: ['launch', 'save', 'selfdestruct'] },
];

// ============================================================
// CONTEXT RESOLVER — determines which button set to show
// ============================================================
export function resolveContext(screen, currentLocation) {
  if (currentLocation === 'station') return 'station';
  if (screen === 'galaxy') return 'galaxy';
  if (screen === 'survey' || currentLocation === 'surface') return 'surface';
  if (screen === 'system') return 'orrery';
  return 'menu';
}

// ============================================================
// DEFAULT LAYOUTS — per-context default button assignments
// ============================================================
export const DEFAULT_LAYOUTS = {
  orrery: {
    top: ['galaxy', 'navcon', 'missions', 'cargo', 'settings', 'selfdestruct'],
    right: ['scanners', 'contacts', 'comms', 'rep', 'bgs', 'codex'],
    bottom: ['ship', 'save', 'missions', 'materialslocker', 'synthesis', 'home'],
    left: ['shipfunctions', 'modules', 'firegroups', 'shipstats', 'ranks', 'profile'],
  },
  station: {
    top: ['launch', 'shipwright', 'market', 'missionboard', 'trade', 'save'],
    right: ['ship', 'crew', 'engineering', 'cartography', 'livery', 'maintenance'],
    bottom: ['contacts', 'blackmarket', 'materialtrader', 'passengers', 'multicrew', 'dockcam'],
    left: ['cargo', 'materialslocker', 'synthesis', 'rep', 'bgs', 'codex'],
  },
  galaxy: {
    top: ['system', 'navcon', 'missions', 'cargo', 'settings', 'save'],
    right: ['codex', 'achievements', 'leaderboard', 'profile', 'rep', 'ranks'],
    bottom: ['ship', 'fleet', 'carriers', 'company', 'marketai', 'trade'],
    left: ['galnet', 'holidays', 'bgs', 'titles', 'badgemaker', 'discoveries'],
  },
  surface: {
    top: ['launch', 'system', 'galaxy', 'missions', 'settings', 'selfdestruct'],
    right: ['srv', 'exobiology', 'codex', 'contacts', 'comms', 'rep'],
    bottom: ['ship', 'save', 'cargo', 'materialslocker', 'synthesis', 'home'],
    left: ['shipfunctions', 'modules', 'shipstats', 'ranks', 'profile', 'back'],
  },
  menu: {
    top: ['system', 'galaxy', 'missions', 'settings', 'save', 'selfdestruct'],
    right: ['codex', 'achievements', 'leaderboard', 'profile', 'rep', 'ranks'],
    bottom: ['ship', 'cargo', 'trade', 'missionboard', 'contacts', 'back'],
    left: ['bgs', 'galnet', 'holidays', 'titles', 'badgemaker', 'discoveries'],
  },
};

// ============================================================
// LAYOUT MERGER — merges custom layout with defaults
// ============================================================
export function getBezelLayout(context, customLayout) {
  const defaults = DEFAULT_LAYOUTS[context] || DEFAULT_LAYOUTS.menu;
  if (!customLayout || !customLayout[context]) return defaults;

  const custom = customLayout[context];
  const result = {};
  for (const side of ['top', 'right', 'bottom', 'left']) {
    const customSide = custom[side];
    if (customSide && Array.isArray(customSide)) {
      result[side] = customSide.slice(0, 6);
    } else {
      result[side] = defaults[side];
    }
  }
  return result;
}

// ============================================================
// F-KEY MAPPING — maps F1-F24 to bezel positions
// F1-F6: Top (L→R) | F7-F12: Right (T→B) | F13-F18: Bottom (L→R) | F19-F24: Left (T→B)
// ============================================================
export function fKeyToPosition(fKey) {
  if (fKey >= 1 && fKey <= 6) return { side: 'top', index: fKey - 1 };
  if (fKey >= 7 && fKey <= 12) return { side: 'right', index: fKey - 7 };
  if (fKey >= 13 && fKey <= 18) return { side: 'bottom', index: fKey - 13 };
  if (fKey >= 19 && fKey <= 24) return { side: 'left', index: fKey - 19 };
  return null;
}