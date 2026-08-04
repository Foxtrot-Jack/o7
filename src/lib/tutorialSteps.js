// Tutorial definitions — multiple categories, each with steps that highlight menu
// elements. Each category has a trigger that fires when a relevant milestone is
// reached (first colony, first carrier, etc.). Tutorials auto-play once, are
// always skippable, and can be replayed from the Codex Tutorials category.
//
// target: { tab, folder?, item? } — NavBar auto-opens the tab/folder and pulses
// the matching item (or the tab itself if no item is specified).
// trigger: (state, prevState) => boolean — fires when the milestone is newly met.
//   prevState is the state before the latest update; null on first render.

const starterSteps = [
  {
    id: 'welcome',
    title: 'Welcome, Commander',
    text: 'o7 is a menu-driven space simulation. Everything — travel, trading, outfitting — is done through on-screen menus. No flight stick required. This quick tutorial covers the essentials. You can replay it anytime from the footer TUTORIAL button or the Codex.',
    target: null,
  },
  {
    id: 'tabs',
    title: 'The Six Menu Tabs',
    text: 'The top bar holds six tabs. Internal: your ship, modules, and navigation. External: deployed craft, squadron, and field ops. Cons: station services, missions, and trade. Role: your commander identity and progress. Misc: colonization, carriers, and extras. Settings: display and controls. Tap a tab to open its folder list.',
    target: { tab: 'internal' },
  },
  {
    id: 'galaxy',
    title: 'Galaxy Map',
    text: 'Open Internal > Navigation > Galaxy Map to view the galaxy. Tap any star to select it, then plot a route — your ship jumps system to system. Fuel and jump range are checked automatically before each jump.',
    target: { tab: 'internal', folder: 'Navigation', item: 'galaxy' },
  },
  {
    id: 'system',
    title: 'System View',
    text: 'The System view shows planets and stations orbiting in real time. Drag to rotate, pinch or scroll to zoom. Tap any body to select it, then use Travel To Body to move your ship. Undiscovered bodies appear after running an FSS scan.',
    target: { tab: 'internal', folder: 'Navigation', item: 'system' },
  },
  {
    id: 'fss',
    title: 'FSS Scanner',
    text: 'When you arrive in a new system, run the FSS Scanner (External > Scanning) to discover all stellar bodies. Scanned bodies can be mapped with surface probes for bonus credits, sold at Cartographics.',
    target: { tab: 'external', folder: 'Scanning', item: 'fss' },
  },
  {
    id: 'dock',
    title: 'Docking',
    text: 'To dock, open Cons > Station Services while in the System view. Tap a station in the Available Stations panel and press DOCK. Your ship travels and docks automatically. Station services — refuel, repair, market, outfitting — are only available while docked.',
    target: { tab: 'cons', item: 'station' },
  },
  {
    id: 'station',
    title: 'Station Services',
    text: 'While docked, the Station screen offers Refuel, Repair, and Refit at the top, with all starport services below. Use the SAVE button in the footer to persist your progress at any time.',
    target: null,
  },
  {
    id: 'outfitting',
    title: 'Outfitting',
    text: 'Open Internal > Modules > Outfitting to buy and equip modules. Browse by category — Core Internals, Optional Internals, Hardpoints, and Utility. Each slot accepts a specific size. Purchase with credits; sell your old module for a partial refund.',
    target: { tab: 'internal', folder: 'Modules', item: 'outfitting' },
  },
  {
    id: 'fuelscoop',
    title: 'Buying a Fuel Scoop',
    text: 'In Outfitting, select an empty Optional Internal slot and browse to the Fuel Scoop category. Buy one that fits your slot size. A fuel scoop lets you refuel from suitable stars for free — essential for long-range exploration and saving credits on fuel.',
    target: { tab: 'internal', folder: 'Modules', item: 'outfitting' },
  },
  {
    id: 'scoop',
    title: 'Fuel Scooping',
    text: 'In the System view, travel near a scoopable star (O, B, A, F, G, K, or M class). When in orbit, a Fuel Scoop panel appears in the body info. Press Start Fuel Scooping to refill your tank. Stop when the tank is full to avoid overheating.',
    target: { tab: 'internal', folder: 'Navigation', item: 'system' },
  },
  {
    id: 'missions',
    title: 'Missions',
    text: 'Earn credits by accepting missions from Cons > Missions while docked. Missions ask you to deliver cargo, collect bounties, or transport passengers. Higher reputation and rank unlock better-paying missions.',
    target: { tab: 'cons', folder: 'Missions', item: 'missions' },
  },
  {
    id: 'market',
    title: 'Trading',
    text: 'Buy low and sell high at Cons > Trade > Market. Each station prices commodities differently based on its economy type. Use Market Analysis to find profitable trade routes in nearby systems.',
    target: { tab: 'cons', folder: 'Trade', item: 'market' },
  },
  {
    id: 'settings',
    title: 'Settings',
    text: 'Customize your experience in the Settings tab — CRT effects, color themes, monochrome mode, fonts, audio, controls, and save management. Mini-screen mode and orientation locks help on mobile devices.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'done',
    title: 'Fly Safe, Commander',
    text: 'You are ready to explore the galaxy. Plot a route, scan some systems, trade some cargo, and build your fortune. The universe has roughly four billion stars waiting. Tap the TUTORIAL button in the footer or open the Codex Tutorials category anytime to replay this or any other guide.',
    target: null,
  },
];

