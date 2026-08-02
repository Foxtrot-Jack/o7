// Passenger transport — VIP, bulk, and sightseeing missions

export const PASSENGER_TYPES = [
  { id: 'economy', label: 'Economy Class', minRep: 0, baseReward: 5000, desc: 'Standard civilian transport', requiresCabin: 'economy' },
  { id: 'bulk', label: 'Bulk Colonist', minRep: 0, baseReward: 3000, desc: 'Group of colonists seeking new home', requiresCabin: 'economy' },
  { id: 'sightseeing', label: 'Sightseeing Tour', minRep: 0, baseReward: 15000, desc: 'Tour group wants to see local attractions', requiresCabin: 'economy' },
  { id: 'business', label: 'Business Class', minRep: 1, baseReward: 20000, desc: 'Corporate executive transport', requiresCabin: 'business' },
  { id: 'vip', label: 'VIP Transport', minRep: 2, baseReward: 80000, desc: 'High-profile individual requires discreet transport', requiresCabin: 'first' },
];

// Cabin class hierarchy — higher index = more exclusive
const CABIN_HIERARCHY = ['economy', 'business', 'first', 'luxury'];

const DESTINATION_PREFIXES = ['Beta', 'Alpha', 'Delta', 'Gamma', 'Epsilon', 'Zeta', 'Sigma', 'Tau', 'Omega', 'Kepler', 'Gliese', 'Wolf', 'Ross'];
const DESTINATION_SUFFIXES = ['Hydri', 'Ceti', 'Eridani', 'Cygni', 'Aquilae', 'Draconis', 'Lyrae', 'Centauri', 'Bootis', 'Persei'];

// Calculate passenger capacity from equipped cabin modules
export function getPassengerCapacity(shipClass, modules) {
  // If modules provided, calculate from equipped cabins
  if (modules) {
    let total = 0;
    for (const key of Object.keys(modules)) {
      if (key.startsWith('__')) continue;
      const modId = modules[key];
      if (!modId) continue;
      // Check if it's a passenger cabin by ID prefix
      if (typeof modId === 'string' && modId.startsWith('pc_')) {
        // Parse capacity from module definition — we import lazily to avoid circular deps
        // The capacity is encoded in the module stats, but we can compute it
        const parts = modId.split('_');
        const size = parseInt(parts[1]);
        const cls = parts[2];
        const cap = { e: size * 2, d: size, c: Math.ceil(size / 2), b: Math.max(1, Math.floor(size / 3)) };
        total += cap[cls] || 0;
      }
    }
    return total;
  }
  // Fallback: old ship-class-based calculation
  return Math.max(0, ((shipClass || 1) - 1) * 4);
}

// Get available cabin classes and their berth counts from modules
export function getCabinClasses(modules) {
  const classes = {};
  if (!modules) return classes;
  for (const key of Object.keys(modules)) {
    if (key.startsWith('__')) continue;
    const modId = modules[key];
    if (!modId || typeof modId !== 'string' || !modId.startsWith('pc_')) continue;
    const parts = modId.split('_');
    const size = parseInt(parts[1]);
    const cls = parts[2];
    const cabinClass = { e: 'economy', d: 'business', c: 'first', b: 'luxury' }[cls];
    if (!cabinClass) continue;
    const cap = { e: size * 2, d: size, c: Math.ceil(size / 2), b: Math.max(1, Math.floor(size / 3)) };
    classes[cabinClass] = (classes[cabinClass] || 0) + cap[cls];
  }
  return classes;
}

// Check if the ship has a cabin class that can accept the given passenger type
export function hasRequiredCabin(passengerTypeId, modules) {
  const reqCabin = PASSENGER_TYPES.find(t => t.id === passengerTypeId)?.requiresCabin;
  if (!reqCabin) return true;
  const classes = getCabinClasses(modules);
  const reqIdx = CABIN_HIERARCHY.indexOf(reqCabin);
  // A higher-class cabin can always accept lower-class passengers
  for (const cls of Object.keys(classes)) {
    if (CABIN_HIERARCHY.indexOf(cls) >= reqIdx) return true;
  }
  return false;
}

export function generatePassengerMissions(systemSeed, modules, count = 5) {
  const capacity = getPassengerCapacity(null, modules);
  const classes = getCabinClasses(modules);
  if (capacity === 0) return [];

  const missions = [];
  for (let i = 0; i < count; i++) {
    // Filter passenger types by available cabin classes
    const eligibleTypes = PASSENGER_TYPES.filter(t => {
      const reqIdx = CABIN_HIERARCHY.indexOf(t.requiresCabin);
      return Object.keys(classes).some(c => CABIN_HIERARCHY.indexOf(c) >= reqIdx);
    });
    if (eligibleTypes.length === 0) break;
    const type = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)];
    const isBulk = type.id === 'bulk';
    const passengers = isBulk
      ? Math.min(capacity, 2 + Math.ceil(Math.random() * (capacity - 1)))
      : Math.min(capacity, 1 + Math.ceil(Math.random() * 2));
    const jumpsRequired = 1 + Math.floor(Math.random() * 3);
    const dest = `${DESTINATION_PREFIXES[Math.floor(Math.random() * DESTINATION_PREFIXES.length)]} ${DESTINATION_SUFFIXES[Math.floor(Math.random() * DESTINATION_SUFFIXES.length)]}`;
    const reward = type.baseReward * passengers * (1 + jumpsRequired * 0.3) * (0.8 + Math.random() * 0.4);
    missions.push({
      id: `passenger_${systemSeed}_${i}_${Date.now()}`,
      type,
      passengers,
      destination: dest,
      jumpsRequired,
      jumpsCompleted: 0,
      reward: Math.round(reward),
      deadline: Date.now() + (24 + jumpsRequired * 12) * 3600000,
    });
  }
  return missions;
}

export function isPassengerMissionReady(mission) {
  return mission.jumpsCompleted >= mission.jumpsRequired;
}

export function isPassengerMissionExpired(mission) {
  return Date.now() > mission.deadline;
}