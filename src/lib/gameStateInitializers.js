// Extracted from gameState.jsx — ship validation and initial state creation
import { STARTING_SYSTEM } from './galaxy';
import { getDefaultModules } from './shipOutfitting';
import { DEFAULT_GESTURE_SETTINGS, DEFAULT_DISPLAY_SETTINGS } from './screenSettings';

export const CURRENT_SAVE_VERSION = 2;

// Validates the ship object after save loading — fills in any missing fields
export function validateShip(ship, defaultShip) {
  if (!ship || typeof ship !== 'object' || Array.isArray(ship)) {
    return { ...defaultShip };
  }
  const v = { ...ship };
  if (typeof v.type !== 'string') v.type = defaultShip.type;
  if (typeof v.name !== 'string') v.name = defaultShip.name;
  if (!Array.isArray(v.cargo)) v.cargo = [];
  if (typeof v.fuel !== 'number' || isNaN(v.fuel)) v.fuel = defaultShip.fuel;
  if (typeof v.fuelCapacity !== 'number' || isNaN(v.fuelCapacity)) v.fuelCapacity = defaultShip.fuelCapacity;
  if (typeof v.cargoCapacity !== 'number' || isNaN(v.cargoCapacity)) v.cargoCapacity = defaultShip.cargoCapacity;
  if (!v.modules || typeof v.modules !== 'object' || Array.isArray(v.modules)) v.modules = defaultShip.modules;
  if (typeof v.integrity !== 'number' || isNaN(v.integrity)) v.integrity = 100;
  if (typeof v.moduleWear !== 'number' || isNaN(v.moduleWear)) v.moduleWear = 0;
  if (!v.cockpitDecoration || typeof v.cockpitDecoration !== 'object') v.cockpitDecoration = { parts: {} };
  if (!v.cockpitDecoration.parts || typeof v.cockpitDecoration.parts !== 'object') v.cockpitDecoration.parts = {};
  return v;
}

export function createInitialState() {
  return {
    version: CURRENT_SAVE_VERSION,
    saveMode: 'normal',
    credits: 100000,
    ship: {
      type: 'sidewinder',
      name: 'Sparrowhawk Mk-I',
      cargo: [],
      fuel: 8,
      fuelCapacity: 8,
      cargoCapacity: 4,
      modules: getDefaultModules('sidewinder'),
      integrity: 100,
      moduleWear: 0,
      cockpitDecoration: { parts: {} },
    },
    currentSystem: STARTING_SYSTEM,
    currentLocation: 'station',
    currentStationId: 'station_0',
    currentSystemData: null,
    discoveredSystems: {},
    scannedBodies: {},
    soldExplorationData: [],
    activeMissions: [],
    acceptedMissionIds: [],
    colonies: [],
    rank: {
      exploration: { rank: 0, name: 'Aimless', points: 0 },
      trade: { rank: 0, name: 'Penniless', points: 0 },
      mining: { rank: 0, name: 'Defendant', points: 0 },
    },
    totalJumps: 0,
    totalProfit: 0,
    lightYearsTraveled: 0,
    lifetimeEarnings: 0,
    shipsPurchased: 0,
    refinery: [],
    refineryCapacity: 4,
    materials: {},
    plottedRoute: null,
    flightLog: [],
    bookmarkedSystems: [],
    fssScannedSystems: {},
    fssDiscoveredBodies: {},
    probeProgress: {},
    mappedBodies: {},
    surfaceDiscoveries: {},
    currentSurfaceBody: null,
    ownedShips: [],
    fleetCarriers: [],
    customShips: [],
    shipyard: null,
    company: null,
    cheats: { unlocked: false, active: {} },
    achievements: {
      firstDiscoveries: {},
      milestones: {},
      scannedSystemSeeds: [],
      systemsScanned: 0,
      totalBodiesScanned: 0,
    },
    records: {},
    playerBadge: null,
    savedBadges: [],
    customCarrierDesigns: [],
    customStationDesigns: [],
    lastOrbitBodyId: null,
    settings: {
      crtEffect: true,
      scanlines: true,
      textBrightness: 100,
      textRGB: null,
      navTextRGB: null,
      statusTextRGB: null,
      miniScreen: false,
      colorTheme: 'elite',
      customColor: null,
      fontFamily: 'courier',
      fontScale: 100,
      screenOrientation: 'landscape',
      orientationLocked: false,
      monoOverrides: { stars: false, planets: false, ships: false, stations: false, uiAccent: false },
      uiScale: { bodyList: 100, navPanel: 100, statusHeader: 100 },
      uiTextStyles: {},
      navGroupStyles: {},
      shipComms: true,
      showShipCopilot: true,
      showRadioChatter: true,
      sound: {
        enabled: true,
        sfxVolume: 0.7,
        musicVolume: 0.4,
        musicPreset: 'standard',
        customTracks: {},
      },
      gestures: DEFAULT_GESTURE_SETTINGS,
      display: DEFAULT_DISPLAY_SETTINGS,
      founders: { explorationEnabled: true, explorerSpeed: 50, spawnSelfInGalaxy: false },
    },
    crew: [],
    powerPlay: null,
    communityGoals: [],
    lastGoalRefresh: Date.now(),
    fsdBoost: false,
    heatSinkCharges: 0,
    shieldCellCharges: 0,
    activeEncounter: null,
    activeWreckage: null,
    salvageComponents: {},
    crime: { notoriety: 0, bounty: 0, crimes: [], lastCrime: 0 },
    bountyMissions: [],
    wingmates: [],
    passengerMissions: [],
    activeCombat: null,
    crewRoles: { pilot: null, gunner: null, shield: null, engineer: null },
    ownedStations: [],
    fighters: [],
    exobiologyCodex: {},
    missionChains: [],
    factionRep: {},
    loadoutPresets: [],
    timeEvents: [],
    playerTitle: null,
    notebook: '',
    surfaceMaps: {},
    minedDeposits: {},
    warpGates: [],
    cards: { owned: {}, drawnStations: {}, deckRewards: {}, specialAwarded: {}, foils: {}, origins: {} },
    eventCooldownUntil: 0,
    canisStella: { stance: 'neutral', reputation: 0, isCEO: false, ownFactionName: null },
    carrierRooms: {},
    carrierRoomGrid: {},
    carrierCurrentRoom: {},
    aquaticLife: { collected: [], tankIds: [], tankCapacity: 8 },
    floraCollection: { collected: [], displayIds: [], capacity: 8 },
    lastVisitedStation: null,
    rebuyPending: null,
    guardianBlueprints: {},
    galaxyFilters: { spectral: 'all', security: 'all', population: 'all', showParkedShips: true, showColonies: true, showMissions: true, explorationMode: false, showBubble: true, showRoute: true },
    commanderName: null,
    isFounderSignIn: false,
    founderActivity: [],
    founderSim: { progress: {}, lastTick: Date.now() },
    founderBGS: {},
    createdAt: Date.now(),
  };
}

export function createSandboxState() {
  const base = createInitialState();
  return {
    ...base,
    saveMode: 'sandbox',
    credits: 1000000000,
    ship: {
      type: 'anaconda',
      name: 'Roc',
      cargo: [],
      fuel: 64,
      fuelCapacity: 64,
      cargoCapacity: 114,
      modules: getDefaultModules('anaconda'),
      integrity: 100,
      moduleWear: 0,
      cockpitDecoration: { parts: {} },
    },
  };
}