// Game state management with localStorage persistence
// Uses React context for app-wide access
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { soundEngine } from './soundEngine';
import { STARTING_SYSTEM, distance3D, generateStarsInRange, SOL_SYSTEM } from './galaxy';
import { GATE_CREDIT_COST, GATE_MATERIAL_COST } from './warpGates';
import { computeCockpitCost } from './cockpitParts';
import { SOL_CHEATS } from './solSystem';
import { generateSystem } from './system';
import { COMMODITIES, COMMODITY_MAP, COMMODITY_CATEGORIES } from './commodities';
import { computeCustomShipStats } from './shipParts';
import { getDefaultModules, computeShipStats } from './shipOutfitting';
import { getCrewBonuses } from './crew';
import { generateCommunityGoals } from './communityGoals';
import { SYNTHESIS_MAP } from './synthesis';
import { shouldTriggerEncounter, generateEncounter } from './encounters';
import { CRIME_TYPES, getCleanRecordCost } from './crime';
import { STATION_BUILD_COST, STATION_SERVICES, calculateStationRevenue } from './stationBuilder';
import { FIGHTER_TYPES, getFighterHangarCapacity } from './fighters';
import { ROOM_TYPES, MAX_CARRIER_ROOMS, getRoomCost, getStationRoomCost } from './cabinRooms';
import { generateFish, generateFlora } from './specimens';
import { ADDITIONAL_SHIPS } from './shipRoster';
import { getHolidayFuelMultiplier } from './publicHolidays';

const STORAGE_KEY = 'starfarer_save_v1';
const STORAGE_KEY_SANDBOX = 'starfarer_sandbox_v1';

// Current save schema version. Bump when adding fields or changing structure.
// The migration guard in loadState() uses this to run version-specific fixes.
const CURRENT_SAVE_VERSION = 2;

