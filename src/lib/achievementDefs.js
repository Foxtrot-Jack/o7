// Achievement definitions — 130+ goals across first discoveries and milestones

const num = (v) => typeof v === 'number' ? v : (Array.isArray(v) ? v.length : (v ? Object.keys(v).length : 0));

export const ACHIEVEMENT_ICONS = {
  star: 'Star', globe: 'Globe', map: 'Map', telescope: 'Telescope', award: 'Award',
  rocket: 'Rocket', ship: 'Ship', coins: 'Coins', fuel: 'Fuel', anchor: 'Anchor',
  bookmark: 'Bookmark', zap: 'Zap', mountain: 'Mountain', flask: 'Flask',
  boxes: 'Boxes', hammer: 'Hammer', route: 'Route', trending: 'TrendingUp',
  pickaxe: 'Pickaxe', trophy: 'Trophy', planet: 'Globe', comet: 'Star',
  gem: 'Award', atom: 'Star', crown: 'Trophy', target: 'Map', compass: 'Compass',
  layers: 'Layers', scan: 'Telescope', shield: 'Award', sword: 'Award',
  briefcase: 'Briefcase', palette: 'Palette', cards: 'Layers',
};

// Helper to create count-based milestones
function milestone(id, name, desc, icon, getter, threshold) {
  return { id, name, desc, section: 'milestones', icon, check: (s) => getter(s) >= threshold };
}

