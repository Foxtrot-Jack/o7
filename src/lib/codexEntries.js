// Codex — in-game knowledge base for players.
// Organized like the Elite Dangerous Codex: a player information zone covering
// game mechanics, lore, and how-to. NOT a dev tool, feature list, or changelog.
import { TUTORIAL_CATEGORIES } from './tutorialSteps';
import { CONTRIBUTORS, getCreditLine, getContributorCount } from './contributors';

const CODEX = [
  // ============================================================
  // COMMANDER'S MANUAL — how to play
  // ============================================================
  {
    category: "Commander's Manual",
    icon: '📖',
    entries: [
      {
        title: 'Quick Start',
        body: `New commander? Follow this loop to get flying in minutes:

1. SAVE — Pick Commander (standard) or Sandbox (unrestricted) from the main menu.
2. DOCK — You start docked at a station. Open Station Services to refuel.
3. TRADE — Open the Market. Buy low, sell high across economy types.
4. MISSIONS — Accept a delivery or courier mission. Destination systems are marked on the galaxy map.
5. JUMP — Open the Galaxy Map, tap a nearby star, and engage your FSD. Fuel costs 0.5 T per light year.
6. EXPLORE — On arrival, run an FSS scan to discover bodies, then scan valuable ones and sell the data at Cartographics.
7. UPGRADE — Earn credits, buy a bigger ship, outfit it, and eventually purchase a fleet carrier.

The bottom status bar tracks your ship, jumps, and lets you SAVE at any time.`,
      },
      {
        title: 'Commander vs Sandbox Save',
        body: `Two save slots are available from the main menu:

• COMMANDER — Standard play. You start with 100,000 credits and a Sparrowhawk Mk-I. All ships, parts, and features must be earned or purchased. Lifetime statistics are tracked for your profile.

• SANDBOX — Unrestricted mode. You start with 1 billion credits and a Roc. All ship parts are unlocked, purchases are free, carrier jumps cost no tritium, and you can teleport to any searched system instantly. Ideal for experimentation.

Switch saves anytime from the Settings screen. Each slot persists independently.`,
      },
      {
        title: 'Navigation Bar',
        body: `The top navigation bar groups every screen into six dropdown menus: INTERNAL, EXTERNAL, CONS, ROLE, MISC, and SETTINGS. On narrow screens, group labels are replaced by icons to prevent overflow — tap an icon to open its dropdown.

Some screens (Station Services, Market, Outfitting) are only accessible when docked at a station — their group appears greyed out with a lock icon until you dock.

The bottom status bar shows your current ship name, total jumps, and galaxy scale.`,
      },
      {
        title: 'Status Header',
        body: `The persistent header displays:

• CREDITS — Your current balance, abbreviated (K/M/B) for large amounts.
• SYSTEM — Current system name.
• LOCATION — Docked, In Supercruise, or On Surface.
• SECURITY — System security level (High/Medium/Low/Anarchy), color-coded.
• FUEL — Current fuel as a percentage of capacity. Watch this before long jumps.
• CARGO — Tons used vs capacity.
• RANK — Your exploration rank and progress bar toward the next rank.`,
      },
      {
        title: 'No Dead Ends',
        body: `Every screen in o7 is reachable from every other screen via the navigation bar. You will never get stuck in a sub-menu with no way back. If a screen requires docking (Station, Market, Outfitting), simply navigate to the System view, dock at a station, and those options unlock.`,
      },
      {
        title: 'Controls & Keybindings',
        body: `o7 supports keyboard, mouse, touch, and gamepad navigation.

MOUSE / TOUCH:
• Drag to rotate 3D views (galaxy map, orrery). Pinch or scroll to zoom. Two-finger pan to move the camera.
• Tap bodies, stars, and stations to select them. Tap buttons to confirm actions.

KEYBOARD (default bindings, all rebindable):
• ARROWS / WASD — Move focus between on-screen controls.
• ENTER / SPACE — Activate the focused control.
• ESC / BACKSPACE — Go back.
• G — Galaxy Map · Q — System View · F — FSS Scanner · H — Station Services
• M — Market · O — Outfitting · J — Missions · I — Mining · P — Ship
• C — Codex · N — StarNet News · V — Fleet Carriers · L — Carrier Logistics · B — Carrier Command

GAMEPAD:
• D-pad / left stick — Navigate focus. A / Cross — Select. B / Circle — Back. Shoulder buttons cycle groups.

REBINDING: Open Settings > Controller Config to rebind any key or gamepad button. Each action supports multiple bindings. The focus system enables full controller play without a mouse.`,
      },
      {
        title: 'Display & Accessibility',
        body: `Settings are organized into eight tabs: Display, Color, Mono, Type, Audio, Controls, Data, and Support.

• DISPLAY — CRT effects, fullscreen, display scale, UI element sizing, screen orientation lock, mini-screen mode for compact external displays.
• COLOR — 8 color themes + a custom RGB override.
• MONO — Grayscale mode with per-category color re-introduction (stars, planets, ships, stations, UI accent).
• TYPE — Font family, global font size, independent navigation & menu text color (RGB).
• AUDIO — Master toggle, SFX/music volumes, 6 music presets, per-screen track customization.
• CONTROLS — Gesture sensitivity, display filters (invert, hue, saturation, contrast, flips).
• DATA — Switch save, export/import save file, reset progress.
• SUPPORT — Donations and contributor credits.

Text brightness scales up to 600% for a high-contrast glow. Every font is resizable independently.

Appearance, display, audio, and control preferences are saved globally — they persist across Commander and Sandbox slots and survive preview reloads, so your chosen theme and layout apply no matter which save you load.`,
      },
    ],
  },

  // ============================================================
  // THE GALAXY — navigation and landmarks
  // ============================================================
  {
    category: 'The Galaxy',
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
        body: `When you tap a star, a selection panel appears showing the star name, spectral class, distance in light years, security level, fuel cost, and population.

Each light year costs 0.5 tons of fuel. Jumping from a neutron star supercharges your FSD and halves fuel cost to 0.25 T/LY. If you lack sufficient fuel, the JUMP button is disabled. You can bookmark the star for later, or engage your Frame Shift Drive (FSD) to jump.

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

From the bookmarks panel you can SELECT a bookmark to target it for jumping, or remove it with ✕. Bookmarked systems also appear as quick-select buttons in the Route Plotter's Known Locations panel.`,
      },
      {
        title: 'Flight Trail',
        body: `Toggle the FLIGHT TRAIL to see a green line connecting the last 50 systems you've visited. This visual history helps you retrace exploration paths. The trail brightness is adjustable via the slider in the filter panel.`,
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
      {
        title: 'The Core Worlds (The Bubble)',
        body: `The starting area of o7 is a populated region of space called The Core Worlds, centered on your starting system (Deciat Reach). Within approximately 200 light years of the start, the vast majority of star systems are inhabited with populations ranging from 100,000 to 20 billion.

This is your "bubble" — a safe, civilized region where you'll find stations, markets, missions, and trade opportunities on nearly every jump. It's the ideal place to build your credits, rank, and fleet before venturing into the deeper galaxy.

Population density is highest at the center of the bubble and fades toward the edges. Beyond the bubble's radius, inhabited systems become rare — most stars you encounter will be uninhabited frontier space.`,
      },
      {
        title: "Cradle's End (Coreward Hub)",
        body: `Approximately 6,300 light years coreward from the starting bubble lies Cradle's End — a populated hub system near the galactic core. It is the centerpiece of a smaller civilized region called The Coreward Reach, a 100-light-year bubble of inhabited systems centered on Cradle's End.

Cradle's End serves as a staging point for deep-core exploration. If you're heading toward the galactic center to scan neutron stars, black holes, and rare stellar phenomena, Cradle's End is your last chance to refuel, repair, and resupply before venturing into the densely packed core.

Cradle's End appears as a gold landmark marker on the Galaxy Map and is always available as a quick-select destination in the Route Plotter.`,
      },
      {
        title: "Vagrant's Horizon (The Rim Outpost)",
        body: `At the extreme opposite end of the galaxy from the starting bubble — over 25,000 light years away — lies Vagrant's Horizon, the furthest inhabited outpost from civilized space. This lonely red-dwarf system has a small population of 750,000 and a single station, making it the most remote trading post in known space.

Reaching Vagrant's Horizon is an endurance challenge requiring careful fuel management, neutron star highway routing, and dozens of jumps. There are no populated systems along most of the route — you'll be crossing vast stretches of uninhabited frontier space.

Vagrant's Horizon appears as a gold landmark marker on the Galaxy Map and is always available as a quick-select destination in the Route Plotter. In Sandbox mode, you can teleport directly.`,
      },
      {
        title: 'Landmark Markers',
        body: `Major galactic landmarks — Sol, Cradle's End, and Vagrant's Horizon — appear as large gold markers on the Galaxy Map when within view range. These markers help you navigate toward significant destinations.

Landmarks are always available as quick-select buttons in the Route Plotter under Known Locations, regardless of your save mode. Sol additionally requires Sandbox mode or discovery via search.`,
      },
    ],
  },

  // ============================================================
  // SYSTEM NAVIGATION — the orrery
  // ============================================================
  {
    category: 'System Navigation',
    icon: '🪐',
    entries: [
      {
        title: 'The Orrery',
        body: `After jumping to a system, the Orrery displays all celestial bodies in orbit around the primary star(s). Bodies include stars, planets, moons, and asteroid belts.

CONTROLS:
• DRAG — Rotate the orbital plane.
• PINCH / SCROLL — Zoom in and out.
• TAP a body — Select it to view details and available actions.
• TAP a station — View station details and request docking.

Orbital bodies move in real-time. Wireframe models represent each body type distinctly. Stations appear as wireframe models orbiting their parent planet or sitting on its surface.`,
      },
      {
        title: 'Player Ship Model',
        body: `Your current ship is rendered as a 3D wireframe model in the Orrery, scaled to its ship class. The model shape reflects your ship's archetype (small fighter, medium multipurpose, large transport, etc.).

When docked at a station, your ship orbits the station's parent body. When returning from a surface landing, your ship returns to orbit around the body you departed from.`,
      },
      {
        title: 'Ship Travel & Docking',
        body: `Travel between bodies and stations is animated in real-time:

• Select a station and tap DOCK (or TRAVEL & DOCK) — Your ship flies to the station and docks automatically.
• Select a body and tap TRAVEL TO BODY — Your ship flies to the body and enters orbit.

A progress bar shows transit percentage. When travel completes, you either dock (stations) or enter orbit (bodies). Travel speed depends on your ship class — smaller ships are faster.

You cannot initiate new travel while a transit is in progress.`,
      },
      {
        title: 'Stations',
        body: `Populated systems (population > 0) are guaranteed to have at least one station, shown as an orbiting wireframe model. Tap a station to see its details, then DOCK to access station services (Market, Shipyard, Outfitting, Refuel, Repair).

Uninhabited systems (population 0) may have zero stations — these are frontier systems awaiting colonization. If you jump to an uninhabited system with no station, you cannot dock, refuel, or trade there. Plan your fuel accordingly, or colonize a landable body to begin settlement.

Stations are either ORBITAL (floating in space around a planet) or SURFACE (on a planet's surface). Both types function identically once docked.

You must be docked to access the Station and Market screens from the nav bar.`,
      },
      {
        title: 'Dock Camera',
        body: `Open Cons > Station Services > Dock Camera while docked to watch live starport traffic on a vector-style landing deck.

• HOLDING PATTERN — inbound ships circle a dashed holding ring above the deck while awaiting pad clearance. A faint descent corridor with descending chevrons and a PLATFORM marker shows which station they are holding over.
• LANDING DECK — the bottom of the screen holds numbered pads. Ships break from the holding pattern, approach from any screen edge, descend vertically onto an assigned pad, and later depart toward a random edge.
• SILHOUETTES — each ship is drawn as a manufacturer-specific hull (trader, hauler, combat, explorer, luxury, imperial) scaled by its class size, so traffic is visually varied.
• IDENTIFY — tap or click any ship to identify the pilot, ship class, current status, and activity. Founder-piloted ships glow green and are tagged FOUNDER.
• COMMS — a live traffic ticker below the deck streams docking clearances, landings, departures, and ambient chatter.

The Dock Camera is purely observational — it costs no fuel or time.`,
      },
      {
        title: 'Scanning Bodies',
        body: `Select any planet or star to scan it. Scanning reveals the body type and classification (e.g., Earth-like, Water World, Ammonia World), physical properties (radius, gravity, temperature, atmosphere, orbit), surface materials (on scanned landable bodies), and scan value in credits (paid when you sell exploration data).

Scanned bodies count toward achievements and first-discovery records. Rare body types (Earth-like, Ammonia, Neutron Stars, Black Holes) unlock special achievements.`,
      },
      {
        title: 'Landing on Surfaces',
        body: `Landable bodies (rocky/icy planets and moons) can be landed on for surface surveying. Select a landable body (after FSS scanning), launch surface probes to map it, then choose LAND ON SURFACE to descend.

While on the surface you can deploy probes to discover biological, geological, and mineral signals. Use DEPART to return to orbit — your ship returns to orbit around the body you just left.`,
      },
    ],
  },

  // ============================================================
  // EXPLORATION — scanning, surveying, cartographics
  // ============================================================
  {
    category: 'Exploration',
    icon: '🔭',
    entries: [
      {
        title: 'FSS System Scan',
        body: `The Full Spectrum Scanner (FSS) reveals all bodies in the current system at once. When you enter a new unscanned system, an FSS prompt appears in the center of the Orrery. Run the scan to populate the system map with every planet, moon, and signal.

The FSS lets you tune into four frequency bands (Low, Mid, High, Ultra) to discover all bodies in a system. Each band reveals the stellar/planetary bodies resonating at that frequency. Completing all four bands registers a full system scan, boosting exploration data value and revealing all bodies on the orrery.

Access the FSS Scanner from the External menu while in a system.`,
      },
      {
        title: 'Detailed Body Scans',
        body: `After FSS reveals bodies, you can perform detailed scans on individual bodies from the Orrery. Select a body and tap SCAN BODY. Detailed scans determine the body's exact value and properties, including surface materials on landable bodies.

Scanned body data accumulates in your cartography cache until sold.`,
      },
      {
        title: 'Surface Mapping',
        body: `Map a body with surface probes to increase its scan value and reveal surface signals. Mapping is required to discover biological and geological sites.

Select a landable body, tap LAUNCH SURFACE PROBES, then LAND ON SURFACE to begin surveying. First mapping unlocks an achievement milestone. Bigger bodies require more probes — the progress is tracked per body.`,
      },
      {
        title: 'Selling Exploration Data',
        body: `Exploration data must be sold at a station to earn credits. Visit the Exploration screen while docked and tap SELL DATA.

Your payout includes individual body scan values, first-discovered system bonuses (5,000 + 500 per body), and surface discovery values. Data can only be sold after traveling at least 20 light years from the scan origin — sell at distant stations for full value.

Selling data also advances your Exploration rank (Aimless → Scout → Trailblazer → ... → Elite V).`,
      },
      {
        title: 'Exploration Ranks',
        body: `Exploration rank progresses from Aimless through 14 tiers to Elite V. Rank advances based on total credits earned from selling exploration data.

RANKS: Aimless → Mostly Aimless → Scout → Surveyor → Trailblazer → Pathfinder → Ranger → Pioneer → Elite → Elite I-V`,
      },
      {
        title: 'Exobiology Scanner',
        body: `When landed on a mapped body with biological signals, use the Exobiology scanner to collect genetic samples. Each species requires 3 samples to complete a full analysis.

Completed analyses pay out immediately (base value 10K–25K CR per species) and are recorded in your persistent species Codex. Track your discoveries across the galaxy.`,
      },
      {
        title: 'Discovery Database',
        body: `A living catalogue of everything you've encountered. Tracks 12 stellar body types (O-class through White Dwarfs, Neutron Stars, Black Holes), 9 planet types (Rocky, Icy, Gas Giants, Earth-Like, Ammonia, Water Worlds, etc.), special milestones (first Earth-Like, first Neutron Star, first Black Hole), and biological species from your exobiology Codex.

Completing categories unlocks cosmetic badges and progression bonuses. Access from the Role menu.`,
      },
      {
        title: 'Cartography & Data Sale',
        body: `Universal Cartographics (station service) lets you review and sell exploration data. Data is grouped by galactic region (Core, Inner Sphere, Middle Regions, Outer Rim, Deep Space), with regional bonus multipliers — more distant data is worth more.

You can only sell data while docked at a station. First discoveries and mapped bodies both contribute to total payout. Always cash in before risking your ship — unsold data is lost on destruction.`,
      },
      {
        title: 'Salvage & Wreckage',
        body: `Deep space is littered with derelict vessels, crashed probes, battle remnants, and far older ruins. The further you explore, the more salvageable wreckage your scanners flag on arrival — uninhabited systems yield the richest finds, while core systems are picked clean.

Open Internal > Data > Salvage to review any wreck detected in your current system. Salvage the wreck to recover unique components — distinct from regular materials — ranging from common Salvage Alloy to legendary Precursor Navigation Stones. Higher exploration tiers surface rarer, more valuable components.

Collected components are stored in your Salvaged Components locker and can be sold for credits at any time. Wreckage discoveries scale with your exploration rank and total light years travelled.`,
      },
    ],
  },

  // ============================================================
  // TRADE & ECONOMY
  // ============================================================
  {
    category: 'Trade & Economy',
    icon: '🏪',
    entries: [
      {
        title: 'Buying & Selling Commodities',
        body: `The Market screen (available when docked) lists all commodities available at the current station. There are over 230 commodities across 13 categories: Minerals, Metals, Chemicals, Consumer Items, Foods, Industrial Materials, Medical, Technology, Salvage, Legal Drugs, Raw Materials, Textiles, and Weapons.

Prices fluctuate based on the station's economy type. Each commodity has a base price modified by supply and demand. Buy low in producing economies and sell high in consuming economies for maximum profit.

Some commodities are RESTRICTED (marked in red) — these can only be traded at stations in low-security or anarchy systems. Smuggling restricted goods into high-security systems carries risk but offers higher profit margins.

Your cargo capacity limits how much you can carry at once.`,
      },
      {
        title: 'Economy Types',
        body: `Stations have different economy types that determine what they produce and consume across 13 commodity categories:

• EXTRACTION — Produces minerals, metals, raw materials. Consumes consumer goods, food, medical, tech.
• REFINERY — Produces metals, chemicals. Consumes minerals, industrial goods, food.
• INDUSTRIAL — Produces industrial materials, technology, chemicals, textiles. Consumes metals, minerals, food, consumer goods.
• AGRICULTURE — Produces foods, legal drugs, textiles. Consumes industrial, tech, medical goods.
• HIGH TECH — Produces technology, medical, consumer goods. Consumes metals, chemicals, industrial materials.
• SERVICE — Produces consumer goods, salvage. Consumes food, tech, medical.
• MILITARY — Produces weapons, industrial, tech. Consumes food, medical, consumer, metals.
• COLONY — Produces food, salvage, textiles. Consumes tech, medical, industrial, consumer goods.
• TOURISM — Produces consumer goods, legal drugs. Consumes food, technology.

Matching buy/sell economies maximizes profit margins.`,
      },
      {
        title: 'Trade Routes Finder',
        body: `The Trade Tools screen includes a Trade Routes finder that scans nearby systems for profitable buy/sell opportunities.

• Set a search radius (up to 2,000 LY).
• Filter by commodity category.
• The tool ranks routes by profit-per-light-year efficiency.
• A progress bar shows scanning status.

Results show the best commodity, buy system, sell system, and expected profit. Access from the Commerce menu.`,
      },
      {
        title: 'Route Plotter',
        body: `The Route Plotter calculates multi-jump routes to distant destinations, including neutron star highway support.

• Enter a destination system name.
• The plotter searches expanding radii (up to 2,000 LY) to find the target.
• Routes are calculated using a greedy algorithm within your jump range.
• Neutron star boosts can supercharge your FSD for 4× jump range.
• Toggle neutron routing on/off with a checkbox.

Each jump segment shows fuel cost and whether it uses a neutron boost. The route summary shows total jumps, distance, fuel cost, and neutron boost count.`,
      },
      {
        title: 'Known Locations & Sandbox Teleport',
        body: `The Route Plotter includes a KNOWN LOCATIONS panel for instant destination selection without typing:

• SOL — Appears in sandbox mode as a quick-select button.
• BOOKMARKS — All your bookmarked systems appear as quick-select buttons.

In SANDBOX mode, a SANDBOX TELEPORT panel appears when you select any destination. Tap TELEPORT to instantly jump to the target system — bypassing fuel, range, and route entirely. This is the fastest way to travel in sandbox mode.`,
      },
      {
        title: 'Black Market',
        body: `Stations in low-security and anarchy systems host Black Markets where you can sell stolen or illegal goods. Black market prices are lower than legal markets, but it is the only way to offload pirated cargo.

Selling here raises your wanted status — manage your crime record carefully. Access from the Commerce menu while docked at a station with a black market.`,
      },
      {
        title: 'Market Analysis AI',
        body: `An AI-powered trade advisory that generates in-character market reports for your current system. The report analyzes system security, population, and economy to recommend which commodity categories are in demand.

Also shows a price snapshot table with best buys (low variance) and best sells (high variance), plus percentage indicators for each commodity. Access from the Commerce menu.`,
      },
    ],
  },

  // ============================================================
  // SHIPS & MODULES
  // ============================================================
  {
    category: 'Ships & Modules',
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

Cargo capacity is determined by your ship type and installed cargo racks.`,
      },
      {
        title: 'Buying New Ships',
        body: `The Shipyard tab (available when docked) lists ships available for purchase at the current station. Available ships depend on system population:

• Small population — Sparrowhawk, Peregrine, Packmule, Osprey
• Medium population — Falcon, Kestrel, Caravan Mk-VI, Kingfisher, Narwhal, Falcon Mk-V
• Large population — Heron, Albatross, Harrier, Wanderer, Republic Trooper, Raven, Dynast Courier
• Huge population — Republic Dreadnought, Dynast Sovereign, Bastion Mk-X, Roc, Leviathan Liner

Over 30 ship models are available from manufacturers: Falcon Deacy, Lakon Spaceways, Core Dynamics, Zorgon Peterson, Saud Kruger, and Gutamaya.

When you buy a new ship, your current ship is stored at that station. You can retrieve it later by returning and switching.`,
      },
      {
        title: 'Fleet Management',
        body: `The Fleet screen shows all ships you own. You can:

• SWITCH — Activate a stored ship if it's at your current station.
• TRANSFER — Move a stored ship to your current station for a fee (1% of ship value + 10,000 credits).
• RENAME — Give any ship a custom name.

Ships stored at fleet carriers can be accessed from any system where the carrier is present. Use the Carrier Interior's Command Deck to request ship transit to a carrier in your current system.`,
      },
      {
        title: 'Module Installation (Outfitting)',
        body: `The Outfitting screen lets you install and swap modules on your ship. Module categories include:

• Core modules (power plant, thrusters, FSD, sensors, life support)
• Optional internal (cargo racks, fuel scoops, shield generators, etc.)
• Utility mounts (shield boosters, scanners, chaff, etc.)
• Hardpoints (weapons)

Available modules depend on the station's outfitting level (1–5), determined by system population and economy. The outfitting picker always has a specific category and class selected — no 'all' filters.`,
      },
      {
        title: 'Engineering',
        body: `Higher outfitting levels unlock engineering modifications that enhance module performance beyond stock specifications. Engineers are found at stations with sufficient tech level.

Engineering tiers:
• Level 1 (Basic) — No engineering available.
• Level 2 (Standard) — Basic engineering.
• Level 3 (Advanced) — Standard engineering.
• Level 4 (Premium) — Advanced engineering.
• Level 5 (Elite) — Experimental engineering.

Each blueprint has 5 grades — higher grades give bigger bonuses but cost more materials. Blueprints are tailored to module type (Dirty Drive for thrusters, Long Range for weapons, etc.). Access engineering from the Modules menu while docked at a station with an engineer.`,
      },
      {
        title: 'Computing Ship Stats',
        body: `Your ship's final statistics (cargo capacity, fuel capacity, jump range) are computed from your ship type plus all installed modules. The Ship Overview and Builder tabs display live stats as you make changes.

Installing larger cargo racks increases capacity but may reduce jump range due to added mass. Balance your loadout for your intended activity.`,
      },
      {
        title: 'Synthesis',
        body: `Synthesis lets you craft consumables and emergency supplies from raw materials in your Ship Locker. Access the Synthesis screen from station services.

Six recipes are available:

• FSD INJECTION — Supercharges your FSD for 2× jump range on the next jump. Costs 2 Phosphorus + 1 Sulphur.
• HULL PATCH — Emergency hull repair restoring 20% ship integrity. Costs 3 Iron + 2 Nickel.
• SHIELD CELL — Synthesizes 3 shield cell charges that reinforce shields during combat. Costs 2 Carbon + 1 Phosphorus + 1 Chromium.
• AFM REFILL — Refills an Auto Field Maintenance unit, restoring 10% ship integrity. Costs 2 Nickel + 1 Zinc + 1 Manganese.
• LIMPET SYNTHESIS — 3D-prints 4 collector limpets directly into your cargo hold. Costs 2 Iron + 1 Carbon + 1 Silicon.
• HEAT SINK — Fabricates 3 disposable heat sinks that reduce module wear from neutron star jumps. Costs 2 Silicon + 1 Phosphorus + 1 Germanium.

Synthesis is available anywhere — no station required.`,
      },
      {
        title: 'Ship Locker',
        body: `The Ship Locker stores all raw and manufactured materials. Materials are used for engineering module upgrades, synthesis (ammo, limpets, etc.), and colony infrastructure delivery.

Materials do not count against your cargo capacity.`,
      },
      {
        title: 'Refinery',
        body: `Mined materials collect in your refinery (default capacity: 4 slots). The refinery processes raw fragments into usable materials.

Processed materials move to your Ship Locker for use in synthesis, engineering, or colony delivery.`,
      },
      {
        title: 'Material Trader',
        body: `Exchange raw materials at grade-based ratios. Materials are graded Common (G1), Standard (G2), Rare (G3), and Very Rare (G4).

Same-grade swaps cost 6:1. Upgrading to a higher grade costs more; downgrading yields more. The grade inventory summary at the top shows how many materials you own at each tier.

Access from station services. Use this to convert surplus materials into what you need for engineering and synthesis.`,
      },
      {
        title: 'Loadout Presets',
        body: `Save your current module configuration as a named preset (e.g., "Exploration Build", "Combat Build"). Apply presets instantly at stations to switch between roles without manual module swapping.

Presets are ship-type-specific — a preset saved for an Albatross won't work on a Roc. The summary shows module type counts per preset. Access from the Internal > Ship menu.`,
      },
      {
        title: 'Ship Maintenance & AFMU',
        body: `Modules degrade with use — jumps, combat, and neutron star exposure accumulate module wear (0–100%). At high wear, FSD range, shield strength, weapon damage, and speed are all reduced.

STATION REPAIR: Full module servicing at stations (cost scales with wear and ship class).

AFMU (Auto Field Maintenance Unit): Field repair using synthesis materials (5 Nickel, 3 Phosphorus, 2 Chromium). Reduces wear by 50% per use. Available anywhere — no station required.

Hull integrity (separate from module wear) also requires station repair or synthesis hull patches. Access maintenance from the Modules menu while docked.`,
      },
    ],
  },

  // ============================================================
  // MISSIONS & COMMUNITY
  // ============================================================
  {
    category: 'Missions & Community',
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

Missions reward credits and advance your Trade rank. Accept missions whose destination systems you can reach in time — failing a mission damages your reputation.`,
      },
      {
        title: 'Completing Missions',
        body: `Active missions appear in the Missions screen. Complete the objective (deliver cargo, reach a system, etc.) then return to claim your reward.

DELIVERY, COURIER, PASSENGER, and COLONIZATION SUPPLY missions require you to be at the destination system to complete them — the COMPLETE button is disabled until you've jumped to the target system and docked at a station there. MINING and SALVAGE missions are local and can be completed at any station in the system where they were accepted.

Mission destination systems are marked with pulsing yellow indicators on both the Galaxy Map and within the System view when you arrive.

Mission rewards count toward your lifetime earnings and Trade rank progression.`,
      },
      {
        title: 'Mission Chains',
        body: `Multi-part story missions with branching narratives and escalating rewards. Each chain has 3–4 steps that advance the story:

• The Lost Surveyor — Track a missing explorer.
• Trade War — Side with a faction in a trade dispute.
• Pirate King Takedown — Build a case and eliminate a pirate king.
• The Alien Artifact — Race rival scavengers to an ancient relic.

Completing each step grants credits; finishing the chain awards a large bonus and a unique title.`,
      },
      {
        title: 'Community Goals',
        body: `Weekly rotating objectives with tiered rewards. Event types include trade deliveries, mining supply, exploration surveys, combat sweeps, and construction projects.

Each goal has a progress bar, a simulated leaderboard with NPC commanders, and reward tiers (Participant → Champion) that scale the payout. Contribute resources to fill the bar, then claim your reward.

Goals expire after 7 days. Access from the Commerce > World menu.`,
      },
      {
        title: 'Cosmic Events',
        body: `Rare, time-limited phenomena that appear randomly when you scan for them:

• Supernova — Scan a dying star for huge exploration data (24h, 5M CR).
• Cometary Transit — Mine rare materials from a comet tail (12h, 2M CR).
• Alien Artifact — Investigate anomalous readings (48h, 10M CR).
• Pilgrim Fleet — Lucrative passenger missions (6h, 3M CR).
• Derelict Megaship — Salvage technology before it drifts away (18h, 4M CR).

Events appear in the StarNet feed and expire after their duration. Participate before the deadline to claim rewards.`,
      },
      {
        title: 'StarNet News',
        body: `The galactic news feed covering faction conflicts, power shifts, market events, and cosmic phenomena. Articles cover ongoing wars, holiday announcements, and notable discoveries.

Reading StarNet keeps you informed of where the action is — a war starting in a nearby system may mean combat bonds and trade disruption. Access from the Commerce > World menu.`,
      },
    ],
  },

  // ============================================================
  // COMBAT & PIRACY
  // ============================================================
  {
    category: 'Combat & Piracy',
    icon: '⚔️',
    entries: [
      {
        title: 'Ship Combat',
        body: `Combat is turn-based, comparing your ship's total combat power (damage + shield + hull) against the enemy's. Choose a tactic each round — attack, shield boost, or flee. Weapons, shields, and hull all factor into the outcome.

Always carry shield cells and heat sinks (synthesized from materials) before entering dangerous systems. Cash your combat bonds and bounty vouchers at a station before risking your ship — unbanked earnings are lost on rebuy.`,
      },
      {
        title: 'Bounty Board',
        body: `Accept kill contracts from the Bounty Board while docked. Each bounty lists a target, a reward, and a system. Bounty vouchers are awarded automatically when you destroy a wanted ship — cash them at any station with the Bounty Board or Cartographics.

Access from the Commerce > Missions menu while docked.`,
      },
      {
        title: 'Conflict Zones',
        body: `Join an active warzone from the Conflict Zones screen. Choose a faction to fight for, then engage enemy ships. Conflict zones pay combat bonds per kill — cash them at a station. Higher-intensity zones pay more but are far more dangerous. Bring a combat-fitted ship.

Access from the External > Field Ops menu.`,
      },
      {
        title: 'Resource Extraction Sites (RES)',
        body: `Resource Extraction Sites are asteroid fields with a high concentration of wanted pirates. They double as combat arenas — patrol the site, scan ships, and destroy wanted ones for bounties while also mining. Security ships patrol high-security RES, offering some backup.

Access from the External > Field Ops menu.`,
      },
      {
        title: 'Multi-Crew System',
        body: `Assign hired crew to four active combat roles: Pilot, Gunner, Shield Operator, and Engineer. Each role unlocks a unique ability usable during ship combat:

• PILOT — Evasive Maneuver: +15% flee chance for one round (3-round cooldown).
• GUNNER — Overcharge Weapons: +50% damage for one round (3-round cooldown).
• SHIELD OPERATOR — Shield Boost: Restore 30% shields instantly (4-round cooldown).
• ENGINEER — Emergency Repair: Restore 15% hull instantly (5-round cooldown).

Queue abilities before choosing a combat tactic. The ability applies to that round, then enters cooldown. Access the Multi-Crew screen at any station.`,
      },
      {
        title: 'Shield Cells & Heat Sinks',
        body: `Two synthesis-made consumables are available during combat:

• SHIELD CELL CHARGES — Synthesized from 2 Carbon + 1 Phosphorus + 1 Chromium (yields 3 charges). During combat, activating a shield cell instantly restores 30% shields. Charges are consumed on use. Stack up to 3 charges before a tough fight.

• HEAT SINKS — Synthesized from 2 Silicon + 1 Phosphorus + 1 Germanium (yields 3 sinks). Reduce module wear from neutron star jumps by 70% per charge.

Both are synthesized from the Synthesis screen and persist in your ship state until used. Plan ahead — synthesize before departing for dangerous systems.`,
      },
      {
        title: 'Fighter Hangar',
        body: `Class 3 and larger ships can equip a fighter hangar (1 slot for Class 3, 2 slots for Class 4). Build fighters from three types:

• Taipan — Balanced multirole (50K CR).
• GU-97 — Fast interceptor, fragile hull (80K CR).
• Trident — Heavy assault fighter (120K CR).

Assign a wingmate as pilot for full effectiveness, or run autonomous (reduced damage). Deployed fighters add extra attacks each combat round alongside wingmate support.`,
      },
      {
        title: 'Wingmates',
        body: `Hire NPC escort pilots from the Wingmates screen. Wingmates assist in combat, mining, and trade, sharing kills and protecting you. A full wing of three escorts turns a solo operation into a formidable force. Manage their loadouts and orders from this screen.

Access from the External > Squadron menu.`,
      },
      {
        title: 'Piracy & Interdiction',
        body: `In Low Security and Anarchy systems, scan for NPC traders and demand their cargo. Traders may comply (drop cargo) or fight back based on their compliance chance.

Combat resolution compares your ship's total combat power against the trader's. Win to seize all cargo; lose and take hull damage.

Piracy is a crime — each act increases your notoriety and bounty. Stolen cargo can be fenced at Black Markets in anarchy systems. Use a fast ship with hatch-breaker limpets.`,
      },
      {
        title: 'Crime & Punishment',
        body: `Crimes — piracy, murder, smuggling, hacking — generate fines and bounties on your head. Your Crime Status screen tracks your wanted level and active bounties.

Pay fines at any station; clear bounties at an Interstellar Factors in a low-security system. A clean record keeps security forces friendly. Access from the Commerce > World menu.`,
      },
    ],
  },

  // ============================================================
  // FLEET CARRIERS
  // ============================================================
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
        body: `Carriers jump using TRITIUM fuel, consuming approximately 1 ton per 10 light years. Jump your carrier to any system within 500 LY from the Carriers screen.

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
• MARKET — Buy/sell commodities at carrier (required for buy/sell order income).
• SHIPYARD — Purchase ships at carrier.
• OUTFITTING — Install modules at carrier.
• REFUEL — Always on by default.
• REPAIR — Always on by default.`,
      },
      {
        title: 'Carrier Interior',
        body: `Step inside your fleet carrier and explore six interactive rooms:

• BAR — Purchase themed ales and drinks, hear rumors about nearby systems, and read galaxy facts from the barkeep.
• QUARTERS — Your personal living space.
• GARDEN — Plant and grow a virtual garden with customizable plant colors. Saved plants persist on the carrier.
• TROPHY ROOM — Display your achievement milestones and exploration records.
• COMMAND DECK — Request ship transit to this carrier (for ships in your fleet), view carrier status.
• OBSERVATION LOUNGE — View the current system through the carrier's panoramic windows.

The interior is available only when a carrier is present in your current system. Each carrier has its own unique interior state (garden plants, bar tab, etc.).`,
      },
      {
        title: 'Carrier Yard (Custom Carriers)',
        body: `Design custom fleet carriers with the 3D Carrier Creator. Uses the same builder interface as the Ship Yard but with carrier-scale parts.

• MOUNT SLOTS — Select structural slots (hull, superstructure, landing pads, towers, etc.).
• PART SELECTOR — Choose from carrier-scale parts unlocked by shipyard level.
• CUSTOMIZATION — Resize, move, and rotate each part on all three axes.
• STRUCTURAL CATEGORY — Visual-only decorative parts with high placement limits.

Save designs, share them via encoded share codes, and apply saved designs to your owned carriers. In Sandbox mode, all parts are unlocked.`,
      },
      {
        title: 'Carrier Command Dashboard',
        body: `A unified management view for all fleet carriers. See tritium levels, pending revenue, active orders, docked ships, and service status for every carrier in one screen.

Collect all pending revenue, check docked ship rosters, and review which services are enabled — all without switching between individual carrier screens. Access from the External > Squadron menu.`,
      },
      {
        title: 'Carrier Logistics',
        body: `Plan multi-jump routes for your fleet carrier using bookmarked systems as waypoints. The route planner calculates total tritium cost and distance across all jumps.

Execute jumps one at a time, with tritium automatically deducted per jump. The carrier stays at its current system until you execute the next jump. Access from the External > Squadron menu.`,
      },
      {
        title: 'Warp Gates',
        body: `Warp Gates are permanent fast-travel structures that allow instant jumps between connected systems, bypassing fuel costs and jump range limits entirely.

BUILDING A GATE:
• Requires a fleet carrier present in the current system.
• Costs 500,000,000 credits and a quantity of raw materials (Iron, Silicon, Carbon, Nickel, Platinum, Iridium).
• Each system can have at most one warp gate.
• Once built, the gate is permanent — it cannot be destroyed.

USING WARP GATES:
• From the Warp Gates screen, select any connected gate to instantly jump to that system.
• Warp jumps consume no fuel and ignore jump range.
• Your ship, cargo, and all state transfer instantly.

Warp gates are especially useful for creating a fast-travel network between your colonies, stations, and trade hubs. In Sandbox mode, gate construction is free.`,
      },
    ],
  },

  // ============================================================
  // COLONIZATION & INDUSTRY
  // ============================================================
  {
    category: 'Colonization & Industry',
    icon: '🌱',
    entries: [
      {
        title: 'Establishing Colonies',
        body: `Colonize landable bodies to create settlements. Colonies generate credit-based passive income over time and can be developed through infrastructure investment.

Each colony tracks population, happiness, infrastructure level, and development stage. Delivering commodities boosts these metrics.`,
      },
      {
        title: 'Colony Growth',
        body: `Colonies progress through development stages as you deliver resources and invest. Higher-stage colonies produce more income and can support more advanced facilities.

Colony types vary based on the host body's environment (rocky, icy, terraformed, etc.). At higher tiers, colonies gain features like Market, Outfitting, Material Trader, and Engineer access.`,
      },
      {
        title: 'Colony Commodity Delivery',
        body: `Deliver specific commodities to colonies to boost happiness and infrastructure. Different commodity categories have varying impact:

• Technology and raw materials have the highest boost.
• Industrial goods provide strong infrastructure gains.
• Metals and chemicals provide moderate boosts.

Deliver from the Colonization screen while carrying compatible cargo. Establishing 3+ colonies is a requirement for building a Space Shipyard.`,
      },
      {
        title: 'Station Builder',
        body: `Build orbital stations at your colonies for 50M CR. Choose from 5 economy types (Agricultural, Industrial, Mining, High Tech, Refinery) — each has a different revenue multiplier.

Install services (Market, Outfitting, Shipyard, Refuel, Repair) to increase passive trade revenue. Revenue accumulates over time based on services and economy type. Collect anytime from the Station Builder screen.

Access from the Industry menu.`,
      },
      {
        title: 'Station Creator',
        body: `The Station Creator is a 3D builder for designing the visual appearance of stations you own — distinct from the Station Builder, which constructs the station and its economy.

• MOUNT SLOTS — Select structural slots (hull, towers, landing pads, superstructure).
• PART SELECTOR — Choose from station-scale parts.
• CUSTOMIZATION — Resize, move, and rotate each part on all three axes.
• APPLY — Save a design and apply it to any owned station; the custom model renders in the system orrery.

In Sandbox mode all parts are unlocked. Share designs via encoded share codes, just like custom ships and carriers.`,
      },
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
        title: 'Saving & Sharing Blueprints',
        body: `Save your custom ship designs as blueprints from either the Builder tab or the Shipyard tab.

Enter a blueprint name and tap SAVE DESIGN or SAVE BLUEPRINT. Saved designs appear in the Saved tab where you can:
• EDIT — Load the design back into the builder.
• ACTIVATE — Set the design as your active ship (requires docking).
• DELETE — Remove the blueprint permanently.

SHARING: Generate an encoded share code for any design, copy it, and share it with others. Paste a received code into the import field to load someone else's blueprint into your builder. In Sandbox mode, all parts are unlocked regardless of shipyard level.`,
      },
    ],
  },

  // ============================================================
  // COMMANDER & FACTIONS
  // ============================================================
  {
    category: 'Commander & Factions',
    icon: '🎖️',
    entries: [
      {
        title: 'Commander Profile',
        body: `The Profile screen displays your commander's lifetime statistics:

• Total jumps
• Light years traveled
• Lifetime earnings
• Ships purchased
• Current ranks (Exploration, Trade, Mining)
• Active colonies and fleet carriers
• Player badge

These stats are tracked in Commander mode. Sandbox mode starts with elevated stats but tracks progress from there.`,
      },
      {
        title: 'Player Reputation',
        body: `Track your standing with five galactic factions (Federation, Empire, Alliance, Independent, Pirate Syndicates). Reputation ranges from -100 (Hostile) to +100 (Allied ★).

Donate credits to improve standing. High reputation unlocks better missions, station discounts, and exclusive services. Low reputation restricts docking access.

Betray the Pirate Syndicates to lose their favor — useful if you want to go straight.`,
      },
      {
        title: 'Player Titles',
        body: `Earn cosmetic titles from gameplay milestones — Starfarer (first jump), Trailblazer (10 systems), Trade Baron (100M earnings), World Discoverer (first Earth-Like), and many more.

Equip one title at a time to display alongside your commander name on leaderboards and in your profile. Titles are purely cosmetic with no mechanical impact.`,
      },
      {
        title: 'Power Play',
        body: `Pledge allegiance to one of six galactic powers. Each power grants unique passive bonuses (trade profit, mission rewards, ship stats, scan value, etc.).

Earn reputation through:
• DONATE — Convert credits to reputation.
• CONSOLIDATE MERITS — Convert time pledged and jumps completed into reputation.
• UNDERMINE — Spend 5M CR to fund covert operations against rivals (+200K rep).

Eight ranks from Outsider to Patron, each requiring increasing reputation thresholds.`,
      },
      {
        title: 'Crew Progression',
        body: `Hired crew earn XP passively from time served (50 XP/hour) and actively through training (50K CR for 500 XP). Five levels: Rookie, Trained, Veteran, Elite, Elite I.

Each level increases the crew member's bonus multiplier (1.0× → 3.0×), scaling all their passive bonuses. A Veteran pilot gives +50% more jump range bonus than a Rookie.

Access crew management from station services → Crew Quarters.`,
      },
      {
        title: 'Background Simulation (BGS)',
        body: `Each system has multiple factions vying for influence. Faction influence (0–100%) determines system control and generates states:

• BOOM — High influence, better trade prices.
• BUST — Low influence, poor prices.
• WAR — Two factions with similar influence; conflict zones present.
• EXPANSION — Faction growing territory.
• RETREAT — Faction losing ground.

Support factions (500K CR, +3 influence) or undermine rivals (1M CR, -5 influence) to shift the balance. States change automatically as influence crosses thresholds.`,
      },
      {
        title: 'Canis Stella Corporation',
        body: `Canis Stella is a galaxy-spanning megacorporation you can engage with for corporate progression and a unique endgame track.

• REPUTATION — Complete Canis Stella-aligned activities and missions to gain reputation. Eight ranks lead from neutral hireling up to CEO.
• CEO TRACK — Reach the top rank and you can declare your own corporate faction, naming it and staking a claim in the galactic economy.
• STANCE — Your stance (neutral, allied, rival) shapes how the corporation and rival factions react to you.

Canis Stella bridges the player-faction systems (BGS, Power Play, reputation) into a single corporate career ladder. In Sandbox mode you can skip straight to the top.`,
      },
      {
        title: 'Company & Trade Contracts',
        body: `Register a trade company for 1,000,000 CR from the Company screen. This unlocks passive income mechanics — a stepping stone toward affording a fleet carrier.

Assign your spare ships (from your fleet, not your active ship) to autonomous trade contracts. Each assigned ship earns passive income based on its cargo capacity and jump range:

• Income per hour = (cargo capacity × 50,000) + (jump range × 10,000)
• Reputation multiplier applies on top (up to +50%)

Income accumulates over time even while you're exploring, mining, or doing other activities. Collect periodically from the Company screen. You can recall a ship from a contract at any time.

Your company reputation grows as you collect income — every 100M CR collected raises your reputation by one level, up to level 10 (Elite II) for a +50% income bonus. Reputation is permanent.`,
      },
      {
        title: 'Carrier Buy/Sell Orders',
        body: `Once you own a fleet carrier, you can set up to 5 buy or sell orders per carrier. Each active order generates 500,000 CR/hr in passive income.

REQUIREMENTS:
• The carrier's MARKET service must be enabled.
• Orders generate income only while the market service is active.

To set an order: select your carrier, choose BUY or SELL, select a commodity, and confirm. Income accumulates over time — collect periodically.`,
      },
      {
        title: 'Badge Maker',
        body: `The Badge Maker is a design tool for creating custom icons, logos, and flags with a live SVG preview.

Customize your badge with:
• SHAPE — Shield, Circle, Hexagon, Diamond, Square, or Pentagon.
• PATTERN — Solid, Split, Quartered, or Striped.
• COLORS — Primary and secondary colors from a palette.
• SYMBOL — 30+ symbols including star, rocket, planet, skull, anchor, crown, wings, sword, and more.
• BORDER — Multiple border styles.

Your designed badge can be set as your player badge (appears on your Commander Profile), set as your company logo, or saved to a gallery. Share designs via encoded share codes.`,
      },
      {
        title: 'Leaderboard',
        body: `The Leaderboard screen tracks your personal exploration records across 13 categories:

• Hottest Planet / Coldest Planet (temperature)
• Fastest Orbit / Slowest Orbit (orbital period)
• Smallest Star / Largest Star (radius)
• Most Moons (moon count of a single planet)
• Largest Planet / Smallest Planet (radius)
• Highest Gravity / Lowest Gravity (in g)
• Closest to Star / Farthest from Star (orbit radius in AU)

Records are set automatically when you scan bodies. Each category shows the record value, the body name, and the system where it was found. A progress bar shows how many of the 13 categories you've claimed.`,
      },
      {
        title: 'Achievements',
        body: `The Awards screen tracks 140+ achievements across multiple categories:

• FIRST DISCOVERIES — First time scanning each body type (18 planet types, 9 star classes, 16 surface signals).
• MILESTONES — Key gameplay firsts (first jump, first scan, first colony, first shipyard, first bookmark, first carrier, first custom ship, Sol discovery, etc.).
• COUNT MILESTONES — Progression tracks for jumps, systems visited, bodies scanned, credits, ships purchased, colonies, carriers, light years traveled, mappings, FSS scans, bookmarks, and more.

Achievements persist with your save and provide long-term progression goals.`,
      },
    ],
  },

  // ============================================================
  // CABIN LIFE
  // ============================================================
  {
    category: 'Cabin Life',
    icon: '🏠',
    entries: [
      {
        title: 'Cabin',
        body: `Decorate your commander's cabin with customizable cockpit-style parts and surfaces. The cabin is your personal space aboard your ship or carrier — furnished with rooms you build.

From here you can walk around, view your collections, and manage your living quarters. Cabin modules are installed in optional internal slots via Outfitting. Access from the Misc > Cabin menu.`,
      },
      {
        title: 'Room Manager',
        body: `Add, remove, and arrange rooms on a grid layout inside your carrier or a station you own. Each room type — quarters, lounge, lab, greenhouse — provides different bonuses or functions.

Place rooms to fit your playstyle; the layout is fully customizable and saved per ship or carrier. Access from the Misc > Cabin menu.`,
      },
      {
        title: 'Aquarium',
        body: `Collect and display aquatic specimens caught during your travels. Fish are procedurally generated with unique traits. A stocked aquarium provides a small morale bonus to crew and is a living record of the worlds you have visited.

Catch fish with specialized equipment on water worlds. Stock is limited by tank capacity. Access from the Misc > Cabin menu.`,
      },
      {
        title: 'Garden',
        body: `Plant and grow flora collected from habitable planets. Plants grow over time and provide materials, oxygen, or morale bonuses. A well-tended garden is both decorative and functional — harvest it periodically for usable resources.

Saved plants persist per carrier. Access from the Misc > Cabin menu.`,
      },
      {
        title: 'Genetics Lab',
        body: `Cross-breed specimens from your aquarium and garden. Combining traits can produce rare and valuable new species. The genetics lab is the endgame of specimen collection — experiment with pairings to discover unique organisms worth credits and achievements.

Access from the Misc > Cabin menu.`,
      },
    ],
  },

  // ============================================================
  // SOL & CHEATS
  // ============================================================
  {
    category: 'Sol & Cheats',
    icon: '☀️',
    entries: [
      {
        title: 'The Sol System',
        body: `Hidden somewhere in the galaxy is Sol — humanity's lost cradle. Unlike procedurally generated systems, Sol is a hand-crafted recreation of our real solar system, with all eight planets, their major moons, and Pluto.

Sol is not visible on the galaxy map by default. You must search for it by name using the Route Plotter. In Commander mode, you must be within search range (2,000 LY). In Sandbox mode, you can teleport directly.

Finding Sol permanently unlocks the Cheats system and grants the "Homecoming" achievement.`,
      },
      {
        title: 'Cheats System',
        body: `Once you discover Sol, the Cheats screen becomes available. Each body in the Sol system grants a unique cheat:

• SOL — Solar Forge (Passive): Infinite fuel. Every jump is fully fueled.
• MERCURY — Fleet-Footed (Passive): Instant jumps. No fuel cost, no range limit.
• VENUS — Morning Star (Passive): Perfect market prices — buy for nothing, sell for maximum.
• EARTH — Genesis Protocol (Active): All colonies instantly max out.
• MARS — War Forge (Passive): All outfitting and engineering is free.
• JUPITER — Jovian Treasury (Active): Fill your account with 1 billion credits.
• SATURN — Lord of Rings (Cosmetic): Radiant golden CRT theme.
• URANUS — Tilted Axis (Cosmetic): Galaxy map viewed upside-down.
• NEPTUNE — All-Seeing Eye (Active): Reveal all systems within 500 LY.
• PLUTO — Underworld Riches (Active): Fill ship locker with max materials.

PASSIVE and COSMETIC cheats toggle on/off. ACTIVE cheats trigger a one-time effect. The golden theme (Saturn) overrides your selected color theme when active.`,
      },
    ],
  },

  // ============================================================
  // PUBLIC HOLIDAYS
  // ============================================================
  {
    category: 'Public Holidays',
    icon: '🎉',
    entries: [
      {
        title: 'How Public Holidays Work',
        body: `Public Holidays are real-calendar seasonal events separate from Community Goals. They are tracked by real-life calendar dates — not in-game time — so every player experiences them simultaneously.

• ANNOUNCEMENT — 14 days before each holiday, a countdown begins. The event appears in the Status Header, StarNet News publishes advance warnings, and the Public Holidays screen shows the upcoming event.
• DURATION — Each holiday lasts exactly 7 days.
• PROFIT — Holidays offer extremely lucrative profit opportunities. Commodity sell prices can multiply by 2× to 10×, exploration data payouts can triple, colony income can double, and fuel costs can be halved — all depending on the specific holiday.

Plan ahead: stock up on the right commodities before the holiday starts, then sell during the event for maximum profit.`,
      },
      {
        title: 'Holiday Calendar',
        body: `Ten public holidays occur throughout the year:

🎆 GALACTIC NEW YEAR FESTIVAL — January 1–7. ALL commodities sell for 2× at every station.

🍾 THE BOOZE CRUISE — February 14–20. LEGAL DRUGS commodities sell for 10× normal price. The most profitable single-category event.

🏛️ FOUNDERS DAY (CORE WORLDS) — March 15–21. CONSUMER ITEMS and TECHNOLOGY sell for 5×.

📈 SPRING TRADE SUMMIT — April 20–26. ALL commodities sell for 3× at every station.

🔭 EXPLORERS WEEK — May 25–31. Exploration data sells for 3× at Universal Cartographics.

🌍 SOL REMEMBRANCE DAY — July 4–10. ALL commodities sell for 3× in solemn remembrance.

⛏️ MINERS WEEK — August 10–16. MINERALS, METALS, and RAW MATERIALS sell for 5×.

🌟 COLONIA FOUNDERS DAY — September 15–21. TECHNOLOGY and CONSUMER ITEMS sell for 5×.

⚡ NEUTRON HIGHWAY FESTIVAL — October 31–November 6. ALL commodities 2× + fuel consumption halved for all jumps.

🚀 FRONTIER DAY — December 1–7. ALL commodities 2× + colony passive income doubled.`,
      },
      {
        title: 'The Booze Cruise',
        body: `The most legendary event in the galaxy. Every February 14th, the Booze Cruise transforms known space into a week-long floating festival.

Carrier fleets convert into party barges. Stations host dockside celebrations. And the demand for legal drugs — wine, beer, spirits, tobacco, recreational substances — reaches absurd heights, with sell prices hitting 10× the standard rate.

Savvy commanders begin stockpiling legal drug commodities the moment the 2-week countdown appears in StarNet News. They clear cargo holds, buy out every legal drugs market they can find, and wait for kickoff. When the festival begins, they sell everything for astronomical profit.

A single cargo hold of spirits purchased at normal prices can yield tens of millions in profit during the Booze Cruise.`,
      },
      {
        title: 'Holiday Profit Strategies',
        body: `MAXIMIZE YOUR EARNINGS during public holidays:

• STOCKPILE EARLY — When the 14-day countdown appears, start buying the boosted commodity categories. Purchase at producing economies for the lowest buy prices.
• SELL DURING THE EVENT — Wait until the holiday is active, then sell at consuming economies (High Tech, Industrial, Service) for the maximum multiplied sell price.
• ALL-CATEGORY HOLIDAYS — During Galactic New Year (2×), Spring Trade Summit (3×), Sol Remembrance (3×), and Frontier Day (2×), every commodity is boosted. Fill your cargo with the highest base-price commodities you can afford.
• SPECIAL HOLIDAYS — Explorers Week triples exploration data. Save your scans and sell during this week. Neutron Highway Festival halves fuel costs — perfect for long-range exploration trips. Frontier Day doubles colony income — collect during this week for double payouts.
• ROUTE PLANNING — Use the 14-day countdown to plan your route. If you're far from civilization, start heading back to populated space before the holiday begins.`,
      },
    ],
  },

  // ============================================================
  // TUTORIALS — replayable from the Codex
  // ============================================================
  {
    category: 'Tutorials',
    icon: '🎓',
    entries: Object.values(TUTORIAL_CATEGORIES).map(cat => ({
      title: cat.name,
      body: cat.desc + '\n\n' + cat.steps.map((s, i) => `${i + 1}. ${s.title}\n   ${s.text}`).join('\n\n'),
      tutorialId: cat.id,
    })),
  },

  // ============================================================
  // CREDITS — the people who built the galaxy
  // ============================================================
  {
    category: 'Credits',
    icon: '🤝',
    entries: [
      {
        title: 'Founders & Contributors',
        body: getContributorCount() > 0
          ? `The people who helped build the galaxy. Each contributor's alias appears as a background NPC — you may encounter them flying the stars during your travels as a "Founder Sighting" encounter.\n\n` +
            CONTRIBUTORS.map(c => `• ${getCreditLine(c)}` + (c.role ? ` — ${c.role}` : '')).join('\n')
          : `The galaxy is vast, and its founders are many. As contributors join the project, their names will appear here — and their aliases will fly among the stars as NPCs you can meet during your travels.\n\nIf you've contributed to o7 and would like to be listed, let the developer know. The credits list grows over time.`,
      },
    ],
  },
];

export default CODEX;