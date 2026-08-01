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

• COMMANDER — Standard play. You start with 100,000 credits and a Sparrowhawk Mk-I. All ships, parts, and features must be earned or purchased. Lifetime statistics (light years traveled, earnings, ships purchased) are tracked for your profile.

• SANDBOX — Unrestricted mode. You start with 1 billion credits and a Roc. All ship parts are unlocked, purchases are free, carrier jumps cost no tritium, and you can teleport to any searched system instantly. Ideal for experimentation.

Switch saves anytime from the Settings screen. Each slot persists independently in your browser's local storage.`,
      },
      {
        title: 'Navigation Bar',
        body: `The top navigation bar groups every screen into six dropdown menus: EXPLORE, STATION, COMMERCE, FLEET, INDUSTRY, and COMMANDER. On narrow screens, group labels are replaced by icons to prevent overflow — tap an icon to open its dropdown.

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
        body: `Every screen in Dogstar Interstellar is reachable from every other screen via the navigation bar. You will never get stuck in a sub-menu with no way back. If a screen requires docking (Station, Market, Outfitting), simply navigate to the System view, dock at a station, and those options unlock.`,
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
      {
        title: 'Mission Destination Markers',
        body: `When you have an active mission with a destination system, a pulsing yellow marker appears on the galaxy map at the target system. This helps you navigate toward mission objectives without searching manually.

The System view also displays a mission-target alert banner when you enter the correct system.`,
      },
      {
        title: 'The Core Worlds (The Bubble)',
        body: `The starting area of Dogstar Interstellar is a populated region of space called The Core Worlds, centered on your starting system (Deciat Reach). Within approximately 200 light years of the start, the vast majority of star systems are inhabited with populations ranging from 100,000 to 20 billion.

This is your "bubble" — a safe, civilized region where you'll find stations, markets, missions, and trade opportunities on nearly every jump. It's the ideal place to build your credits, rank, and fleet before venturing into the deeper galaxy.

Population density is highest at the center of the bubble and fades toward the edges. Beyond the bubble's radius, inhabited systems become rare — most stars you encounter will be uninhabited frontier space.`,
      },
      {
        title: "Cradle's End (Coreward Hub)",
        body: `Approximately 6,300 light years coreward from the starting bubble lies Cradle's End — a populated hub system near the galactic core. It is the centerpiece of a smaller civilized region called The Coreward Reach, a 100-light-year bubble of inhabited systems centered on Cradle's End.

Cradle's End serves as a staging point for deep-core exploration. If you're heading toward the galactic center to scan neutron stars, black holes, and rare stellar phenomena, Cradle's End is your last chance to refuel, repair, and resupply before venturing into the densely packed core.

Cradle's End appears as a gold landmark marker on the Galaxy Map and is always available as a quick-select destination in the Route Plotter's Known Locations panel.`,
      },
      {
        title: "Vagrant's Horizon (The Rim Outpost)",
        body: `At the extreme opposite end of the galaxy from the starting bubble — over 25,000 light years away — lies Vagrant's Horizon, the furthest inhabited outpost from civilized space. This lonely red-dwarf system has a small population of 750,000 and a single station, making it the most remote trading post in known space.

Reaching Vagrant's Horizon is an endurance challenge requiring careful fuel management, neutron star highway routing, and dozens of jumps. There are no populated systems along most of the route — you'll be crossing vast stretches of uninhabited frontier space.

Vagrant's Horizon appears as a gold landmark marker on the Galaxy Map and is always available as a quick-select destination in the Route Plotter's Known Locations panel. In Commander mode, you'll need to plot a route within your jump range. In Sandbox mode, you can teleport directly.`,
      },
      {
        title: 'Landmark Markers',
        body: `Major galactic landmarks — Sol, Cradle's End, and Vagrant's Horizon — appear as large gold markers on the Galaxy Map when within view range. These markers help you navigate toward significant destinations.

The bottom-left legend of the Galaxy Map includes a LANDMARKS entry to remind you of the marker color.

Landmarks are always available as quick-select buttons in the Route Plotter (Commerce > Trade Tools > Route Plotter) under Known Locations, regardless of your save mode. Sol additionally requires Sandbox mode or discovery via search.`,
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

Uninhabited systems (population 0) may have zero stations — these are frontier systems awaiting colonization. If you jump to an uninhabited system with no station, you cannot dock, refuel, or trade there. Plan your fuel accordingly, or colonize a landable body to begin settlement (see Colonization).

Stations are either ORBITAL (floating in space around a planet) or SURFACE (on a planet's surface). Both types function identically once docked.

You must be docked to access the Station and Market screens from the nav bar.`,
      },
      {
        title: 'Scanning Bodies',
        body: `Select any planet or star to scan it. Scanning reveals:

• Body type and classification (e.g., Earth-like, Water World, Ammonia World)
• Physical properties (radius, gravity, temperature, atmosphere, orbit)
• Surface materials (on scanned landable bodies)
• Scan value in credits (paid when you sell exploration data)

Scanned bodies count toward achievements and first-discovery records. Rare body types (Earth-like, Ammonia, Neutron Stars, Black Holes) unlock special achievements.`,
      },
      {
        title: 'Landing on Surfaces',
        body: `Landable bodies (rocky/icy planets and moons) can be landed on for surface surveying. Select a landable body (after FSS scanning), launch surface probes to map it, then choose LAND ON SURFACE to descend.

While on the surface you can deploy probes to discover biological, geological, and mineral signals. Use DEPART to return to orbit — your ship returns to orbit around the body you just left.`,
      },
    ],
  },
  {
    category: 'Exploration',
    icon: '🔭',
    entries: [
      {
        title: 'FSS System Scan',
        body: `The Full Spectrum Scanner (FSS) reveals all bodies in the current system at once. When you enter a new unscanned system, an FSS prompt appears in the center of the Orrery. Run the scan to populate the system map with every planet, moon, and signal.

FSS scanning is tracked as an achievement milestone on first use, and counts toward FSS scan count milestones.`,
      },
      {
        title: 'Detailed Body Scans',
        body: `After FSS reveals bodies, you can perform detailed scans on individual bodies from the Orrery. Select a body and tap SCAN BODY. Detailed scans determine the body's exact value and properties, including surface materials on landable bodies.

Scanned body data accumulates in your cartography cache until sold.`,
      },
      {
        title: 'Surface Mapping',
        body: `Map a body with surface probes to increase its scan value and reveal surface signals. Mapping is required to discover biological and geological sites.

Select a landable body, tap LAUNCH SURFACE PROBES, then LAND ON SURFACE to begin surveying. First mapping unlocks an achievement milestone.`,
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
        body: `To dock at a station, select it in the Orrery and choose DOCK (or TRAVEL & DOCK). Your ship flies to the station and docks automatically. Once docked, the Station and Market screens become available in the navigation bar.

Docking is required for: buying/selling commodities, purchasing ships, outfitting, refueling, repairing, and selling exploration data.`,
      },
      {
        title: 'Refueling',
        body: `Refuel at any station from the Station screen. Fuel cost is proportional to the amount needed. Your fuel capacity depends on your ship type and installed modules.

Fuel is consumed at 0.5 tons per light year jumped (halved to 0.25 T/LY when jumping from a neutron star). Plan your routes to avoid running dry!`,
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
        body: `The Market screen (available when docked) lists all commodities available at the current station. There are over 230 commodities across 13 categories: Minerals, Metals, Chemicals, Consumer Items, Foods, Industrial Materials, Medical, Technology, Salvage, Legal Drugs, Raw Materials, Textiles, and Weapons.

Prices fluctuate based on the station's economy type. Each commodity has a base price modified by supply and demand. Buy low in producing economies and sell high in consuming economies for maximum profit.

Some commodities are RESTRICTED (marked in red) — these can only be traded at stations in low-security or anarchy systems. Smuggling restricted goods into high-security systems carries risk but offers higher profit margins.

Your cargo capacity limits how much you can carry at once.`,
      },
      {
        title: 'Economy Types',
        body: `Stations have different economy types that determine what they produce and consume across 13 commodity categories:

• EXTRACTION — Produces minerals, metals, and raw materials. Consumes consumer goods, food, medical, and tech.
• REFINERY — Produces metals and chemicals. Consumes minerals, industrial goods, and food.
• INDUSTRIAL — Produces industrial materials, technology, chemicals, and textiles. Consumes metals, minerals, food, and consumer goods.
• AGRICULTURE — Produces foods, legal drugs, and textiles. Consumes industrial, tech, and medical goods.
• HIGH TECH — Produces technology, medical, and consumer goods. Consumes metals, chemicals, and industrial materials.
• SERVICE — Produces consumer goods and salvage. Consumes food, tech, and medical.
• MILITARY — Produces weapons, industrial, and tech. Consumes food, medical, consumer, and metals.
• COLONY — Produces food, salvage, and textiles. Consumes tech, medical, industrial, and consumer goods.
• TOURISM — Produces consumer goods and legal drugs. Consumes food and technology.

Matching buy/sell economies maximizes profit margins. The Trade Tools screen helps find the best routes automatically.`,
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
• The plotter searches expanding radii (up to 2,000 LY) to find the target.
• Routes are calculated using a greedy algorithm within your jump range.
• Neutron star boosts can supercharge your FSD for 4x jump range.
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
    ],
  },
  {
    category: 'Company & Income',
    icon: '💼',
    entries: [
      {
        title: 'Establishing a Company',
        body: `Register a trade company for 1,000,000 CR from the Company screen (Commerce > Company). This unlocks passive income mechanics — a stepping stone toward affording a fleet carrier (5 billion CR).

In Sandbox mode, company registration is free.

The company tracks your reputation level, which grows as you collect income. Higher reputation levels (up to level 10 — Elite II) provide up to +50% income bonus.`,
      },
      {
        title: 'Trade Contracts',
        body: `Assign your spare ships (from your fleet, not your active ship) to autonomous trade contracts. Each assigned ship earns passive income based on its cargo capacity and jump range:

• Income per hour = (cargo capacity × 50,000) + (jump range × 10,000)
• Reputation multiplier applies on top (up to +50%)

A Caravan Mk-VI (50 cargo, 15 jump) earns ~2.65M CR/hr.
A Roc (114 cargo, 18 jump) earns ~5.88M CR/hr.

Income accumulates over time even while you're exploring, mining, or doing other activities. Collect periodically from the Company screen. You can recall a ship from a contract at any time — it returns to your fleet at your current location.

Only ships in your owned fleet (not your active ship) can be assigned. Purchase additional ships at stations to build your contract fleet.`,
      },
      {
        title: 'Carrier Buy/Sell Orders',
        body: `Once you own a fleet carrier, you can set up to 5 buy or sell orders per carrier from the Company screen. Each active order generates 500,000 CR/hr in passive income.

REQUIREMENTS:
• The carrier's MARKET service must be enabled (toggle from the Carriers screen).
• Orders generate income only while the market service is active.

To set an order:
1. Select your carrier (if you have multiple).
2. Choose BUY or SELL.
3. Select a commodity from the 230+ available.
4. Confirm to add the order.

Income accumulates over time — collect periodically from the Company screen. Each carrier tracks its own income independently.`,
      },
      {
        title: 'Reputation System',
        body: `Your company reputation grows as you collect contract income:

• Every 100,000,000 CR collected raises your reputation by one level.
• Reputation levels: Rookie → Novice → Competent → Skilled → Professional → Expert → Master → Veteran → Elite → Elite I → Elite II.
• Each level provides +5% income bonus (max +50% at level 10).

Reputation is permanent — it never decreases. Higher reputation means faster progress toward your goals.`,
      },
      {
        title: 'Company Logo',
        body: `Give your company a custom logo using the Badge Maker. Design a badge, then use SET AS COMPANY LOGO from the Badge Maker screen. The logo appears on your Company screen alongside your company name.

See the Badge Maker section for full badge design instructions.`,
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
        body: `Step inside your fleet carrier and explore six interactive rooms (Fleet > Carrier Interior):

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
        body: `Design custom fleet carriers with the 3D Carrier Creator (Fleet > Carrier Yard). Uses the same builder interface as the Ship Yard but with carrier-scale parts.

• MOUNT SLOTS — Select structural slots (hull, superstructure, landing pads, towers, etc.).
• PART SELECTOR — Choose from carrier-scale parts unlocked by shipyard level.
• CUSTOMIZATION — Resize, move, and rotate each part on all three axes.
• STRUCTURAL CATEGORY — Visual-only decorative parts with high placement limits.

Save designs, share them via encoded share codes, and apply saved designs to your owned carriers. In Sandbox mode, all parts are unlocked.`,
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

DELIVERY, COURIER, PASSENGER, and COLONIZATION SUPPLY missions require you to be at the destination system to complete them — the COMPLETE button is disabled until you've jumped to the target system and docked at a station there. MINING and SALVAGE missions are local and can be completed at any station in the system where they were accepted.

Mission destination systems are marked with pulsing yellow indicators on both the Galaxy Map and within the System view when you arrive.

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

Asteroid belts appear in the Orrery as orbiting clusters of wireframe rocks. Valuable asteroids glow orange; common ones are brown.`,
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

Colony types vary based on the host body's environment (rocky, icy, terraformed, etc.).`,
      },
      {
        title: 'Colony Commodity Delivery',
        body: `Deliver specific commodities to colonies to boost happiness and infrastructure. Different commodity categories have varying impact:

• Technology and raw materials have the highest boost.
• Industrial goods provide strong infrastructure gains.
• Metals and chemicals provide moderate boosts.

Deliver from the Colonization screen while carrying compatible cargo. Establishing 3+ colonies is a requirement for building a Space Shipyard.`,
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
    category: 'Sol System & Cheats',
    icon: '☀️',
    entries: [
      {
        title: 'The Sol System',
        body: `Hidden somewhere in the galaxy is Sol — humanity's lost cradle. Unlike procedurally generated systems, Sol is a hand-crafted recreation of our real solar system, with all eight planets, their major moons, and Pluto.

Sol is not visible on the galaxy map by default. You must search for it by name using the Route Plotter (Commerce > Trade Tools > Route Plotter). In Commander mode, you must be within search range (2,000 LY). In Sandbox mode, you can teleport directly.

Finding Sol permanently unlocks the Cheats system and grants the "Homecoming" achievement.`,
      },
      {
        title: 'Cheats System',
        body: `Once you discover Sol, the Cheats screen (Commander > Cheats) becomes available. Each body in the Sol system grants a unique cheat:

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
  {
    category: 'Leaderboard',
    icon: '🏅',
    entries: [
      {
        title: 'Personal Exploration Records',
        body: `The Leaderboard screen (Commander > Leaderboard) tracks your personal exploration records across 13 categories:

• Hottest Planet / Coldest Planet (temperature in Kelvin)
• Fastest Orbit / Slowest Orbit (orbital period in days)
• Smallest Star / Largest Star (radius in solar radii)
• Most Moons (moon count of a single planet)
• Largest Planet / Smallest Planet (radius in Earth radii)
• Highest Gravity / Lowest Gravity (in g)
• Closest to Star / Farthest from Star (orbit radius in AU)

Records are set automatically when you scan bodies via the System view or FSS scanner. Each category shows the record value, the body name, and the system where it was found.

A progress bar shows how many of the 13 categories you've claimed.`,
      },
    ],
  },
  {
    category: 'Badge Maker',
    icon: '🎨',
    entries: [
      {
        title: 'Designing Badges',
        body: `The Badge Maker (Commander > Badge Maker) is a design tool for creating custom icons, logos, and flags with a live SVG preview.

Customize your badge with:
• SHAPE — Shield, Circle, Hexagon, Diamond, Square, or Pentagon.
• PATTERN — Solid, Split, Quartered, or Striped.
• COLORS — Primary and secondary colors from a palette.
• SYMBOL — 30+ symbols including star, rocket, planet, skull, anchor, crown, wings, sword, atom, comet, galaxy, plus animals, nature, and tech icons.
• BORDER — Multiple border styles.

The preview updates in real-time as you make changes.`,
      },
      {
        title: 'Using Badges',
        body: `Your designed badge can be used in several ways:

• SET AS PLAYER BADGE — Appears on your Commander Profile.
• SET AS COMPANY LOGO — Appears on your Company screen.
• SAVE TO GALLERY — Store designs for later use. Load, reuse, or delete them.

Your player badge is displayed prominently on your profile and represents your commander identity.`,
      },
      {
        title: 'Sharing Badges',
        body: `Share your badge designs with other players via encoded share codes:

• GENERATE SHARE CODE — Creates a compact encoded string representing your badge.
• COPY — Copy the code to your clipboard.
• IMPORT — Paste a received code to load someone else's badge into your editor.

Share codes work across different devices and save files. The badge format is verified on import — invalid codes are rejected with an error message.`,
      },
    ],
  },
  {
    category: 'Achievements',
    icon: '🏆',
    entries: [
      {
        title: 'Achievement System',
        body: `The Awards screen (Commander > Awards) tracks 130+ achievements across multiple categories:

• FIRST DISCOVERIES — First time scanning each body type (18 planet types, 9 star classes, 16 surface signals).
• MILESTONES — Key gameplay firsts (first jump, first scan, first colony, first shipyard, first bookmark, first carrier, first custom ship, Sol discovery, etc.).
• COUNT MILESTONES — Progression tracks for jumps (1–10,000), systems visited (10–5,000), bodies scanned (10–5,000), credits (1M–10B), ships purchased (1–25), colonies (1–10), carriers (1–5), light years traveled (1K–1M), mappings (10–500), FSS scans (10–500), bookmarks (5–50), surface discoveries (5–50), custom ships (1–10), and lifetime earnings (1M–10B).

Achievements persist with your save and provide long-term progression goals.`,
      },
      {
        title: 'Commander Profile',
        body: `The Profile screen (Commander > Profile) displays your commander's lifetime statistics:

• Total jumps
• Light years traveled
• Lifetime earnings
• Ships purchased
• Current ranks (Exploration, Trade, Mining)
• Active colonies and fleet carriers
• Player badge

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

All game text uses a monospace font with phosphor glow when CRT is active.`,
      },
      {
        title: 'Color Themes',
        body: `Choose from 8 CRT color themes:

• ELITE ORANGE — Classic burnt-orange on black.
• MATRIX GREEN — Green on black.
• AMBER — Warm amber on black.
• ICE BLUE — Cool cyan on black.
• CRIMSON — Red on black.
• VIOLET — Purple on black.
• MONOCHROME — Grayscale.
• SOL GOLD — Radiant gold (unlocked by the Saturn cheat).

Themes apply a hue-rotate filter to the entire interface for instant visual changes. The Sol Gold theme activates automatically when the "Lord of Rings" cheat is toggled on.`,
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
      {
        title: 'Save Stability & Migration',
        body: `Every time your save loads, the game runs a migration and validation pass to protect against crashes from legacy or partially-corrupted data:

• SCHEMA VERSIONING — Each save stores a version number. When the schema changes (new fields, renamed properties), the migration system runs version-specific fixes automatically on load. You never need to manually update your save.

• SHIP VALIDATION — The most common crash source on older saves was a missing or incomplete ship object. After loading, the game validates that your ship has all required properties (type, name, cargo, fuel, fuel capacity, cargo capacity, modules, integrity, module wear, cockpit decoration). Any missing or invalid field is filled in from defaults automatically.

• FIELD DEFAULTS — Every top-level state field is merged against defaults, so new features added in updates work immediately on old saves without resetting.

This means you can safely keep playing an old save across game updates — the system heals itself on load.`,
      },
      {
        title: 'Crash Recovery',
        body: `If a rendering error ever occurs (a bug, a data edge case, or a browser issue), the game is wrapped in an Error Boundary that catches the crash and shows a recovery screen instead of a blank white page.

The recovery screen offers two options:

• RETRY — Attempts to re-render the game without losing any save data. Try this first; many errors are transient.

• RESET SAVE — Clears the current save slot from local storage and reloads the page fresh. Use this only if RETRY doesn't work and you're willing to start over.

Your save data is never destroyed by a crash — it persists in localStorage regardless of what happens during rendering. The RESET SAVE button is the only way a crash recovery action touches your save, and it requires an explicit click.`,
      },
      {
        title: 'Sound & Music',
        body: `All sound effects and music are synthesized procedurally at runtime using the Web Audio API — no audio files are loaded.

• MASTER TOGGLE — Enable or disable all audio.
• SFX VOLUME — Controls UI clicks, scanner sweeps, hyperspace jumps, docking, weapons, mining, and alerts.
• MUSIC VOLUME — Controls the ambient background music independently from SFX.

Six music presets are available: Standard, Cinematic, Retro (chiptune), Minimal, Intense, and Ethereal. Each preset assigns a different procedural track to every game context (galaxy map, system orrery, station, combat, exploration, mining, hyperspace, menus).

Use the Per-Screen Track Customization panel to override any context's track with a specific procedural composition. Preview any track before assigning it.

Background music automatically switches to match your current screen — docking at a station plays a calm hum, entering combat shifts to tense rhythms, and jumping to hyperspace triggers a sweeping drone.`,
      },
    ],
  },
  {
    category: 'Combat & Piracy',
    icon: '⚔️',
    entries: [
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
        title: 'Fighter Hangar',
        body: `Class 3 and larger ships can equip a fighter hangar (1 slot for Class 3, 2 slots for Class 4). Build fighters from three types:

• Taipan — Balanced multirole (50K CR).
• GU-97 — Fast interceptor, fragile hull (80K CR).
• Trident — Heavy assault fighter (120K CR).

Assign a wingmate as pilot for full effectiveness, or run autonomous (reduced damage). Deployed fighters add extra attacks each combat round alongside wingmate support.`,
      },
      {
        title: 'Piracy & Interdiction',
        body: `In Low Security and Anarchy systems, scan for NPC traders and demand their cargo. Traders may comply (drop cargo) or fight back based on their compliance chance.

Combat resolution compares your ship's total combat power (damage + shield + hull) against the trader's. Win to seize all cargo; lose and take hull damage.

Piracy is a crime — each act increases your notoriety and bounty. Stolen cargo can be fenced at Black Markets in anarchy systems.`,
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
    ],
  },
  {
    category: 'Exploration Tools',
    icon: '🔭',
    entries: [
      {
        title: 'FSS Scanner',
        body: `The Full Spectrum Scanner lets you tune into four frequency bands (Low, Mid, High, Ultra) to discover all bodies in a system. Each band reveals the stellar/planetary bodies resonating at that frequency.

Tuning takes a moment per band. Completing all four bands registers a full system scan, boosting exploration data value and revealing all bodies on the orrery.

Access the FSS Scanner from the Explore menu while in a system.`,
      },
      {
        title: 'Exobiology Scanner',
        body: `When landed on a mapped body with biological signals, use the Exobiology scanner to collect genetic samples. Each species requires 3 samples to complete a full analysis.

Completed analyses pay out immediately (base value 10K–25K CR per species) and are recorded in your persistent species Codex. Track your discoveries across the galaxy.`,
      },
      {
        title: 'Discovery Database',
        body: `A living catalogue of everything you've encountered. Tracks:

• 12 stellar body types (O-class through White Dwarfs, Neutron Stars, Black Holes).
• 9 planet types (Rocky, Icy, Gas Giants, Earth-Like, Ammonia, Water Worlds, etc.).
• Special milestones (first Earth-Like, first Neutron Star, first Black Hole).
• Biological species from your exobiology Codex.

Completing categories unlocks cosmetic badges and progression bonuses. Access from the Commander menu.`,
      },
      {
        title: 'Cartography & Data Sale',
        body: `Universal Cartographics (station service) lets you review and sell exploration data. Data is grouped by galactic region (Core, Inner Sphere, Middle Regions, Outer Rim, Deep Space), with regional bonus multipliers — more distant data is worth more.

You can only sell data while docked at a station. First discoveries and mapped bodies both contribute to total payout.`,
      },
    ],
  },
  {
    category: 'Economy & Fleet',
    icon: '💼',
    entries: [
      {
        title: 'Material Trader',
        body: `Exchange raw materials at grade-based ratios. Materials are graded Common (G1), Standard (G2), Rare (G3), and Very Rare (G4).

Same-grade swaps cost 6:1. Upgrading to a higher grade costs more; downgrading yields more. The grade inventory summary at the top shows how many materials you own at each tier.

Access from station services. Use this to convert surplus materials into what you need for engineering and synthesis.`,
      },
      {
        title: 'Market Analysis AI',
        body: `An AI-powered trade advisory that generates in-character market reports for your current system. The report analyzes system security, population, and economy to recommend which commodity categories are in demand.

Also shows a price snapshot table with best buys (low variance) and best sells (high variance), plus percentage indicators for each commodity.

Access from the Commerce menu.`,
      },
      {
        title: 'Station Builder',
        body: `Build orbital stations at your colonies for 50M CR. Choose from 5 economy types (Agricultural, Industrial, Mining, High Tech, Refinery) — each has a different revenue multiplier.

Install services (Market, Outfitting, Shipyard, Refuel, Repair) to increase passive trade revenue. Revenue accumulates over time based on services and economy type. Collect anytime from the Station Builder screen.

Access from the Industry menu.`,
      },
      {
        title: 'Loadout Presets',
        body: `Save your current module configuration as a named preset (e.g., "Exploration Build", "Combat Build"). Apply presets instantly at stations to switch between roles without manual module swapping.

Presets are ship-type-specific — a preset saved for an Albatross won't work on a Roc. The summary shows module type counts per preset.

Access from the Fleet menu.`,
      },
      {
        title: 'Carrier Command Dashboard',
        body: `A unified management view for all fleet carriers. See tritium levels, pending revenue, active orders, docked ships, and service status for every carrier in one screen.

Collect all pending revenue, check docked ship rosters, and review which services are enabled — all without switching between individual carrier screens.

Access from the Fleet menu.`,
      },
      {
        title: 'Carrier Logistics',
        body: `Plan multi-jump routes for your fleet carrier using bookmarked systems as waypoints. The route planner calculates total tritium cost and distance across all jumps.

Execute jumps one at a time, with tritium automatically deducted per jump. The carrier stays at its current system until you execute the next jump.

Access from the Fleet menu.`,
      },
    ],
  },
  {
    category: 'Commander & Events',
    icon: '🎖️',
    entries: [
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
        title: 'Player Reputation',
        body: `Track your standing with five galactic factions (Federation, Empire, Alliance, Independent, Pirate Syndicates). Reputation ranges from -100 (Hostile) to +100 (Allied ★).

Donate credits to improve standing. High reputation unlocks better missions, station discounts, and exclusive services. Low reputation restricts docking access.

Betray the Pirate Syndicates to lose their favor — useful if you want to go straight.`,
      },
      {
        title: 'Player Titles',
        body: `Earn cosmetic titles from gameplay milestones — Starfarer (first jump), Trailblazer (10 systems), Trade Baron (100M earnings), World Discoverer (first Earth-Like), and many more.

Equip one title at a time to display alongside your commander name on leaderboards and in your profile. Titles are purely cosmetic with no mechanical impact.

Access from the Commander menu → Titles.`,
      },
      {
        title: 'Ship Maintenance & AFMU',
        body: `Modules degrade with use — jumps, combat, and neutron star exposure accumulate module wear (0–100%). At high wear, FSD range, shield strength, weapon damage, and speed are all reduced.

STATION REPAIR: Full module servicing at stations (cost scales with wear and ship class).

AFMU (Auto Field Maintenance Unit): Field repair using synthesis materials (5 Nickel, 3 Phosphorus, 2 Chromium). Reduces wear by 50% per use. Available anywhere — no station required.

Hull integrity (separate from module wear) also requires station repair or synthesis hull patches.`,
      },
      {
        title: 'Community Events',
        body: `Weekly rotating objectives with tiered rewards. Event types include trade deliveries, mining supply, exploration surveys, combat sweeps, and construction projects.

Each goal has a progress bar, a simulated leaderboard with NPC commanders, and reward tiers (Participant → Champion) that scale the payout. Contribute resources to fill the bar, then claim your reward.

Goals expire after 7 days. Access from the Commander menu → Community Goals.`,
      },
      {
        title: 'Cosmic Events',
        body: `Rare, time-limited phenomena that appear randomly when you scan for them:

• Supernova — Scan a dying star for huge exploration data (24h, 5M CR).
• Cometary Transit — Mine rare materials from a comet tail (12h, 2M CR).
• Alien Artifact — Investigate anomalous readings (48h, 10M CR).
• Pilgrim Fleet — Lucrative passenger missions (6h, 3M CR).
• Derelict Megaship — Salvage technology before it drifts away (18h, 4M CR).

Events appear in the GalNet feed and expire after their duration. Participate before the deadline to claim rewards.`,
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
    ],
  },
  {
    category: 'Public Holidays',
    icon: '🎉',
    entries: [
      {
        title: 'How Public Holidays Work',
        body: `Public Holidays are real-calendar seasonal events separate from Community Goals. They are tracked by real-life calendar dates — not in-game time — so every player experiences them simultaneously.

• ANNOUNCEMENT — 14 days before each holiday, a countdown begins. The event appears in the Status Header (next holiday countdown), StarNet News publishes advance warnings, and the Public Holidays screen (Commander > Public Holidays) shows the upcoming event.

• DURATION — Each holiday lasts exactly 7 days, giving all players adequate time to participate regardless of play schedule.

• PROFIT — Holidays offer extremely lucrative profit opportunities. Commodity sell prices can multiply by 2× to 10×, exploration data payouts can triple, colony income can double, and fuel costs can be halved — all depending on the specific holiday.

Plan ahead: stock up on the right commodities before the holiday starts, then sell during the event for maximum profit. The StarNet News feed and the Public Holidays screen tell you exactly what's coming and what to stockpile.`,
      },
      {
        title: 'Holiday Calendar',
        body: `Ten public holidays occur throughout the year:

🎆 GALACTIC NEW YEAR FESTIVAL — January 1–7
ALL commodities sell for 2× at every station.

🍾 THE BOOZE CRUISE — February 14–20
LEGAL DRUGS commodities sell for 10× normal price. The most profitable single-category event.

🏛️ FOUNDERS DAY (CORE WORLDS) — March 15–21
CONSUMER ITEMS and TECHNOLOGY sell for 5×.

📈 SPRING TRADE SUMMIT — April 20–26
ALL commodities sell for 3× at every station.

🔭 EXPLORERS WEEK — May 25–31
Exploration data sells for 3× at Universal Cartographics.

🌍 SOL REMEMBRANCE DAY — July 4–10
ALL commodities sell for 3× in solemn remembrance.

⛏️ MINERS WEEK — August 10–16
MINERALS, METALS, and RAW MATERIALS sell for 5×.

🌟 COLONIA FOUNDERS DAY — September 15–21
TECHNOLOGY and CONSUMER ITEMS sell for 5×.

⚡ NEUTRON HIGHWAY FESTIVAL — October 31–November 6
ALL commodities 2× + fuel consumption halved for all jumps.

🚀 FRONTIER DAY — December 1–7
ALL commodities 2× + colony passive income doubled.`,
      },
      {
        title: 'The Booze Cruise',
        body: `The most legendary event in the galaxy. Every February 14th, the Booze Cruise transforms known space into a week-long floating festival.

Carrier fleets convert into party barges. Stations host dockside celebrations. And the demand for legal drugs — wine, beer, spirits, tobacco, recreational substances — reaches absurd heights, with sell prices hitting 10× the standard rate.

Savvy commanders begin stockpiling legal drug commodities the moment the 2-week countdown appears in StarNet News. They clear cargo holds, buy out every legal drugs market they can find, and wait for kickoff. When the festival begins, they sell everything for astronomical profit.

A single cargo hold of spirits purchased at normal prices can yield tens of millions in profit during the Booze Cruise. It is, quite simply, the single most profitable week of the year for a prepared trader.`,
      },
      {
        title: 'Holiday Profit Strategies',
        body: `MAXIMIZE YOUR EARNINGS during public holidays:

• STOCKPILE EARLY — When the 14-day countdown appears, start buying the boosted commodity categories. Purchase at producing economies (Extraction for minerals, Agriculture for foods, etc.) for the lowest buy prices.

• SELL DURING THE EVENT — Wait until the holiday is active, then sell at consuming economies (High Tech, Industrial, Service) for the maximum multiplied sell price.

• ALL-CATEGORY HOLIDAYS — During Galactic New Year (2×), Spring Trade Summit (3×), Sol Remembrance (3×), and Frontier Day (2×), every commodity is boosted. Fill your cargo with the highest base-price commodities you can afford.

• SPECIAL HOLIDAYS — Explorers Week triples exploration data. Save your scans and sell during this week. Neutron Highway Festival halves fuel costs — perfect for long-range exploration trips. Frontier Day doubles colony income — collect during this week for double payouts.

• ROUTE PLANNING — Use the 14-day countdown to plan your route. If you're far from civilization, start heading back to populated space before the holiday begins.

Check Commander > Public Holidays at any time to see what's active, what's upcoming, and the full annual calendar.`,
      },
    ],
  },
  {
    category: 'Game Overview',
    icon: '📖',
    entries: [
      {
        title: 'Dogstar Interstellar — Feature List',
        body: `A procedurally generated, menu-driven 90s-retro space simulation featuring galaxy exploration, trading, and fleet management.

🗺️ GALAXY & EXPLORATION
• 4,000,000,000+ procedurally generated star systems
• Full 3D interactive galaxy map with rotation, zoom, pan, and filtering
• Spiral arm galaxy structure with realistic star density
• 13 star classes (O, B, A, F, G, K, M, L, T, Neutron Star, White Dwarf, Black Hole, Red Giant)
• Populated "bubble" starting region (The Core Worlds) with 200 LY radius
• Landmark systems: Cradle's End (galactic core hub), Vagrant's Horizon (rim outpost), Sol (hidden easter egg)
• Neutron star highway with 4× FSD boost for long-range jumping
• Real-time 3D system orrery with orbiting planets, moons, and stations
• Full Spectrum Scanner (FSS) with 4-band frequency tuning
• Detailed body scanning with 18 planet types and 9 star classes
• Surface mapping with probe deployment
• Planetary landings and surface surveying (biological, geological, mineral signals)
• Exobiology scanner with genetic sample collection
• Universal Cartographics with 20 LY travel requirement and regional bonus multipliers
• Discovery database tracking 12 stellar types, 9 planet types, and biological species
• Personal exploration leaderboard with 13 record categories
• Flight trail visualization on galaxy map
• Bookmark system for saving favorite systems
• Route plotter with multi-jump pathfinding and neutron star routing
• 3D coordinate grid with readouts on galaxy map

🏪 TRADING & ECONOMY
• 230+ commodities across 13 categories
• 9 economy types (Extraction, Refinery, Industrial, Agriculture, High Tech, Service, Military, Colony, Tourism)
• Dynamic market prices with supply/demand, economy modifiers, and jump-cycle fluctuations
• Restricted commodities (black market smuggling in anarchy systems)
• Trade route finder with profit-per-light-year ranking (Inara-style)
• Route plotter with neutron star highway support (Spansh-style)
• AI-powered market analysis with in-character reports
• Dynamic economy with price trends and market cycles
• 10 real-calendar public holidays with 2×–10× profit multipliers

📋 MISSIONS & OBJECTIVES
• 7 mission types (Delivery, Courier, Mining, Passenger, Salvage, Exploration, Colonization Supply)
• 4 mission chains with branching narratives (The Lost Surveyor, Trade War, Pirate King Takedown, The Alien Artifact)
• Mission destination markers on galaxy map and system view
• Weekly community goals with tiered rewards and NPC leaderboards
• 5 cosmic event types (Supernova, Cometary Transit, Alien Artifact, Pilgrim Fleet, Derelict Megaship)

🚢 SHIP MANAGEMENT
• 30+ ship models from 6 manufacturers
• Ship classes 1–6 (small fighter to huge transport)
• Full outfitting system: core modules, optional internal, utility mounts, hardpoints
• 5 outfitting tiers with engineering modifications
• Module wear & degradation system with AFMU field repairs
• Loadout preset saving and instant swapping
• 3D custom ship builder with snappable low-poly parts
• Ship yard infrastructure with 6 unlock levels
• Blueprint saving and encoded share codes for ship designs
• Fleet management with ship storage, transfer, and switching
• Fighter hangar with 3 fighter types and wingmate pilots

⚓ FLEET CARRIERS
• Purchase carriers (5 billion CR) at high-population systems
• Up to 5 carriers per commander
• Tritium-based jumping (500 LY range)
• Toggleable services: Market, Shipyard, Outfitting, Refuel, Repair
• 6-room carrier interior: Bar, Quarters, Garden, Trophy Room, Command Deck, Observation Lounge
• Carrier buy/sell orders for passive income
• 3D custom carrier builder with carrier-scale parts
• Carrier command dashboard for multi-carrier management
• Carrier logistics with multi-jump route planning using bookmarks

🌱 COLONIZATION & INDUSTRY
• Colonize habitable bodies with 5 station tiers (Outpost to Dodec Station)
• 5 colony specializations (Agricultural, Industrial, Research, Mining, Mixed)
• 5 development stages (Outpost to Metropolis)
• Colony commodity delivery for infrastructure and happiness boosts
• Passive credit income from colonies (collect periodically)
• Special features at higher tiers: Market, Outfitting, Material Trader, Engineer
• Station builder — construct orbital stations at colonies with 5 economy types
• Custom station creator with 3D builder
• Warp gate network construction and management

⛏️ MINING & MATERIALS
• Asteroid belt and planetary surface mining
• Refinery with raw material processing
• Ship locker for raw and manufactured materials
• Material trader with grade-based exchange ratios
• Synthesis system for ammo, limpets, and hull patches
• Mining sites (RES) with prospector and collector gameplay

⚔️ COMBAT & PIRACY
• Turn-based ship combat with damage, shield, and hull mechanics
• Multi-crew system: Pilot, Gunner, Shield Operator, Engineer with unique abilities
• Fighter hangar with 3 fighter types (Taipan, GU-97, Trident)
• Piracy & interdiction in low-security/anarchy systems
• Black market fencing for stolen cargo
• Bounty board with combat contracts
• Conflict zones with faction warfare
• Wingmate system with hired NPC wingmen
• Notoriety and bounty system

🎖️ COMMANDER PROGRESSION
• 3 rank tracks: Exploration (14 tiers), Trade, Mining
• 130+ achievements across first discoveries, milestones, and count progression
• Player titles earned from gameplay milestones
• Commander profile with lifetime statistics
• Power Play — pledge to 1 of 6 galactic powers for passive bonuses
• Crew progression — hire and train crew with 5 levels
• Player reputation with 5 factions (Federation, Empire, Alliance, Independent, Pirate Syndicates)
• Background Simulation — faction influence, states (Boom, Bust, War, Expansion, Retreat)
• Badge maker with custom SVG designs and share codes
• Company system with trade contracts and passive income
• Player-owned station revenue

🎨 CUSTOMIZATION & DISPLAY
• 8 CRT color themes (Elite Orange, Matrix Green, Amber, Ice Blue, Crimson, Violet, Monochrome, Sol Gold)
• Adjustable CRT effects: scanlines, glow, flicker, vignette
• Text brightness control (10%–200%)
• Mini screen mode for compact displays (Moto Razr 50)
• Procedural Web Audio API sound engine — all SFX and music synthesized at runtime
• 6 music presets (Standard, Cinematic, Retro, Minimal, Intense, Ethereal)
• Per-screen track customization
• Screen-aware background music
• Cabin decoration system with customizable cockpit
• Room manager for carrier interior rooms
• Virtual garden with plantable flora
• Aquarium system
• Genetics lab

⚙️ TECHNICAL FEATURES
• Persistent game state via localStorage
• Save migration with versioning and automatic field population
• Error boundary with crash recovery (Retry / Reset Save)
• Two save modes: Commander (standard) and Sandbox (unrestricted)
• Save import/export via JSON
• Deterministic procedural generation with seeded PRNG
• Real-calendar public holiday system with 2-week countdowns
• No dead ends — every screen reachable from every other
• Responsive design (mobile + desktop)
• CRT retro aesthetic with burnt-orange-on-black styling`,
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