// Validates the ship object after save loading — fills in any missing or
// invalid fields from the defaults so components can safely access
// state.ship.* without null checks. This is the post-merge guard that
// prevents the most common legacy-save crash (undefined ship properties).
function validateShip(ship, defaultShip) {
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

// Ship definitions
export const SHIP_TYPES = [
  { id: 'sidewinder', name: 'Sparrowhawk Mk-I', manufacturer: 'Drake-Voss', cargoCapacity: 4, fuelCapacity: 8, jumpRange: 8, cost: 0, multirole: true, class: 1 },
  { id: 'hauler', name: 'Packmule', manufacturer: 'Orion Heavy', cargoCapacity: 22, fuelCapacity: 16, jumpRange: 10, cost: 52000, multirole: false, class: 1 },
  { id: 'cobra', name: 'Drake Mk-III', manufacturer: 'Drake-Voss', cargoCapacity: 18, fuelCapacity: 16, jumpRange: 12, cost: 350000, multirole: true, class: 2 },
  { id: 'type6', name: 'Caravan Mk-VI', manufacturer: 'Orion Heavy', cargoCapacity: 50, fuelCapacity: 32, jumpRange: 15, cost: 1000000, multirole: false, class: 2 },
  { id: 'diamondback', name: 'Kingfisher Surveyor', manufacturer: 'Orion Heavy', cargoCapacity: 16, fuelCapacity: 32, jumpRange: 20, cost: 1900000, multirole: true, class: 2 },
  { id: 'asp', name: 'Heron Surveyor', manufacturer: 'Orion Heavy', cargoCapacity: 28, fuelCapacity: 32, jumpRange: 18, cost: 6600000, multirole: true, class: 2 },
  { id: 'type7', name: 'Caravan Mk-VII', manufacturer: 'Orion Heavy', cargoCapacity: 96, fuelCapacity: 32, jumpRange: 14, cost: 17000000, multirole: false, class: 3 },
  { id: 'python', name: 'Albatross', manufacturer: 'Drake-Voss', cargoCapacity: 56, fuelCapacity: 32, jumpRange: 16, cost: 56000000, multirole: true, class: 3 },
  { id: 'type9', name: 'Caravan Mk-IX', manufacturer: 'Orion Heavy', cargoCapacity: 220, fuelCapacity: 64, jumpRange: 10, cost: 78000000, multirole: false, class: 4 },
  { id: 'anaconda', name: 'Roc', manufacturer: 'Drake-Voss', cargoCapacity: 114, fuelCapacity: 64, jumpRange: 18, cost: 146000000, multirole: true, class: 4 },
  { id: 'eagle', name: 'Peregrine Mk-II', manufacturer: 'Sentinel Forge', cargoCapacity: 2, fuelCapacity: 8, jumpRange: 7, cost: 44800, multirole: true, class: 1 },
  { id: 'adder', name: 'Osprey', manufacturer: 'Kepler Aeroworks', cargoCapacity: 6, fuelCapacity: 8, jumpRange: 10, cost: 87200, multirole: true, class: 1 },
  { id: 'viper', name: 'Shrike Mk-III', manufacturer: 'Drake-Voss', cargoCapacity: 2, fuelCapacity: 8, jumpRange: 9, cost: 143000, multirole: false, class: 1 },
  { id: 'cobramk4', name: 'Drake Mk-IV', manufacturer: 'Drake-Voss', cargoCapacity: 20, fuelCapacity: 16, jumpRange: 11, cost: 745000, multirole: true, class: 2 },
  { id: 'dolphin', name: 'Narwhal', manufacturer: 'Meridian Luxe', cargoCapacity: 6, fuelCapacity: 16, jumpRange: 15, cost: 1500000, multirole: true, class: 2 },
  { id: 'cobramk5', name: 'Drake Mk-V', manufacturer: 'Drake-Voss', cargoCapacity: 18, fuelCapacity: 16, jumpRange: 13, cost: 3900000, multirole: true, class: 2 },
  { id: 'federal_dropship', name: 'Republic Trooper', manufacturer: 'Sentinel Forge', cargoCapacity: 6, fuelCapacity: 32, jumpRange: 12, cost: 4900000, multirole: false, class: 3 },
  { id: 'vulture', name: 'Raven', manufacturer: 'Sentinel Forge', cargoCapacity: 2, fuelCapacity: 32, jumpRange: 11, cost: 5100000, multirole: false, class: 2 },
  { id: 'imperial_courier', name: 'Dynast Herald', manufacturer: 'Solaris Dynasty', cargoCapacity: 8, fuelCapacity: 32, jumpRange: 13, cost: 5400000, multirole: true, class: 2 },
  { id: 'mandalay', name: 'Wanderer', manufacturer: 'Kepler Aeroworks', cargoCapacity: 20, fuelCapacity: 32, jumpRange: 22, cost: 18500000, multirole: true, class: 2 },
  { id: 'alliance_chieftain', name: 'Coalition Flagship', manufacturer: 'Orion Heavy', cargoCapacity: 2, fuelCapacity: 32, jumpRange: 13, cost: 19000000, multirole: false, class: 3 },
  { id: 'federal_assault', name: 'Republic Vanguard', manufacturer: 'Sentinel Forge', cargoCapacity: 4, fuelCapacity: 32, jumpRange: 12, cost: 19800000, multirole: false, class: 3 },
  { id: 'imperial_clipper', name: 'Dynast Schooner', manufacturer: 'Solaris Dynasty', cargoCapacity: 34, fuelCapacity: 32, jumpRange: 14, cost: 22300000, multirole: true, class: 3 },
  { id: 'alliance_crusader', name: 'Coalition Paladin', manufacturer: 'Orion Heavy', cargoCapacity: 4, fuelCapacity: 32, jumpRange: 12, cost: 22800000, multirole: false, class: 3 },
  { id: 'alliance_challenger', name: 'Coalition Titan', manufacturer: 'Orion Heavy', cargoCapacity: 6, fuelCapacity: 32, jumpRange: 13, cost: 30800000, multirole: false, class: 3 },
  { id: 'type8', name: 'Caravan Mk-VIII', manufacturer: 'Orion Heavy', cargoCapacity: 76, fuelCapacity: 32, jumpRange: 15, cost: 36000000, multirole: false, class: 3 },
  { id: 'krait_phantom', name: 'Harrier Wraith', manufacturer: 'Drake-Voss', cargoCapacity: 14, fuelCapacity: 32, jumpRange: 17, cost: 37300000, multirole: true, class: 2 },
  { id: 'krait_mk2', name: 'Harrier Mk-II', manufacturer: 'Drake-Voss', cargoCapacity: 18, fuelCapacity: 32, jumpRange: 16, cost: 45300000, multirole: true, class: 2 },
  { id: 'orca', name: 'Cachalot', manufacturer: 'Meridian Luxe', cargoCapacity: 8, fuelCapacity: 32, jumpRange: 15, cost: 48500000, multirole: false, class: 3 },
  { id: 'mamba', name: 'Condor', manufacturer: 'Kepler Aeroworks', cargoCapacity: 2, fuelCapacity: 32, jumpRange: 12, cost: 56500000, multirole: false, class: 2 },
  { id: 'python_mk2', name: 'Albatross Mk-II', manufacturer: 'Drake-Voss', cargoCapacity: 20, fuelCapacity: 32, jumpRange: 14, cost: 75000000, multirole: false, class: 3 },
  { id: 'beluga', name: 'Leviathan Cruiser', manufacturer: 'Meridian Luxe', cargoCapacity: 12, fuelCapacity: 64, jumpRange: 14, cost: 85000000, multirole: false, class: 3 },
  { id: 'type10', name: 'Bastion Mk-X', manufacturer: 'Orion Heavy', cargoCapacity: 128, fuelCapacity: 64, jumpRange: 9, cost: 125000000, multirole: false, class: 4 },
  { id: 'federal_corvette', name: 'Republic Dreadnought', manufacturer: 'Sentinel Forge', cargoCapacity: 16, fuelCapacity: 64, jumpRange: 15, cost: 190000000, multirole: false, class: 4 },
  { id: 'imperial_cutter', name: 'Dynast Sovereign', manufacturer: 'Solaris Dynasty', cargoCapacity: 120, fuelCapacity: 64, jumpRange: 16, cost: 210000000, multirole: true, class: 4 },
  ...ADDITIONAL_SHIPS,
];

export const SHIP_MAP = SHIP_TYPES.reduce((m, s) => { m[s.id] = s; return m; }, {});

// Mission types
export const MISSION_TYPES = {
  DELIVERY: 'delivery',
  COURIER: 'courier',
  MINING: 'mining',
  PASSENGER: 'passenger',
  SALVAGE: 'salvage',
  EXPLORATION: 'exploration',
  COLONIZATION_SUPPLY: 'colonization_supply',
  SURFACE_SCAN: 'surface_scan',
};

function createInitialState() {
  return {
    version: CURRENT_SAVE_VERSION,
    saveMode: 'normal',
    credits: 100000,
    ship: {
      type: 'sidewinder',
      name: 'Sparrowhawk Mk-I',
      cargo: [], // [{commodity, qty}]
      fuel: 8,
      fuelCapacity: 8,
      cargoCapacity: 4,
      modules: getDefaultModules('sidewinder'),
      integrity: 100,
      moduleWear: 0,
      cockpitDecoration: { parts: {} },
    },
    currentSystem: STARTING_SYSTEM,
    currentLocation: 'station', // 'system' | 'station'
    currentStationId: 'station_0',
    // Cached system data
    currentSystemData: null,
    // Discovery data
    discoveredSystems: {}, // seed -> { name, firstDiscovered, scanValue, bodyCount }
    scannedBodies: {}, // bodyId -> { scanType, value, date }
    soldExplorationData: [], // list of sold data entries
    // Missions
    activeMissions: [],
    // Colonization
    colonies: [],
    // Stats
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
    // Refinery (mining yields)
    refinery: [], // [{materialId, qty}]
    refineryCapacity: 4,
    // Ship locker (materials)
    materials: {}, // materialId -> qty
    // Navigation
    plottedRoute: null,
    // Flight log (last 50 visited systems for trail display)
    flightLog: [],
    // Bookmarks
    bookmarkedSystems: [],
    // FSS & Surface scanning
    fssScannedSystems: {},
    fssDiscoveredBodies: {},
    probeProgress: {},
    mappedBodies: {},
    surfaceDiscoveries: {},
    currentSurfaceBody: null,
    // Fleet
    ownedShips: [],
    fleetCarriers: [],
    // Custom ships
    customShips: [],
    shipyard: null,
    // Company (passive income)
    company: null,
    // Cheats (unlocked by finding Sol)
    cheats: {
      unlocked: false,
      active: {},
    },
    // Achievements
    achievements: {
      firstDiscoveries: {},
      milestones: {},
      scannedSystemSeeds: [],
      systemsScanned: 0,
      totalBodiesScanned: 0,
    },
    // Leaderboard records
    records: {},
    // Player badge (personal icon)
    playerBadge: null,
    // Saved badge designs gallery
    savedBadges: [],
    // Custom carrier designs
    customCarrierDesigns: [],
    // Custom station designs
    customStationDesigns: [],
    // Last body orbited (for returning from surface to correct orbit)
    lastOrbitBodyId: null,
    // Settings
    settings: {
      crtEffect: true,
      scanlines: true,
      textBrightness: 100,
      miniScreen: false,
      colorTheme: 'elite',
      sound: {
        enabled: true,
        sfxVolume: 0.7,
        musicVolume: 0.4,
        musicPreset: 'standard',
        customTracks: {},
      },
    },
    crew: [],
    powerPlay: null,
    communityGoals: [],
    lastGoalRefresh: Date.now(),
    fsdBoost: false,
    heatSinkCharges: 0,
    activeEncounter: null,
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
    warpGates: [],
    eventCooldownUntil: 0,
    carrierRooms: {},
    carrierRoomGrid: {},
    carrierCurrentRoom: {},
    aquaticLife: { collected: [], tankIds: [], tankCapacity: 8 },
    floraCollection: { collected: [], displayIds: [], capacity: 8 },
    createdAt: Date.now(),
  };
}

function createSandboxState() {
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

const GameStateContext = createContext(null);

export function GameStateProvider({ children, saveSlot = 'normal', onSwitchSave }) {
  const [state, setState] = useState(() => saveSlot === 'sandbox' ? createSandboxState() : createInitialState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const storageKey = saveSlot === 'sandbox' ? STORAGE_KEY_SANDBOX : STORAGE_KEY;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        setState(prev => {
          const merged = { ...prev, ...parsed,
          settings: { ...prev.settings, ...(parsed.settings || {}), sound: { ...(prev.settings?.sound || {}), ...(parsed.settings?.sound || {}) } },
          achievements: {
            firstDiscoveries: {}, milestones: {}, scannedSystemSeeds: [], systemsScanned: 0, totalBodiesScanned: 0,
            ...(parsed.achievements || {}),
          },
          ownedShips: parsed.ownedShips || [],
          fleetCarriers: parsed.fleetCarriers || [],
          customShips: parsed.customShips || [],
          shipyard: parsed.shipyard || null,
          company: parsed.company || null,
          cheats: { unlocked: false, active: {}, ...(parsed.cheats || {}) },
          records: parsed.records || {},
          bookmarkedSystems: parsed.bookmarkedSystems || [],
          fssScannedSystems: parsed.fssScannedSystems || {},
          fssDiscoveredBodies: parsed.fssDiscoveredBodies || {},
          probeProgress: parsed.probeProgress || {},
          mappedBodies: parsed.mappedBodies || {},
          surfaceDiscoveries: parsed.surfaceDiscoveries || {},
          flightLog: parsed.flightLog || [],
          playerBadge: parsed.playerBadge || null,
          savedBadges: parsed.savedBadges || [],
          customCarrierDesigns: parsed.customCarrierDesigns || [],
          customStationDesigns: parsed.customStationDesigns || [],
          lastOrbitBodyId: parsed.lastOrbitBodyId || null,
          crew: parsed.crew || [],
          powerPlay: parsed.powerPlay || null,
          communityGoals: parsed.communityGoals || [],
          lastGoalRefresh: parsed.lastGoalRefresh || Date.now(),
          fsdBoost: parsed.fsdBoost || false,
          heatSinkCharges: parsed.heatSinkCharges || 0,
          activeEncounter: parsed.activeEncounter || null,
          crime: parsed.crime || { notoriety: 0, bounty: 0, crimes: [], lastCrime: 0 },
          bountyMissions: parsed.bountyMissions || [],
          wingmates: parsed.wingmates || [],
          passengerMissions: parsed.passengerMissions || [],
          activeCombat: parsed.activeCombat || null,
          crewRoles: parsed.crewRoles || { pilot: null, gunner: null, shield: null, engineer: null },
          ownedStations: parsed.ownedStations || [],
          fighters: parsed.fighters || [],
          exobiologyCodex: parsed.exobiologyCodex || {},
          missionChains: parsed.missionChains || [],
          factionRep: parsed.factionRep || {},
          loadoutPresets: parsed.loadoutPresets || [],
          timeEvents: parsed.timeEvents || [],
          playerTitle: parsed.playerTitle || null,
          notebook: parsed.notebook || '',
          surfaceMaps: parsed.surfaceMaps || {},
          warpGates: parsed.warpGates || [],
          eventCooldownUntil: parsed.eventCooldownUntil || 0,
          carrierRooms: parsed.carrierRooms || {},
          carrierRoomGrid: parsed.carrierRoomGrid || {},
          carrierCurrentRoom: parsed.carrierCurrentRoom || {},
          aquaticLife: parsed.aquaticLife || { collected: [], tankIds: [], tankCapacity: 8 },
          floraCollection: parsed.floraCollection || { collected: [], displayIds: [], capacity: 8 },
          ship: validateShip({ ...prev.ship, ...(parsed.ship || {}), cockpitDecoration: parsed.ship?.cockpitDecoration || { parts: {} } }, prev.ship),
          saveMode: saveSlot,
          lightYearsTraveled: parsed.lightYearsTraveled || 0,
          lifetimeEarnings: parsed.lifetimeEarnings || 0,
          shipsPurchased: parsed.shipsPurchased || 0,
          version: CURRENT_SAVE_VERSION,
        };
          // Regenerate system data for the current system (not persisted since it's large)
          if (merged.currentSystem) {
            merged.currentSystemData = generateSystem(merged.currentSystem.seed, merged.currentSystem.starClass, merged.currentSystem.population);
          }
          return merged;
        });
      } else {
        // No save — generate initial system data
        setState(prev => ({
          ...prev,
          currentSystemData: generateSystem(prev.currentSystem.seed, prev.currentSystem.starClass, prev.currentSystem.population),
        }));
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
  }, []);

  // Save to localStorage on changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state, storageKey]);

  // Update function
  const update = useCallback((updater) => {
    setState(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  // Get or generate current system data (cached in state)
  const getSystemData = useCallback((system = stateRef.current.currentSystem) => {
    if (!system) return null;
    // Check if we have cached data
    if (stateRef.current.currentSystemData &&
        stateRef.current.currentSystemData.seed === system.seed) {
      return stateRef.current.currentSystemData;
    }
    const data = generateSystem(system.seed, system.starClass, system.population);
    return data;
  }, []);

  // Set current system and generate its data
  const setCurrentSystem = useCallback((system) => {
    soundEngine.play('jump');
    const systemData = generateSystem(system.seed, system.starClass, system.population);
    setState(prev => {
      const dist = distance3D(prev.currentSystem, system);
      const isNeutron = system.starClass?.class === 'NS';
      const crewBonuses = getCrewBonuses(prev.crew);
      const wearReduction = crewBonuses.wearReduction || 0;
      let wear = dist * 0.01;
      if (isNeutron) wear += 5;
      if (prev.heatSinkCharges > 0) wear *= 0.3;
      wear *= (1 - wearReduction);
      const newIntegrity = Math.max(0, (prev.ship.integrity ?? 100) - wear);
      const newModuleWear = Math.min(100, (prev.ship.moduleWear ?? 0) + wear * 0.5);
      // Fuel consumption — 0.5 T per LY, halved by FSD boost (neutron star)
      const hasFuelCheat = prev.cheats?.unlocked && (prev.cheats?.active?.instant_jumps || prev.cheats?.active?.infinite_fuel);
      const fuelCost = hasFuelCheat ? 0 : Math.ceil(dist * (prev.fsdBoost ? 0.25 : 0.5) * getHolidayFuelMultiplier());
      const newFuel = Math.max(0, (prev.ship.fuel ?? 0) - fuelCost);
      return {
        ...prev,
        currentSystem: system,
        currentSystemData: systemData,
        currentLocation: 'system',
        currentStationId: null,
        totalJumps: prev.totalJumps + 1,
        lightYearsTraveled: (prev.lightYearsTraveled || 0) + dist,
        flightLog: [...(prev.flightLog || []), { seed: system.seed, name: system.name, x: system.x, y: system.y, z: system.z }].slice(-50),
        discoveredSystems: {
          ...prev.discoveredSystems,
          [system.seed]: prev.discoveredSystems[system.seed] || {
            name: system.name,
            firstDiscovered: true,
            bodyCount: systemData.bodyCount,
            scanValue: 0,
            originCoords: { x: system.x, y: system.y, z: system.z },
          },
        },
        fsdBoost: false,
        heatSinkCharges: Math.max(0, (prev.heatSinkCharges || 0) - (isNeutron ? 1 : 0)),
        ship: { ...prev.ship, fuel: newFuel, integrity: newIntegrity, moduleWear: newModuleWear },
        ...(system.seed === SOL_SYSTEM.seed && !prev.cheats?.unlocked ? {
          cheats: { ...prev.cheats, unlocked: true },
          achievements: {
            ...prev.achievements,
            milestones: {
              ...prev.achievements?.milestones,
              found_sol: prev.achievements?.milestones?.found_sol || { date: Date.now() },
            },
          },
        } : {}),
        activeEncounter: shouldTriggerEncounter(system) ? generateEncounter(system) : null,
        passengerMissions: (prev.passengerMissions || []).map(m =>
          m.jumpsCompleted < m.jumpsRequired ? { ...m, jumpsCompleted: m.jumpsCompleted + 1 } : m
        ),
      };
    });
  }, []);

  // Dock at a station
  const dockAtStation = useCallback((stationId) => {
    soundEngine.play('dock');
    setState(prev => ({
      ...prev,
      currentLocation: 'station',
      currentStationId: stationId,
    }));
  }, []);

  // Leave station
  const leaveStation = useCallback(() => {
    soundEngine.play('undock');
    setState(prev => ({
      ...prev,
      currentLocation: 'system',
      currentStationId: null,
    }));
  }, []);

  // Add credits
  const addCredits = useCallback((amount) => {
    setState(prev => ({
      ...prev,
      credits: prev.credits + amount,
      totalProfit: prev.totalProfit + (amount > 0 ? amount : 0),
      lifetimeEarnings: (prev.lifetimeEarnings || 0) + (amount > 0 ? amount : 0),
    }));
  }, []);

  // Update cargo
  const updateCargo = useCallback((newCargo) => {
    setState(prev => ({
      ...prev,
      ship: { ...prev.ship, cargo: newCargo },
    }));
  }, []);

  // Add to cargo
  const addCargo = useCallback((commodityId, qty) => {
    setState(prev => {
      const cargo = [...prev.ship.cargo];
      const existing = cargo.find(c => c.commodity === commodityId);
      if (existing) {
        existing.qty += qty;
      } else {
        cargo.push({ commodity: commodityId, qty });
      }
      return { ...prev, ship: { ...prev.ship, cargo } };
    });
  }, []);

  // Remove from cargo
  const removeCargo = useCallback((commodityId, qty) => {
    setState(prev => {
      const cargo = [...prev.ship.cargo];
      const existing = cargo.find(c => c.commodity === commodityId);
      if (existing) {
        existing.qty -= qty;
        if (existing.qty <= 0) {
          const idx = cargo.indexOf(existing);
          cargo.splice(idx, 1);
        }
      }
      return { ...prev, ship: { ...prev.ship, cargo } };
    });
  }, []);

  // Refuel
  const refuel = useCallback((amount) => {
    setState(prev => {
      const newFuel = Math.min(prev.ship.fuel + amount, prev.ship.fuelCapacity);
      return { ...prev, ship: { ...prev.ship, fuel: newFuel } };
    });
  }, []);

  // Buy a ship — stores current ship at current station, activates new ship
  const buyShip = useCallback((shipTypeId, customName) => {
    setState(prev => {
      if (prev.currentLocation !== 'station') return prev;
      const shipType = SHIP_MAP[shipTypeId];
      if (!shipType) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < shipType.cost) return prev;
      const oldShip = {
        id: `ship_${Date.now()}`,
        typeId: prev.ship.type,
        customName: prev.ship.name,
        storedAt: { systemSeed: prev.currentSystem.seed, stationId: prev.currentStationId },
        cargo: prev.ship.cargo,
        fuel: prev.ship.fuel,
        modules: prev.ship.modules || getDefaultModules(prev.ship.type),
        cockpitDecoration: prev.ship.cockpitDecoration || { parts: {} },
        };
        const newMods = getDefaultModules(shipType.id);
      const newStats = computeShipStats(shipType.id, newMods);
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : shipType.cost),
        shipsPurchased: (prev.shipsPurchased || 0) + 1,
        ship: {
          type: shipType.id,
          name: customName || shipType.name,
          cargo: [],
          fuel: newStats.fuelCapacity,
          fuelCapacity: newStats.fuelCapacity,
          cargoCapacity: newStats.cargoCapacity,
          modules: newMods,
          cockpitDecoration: { parts: {} },
        },
        ownedShips: [...prev.ownedShips, oldShip],
        achievements: {
          ...prev.achievements,
          milestones: {
            ...prev.achievements?.milestones,
            ...(prev.achievements?.milestones?.first_ship_purchase ? {} : { first_ship_purchase: { date: Date.now() } }),
          },
        },
      };
    });
  }, []);

  // Switch to a stored ship (must be at same station or carrier in current system)
  const switchShip = useCallback((shipId) => {
    setState(prev => {
      const stored = prev.ownedShips.find(s => s.id === shipId);
      if (!stored) return prev;
      let canAccess = false;
      if (stored.storedAt?.carrierId) {
        const c = prev.fleetCarriers.find(c => c.id === stored.storedAt.carrierId);
        canAccess = c && c.systemSeed === prev.currentSystem.seed;
      } else if (stored.storedAt) {
        canAccess = stored.storedAt.systemSeed === prev.currentSystem.seed && stored.storedAt.stationId === prev.currentStationId;
      }
      if (!canAccess) return prev;
      const shipType = SHIP_MAP[stored.typeId];
      if (!shipType) return prev;
      const oldShip = {
        id: `ship_${Date.now()}`,
        typeId: prev.ship.type,
        customName: prev.ship.name,
        storedAt: { systemSeed: prev.currentSystem.seed, stationId: prev.currentStationId },
        cargo: prev.ship.cargo,
        fuel: prev.ship.fuel,
        modules: prev.ship.modules || getDefaultModules(prev.ship.type),
        cockpitDecoration: prev.ship.cockpitDecoration || { parts: {} },
        };
        const storedMods = stored.modules || getDefaultModules(stored.typeId);
      const storedStats = computeShipStats(stored.typeId, storedMods);
      return {
        ...prev,
        ship: {
          type: stored.typeId,
          name: stored.customName,
          cargo: stored.cargo || [],
          fuel: stored.fuel || shipType.fuelCapacity,
          fuelCapacity: storedStats.fuelCapacity,
          cargoCapacity: storedStats.cargoCapacity,
          modules: storedMods,
          cockpitDecoration: stored.cockpitDecoration || { parts: {} },
        },
        ownedShips: [...prev.ownedShips.filter(s => s.id !== shipId), oldShip],
      };
    });
  }, []);

  // Transfer a stored ship to current station (costs credits)
  const transferShip = useCallback((shipId) => {
    setState(prev => {
      const stored = prev.ownedShips.find(s => s.id === shipId);
      if (!stored) return prev;
      const shipType = SHIP_MAP[stored.typeId];
      if (!shipType) return prev;
      const isSb = prev.saveMode === 'sandbox';
      const cost = isSb ? 0 : (Math.ceil(shipType.cost * 0.01) + 10000);
      if (!isSb && prev.credits < cost) return prev;
      return {
        ...prev,
        credits: prev.credits - cost,
        ownedShips: prev.ownedShips.map(s => s.id === shipId ? { ...s, storedAt: { systemSeed: prev.currentSystem.seed, stationId: prev.currentStationId } } : s),
      };
    });
  }, []);

  // Rename a ship (current or stored)
  const renameShip = useCallback((shipId, name) => {
    setState(prev => {
      if (shipId === 'current') return { ...prev, ship: { ...prev.ship, name } };
      return { ...prev, ownedShips: prev.ownedShips.map(s => s.id === shipId ? { ...s, customName: name } : s) };
    });
  }, []);

  // Buy a fleet carrier (only at high-population vendor systems)
  const buyFleetCarrier = useCallback((name) => {
    const CARRIER_COST = 5000000000;
    setState(prev => {
      if (prev.fleetCarriers.length >= 5) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb) {
        if (prev.credits < CARRIER_COST) return prev;
        if ((prev.currentSystem?.population || 0) <= 1000000000) return prev;
      }
      const carrier = {
        id: `carrier_${Date.now()}`,
        name: name || 'Unnamed Carrier',
        systemSeed: prev.currentSystem.seed,
        systemName: prev.currentSystem.name,
        system: prev.currentSystem,
        tritium: 100,
        tritiumCapacity: 1000,
        bankBalance: 0,
        services: { market: false, shipyard: false, outfitting: false, refuel: true, repair: true },
        orders: [],
        lastIncomeCollection: Date.now(),
        interior: { roomItems: [], savedPlants: [], barTab: 0 },
        design: null,
        cockpitDecoration: { parts: {} },
      };
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : CARRIER_COST),
        fleetCarriers: [...prev.fleetCarriers, carrier],
        achievements: {
          ...prev.achievements,
          milestones: { ...prev.achievements.milestones, first_carrier: prev.achievements.milestones?.first_carrier || { date: Date.now() } },
        },
      };
    });
  }, []);

  // Jump a fleet carrier to a new system (costs tritium)
  const jumpCarrier = useCallback((carrierId, targetSystem) => {
    setState(prev => {
      const c = prev.fleetCarriers.find(c => c.id === carrierId);
      if (!c || !c.system) return prev;
      const dist = distance3D({ x: c.system.x, y: c.system.y, z: c.system.z }, { x: targetSystem.x, y: targetSystem.y, z: targetSystem.z });
      const isSb = prev.saveMode === 'sandbox';
      const tritiumCost = isSb ? 0 : Math.ceil(dist / 10);
      if (!isSb && c.tritium < tritiumCost) return prev;
      return {
        ...prev,
        fleetCarriers: prev.fleetCarriers.map(fc => fc.id === carrierId
          ? { ...fc, system: targetSystem, systemSeed: targetSystem.seed, systemName: targetSystem.name, tritium: fc.tritium - tritiumCost }
          : fc),
      };
    });
  }, []);

  // Rename a fleet carrier
  const renameCarrier = useCallback((carrierId, name) => {
    setState(prev => ({ ...prev, fleetCarriers: prev.fleetCarriers.map(c => c.id === carrierId ? { ...c, name } : c) }));
  }, []);

  // Scan a body — tracks achievements and first discoveries
  const scanBody = useCallback((body) => {
    setState(prev => {
      if (prev.scannedBodies[body.id]) return prev;
      const ach = { ...(prev.achievements || {}) };
      ach.firstDiscoveries = { ...(ach.firstDiscoveries || {}) };
      ach.milestones = { ...(ach.milestones || {}) };
      ach.scannedSystemSeeds = [...(ach.scannedSystemSeeds || [])];
      ach.totalBodiesScanned = (ach.totalBodiesScanned || 0) + 1;
      if (!ach.scannedSystemSeeds.includes(prev.currentSystem.seed)) {
        ach.scannedSystemSeeds.push(prev.currentSystem.seed);
      }
      ach.systemsScanned = ach.scannedSystemSeeds.length;
      const sysName = prev.currentSystem.name;
      if (body.type === 'star' && body.starClass) {
        const cls = body.starClass.class;
        const starAchId = `star_${cls}`;
        if (!ach.firstDiscoveries[starAchId]) ach.firstDiscoveries[starAchId] = { system: sysName, date: Date.now() };
        if (cls === 'NS' && !ach.firstDiscoveries.neutron_star) ach.firstDiscoveries.neutron_star = { system: sysName, date: Date.now() };
        if (cls === 'BH' && !ach.firstDiscoveries.black_hole) ach.firstDiscoveries.black_hole = { system: sysName, date: Date.now() };
      }
      if (body.type === 'planet') {
        const planetAchId = `planet_${body.planetType}`;
        if (!ach.firstDiscoveries[planetAchId]) ach.firstDiscoveries[planetAchId] = { system: sysName, date: Date.now() };
        if (body.planetType === 'ammonia' && !ach.firstDiscoveries.ammonia_world) ach.firstDiscoveries.ammonia_world = { system: sysName, date: Date.now() };
        if (body.planetType === 'earthlike' && !ach.firstDiscoveries.earth_like) ach.firstDiscoveries.earth_like = { system: sysName, date: Date.now() };
        if (body.planetType === 'water_world' && !ach.firstDiscoveries.water_world) ach.firstDiscoveries.water_world = { system: sysName, date: Date.now() };
        if (body.habitable && !ach.firstDiscoveries.habitable_world) ach.firstDiscoveries.habitable_world = { system: sysName, date: Date.now() };
        if (body.planetType === 'terracformed' && !ach.firstDiscoveries.terraformed_world) ach.firstDiscoveries.terraformed_world = { system: sysName, date: Date.now() };
      }
      // Check leaderboard records
      const records = { ...(prev.records || {}) };
      const sysData = prev.currentSystemData;
      const checkRecord = (key, value, bodyName, isMax = true) => {
        if (value == null || isNaN(value)) return;
        const existing = records[key];
        const isNew = !existing || (isMax ? value > existing.value : value < existing.value);
        if (isNew) records[key] = { value, bodyName, systemName: sysName, date: Date.now() };
      };
      if (body.type === 'star') {
        checkRecord('smallest_sun', body.radius, body.name, false);
        checkRecord('largest_sun', body.radius, body.name, true);
        checkRecord('hottest_star', body.temperature, body.name, true);
        checkRecord('coldest_star', body.temperature, body.name, false);
      }
      if (body.type === 'planet' || body.type === 'moon') {
        checkRecord('hottest_planet', body.temperature, body.name, true);
        checkRecord('coldest_planet', body.temperature, body.name, false);
        checkRecord('fastest_orbit', body.orbitPeriod, body.name, false);
        checkRecord('slowest_orbit', body.orbitPeriod, body.name, true);
        checkRecord('highest_gravity', body.gravity, body.name, true);
        checkRecord('lowest_gravity', body.gravity, body.name, false);
        checkRecord('closest_to_star', body.orbitRadius, body.name, false);
        checkRecord('farthest_from_star', body.orbitRadius, body.name, true);
      }
      if (body.type === 'planet') {
        checkRecord('largest_planet', body.radius, body.name, true);
        checkRecord('smallest_planet', body.radius, body.name, false);
        if (sysData?.bodies) {
          const moonCount = sysData.bodies.filter(b => b.type === 'moon' && b.parent === body.id).length;
          checkRecord('most_moons', moonCount, body.name, true);
        }
      }
      return {
        ...prev,
        scannedBodies: { ...prev.scannedBodies, [body.id]: { scanType: 'detailed', value: body.scanValue, date: Date.now(), originCoords: { x: prev.currentSystem.x, y: prev.currentSystem.y, z: prev.currentSystem.z } } },
        achievements: ach,
        records,
      };
    });
  }, []);

  // Sell exploration data
  const sellExplorationData = useCallback(() => {
    setState(prev => {
      const cur = { x: prev.currentSystem.x, y: prev.currentSystem.y, z: prev.currentSystem.z };
      const MIN_DIST = 20;
      let totalValue = 0;
      const soldBodies = [];
      const remainingBodies = {};
      for (const [bodyId, scan] of Object.entries(prev.scannedBodies)) {
        if (scan.originCoords && distance3D(cur, scan.originCoords) < MIN_DIST) {
          remainingBodies[bodyId] = scan;
        } else {
          totalValue += scan.value;
          soldBodies.push(bodyId);
        }
      }
      // Add system discovery bonuses (only for unsold ones, 20+ LY from origin)
      let systemBonus = 0;
      const updatedDiscovered = {};
      for (const [seed, sys] of Object.entries(prev.discoveredSystems)) {
        if (sys.firstDiscovered && !sys.bonusSold) {
          if (sys.originCoords && distance3D(cur, sys.originCoords) < MIN_DIST) {
            updatedDiscovered[seed] = sys;
          } else {
            systemBonus += 5000 + (sys.bodyCount || 0) * 500;
            updatedDiscovered[seed] = { ...sys, bonusSold: true };
          }
        } else {
          updatedDiscovered[seed] = sys;
        }
      }
      let surfaceValue = 0;
      const remainingSurfaceDisc = {};
      for (const [key, disc] of Object.entries(prev.surfaceDiscoveries || {})) {
        if (disc.originCoords && distance3D(cur, disc.originCoords) < MIN_DIST) {
          remainingSurfaceDisc[key] = disc;
        } else {
          surfaceValue += disc.value || 0;
        }
      }
      // Sell surface maps (non-mission-locked, 20+ LY from origin)
      let surfaceMapValue = 0;
      let mapsSold = 0;
      const remainingMaps = {};
      for (const [mapId, map] of Object.entries(prev.surfaceMaps || {})) {
        if (map.missionLocked) {
          remainingMaps[mapId] = map;
        } else if (map.originCoords && distance3D(cur, map.originCoords) < MIN_DIST) {
          remainingMaps[mapId] = map;
        } else {
          surfaceMapValue += map.value || 0;
          mapsSold++;
        }
      }
      const crewBonuses = getCrewBonuses(prev.crew);
      const scanMult = 1 + (crewBonuses.scanValue || 0);
      const totalPayout = Math.floor((totalValue + systemBonus + surfaceValue + surfaceMapValue) * scanMult);
      if (totalPayout === 0) return prev;
      return {
        ...prev,
        credits: prev.credits + totalPayout,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + totalPayout,
        soldExplorationData: [...prev.soldExplorationData, { value: totalPayout, date: Date.now(), bodies: soldBodies.length + mapsSold }],
        scannedBodies: remainingBodies,
        discoveredSystems: updatedDiscovered,
        surfaceDiscoveries: remainingSurfaceDisc,
        surfaceMaps: remainingMaps,
        rank: {
          ...prev.rank,
          exploration: updateRank(prev.rank.exploration, totalPayout),
        },
      };
    });
  }, []);

  // Add a mission
  const addMission = useCallback((mission) => {
    setState(prev => ({
      ...prev,
      activeMissions: [...prev.activeMissions, mission],
    }));
  }, []);

  // Complete a mission
  const completeMission = useCallback((missionId) => {
    setState(prev => {
      const mission = prev.activeMissions.find(m => m.id === missionId);
      if (!mission) return prev;
      return {
        ...prev,
        activeMissions: prev.activeMissions.filter(m => m.id !== missionId),
        credits: prev.credits + (mission.reward || 0),
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + (mission.reward || 0),
        rank: {
          ...prev.rank,
          trade: updateRank(prev.rank.trade, mission.reward || 0),
        },
      };
    });
  }, []);

  // Add a colony — tracks first colony milestone
  const addColony = useCallback((colony) => {
    setState(prev => ({
      ...prev,
      colonies: [...prev.colonies, colony],
      achievements: {
        ...prev.achievements,
        milestones: { ...prev.achievements.milestones, first_colony: prev.achievements.milestones?.first_colony || { system: colony.systemName, date: Date.now() } },
      },
    }));
  }, []);

  // Update a colony
  const updateColony = useCallback((colonyId, updates) => {
    setState(prev => ({
      ...prev,
      colonies: prev.colonies.map(c => c.id === colonyId ? { ...c, ...updates } : c),
    }));
  }, []);

  // Add material to locker
  const addMaterial = useCallback((materialId, qty) => {
    setState(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [materialId]: (prev.materials[materialId] || 0) + qty,
      },
    }));
  }, []);

  // Plot a route
  const plotRoute = useCallback((route) => {
    setState(prev => ({ ...prev, plottedRoute: route }));
  }, []);

  // Update display settings
  const updateSettings = useCallback((updates) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

  // Update commander notebook
  const updateNotebook = useCallback((text) => {
    setState(prev => ({ ...prev, notebook: text }));
  }, []);

  // Lock a surface map to a mission (when accepting a surface scan mission)
  const lockSurfaceMap = useCallback((missionId, systemSeed) => {
    setState(prev => {
      const maps = { ...(prev.surfaceMaps || {}) };
      for (const [mapId, map] of Object.entries(maps)) {
        if (!map.missionLocked && map.systemSeed === systemSeed) {
          maps[mapId] = { ...map, missionLocked: missionId };
          break;
        }
      }
      return { ...prev, surfaceMaps: maps };
    });
  }, []);

  // Unlock surface maps locked to a completed mission
  const unlockSurfaceMaps = useCallback((missionId) => {
    setState(prev => {
      const maps = { ...(prev.surfaceMaps || {}) };
      for (const [mapId, map] of Object.entries(maps)) {
        if (map.missionLocked === missionId) {
          maps[mapId] = { ...map, missionLocked: null };
        }
      }
      return { ...prev, surfaceMaps: maps };
    });
  }, []);

  // Decommission a fleet carrier (75% refund, ships relocated)
  const decommissionCarrier = useCallback((carrierId) => {
    setState(prev => {
      const carrier = prev.fleetCarriers.find(c => c.id === carrierId);
      if (!carrier) return prev;
      const isSb = prev.saveMode === 'sandbox';
      const refund = isSb ? 0 : Math.floor(5000000000 * 0.75);
      const updatedShips = prev.ownedShips.map(s =>
        s.storedAt?.carrierId === carrierId
          ? { ...s, storedAt: { systemSeed: carrier.systemSeed, stationId: null } }
          : s
      );
      return {
        ...prev,
        credits: prev.credits + refund,
        fleetCarriers: prev.fleetCarriers.filter(c => c.id !== carrierId),
        ownedShips: updatedShips,
      };
    });
  }, []);

  // Bookmark a system
  const addBookmark = useCallback((system) => {
    setState(prev => {
      if (prev.bookmarkedSystems.find(s => s.seed === system.seed)) return prev;
      const milestones = { ...prev.achievements?.milestones };
      if (!milestones.first_bookmark) milestones.first_bookmark = { date: Date.now() };
      return { ...prev, achievements: { ...prev.achievements, milestones }, bookmarkedSystems: [...prev.bookmarkedSystems, {
        seed: system.seed, name: system.name, x: system.x, y: system.y, z: system.z,
        starClass: system.starClass, security: system.security, population: system.population,
      }] };
    });
  }, []);

  const removeBookmark = useCallback((seed) => {
    setState(prev => ({ ...prev, bookmarkedSystems: prev.bookmarkedSystems.filter(s => s.seed !== seed) }));
  }, []);

  // FSS scan — reveals all bodies in the system (legacy bulk scan)
  const fssScanSystem = useCallback(() => {
    setState(prev => ({
      ...prev,
      fssScannedSystems: { ...prev.fssScannedSystems, [prev.currentSystem.seed]: true },
      achievements: {
        ...prev.achievements,
        milestones: {
          ...prev.achievements?.milestones,
          ...(prev.achievements?.milestones?.first_fss_scan ? {} : { first_fss_scan: { date: Date.now() } }),
        },
      },
    }));
  }, []);

  // Discover a single body via FSS — per-body, not bulk
  const discoverBodyFSS = useCallback((bodyId) => {
    let result = { alreadyDiscovered: false, systemComplete: false, reward: 0 };
    setState(prev => {
      if (prev.fssDiscoveredBodies?.[bodyId]) {
        result.alreadyDiscovered = true;
        return prev;
      }
      const newDiscovered = { ...(prev.fssDiscoveredBodies || {}), [bodyId]: true };
      const systemData = prev.currentSystemData;
      const scannable = (systemData?.bodies || []).filter(b =>
        b.type === 'star' || b.type === 'planet' || b.type === 'moon' || b.type === 'belt'
      );
      const allDiscovered = scannable.length > 0 && scannable.every(b => newDiscovered[b.id]);
      const updates = {
        fssDiscoveredBodies: newDiscovered,
        achievements: {
          ...prev.achievements,
          milestones: {
            ...prev.achievements?.milestones,
            ...(prev.achievements?.milestones?.first_fss_scan ? {} : { first_fss_scan: { date: Date.now() } }),
          },
        },
      };
      if (allDiscovered && !(prev.fssScannedSystems || {})[prev.currentSystem.seed]) {
        updates.fssScannedSystems = { ...(prev.fssScannedSystems || {}), [prev.currentSystem.seed]: true };
        const reward = 5000 + scannable.length * 500;
        updates.credits = prev.credits + reward;
        updates.lifetimeEarnings = (prev.lifetimeEarnings || 0) + reward;
        result.systemComplete = true;
        result.reward = reward;
      }
      return { ...prev, ...updates };
    });
    return result;
  }, []);

  // Launch a surface probe — progressive mapping (bigger bodies need more probes)
  const mapBody = useCallback((bodyId) => {
    setState(prev => {
      const systemData = prev.currentSystemData;
      if (!systemData) return prev;
      const body = systemData.bodies.find(b => b.id === bodyId);
      if (!body || !body.landable) return prev;
      const required = getProbesRequired(body);
      const existing = prev.probeProgress?.[bodyId] || { launched: 0, required, complete: false };
      if (existing.complete) return prev;
      const launched = existing.launched + 1;
      const complete = launched >= required;
      const newProbeProgress = {
        ...(prev.probeProgress || {}),
        [bodyId]: { launched, required, complete },
      };
      const updates = { probeProgress: newProbeProgress };
      if (complete) {
        updates.mappedBodies = {
          ...(prev.mappedBodies || {}),
          [bodyId]: { mapped: true, date: Date.now() },
        };
        updates.achievements = {
          ...prev.achievements,
          milestones: {
            ...prev.achievements?.milestones,
            ...(prev.achievements?.milestones?.first_mapping ? {} : { first_mapping: { date: Date.now() } }),
          },
        };
        // Create a surface map entry
        if (!(prev.surfaceMaps || {})[bodyId]) {
          const activeScanMission = (prev.activeMissions || []).find(m =>
            m.type === 'surface_scan' && m.destinationSystem?.seed === prev.currentSystem.seed
          );
          updates.surfaceMaps = {
            ...(prev.surfaceMaps || {}),
            [bodyId]: {
              bodyId,
              bodyName: body.name || body.designation,
              systemName: prev.currentSystem.name,
              systemSeed: prev.currentSystem.seed,
              value: Math.round((body.scanValue || 1000) * 3),
              missionLocked: activeScanMission ? activeScanMission.id : null,
              originCoords: { x: prev.currentSystem.x, y: prev.currentSystem.y, z: prev.currentSystem.z },
              obtainedAt: Date.now(),
            },
          };
        }
      }
      return { ...prev, ...updates };
    });
  }, []);

  // Collect a surface discovery
  const collectSurfaceDiscovery = useCallback((bodyId, signal) => {
    setState(prev => {
      const key = `${bodyId}:${signal.id}`;
      if (prev.surfaceDiscoveries[key]) return prev;
      const signalAchId = `signal_${signal.id}`;
      const newAch = { ...prev.achievements };
      newAch.firstDiscoveries = { ...newAch.firstDiscoveries };
      if (!newAch.firstDiscoveries[signalAchId]) {
        newAch.firstDiscoveries[signalAchId] = { system: prev.currentSystem.name, date: Date.now() };
      }
      return {
        ...prev,
        surfaceDiscoveries: { ...prev.surfaceDiscoveries, [key]: { ...signal, bodyId, date: Date.now(), originCoords: { x: prev.currentSystem.x, y: prev.currentSystem.y, z: prev.currentSystem.z } } },
        achievements: newAch,
      };
    });
  }, []);

  // Land on a body
  const landOnBody = useCallback((bodyId) => {
    setState(prev => ({
      ...prev,
      currentLocation: 'surface',
      currentSurfaceBody: bodyId,
      achievements: {
        ...prev.achievements,
        milestones: {
          ...prev.achievements?.milestones,
          ...(prev.achievements?.milestones?.first_surface_landing ? {} : { first_surface_landing: { date: Date.now() } }),
        },
      },
    }));
  }, []);

  // Depart from surface
  const departSurface = useCallback(() => {
    setState(prev => ({ ...prev, currentLocation: 'system', currentSurfaceBody: null, lastOrbitBodyId: prev.currentSurfaceBody }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState(saveSlot === 'sandbox' ? createSandboxState() : createInitialState());
  }, [storageKey, saveSlot]);

  // Switch to a different save slot
  const switchSave = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateRef.current));
    } catch (e) {
      console.error('Failed to save before switch:', e);
    }
    if (onSwitchSave) onSwitchSave();
  }, [onSwitchSave, storageKey]);

  // Build a space shipyard (requires 3 colonies + 100M credits in normal mode)
  const buildShipyard = useCallback(() => {
    setState(prev => {
      if (prev.shipyard) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb) {
        if (prev.credits < 100000000) return prev;
        if (prev.colonies.length < 3) return prev;
      }
      const yard = {
        id: `shipyard_${Date.now()}`,
        systemName: prev.currentSystem.name,
        systemSeed: prev.currentSystem.seed,
        infrastructure: isSb ? 100 : 0,
        level: isSb ? 5 : 0,
        materialsDelivered: {},
        builtAt: Date.now(),
      };
      const milestones = { ...prev.achievements?.milestones };
      if (!milestones.first_shipyard_built) milestones.first_shipyard_built = { system: prev.currentSystem.name, date: Date.now() };
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : 100000000),
        shipyard: yard,
        achievements: { ...prev.achievements, milestones },
      };
    });
  }, []);

  // Deliver cargo to shipyard to increase infrastructure
  const deliverToShipyard = useCallback((commodityId, qty) => {
    setState(prev => {
      if (!prev.shipyard) return prev;
      const comm = COMMODITY_MAP[commodityId];
      if (!comm) return prev;
      const catKey = Object.entries(COMMODITY_CATEGORIES).find(([k, v]) => v === comm.category)?.[0];
      const boost = ({ TECHNOLOGY: 5, INDUSTRIAL: 4, METALS: 3, MINERALS: 2, CHEMICALS: 3, RAW: 6, TEXTILES: 2, WEAPONS: 4, FOODS: 2, MEDICAL: 4, CONSUMER: 3, SALVAGE: 1, LEGAL_DRUGS: 3 }[catKey] || 1) * Math.min(qty, 10);
      const newInfra = Math.min(100, prev.shipyard.infrastructure + boost);
      const newLevel = Math.floor(newInfra / 20);
      const effectiveQty = Math.min(qty, 10);
      const cargo = [...prev.ship.cargo];
      const existing = cargo.find(c => c.commodity === commodityId);
      if (existing) {
        existing.qty -= effectiveQty;
        if (existing.qty <= 0) { const idx = cargo.indexOf(existing); cargo.splice(idx, 1); }
      }
      return {
        ...prev,
        ship: { ...prev.ship, cargo },
        shipyard: {
          ...prev.shipyard,
          infrastructure: newInfra,
          level: newLevel,
          materialsDelivered: { ...prev.shipyard.materialsDelivered, [commodityId]: (prev.shipyard.materialsDelivered[commodityId] || 0) + effectiveQty },
        },
      };
    });
  }, []);

  // Save a custom ship design
  const saveCustomShip = useCallback((design) => {
    setState(prev => {
      const ship = { ...design, id: `custom_${Date.now()}`, createdAt: Date.now() };
      const milestones = { ...prev.achievements?.milestones };
      if (!milestones.first_custom_ship) milestones.first_custom_ship = { date: Date.now() };
      return {
        ...prev,
        customShips: [...prev.customShips, ship],
        achievements: { ...prev.achievements, milestones },
      };
    });
  }, []);

  // Delete a custom ship design
  const deleteCustomShip = useCallback((shipId) => {
    setState(prev => ({ ...prev, customShips: prev.customShips.filter(s => s.id !== shipId) }));
  }, []);

  // Activate a custom ship as the player's current ship
  const activateCustomShip = useCallback((shipId) => {
    setState(prev => {
      if (prev.currentLocation !== 'station') return prev;
      const custom = prev.customShips.find(s => s.id === shipId);
      if (!custom) return prev;
      const oldShip = {
        id: `ship_${Date.now()}`,
        typeId: prev.ship.type,
        customName: prev.ship.name,
        storedAt: { systemSeed: prev.currentSystem.seed, stationId: prev.currentStationId },
        cargo: prev.ship.cargo,
        fuel: prev.ship.fuel,
        modules: prev.ship.modules || getDefaultModules(prev.ship.type),
        cockpitDecoration: prev.ship.cockpitDecoration || { parts: {} },
        };
        const stats = computeCustomShipStats(custom);
      return {
        ...prev,
        ship: {
          type: 'custom',
          customShipId: shipId,
          name: custom.name,
          cargo: [],
          fuel: stats.fuelCapacity,
          fuelCapacity: stats.fuelCapacity,
          cargoCapacity: stats.cargoCapacity,
          modules: getDefaultModules('sidewinder'),
          cockpitDecoration: { parts: {} },
        },
        ownedShips: [...prev.ownedShips, oldShip],
      };
    });
  }, []);

  // Create a trade company (1M CR registration, mid-game passive income)
  const createCompany = useCallback((companyName) => {
    setState(prev => {
      if (prev.company) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < 1000000) return prev;
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : 1000000),
        company: {
          name: companyName || 'Independent Corp',
          totalCollected: 0,
          contracts: [],
          lastCollection: Date.now(),
          createdAt: Date.now(),
        },
      };
    });
  }, []);

  // Assign a stored ship to an autonomous trade contract
  const assignShipToContract = useCallback((shipId) => {
    setState(prev => {
      if (!prev.company) return prev;
      const stored = prev.ownedShips.find(s => s.id === shipId);
      if (!stored) return prev;
      const shipType = SHIP_MAP[stored.typeId];
      if (!shipType) return prev;
      const mods = stored.modules || getDefaultModules(stored.typeId);
      const stats = computeShipStats(stored.typeId, mods);
      const rate = Math.round(stats.cargoCapacity * 50000 + stats.jumpRange * 10000);
      const contract = {
        id: `contract_${Date.now()}`,
        shipId,
        shipTypeId: stored.typeId,
        shipName: stored.customName || shipType.name,
        incomePerHour: rate,
        assignedAt: Date.now(),
      };
      return {
        ...prev,
        ownedShips: prev.ownedShips.filter(s => s.id !== shipId),
        company: { ...prev.company, contracts: [...prev.company.contracts, contract] },
      };
    });
  }, []);

  // Recall a ship from a contract back to owned fleet
  const recallShipFromContract = useCallback((contractId) => {
    setState(prev => {
      if (!prev.company) return prev;
      const contract = prev.company.contracts.find(c => c.id === contractId);
      if (!contract) return prev;
      const shipType = SHIP_MAP[contract.shipTypeId];
      const ship = {
        id: contract.shipId,
        typeId: contract.shipTypeId,
        customName: contract.shipName,
        storedAt: { systemSeed: prev.currentSystem.seed, stationId: prev.currentStationId },
        cargo: [],
        fuel: shipType?.fuelCapacity || 8,
        modules: getDefaultModules(contract.shipTypeId),
      };
      return {
        ...prev,
        ownedShips: [...prev.ownedShips, ship],
        company: { ...prev.company, contracts: prev.company.contracts.filter(c => c.id !== contractId) },
      };
    });
  }, []);

  // Collect accumulated company contract income
  const collectCompanyIncome = useCallback(() => {
    setState(prev => {
      if (!prev.company) return prev;
      const now = Date.now();
      const elapsedHours = (now - prev.company.lastCollection) / 3600000;
      const repLevel = Math.min(10, Math.floor((prev.company.totalCollected || 0) / 100000000));
      const multiplier = 1 + repLevel * 0.05;
      const income = Math.floor(prev.company.contracts.reduce((sum, c) => sum + c.incomePerHour * elapsedHours * multiplier, 0));
      if (income <= 0) return prev;
      return {
        ...prev,
        credits: prev.credits + income,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + income,
        company: {
          ...prev.company,
          totalCollected: (prev.company.totalCollected || 0) + income,
          lastCollection: now,
        },
      };
    });
  }, []);

  // Set a buy/sell order on a fleet carrier
  const setCarrierOrder = useCallback((carrierId, order) => {
    setState(prev => ({
      ...prev,
      fleetCarriers: prev.fleetCarriers.map(c => {
        if (c.id !== carrierId) return c;
        const orders = c.orders || [];
        if (orders.length >= 5) return c;
        return { ...c, orders: [...orders, { ...order, id: `order_${Date.now()}`, createdAt: Date.now() }] };
      }),
    }));
  }, []);

  // Remove a carrier order
  const removeCarrierOrder = useCallback((carrierId, orderId) => {
    setState(prev => ({
      ...prev,
      fleetCarriers: prev.fleetCarriers.map(c => c.id !== carrierId ? c : { ...c, orders: (c.orders || []).filter(o => o.id !== orderId) }),
    }));
  }, []);

  // Collect carrier order income (requires market service enabled)
  const collectCarrierIncome = useCallback((carrierId) => {
    setState(prev => {
      const carrier = prev.fleetCarriers.find(c => c.id === carrierId);
      if (!carrier) return prev;
      const now = Date.now();
      const lastCol = carrier.lastIncomeCollection || carrier.createdAt || now;
      const elapsedHours = Math.max(0, (now - lastCol) / 3600000);
      const orders = carrier.orders || [];
      const activeOrders = carrier.services?.market ? orders.length : 0;
      const income = Math.floor(activeOrders * 500000 * elapsedHours);
      if (income <= 0) return prev;
      return {
        ...prev,
        credits: prev.credits + income,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + income,
        fleetCarriers: prev.fleetCarriers.map(c => c.id === carrierId ? { ...c, lastIncomeCollection: now } : c),
      };
    });
  }, []);

  // ===== SOL CHEATS =====
  const isCheatActive = useCallback((cheatId) => {
    return state.cheats?.unlocked && state.cheats?.active?.[cheatId];
  }, [state.cheats]);

  const toggleCheat = useCallback((cheatId) => {
    setState(prev => {
      if (!prev.cheats?.unlocked) return prev;
      return {
        ...prev,
        cheats: {
          ...prev.cheats,
          active: { ...prev.cheats.active, [cheatId]: !prev.cheats.active[cheatId] },
        },
      };
    });
  }, []);

  const applyMaxCredits = useCallback(() => {
    setState(prev => ({ ...prev, credits: 1000000000, lifetimeEarnings: Math.max(prev.lifetimeEarnings || 0, 1000000000) }));
  }, []);

  const applyMaxColonies = useCallback(() => {
    setState(prev => ({
      ...prev,
      colonies: prev.colonies.map(c => ({ ...c, infrastructure: 100, population: 1000000, happiness: 100, stage: 4, growthRate: 1 })),
    }));
  }, []);

  const applyRevealSystems = useCallback(() => {
    const center = stateRef.current.currentSystem;
    if (!center) return;
    const stars = generateStarsInRange(center.x, center.y, center.z, 500);
    setState(prev => {
      const newDiscovered = { ...prev.discoveredSystems };
      for (const star of stars) {
        if (!newDiscovered[star.seed]) {
          newDiscovered[star.seed] = { name: star.name, firstDiscovered: false, bodyCount: 0, scanValue: 0 };
        }
      }
      return { ...prev, discoveredSystems: newDiscovered };
    });
  }, []);

  const applyMaxMaterials = useCallback(() => {
    const ALL_MATS = ['iron','silicon','carbon','water','nickel','phosphorus','sulphur','chromium','manganese','zinc','germanium','tin','tungsten','mercury','platinum','palladium','iridium','painite','pristine_diamond','low_temp_diamond','tritium','bromellite','void_opals','alexandrite','core_minerals'];
    const maxMats = {};
    for (const m of ALL_MATS) maxMats[m] = 999;
    setState(prev => ({ ...prev, materials: { ...prev.materials, ...maxMats } }));
  }, []);

  // ===== CARRIER INTERIOR & MANAGEMENT =====
  const updateCarrierInterior = useCallback((carrierId, updater) => {
    setState(prev => ({
      ...prev,
      fleetCarriers: prev.fleetCarriers.map(c => {
        if (c.id !== carrierId) return c;
        const interior = c.interior || { roomItems: [], savedPlants: [], barTab: 0 };
        const newInterior = typeof updater === 'function' ? updater(interior) : { ...interior, ...updater };
        return { ...c, interior: newInterior };
      }),
    }));
  }, []);

  const buyAle = useCallback((carrierId, cost) => {
    setState(prev => {
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < cost) return prev;
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : cost),
        fleetCarriers: prev.fleetCarriers.map(c => c.id === carrierId ? {
          ...c,
          interior: { ...(c.interior || { roomItems: [], savedPlants: [], barTab: 0 }), barTab: (c.interior?.barTab || 0) + cost },
        } : c),
      };
    });
  }, []);

  const requestShipTransit = useCallback((carrierId, shipId) => {
    setState(prev => {
      const carrier = prev.fleetCarriers.find(c => c.id === carrierId);
      if (!carrier || carrier.systemSeed !== prev.currentSystem.seed) return prev;
      const ship = prev.ownedShips.find(s => s.id === shipId);
      if (!ship) return prev;
      const shipType = SHIP_MAP[ship.typeId];
      const isSb = prev.saveMode === 'sandbox';
      const cost = isSb ? 0 : (shipType?.class || 1) * 500000;
      if (!isSb && prev.credits < cost) return prev;
      return {
        ...prev,
        credits: prev.credits - cost,
        ownedShips: prev.ownedShips.map(s => s.id === shipId ? { ...s, storedAt: { carrierId } } : s),
      };
    });
  }, []);

  const saveCustomCarrierDesign = useCallback((design) => {
    setState(prev => ({ ...prev, customCarrierDesigns: [...(prev.customCarrierDesigns || []), { ...design, id: `carrier_design_${Date.now()}`, createdAt: Date.now() }] }));
  }, []);

  const deleteCustomCarrierDesign = useCallback((designId) => {
    setState(prev => ({ ...prev, customCarrierDesigns: (prev.customCarrierDesigns || []).filter(d => d.id !== designId) }));
  }, []);

  const applyCarrierDesign = useCallback((carrierId, design) => {
    setState(prev => ({
      ...prev,
      fleetCarriers: prev.fleetCarriers.map(c => c.id === carrierId ? { ...c, design } : c),
    }));
  }, []);

  // ===== STATION DESIGN =====
  const saveCustomStationDesign = useCallback((design) => {
    setState(prev => ({
      ...prev,
      customStationDesigns: [...(prev.customStationDesigns || []), { ...design, id: `station_design_${Date.now()}`, createdAt: Date.now() }],
    }));
  }, []);

  const deleteCustomStationDesign = useCallback((designId) => {
    setState(prev => ({ ...prev, customStationDesigns: (prev.customStationDesigns || []).filter(d => d.id !== designId) }));
  }, []);

  const applyStationDesign = useCallback((stationId, design) => {
    setState(prev => {
      if (stationId === null) {
        // Import as a new saved design
        return {
          ...prev,
          customStationDesigns: [...(prev.customStationDesigns || []), { ...design, id: `station_design_${Date.now()}`, createdAt: Date.now() }],
        };
      }
      return {
        ...prev,
        ownedStations: (prev.ownedStations || []).map(s => s.id === stationId ? { ...s, design } : s),
      };
    });
  }, []);

  // ===== BADGE & SHARING SYSTEM =====
  const savePlayerBadge = useCallback((badge) => {
    setState(prev => ({ ...prev, playerBadge: badge }));
  }, []);

  const saveBadgeToGallery = useCallback((badge) => {
    setState(prev => {
      const saved = { ...badge, id: `badge_${Date.now()}`, createdAt: Date.now() };
      return { ...prev, savedBadges: [...(prev.savedBadges || []), saved] };
    });
  }, []);

  const deleteBadge = useCallback((badgeId) => {
    setState(prev => ({ ...prev, savedBadges: (prev.savedBadges || []).filter(b => b.id !== badgeId) }));
  }, []);

  const setCompanyLogo = useCallback((badge) => {
    setState(prev => {
      if (!prev.company) return prev;
      return { ...prev, company: { ...prev.company, logo: badge } };
    });
  }, []);

  const importShipBlueprint = useCallback((design) => {
    setState(prev => {
      const ship = { ...design, id: `custom_${Date.now()}`, createdAt: Date.now() };
      return { ...prev, customShips: [...prev.customShips, ship] };
    });
  }, []);

  // ===== WARP GATES =====
  const buildWarpGate = useCallback((name) => {
    setState(prev => {
      if (!prev.fleetCarriers || prev.fleetCarriers.length === 0) return prev;
      const carrierInSystem = prev.fleetCarriers.some(c => c.systemSeed === prev.currentSystem.seed);
      if (!carrierInSystem) return prev;
      if (prev.credits < GATE_CREDIT_COST) return prev;
      for (const [mat, qty] of Object.entries(GATE_MATERIAL_COST)) {
        if ((prev.materials[mat] || 0) < qty) return prev;
      }
      if ((prev.warpGates || []).some(g => g.systemSeed === prev.currentSystem.seed)) return prev;
      const newMaterials = { ...prev.materials };
      for (const [mat, qty] of Object.entries(GATE_MATERIAL_COST)) {
        newMaterials[mat] -= qty;
      }
      const gate = {
        id: `gate_${Date.now()}`,
        name: name || `Gate ${String.fromCharCode(65 + (prev.warpGates || []).length)}`,
        systemSeed: prev.currentSystem.seed,
        systemName: prev.currentSystem.name,
        system: { ...prev.currentSystem },
        builtAt: Date.now(),
      };
      const milestones = { ...prev.achievements?.milestones };
      if (!milestones.first_warp_gate) milestones.first_warp_gate = { system: prev.currentSystem.name, date: Date.now() };
      return {
        ...prev,
        credits: prev.credits - GATE_CREDIT_COST,
        materials: newMaterials,
        warpGates: [...(prev.warpGates || []), gate],
        achievements: { ...prev.achievements, milestones },
      };
    });
  }, []);

  const warpJump = useCallback((gateId) => {
    soundEngine.play('warp');
    setState(prev => {
      const currentGate = (prev.warpGates || []).find(g => g.systemSeed === prev.currentSystem.seed);
      if (!currentGate) return prev;
      const destGate = (prev.warpGates || []).find(g => g.id === gateId);
      if (!destGate) return prev;
      const systemData = generateSystem(destGate.system.seed, destGate.system.starClass, destGate.system.population);
      const dist = distance3D(prev.currentSystem, destGate.system);
      return {
        ...prev,
        currentSystem: destGate.system,
        currentSystemData: systemData,
        currentLocation: 'system',
        currentStationId: null,
        totalJumps: prev.totalJumps + 1,
        lightYearsTraveled: (prev.lightYearsTraveled || 0) + dist,
        flightLog: [...(prev.flightLog || []), { seed: destGate.system.seed, name: destGate.system.name, x: destGate.system.x, y: destGate.system.y, z: destGate.system.z }].slice(-50),
        discoveredSystems: {
          ...prev.discoveredSystems,
          [destGate.system.seed]: prev.discoveredSystems[destGate.system.seed] || {
            name: destGate.system.name,
            firstDiscovered: true,
            bodyCount: systemData.bodyCount,
            scanValue: 0,
            originCoords: { x: destGate.system.x, y: destGate.system.y, z: destGate.system.z },
          },
        },
        activeEncounter: null,
      };
    });
  }, []);

  // ===== COCKPIT DECORATION =====
  const saveCockpitDecoration = useCallback((decoration, target, targetId) => {
    setState(prev => {
      const { credits, materials } = computeCockpitCost(decoration);
      let oldDecor = { parts: {} };
      if (target === 'ship') oldDecor = prev.ship.cockpitDecoration || { parts: {} };
      else if (target === 'carrier') oldDecor = prev.fleetCarriers.find(c => c.id === targetId)?.cockpitDecoration || { parts: {} };
      else oldDecor = prev.ownedStations?.find(s => s.id === targetId)?.decoration || { parts: {} };
      const oldCost = computeCockpitCost(oldDecor);
      const creditDelta = credits - oldCost.credits;
      const matDeltas = {};
      for (const [mat, qty] of Object.entries(materials)) matDeltas[mat] = qty - (oldCost.materials[mat] || 0);
      for (const [mat, qty] of Object.entries(oldCost.materials)) if (!(mat in matDeltas)) matDeltas[mat] = -qty;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb) {
        if (creditDelta > 0 && prev.credits < creditDelta) return prev;
        const newMats = { ...prev.materials };
        for (const [mat, delta] of Object.entries(matDeltas)) {
          if (delta > 0 && (newMats[mat] || 0) < delta) return prev;
        }
        for (const [mat, delta] of Object.entries(matDeltas)) newMats[mat] = (newMats[mat] || 0) - delta;
        let updates = { credits: prev.credits - creditDelta, materials: newMats };
        if (target === 'ship') updates.ship = { ...prev.ship, cockpitDecoration: decoration };
        else if (target === 'carrier') updates.fleetCarriers = prev.fleetCarriers.map(c => c.id === targetId ? { ...c, cockpitDecoration: decoration } : c);
        else updates.ownedStations = (prev.ownedStations || []).map(s => s.id === targetId ? { ...s, decoration } : s);
        return { ...prev, ...updates };
      }
      let updates = {};
      if (target === 'ship') updates.ship = { ...prev.ship, cockpitDecoration: decoration };
      else if (target === 'carrier') updates.fleetCarriers = prev.fleetCarriers.map(c => c.id === targetId ? { ...c, cockpitDecoration: decoration } : c);
      else updates.ownedStations = (prev.ownedStations || []).map(s => s.id === targetId ? { ...s, decoration } : s);
      return { ...prev, ...updates };
    });
  }, []);

  // ===== ROOM MANAGEMENT =====
  const addCarrierRoom = useCallback((targetId, roomType, roomName, isStation) => {
    let success = true;
    setState(prev => {
      const rooms = prev.carrierRooms?.[targetId] || [];
      if (!isStation && rooms.length >= MAX_CARRIER_ROOMS) { success = false; return prev; }
      const roomDef = ROOM_TYPES[roomType];
      if (!roomDef) { success = false; return prev; }
      const isSb = prev.saveMode === 'sandbox';
      const cost = isStation ? getStationRoomCost(rooms, isSb) : getRoomCost(rooms, isSb);
      if (!isSb && prev.credits < cost) { success = false; return prev; }
      const newRoom = { id: `room_${Date.now()}_${Math.floor(Math.random()*999)}`, type: roomType, name: roomName || roomDef.name, createdAt: Date.now() };
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : cost),
        carrierRooms: { ...prev.carrierRooms, [targetId]: [...rooms, newRoom] },
      };
    });
    return success;
  }, []);

  const removeCarrierRoom = useCallback((targetId, roomId) => {
    setState(prev => ({
      ...prev,
      carrierRooms: {
        ...prev.carrierRooms,
        [targetId]: (prev.carrierRooms?.[targetId] || []).filter(r => r.id !== roomId),
      },
    }));
  }, []);

  // ===== AQUARIUM & GARDEN =====
  const collectAquaticLife = useCallback((body, systemName) => {
    if (!body) return null;
    const isWater = body.planetType === 'water_world' || body.planetType === 'earthlike';
    if (!isWater) return null;
    const fish = generateFish(body, systemName);
    setState(prev => ({
      ...prev,
      aquaticLife: {
        ...prev.aquaticLife,
        collected: [...(prev.aquaticLife?.collected || []), fish],
      },
    }));
    return fish;
  }, []);

  const collectFloraSpecimen = useCallback((signal, body, systemName) => {
    if (!signal || signal.type !== 'biological') return null;
    const flora = generateFlora(signal, body, systemName);
    setState(prev => ({
      ...prev,
      floraCollection: {
        ...prev.floraCollection,
        collected: [...(prev.floraCollection?.collected || []), flora],
      },
    }));
    return flora;
  }, []);

  const moveAquaticToTank = useCallback((fishId) => {
    setState(prev => {
      const tank = prev.aquaticLife?.tankIds || [];
      if (tank.includes(fishId)) return prev;
      if (tank.length >= (prev.aquaticLife?.tankCapacity || 8)) return prev;
      return { ...prev, aquaticLife: { ...prev.aquaticLife, tankIds: [...tank, fishId] } };
    });
  }, []);

  const moveAquaticToStorage = useCallback((fishId) => {
    setState(prev => ({
      ...prev,
      aquaticLife: { ...prev.aquaticLife, tankIds: (prev.aquaticLife?.tankIds || []).filter(id => id !== fishId) },
    }));
  }, []);

  const moveFloraToDisplay = useCallback((floraId) => {
    setState(prev => {
      const display = prev.floraCollection?.displayIds || [];
      if (display.includes(floraId)) return prev;
      if (display.length >= (prev.floraCollection?.capacity || 8)) return prev;
      return { ...prev, floraCollection: { ...prev.floraCollection, displayIds: [...display, floraId] } };
    });
  }, []);

  const moveFloraToStorage = useCallback((floraId) => {
    setState(prev => ({
      ...prev,
      floraCollection: { ...prev.floraCollection, displayIds: (prev.floraCollection?.displayIds || []).filter(id => id !== floraId) },
    }));
  }, []);

  const editSpecimen = useCallback((specimenId, type, changes) => {
    setState(prev => {
      const isSb = prev.saveMode === 'sandbox';
      const cost = 50000;
      if (!isSb && prev.credits < cost) return prev;
      if (type === 'fish') {
        return {
          ...prev,
          credits: prev.credits - (isSb ? 0 : cost),
          aquaticLife: {
            ...prev.aquaticLife,
            collected: (prev.aquaticLife?.collected || []).map(f => f.id === specimenId ? { ...f, ...changes, edited: true } : f),
          },
        };
      }
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : cost),
        floraCollection: {
          ...prev.floraCollection,
          collected: (prev.floraCollection?.collected || []).map(f => f.id === specimenId ? { ...f, ...changes, edited: true } : f),
        },
      };
    });
  }, []);

  // ===== CARRIER ROOM GRID =====
  const initCarrierRoomGrid = useCallback((carrierId) => {
    setState(prev => {
      if (prev.carrierRoomGrid?.[carrierId]) return prev;
      const rooms = {};
      const defaults = [
        ['0,0', 'observation', 'Observation Lounge'],
        ['1,0', 'command', 'Command Deck'],
        ['2,0', 'quarters', 'Living Quarters'],
        ['3,0', 'bar', 'The Driftwood Tavern'],
        ['4,0', 'garden', 'Botanical Wing'],
        ['5,0', 'trophy', 'Hall of Records'],
      ];
      for (const [key, type, name] of defaults) {
        rooms[key] = { id: `cr_${carrierId}_${key}`, type, name, surfaces: {} };
      }
      return {
        ...prev,
        carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: rooms },
        carrierCurrentRoom: { ...prev.carrierCurrentRoom, [carrierId]: '2,0' },
      };
    });
  }, []);

  const addCarrierRoomAt = useCallback((carrierId, gridX, gridY, roomType, roomName) => {
    const gridKey = `${gridX},${gridY}`;
    let success = true;
    setState(prev => {
      const carrierGrid = prev.carrierRoomGrid?.[carrierId] || {};
      if (carrierGrid[gridKey]) { success = false; return prev; }
      const isSb = prev.saveMode === 'sandbox';
      const cost = 500000;
      if (!isSb && prev.credits < cost) { success = false; return prev; }
      const roomDef = ROOM_TYPES[roomType] || { name: roomName || 'New Room' };
      const newRoom = { id: `cr_${carrierId}_${Date.now()}`, type: roomType, name: roomName || roomDef.name, surfaces: {}, custom: true };
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : cost),
        carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: { ...carrierGrid, [gridKey]: newRoom } },
      };
    });
    return success;
  }, []);

  const customizeCarrierRoomSurface = useCallback((carrierId, gridKey, surface, field, value) => {
    setState(prev => {
      const carrierGrid = prev.carrierRoomGrid?.[carrierId] || {};
      const room = carrierGrid[gridKey];
      if (!room) return prev;
      const surfaces = { ...(room.surfaces || {}) };
      const current = surfaces[surface] || { texture: 'solid', rgb: [26, 13, 0] };
      surfaces[surface] = { ...current, [field]: value };
      return {
        ...prev,
        carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: { ...carrierGrid, [gridKey]: { ...room, surfaces } } },
      };
    });
  }, []);

  const setCarrierCurrentRoom = useCallback((carrierId, gridKey) => {
    setState(prev => ({ ...prev, carrierCurrentRoom: { ...prev.carrierCurrentRoom, [carrierId]: gridKey } }));
  }, []);

  const placeRoomContainer = useCallback((carrierId, gridKey, slotIndex, containerType) => {
    setState(prev => {
      const cg = prev.carrierRoomGrid?.[carrierId] || {};
      const room = cg[gridKey];
      if (!room) return prev;
      const containers = room.containers || [];
      if (containers.find(c => c.slotIndex === slotIndex)) return prev;
      const newRoom = { ...room, containers: [...containers, { id: `cnt_${Date.now()}`, type: containerType, slotIndex }] };
      const newCg = { ...cg, [gridKey]: newRoom };
      return { ...prev, carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: newCg } };
    });
  }, []);

  const removeRoomContainer = useCallback((carrierId, gridKey, containerId) => {
    setState(prev => {
      const cg = prev.carrierRoomGrid?.[carrierId] || {};
      const room = cg[gridKey];
      if (!room) return prev;
      const newContainers = (room.containers || []).filter(c => c.id !== containerId);
      const newRoom = { ...room, containers: newContainers };
      const newCg = { ...cg, [gridKey]: newRoom };
      return { ...prev, carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: newCg } };
    });
  }, []);

  const setRoomHologram = useCallback((carrierId, gridKey, systemData) => {
    setState(prev => {
      const cg = prev.carrierRoomGrid?.[carrierId] || {};
      const room = cg[gridKey];
      if (!room) return prev;
      const newRoom = { ...room, hologramSystem: systemData };
      const newCg = { ...cg, [gridKey]: newRoom };
      return { ...prev, carrierRoomGrid: { ...prev.carrierRoomGrid, [carrierId]: newCg } };
    });
  }, []);

  const isSandbox = state.saveMode === 'sandbox';

  // ===== COMMUNITY GOALS =====
  const refreshCommunityGoals = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      const goals = prev.communityGoals || [];
      const hasActive = goals.some(g => !g.claimed && g.deadline > now);
      if (hasActive && goals.length > 0) return prev;
      return { ...prev, communityGoals: generateCommunityGoals(), lastGoalRefresh: now };
    });
  }, []);

  const contributeToGoal = useCallback((goalId) => {
    let result = { contributed: 0 };
    setState(prev => {
      const goal = (prev.communityGoals || []).find(g => g.id === goalId);
      if (!goal || goal.completed || goal.claimed) return prev;
      if (goal.type === 'trade') {
        const cargo = prev.ship.cargo.map(c => ({ ...c }));
        let contributed = 0;
        for (const item of cargo) {
          const comm = COMMODITY_MAP[item.commodity];
          if (comm && comm.category === goal.commodityCategory) {
            const need = goal.target - goal.progress;
            const give = Math.min(item.qty, need);
            item.qty -= give;
            contributed += give;
          }
        }
        if (contributed === 0) return prev;
        result.contributed = contributed;
        return {
          ...prev,
          ship: { ...prev.ship, cargo: cargo.filter(c => c.qty > 0) },
          communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, progress: Math.min(g.target, g.progress + contributed), completed: g.progress + contributed >= g.target } : g),
        };
      }
      if (goal.type === 'mining') {
        const matId = goal.materialId;
        const have = prev.materials?.[matId] || 0;
        if (have === 0) return prev;
        const need = goal.target - goal.progress;
        const give = Math.min(have, need);
        result.contributed = give;
        return {
          ...prev,
          materials: { ...prev.materials, [matId]: have - give },
          communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, progress: Math.min(g.target, g.progress + give), completed: g.progress + give >= g.target } : g),
        };
      }
      if (goal.type === 'exploration') {
        const scanCount = Object.keys(prev.scannedBodies || {}).length;
        const mapCount = Object.keys(prev.mappedBodies || {}).length;
        const available = goal.desc.includes('Map') ? mapCount : scanCount;
        if (available === 0) return prev;
        const need = goal.target - goal.progress;
        const give = Math.min(available, need);
        result.contributed = give;
        return {
          ...prev,
          communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, progress: Math.min(g.target, g.progress + give), completed: g.progress + give >= g.target } : g),
        };
      }
      return prev;
    });
    return result;
  }, []);

  const claimGoalReward = useCallback((goalId) => {
    setState(prev => {
      const goal = (prev.communityGoals || []).find(g => g.id === goalId);
      if (!goal || !goal.completed || goal.claimed) return prev;
      return {
        ...prev,
        credits: prev.credits + goal.reward,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + goal.reward,
        communityGoals: prev.communityGoals.map(g => g.id === goalId ? { ...g, claimed: true } : g),
      };
    });
  }, []);

  // ===== SYNTHESIS =====
  const synthesize = useCallback((recipeId) => {
    let result = null;
    setState(prev => {
      const recipe = SYNTHESIS_MAP[recipeId];
      if (!recipe) return prev;
      const mats = { ...prev.materials };
      for (const [matId, qty] of Object.entries(recipe.inputs)) {
        if ((mats[matId] || 0) < qty) return prev;
      }
      for (const [matId, qty] of Object.entries(recipe.inputs)) {
        mats[matId] -= qty;
      }
      let updates = { materials: mats };
      if (recipe.effect === 'fsd_boost') updates.fsdBoost = true;
      if (recipe.effect === 'hull_repair') updates.ship = { ...prev.ship, integrity: Math.min(100, (prev.ship.integrity ?? 100) + 20) };
      if (recipe.effect === 'afm_refill') updates.ship = { ...prev.ship, integrity: Math.min(100, (prev.ship.integrity ?? 100) + 10) };
      if (recipe.effect === 'heat_sink') updates.heatSinkCharges = (prev.heatSinkCharges || 0) + 3;
      if (recipe.effect === 'limpets') {
        const cargo = [...prev.ship.cargo];
        const existing = cargo.find(c => c.commodity === 'limpets');
        if (existing) existing.qty += 4;
        else cargo.push({ commodity: 'limpets', qty: 4 });
        updates.ship = { ...prev.ship, cargo };
      }
      result = { name: recipe.name, effectLabel: recipe.effectLabel };
      return { ...prev, ...updates };
    });
    return result;
  }, []);

  // ===== SHIP REPAIR =====
  const repairShip = useCallback((amount) => {
    setState(prev => {
      const integrity = prev.ship.integrity ?? 100;
      const newIntegrity = Math.min(100, integrity + amount);
      return { ...prev, ship: { ...prev.ship, integrity: newIntegrity } };
    });
  }, []);

  // ===== ENCOUNTERS =====
  const resolveEncounterAction = useCallback((outcome) => {
    if (outcome === null) {
      setState(prev => ({ ...prev, activeEncounter: null }));
      return;
    }
    setState(prev => {
      let newShip = { ...prev.ship };
      if (outcome.damage > 0) {
        newShip.integrity = Math.max(0, (newShip.integrity ?? 100) - outcome.damage);
      }
      if (outcome.cargoGained?.length > 0) {
        const cargo = [...newShip.cargo];
        for (const gain of outcome.cargoGained) {
          const existing = cargo.find(c => c.commodity === gain.commodity);
          if (existing) existing.qty += gain.qty;
          else cargo.push({ commodity: gain.commodity, qty: gain.qty });
        }
        newShip.cargo = cargo;
      }
      if (outcome.cargoLost?.length > 0) {
        newShip.cargo = newShip.cargo.filter(c => !outcome.cargoLost.includes(c.commodity));
      }
      let newMaterials = { ...prev.materials };
      if (outcome.materialsGained?.length > 0) {
        for (const mat of outcome.materialsGained) {
          newMaterials[mat.materialId] = (newMaterials[mat.materialId] || 0) + mat.qty;
        }
      }
      return {
        ...prev,
        ship: newShip,
        credits: prev.credits + (outcome.creditsChange || 0),
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + (outcome.creditsChange > 0 ? outcome.creditsChange : 0),
        materials: newMaterials,
      };
    });
  }, []);

  // ===== ENGINEERING =====
  const applyEngineering = useCallback((slotKey, blueprintId, level) => {
    setState(prev => {
      const modules = { ...prev.ship.modules };
      const eng = { ...(modules.__engineering || {}) };
      eng[slotKey] = { blueprint: blueprintId, level };
      modules.__engineering = eng;
      return { ...prev, ship: { ...prev.ship, modules } };
    });
  }, []);

  // ===== CRIME & PUNISHMENT =====
  const addCrime = useCallback((typeId) => {
    setState(prev => {
      const crimeDef = CRIME_TYPES[typeId];
      if (!crimeDef) return prev;
      const crime = prev.crime || { notoriety: 0, bounty: 0, crimes: [], lastCrime: 0 };
      return {
        ...prev,
        crime: {
          notoriety: crime.notoriety + crimeDef.notoriety,
          bounty: crime.bounty + crimeDef.baseBounty,
          lastCrime: Date.now(),
          crimes: [...(crime.crimes || []), { type: crimeDef.label, date: Date.now(), bounty: crimeDef.baseBounty }].slice(-20),
        },
      };
    });
  }, []);

  const payOffBounty = useCallback(() => {
    setState(prev => {
      const crime = prev.crime || { notoriety: 0, bounty: 0 };
      const cost = getCleanRecordCost(crime.bounty);
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < cost) return prev;
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : cost),
        crime: { notoriety: 0, bounty: 0, crimes: [], lastCrime: 0 },
      };
    });
  }, []);

  // ===== BOUNTY HUNTING =====
  const addBountyMission = useCallback((mission) => {
    setState(prev => ({ ...prev, bountyMissions: [...(prev.bountyMissions || []), mission] }));
  }, []);

  const completeBountyMission = useCallback((missionId) => {
    setState(prev => {
      const mission = (prev.bountyMissions || []).find(m => m.id === missionId);
      if (!mission) return prev;
      return {
        ...prev,
        bountyMissions: prev.bountyMissions.filter(m => m.id !== missionId),
        credits: prev.credits + mission.reward,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + mission.reward,
      };
    });
  }, []);

  // ===== WINGMATES =====
  const hireWingmate = useCallback((pilot) => {
    setState(prev => {
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < pilot.hireCost) return prev;
      if ((prev.wingmates || []).length >= 4) return prev;
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : pilot.hireCost),
        wingmates: [...(prev.wingmates || []), { ...pilot, active: true, hiredAt: Date.now() }],
      };
    });
  }, []);

  const dismissWingmate = useCallback((pilotId) => {
    setState(prev => ({ ...prev, wingmates: (prev.wingmates || []).filter(w => w.id !== pilotId) }));
  }, []);

  // ===== PASSENGER TRANSPORT =====
  const addPassengerMission = useCallback((mission) => {
    setState(prev => ({ ...prev, passengerMissions: [...(prev.passengerMissions || []), mission] }));
  }, []);

  const completePassengerMission = useCallback((missionId) => {
    setState(prev => {
      const mission = (prev.passengerMissions || []).find(m => m.id === missionId);
      if (!mission) return prev;
      return {
        ...prev,
        passengerMissions: prev.passengerMissions.filter(m => m.id !== missionId),
        credits: prev.credits + mission.reward,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + mission.reward,
        rank: { ...prev.rank, trade: updateRank(prev.rank.trade, mission.reward) },
      };
    });
  }, []);

  // ===== COMBAT =====
  const startCombat = useCallback((enemy, context, extraData = {}) => {
    setState(prev => ({ ...prev, activeCombat: { enemy, context, ...extraData } }));
  }, []);

  const endCombat = useCallback(() => {
    setState(prev => ({ ...prev, activeCombat: null }));
  }, []);

  // ===== STATION BUILDER =====
  const buildStation = useCallback((name, economyType, colonyId) => {
    setState(prev => {
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < STATION_BUILD_COST) return prev;
      const colony = prev.colonies.find(c => c.id === colonyId);
      if (!colony) return prev;
      if (prev.ownedStations?.some(s => s.colonyId === colonyId)) return prev;
      const station = {
        id: `station_${Date.now()}`,
        name: name || `${colony.name} Station`,
        colonyId,
        systemSeed: prev.currentSystem.seed,
        systemName: prev.currentSystem.name,
        economy: economyType,
        services: ['refuel', 'repair'],
        lastRevenueCollection: Date.now(),
        builtAt: Date.now(),
        decoration: { parts: {} },
      };
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : STATION_BUILD_COST),
        ownedStations: [...(prev.ownedStations || []), station],
      };
    });
  }, []);

  const upgradeStationService = useCallback((stationId, serviceId) => {
    setState(prev => {
      const station = (prev.ownedStations || []).find(s => s.id === stationId);
      if (!station) return prev;
      const svc = STATION_SERVICES.find(s => s.id === serviceId);
      if (!svc) return prev;
      if (station.services?.includes(serviceId)) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < svc.cost) return prev;
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : svc.cost),
        ownedStations: prev.ownedStations.map(s => s.id === stationId ? { ...s, services: [...(s.services || []), serviceId] } : s),
      };
    });
  }, []);

  const collectStationRevenue = useCallback((stationId) => {
    setState(prev => {
      const station = (prev.ownedStations || []).find(s => s.id === stationId);
      if (!station) return prev;
      const revenue = calculateStationRevenue(station, station.lastRevenueCollection);
      if (revenue <= 0) return prev;
      return {
        ...prev,
        credits: prev.credits + revenue,
        lifetimeEarnings: (prev.lifetimeEarnings || 0) + revenue,
        ownedStations: prev.ownedStations.map(s => s.id === stationId ? { ...s, lastRevenueCollection: Date.now() } : s),
      };
    });
  }, []);

  // ===== FIGHTERS =====
  const buildFighter = useCallback((fighterTypeId) => {
    setState(prev => {
      const fighterType = FIGHTER_TYPES.find(f => f.id === fighterTypeId);
      if (!fighterType) return prev;
      const shipType = SHIP_MAP[prev.ship.type];
      const shipClass = shipType?.class || (prev.ship.type === 'custom' ? 2 : 1);
      const capacity = getFighterHangarCapacity(shipClass);
      if ((prev.fighters || []).filter(f => f.condition !== 'destroyed').length >= capacity) return prev;
      const isSb = prev.saveMode === 'sandbox';
      if (!isSb && prev.credits < fighterType.cost) return prev;
      return {
        ...prev,
        credits: prev.credits - (isSb ? 0 : fighterType.cost),
        fighters: [...(prev.fighters || []), {
          id: `fighter_${Date.now()}`,
          typeId: fighterTypeId,
          name: fighterType.name,
          damage: fighterType.damage,
          hull: fighterType.hull,
          condition: 'ready',
          deployed: false,
          pilotId: null,
        }],
      };
    });
  }, []);

  const dismissFighter = useCallback((fighterId) => {
    setState(prev => ({ ...prev, fighters: (prev.fighters || []).filter(f => f.id !== fighterId) }));
  }, []);

  // ===== EXOBIOLOGY =====
  const recordExobiology = useCallback((speciesId, speciesName, bodyName, systemName) => {
    setState(prev => {
      const codex = { ...(prev.exobiologyCodex || {}) };
      if (!codex[speciesId]) {
        codex[speciesId] = { speciesName, firstSystem: systemName, firstBody: bodyName, date: Date.now(), count: 1 };
      } else {
        codex[speciesId] = { ...codex[speciesId], count: codex[speciesId].count + 1 };
      }
      return { ...prev, exobiologyCodex: codex };
    });
  }, []);

  const value = {
    state,
    isSandbox,
    update,
    getSystemData,
    setCurrentSystem,
    dockAtStation,
    leaveStation,
    addCredits,
    updateCargo,
    addCargo,
    removeCargo,
    refuel,
    buyShip,
    scanBody,
    sellExplorationData,
    addMission,
    completeMission,
    addColony,
    updateColony,
    addMaterial,
    plotRoute,
    resetGame,
    switchShip,
    transferShip,
    renameShip,
    buyFleetCarrier,
    jumpCarrier,
    renameCarrier,
    decommissionCarrier,
    updateSettings,
    addBookmark,
    removeBookmark,
    fssScanSystem,
    mapBody,
    discoverBodyFSS,
    collectSurfaceDiscovery,
    landOnBody,
    departSurface,
    switchSave,
    buildShipyard,
    deliverToShipyard,
    saveCustomShip,
    deleteCustomShip,
    activateCustomShip,
    createCompany,
    assignShipToContract,
    recallShipFromContract,
    collectCompanyIncome,
    setCarrierOrder,
    removeCarrierOrder,
    collectCarrierIncome,
    isCheatActive,
    toggleCheat,
    applyMaxCredits,
    applyMaxColonies,
    applyRevealSystems,
    applyMaxMaterials,
    savePlayerBadge,
    saveBadgeToGallery,
    deleteBadge,
    setCompanyLogo,
    importShipBlueprint,
    updateCarrierInterior,
    buyAle,
    requestShipTransit,
    saveCustomCarrierDesign,
    deleteCustomCarrierDesign,
    applyCarrierDesign,
    saveCustomStationDesign,
    deleteCustomStationDesign,
    applyStationDesign,
    refreshCommunityGoals,
    contributeToGoal,
    claimGoalReward,
    synthesize,
    repairShip,
    resolveEncounterAction,
    applyEngineering,
    addCrime,
    payOffBounty,
    addBountyMission,
    completeBountyMission,
    hireWingmate,
    dismissWingmate,
    addPassengerMission,
    completePassengerMission,
    startCombat,
    endCombat,
    buildStation,
    upgradeStationService,
    collectStationRevenue,
    buildFighter,
    dismissFighter,
    recordExobiology,
    updateNotebook,
    lockSurfaceMap,
    unlockSurfaceMaps,
    buildWarpGate,
    warpJump,
    saveCockpitDecoration,
    addCarrierRoom,
    removeCarrierRoom,
    collectAquaticLife,
    collectFloraSpecimen,
    moveAquaticToTank,
    moveAquaticToStorage,
    moveFloraToDisplay,
    moveFloraToStorage,
    editSpecimen,
    initCarrierRoomGrid,
    addCarrierRoomAt,
    customizeCarrierRoomSurface,
    setCarrierCurrentRoom,
    placeRoomContainer,
    removeRoomContainer,
    setRoomHologram,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

function updateRank(currentRank, points) {
  const RANKS = [
    { name: 'Aimless', threshold: 0 },
    { name: 'Mostly Aimless', threshold: 1000 },
    { name: 'Scout', threshold: 5000 },
    { name: 'Surveyor', threshold: 15000 },
    { name: 'Trailblazer', threshold: 50000 },
    { name: 'Pathfinder', threshold: 150000 },
    { name: 'Ranger', threshold: 400000 },
    { name: 'Pioneer', threshold: 900000 },
    { name: 'Elite', threshold: 2000000 },
    { name: 'Elite I', threshold: 5000000 },
    { name: 'Elite II', threshold: 10000000 },
    { name: 'Elite III', threshold: 25000000 },
    { name: 'Elite IV', threshold: 50000000 },
    { name: 'Elite V', threshold: 100000000 },
  ];

  const newPoints = currentRank.points + points;
  let newRankIdx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (newPoints >= RANKS[i].threshold) newRankIdx = i;
  }
  return { rank: newRankIdx, name: RANKS[newRankIdx].name, points: newPoints };
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
}

