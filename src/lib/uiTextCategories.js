// UI text style categories — maps each screen to a logical grouping so the
// Settings panel can offer independent size + RGB controls per group.
// Groupings mirror the NavBar subfolders for intuitiveness.

export const UI_TEXT_GROUPS = [
  {
    id: 'exploration', label: 'Exploration', categories: [
      { id: 'nav', label: 'Navigation', screens: ['galaxy', 'system'] },
      { id: 'scan', label: 'Scanning', screens: ['exploration', 'fss', 'survey', 'srv'] },
      { id: 'fieldops', label: 'Field Ops', screens: ['conflictzone', 'res', 'piracy', 'exobiology'] },
    ],
  },
  {
    id: 'station', label: 'Station', categories: [
      { id: 'services', label: 'Services', screens: ['station', 'market', 'cartography', 'maintenance'] },
      { id: 'outfit', label: 'Outfitting', screens: ['outfitting', 'engineering', 'synthesis', 'materialtrader'] },
      { id: 'personnel', label: 'Personnel', screens: ['multicrew', 'crew', 'passengers'] },
      { id: 'underworld', label: 'Underworld', screens: ['blackmarket', 'bountyboard'] },
    ],
  },
  {
    id: 'commerce', label: 'Commerce', categories: [
      { id: 'missions', label: 'Missions', screens: ['missions', 'chains'] },
      { id: 'trade', label: 'Trade', screens: ['trade', 'marketai'] },
      { id: 'company', label: 'Company', screens: ['company'] },
    ],
  },
  {
    id: 'fleet', label: 'Fleet', categories: [
      { id: 'ship', label: 'Ship', screens: ['ship', 'presets', 'shipcreator'] },
      { id: 'carriers', label: 'Carriers', screens: ['carriers', 'carrierlogistics', 'carriercommand', 'carriercreator', 'carrierinterior'] },
      { id: 'cabin', label: 'Cabin', screens: ['cabin', 'roommanager', 'aquarium', 'garden', 'geneticslab'] },
      { id: 'squadron', label: 'Squadron', screens: ['fleet', 'wingmates', 'fighters'] },
      { id: 'infra', label: 'Infrastructure', screens: ['warpgates'] },
    ],
  },
  {
    id: 'industry', label: 'Industry', categories: [
      { id: 'mining', label: 'Mining', screens: ['mining'] },
      { id: 'colonies', label: 'Colonies', screens: ['colonization'] },
      { id: 'builders', label: 'Builders', screens: ['stationbuilder', 'stationcreator'] },
    ],
  },
  {
    id: 'commander', label: 'Commander', categories: [
      { id: 'identity', label: 'Identity', screens: ['profile', 'titles', 'badgemaker', 'rep'] },
      { id: 'progress', label: 'Progress', screens: ['achievements', 'leaderboard', 'goals'] },
      { id: 'world', label: 'World', screens: ['galnet', 'holidays', 'events'] },
      { id: 'status', label: 'Status', screens: ['crime', 'bgs', 'powerplay', 'canisstella'] },
      { id: 'reference', label: 'Reference', screens: ['codex', 'discoveries', 'cheats'] },
      { id: 'system', label: 'System', screens: ['controllerconfig', 'settings'] },
    ],
  },
];

// Flat lookup: screen id → category id
export const SCREEN_CATEGORY_MAP = (() => {
  const map = {};
  for (const group of UI_TEXT_GROUPS) {
    for (const cat of group.categories) {
      for (const sc of cat.screens) map[sc] = cat.id;
    }
  }
  return map;
})();

export function getScreenCategory(screenId) {
  return SCREEN_CATEGORY_MAP[screenId] || null;
}

// Returns { size, rgb } for a category, applying defaults for missing values.
export function getCategoryStyle(uiTextStyles, catId) {
  const raw = (uiTextStyles || {})[catId] || {};
  return {
    size: typeof raw.size === 'number' ? raw.size : 100,
    rgb: raw.rgb || null,
  };
}

// Build a CSS style object for a screen based on its category style.
export function getScreenTextStyle(uiTextStyles, screenId) {
  const catId = getScreenCategory(screenId);
  if (!catId) return null;
  const { size, rgb } = getCategoryStyle(uiTextStyles, catId);
  if (size === 100 && !rgb) return null;
  return {
    zoom: size / 100,
    ...(rgb ? { color: `rgb(${rgb.r},${rgb.g},${rgb.b})` } : {}),
  };
}