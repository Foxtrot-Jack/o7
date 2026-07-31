// Codex — detailed tutorial/reference for every game mechanic
import React, { useState, useMemo } from 'react';
import { BookOpen, Search } from 'lucide-react';

const CODEX = [
  {
    category: 'Getting Started',
    icon: '🚀',
    entries: [
      {
        title: 'Commander vs Sandbox Save',
        body: `Two save slots are available from the main menu:

• COMMANDER — Standard play. You start with 100,000 credits and a Sidewinder Mk-I. All ships, parts, and features must be earned or purchased. Lifetime statistics (light years traveled, earnings, ships purchased) are tracked for your profile.

• SANDBOX — Unrestricted mode. You start with 1 billion credits and an Anaconda. All ship parts are unlocked, purchases are free, and carrier jumps cost no tritium. Ideal for experimentation.

Switch saves anytime from the Settings screen. Each slot persists independently in your browser's local storage.`,
      },
      {
        title: 'Navigation Bar',
        body: `The top navigation bar provides access to every screen from anywhere. On mobile, swipe horizontally to scroll through all options. Some screens (Station, Market) are only accessible when docked at a station — they appear greyed out until you dock.

The bottom status bar shows your current ship name, total jumps, and galaxy scale.`,
      },
      {
        title: 'Status Header',
        body: `The persistent header displays:

• CREDITS — Your current balance, abbreviated (K/M/B) for large amounts.
• LOCATION — Current system name and whether you're in open space, docked, or on a surface.
• SECURITY — System security level (High/Medium/Low/Anarchy), color-coded.
• FUEL — Current fuel as a percentage of capacity. Watch this before long jumps.
• CARGO — Tons used vs capacity.
• RANK — Your exploration rank and progress bar toward the next rank.`,
      },
    ],
  },
  {
    category: 'Galaxy Map',
    icon: '🗺️',
    entries: [
      {
        title: 'Navigating the 3D Galaxy',
        body: `The galaxy map renders thousands of procedurally generated stars in a full 3D space.

CONTROLS:
• DRAG (one finger / mouse) — Rotate the view around the center.
• PINCH (two fingers) or SCROLL WHEEL — Zoom in and out.
• TWO-FINGER PAN — Move the camera target laterally. The star field follows your fingers.
• TAP a star — Select it for jump plotting.

The galaxy contains over 4 billion systems. Stars are color-coded by spectral class (O, B, A, F, G, K, M, Neutron Star, Black Hole).`,
      },
      {
        title: 'View Modes',
        body: `Three quick-view buttons are available:

• GALAXY VIEW — Zooms out to 30,000 units to show the full spiral arm structure.
• ⊕ CENTER — Resets the camera to center on your current system and resets panning.
• LOCAL VIEW — Zooms to a comfortable 120-unit range for browsing nearby stars.

The background galaxy overlay (spiral cloud) has its own brightness slider.`,
      },
      {
        title: 'Star Selection & Jumping',
        body: `When you tap a star, a selection panel appears showing:

• Star name and spectral class
• Distance in light years
• Security level
• Fuel cost for the jump
• Population (if inhabited)

Each light year costs 0.5 tons of fuel. If you lack sufficient fuel, the JUMP button is disabled. You can bookmark the star for later, or engage your Frame Shift Drive (FSD) to jump.

Visited systems turn green on the map. Your current position is marked by a pulsing green diamond.`,
      },
      {
        title: 'Filters',
        body: `The FILTERS panel lets you narrow visible stars:

• STAR TYPE — Filter by spectral class (O, A, G, K, M, NS, BH).
• SECURITY — High, Medium, Low, or Anarchy.
• POPULATION — Uninhabited, Low, Medium, or High.

Stars that don't match your filter are dimmed but still visible. Use filters to find trade targets, exploration candidates, or specific star types.`,
      },
      {
        title: 'Bookmarks',
        body: `Tap the ★ button to view your bookmarked systems. You can bookmark any selected star to save it for future reference. Bookmarks persist across sessions.

From the bookmarks panel you can SELECT a bookmark to target it for jumping, or remove it with ✕.`,
      },
      {
        title: 'Flight Trail',
        body: `Toggle the FLIGHT TRAIL to see a green line connecting the last 50 systems you've visited. This visual history helps you retrace exploration paths.

The trail brightness is adjustable via the slider in the filter panel.`,
      },
      {
        title: 'Brightness Sliders',
        body: `Three independent brightness sliders control visual elements:

• STAR BRIGHTNESS — Controls the opacity of all star points (10%–200%).
• TRAIL BRIGHTNESS — Controls the flight log trail opacity (0%–200%).
• GALAXY OVERLAY — Controls the background spiral cloud opacity (0%–200%).

These adjust in real-time without regenerating the 3D scene.`,
      },
      {
        title: 'Special Markers',
        body: `Additional markers appear on the map:

• CYAN dots — Systems where you have parked ships.
• PURPLE dots — Systems where you have established colonies.

Toggle these on/off from the filter panel using the ⚓ SHIPS and ★ COLONIES buttons.`,
      },
    ],
  },
  {
    category: 'System View',
    icon: '🪐',
    entries: [
      {
        title: 'The Orrery',
        body: `After jumping to a system, the Orrery displays all celestial bodies in orbit around the primary star(s). Bodies include stars, planets, moons, and asteroid belts.

CONTROLS:
• DRAG — Rotate the orbital plane.
• PINCH / SCROLL — Zoom in and out.
• TAP a body — Select it to view details and available actions.

Orbital bodies move in real-time. Wireframe models represent each body type distinctly.`,
      },
      {
        title: 'Stations',
        body: `Every generated system contains at least one station, shown as an orbiting wireframe model. Tap a station to see its details, then DOCK to access station services (Market, Shipyard, Outfitting, Refuel, Repair).

You must be docked to access the Station and Market screens from the nav bar.`,
      },
      {
        title: 'Scanning Bodies',
        body: `Select any planet or star to scan it. Scanning reveals:

• Body type and classification (e.g., Earth-like, Water World, Ammonia World)
• Physical properties
• Scan value in credits (paid when you sell exploration data)

Scanned bodies count toward achievements and first-discovery records. Rare body types (Earth-like, Ammonia, Neutron Stars, Black Holes) unlock special achievements.`,
      },
      {
        title: 'Landing on Surfaces',
        body: `Landable bodies (rocky/icy planets and moons) can be landed on for surface surveying. Select a landable body and choose LAND to descend to the surface.

While on the surface you can deploy probes to discover biological, geological, and mineral signals. Use DEPART to return to orbit.`,
      },
    ],
  },
  {
    category: 'Exploration',
    icon: '🔭',
    entries: [
      {
        title: 'FSS System Scan',
        body: `The Full Spectrum Scanner (FSS) reveals all bodies in the current system at once. Perform an FSS scan from the Exploration screen to populate the system map with every planet, moon, and signal.

FSS scanning is tracked as an achievement milestone on first use.`,
      },
      {
        title: 'Detailed Body Scans',
        body: `After FSS reveals bodies, you can perform detailed scans on individual bodies from the Orrery. Detailed scans determine the body's exact value and properties.

Scanned body data accumulates in your cartography cache until sold.`,
      },
      {
        title: 'Surface Mapping',
        body: `Map a body with surface probes to increase its scan value and reveal surface signals. Mapping is required to discover biological and geological sites.

First mapping unlocks an achievement milestone.`,
      },
      {
        title: 'Selling Exploration Data',
        body: `Exploration data must be sold at a station to earn credits. Visit the Exploration screen while docked and tap SELL DATA.

Your payout includes:
• Individual body scan values
• First-discovered system bonuses (5,000 + 500 per body)
• Surface discovery values

Selling data also advances your Exploration rank (Aimless → Scout → Trailblazer → ... → Elite V).`,
      },
      {
        title: 'Exploration Ranks',
        body: `Exploration rank progresses from Aimless through 14 tiers to Elite V. Rank advances based on total credits earned from selling exploration data.

RANKS: Aimless → Mostly Aimless → Scout → Surveyor → Trailblazer → Pathfinder → Ranger → Pioneer → Elite → Elite I-V`,
      },
    ],
  },
  {
    category: 'Station Services',
    icon: '🏛️',
    entries: [
      {
        title: 'Docking',
        body: `To dock at a station, select it in the Orrery and choose DOCK. Once docked, the Station and Market screens become available in the navigation bar.

Docking is required for: buying/selling commodities, purchasing ships, outfitting, refueling, repairing, and selling exploration data.`,
      },
      {
        title: 'Refueling',
        body: `Refuel at any station from the Station screen. Fuel cost is proportional to the amount needed. Your fuel capacity depends on your ship type and installed modules.

Fuel is consumed at 0.5 tons per light year jumped. Plan your routes to avoid running dry!`,
      },
      {
        title: 'Repair',
        body: `Repair services are available at most stations. Repair restores your ship to full condition.`,
      },
      {
        title: 'Outfitting',
        body: `The Outfitting screen lets you install and upgrade modules on your ship. Available modules depend on the system's population and economy type.

Outfitting levels range from Basic (level 1) to Elite (level 5). Higher-tech economies and larger populations offer better modules and engineering options.`,
      },
    ],
  },
  {
    category: 'Trading & Market',
    icon: '🏪',
    entries: [
      {
        title: 'Buying & Selling Commodities',
        body: `The Market screen (available when docked) lists all commodities available at the current station. Prices fluctuate based on the station's economy type.

Each commodity has a base price modified by supply and demand. Buy low in producing economies and sell high in consuming economies for maximum profit.

Your cargo capacity limits how much you can carry at once.`,
      },
      {
        title: 'Economy Types',
        body: `Stations have different economy types that determine what they produce and consume:

• EXTRACTION — Produces minerals and raw materials.
• INDUSTRIAL — Produces manufactured goods, consumes raw materials.
• REFINERY — Produces metals, consumes minerals.
• HIGH TECH — Produces technology, consumes industrial goods.
• AGRICULTURE — Produces food, consumes machinery.
• TOURISM — Consumes luxury goods.

Matching buy/sell economies maximizes profit margins.`,
      },
      {
        title: 'Trade Routes (Inara-style)',
        body: `The Trade Tools screen includes a Trade Routes finder that scans nearby systems for profitable buy/sell opportunities.

• Set a search radius (up to 2,000 LY).
• Filter by commodity category.
• The tool ranks routes by profit-per-light-year efficiency.
• A progress bar shows scanning status.

Results show the best commodity, buy system, sell system, and expected profit.`,
      },
      {
        title: 'Route Plotter (Spansh-style)',
        body: `The Route Plotter calculates multi-jump routes to distant destinations, including neutron star highway support.

• Enter a destination system name.
• The plotter searches expanding radii to find the target.
• Routes are calculated using a greedy algorithm within your jump range.
• Neutron star boosts can supercharge your FSD for 4x jump range.

Each jump segment shows fuel cost and whether it uses a neutron boost.`,
      },
    ],
  },
  {
    category: 'Ship Management',
    icon: '📦',
    entries: [
      {
        title: 'Ship Overview',
        body: `The Ship screen provides a dashboard with tabs for Overview, Cargo, Shipyard, Navigation, and Outfitting.

Overview shows your ship's type, manufacturer, class, fuel level, jump range, and cargo capacity. Monitor these stats before embarking on long journeys.`,
      },
      {
        title: 'Cargo Management',
        body: `The Cargo tab displays all commodities currently in your hold. You can jettison cargo to free up space (cargo is lost with no refund).

Cargo capacity is determined by your ship type and installed cargo racks. The MK2 5E cargo rack logic provides expanded storage for compatible ships.`,
      },
      {
        title: 'Buying New Ships',
        body: `The Shipyard tab (available when docked) lists ships available for purchase at the current station. Available ships depend on system population:

• Small population — Sidewinder, Eagle, Hauler, Adder
• Medium population — Cobra, Viper, Type-6, Diamondback
• Large population — Asp, Python, Krait, Anaconda
• Huge population — Federal Corvette, Imperial Cutter, Type-10

When you buy a new ship, your current ship is stored at that station. You can retrieve it later by returning and switching.`,
      },
      {
        title: 'Fleet Management',
        body: `The Fleet screen shows all ships you own. You can:

• SWITCH — Activate a stored ship if it's at your current station.
• TRANSFER — Move a stored ship to your current station for a fee (1% of ship value + 10,000 credits).
• RENAME — Give any ship a custom name.

Ships stored at fleet carriers can be accessed from any system where the carrier is present.`,
      },
    ],
  },
  {
    category: 'Fleet Carriers',
    icon: '⚓',
    entries: [
      {
        title: 'Purchasing a Carrier',
        body: `Fleet Carriers cost 5 billion credits and can only be purchased at systems with population above 1 billion. You can own up to 5 carriers.

Carriers serve as mobile bases — they can store ships, hold a bank balance, and offer services (market, shipyard, outfitting, refuel, repair) which you can toggle on/off.`,
      },
      {
        title: 'Carrier Jumps',
        body: `Carriers jump using TRITIUM fuel, consuming approximately 1 ton per 10 light years. Jump your carrier to any system from the Carriers screen.

In Sandbox mode, carrier jumps are free (no tritium consumed).`,
      },
      {
        title: 'Decommissioning',
        body: `You can decommission a carrier at any time for a 75% refund (3.75 billion credits). Any ships stored on the carrier are relocated to the carrier's last system.

Decommissioning is permanent — the carrier and its bank balance are removed.`,
      },
      {
        title: 'Carrier Services',
        body: `Each carrier can toggle these services:
• MARKET — Buy/sell commodities at carrier.
• SHIPYARD — Purchase ships at carrier.
• OUTFITTING — Install modules at carrier.
• REFUEL — Always on by default.
• REPAIR — Always on by default.`,
      },
    ],
  },
  {
    category: 'Missions',
    icon: '📋',
    entries: [
      {
        title: 'Mission Types',
        body: `Stations offer various mission types:

• DELIVERY — Transport cargo to another station.
• COURIER — Deliver a message/data package.
• MINING — Extract specific minerals from rings/surfaces.
• PASSENGER — Transport passengers.
• SALVAGE — Recover materials from debris.
• EXPLORATION — Scan specific systems or bodies.
• COLONIZATION SUPPLY — Deliver materials to a colony.

Missions reward credits and advance your Trade rank.`,
      },
      {
        title: 'Completing Missions',
        body: `Active missions appear in the Missions screen. Complete the objective (deliver cargo, reach a system, etc.) then return to claim your reward.

Mission rewards count toward your lifetime earnings and Trade rank progression.`,
      },
    ],
  },
  {
    category: 'Mining',
    icon: '⛏️',
    entries: [
      {
        title: 'Extracting Resources',
        body: `Mine asteroids in rings or minerals on planetary surfaces. The Mining screen lets you extract raw materials which collect in your refinery.

Asteroid belts appear in the Orrery as orbiting clusters of wireframe rocks.`,
      },
      {
        title: 'Refinery',
        body: `Mined materials collect in your refinery (default capacity: 4 slots). The refinery processes raw fragments into usable materials.

Processed materials move to your Ship Locker for use in synthesis, engineering, or colony delivery.`,
      },
      {
        title: 'Ship Locker',
        body: `The Ship Locker stores all raw and manufactured materials. Materials are used for:
• Engineering module upgrades
• Synthesis (ammo, limpets, etc.)
• Colony infrastructure delivery

Materials do not count against your cargo capacity.`,
      },
    ],
  },
  {
    category: 'Colonization',
    icon: '🪐',
    entries: [
      {
        title: 'Establishing Colonies',
        body: `Colonize landable bodies to create settlements. Colonies generate resources over time and can be developed through infrastructure investment.

Each colony tracks population, happiness, and infrastructure level. Delivering commodities boosts these metrics.`,
      },
      {
        title: 'Colony Growth',
        body: `Colonies progress through development stages as you deliver resources and invest. Higher-stage colonies produce more valuable outputs and can support more advanced facilities.

Colony types vary based on the host body's environment (rocky, icy, terraformed, etc.).`,
      },
      {
        title: 'Colony Commodity Delivery',
        body: `Deliver specific commodities to colonies to boost happiness and infrastructure. Different commodity categories have varying impact:

• Technology and raw materials have the highest boost.
• Industrial goods provide strong infrastructure gains.
• Metals and chemicals provide moderate boosts.

Deliver from the Colonization screen while carrying compatible cargo.`,
      },
    ],
  },
  {
    category: 'Ship Yard (Custom Ships)',
    icon: '🔨',
    entries: [
      {
        title: 'Building the Shipyard',
        body: `Before building custom ships in normal mode, you must construct a Space Shipyard. Requirements:

• 3 or more established colonies
• 100,000,000 credits

In Sandbox mode, the shipyard is available immediately with maximum infrastructure.

The shipyard is built at your current system and persists there.`,
      },
      {
        title: 'Shipyard Infrastructure',
        body: `The Shipyard tab shows your shipyard's level and infrastructure percentage. Deliver industrial materials to increase infrastructure:

• TECHNOLOGY goods: +5 infra per 10T
• INDUSTRIAL goods: +4 infra per 10T
• RAW materials: +6 infra per 10T
• METALS: +3 infra per 10T
• CHEMICALS: +3 infra per 10T
• MINERALS: +2 infra per 10T

Levels range from 0 (0%) to 5 (100%). Higher levels unlock more ship parts for building.`,
      },
      {
        title: 'The Ship Builder',
        body: `The Builder tab is a 3D procedural ship designer with snappable low-poly parts.

MOUNT SLOTS — Select a slot (nose, hull, wings, engines, etc.) to attach parts.
PART SELECTOR — Choose from available parts (unlocked based on shipyard level).
Each part contributes to your ship's final statistics (cargo, fuel, jump range, cost).`,
      },
      {
        title: 'Part Customization',
        body: `Each mounted part can be customized with three sets of controls:

• RESIZE (X/Y/Z) — Scale the part independently on each axis (0.2x–3.0x).
• MOVE (X/Y/Z) — Reposition the part within its slot (-3.0 to +3.0).
• ROTATE (X/Y/Z) — Rotate the part on each axis (-180° to +180°).

All controls are visible simultaneously in a three-column grid for efficient editing.`,
      },
      {
        title: 'Saving Blueprints',
        body: `Save your custom ship designs as blueprints from either the Builder tab or the Shipyard tab.

Enter a blueprint name and tap SAVE DESIGN or SAVE BLUEPRINT. Saved designs appear in the Saved tab where you can:
• EDIT — Load the design back into the builder.
• ACTIVATE — Set the design as your active ship (requires docking).
• DELETE — Remove the blueprint permanently.

In Sandbox mode, all parts are unlocked regardless of shipyard level.`,
      },
    ],
  },
  {
    category: 'Outfitting & Engineering',
    icon: '🔧',
    entries: [
      {
        title: 'Module Installation',
        body: `The Outfitting screen lets you install and swap modules on your ship. Module categories include:

• Core modules (power plant, thrusters, FSD, sensors, life support)
• Optional internal (cargo racks, fuel scoops, shield generators, etc.)
• Utility mounts (shield boosters, scanners, chaff, etc.)
• Hardpoints (weapons)

Available modules depend on the station's outfitting level (1–5), determined by system population and economy.`,
      },
      {
        title: 'Engineering',
        body: `Higher outfitting levels unlock engineering modifications that enhance module performance beyond stock specifications.

Engineering tiers:
• Level 1 (Basic) — No engineering available.
• Level 2 (Standard) — Basic engineering.
• Level 3 (Advanced) — Standard engineering.
• Level 4 (Premium) — Advanced engineering.
• Level 5 (Elite) — Experimental engineering.

Engineering follows Elite Dangerous standards for module modification.`,
      },
      {
        title: 'Computing Ship Stats',
        body: `Your ship's final statistics (cargo capacity, fuel capacity, jump range) are computed from your ship type plus all installed modules. The Ship Overview and Builder tabs display live stats as you make changes.

Installing larger cargo racks increases capacity but may reduce jump range due to added mass. Balance your loadout for your intended activity.`,
      },
    ],
  },
  {
    category: 'Surface Survey',
    icon: '📍',
    entries: [
      {
        title: 'Landing & Probes',
        body: `Land on a rocky or icy body to begin surface surveying. From the surface, deploy probes to scan for signals.

Surface signals fall into three categories:
• BIOLOGICAL — Organic life forms (bacteria, fungi, flora).
• GEOLOGICAL — Mineral formations and geological features.
• MINERAL — Raw material deposits.

First discovery of a signal type unlocks an achievement.`,
      },
      {
        title: 'Collecting Discoveries',
        body: `Each surface signal you scan is collected as a discovery with a credit value. Discoveries accumulate until sold with your exploration data.

Rare signal types contribute to first-discovery achievements and can be quite valuable.`,
      },
    ],
  },
  {
    category: 'Achievements',
    icon: '🏆',
    entries: [
      {
        title: 'Achievement System',
        body: `The Awards screen tracks 130+ achievements across multiple categories:

• FIRST DISCOVERIES — First time scanning each body type (Earth-like, Ammonia, Neutron Star, Black Hole, etc.).
• MILESTONES — Key gameplay firsts (first jump, first scan, first colony, first shipyard, first bookmark, etc.).
• EXPLORATION STATS — Systems scanned, total bodies scanned, total distance traveled.

Achievements persist with your save and provide long-term progression goals.`,
      },
      {
        title: 'Commander Profile',
        body: `The Profile screen displays your commander's lifetime statistics:

• Total jumps
• Light years traveled
• Lifetime earnings
• Ships purchased
• Current ranks (Exploration, Trade, Mining)
• Active colonies and fleet carriers

These stats are tracked in Commander mode. Sandbox mode starts with elevated stats but tracks progress from there.`,
      },
    ],
  },
  {
    category: 'Settings & Display',
    icon: '⚙️',
    entries: [
      {
        title: 'CRT Visual Effects',
        body: `Toggle the retro CRT overlay for an authentic 90s terminal aesthetic. When enabled, the interface displays:

• Scanlines — Horizontal lines simulating a CRT monitor.
• Glow — Text and elements have a subtle phosphor glow.
• Flicker — Slight periodic brightness variation.
• Vignette — Darkened screen edges.

All game text uses a monospace font with orange phosphor glow when CRT is active.`,
      },
      {
        title: 'Color Themes',
        body: `Choose from multiple CRT color themes:

• ELITE — Classic burnt-orange on black.
• MATRIX — Green on black.
• AMBER — Warm amber on black.
• And other presets.

Themes apply a hue-rotate filter to the entire interface for instant visual changes.`,
      },
      {
        title: 'Text Brightness',
        body: `Adjust the text brightness slider (10%–200%) to control the intensity of all on-screen text. Useful for different lighting conditions or display types.`,
      },
      {
        title: 'Mini Screen Mode',
        body: `Enable Mini Screen mode for compact display on small external screens (optimized for the Moto Razr 50 external display). Reduces font sizes and spacing for maximum information density.`,
      },
      {
        title: 'Save Management',
        body: `From Settings you can:

• SWITCH SAVE — Return to the save selection screen to switch between Commander and Sandbox.
• RESET — Permanently delete your current save and start fresh. Requires confirmation.

Saves are stored locally in your browser. Clearing browser data will erase all progress.`,
      },
    ],
  },
];

