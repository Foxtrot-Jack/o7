// Crime & Punishment — notoriety, bounties, and station access restrictions

export const CRIME_TYPES = {
  smuggling: { id: 'smuggling', label: 'Smuggling', notoriety: 1, baseBounty: 500 },
  piracy: { id: 'piracy', label: 'Piracy', notoriety: 2, baseBounty: 2000 },
  murder: { id: 'murder', label: 'Ship Destruction', notoriety: 4, baseBounty: 10000 },
  refusal: { id: 'refusal', label: 'Scan Refusal', notoriety: 1, baseBounty: 1000 },
};

export const NOTORIETY_LEVELS = [
  { min: 0, max: 0, label: 'Clean', color: 'text-green-500', stationAccess: 'all' },
  { min: 1, max: 2, label: 'Minor Offender', color: 'text-yellow-500', stationAccess: 'high_sec_denied' },
  { min: 3, max: 5, label: 'Wanted', color: 'text-orange-500', stationAccess: 'med_sec_denied' },
  { min: 6, max: 9, label: 'Dangerous Criminal', color: 'text-red-500', stationAccess: 'anarchy_only' },
  { min: 10, max: 999, label: 'Notorious', color: 'text-red-700 font-bold', stationAccess: 'anarchy_only' },
];

export function getNotorietyLevel(notoriety) {
  return NOTORIETY_LEVELS.find(l => notoriety >= l.min && notoriety <= l.max) || NOTORIETY_LEVELS[0];
}

export function canDockAtStation(notoriety, systemSecurity) {
  const level = getNotorietyLevel(notoriety);
  if (level.stationAccess === 'all') return true;
  if (level.stationAccess === 'anarchy_only') return systemSecurity === 'anarchy';
  if (level.stationAccess === 'med_sec_denied') return systemSecurity === 'anarchy' || systemSecurity === 'low';
  if (level.stationAccess === 'high_sec_denied') return systemSecurity !== 'high';
  return true;
}

export function getCleanRecordCost(bounty) {
  return Math.ceil(bounty * 1.2);
}