const colonizationSteps = [
  {
    id: 'col-welcome',
    title: 'Colonization Unlocked',
    text: 'You have established your first colony. Colonies are permanent settlements on habitable planets that generate passive income and extend your influence across the galaxy. This guide covers how they work and how to grow them.',
    target: null,
  },
  {
    id: 'col-screen',
    title: 'Colonies Screen',
    text: 'Open Misc > Colonization > Colonies to see all your colonies. Each colony tracks population, infrastructure level, income per cycle, and loyalty. Select a colony to view its details and issue orders — invest credits to upgrade infrastructure, boosting population growth and tax revenue.',
    target: { tab: 'misc', folder: 'Colonization', item: 'colonization' },
  },
  {
    id: 'col-system',
    title: 'Colonies in the System View',
    text: 'Colonies you own appear in the System view celestial body list under their parent planet. Select a colony from the list to open its management panel, where you can travel to it, invest, or view its current status. The colony icon pulses next to its parent body.',
    target: { tab: 'internal', folder: 'Navigation', item: 'system' },
  },
  {
    id: 'col-stationbuilder',
    title: 'Station Builder',
    text: 'Open Misc > Colonization > Station Builder to construct your own stations. Personal stations generate trade revenue, provide docking services, and act as forward bases. Building a station requires credits and materials — the cost scales with the station size and service count.',
    target: { tab: 'misc', folder: 'Colonization', item: 'stationbuilder' },
  },
  {
    id: 'col-stationcreator',
    title: 'Station Creator',
    text: 'For full control, open Misc > Colonization > Station Creator. Design a custom station from modular parts — choose the hull type, module layout, and service configuration. Custom stations can be placed in any system where you hold a colony or an anchor claim.',
    target: { tab: 'misc', folder: 'Colonization', item: 'stationcreator' },
  },
  {
    id: 'col-economy',
    title: 'Colony Economy',
    text: 'Colonies generate credits each cycle based on population and infrastructure level. Higher infrastructure attracts more population and unlocks new revenue streams. Keep loyalty high by investing regularly — neglected colonies may stagnate. Colonies also produce materials and commodities you can collect.',
    target: null,
  },
  {
    id: 'col-done',
    title: 'Build Your Empire',
    text: 'Colonies are the foundation of a lasting interstellar empire. Expand to multiple systems, build stations to support trade routes, and watch your passive income grow. Open the Codex Tutorials category anytime to replay this guide.',
    target: null,
  },
];

