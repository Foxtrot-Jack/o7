// Sound preset definitions — music tracks, presets, and screen-to-context mapping

// Musical scales (semitone offsets from root)
export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  pentatonic: [0, 3, 5, 7, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

// Procedural music track definitions
export const MUSIC_TRACKS = {
  deep_space: {
    name: 'Deep Space',
    baseFreq: 55, scale: 'minor', oscType: 'sine',
    lfoRate: 0.08, noteRate: 5000, filter: 600, noteGain: 0.06, droneGain: 0.12,
  },
  nebula: {
    name: 'Nebula Drift',
    baseFreq: 73, scale: 'pentatonic', oscType: 'triangle',
    lfoRate: 0.05, noteRate: 4000, filter: 1000, noteGain: 0.07, droneGain: 0.10,
  },
  station_hum: {
    name: 'Station Hum',
    baseFreq: 65, scale: 'major', oscType: 'sine',
    lfoRate: 0.12, noteRate: 6000, filter: 1200, noteGain: 0.05, droneGain: 0.10,
  },
  combat_tension: {
    name: 'Combat Tension',
    baseFreq: 82, scale: 'phrygian', oscType: 'sawtooth',
    lfoRate: 0.15, noteRate: 2000, filter: 500, noteGain: 0.06, droneGain: 0.08,
  },
  mystery: {
    name: 'Unknown Realm',
    baseFreq: 49, scale: 'locrian', oscType: 'sine',
    lfoRate: 0.03, noteRate: 5000, filter: 400, noteGain: 0.05, droneGain: 0.10,
  },
  minimal_ambient: {
    name: 'Minimal',
    baseFreq: 130, scale: 'major', oscType: 'sine',
    lfoRate: 0.2, noteRate: 8000, filter: 2000, noteGain: 0.04, droneGain: 0.06,
  },
  mining_rhythm: {
    name: 'Mining Rhythm',
    baseFreq: 58, scale: 'dorian', oscType: 'triangle',
    lfoRate: 0.1, noteRate: 3000, filter: 700, noteGain: 0.06, droneGain: 0.10,
  },
  hyperspace: {
    name: 'Hyperspace',
    baseFreq: 44, scale: 'harmonic_minor', oscType: 'sine',
    lfoRate: 0.06, noteRate: 2500, filter: 300, noteGain: 0.05, droneGain: 0.15,
  },
  retro_chiptune: {
    name: 'Retro Chiptune',
    baseFreq: 131, scale: 'major', oscType: 'square',
    lfoRate: 0.15, noteRate: 2000, filter: 1500, noteGain: 0.04, droneGain: 0.05,
  },
  cinematic: {
    name: 'Cinematic',
    baseFreq: 49, scale: 'harmonic_minor', oscType: 'sine',
    lfoRate: 0.04, noteRate: 3500, filter: 800, noteGain: 0.07, droneGain: 0.15,
  },
  intense: {
    name: 'Intense Drive',
    baseFreq: 73, scale: 'phrygian', oscType: 'sawtooth',
    lfoRate: 0.2, noteRate: 1500, filter: 600, noteGain: 0.06, droneGain: 0.10,
  },
  ethereal: {
    name: 'Ethereal',
    baseFreq: 98, scale: 'lydian', oscType: 'sine',
    lfoRate: 0.07, noteRate: 4500, filter: 1500, noteGain: 0.06, droneGain: 0.08,
  },
};

// Music context presets — each maps a game context to a track
export const MUSIC_PRESETS = {
  standard: {
    name: 'Standard',
    description: 'Default ambient atmosphere',
    tracks: {
      galaxy: 'nebula',
      system: 'mystery',
      station: 'station_hum',
      combat: 'combat_tension',
      menu: 'minimal_ambient',
      exploration: 'deep_space',
      mining: 'mining_rhythm',
      hyperspace: 'hyperspace',
    },
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Rich, dramatic soundscapes',
    tracks: {
      galaxy: 'cinematic',
      system: 'ethereal',
      station: 'cinematic',
      combat: 'intense',
      menu: 'ethereal',
      exploration: 'cinematic',
      mining: 'intense',
      hyperspace: 'hyperspace',
    },
  },
  retro: {
    name: 'Retro',
    description: 'Chiptune-inspired tracks',
    tracks: {
      galaxy: 'retro_chiptune',
      system: 'retro_chiptune',
      station: 'retro_chiptune',
      combat: 'retro_chiptune',
      menu: 'retro_chiptune',
      exploration: 'retro_chiptune',
      mining: 'retro_chiptune',
      hyperspace: 'retro_chiptune',
    },
  },
  minimal: {
    name: 'Minimal',
    description: 'Sparse, quiet ambient',
    tracks: {
      galaxy: 'minimal_ambient',
      system: 'minimal_ambient',
      station: 'minimal_ambient',
      combat: 'minimal_ambient',
      menu: 'minimal_ambient',
      exploration: 'minimal_ambient',
      mining: 'minimal_ambient',
      hyperspace: 'minimal_ambient',
    },
  },
  intense: {
    name: 'Intense',
    description: 'Driving, energetic soundscapes',
    tracks: {
      galaxy: 'intense',
      system: 'intense',
      station: 'intense',
      combat: 'intense',
      menu: 'intense',
      exploration: 'intense',
      mining: 'intense',
      hyperspace: 'intense',
    },
  },
  ethereal: {
    name: 'Ethereal',
    description: 'Dreamy, atmospheric tones',
    tracks: {
      galaxy: 'ethereal',
      system: 'ethereal',
      station: 'ethereal',
      combat: 'mystery',
      menu: 'ethereal',
      exploration: 'ethereal',
      mining: 'deep_space',
      hyperspace: 'ethereal',
    },
  },
};

// Screen ID → music context mapping
export const SCREEN_CONTEXTS = {
  galaxy: 'galaxy',
  system: 'system',
  fss: 'system',
  station: 'station',
  market: 'station',
  outfitting: 'station',
  engineering: 'station',
  multicrew: 'station',
  cartography: 'station',
  maintenance: 'station',
  blackmarket: 'station',
  bountyboard: 'station',
  passengers: 'station',
  materialtrader: 'station',
  synthesis: 'station',
  crew: 'station',
  dockcam: 'station',
  ship: 'station',
  cabin: 'station',
  roommanager: 'station',
  aquarium: 'station',
  garden: 'station',
  geneticslab: 'station',
  carrierinterior: 'station',
  mining: 'mining',
  res: 'mining',
  colonization: 'menu',
  stationbuilder: 'menu',
  stationcreator: 'menu',
  survey: 'exploration',
  srv: 'exploration',
  exobiology: 'exploration',
  piracy: 'combat',
  conflictzone: 'combat',
  exploration: 'exploration',
  trade: 'menu',
  marketai: 'menu',
  company: 'menu',
  missions: 'menu',
  chains: 'menu',
  fleet: 'menu',
  wingmates: 'menu',
  fighters: 'menu',
  carriers: 'menu',
  carrierlogistics: 'menu',
  carriercommand: 'menu',
  presets: 'menu',
  shipcreator: 'menu',
  carriercreator: 'menu',
  warpgates: 'menu',
  achievements: 'menu',
  leaderboard: 'menu',
  galnet: 'menu',
  crime: 'menu',
  bgs: 'menu',
  rep: 'menu',
  powerplay: 'menu',
  events: 'menu',
  titles: 'menu',
  goals: 'menu',
  badgemaker: 'menu',
  profile: 'menu',
  codex: 'menu',
  discoveries: 'menu',
  cheats: 'menu',
  settings: 'menu',
};

// Context labels for settings UI
export const CONTEXT_LABELS = {
  galaxy: 'Galaxy Map',
  system: 'System / Orrery',
  station: 'Station Docked',
  combat: 'Combat',
  menu: 'Menus & Settings',
  exploration: 'Exploration / Surface',
  mining: 'Mining',
  hyperspace: 'Hyperspace Jump',
};

// SFX names for settings UI test buttons
export const SFX_TEST_LIST = [
  { id: 'click', label: 'UI Click' },
  { id: 'select', label: 'Select' },
  { id: 'scan', label: 'Scanner' },
  { id: 'jump', label: 'Hyperspace Jump' },
  { id: 'dock', label: 'Docking' },
  { id: 'weapon', label: 'Weapon Fire' },
  { id: 'explosion', label: 'Explosion' },
  { id: 'mining', label: 'Mining Laser' },
  { id: 'credits', label: 'Credits Earned' },
  { id: 'alert', label: 'Alert' },
];

export const MUSIC_TRACK_LIST = Object.entries(MUSIC_TRACKS).map(([id, t]) => ({ id, name: t.name }));
export const MUSIC_PRESET_LIST = Object.entries(MUSIC_PRESETS).map(([id, p]) => ({ id, name: p.name, description: p.description }));