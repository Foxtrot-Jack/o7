// Player Titles — cosmetic titles earned from gameplay milestones

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