const carrierSteps = [
  {
    id: 'car-welcome',
    title: 'Fleet Carrier Acquired',
    text: 'You now own a Fleet Carrier — a mobile capital ship that serves as your personal starport. Carriers can jump between systems, store ships and cargo, offer services to other commanders, and project power across the galaxy. This guide covers carrier operations.',
    target: null,
  },
  {
    id: 'car-screen',
    title: 'Fleet Carriers Screen',
    text: 'Open Misc > Carriers > Fleet Carriers to see all your carriers. Each carrier shows its name, current system, tritium reserves, and cargo usage. Select a carrier to view its full status and access carrier-specific actions. Carriers deployed in your current system appear orbiting in the System view.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriers' },
  },
  {
    id: 'car-logistics',
    title: 'Carrier Logistics',
    text: 'Open Misc > Carriers > Carrier Logistics to manage your carrier operations. Here you load and unload tritium fuel — the carrier consumes tritium for each jump. You also manage cargo holds, set carrier service tariffs, and order resupply. Without tritium, a carrier cannot jump.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carrierlogistics' },
  },
  {
    id: 'car-command',
    title: 'Carrier Command',
    text: 'Open Misc > Carriers > Carrier Command to schedule jumps. Select a destination system and set a departure time — carriers jump on a timer, not instantly. You can queue jumps, set the carrier to hold position, or recall it. Plan routes carefully; tritium is expensive and jumps are not free.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriercommand' },
  },
  {
    id: 'car-interior',
    title: 'Carrier Interior',
    text: 'Open Misc > Carriers > Carrier Interior to customize your carrier from the inside out. Build and furnish rooms — crew quarters, aquariums, gardens, genetics labs — each providing bonuses or cosmetic flair. The interior is where your crew lives and where you can host passengers and VIPs.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carrierinterior' },
  },
  {
    id: 'car-creator',
    title: 'Carrier Yard',
    text: 'Open Misc > Carriers > Carrier Yard to design and build additional carriers. Custom carriers are assembled from modular parts — hull, drive, superstructure, and interior modules. Each part affects jump range, tritium capacity, and service slots. Building a carrier is a major investment, so plan your design carefully.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriercreator' },
  },
  {
    id: 'car-tritium',
    title: 'Tritium Fuel',
    text: 'Carriers run on tritium, not standard ship fuel. Buy tritium at commodity markets or refine it from mined materials. Each jump consumes tritium proportional to the distance — a carrier stranded without fuel is a costly mistake. Keep reserves topped up via Carrier Logistics before long routes.',
    target: { tab: 'cons', folder: 'Trade', item: 'market' },
  },
  {
    id: 'car-done',
    title: 'Project Power',
    text: 'Fleet carriers turn a single commander into a mobile force. Use them as trading hubs, exploration motherships, or forward operating bases. Keep the tritium flowing, the crew happy, and the jumps scheduled. Open the Codex Tutorials category to replay this guide.',
    target: null,
  },
];

