// Missions Screen — mission board with procedurally generated missions
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState, MISSION_TYPES, SHIP_MAP } from '@/lib/gameState';
import { makeRng, randInt, randFloat, pick, pickWeighted } from '@/lib/prng';
import { COMMODITIES, COMMODITY_MAP } from '@/lib/commodities';
import { computeCustomShipStats } from '@/lib/shipParts';
import { MODULES } from '@/lib/shipOutfitting';
import { generateStarsInRange, distance3D } from '@/lib/galaxy';
import { MINING_MATERIAL_IDS } from '@/lib/system';
import { ClipboardList, CheckCircle, Clock, MapPin, Package, Pickaxe, Telescope, Users, Wrench, Map, XCircle, Camera } from 'lucide-react';

const MISSION_TEMPLATES = {
  [MISSION_TYPES.DELIVERY]: {
    name: 'Delivery Contract',
    icon: Package,
    desc: 'Transport {qty}T of {commodity} to {destination}.',
    rewardBase: 5000,
  },
  [MISSION_TYPES.COURIER]: {
    name: 'Courier Contract',
    icon: ClipboardList,
    desc: 'Deliver classified data to {destination}.',
    rewardBase: 8000,
  },
  [MISSION_TYPES.MINING]: {
    name: 'Mining Contract',
    icon: Pickaxe,
    desc: 'Mine and deliver {qty}T of {commodity} from local belts.',
    rewardBase: 12000,
  },
  [MISSION_TYPES.PASSENGER]: {
    name: 'Passenger Transport',
    icon: Users,
    desc: 'Transport {qty} passengers to {destination}.',
    rewardBase: 15000,
  },
  [MISSION_TYPES.SALVAGE]: {
    name: 'Salvage Operation',
    icon: Wrench,
    desc: 'Recover {qty}T of {commodity} from derelict vessels.',
    rewardBase: 18000,
  },
  [MISSION_TYPES.EXPLORATION]: {
    name: 'Exploration Contract',
    icon: Telescope,
    desc: 'Scan {qty} celestial bodies and deliver the survey data.',
    rewardBase: 20000,
  },
  [MISSION_TYPES.COLONIZATION_SUPPLY]: {
    name: 'Colonization Supply Run',
    icon: MapPin,
    desc: 'Deliver {qty}T of {commodity} to a developing colony.',
    rewardBase: 25000,
  },
  [MISSION_TYPES.SURFACE_SCAN]: {
    name: 'Surface Cartography',
    icon: Map,
    desc: 'Provide surface scan data for a celestial body in {destination}.',
    rewardBase: 30000,
  },
  [MISSION_TYPES.TOURISM]: {
    name: 'Sightseeing Tour',
    icon: Camera,
    desc: 'Take {qty} tourists on a scenic tour of {destination}.',
    rewardBase: 22000,
  },
};