export const ACHIEVEMENT_DEFS = [
  // ===== PLANET FIRST DISCOVERIES (18) =====
  { id: 'planet_high_metal_content', name: 'Metal Body Pioneer', desc: 'First discovery of a High Metal Content body', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_rocky', name: 'Rocky Body Surveyor', desc: 'First discovery of a Rocky body', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_rocky_ice', name: 'Ice Rock Hunter', desc: 'First discovery of a Rocky Ice body', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_icy', name: 'Frost Voyager', desc: 'First discovery of an Icy body', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_earthlike', name: 'Earth-Like Finder', desc: 'First discovery of an Earth-like world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'planet_water_world', name: 'Water World Surveyor', desc: 'First discovery of a Water world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'planet_ammonia', name: 'Ammonia World Discoverer', desc: 'First discovery of an Ammonia world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'planet_gas_giant', name: 'Gas Giant Pioneer', desc: 'First discovery of a Class I Gas Giant', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_gas_giant_ii', name: 'Class II Giant Finder', desc: 'First discovery of a Class II Gas Giant', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_gas_giant_iii', name: 'Class III Giant Finder', desc: 'First discovery of a Class III Gas Giant', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_gas_giant_iv', name: 'Class IV Giant Finder', desc: 'First discovery of a Class IV Gas Giant', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_helium_rich', name: 'Helium-Rich Discoverer', desc: 'First discovery of a Helium-Rich Gas Giant', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_helium_gas_giant', name: 'Helium Giant Surveyor', desc: 'First discovery of a Helium Gas Giant', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_metal_rich', name: 'Metal-Rich Body Hunter', desc: 'First discovery of a Metal-Rich body', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_desert', name: 'Desert World Scout', desc: 'First discovery of a Desert world', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_terracformed', name: 'Terraformed World Finder', desc: 'First discovery of a Terraformed world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'planet_lava', name: 'Lava World Pioneer', desc: 'First discovery of a Lava world', section: 'firstDiscoveries', icon: 'planet' },
  { id: 'planet_carbon', name: 'Carbon World Surveyor', desc: 'First discovery of a Carbon world', section: 'firstDiscoveries', icon: 'planet' },

  // ===== STAR FIRST DISCOVERIES (9) =====
  { id: 'star_O', name: 'O-Class Star Pioneer', desc: 'First discovery of an O-class blue supergiant', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_B', name: 'B-Class Star Surveyor', desc: 'First discovery of a B-class star', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_A', name: 'A-Class Star Hunter', desc: 'First discovery of an A-class white star', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_F', name: 'F-Class Star Finder', desc: 'First discovery of an F-class star', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_G', name: 'G-Class Star Discoverer', desc: 'First discovery of a G-class yellow star', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_K', name: 'K-Class Star Voyager', desc: 'First discovery of a K-class orange dwarf', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_M', name: 'M-Class Star Scout', desc: 'First discovery of an M-class red dwarf', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_NS', name: 'Neutron Star Pioneer', desc: 'First discovery of a neutron star', section: 'firstDiscoveries', icon: 'star' },
  { id: 'star_BH', name: 'Black Hole Voyager', desc: 'First discovery of a black hole', section: 'firstDiscoveries', icon: 'star' },

  // ===== SURFACE SIGNAL FIRST DISCOVERIES (16) =====
  { id: 'signal_bacterial_colony', name: 'Bacterial Colony Finder', desc: 'First discovery of a Bacterial Colony', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_fungal_cluster', name: 'Fungal Cluster Pioneer', desc: 'First discovery of a Fungal Cluster', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_tubus_conifer', name: 'Tubus Conifer Surveyor', desc: 'First discovery of a Tubus Conifer', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_stratum_techtonicus', name: 'Stratum Techtonicus Finder', desc: 'First discovery of Stratum Techtonicus', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_tussocks', name: 'Tussocks Discoverer', desc: 'First discovery of Tussocks', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_bark_mounds', name: 'Bark Mounds Hunter', desc: 'First discovery of Bark Mounds', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_sinuous_tubers', name: 'Sinuous Tubers Pioneer', desc: 'First discovery of Sinuous Tubers', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_fumarole', name: 'Fumarole Finder', desc: 'First discovery of a Fumarole', section: 'firstDiscoveries', icon: 'mountain' },
  { id: 'signal_geyser', name: 'Geiser Surveyor', desc: 'First discovery of a Geiser', section: 'firstDiscoveries', icon: 'mountain' },
  { id: 'signal_lava_spout', name: 'Lava Spout Pioneer', desc: 'First discovery of a Lava Spout', section: 'firstDiscoveries', icon: 'mountain' },
  { id: 'signal_crystalline_shard', name: 'Crystalline Shard Finder', desc: 'First discovery of a Crystalline Shard', section: 'firstDiscoveries', icon: 'gem' },
  { id: 'signal_ice_geyser', name: 'Ice Geiser Discoverer', desc: 'First discovery of an Ice Geiser', section: 'firstDiscoveries', icon: 'mountain' },
  { id: 'signal_crystal_cluster', name: 'Crystal Cluster Hunter', desc: 'First discovery of a Crystal Cluster', section: 'firstDiscoveries', icon: 'gem' },
  { id: 'signal_mineral_deposit', name: 'Mineral Deposit Surveyor', desc: 'First discovery of a Mineral Deposit', section: 'firstDiscoveries', icon: 'gem' },
  { id: 'signal_brain_trees', name: 'Brain Trees Pioneer', desc: 'First discovery of Brain Trees', section: 'firstDiscoveries', icon: 'flask' },
  { id: 'signal_metallic_deposits', name: 'Metallic Deposits Finder', desc: 'First discovery of Metallic Deposits', section: 'firstDiscoveries', icon: 'gem' },

  // ===== LEGACY DISCOVERIES (6) =====
  { id: 'neutron_star', name: 'Neutron Star Pioneer (Legacy)', desc: 'First discovery of a neutron star', section: 'firstDiscoveries', icon: 'star' },
  { id: 'black_hole', name: 'Black Hole Voyager (Legacy)', desc: 'First discovery of a black hole', section: 'firstDiscoveries', icon: 'star' },
  { id: 'ammonia_world', name: 'Ammonia World Discoverer (Legacy)', desc: 'First discovery of an ammonia world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'earth_like', name: 'Earth-Like Finder (Legacy)', desc: 'First discovery of an Earth-like world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'water_world', name: 'Water World Surveyor (Legacy)', desc: 'First discovery of a water world', section: 'firstDiscoveries', icon: 'globe' },
  { id: 'habitable_world', name: 'Habitable World Trailblazer (Legacy)', desc: 'First discovery of a habitable world', section: 'firstDiscoveries', icon: 'globe' },

  // ===== EVENT-BASED MILESTONES (15) =====
  { id: 'first_carrier', name: 'Fleet Commander', desc: 'Purchased your first fleet carrier', section: 'milestones', icon: 'anchor' },
  { id: 'first_colony', name: 'Colonial Pioneer', desc: 'Established your first colony', section: 'milestones', icon: 'rocket' },
  { id: 'first_ship_purchase', name: 'Ship Buyer', desc: 'Purchased your first ship', section: 'milestones', icon: 'ship' },
  { id: 'first_fss_scan', name: 'Spectrum Analyst', desc: 'Completed your first FSS system scan', section: 'milestones', icon: 'scan' },
  { id: 'first_mapping', name: 'Surface Cartographer', desc: 'Mapped your first body with surface probes', section: 'milestones', icon: 'map' },
  { id: 'first_surface_landing', name: 'First Landing', desc: 'Landed on a planetary surface', section: 'milestones', icon: 'rocket' },
  { id: 'first_bookmark', name: 'Navigator', desc: 'Bookmarked your first system', section: 'milestones', icon: 'bookmark' },
  { id: 'first_shipyard_built', name: 'Shipwright', desc: 'Built a space shipyard', section: 'milestones', icon: 'hammer' },
  { id: 'first_custom_ship', name: 'Ship Architect', desc: 'Designed and saved your first custom ship', section: 'milestones', icon: 'boxes' },
  { id: 'first_commodity_delivery', name: 'Supplier', desc: 'Delivered cargo to a colony', section: 'milestones', icon: 'trending' },
  { id: 'first_neutron_jump', name: 'Neutron Highway', desc: 'Jumped from a neutron star system', section: 'milestones', icon: 'zap' },
  { id: 'first_outfitting', name: 'Outfitter', desc: 'Modified your ship at an outfitting dock', section: 'milestones', icon: 'hammer' },
  { id: 'first_engineering', name: 'Engineer', desc: 'Applied an engineering modification', section: 'milestones', icon: 'hammer' },
  { id: 'first_ship_transfer', name: 'Logistics Officer', desc: 'Transferred a stored ship', section: 'milestones', icon: 'ship' },
  { id: 'first_route_plotted', name: 'Navigator Elite', desc: 'Plotted your first multi-jump route', section: 'milestones', icon: 'route' },
  { id: 'found_sol', name: 'Homecoming', desc: 'Discovered Sol — humanity\'s lost cradle', section: 'milestones', icon: 'globe' },

  // ===== JUMP MILESTONES (8) =====
  milestone('jumps_1', 'First Jump', 'Complete your first hyperspace jump', 'zap', s => num(s.totalJumps), 1),
  milestone('jumps_10', 'Warp Initiate', 'Complete 10 hyperspace jumps', 'zap', s => num(s.totalJumps), 10),
  milestone('jumps_50', 'Spacefarer', 'Complete 50 hyperspace jumps', 'zap', s => num(s.totalJumps), 50),
  milestone('jumps_100', 'Star Hopper', 'Complete 100 hyperspace jumps', 'zap', s => num(s.totalJumps), 100),
  milestone('jumps_500', 'Void Walker', 'Complete 500 hyperspace jumps', 'zap', s => num(s.totalJumps), 500),
  milestone('jumps_1000', 'Galaxy Traveller', 'Complete 1,000 hyperspace jumps', 'zap', s => num(s.totalJumps), 1000),
  milestone('jumps_5000', 'Interstellar Veteran', 'Complete 5,000 hyperspace jumps', 'zap', s => num(s.totalJumps), 5000),
  milestone('jumps_10000', 'Galaxy Nomad', 'Complete 10,000 hyperspace jumps', 'zap', s => num(s.totalJumps), 10000),

  // ===== SYSTEMS VISITED MILESTONES (6) =====
  milestone('systems_10', 'System Scout', 'Visit 10 unique star systems', 'map', s => num(s.discoveredSystems), 10),
  milestone('systems_50', 'System Surveyor', 'Visit 50 unique star systems', 'map', s => num(s.discoveredSystems), 50),
  milestone('systems_100', 'System Cartographer', 'Visit 100 unique star systems', 'map', s => num(s.discoveredSystems), 100),
  milestone('systems_500', 'Galaxy Mapper', 'Visit 500 unique star systems', 'map', s => num(s.discoveredSystems), 500),
  milestone('systems_1000', 'Galaxy Explorer', 'Visit 1,000 unique star systems', 'map', s => num(s.discoveredSystems), 1000),
  milestone('systems_5000', 'Galaxy Pioneer', 'Visit 5,000 unique star systems', 'map', s => num(s.discoveredSystems), 5000),

  // ===== BODIES SCANNED MILESTONES (6) =====
  milestone('scans_10', 'Body Scanner', 'Scan 10 celestial bodies', 'telescope', s => num(s.scannedBodies), 10),
  milestone('scans_50', 'Detailed Surveyor', 'Scan 50 celestial bodies', 'telescope', s => num(s.scannedBodies), 50),
  milestone('scans_100', 'Stellar Cartographer', 'Scan 100 celestial bodies', 'telescope', s => num(s.scannedBodies), 100),
  milestone('scans_500', 'Deep Space Surveyor', 'Scan 500 celestial bodies', 'telescope', s => num(s.scannedBodies), 500),
  milestone('scans_1000', 'Master Cartographer', 'Scan 1,000 celestial bodies', 'telescope', s => num(s.scannedBodies), 1000),
  milestone('scans_5000', 'Galaxy Archivist', 'Scan 5,000 celestial bodies', 'telescope', s => num(s.scannedBodies), 5000),

  // ===== CREDITS MILESTONES (5) =====
  milestone('credits_1m', 'First Million', 'Accumulate 1,000,000 credits', 'coins', s => s.credits || 0, 1000000),
  milestone('credits_10m', 'Wealthy Commander', 'Accumulate 10,000,000 credits', 'coins', s => s.credits || 0, 10000000),
  milestone('credits_100m', 'Tycoon', 'Accumulate 100,000,000 credits', 'coins', s => s.credits || 0, 100000000),
  milestone('credits_1b', 'Billionaire', 'Accumulate 1,000,000,000 credits', 'coins', s => s.credits || 0, 1000000000),
  milestone('credits_10b', 'Galaxy Magnate', 'Accumulate 10,000,000,000 credits', 'coins', s => s.credits || 0, 10000000000),

  // ===== SHIPS PURCHASED MILESTONES (4) =====
  milestone('ships_1', 'First Vessel', 'Purchase your first ship', 'ship', s => num(s.shipsPurchased), 1),
  milestone('ships_5', 'Fleet Owner', 'Purchase 5 ships', 'ship', s => num(s.shipsPurchased), 5),
  milestone('ships_10', 'Ship Collector', 'Purchase 10 ships', 'ship', s => num(s.shipsPurchased), 10),
  milestone('ships_25', 'Armada Commander', 'Purchase 25 ships', 'ship', s => num(s.shipsPurchased), 25),

  // ===== COLONY MILESTONES (4) =====
  milestone('colonies_1', 'Founder', 'Establish 1 colony', 'rocket', s => num(s.colonies), 1),
  milestone('colonies_3', 'Settler', 'Establish 3 colonies', 'rocket', s => num(s.colonies), 3),
  milestone('colonies_5', 'Colonial Governor', 'Establish 5 colonies', 'rocket', s => num(s.colonies), 5),
  milestone('colonies_10', 'Empire Builder', 'Establish 10 colonies', 'rocket', s => num(s.colonies), 10),

  // ===== CARRIER MILESTONES (3) =====
  milestone('carriers_1', 'Fleet Owner', 'Own 1 fleet carrier', 'anchor', s => num(s.fleetCarriers), 1),
  milestone('carriers_3', 'Admiral', 'Own 3 fleet carriers', 'anchor', s => num(s.fleetCarriers), 3),
  milestone('carriers_5', 'Grand Fleet', 'Own 5 fleet carriers', 'anchor', s => num(s.fleetCarriers), 5),

  // ===== LIGHT YEARS MILESTONES (5) =====
  milestone('ly_1k', 'Long Hauler', 'Travel 1,000 light years', 'route', s => num(s.lightYearsTraveled), 1000),
  milestone('ly_10k', 'Distance Voyager', 'Travel 10,000 light years', 'route', s => num(s.lightYearsTraveled), 10000),
  milestone('ly_100k', 'Galaxy Trekker', 'Travel 100,000 light years', 'route', s => num(s.lightYearsTraveled), 100000),
  milestone('ly_500k', 'Deep Void Explorer', 'Travel 500,000 light years', 'route', s => num(s.lightYearsTraveled), 500000),
  milestone('ly_1m', 'Sagittarius Pioneer', 'Travel 1,000,000 light years', 'route', s => num(s.lightYearsTraveled), 1000000),

  // ===== MAPPING MILESTONES (4) =====
  milestone('mappings_10', 'Surface Mapper', 'Map 10 bodies with probes', 'map', s => num(s.mappedBodies), 10),
  milestone('mappings_50', 'Terrain Surveyor', 'Map 50 bodies with probes', 'map', s => num(s.mappedBodies), 50),
  milestone('mappings_100', 'Planetary Cartographer', 'Map 100 bodies with probes', 'map', s => num(s.mappedBodies), 100),
  milestone('mappings_500', 'Master Mapper', 'Map 500 bodies with probes', 'map', s => num(s.mappedBodies), 500),

  // ===== FSS SCAN MILESTONES (4) =====
  milestone('fss_10', 'Spectrum Scanner', 'Run 10 FSS system scans', 'scan', s => num(s.fssScannedSystems), 10),
  milestone('fss_50', 'System Analyst', 'Run 50 FSS system scans', 'scan', s => num(s.fssScannedSystems), 50),
  milestone('fss_100', 'Deep Space Analyst', 'Run 100 FSS system scans', 'scan', s => num(s.fssScannedSystems), 100),
  milestone('fss_500', 'Master Analyst', 'Run 500 FSS system scans', 'scan', s => num(s.fssScannedSystems), 500),

  // ===== BOOKMARK MILESTONES (4) =====
  milestone('bookmarks_5', 'Waypoint Keeper', 'Bookmark 5 systems', 'bookmark', s => num(s.bookmarkedSystems), 5),
  milestone('bookmarks_10', 'Navigator', 'Bookmark 10 systems', 'bookmark', s => num(s.bookmarkedSystems), 10),
  milestone('bookmarks_25', 'Star Chart Maker', 'Bookmark 25 systems', 'bookmark', s => num(s.bookmarkedSystems), 25),
  milestone('bookmarks_50', 'Master Cartographer', 'Bookmark 50 systems', 'bookmark', s => num(s.bookmarkedSystems), 50),

  // ===== SURFACE DISCOVERY MILESTONES (4) =====
  milestone('surface_5', 'Surface Scout', 'Collect 5 surface discoveries', 'flask', s => num(s.surfaceDiscoveries), 5),
  milestone('surface_10', 'Surface Pioneer', 'Collect 10 surface discoveries', 'flask', s => num(s.surfaceDiscoveries), 10),
  milestone('surface_25', 'Surface Explorer', 'Collect 25 surface discoveries', 'flask', s => num(s.surfaceDiscoveries), 25),
  milestone('surface_50', 'Surface Archivist', 'Collect 50 surface discoveries', 'flask', s => num(s.surfaceDiscoveries), 50),

  // ===== CUSTOM SHIP MILESTONES (3) =====
  milestone('custom_ships_1', 'Ship Designer', 'Design 1 custom ship', 'boxes', s => num(s.customShips), 1),
  milestone('custom_ships_5', 'Shipyard Master', 'Design 5 custom ships', 'boxes', s => num(s.customShips), 5),
  milestone('custom_ships_10', 'Master Shipwright', 'Design 10 custom ships', 'boxes', s => num(s.customShips), 10),

  // ===== NEW FEATURE MILESTONES (9) =====
  { id: 'first_warp_gate', name: 'Gate Builder', desc: 'Constructed your first warp gate', section: 'milestones', icon: 'route' },
  { id: 'first_company', name: 'Entrepreneur', desc: 'Registered your trade company', section: 'milestones', icon: 'briefcase' },
  { id: 'first_custom_carrier', name: 'Carrier Designer', desc: 'Saved a custom carrier design', section: 'milestones', icon: 'anchor' },
  { id: 'first_badge', name: 'Herald', desc: 'Designed and saved your first badge', section: 'milestones', icon: 'palette' },
  { id: 'first_synthesis', name: 'Chemist', desc: 'Performed your first synthesis', section: 'milestones', icon: 'flask' },
  { id: 'first_wingmate', name: 'Squadron Leader', desc: 'Hired your first wingmate', section: 'milestones', icon: 'ship' },
  { id: 'first_station_built', name: 'Station Architect', desc: 'Built your first orbital station', section: 'milestones', icon: 'hammer' },
  { id: 'first_fighter', name: 'Fighter Pilot', desc: 'Constructed your first ship-launched fighter', section: 'milestones', icon: 'rocket' },
  { id: 'first_exobiology', name: 'Xenobiologist', desc: 'Completed your first exobiology analysis', section: 'milestones', icon: 'flask' },

  // ===== CARD DECK MILESTONES (8) =====
  { id: 'deck_drake_voss', name: 'Drake-Voss Deck Complete', desc: 'Collect all 100 Drake-Voss cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_orion_heavy', name: 'Orion Heavy Deck Complete', desc: 'Collect all 100 Orion Heavy cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_sentinel_forge', name: 'Sentinel Forge Deck Complete', desc: 'Collect all 100 Sentinel Forge cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_kepler', name: 'Kepler Aeroworks Deck Complete', desc: 'Collect all 100 Kepler Aeroworks cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_meridian', name: 'Meridian Luxe Deck Complete', desc: 'Collect all 100 Meridian Luxe cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_solaris', name: 'Solaris Dynasty Deck Complete', desc: 'Collect all 100 Solaris Dynasty cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_proxima', name: 'Proxima Corp Deck Complete', desc: 'Collect all 100 Proxima Corp cards', section: 'milestones', icon: 'cards' },
  { id: 'deck_omega', name: 'Omega Corp Deck Complete', desc: 'Collect all 100 Omega Corp cards', section: 'milestones', icon: 'cards' },

  // ===== LIFETIME EARNINGS MILESTONES (4) =====
  milestone('earnings_1m', 'First Million Earned', 'Earn 1,000,000 credits total', 'coins', s => num(s.lifetimeEarnings), 1000000),
  milestone('earnings_100m', 'Hundred Million Club', 'Earn 100,000,000 credits total', 'coins', s => num(s.lifetimeEarnings), 100000000),
  milestone('earnings_1b', 'Billionaire Trader', 'Earn 1,000,000,000 credits total', 'coins', s => num(s.lifetimeEarnings), 1000000000),
  milestone('earnings_10b', 'Galaxy Tycoon', 'Earn 10,000,000,000 credits total', 'coins', s => num(s.lifetimeEarnings), 10000000000),
];

export const ACHIEVEMENT_SECTIONS = [
  { id: 'firstDiscoveries', label: 'First Discoveries' },
  { id: 'milestones', label: 'Milestones' },
];