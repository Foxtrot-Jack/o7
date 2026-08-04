// Player Titles — cosmetic titles earned from gameplay milestones

import { isMfrDeckComplete } from './cardDeck';

export const TITLES = [
  { id: 'none', name: 'No Title', desc: 'Default — no title equipped.', condition: () => true },
  { id: 'starfarer', name: 'Starfarer', desc: 'Make your first hyperspace jump.', condition: (s) => s.totalJumps >= 1 },
  { id: 'trailblazer', name: 'Trailblazer', desc: 'Discover 10 star systems.', condition: (s) => Object.keys(s.discoveredSystems || {}).length >= 10 },
  { id: 'pathfinder', name: 'Pathfinder', desc: 'Discover 50 star systems.', condition: (s) => Object.keys(s.discoveredSystems || {}).length >= 50 },
  { id: 'merchant', name: 'Merchant Prince', desc: 'Earn 1,000,000 CR lifetime.', condition: (s) => (s.lifetimeEarnings || 0) >= 1000000 },
  { id: 'trade_baron', name: 'Trade Baron', desc: 'Earn 100,000,000 CR lifetime.', condition: (s) => (s.lifetimeEarnings || 0) >= 100000000 },
  { id: 'bounty_hunter', name: 'Bounty Hunter', desc: 'Complete 5 bounty missions.', condition: (s) => (s.bountyMissions || []).length >= 5 },
  { id: 'founder', name: 'Founder', desc: 'Establish your first colony.', condition: (s) => (s.colonies || []).length >= 1 },
  { id: 'fleet_commander', name: 'Fleet Commander', desc: 'Own a fleet carrier.', condition: (s) => (s.fleetCarriers || []).length >= 1 },
  { id: 'world_finder', name: 'World Discoverer', desc: 'First-discover an Earth-Like World.', condition: (s) => !!s.achievements?.firstDiscoveries?.earth_like },
  { id: 'xenobiologist', name: 'Xenobiologist', desc: 'Catalogue 3 biological species.', condition: (s) => Object.keys(s.exobiologyCodex || {}).length >= 3 },
  { id: 'engineer', name: 'Master Engineer', desc: 'Apply an engineering blueprint.', condition: (s) => !!s.ship?.modules?.__engineering && Object.keys(s.ship.modules.__engineering).length > 0 },
  { id: 'pirate', name: 'Scourge of the Lanes', desc: 'Commit an act of piracy.', condition: (s) => (s.crime?.notoriety || 0) > 0 },
  { id: 'elite_explorer', name: 'Elite Explorer', desc: 'Reach Elite exploration rank.', condition: (s) => s.rank?.exploration?.rank >= 8 },
  { id: 'station_owner', name: 'Station Magnate', desc: 'Build your own orbital station.', condition: (s) => (s.ownedStations || []).length >= 1 },
  { id: 'wing_leader', name: 'Wing Leader', desc: 'Hire 2 or more wingmates.', condition: (s) => (s.wingmates || []).length >= 2 },
  { id: 'mfr_drake_voss', name: 'Master of Drake-Voss', desc: 'Complete the Drake-Voss 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Drake-Voss') },
  { id: 'mfr_orion_heavy', name: 'Master of Orion Heavy', desc: 'Complete the Orion Heavy 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Orion Heavy') },
  { id: 'mfr_sentinel_forge', name: 'Master of Sentinel Forge', desc: 'Complete the Sentinel Forge 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Sentinel Forge') },
  { id: 'mfr_kepler', name: 'Master of Kepler Aeroworks', desc: 'Complete the Kepler Aeroworks 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Kepler Aeroworks') },
  { id: 'mfr_meridian', name: 'Master of Meridian Luxe', desc: 'Complete the Meridian Luxe 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Meridian Luxe') },
  { id: 'mfr_solaris', name: 'Master of Solaris Dynasty', desc: 'Complete the Solaris Dynasty 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Solaris Dynasty') },
  { id: 'mfr_proxima', name: 'Master of Proxima Corp', desc: 'Complete the Proxima Corp 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Proxima Corp') },
  { id: 'mfr_omega', name: 'Master of Omega Corp', desc: 'Complete the Omega Corp 100-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'Omega Corp') },
  { id: 'mfr_canis_stella', name: 'Master of Canis Stella', desc: 'Complete the Canis Stella 150-card deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'canis_stella') },
  { id: 'mfr_special', name: 'Grand Archivist of o7', desc: 'Complete the Special Class achievement deck.', condition: (s) => isMfrDeckComplete(s.cards?.owned || {}, 'special') },
];

export function getEarnedTitles(state) {
  return TITLES.filter(t => t.condition(state));
}

export function getTitle(id) {
  return TITLES.find(t => t.id === id) || TITLES[0];
}

export function getLockedTitles(state) {
  return TITLES.filter(t => !t.condition(state));
}