export function getProbesRequired(body) {
  if (!body || body.type === 'star' || body.type === 'belt' || body.type === 'asteroid' || body.type === 'ring') return 0;
  const r = body.radius || 1;
  if (body.planetType && (body.planetType.startsWith('gas_giant') || body.planetType.startsWith('helium'))) {
    return Math.max(3, Math.min(8, Math.ceil(r / 3)));
  }
  return Math.max(1, Math.min(5, Math.ceil(r * 1.5)));
}

export function hasCarrierVendor(system) {
  return system && (system.population || 0) > 1000000000;
}

// Determine which ships are in stock at a station based on system population
export function getAvailableShipsAtStation(system, isSandbox = false) {
  if (isSandbox) return new Set(SHIP_TYPES.map(s => s.id));
  const pop = system?.population || 0;
  const available = ['sidewinder', 'eagle', 'hauler', 'adder'];
  if (pop > 100000) available.push('viper', 'cobra', 'dolphin');
  if (pop > 1000000) available.push('cobramk4', 'type6', 'diamondback', 'cobramk5');
  if (pop > 10000000) available.push('asp', 'federal_dropship', 'vulture', 'imperial_courier', 'type7');
  if (pop > 100000000) available.push('python', 'mandalay', 'alliance_chieftain', 'federal_assault', 'imperial_clipper', 'type8');
  if (pop > 1000000000) available.push('alliance_crusader', 'alliance_challenger', 'krait_phantom', 'krait_mk2', 'orca', 'mamba', 'type9', 'anaconda');
  if (pop > 10000000000) available.push('python_mk2', 'beluga', 'type10', 'federal_corvette', 'imperial_cutter');
  return new Set(available);
}

// Determine outfitting/engineering level based on system stats
export function getOutfittingLevel(system, systemData, isSandbox = false) {
  if (isSandbox) return 5;
  const pop = system?.population || 0;
  const economy = (systemData?.economy?.name || '').toLowerCase();
  let level = 1;
  if (pop > 100000) level = 2;
  if (pop > 1000000) level = 3;
  if (pop > 100000000) level = 4;
  if (pop > 1000000000) level = 5;
  if (economy.includes('high tech') || economy.includes('tech') || economy.includes('industrial')) level = Math.min(5, level + 1);
  return level;
}

export const OUTFITTING_LEVELS = [
  { name: 'Basic', desc: 'Core modules only. No engineering.' },
  { name: 'Standard', desc: 'Common modules. Basic engineering.' },
  { name: 'Advanced', desc: 'Improved modules. Standard engineering.' },
  { name: 'Premium', desc: 'High-grade modules. Advanced engineering.' },
  { name: 'Elite', desc: 'Full stock. Experimental engineering.' },
];