export default function MissionsScreen() {
  const { state, getSystemData, addMission, completeMission, addCargo, addCredits, removeCargo, lockSurfaceMap, unlockSurfaceMaps, update } = useGameState();
  const [acceptedFilter, setAcceptedFilter] = useState(false);
  const [sortByType, setSortByType] = useState(false);

  const systemData = getSystemData();
  const station = systemData?.stations.find(s => s.id === state.currentStationId);

  // Mission board refresh bucket — 10-minute window. Used as part of the
  // deterministic mission ID so the same mission keeps the same ID across
  // remounts (prevents re-acceptance after navigating away and back).
  const timeBucket = Math.floor(Date.now() / 600000);

  const playerJumpRange = useMemo(() => {
    if (state.ship?.type === 'custom' && state.ship?.customShipId) {
      const design = (state.customShips || []).find(s => s.id === state.ship.customShipId);
      if (design) return computeCustomShipStats(design).jumpRange;
    }
    return SHIP_MAP[state.ship?.type]?.jumpRange || 8;
  }, [state.ship, state.customShips]);

  // Generate available missions
  const availableMissions = useMemo(() => {
    if (!station || !systemData) return [];
    const rng = makeRng(systemData.seed + ':missions:' + station.id + ':' + timeBucket);
    const count = randInt(rng, 4, 8);
    const missions = [];

    // Generate nearby populated systems for mission destinations
    const center = state.currentSystem;
    const nearbyStars = generateStarsInRange(center.x, center.y, center.z, 40)
      .filter(s => s.seed !== center.seed && s.population > 0)
      .map(s => ({ ...s, dist: distance3D(center, s) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 15);

    for (let i = 0; i < count; i++) {
      const type = pickWeighted(rng, [
        { value: MISSION_TYPES.DELIVERY, weight: 30 },
        { value: MISSION_TYPES.COURIER, weight: 20 },
        { value: MISSION_TYPES.MINING, weight: 15 },
        { value: MISSION_TYPES.PASSENGER, weight: 10 },
        { value: MISSION_TYPES.SALVAGE, weight: 10 },
        { value: MISSION_TYPES.EXPLORATION, weight: 10 },
        { value: MISSION_TYPES.COLONIZATION_SUPPLY, weight: 5 },
        { value: MISSION_TYPES.SURFACE_SCAN, weight: 8 },
        { value: MISSION_TYPES.TOURISM, weight: 8 },
      ]);

      const template = MISSION_TEMPLATES[type];
      // Mining missions target only mineable materials; others use any commodity
      const commodity = type === MISSION_TYPES.MINING
        ? (COMMODITY_MAP[pick(rng, MINING_MATERIAL_IDS)] || pick(rng, COMMODITIES))
        : pick(rng, COMMODITIES);
      const qty = randInt(rng, 1, 20);
      const rewardMultiplier = randFloat(rng, 0.8, 2.5);
      const isSurfaceScan = type === MISSION_TYPES.SURFACE_SCAN;
      const isCourier = type === MISSION_TYPES.COURIER;
      const isTourism = type === MISSION_TYPES.TOURISM;
      const noCargo = isSurfaceScan || isCourier || isTourism;
      const scanReward = Math.round(template.rewardBase * randFloat(rng, 0.8, 2.0) / 10) * 10;
      const reward = isSurfaceScan ? scanReward : isCourier ? Math.round(template.rewardBase * rewardMultiplier / 10) * 10 : Math.round(template.rewardBase * qty * rewardMultiplier / 10) * 10;

      // Pick a destination system — local for mining/salvage/exploration, nearby for delivery/courier/passenger/surface_scan
      const isLocal = [MISSION_TYPES.MINING, MISSION_TYPES.SALVAGE, MISSION_TYPES.EXPLORATION].includes(type);
      const destStar = isLocal ? center : (nearbyStars.length > 0 ? pick(rng, nearbyStars) : null);
      const destination = destStar ? destStar.name : 'unknown sector';

      const desc = template.desc
        .replace('{qty}', qty)
        .replace('{commodity}', commodity.name)
        .replace('{destination}', destination);

      missions.push({
      id: `mission_${systemData.seed}_${station.id}_${i}_${timeBucket}`,
      type,
        name: template.name,
        description: desc,
        commodity: noCargo ? null : commodity.id,
        commodityName: noCargo ? null : commodity.name,
        qty: noCargo ? 0 : qty,
        reward,
        deadline: Date.now() + randInt(rng, 1, 7) * 24 * 60 * 60 * 1000,
        reputation: randInt(rng, 1, 5),
        destinationSystem: destStar ? { seed: destStar.seed, name: destStar.name, x: destStar.x, y: destStar.y, z: destStar.z } : null,
        destinationSystemName: destination,
        distanceLy: isLocal ? 0 : (destStar ? Math.round(destStar.dist * 10) / 10 : 0),
      });
    }

    return missions;
  }, [station, systemData, state.currentSystem, timeBucket]);

  const handleAccept = (mission) => {
    // Passenger missions require sufficient cabin capacity
    if (mission.type === MISSION_TYPES.PASSENGER || mission.type === MISSION_TYPES.TOURISM) {
      const modules = state.ship?.modules || {};
      let totalCapacity = 0;
      for (const [key, modId] of Object.entries(modules)) {
        if (!key.startsWith('opt_')) continue;
        const mod = MODULES[modId];
        if (mod && mod.type === 'passenger_cabin') {
          totalCapacity += mod.passengerCapacity || 0;
        }
      }
      if (totalCapacity < mission.qty) {
        alert(`INSUFFICIENT PASSENGER CABINS — Need ${mission.qty} berths, have ${totalCapacity}. Install passenger cabins in Outfitting.`);
        return;
      }
    }
    addMission(mission);
    // Track the accepted mission ID so it stays hidden from the board even
    // after completion/cancellation (within the same refresh window).
    update({ acceptedMissionIds: [...(state.acceptedMissionIds || []), mission.id].slice(-100) });
    if (mission.type === MISSION_TYPES.SURFACE_SCAN && mission.destinationSystem?.seed) {
      lockSurfaceMap(mission.id, mission.destinationSystem.seed);
    }
  };

  const handleCompleteMission = (mission) => {
    // Travel missions require being at the destination system
    const travelMissions = [MISSION_TYPES.DELIVERY, MISSION_TYPES.COURIER, MISSION_TYPES.PASSENGER, MISSION_TYPES.COLONIZATION_SUPPLY, MISSION_TYPES.TOURISM];
    if (travelMissions.includes(mission.type) && mission.destinationSystem && state.currentSystem.seed !== mission.destinationSystem.seed) {
      alert('MUST BE AT DESTINATION SYSTEM TO COMPLETE');
      return;
    }
    if (mission.type === MISSION_TYPES.SURFACE_SCAN) {
      const hasMap = Object.values(state.surfaceMaps || {}).some(m => m.systemSeed === mission.destinationSystem?.seed);
      if (!hasMap) {
        alert('REQUIRES SURFACE SCAN DATA FROM TARGET SYSTEM');
        return;
      }
    } else if (mission.type === MISSION_TYPES.EXPLORATION) {
      const scanCount = Object.keys(state.scannedBodies || {}).length;
      if (scanCount < mission.qty) {
        alert(`REQUIRES ${mission.qty} SCANNED BODIES (HAVE ${scanCount})`);
        return;
      }
    } else if (mission.commodity && mission.type !== MISSION_TYPES.PASSENGER) {
      const cargoItem = (state.ship?.cargo || []).find(c => c.commodity === mission.commodity);
      if (!cargoItem || cargoItem.qty < mission.qty) {
        alert(`REQUIRES ${mission.qty}T OF ${mission.commodityName.toUpperCase()}`);
        return;
      }
      removeCargo(mission.commodity, mission.qty);
    }
    completeMission(mission.id);
    if (mission.type === MISSION_TYPES.SURFACE_SCAN) {
      unlockSurfaceMaps(mission.id);
    }
  };

  const handleCancelMission = (mission) => {
    if (!window.confirm('Cancel this mission? You will lose reputation with the issuing faction.')) return;
    update({
      activeMissions: state.activeMissions.filter(m => m.id !== mission.id),
      reputation: Math.max(-100, (state.reputation || 0) - (mission.reputation * 2)),
    });
    if (mission.type === MISSION_TYPES.SURFACE_SCAN) {
      unlockSurfaceMaps(mission.id);
    }
  };

  const formatDeadline = (timestamp) => {
    const remaining = timestamp - Date.now();
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  // Hide missions that have already been accepted from the available board.
  const acceptedIds = state.acceptedMissionIds || [];
  let visibleMissions = availableMissions.filter(m => !acceptedIds.includes(m.id));
  if (sortByType) visibleMissions = [...visibleMissions].sort((a, b) => (a.type || '').localeCompare(b.type || ''));

  if (!station) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b border-orange-900 p-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase text-sm">Active Missions — In Flight</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-orange-700 text-[10px]">Dock at a station to accept new contracts.</div>
          {state.activeMissions.length === 0 && (
            <div className="text-center text-orange-700 py-8">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active missions.</p>
            </div>
          )}
          {state.activeMissions.map(mission => {
            const template = MISSION_TEMPLATES[mission.type];
            const Icon = template.icon;
            return (
              <div key={mission.id} className="border border-green-900 p-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="text-green-300 font-bold">{mission.name}</div>
                      <div className="text-orange-600 mt-0.5">{mission.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-300 font-bold">{mission.reward.toLocaleString()} CR</div>
                    <div className="text-orange-700 text-[10px] flex items-center gap-1 justify-end">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDeadline(mission.deadline)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleCancelMission(mission)}
                    className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px] flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    CANCEL
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase text-sm">Mission Board — {station.name}</span>
          <span className="text-orange-700 text-[10px] ml-2">JUMP RANGE: <span className="text-orange-400">{playerJumpRange} LY</span></span>
        </div>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setAcceptedFilter(false)}
            className={`px-2 py-1 text-[10px] border ${!acceptedFilter ? 'border-orange-500 text-orange-300' : 'border-orange-900 text-orange-700'}`}
          >AVAILABLE ({visibleMissions.length})</button>
          <button
            onClick={() => setAcceptedFilter(true)}
            className={`px-2 py-1 text-[10px] border ${acceptedFilter ? 'border-orange-500 text-orange-300' : 'border-orange-900 text-orange-700'}`}
          >ACCEPTED ({state.activeMissions.length})</button>
          <button
            onClick={() => setSortByType(s => !s)}
            className={`px-2 py-1 text-[10px] border ${sortByType ? 'border-cyan-500 text-cyan-300' : 'border-orange-900 text-orange-700'}`}
          >⇅ TYPE</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!acceptedFilter && visibleMissions.length === 0 && (
          <div className="text-center text-orange-700 py-8">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No contracts available. Check back later.</p>
          </div>
        )}
        {!acceptedFilter && visibleMissions.map(mission => {
          const template = MISSION_TEMPLATES[mission.type];
          const Icon = template.icon;
          const isAccepted = state.activeMissions.some(m => m.id === mission.id);
          return (
            <div key={mission.id} className="border border-orange-900 p-3 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <div className="text-orange-300 font-bold">{mission.name}</div>
                    <div className="text-orange-600 mt-0.5">{mission.description}</div>
                    {mission.distanceLy > 0 ? (
                      <div className="text-orange-700 text-[10px] mt-1 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        DISTANCE: {mission.distanceLy.toFixed(1)} LY
                        {mission.distanceLy > playerJumpRange && (
                          <span className="text-yellow-600">⚠ MULTI-JUMP</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-cyan-700 text-[10px] mt-1">◉ LOCAL SYSTEM</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-300 font-bold">{mission.reward.toLocaleString()} CR</div>
                  <div className="text-orange-700 text-[10px] flex items-center gap-1 justify-end">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDeadline(mission.deadline)}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-orange-800 text-[10px]">REP: +{mission.reputation}</span>
                {isAccepted ? (
                  <span className="text-green-600 text-[10px]">✓ ACCEPTED</span>
                ) : (
                  <button
                    onClick={() => handleAccept(mission)}
                    className="px-3 py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[10px]"
                  >ACCEPT</button>
                )}
              </div>
            </div>
          );
        })}

        {acceptedFilter && state.activeMissions.length === 0 && (
          <div className="text-center text-orange-700 py-8">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active missions.</p>
          </div>
        )}

        {acceptedFilter && (sortByType ? [...state.activeMissions].sort((a, b) => (a.type || '').localeCompare(b.type || '')) : state.activeMissions).map(mission => {
          const template = MISSION_TEMPLATES[mission.type];
          const Icon = template.icon;
          const cargoItem = mission.commodity ? state.ship.cargo.find(c => c.commodity === mission.commodity) : null;
          const hasCargo = cargoItem && cargoItem.qty >= mission.qty;
          const hasSurfaceMap = mission.type === MISSION_TYPES.SURFACE_SCAN && Object.values(state.surfaceMaps || {}).some(m => m.systemSeed === mission.destinationSystem?.seed);
          const isDataMission = mission.type === MISSION_TYPES.COURIER || mission.type === MISSION_TYPES.PASSENGER || mission.type === MISSION_TYPES.TOURISM;
          const isAtDestination = !mission.destinationSystem || state.currentSystem.seed === mission.destinationSystem.seed;
          const hasScans = mission.type === MISSION_TYPES.EXPLORATION ? Object.keys(state.scannedBodies || {}).length >= (mission.qty || 1) : false;
          const canComplete = (isDataMission && isAtDestination) || (mission.type === MISSION_TYPES.EXPLORATION ? (hasScans && isAtDestination) : (mission.type === MISSION_TYPES.SURFACE_SCAN ? hasSurfaceMap : (hasCargo && isAtDestination)));

          return (
            <div key={mission.id} className="border border-green-900 p-3 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-green-300 font-bold">{mission.name}</div>
                    <div className="text-orange-600 mt-0.5">{mission.description}</div>
                    {mission.distanceLy > 0 && (
                      <div className="text-orange-700 text-[10px] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {mission.distanceLy.toFixed(1)} LY
                      </div>
                    )}
                    {mission.commodity && mission.type !== MISSION_TYPES.PASSENGER && mission.type !== MISSION_TYPES.EXPLORATION && (
                      <div className="text-orange-700 text-[10px] mt-1">
                        PROGRESS: {cargoItem?.qty || 0}/{mission.qty}T
                      </div>
                    )}
                    {mission.type === MISSION_TYPES.COURIER && (
                      <div className="text-cyan-700 text-[10px] mt-1">
                        ✓ DATA PACKAGE SECURED — DELIVER TO COMPLETE
                      </div>
                    )}
                    {mission.type === MISSION_TYPES.EXPLORATION && (
                      <div className="text-orange-700 text-[10px] mt-1">
                        SCANS: {Object.keys(state.scannedBodies || {}).length}/{mission.qty}
                      </div>
                    )}
                    {mission.type === MISSION_TYPES.SURFACE_SCAN && (
                      <div className="text-orange-700 text-[10px] mt-1">
                        {Object.values(state.surfaceMaps || {}).some(m => m.systemSeed === mission.destinationSystem?.seed)
                          ? '✓ SURFACE DATA OBTAINED — RETURN TO STATION'
                          : '○ SURFACE DATA REQUIRED — MAP A BODY IN TARGET SYSTEM'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-300 font-bold">{mission.reward.toLocaleString()} CR</div>
                  <div className="text-orange-700 text-[10px] flex items-center gap-1 justify-end">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDeadline(mission.deadline)}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-1">
                <button
                  onClick={() => handleCancelMission(mission)}
                  className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px] flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  CANCEL
                </button>
                <button
                  onClick={() => handleCompleteMission(mission)}
                  disabled={!canComplete}
                  className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[10px] disabled:opacity-30 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  {canComplete ? 'COMPLETE' : 'INCOMPLETE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}