export default function Codex() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeEntry, setActiveEntry] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CODEX;
    const q = search.toLowerCase();
    return CODEX.map(cat => ({
      ...cat,
      entries: cat.entries.filter(e =>
        e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.entries.length > 0);
  }, [search]);

  const currentCategory = filtered[activeCategory] || filtered[0];
  const currentEntry = currentCategory?.entries[activeEntry] || currentCategory?.entries[0];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Search bar */}
      <div className="border-b border-orange-900/50 p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-orange-700 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory(0); setActiveEntry(0); }}
          placeholder="Search the codex..."
          className="flex-1 bg-transparent text-orange-300 text-xs outline-none placeholder-orange-800"
        />
        <BookOpen className="w-4 h-4 text-orange-600 flex-shrink-0" />
        <span className="text-orange-700 text-[10px] uppercase hidden sm:inline">Codex</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Category sidebar */}
        <div className="w-32 sm:w-44 flex-shrink-0 border-r border-orange-900/50 overflow-y-auto">
          {filtered.map((cat, ci) => (
            <button
              key={cat.category}
              onClick={() => { setActiveCategory(ci); setActiveEntry(0); }}
              className={`w-full text-left px-2 py-2 border-b border-orange-950/50 text-[10px] sm:text-xs transition-all ${
                activeCategory === ci ? 'bg-orange-950/40 text-orange-300 border-l-2 border-l-orange-500' : 'text-orange-700 hover:text-orange-500'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.category}</span>
              <span className="sm:hidden">{cat.category.slice(0, 6)}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-orange-800 text-[10px] text-center">No results.</div>
          )}
        </div>

        {/* Entry list */}
        <div className="w-40 sm:w-56 flex-shrink-0 border-r border-orange-900/50 overflow-y-auto">
          {currentCategory?.entries.map((entry, ei) => (
            <button
              key={entry.title}
              onClick={() => setActiveEntry(ei)}
              className={`w-full text-left px-2 py-2 border-b border-orange-950/50 text-[10px] sm:text-xs transition-all ${
                activeEntry === ei ? 'bg-orange-950/30 text-orange-300' : 'text-orange-600 hover:text-orange-400'
              }`}
            >
              {entry.title}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentEntry ? (
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{currentCategory?.icon}</span>
                <h2 className="text-orange-300 font-bold text-sm sm:text-base uppercase">{currentEntry.title}</h2>
              </div>
              <div className="text-orange-700 text-[10px] uppercase mb-3 border-b border-orange-900/50 pb-1">
                {currentCategory?.category}
              </div>
              <div className="text-orange-500/90 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {currentEntry.body}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-orange-800 text-xs">
              Select a topic to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}