const guildedSteps = [
  {
    id: 'gui-welcome',
    title: 'Guilded Carrier Achieved',
    text: 'Your carrier has been elevated to Guilded status. Guilded carriers are the backbone of player-run guilds — they can recruit members, share resources, coordinate fleet operations, and project collective power across multiple systems. This guide covers guild carrier operations.',
    target: null,
  },
  {
    id: 'gui-what',
    title: 'What Is a Guilded Carrier?',
    text: 'A Guilded carrier is a fleet carrier registered as a guild flagship. It serves as the guild hub — members dock to share cargo, coordinate missions, and pool resources. The guilded carrier appears larger in the System view and carries the guild banner. Only one carrier per player can be guilded at a time.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriers' },
  },
  {
    id: 'gui-command',
    title: 'Guild Commands',
    text: 'Open Misc > Carriers > Carrier Command to access guild-specific orders. As the guild flagship owner, you can broadcast jump schedules to all members, set shared cargo access, and designate squadron wingmates from the guild roster. Guild jumps coordinate all member ships traveling with the carrier.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriercommand' },
  },
  {
    id: 'gui-logistics',
    title: 'Shared Logistics',
    text: 'Guilded carriers have expanded cargo and tritium capacity. Use Misc > Carriers > Carrier Logistics to manage the shared hold — guild members can deposit and withdraw resources. Set tariffs for non-members to generate guild income. Tritium contributions from members keep the carrier fueled without personal cost.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carrierlogistics' },
  },
  {
    id: 'gui-squadron',
    title: 'Guild Squadron',
    text: 'Guild members can join your squadron via External > Squadron. Wingmates assigned to the guild carrier provide combat, mining, and trade bonuses. A full guild squadron multiplies your effectiveness in conflict zones, mining sites, and trade runs.',
    target: { tab: 'external', folder: 'Squadron', item: 'wingmates' },
  },
  {
    id: 'gui-done',
    title: 'Lead Your Guild',
    text: 'A guilded carrier is more than a ship — it is a community. Recruit commanders, coordinate operations, and build a name across the galaxy. Manage your guild well and it will sustain you; neglect it and members will drift away. Replay this guide anytime from the Codex Tutorials category.',
    target: null,
  },
];

const stationBuilderSteps = [
  {
    id: 'sb-welcome',
    title: 'Station Constructed',
    text: 'You have built your first personal station. Owned stations generate trade revenue, provide docking and outfitting services, and serve as permanent bases in systems you control. This guide covers station management.',
    target: null,
  },
  {
    id: 'sb-builder',
    title: 'Station Builder',
    text: 'Open Misc > Colonization > Station Builder to construct additional stations. Choose a station type, select services (market, refuel, repair, outfitting), and place it in a system where you hold a colony. Each service adds revenue but increases the build cost and upkeep.',
    target: { tab: 'misc', folder: 'Colonization', item: 'stationbuilder' },
  },
  {
    id: 'sb-creator',
    title: 'Station Creator',
    text: 'For custom designs, open Misc > Colonization > Station Creator. Assemble a station from modular parts — hull type, docking bays, service modules, and defense systems. Custom stations can match your exact needs, from a minimal refuel outpost to a full-service starport.',
    target: { tab: 'misc', folder: 'Colonization', item: 'stationcreator' },
  },
  {
    id: 'sb-revenue',
    title: 'Station Revenue',
    text: 'Owned stations generate credits each cycle based on their services, the system economy, and local traffic. Stations in high-traffic systems with full services earn the most. Monitor revenue from the station management panel and reinvest in upgrades to maximize income.',
    target: null,
  },
  {
    id: 'sb-system',
    title: 'Stations in the System View',
    text: 'Your owned stations appear in the System view celestial body list and on the orrery. Select one to travel to it, dock, or manage its services. Stations you own are marked distinctly from NPC stations so you can find them at a glance.',
    target: { tab: 'internal', folder: 'Navigation', item: 'system' },
  },
  {
    id: 'sb-done',
    title: 'Build Your Network',
    text: 'A network of personal stations gives you refuel stops, trade income, and strategic control across the galaxy. Place them along trade routes, near resource-rich systems, or at the frontier of your expansion. Replay this guide anytime from the Codex.',
    target: null,
  },
];

