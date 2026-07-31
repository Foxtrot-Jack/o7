// Game state management with localStorage persistence
// Uses React context for app-wide access
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { STARTING_SYSTEM, distance3D } from './galaxy';
import { generateSystem } from './system';
import { COMMODITIES } from './commodities';
import { getDefaultModules, computeShipStats } from './shipOutfitting';

const STORAGE_KEY = 'starfarer_save_v1';

// Ship definitions
export const SHIP_TYPES = [
  { id: 'sidewinder', name: 'Sidewinder Mk-I', manufacturer: 'Falcon Delacy', cargoCapacity: 4, fuelCapacity: 8, jumpRange: 8, cost: 0, multirole: true, class: 1 },
  { id: 'hauler', name: 'Hauler', manufacturer: 'Lakon Spaceways', cargoCapacity: 22, fuelCapacity: 16, jumpRange: 10, cost: 52000, multirole: false, class: 1 },
  { id: 'cobra', name: 'Cobra Mk-III', manufacturer: 'Falcon Delacy', cargoCapacity: 18, fuelCapacity: 16, jumpRange: 12, cost: 350000, multirole: true, class: 2 },
  { id: 'type6', name: 'Type-6 Transporter', manufacturer: 'Lakon Spaceways', cargoCapacity: 50, fuelCapacity: 32, jumpRange: 15, cost: 1000000, multirole: false, class: 2 },
  { id: 'diamondback', name: 'Diamondback Explorer', manufacturer: 'Lakon Spaceways', cargoCapacity: 16, fuelCapacity: 32, jumpRange: 20, cost: 1900000, multirole: true, class: 2 },
  { id: 'asp', name: 'Asp Explorer', manufacturer: 'Lakon Spaceways', cargoCapacity: 28, fuelCapacity: 32, jumpRange: 18, cost: 6600000, multirole: true, class: 2 },
  { id: 'type7', name: 'Type-7 Transporter', manufacturer: 'Lakon Spaceways', cargoCapacity: 96, fuelCapacity: 32, jumpRange: 14, cost: 17000000, multirole: false, class: 3 },
  { id: 'python', name: 'Python', manufacturer: 'Falcon Delacy', cargoCapacity: 56, fuelCapacity: 32, jumpRange: 16, cost: 56000000, multirole: true, class: 3 },
  { id: 'type9', name: 'Type-9 Heavy', manufacturer: 'Lakon Spaceways', cargoCapacity: 220, fuelCapacity: 64, jumpRange: 10, cost: 78000000, multirole: false, class: 4 },
  { id: 'anaconda', name: 'Anaconda', manufacturer: 'Falcon Delacy', cargoCapacity: 114, fuelCapacity: 64, jumpRange: 18, cost: 146000000, multirole: true, class: 4 },
  { id: 'eagle', name: 'Eagle Mk-II', manufacturer: 'Core Dynamics', cargoCapacity: 2, fuelCapacity: 8, jumpRange: 7, cost: 44800, multirole: true, class: 1 },
  { id: 'adder', name: 'Adder', manufacturer: 'Zorgon Peterson', cargoCapacity: 6, fuelCapacity: 8, jumpRange: 10, cost: 87200, multirole: true, class: 1 },
  { id: 'viper', name: 'Viper Mk-III', manufacturer: 'Falcon Delacy', cargoCapacity: 2, fuelCapacity: 8, jumpRange: 9, cost: 143000, multirole: false, class: 1 },
  { id: 'cobramk4', name: 'Cobra Mk-IV', manufacturer: 'Falcon Delacy', cargoCapacity: 20, fuelCapacity: 16, jumpRange: 11, cost: 745000, multirole: true, class: 2 },
  { id: 'dolphin', name: 'Dolphin', manufacturer: 'Saud Kruger', cargoCapacity: 6, fuelCapacity: 16, jumpRange: 15, cost: 1500000, multirole: true, class: 2 },
  { id: 'cobramk5', name: 'Cobra Mk-V', manufacturer: 'Falcon Delacy', cargoCapacity: 18, fuelCapacity: 16, jumpRange: 13, cost: 3900000, multirole: true, class: 2 },
  { id: 'federal_dropship', name: 'Federal Dropship', manufacturer: 'Core Dynamics', cargoCapacity: 6, fuelCapacity: 32, jumpRange: 12, cost: 4900000, multirole: false, class: 3 },
  { id: 'vulture', name: 'Vulture', manufacturer: 'Core Dynamics', cargoCapacity: 2, fuelCapacity: 32, jumpRange: 11, cost: 5100000, multirole: false, class: 2 },
  { id: 'imperial_courier', name: 'Imperial Courier', manufacturer: 'Gutamaya', cargoCapacity: 8, fuelCapacity: 32, jumpRange: 13, cost: 5400000, multirole: true, class: 2 },
  { id: 'mandalay', name: 'Mandalay', manufacturer: 'Zorgon Peterson', cargoCapacity: 20, fuelCapacity: 32, jumpRange: 22, cost: 18500000, multirole: true, class: 2 },
  { id: 'alliance_chieftain', name: 'Alliance Chieftain', manufacturer: 'Lakon Spaceways', cargoCapacity: 2, fuelCapacity: 32, jumpRange: 13, cost: 19000000, multirole: false, class: 3 },
  { id: 'federal_assault', name: 'Federal Assault Ship', manufacturer: 'Core Dynamics', cargoCapacity: 4, fuelCapacity: 32, jumpRange: 12, cost: 19800000, multirole: false, class: 3 },
  { id: 'imperial_clipper', name: 'Imperial Clipper', manufacturer: 'Gutamaya', cargoCapacity: 34, fuelCapacity: 32, jumpRange: 14, cost: 22300000, multirole: true, class: 3 },
  { id: 'alliance_crusader', name: 'Alliance Crusader', manufacturer: 'Lakon Spaceways', cargoCapacity: 4, fuelCapacity: 32, jumpRange: 12, cost: 22800000, multirole: false, class: 3 },
  { id: 'alliance_challenger', name: 'Alliance Challenger', manufacturer: 'Lakon Spaceways', cargoCapacity: 6, fuelCapacity: 32, jumpRange: 13, cost: 30800000, multirole: false, class: 3 },
  { id: 'type8', name: 'Type-8 Transporter', manufacturer: 'Lakon Spaceways', cargoCapacity: 76, fuelCapacity: 32, jumpRange: 15, cost: 36000000, multirole: false, class: 3 },
  { id: 'krait_phantom', name: 'Krait Phantom', manufacturer: 'Falcon Delacy', cargoCapacity: 14, fuelCapacity: 32, jumpRange: 17, cost: 37300000, multirole: true, class: 2 },
  { id: 'krait_mk2', name: 'Krait Mk-II', manufacturer: 'Falcon Delacy', cargoCapacity: 18, fuelCapacity: 32, jumpRange: 16, cost: 45300000, multirole: true, class: 2 },
  { id: 'orca', name: 'Orca', manufacturer: 'Saud Kruger', cargoCapacity: 8, fuelCapacity: 32, jumpRange: 15, cost: 48500000, multirole: false, class: 3 },
  { id: 'mamba', name: 'Mamba', manufacturer: 'Zorgon Peterson', cargoCapacity: 2, fuelCapacity: 32, jumpRange: 12, cost: 56500000, multirole: false, class: 2 },
  { id: 'python_mk2', name: 'Python Mk-II', manufacturer: 'Falcon Delacy', cargoCapacity: 20, fuelCapacity: 32, jumpRange: 14, cost: 75000000, multirole: false, class: 3 },
  { id: 'beluga', name: 'Beluga Liner', manufacturer: 'Saud Kruger', cargoCapacity: 12, fuelCapacity: 64, jumpRange: 14, cost: 85000000, multirole: false, class: 3 },
  { id: 'type10', name: 'Type-10 Defender', manufacturer: 'Lakon Spaceways', cargoCapacity: 128, fuelCapacity: 64, jumpRange: 9, cost: 125000000, multirole: false, class: 4 },
  { id: 'federal_corvette', name: 'Federal Corvette', manufacturer: 'Core Dynamics', cargoCapacity: 16, fuelCapacity: 64, jumpRange: 15, cost: 190000000, multirole: false, class: 4 },
  { id: 'imperial_cutter', name: 'Imperial Cutter', manufacturer: 'Gutamaya', cargoCapacity: 120, fuelCapacity: 64, jumpRange: 16, cost: 210000000, multirole: true, class: 4 },
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
};

