// Missions Screen — mission board with procedurally generated missions
import React, { useState, useMemo, useCallback } from 'react';
import { useGameState, MISSION_TYPES } from '@/lib/gameState';
import { makeRng, randInt, randFloat, pick, pickWeighted } from '@/lib/prng';
import { COMMODITIES } from '@/lib/commodities';
import { generateStarsInRange, distance3D } from '@/lib/galaxy';
import { ClipboardList, CheckCircle, Clock, MapPin, Package, Pickaxe, Telescope, Users, Wrench, Map } from 'lucide-react';

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
    desc: 'Scan {qty} celestial bodies in nearby systems.',
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
};

export default function MissionsScreen() {
  const { state, getSystemData, addMission, completeMission, addCargo, addCredits, removeCargo, lockSurfaceMap, unlockSurfaceMaps } = useGameState();
  const [acceptedFilter, setAcceptedFilter] = useState(false);

  const systemData = getSystemData();
  const station = systemData?.stations.find(s => s.id === state.currentStationId);

  // Generate available missions
  const availableMissions = useMemo(() => {
    if (!station || !systemData) return [];
    const rng = makeRng(systemData.seed + ':missions:' + station.id + ':' + Math.floor(Date.now() / 600000));
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
      ]);

      const template = MISSION_TEMPLATES[type];
      const commodity = pick(rng, COMMODITIES);
      const qty = randInt(rng, 1, 20);
      const rewardMultiplier = randFloat(rng, 0.8, 2.5);
      const isSurfaceScan = type === MISSION_TYPES.SURFACE_SCAN;
      const scanReward = Math.round(template.rewardBase * randFloat(rng, 0.8, 2.0) / 10) * 10;
      const reward = isSurfaceScan ? scanReward : Math.round(template.rewardBase * qty * rewardMultiplier / 10) * 10;

      // Pick a destination system — local for mining/salvage/exploration, nearby for delivery/courier/passenger/surface_scan
      const isLocal = [MISSION_TYPES.MINING, MISSION_TYPES.SALVAGE, MISSION_TYPES.EXPLORATION].includes(type);
      const destStar = isLocal ? center : (nearbyStars.length > 0 ? pick(rng, nearbyStars) : null);
      const destination = destStar ? destStar.name : 'unknown sector';

      const desc = template.desc
        .replace('{qty}', qty)
        .replace('{commodity}', commodity.name)
        .replace('{destination}', destination);

      missions.push({
        id: `mission_${i}_${Date.now()}`,
        type,
        name: template.name,
        description: desc,
        commodity: isSurfaceScan ? null : commodity.id,
        commodityName: isSurfaceScan ? null : commodity.name,
        qty: isSurfaceScan ? 0 : qty,
        reward,
        deadline: Date.now() + randInt(rng, 1, 7) * 24 * 60 * 60 * 1000,
        reputation: randInt(rng, 1, 5),
        destinationSystem: destStar ? { seed: destStar.seed, name: destStar.name, x: destStar.x, y: destStar.y, z: destStar.z } : null,
        destinationSystemName: destination,
      });
    }

    return missions;
  }, [station, systemData, state.currentSystem]);

  const handleAccept = (mission) => {
    addMission(mission);
    if (mission.type === MISSION_TYPES.SURFACE_SCAN && mission.destinationSystem?.seed) {
      lockSurfaceMap(mission.id, mission.destinationSystem.seed);
    }
  };

  const handleCompleteMission = (mission) => {
    if (mission.type === MISSION_TYPES.SURFACE_SCAN) {
      const hasMap = Object.values(state.surfaceMaps || {}).some(m => m.systemSeed === mission.destinationSystem?.seed);
      if (!hasMap) {
        alert('REQUIRES SURFACE SCAN DATA FROM TARGET SYSTEM');
        return;
      }
    } else if (mission.commodity && mission.type !== MISSION_TYPES.EXPLORATION) {
      const cargoItem = state.ship.cargo.find(c => c.commodity === mission.commodity);
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

  const formatDeadline = (timestamp) => {
    const remaining = timestamp - Date.now();
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  if (!station) {
    return <div className="p-4 text-orange-500">Must be docked at a station to access the mission board.</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-orange-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-orange-500" />
          <span className="text-orange-300 font-bold uppercase text-sm">Mission Board — {station.name}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setAcceptedFilter(false)}
            className={`px-2 py-1 text-[10px] border ${!acceptedFilter ? 'border-orange-500 text-orange-300' : 'border-orange-900 text-orange-700'}`}
          >AVAILABLE ({availableMissions.length})</button>
          <button
            onClick={() => setAcceptedFilter(true)}
            className={`px-2 py-1 text-[10px] border ${acceptedFilter ? 'border-orange-500 text-orange-300' : 'border-orange-900 text-orange-700'}`}
          >ACCEPTED ({state.activeMissions.length})</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!acceptedFilter && availableMissions.map(mission => {
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

        {acceptedFilter && state.activeMissions.map(mission => {
          const template = MISSION_TEMPLATES[mission.type];
          const Icon = template.icon;
          const cargoItem = mission.commodity ? state.ship.cargo.find(c => c.commodity === mission.commodity) : null;
          const hasCargo = cargoItem && cargoItem.qty >= mission.qty;
          const hasSurfaceMap = mission.type === MISSION_TYPES.SURFACE_SCAN && Object.values(state.surfaceMaps || {}).some(m => m.systemSeed === mission.destinationSystem?.seed);
          const canComplete = mission.type === MISSION_TYPES.EXPLORATION || (mission.type === MISSION_TYPES.SURFACE_SCAN ? hasSurfaceMap : hasCargo);

          return (
            <div key={mission.id} className="border border-green-900 p-3 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-green-300 font-bold">{mission.name}</div>
                    <div className="text-orange-600 mt-0.5">{mission.description}</div>
                    {mission.commodity && (
                      <div className="text-orange-700 text-[10px] mt-1">
                        PROGRESS: {cargoItem?.qty || 0}/{mission.qty}T
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
              <div className="mt-2 flex justify-end">
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