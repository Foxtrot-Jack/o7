// Room types, costs, and service room mapping for fleet carriers and stations
export const ROOM_TYPES = {
  living: { name: 'Living Quarters', cost: 500000, desc: 'Standard cabin with bed, window, shelves' },
  aquarium: { name: 'Aquarium', cost: 5000000, desc: 'Display aquatic life from water worlds' },
  garden: { name: 'Garden', cost: 5000000, desc: 'Display flora collected across the galaxy' },
  genetics: { name: 'Genetics Lab', cost: 10000000, desc: 'Edit and customize fish and flora' },
  lounge: { name: 'Crew Lounge', cost: 2000000, desc: 'Recreation area for crew and guests' },
  storage: { name: 'Storage Room', cost: 1000000, desc: 'Additional cargo and material storage' },
};

export const SERVICE_ROOMS = {
  market: { name: 'Market Hall', desc: 'Trade commodities' },
  shipyard: { name: 'Shipyard', desc: 'Purchase and store ships' },
  outfitting: { name: 'Outfitting Bay', desc: 'Install and modify ship modules' },
  refuel: { name: 'Refuel Station', desc: 'Refuel your ship' },
  repair: { name: 'Repair Bay', desc: 'Repair ship hull and modules' },
};

export const MAX_CARRIER_ROOMS = 25;

export function getRoomCost(existingRooms, isSandbox) {
  if (isSandbox) return 0;
  return 500000 * ((existingRooms?.length || 0) + 1);
}

export function getStationRoomCost(existingRooms, isSandbox) {
  if (isSandbox) return 0;
  const count = existingRooms?.length || 0;
  return Math.floor(1000000 * Math.pow(1.5, count));
}

export function getCarrierServiceRooms(carrier) {
  const rooms = [];
  const services = carrier?.services || {};
  for (const [svc, active] of Object.entries(services)) {
    if (active && SERVICE_ROOMS[svc]) {
      rooms.push({ id: `svc_${svc}_${carrier.id}`, type: `service_${svc}`, name: SERVICE_ROOMS[svc].name, isService: true });
    }
  }
  return rooms;
}

export function getAllRooms(target, targetId, state) {
  if (target === 'carrier') {
    const carrier = state.fleetCarriers?.find(c => c.id === targetId);
    if (!carrier) return [];
    const serviceRooms = getCarrierServiceRooms(carrier);
    const customRooms = state.carrierRooms?.[targetId] || [];
    const living = customRooms.find(r => r.type === 'living') || { id: `room_living_${targetId}`, type: 'living', name: 'Living Quarters' };
    return [living, ...serviceRooms, ...customRooms.filter(r => r.type !== 'living')];
  }
  if (target === 'station') {
    const customRooms = state.carrierRooms?.[targetId] || [];
    const living = customRooms.find(r => r.type === 'living') || { id: `room_living_${targetId}`, type: 'living', name: 'Living Quarters' };
    return [living, ...customRooms.filter(r => r.type !== 'living')];
  }
  return [{ id: 'ship_cabin', type: 'living', name: 'Cabin' }];
}

export function hasRoomType(target, targetId, roomType, state) {
  const rooms = getAllRooms(target, targetId, state);
  return rooms.some(r => r.type === roomType);
}