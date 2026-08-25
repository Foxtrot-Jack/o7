// Keybind definitions — all bindable actions, grouped by category.
// Each action supports an array of bindings (multi-bind), so multiple
// physical inputs can trigger the same action.

export const KEYBIND_CATEGORIES = [
  {
    id: 'navigation',
    label: 'Navigation',
    icon: '🧭',
    actions: [
      { id: 'nav_up', label: 'Focus Up', defaults: [{ type: 'key', code: 'ArrowUp' }, { type: 'key', code: 'KeyW' }] },
      { id: 'nav_down', label: 'Focus Down', defaults: [{ type: 'key', code: 'ArrowDown' }, { type: 'key', code: 'KeyS' }] },
      { id: 'nav_left', label: 'Focus Left', defaults: [{ type: 'key', code: 'ArrowLeft' }, { type: 'key', code: 'KeyA' }] },
      { id: 'nav_right', label: 'Focus Right', defaults: [{ type: 'key', code: 'ArrowRight' }, { type: 'key', code: 'KeyD' }] },
      { id: 'nav_select', label: 'Select / Confirm', defaults: [{ type: 'key', code: 'Enter' }, { type: 'key', code: 'Space' }] },
      { id: 'nav_back', label: 'Back / Cancel', defaults: [{ type: 'key', code: 'Escape' }, { type: 'key', code: 'Backspace' }] },
    ],
  },
  {
    id: 'explore',
    label: 'Explore Screens',
    icon: '🔭',
    actions: [
      { id: 'screen_galaxy', label: 'Galaxy Map', defaults: [{ type: 'key', code: 'KeyG' }] },
      { id: 'screen_system', label: 'System View', defaults: [{ type: 'key', code: 'KeyQ' }] },
      { id: 'screen_exploration', label: 'Exploration', defaults: [] },
      { id: 'screen_survey', label: 'Surface Survey', defaults: [] },
      { id: 'screen_srv', label: 'SRV Rover', defaults: [] },
      { id: 'screen_fss', label: 'FSS Scanner', defaults: [{ type: 'key', code: 'KeyF' }] },
      { id: 'screen_conflictzone', label: 'Conflict Zones', defaults: [] },
      { id: 'screen_res', label: 'Mining Sites', defaults: [] },
      { id: 'screen_exobiology', label: 'Exobiology', defaults: [] },
      { id: 'screen_piracy', label: 'Piracy', defaults: [] },
    ],
  },
  {
    id: 'station',
    label: 'Station Screens',
    icon: '🏠',
    actions: [
      { id: 'screen_station', label: 'Station Services', defaults: [{ type: 'key', code: 'KeyH' }] },
      { id: 'screen_market', label: 'Market', defaults: [{ type: 'key', code: 'KeyM' }] },
      { id: 'screen_outfitting', label: 'Outfitting', defaults: [{ type: 'key', code: 'KeyO' }] },
      { id: 'screen_engineering', label: 'Engineering', defaults: [] },
      { id: 'screen_missions', label: 'Missions', defaults: [{ type: 'key', code: 'KeyJ' }] },
      { id: 'screen_mining', label: 'Mining', defaults: [{ type: 'key', code: 'KeyI' }] },
      { id: 'screen_colonization', label: 'Colonies', defaults: [] },
      { id: 'screen_blackmarket', label: 'Black Market', defaults: [] },
      { id: 'screen_bountyboard', label: 'Bounty Board', defaults: [] },
      { id: 'screen_passengers', label: 'Passenger Lounge', defaults: [] },
      { id: 'screen_materialtrader', label: 'Material Trader', defaults: [] },
      { id: 'screen_synthesis', label: 'Synthesis', defaults: [] },
      { id: 'screen_crew', label: 'Crew Quarters', defaults: [] },
      { id: 'screen_multicrew', label: 'Multi-Crew', defaults: [] },
      { id: 'screen_cartography', label: 'Cartographics', defaults: [] },
      { id: 'screen_maintenance', label: 'Maintenance', defaults: [] },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce Screens',
    icon: '📈',
    actions: [
      { id: 'screen_trade', label: 'Trade Tools', defaults: [] },
      { id: 'screen_marketai', label: 'Market Analysis', defaults: [] },
      { id: 'screen_company', label: 'Company', defaults: [] },
      { id: 'screen_chains', label: 'Mission Chains', defaults: [] },
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet Screens',
    icon: '🚀',
    actions: [
      { id: 'screen_ship', label: 'Ship', defaults: [{ type: 'key', code: 'KeyP' }] },
      { id: 'screen_fleet', label: 'Fleet Manager', defaults: [] },
      { id: 'screen_carriers', label: 'Fleet Carriers', defaults: [{ type: 'key', code: 'KeyV' }] },
      { id: 'screen_carrierlogistics', label: 'Carrier Logistics', defaults: [{ type: 'key', code: 'KeyL' }] },
      { id: 'screen_carriercommand', label: 'Carrier Command', defaults: [{ type: 'key', code: 'KeyB' }] },
      { id: 'screen_shipcreator', label: 'Ship Yard', defaults: [] },
      { id: 'screen_carriercreator', label: 'Carrier Yard', defaults: [] },
      { id: 'screen_carrierinterior', label: 'Carrier Interior', defaults: [] },
      { id: 'screen_warpgates', label: 'Warp Gates', defaults: [] },
      { id: 'screen_wingmates', label: 'Wingmates', defaults: [] },
      { id: 'screen_fighters', label: 'Fighter Hangar', defaults: [] },
      { id: 'screen_presets', label: 'Loadout Presets', defaults: [] },
      { id: 'screen_cabin', label: 'Cabin', defaults: [] },
      { id: 'screen_roommanager', label: 'Room Manager', defaults: [] },
      { id: 'screen_aquarium', label: 'Aquarium', defaults: [] },
      { id: 'screen_garden', label: 'Garden', defaults: [] },
      { id: 'screen_geneticslab', label: 'Genetics Lab', defaults: [] },
    ],
  },
  {
    id: 'industry',
    label: 'Industry Screens',
    icon: '⛏️',
    actions: [
      { id: 'screen_stationbuilder', label: 'Station Builder', defaults: [] },
      { id: 'screen_stationcreator', label: 'Station Creator', defaults: [] },
    ],
  },
  {
    id: 'commander',
    label: 'Commander Screens',
    icon: '👤',
    actions: [
      { id: 'screen_codex', label: 'Codex', defaults: [{ type: 'key', code: 'KeyC' }] },
      { id: 'screen_profile', label: 'Profile', defaults: [] },
      { id: 'screen_settings', label: 'Settings', defaults: [] },
      { id: 'screen_controllerconfig', label: 'Controller Config', defaults: [] },
      { id: 'screen_canisstella', label: 'Canis Stella', defaults: [] },
      { id: 'screen_cheats', label: 'Cheats', defaults: [] },
      { id: 'screen_achievements', label: 'Awards', defaults: [] },
      { id: 'screen_leaderboard', label: 'Leaderboard', defaults: [] },
      { id: 'screen_holidays', label: 'Public Holidays', defaults: [] },
      { id: 'screen_galnet', label: 'StarNet News', defaults: [{ type: 'key', code: 'KeyN' }] },
      { id: 'screen_crime', label: 'Crime Status', defaults: [] },
      { id: 'screen_bgs', label: 'Faction Status', defaults: [] },
      { id: 'screen_rep', label: 'Reputation', defaults: [] },
      { id: 'screen_powerplay', label: 'Power Play', defaults: [] },
      { id: 'screen_events', label: 'Cosmic Events', defaults: [] },
      { id: 'screen_titles', label: 'Titles', defaults: [] },
      { id: 'screen_goals', label: 'Community Goals', defaults: [] },
      { id: 'screen_badgemaker', label: 'Badge Maker', defaults: [] },
      { id: 'screen_discoveries', label: 'Discoveries', defaults: [] },
    ],
  },
  {
    id: 'bezel',
    label: 'Bezel Buttons',
    icon: '🔘',
    actions: Array.from({ length: 24 }, (_, i) => ({
      id: `bezel_f${i + 1}`,
      label: `Bezel F${i + 1}`,
      defaults: [{ type: 'key', code: `F${i + 1}` }],
    })),
  },
];

// Flat action lookup
export const ALL_ACTIONS = {};
for (const cat of KEYBIND_CATEGORIES) {
  for (const action of cat.actions) {
    ALL_ACTIONS[action.id] = action;
  }
}

export function getDefaultBindings() {
  const bindings = {};
  for (const cat of KEYBIND_CATEGORIES) {
    for (const action of cat.actions) {
      bindings[action.id] = (action.defaults || []).map(b => ({ ...b }));
    }
  }
  return bindings;
}