const customShipSteps = [
  {
    id: 'cs-welcome',
    title: 'Custom Ship Built',
    text: 'You are now flying a custom-built ship. Custom ships are assembled from individual parts — hull, cockpit, internals, hardpoints — letting you create a vessel tailored to your exact playstyle. This guide covers custom ship operations.',
    target: null,
  },
  {
    id: 'cs-yard',
    title: 'Ship Yard',
    text: 'Open Internal > Ship > Ship Yard to design and build ships. Select a hull class, then add a cockpit, internal modules, hardpoints, and utility mounts. Each part affects mass, jump range, speed, armor, and shield. The live stat readout updates as you build so you can balance your design.',
    target: { tab: 'internal', folder: 'Ship', item: 'shipcreator' },
  },
  {
    id: 'cs-building',
    title: 'Building Process',
    text: 'Custom ships require credits and materials to build. Once assembled, the ship appears in your stored fleet. Switch to it from the Ship panel (Internal > Ship) while docked. Your previous ship goes into storage — you can switch back any time at no cost.',
    target: { tab: 'internal', folder: 'Ship', item: 'ship' },
  },
  {
    id: 'cs-flying',
    title: 'Flying Custom Ships',
    text: 'A custom ship flies like any other — it appears in the System view and on the galaxy map. Its stats reflect the parts you chose. Outfit it like any ship at a station. If destroyed, the rebuy cost is based on the total parts value, so insure wisely.',
    target: { tab: 'internal', folder: 'Navigation', item: 'system' },
  },
  {
    id: 'cs-done',
    title: 'Fly Your Dream Ship',
    text: 'Custom ships are the ultimate expression of a commander style — a heavy-armored miner, a stripped-down racer, a long-range explorer. Experiment with designs, save loadout presets (Internal > Ship > Loadout Presets), and find the ship that fits you. Replay this guide anytime from the Codex.',
    target: { tab: 'internal', folder: 'Ship', item: 'presets' },
  },
];

export const TUTORIAL_CATEGORIES = {
  starter: {
    id: 'starter',
    name: 'New Commander Basics',
    icon: '🎓',
    desc: 'The essentials: navigation, docking, outfitting, fuel scooping, missions, and trading.',
    steps: starterSteps,
    trigger: (state, prev) => !state.settings?.tutorialsSeen?.starter && (state.totalJumps ?? 0) === 0,
  },
  colonization: {
    id: 'colonization',
    name: 'Colonization',
    icon: '🚀',
    desc: 'Establishing and managing your first colony, plus station construction.',
    steps: colonizationSteps,
    trigger: (state, prev) => (state.colonies?.length ?? 0) > 0 && (prev?.colonies?.length ?? 0) === 0,
  },
  carrier: {
    id: 'carrier',
    name: 'Fleet Carriers',
    icon: '⚓',
    desc: 'Operating your first fleet carrier — tritium, jumps, logistics, and interiors.',
    steps: carrierSteps,
    trigger: (state, prev) => (state.fleetCarriers?.length ?? 0) > 0 && (prev?.fleetCarriers?.length ?? 0) === 0,
  },
  guilded: {
    id: 'guilded',
    name: 'Guilded Carriers',
    icon: '⚜️',
    desc: 'Running a guild flagship — shared logistics, squadron coordination, and guild commands.',
    steps: guildedSteps,
    trigger: (state, prev) =>
      (state.fleetCarriers || []).some(c => c.isGuilded) &&
      !(prev?.fleetCarriers || []).some(c => c.isGuilded),
  },
  stationbuilder: {
    id: 'stationbuilder',
    name: 'Station Building',
    icon: '🏗️',
    desc: 'Constructing and managing your first personal station.',
    steps: stationBuilderSteps,
    trigger: (state, prev) => (state.ownedStations?.length ?? 0) > 0 && (prev?.ownedStations?.length ?? 0) === 0,
  },
  customship: {
    id: 'customship',
    name: 'Custom Ships',
    icon: '🛠️',
    desc: 'Designing, building, and flying your own custom ship.',
    steps: customShipSteps,
    trigger: (state, prev) =>
      state.ship?.type === 'custom' && prev?.ship?.type !== 'custom',
  },
};

export const TUTORIAL_CATEGORY_LIST = Object.values(TUTORIAL_CATEGORIES);