function createInitialState() {
  return {
    version: 1,
    credits: 100000,
    ship: {
      type: 'sidewinder',
      name: 'Sidewinder Mk-I',
      cargo: [], // [{commodity, qty}]
      fuel: 8,
      fuelCapacity: 8,
      cargoCapacity: 4,
      modules: getDefaultModules('sidewinder'),
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
    // Refinery (mining yields)
    refinery: [], // [{materialId, qty}]
    refineryCapacity: 4,
    // Ship locker (materials)
    materials: {}, // materialId -> qty
    // Navigation
    plottedRoute: null,
    // Fleet
    ownedShips: [],
    fleetCarriers: [],
    // Achievements
    achievements: {
      firstDiscoveries: {},
      milestones: {},
      scannedSystemSeeds: [],
      systemsScanned: 0,
      totalBodiesScanned: 0,
    },
    // Settings
    settings: {
      crtEffect: true,
      scanlines: true,
      textBrightness: 100,
      miniScreen: false,
    },
    createdAt: Date.now(),
  };
}

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, setState] = useState(createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        setState(prev => {
          const merged = { ...prev, ...parsed,
          settings: { ...prev.settings, ...(parsed.settings || {}) },
          achievements: {
            firstDiscoveries: {}, milestones: {}, scannedSystemSeeds: [], systemsScanned: 0, totalBodiesScanned: 0,
            ...(parsed.achievements || {}),
          },
          ownedShips: parsed.ownedShips || [],
          fleetCarriers: parsed.fleetCarriers || [],
        };
          // Regenerate system data for the current system (not persisted since it's large)
          if (merged.currentSystem) {
            merged.currentSystemData = generateSystem(merged.currentSystem.seed, merged.currentSystem.starClass);
          }
          return merged;
        });
      } else {
        // No save — generate initial system data
        setState(prev => ({
          ...prev,
          currentSystemData: generateSystem(prev.currentSystem.seed, prev.currentSystem.starClass),
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

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
    const data = generateSystem(system.seed, system.starClass);
    return data;
  }, []);

  // Set current system and generate its data
  const setCurrentSystem = useCallback((system) => {
    const systemData = generateSystem(system.seed, system.starClass);
    setState(prev => ({
      ...prev,
      currentSystem: system,
      currentSystemData: systemData,
      currentLocation: 'system',
      currentStationId: null,
      totalJumps: prev.totalJumps + 1,
      discoveredSystems: {
        ...prev.discoveredSystems,
        [system.seed]: prev.discoveredSystems[system.seed] || {
          name: system.name,
          firstDiscovered: true,
          bodyCount: systemData.bodyCount,
          scanValue: 0,
        },
      },
    }));
  }, []);

  // Dock at a station
  const dockAtStation = useCallback((stationId) => {
    setState(prev => ({
      ...prev,
      currentLocation: 'station',
      currentStationId: stationId,
    }));
  }, []);

  // Leave station
  const leaveStation = useCallback(() => {
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
      if (!shipType || prev.credits < shipType.cost) return prev;
      const oldShip = {
        id: `ship_${Date.now()}`,
        typeId: prev.ship.type,
        customName: prev.ship.name,
        storedAt: { systemSeed: prev.currentSystem.seed, stationId: prev.currentStationId },
        cargo: prev.ship.cargo,
        fuel: prev.ship.fuel,
        modules: prev.ship.modules || getDefaultModules(prev.ship.type),
      };
      const newMods = getDefaultModules(shipType.id);
      const newStats = computeShipStats(shipType.id, newMods);
      return {
        ...prev,
        credits: prev.credits - shipType.cost,
        ship: {
          type: shipType.id,
          name: customName || shipType.name,
          cargo: [],
          fuel: newStats.fuelCapacity,
          fuelCapacity: newStats.fuelCapacity,
          cargoCapacity: newStats.cargoCapacity,
          modules: newMods,
        },
        ownedShips: [...prev.ownedShips, oldShip],
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
      const cost = Math.ceil(shipType.cost * 0.01) + 10000;
      if (prev.credits < cost) return prev;
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
      if (prev.credits < CARRIER_COST) return prev;
      if ((prev.currentSystem?.population || 0) <= 1000000000) return prev;
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
      };
      return {
        ...prev,
        credits: prev.credits - CARRIER_COST,
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
      const tritiumCost = Math.ceil(dist / 10);
      if (c.tritium < tritiumCost) return prev;
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
        if (cls === 'NS' && !ach.firstDiscoveries.neutron_star) ach.firstDiscoveries.neutron_star = { system: sysName, date: Date.now() };
        if (cls === 'BH' && !ach.firstDiscoveries.black_hole) ach.firstDiscoveries.black_hole = { system: sysName, date: Date.now() };
      }
      if (body.type === 'planet') {
        if (body.planetType === 'ammonia' && !ach.firstDiscoveries.ammonia_world) ach.firstDiscoveries.ammonia_world = { system: sysName, date: Date.now() };
        if (body.planetType === 'earthlike' && !ach.firstDiscoveries.earth_like) ach.firstDiscoveries.earth_like = { system: sysName, date: Date.now() };
        if (body.planetType === 'water_world' && !ach.firstDiscoveries.water_world) ach.firstDiscoveries.water_world = { system: sysName, date: Date.now() };
        if (body.habitable && !ach.firstDiscoveries.habitable_world) ach.firstDiscoveries.habitable_world = { system: sysName, date: Date.now() };
      }
      return {
        ...prev,
        scannedBodies: { ...prev.scannedBodies, [body.id]: { scanType: 'detailed', value: body.scanValue, date: Date.now() } },
        achievements: ach,
      };
    });
  }, []);

  // Sell exploration data
  const sellExplorationData = useCallback(() => {
    setState(prev => {
      let totalValue = 0;
      const soldBodies = [];
      for (const [bodyId, scan] of Object.entries(prev.scannedBodies)) {
        totalValue += scan.value;
        soldBodies.push(bodyId);
      }
      // Add system discovery bonuses (only for unsold ones)
      let systemBonus = 0;
      const updatedDiscovered = {};
      for (const [seed, sys] of Object.entries(prev.discoveredSystems)) {
        if (sys.firstDiscovered && !sys.bonusSold) {
          systemBonus += 5000 + (sys.bodyCount || 0) * 500;
          updatedDiscovered[seed] = { ...sys, bonusSold: true };
        } else {
          updatedDiscovered[seed] = sys;
        }
      }
      const totalPayout = totalValue + systemBonus;
      if (totalPayout === 0) return prev;
      return {
        ...prev,
        credits: prev.credits + totalPayout,
        soldExplorationData: [...prev.soldExplorationData, { value: totalPayout, date: Date.now(), bodies: soldBodies.length }],
        scannedBodies: {},
        discoveredSystems: updatedDiscovered,
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

  // Decommission a fleet carrier (75% refund, ships relocated)
  const decommissionCarrier = useCallback((carrierId) => {
    setState(prev => {
      const carrier = prev.fleetCarriers.find(c => c.id === carrierId);
      if (!carrier) return prev;
      const refund = Math.floor(5000000000 * 0.75);
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

  // Reset game
  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialState());
  }, []);

  const value = {
    state,
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

export function hasCarrierVendor(system) {
  return system && (system.population || 0) > 1000000000;
}

// Determine which ships are in stock at a station based on system population
export function getAvailableShipsAtStation(system) {
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
export function getOutfittingLevel(system, systemData) {
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