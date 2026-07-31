// Passenger transport — VIP, bulk, and sightseeing missions

export const PASSENGER_TYPES = [
  { id: 'economy', label: 'Economy Class', minRep: 0, baseReward: 5000, desc: 'Standard civilian transport' },
  { id: 'bulk', label: 'Bulk Colonist', minRep: 0, baseReward: 3000, desc: 'Group of colonists seeking new home' },
  { id: 'business', label: 'Business Class', minRep: 1, baseReward: 20000, desc: 'Corporate executive transport' },
  { id: 'sightseeing', label: 'Sightseeing Tour', minRep: 0, baseReward: 15000, desc: 'Tour group wants to see local attractions' },
  { id: 'vip', label: 'VIP Transport', minRep: 2, baseReward: 80000, desc: 'High-profile individual requires discreet transport' },
];

const DESTINATION_PREFIXES = ['Beta', 'Alpha', 'Delta', 'Gamma', 'Epsilon', 'Zeta', 'Sigma', 'Tau', 'Omega', 'Kepler', 'Gliese', 'Wolf', 'Ross'];
const DESTINATION_SUFFIXES = ['Hydri', 'Ceti', 'Eridani', 'Cygni', 'Aquilae', 'Draconis', 'Lyrae', 'Centauri', 'Bootis', 'Persei'];

export function getPassengerCapacity(shipClass) {
  return Math.max(0, ((shipClass || 1) - 1) * 4);
}

export function generatePassengerMissions(systemSeed, shipClass, count = 5) {
  const capacity = getPassengerCapacity(shipClass);
  if (capacity === 0) return [];

  const missions = [];
  for (let i = 0; i < count; i++) {
    const type = PASSENGER_TYPES[Math.floor(Math.random() * PASSENGER_TYPES.length)];
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