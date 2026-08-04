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
    text: 'The top bar holds six tabs. [[internal]]: your ship, modules, and navigation. [[external]]: deployed craft, squadron, and field ops. [[cons]]: station services, missions, and trade. [[role]]: your commander identity and progress. [[misc]]: colonization, carriers, and extras. [[settings]]: display and controls. Tap a tab to open its folder list.',
    target: { tab: 'internal' },
  },
  {
    id: 'galaxy',
    title: 'Galaxy Map',
    text: 'Open [[internal]] > Navigation > Galaxy Map to view the galaxy. Tap any star to select it, then plot a route — your ship jumps system to system. Fuel and jump range are checked automatically before each jump.',
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
    text: 'When you arrive in a new system, run the FSS Scanner ([[external]] > Scanning) to discover all stellar bodies. Scanned bodies can be mapped with surface probes for bonus credits, sold at Cartographics.',
    target: { tab: 'external', folder: 'Scanning', item: 'fss' },
  },
  {
    id: 'dock',
    title: 'Docking',
    text: 'To dock, open [[cons]] > Station Services while in the System view. Tap a station in the Available Stations panel and press DOCK. Your ship travels and docks automatically. Station services — refuel, repair, market, outfitting — are only available while docked.',
    target: { tab: 'cons', item: 'station' },
  },
  {
    id: 'station',
    title: 'Station Services',
    text: 'While docked, the Station screen offers Refuel, Repair, and Refit at the top, with all starport services below. Use the SAVE button in the footer to persist your progress at any time.',
    target: null,
  },
  {
    id: 'dockcam',
    title: 'Dock Camera',
    text: 'Open [[cons]] > Station Services > Dock Camera to watch live starport traffic. Inbound ships circle a holding pattern above the deck, then descend onto numbered pads. Each ship is drawn as a manufacturer-specific silhouette scaled by its class. Tap any ship to identify the pilot and activity — founder-piloted ships glow green.',
    target: { tab: 'cons', item: 'dockcam' },
  },
  {
    id: 'outfitting',
    title: 'Outfitting',
    text: 'Open [[internal]] > Modules > Outfitting to buy and equip modules. Browse by category — Core Internals, Optional Internals, Hardpoints, and Utility. Each slot accepts a specific size. Purchase with credits; sell your old module for a partial refund.',
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
    text: 'Earn credits by accepting missions from [[cons]] > Missions while docked. Missions ask you to deliver cargo, collect bounties, or transport passengers. Higher reputation and rank unlock better-paying missions.',
    target: { tab: 'cons', folder: 'Missions', item: 'missions' },
  },
  {
    id: 'market',
    title: 'Trading',
    text: 'Buy low and sell high at [[cons]] > Trade > Market. Each station prices commodities differently based on its economy type. Use Market Analysis to find profitable trade routes in nearby systems.',
    target: { tab: 'cons', folder: 'Trade', item: 'market' },
  },
  {
    id: 'settings',
    title: 'Settings',
    text: 'Customize your experience in the [[settings]] tab — CRT effects, color themes, monochrome mode, fonts, audio, controls, and save management. Mini-screen mode and orientation locks help on mobile devices.',
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
    text: 'Open [[misc]] > Colonization > Colonies to see all your colonies. Each colony tracks population, infrastructure level, income per cycle, and loyalty. Select a colony to view its details and issue orders — invest credits to upgrade infrastructure, boosting population growth and tax revenue.',
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
    text: 'Open [[misc]] > Colonization > Station Builder to construct your own stations. Personal stations generate trade revenue, provide docking services, and act as forward bases. Building a station requires credits and materials — the cost scales with the station size and service count.',
    target: { tab: 'misc', folder: 'Colonization', item: 'stationbuilder' },
  },
  {
    id: 'col-stationcreator',
    title: 'Station Creator',
    text: 'For full control, open [[misc]] > Colonization > Station Creator. Design a custom station from modular parts — choose the hull type, module layout, and service configuration. Custom stations can be placed in any system where you hold a colony or an anchor claim.',
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
    text: 'Open [[misc]] > Carriers > Fleet Carriers to see all your carriers. Each carrier shows its name, current system, tritium reserves, and cargo usage. Select a carrier to view its full status and access carrier-specific actions. Carriers deployed in your current system appear orbiting in the System view.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriers' },
  },
  {
    id: 'car-logistics',
    title: 'Carrier Logistics',
    text: 'Open [[misc]] > Carriers > Carrier Logistics to manage your carrier operations. Here you load and unload tritium fuel — the carrier consumes tritium for each jump. You also manage cargo holds, set carrier service tariffs, and order resupply. Without tritium, a carrier cannot jump.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carrierlogistics' },
  },
  {
    id: 'car-command',
    title: 'Carrier Command',
    text: 'Open [[misc]] > Carriers > Carrier Command to schedule jumps. Select a destination system and set a departure time — carriers jump on a timer, not instantly. You can queue jumps, set the carrier to hold position, or recall it. Plan routes carefully; tritium is expensive and jumps are not free.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriercommand' },
  },
  {
    id: 'car-interior',
    title: 'Carrier Interior',
    text: 'Open [[misc]] > Carriers > Carrier Interior to customize your carrier from the inside out. Build and furnish rooms — crew quarters, aquariums, gardens, genetics labs — each providing bonuses or cosmetic flair. The interior is where your crew lives and where you can host passengers and VIPs.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carrierinterior' },
  },
  {
    id: 'car-creator',
    title: 'Carrier Yard',
    text: 'Open [[misc]] > Carriers > Carrier Yard to design and build additional carriers. Custom carriers are assembled from modular parts — hull, drive, superstructure, and interior modules. Each part affects jump range, tritium capacity, and service slots. Building a carrier is a major investment, so plan your design carefully.',
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
    text: 'Open [[misc]] > Carriers > Carrier Command to access guild-specific orders. As the guild flagship owner, you can broadcast jump schedules to all members, set shared cargo access, and designate squadron wingmates from the guild roster. Guild jumps coordinate all member ships traveling with the carrier.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carriercommand' },
  },
  {
    id: 'gui-logistics',
    title: 'Shared Logistics',
    text: 'Guilded carriers have expanded cargo and tritium capacity. Use [[misc]] > Carriers > Carrier Logistics to manage the shared hold — guild members can deposit and withdraw resources. Set tariffs for non-members to generate guild income. Tritium contributions from members keep the carrier fueled without personal cost.',
    target: { tab: 'misc', folder: 'Carriers', item: 'carrierlogistics' },
  },
  {
    id: 'gui-squadron',
    title: 'Guild Squadron',
    text: 'Guild members can join your squadron via [[external]] > Squadron. Wingmates assigned to the guild carrier provide combat, mining, and trade bonuses. A full guild squadron multiplies your effectiveness in conflict zones, mining sites, and trade runs.',
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
    text: 'Open [[misc]] > Colonization > Station Builder to construct additional stations. Choose a station type, select services (market, refuel, repair, outfitting), and place it in a system where you hold a colony. Each service adds revenue but increases the build cost and upkeep.',
    target: { tab: 'misc', folder: 'Colonization', item: 'stationbuilder' },
  },
  {
    id: 'sb-creator',
    title: 'Station Creator',
    text: 'For custom designs, open [[misc]] > Colonization > Station Creator. Assemble a station from modular parts — hull type, docking bays, service modules, and defense systems. Custom stations can match your exact needs, from a minimal refuel outpost to a full-service starport.',
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
    text: 'Open [[internal]] > Ship > Ship Yard to design and build ships. Select a hull class, then add a cockpit, internal modules, hardpoints, and utility mounts. Each part affects mass, jump range, speed, armor, and shield. The live stat readout updates as you build so you can balance your design.',
    target: { tab: 'internal', folder: 'Ship', item: 'shipcreator' },
  },
  {
    id: 'cs-building',
    title: 'Building Process',
    text: 'Custom ships require credits and materials to build. Once assembled, the ship appears in your stored fleet. Switch to it from the Ship panel ([[internal]] > Ship) while docked. Your previous ship goes into storage — you can switch back any time at no cost.',
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
    text: 'Custom ships are the ultimate expression of a commander style — a heavy-armored miner, a stripped-down racer, a long-range explorer. Experiment with designs, save loadout presets ([[internal]] > Ship > Loadout Presets), and find the ship that fits you. Replay this guide anytime from the Codex.',
    target: { tab: 'internal', folder: 'Ship', item: 'presets' },
  },
];

// --- Engineering, Synthesis & Materials ---
const engineeringSteps = [
  {
    id: 'eng-welcome',
    title: 'Engineering Unlocked',
    text: 'You have docked at a station with a resident engineer. Engineering lets you permanently upgrade ship modules beyond their stock stats using materials and credits — the primary endgame progression for ship performance.',
    target: null,
  },
  {
    id: 'eng-workshop',
    title: 'Engineering Workshop',
    text: 'Open [[internal]] > Modules > Engineering while docked at a station with an engineer. The left panel lists every equipped module. Select one to see its available blueprints. Each blueprint has multiple grades — higher grades give bigger bonuses but cost more materials.',
    target: { tab: 'internal', folder: 'Modules', item: 'engineering' },
  },
  {
    id: 'eng-blueprints',
    title: 'Blueprints & Grades',
    text: 'Blueprints are stat upgrades tailored to a module type — Dirty Drive for thrusters, Long Range for weapons, Shield Boosters for shields, and so on. Each has 5 grades. An engineer caps at their max grade, so high-grade engineers are worth seeking out in high-tech systems.',
    target: { tab: 'internal', folder: 'Modules', item: 'engineering' },
  },
  {
    id: 'eng-costs',
    title: 'Costs & Materials',
    text: 'Upgrading costs credits and materials — raw, manufactured, and encoded. Materials are consumed permanently. Use [[internal]] > Modules > Material Trader to exchange materials you have for ones you need. The cost panel shows exactly what each upgrade requires and highlights what you are missing in red.',
    target: { tab: 'internal', folder: 'Modules', item: 'materialtrader' },
  },
  {
    id: 'synthesis',
    title: 'Synthesis',
    text: 'Open [[internal]] > Modules > Synthesis to craft temporary consumable buffs — ammo, FSD injections, heat sinks, and more — from materials. Unlike engineering, synthesis is single-use and does not permanently alter your modules. Keep a stock of synthesized ammo and FSD boosts for long expeditions.',
    target: { tab: 'internal', folder: 'Modules', item: 'synthesis' },
  },
  {
    id: 'eng-done',
    title: 'Engineer Wisely',
    text: 'Engineering is the difference between a stock ship and a serious one. Prioritize FSD range and thruster speed first, then hardpoints and shields for combat. Materials are scarce — spend them where they count. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Combat & Bounties ---
const combatSteps = [
  {
    id: 'cmb-welcome',
    title: 'Combat Career',
    text: 'Combat is one of the three pillars of income alongside trade and exploration. This guide covers bounty hunting, conflict zones, piracy, and self-defense — everything you need to fight and survive.',
    target: null,
  },
  {
    id: 'cmb-bounty',
    title: 'Bounty Board',
    text: 'Open [[cons]] > Missions > Bounty Board while docked to accept kill contracts. Each bounty lists a target, a reward, and a system. Bounty vouchers are awarded automatically when you destroy a wanted ship — cash them at any station with Cartographics or the Bounty Board.',
    target: { tab: 'cons', folder: 'Missions', item: 'bountyboard' },
  },
  {
    id: 'cmb-conflict',
    title: 'Conflict Zones',
    text: 'Open [[external]] > Field Ops > Conflict Zones to join an active warzone. Choose a faction to fight for, then engage enemy ships. Conflict zones pay combat bonds per kill — cash them at a station. Higher-intensity zones pay more but are far more dangerous. Bring a combat-fitted ship.',
    target: { tab: 'external', folder: 'Field Ops', item: 'conflictzone' },
  },
  {
    id: 'cmb-res',
    title: 'Mining Sites (RES)',
    text: 'Resource Extraction Sites ([[external]] > Field Ops > Mining Sites) are asteroid fields with a high concentration of wanted pirates. They double as combat arenas — patrol the site, scan ships, and destroy wanted ones for bounties while also mining. Security ships patrol high-security RES, offering some backup.',
    target: { tab: 'external', folder: 'Field Ops', item: 'res' },
  },
  {
    id: 'cmb-piracy',
    title: 'Piracy',
    text: 'Open [[external]] > Field Ops > Piracy to intercept and raid cargo from NPC traders. Piracy is illegal — it generates bounties on your head and lowers your reputation with the targeted faction. It pays well in anarchy systems where there is no security response. Use a fast ship with hatch-breaker limpets.',
    target: { tab: 'external', folder: 'Field Ops', item: 'piracy' },
  },
  {
    id: 'cmb-loadout',
    title: 'Combat Outfitting',
    text: 'A combat ship needs shield boosters, hull reinforcement, and high-DPS hardpoints. Outfit at [[internal]] > Modules > Outfitting, then engineer your weapons and shields at Engineering. Carry shield cells or heat sinks. Never fight in a stock ship against engineered opponents.',
    target: { tab: 'internal', folder: 'Modules', item: 'outfitting' },
  },
  {
    id: 'cmb-done',
    title: 'Fly Dangerous',
    text: 'Combat is high-risk, high-reward. Cash your bonds and vouchers before dying — unbanked combat earnings are lost on rebuy. Pick your fights, engineer your ship, and always have a clean escape route. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Mining & Resources ---
const miningSteps = [
  {
    id: 'min-welcome',
    title: 'Mining Career',
    text: 'Mining extracts raw materials and minerals from asteroids and planetary surfaces. It is the primary source of engineering materials and a steady credit earner. This guide covers space mining, surface mining, and the tools you need.',
    target: null,
  },
  {
    id: 'min-screen',
    title: 'Mining Screen',
    text: 'Open [[external]] > Field Ops > Mining for the mining overview. Here you manage your refinery, prospect asteroids, and collect fragments. Mining requires a refinery module, cargo racks, and ideally a prospector limpet controller and collector limpets for efficient extraction.',
    target: { tab: 'external', folder: 'Field Ops', item: 'mining' },
  },
  {
    id: 'min-res',
    title: 'Resource Extraction Sites',
    text: 'Open [[external]] > Field Ops > Mining Sites to find a RES — an asteroid field rich with minerals. Travel to one in the System view, then mine the asteroids. High-value minerals like platinum and painite are rare but extremely profitable. Watch for pirates at low-security sites.',
    target: { tab: 'external', folder: 'Field Ops', item: 'res' },
  },
  {
    id: 'min-rings',
    title: 'Ring Mining & Hotspots',
    text: 'In the System view, select a planet with rings and scan it to reveal mineral hotspots. Travel to the ring, then target a hotspot to mine that specific mineral. Each hotspot type (pristine, common, rare) determines yield. Use a prospector limpet on each asteroid to check its contents before mining.',
    target: { tab: 'internal', folder: 'Navigation', item: 'system' },
  },
  {
    id: 'min-survey',
    title: 'Surface Survey & SRV',
    text: 'For surface mining, open [[external]] > Scanning > Surface Survey on a landable planet, then deploy your SRV ([[external]] > Deployed > SRV Rover). Drive across the surface collecting mineral deposits. Surface deposits yield raw materials for engineering. Use the wave scanner on your SRV to locate deposits.',
    target: { tab: 'external', folder: 'Scanning', item: 'survey' },
  },
  {
    id: 'min-srv',
    title: 'SRV Rover',
    text: 'Open [[external]] > Deployed > SRV Rover to drive your Surface Recon Vehicle on planet surfaces. The SRV collects materials, scans geological and biological signals, and can be recalled to your ship. Drive carefully — SRVs can be destroyed, and you respawn at your ship on foot.',
    target: { tab: 'external', folder: 'Deployed', item: 'srv' },
  },
  {
    id: 'min-materials',
    title: 'Materials & Refinery',
    text: 'Mined fragments go to your refinery, which processes them into cargo. Raw and manufactured materials are stored in your materials locker — not cargo. Use [[internal]] > Modules > Material Trader to exchange unwanted materials for ones you need for engineering and synthesis.',
    target: { tab: 'internal', folder: 'Modules', item: 'materialtrader' },
  },
  {
    id: 'min-done',
    title: 'Strike It Rich',
    text: 'Mining is the most reliable path to engineering materials and a solid credit income. Find a pristine ring, fill your cargo, and sell at a refinery station. Keep your refinery busy and your cargo hold managed. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Crew, Multi-Crew & Squadron ---
const crewSteps = [
  {
    id: 'crw-welcome',
    title: 'Crew & Squadron',
    text: 'You do not have to fly alone. This guide covers hiring crew, running multi-crew ships, managing wingmates, and deploying fighters — the personnel systems that multiply your effectiveness.',
    target: null,
  },
  {
    id: 'crw-crew',
    title: 'Crew Quarters',
    text: 'Open [[cons]] > Personnel > Crew Quarters while docked to hire NPC crew. Active crew provide passive bonuses — a combat pilot increases weapon damage, an engineer boosts shield recharge, a trader improves market prices. Crew take a percentage of your earnings as salary, so hire wisely.',
    target: { tab: 'cons', folder: 'Personnel', item: 'crew' },
  },
  {
    id: 'crw-multicrew',
    title: 'Multi-Crew',
    text: 'Open [[external]] > Squadron > Multi-Crew to run a ship with multiple roles filled — pilot, gunner, and fighter bay pilot. Each role can be filled by an NPC or (in future) another commander. Multi-crew lets one large ship operate at full capacity with dedicated weapon and fighter control.',
    target: { tab: 'external', folder: 'Squadron', item: 'multicrew' },
  },
  {
    id: 'crw-wingmates',
    title: 'Wingmates',
    text: 'Open [[external]] > Squadron > Wingmates to assign escort ships that fly with you. Wingmates assist in combat, mining, and trade, sharing kills and protecting you. A full wing of three escorts turns a solo operation into a formidable force. Manage their loadouts and orders from this screen.',
    target: { tab: 'external', folder: 'Squadron', item: 'wingmates' },
  },
  {
    id: 'crw-fighters',
    title: 'Fighter Hangar',
    text: 'Open [[external]] > Deployed > Fighter Hangar to launch ship-launched fighters from a large vessel with a fighter bay. A fighter can be piloted by an NPC or multi-crew crewmate, adding DPS and drawing fire. Fighters are small and expendable — they can be rebuilt at a station if destroyed.',
    target: { tab: 'external', folder: 'Deployed', item: 'fighters' },
  },
  {
    id: 'crw-fleet',
    title: 'Fleet Manager',
    text: 'Open [[external]] > Squadron > Fleet Manager to view and organize every ship you own. Stored ships can be transferred to your current station for a fee. Use this screen to swap between your combat, trade, and exploration vessels without flying back to each one.',
    target: { tab: 'external', folder: 'Squadron', item: 'fleet' },
  },
  {
    id: 'crw-done',
    title: 'Build Your Team',
    text: 'A well-crewed ship with escorts and fighters outperforms a solo vessel many times over. Balance crew salaries against your income, keep your fighters stocked, and transfer ships to where you need them. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Missions, Passengers & Trade ---
const missionsSteps = [
  {
    id: 'msn-welcome',
    title: 'Missions & Passengers',
    text: 'Missions are the structured way to earn credits and reputation. This guide covers the mission board, mission chains, passengers, and the advanced trade tools that maximize your income.',
    target: null,
  },
  {
    id: 'msn-board',
    title: 'Mission Board',
    text: 'Open [[cons]] > Missions > Missions while docked to see available contracts. Missions include delivery, courier, mining, passenger transport, and bounty hunting. Each lists a destination, reward, and deadline. Accept missions whose destination systems you can reach in time — failing a mission damages your reputation.',
    target: { tab: 'cons', folder: 'Missions', item: 'missions' },
  },
  {
    id: 'msn-chains',
    title: 'Mission Chains',
    text: 'Open [[cons]] > Missions > Mission Chains to follow multi-part story arcs. Completing a chain grants escalating rewards and unlocks unique reputation opportunities. Chains connect across multiple systems — follow the prompts to each destination in sequence.',
    target: { tab: 'cons', folder: 'Missions', item: 'chains' },
  },
  {
    id: 'msn-passengers',
    title: 'Passenger Lounge',
    text: 'Open [[cons]] > Personnel > Passenger Lounge while docked to accept passenger missions. Passengers need cabin space — install passenger cabins in optional internal slots via Outfitting. VIP passengers pay more but demand specific cabin classes and may refuse if your reputation is too low.',
    target: { tab: 'cons', folder: 'Personnel', item: 'passengers' },
  },
  {
    id: 'msn-trade-tools',
    title: 'Trade Tools',
    text: 'Open [[cons]] > Trade > Trade Tools to find profitable routes. Enter your cargo capacity and the tool suggests buy-low, sell-high loops between nearby stations. It accounts for commodity prices and distances, letting you maximize profit per ton per light year.',
    target: { tab: 'cons', folder: 'Trade', item: 'trade' },
  },
  {
    id: 'msn-analysis',
    title: 'Market Analysis',
    text: 'Open [[cons]] > Trade > Market Analysis for AI-driven trade route recommendations. It scans nearby markets for the best margins and trends, suggesting where to buy and sell for maximum profit. Use it alongside Trade Tools to validate routes before committing your cargo.',
    target: { tab: 'cons', folder: 'Trade', item: 'marketai' },
  },
  {
    id: 'msn-blackmarket',
    title: 'Black Market',
    text: 'Open [[cons]] > Trade > Black Market at stations with one (found in low-security and anarchy systems) to sell stolen or illegal goods. Black market prices are lower than legal markets, but it is the only way to offload pirated cargo. Selling here raises your wanted status — manage your crime record carefully.',
    target: { tab: 'cons', folder: 'Trade', item: 'blackmarket' },
  },
  {
    id: 'msn-company',
    title: 'Company',
    text: 'Open [[cons]] > Trade > Company to manage your corporate faction. As you grow, you can found a company that holds assets, issues dividends, and competes with NPC factions for system influence. Company growth ties into the BGS (Background Simulation) — influence drives control of stations and systems.',
    target: { tab: 'cons', folder: 'Trade', item: 'company' },
  },
  {
    id: 'msn-done',
    title: 'Earn Your Fortune',
    text: 'Missions and trade are the backbone of a growing commander. Stack compatible missions, use trade tools to fill empty cargo, and watch your deadlines. A reputation of reliability unlocks the highest-paying contracts. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Exploration & Exobiology ---
const explorationSteps = [
  {
    id: 'exp-welcome',
    title: 'Exploration Career',
    text: 'Exploration is the art of traveling into the unknown, scanning what you find, and selling the data for credits. It is the most solitary but potentially most lucrative career for a patient commander. This guide covers scanning, cartographics, and exobiology.',
    target: null,
  },
  {
    id: 'exp-screen',
    title: 'Exploration Screen',
    text: 'Open [[internal]] > Data > Exploration for the exploration dashboard. It tracks your scan count, total payout, and current system survey status. Honk your discovery scanner in each new system to populate the system map, then probe bodies for detailed data.',
    target: { tab: 'internal', folder: 'Data', item: 'exploration' },
  },
  {
    id: 'exp-fss',
    title: 'FSS Scanner',
    text: 'Open [[external]] > Scanning > FSS Scanner when you arrive in a new system. The Full Spectrum Scanner reveals all bodies in the system. Tune the scanner to each signal type to identify and discover planets, moons, and belts. Discovered bodies are mapped on the system orrery.',
    target: { tab: 'external', folder: 'Scanning', item: 'fss' },
  },
  {
    id: 'exp-survey',
    title: 'Surface Survey',
    text: 'Open [[external]] > Scanning > Surface Survey on a landable planet after an FSS scan to launch surface probes. Probes map the surface and reveal geological, biological, and resource signals. A fully mapped body pays a bonus when sold at Cartographics. You need a Detailed Surface Scanner module equipped.',
    target: { tab: 'external', folder: 'Scanning', item: 'survey' },
  },
  {
    id: 'exp-exobio',
    title: 'Exobiology',
    text: 'Open [[external]] > Scanning > Exobiology to sample alien life on habitable planets. Land on a planet with biological signals, deploy your SRV or approach on foot, and collect samples from three different colonies of the same species. Sell the complete sample at Vista Genomics for a significant payout.',
    target: { tab: 'external', folder: 'Scanning', item: 'exobiology' },
  },
  {
    id: 'exp-cartography',
    title: 'Cartographics',
    text: 'Open [[internal]] > Data > Cartographics while docked to sell your scan data. You only get paid when you sell — and you lose all unsold data if your ship is destroyed. Always return to a station and cash in before risking your ship. First discoveries earn a bonus and your name on the body.',
    target: { tab: 'internal', folder: 'Data', item: 'cartography' },
  },
  {
    id: 'exp-discoveries',
    title: 'Discoveries Database',
    text: 'Open [[role]] > Reference > Discoveries to review every body you have first-discovered. The database logs your name, the body, and the scan value. It is your permanent record of exploration — even after selling the data, the discovery credits remain.',
    target: { tab: 'role', folder: 'Reference', item: 'discoveries' },
  },
  {
    id: 'exp-done',
    title: 'Into the Black',
    text: 'Exploration rewards patience. Fit a long-range FSD, a fuel scoop, and an AFMU. Jump into unexplored space, scan everything, and return to sell. The first commander to scan a body gets their name on it forever. Fly far, fly safe, and cash in often. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Commander Identity & Progression ---
const commanderSteps = [
  {
    id: 'cmd-welcome',
    title: 'Commander Identity',
    text: 'Your commander is more than a pilot — a reputation, a rank, a collection of titles and achievements. This guide covers the [[role]] tab: your profile, ranks, reputation, titles, badges, and the competitive leaderboards.',
    target: null,
  },
  {
    id: 'cmd-profile',
    title: 'Commander Profile',
    text: 'Open [[role]] > Identity > Profile to see your commander record: total earnings, light years traveled, jumps, kills, and ranks across trade, combat, exploration, and mining. The profile is your permanent stat sheet — it persists across ship losses and grows throughout your career.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'cmd-ranks',
    title: 'Ranks & Reputation',
    text: 'Open [[role]] > Identity > Reputation to view your standing with every faction and superpower you have interacted with. Higher reputation unlocks better missions, higher payouts, and access to restricted systems. Reputation rises by completing missions and bounties for a faction; it falls if you attack their ships or fail their missions.',
    target: { tab: 'role', folder: 'Identity', item: 'rep' },
  },
  {
    id: 'cmd-titles',
    title: 'Titles',
    text: 'Open [[role]] > Identity > Titles to view and equip earned titles. Titles are displayed alongside your name and reflect milestones — combat ranks, exploration achievements, faction allegiance. Equip one to show your status to other commanders and in your profile.',
    target: { tab: 'role', folder: 'Identity', item: 'titles' },
  },
  {
    id: 'cmd-badges',
    title: 'Badge Maker',
    text: 'Open [[role]] > Identity > Badge Maker to create custom badges from your achievements. Combine unlocked icons and colors into a personal emblem. Badges are cosmetic but let you express your commander identity — collect the components by completing specific achievement milestones.',
    target: { tab: 'role', folder: 'Identity', item: 'badgemaker' },
  },
  {
    id: 'cmd-achievements',
    title: 'Awards & Achievements',
    text: 'Open [[role]] > Progress > Awards to see every achievement and your progress toward each. Achievements reward credits, materials, and titles. Some are milestone-based (jumps, kills, credits); others are discovery-based (first carrier, first colony). Check back often — new achievements unlock as you progress.',
    target: { tab: 'role', folder: 'Progress', item: 'achievements' },
  },
  {
    id: 'cmd-leaderboard',
    title: 'Leaderboard',
    text: 'Open [[role]] > Progress > Leaderboard to compare your stats against other commanders. Leaderboards track total credits, jumps, kills, exploration value, and more. Climb the ranks by playing more — the leaderboard updates as your stats grow.',
    target: { tab: 'role', folder: 'Progress', item: 'leaderboard' },
  },
  {
    id: 'cmd-codex',
    title: 'Codex',
    text: 'Open [[role]] > Reference > Codex anytime to look up any game mechanic. The Codex is the complete in-game encyclopedia — including this Tutorials category, where you can replay any guide. Bookmark it; it is your reference for everything in the galaxy.',
    target: { tab: 'role', folder: 'Reference', item: 'codex' },
  },
  {
    id: 'cmd-done',
    title: 'Write Your Legend',
    text: 'Your commander record grows with every jump, every kill, every credit. Build your reputation, earn your titles, and climb the leaderboard. The galaxy remembers its commanders — make sure it remembers you. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Galactic Politics, News & Events ---
const galaxySteps = [
  {
    id: 'gal-welcome',
    title: 'The Living Galaxy',
    text: 'The galaxy is not static — factions rise and fall, powers vie for control, news breaks, and events unfold on a real calendar. This guide covers the political and news systems that shape the universe around you.',
    target: null,
  },
  {
    id: 'gal-bgs',
    title: 'Faction Status (BGS)',
    text: 'Open [[cons]] > World > Faction Status to track the Background Simulation — the system that models faction influence and control. Factions gain influence through missions, trade, and bounties done in their systems. High influence can trigger wars and elections that shift station ownership. Your actions move the needle.',
    target: { tab: 'cons', folder: 'World', item: 'bgs' },
  },
  {
    id: 'gal-powerplay',
    title: 'Power Play',
    text: 'Open [[cons]] > World > Power Play to pledge allegiance to a galactic power. Powers are major figures who control vast territory. Pledge to one, complete their objectives, and earn rank rewards — unique modules, salary, and system access. Pledging is a commitment; switching powers resets your progress.',
    target: { tab: 'cons', folder: 'World', item: 'powerplay' },
  },
  {
    id: 'gal-crime',
    title: 'Crime Status',
    text: 'Open [[cons]] > World > Crime Status to view your wanted level and active bounties. Crimes — piracy, murder, smuggling — generate fines and bounties on your head. Pay fines at any station; clear bounties at an Interstellar Factors in a low-security system. A clean record keeps security forces friendly.',
    target: { tab: 'cons', folder: 'World', item: 'crime' },
  },
  {
    id: 'gal-galnet',
    title: 'StarNet News',
    text: 'Open [[cons]] > World > StarNet News for the galactic news feed. Articles cover faction conflicts, power shifts, market events, and cosmic phenomena. Reading Galnet keeps you informed of where the action is — a war starting in a nearby system may mean combat bonds and trade disruption.',
    target: { tab: 'cons', folder: 'World', item: 'galnet' },
  },
  {
    id: 'gal-goals',
    title: 'Community Goals',
    text: 'Open [[cons]] > World > Community Goals to join time-limited server-wide objectives. Contribute commodities, combat bonds, or exploration data to a shared goal. When the community fills the meter, all contributors receive tiered rewards — the more you contribute, the bigger your cut. Goals reset on a timer.',
    target: { tab: 'cons', folder: 'World', item: 'goals' },
  },
  {
    id: 'gal-holidays',
    title: 'Public Holidays',
    text: 'Open [[cons]] > World > Public Holidays to see the real-calendar holiday system. On public holidays, special effects activate — fuel discounts, bonus payouts, increased traffic. Holidays run on a two-week countdown; plan your trading and refueling around them to save credits.',
    target: { tab: 'cons', folder: 'World', item: 'holidays' },
  },
  {
    id: 'gal-events',
    title: 'Cosmic Events',
    text: 'Open [[cons]] > World > Cosmic Events for server-wide timed events — double payouts, material showers, faction flashpoints. Events are time-limited and often tie to holidays or narrative arcs. Participate while they last for bonus rewards you cannot get otherwise.',
    target: { tab: 'cons', folder: 'World', item: 'events' },
  },
  {
    id: 'gal-done',
    title: 'Shape the Galaxy',
    text: 'The Background Simulation means your actions matter system by system. Back a faction, pledge a power, read the news, and join community goals. The living galaxy rewards those who participate. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Cabin Life: Rooms, Aquarium, Garden, Genetics ---
const cabinSteps = [
  {
    id: 'cab-welcome',
    title: 'Cabin Life',
    text: 'Beyond the cockpit, your ship or carrier can house living spaces — cabins, aquariums, gardens, and labs. These provide passive bonuses, cosmetic flair, and specimen collection. This guide covers the cabin systems on the [[misc]] tab.',
    target: null,
  },
  {
    id: 'cab-cabin',
    title: 'Cabin',
    text: 'Open [[misc]] > Cabin > Cabin to view and enter your ship cabin. The cabin is your personal space — furnished with rooms you build. From here you can walk around, view your collections, and manage your living quarters. Cabin modules are installed in optional internal slots via Outfitting.',
    target: { tab: 'misc', folder: 'Cabin', item: 'cabin' },
  },
  {
    id: 'cab-rooms',
    title: 'Room Manager',
    text: 'Open [[misc]] > Cabin > Room Manager to build and arrange rooms in your cabin or carrier interior. Each room type — quarters, lounge, lab, greenhouse — provides different bonuses or functions. Place rooms to fit your playstyle; the layout is fully customizable and saved per ship or carrier.',
    target: { tab: 'misc', folder: 'Cabin', item: 'roommanager' },
  },
  {
    id: 'cab-aquarium',
    title: 'Aquarium',
    text: 'Open [[misc]] > Cabin > Aquarium to collect and display aquatic specimens caught during your travels. Fish are procedurally generated with unique traits. A stocked aquarium provides a small morale bonus to crew and is a living record of the worlds you have visited. Catch fish with specialized equipment on water worlds.',
    target: { tab: 'misc', folder: 'Cabin', item: 'aquarium' },
  },
  {
    id: 'cab-garden',
    title: 'Garden',
    text: 'Open [[misc]] > Cabin > Garden to cultivate flora collected from habitable planets. Plants grow over time and provide materials, oxygen, or morale bonuses. A well-tended garden is both decorative and functional — harvest it periodically for usable resources.',
    target: { tab: 'misc', folder: 'Cabin', item: 'garden' },
  },
  {
    id: 'cab-genetics',
    title: 'Genetics Lab',
    text: 'Open [[misc]] > Cabin > Genetics Lab to crossbreed specimens from your aquarium and garden. Combining traits can produce rare and valuable new species. The genetics lab is the endgame of specimen collection — experiment with pairings to discover unique organisms worth credits and achievements.',
    target: { tab: 'misc', folder: 'Cabin', item: 'geneticslab' },
  },
  {
    id: 'cab-done',
    title: 'Make It Home',
    text: 'Your cabin is your home among the stars. Collect specimens, build rooms, and create a space that reflects your journey. The bonuses are modest but the satisfaction of a living ship is its own reward. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Infrastructure: Warp Gates & Canis Stella ---
const infrastructureSteps = [
  {
    id: 'inf-welcome',
    title: 'Galactic Infrastructure',
    text: 'As you progress, you can build infrastructure that benefits you and other commanders — warp gates for instant travel and allegiance to the Canis Stella megacorporation. This guide covers these endgame systems on the [[misc]] tab.',
    target: null,
  },
  {
    id: 'inf-warpgates',
    title: 'Warp Gates',
    text: 'Open [[misc]] > Infrastructure > Warp Gates to construct permanent fast-travel links between systems. A warp gate allows instant jumps between two linked systems, bypassing fuel and range costs. Building a gate requires significant credits and rare materials, but it permanently shortcuts a route you travel often.',
    target: { tab: 'misc', folder: 'Infrastructure', item: 'warpgates' },
  },
  {
    id: 'inf-canis',
    title: 'Canis Stella',
    text: 'Open [[misc]] > Infrastructure > Canis Stella to engage with the Canis Stella corporation — a player-facing megacorp with its own rank structure, CEO title, and corporate missions. Climb the corporate ladder by completing Canis Stella objectives. The top rank grants the CEO title and control of corporate policy.',
    target: { tab: 'misc', folder: 'Infrastructure', item: 'canisstella' },
  },
  {
    id: 'inf-done',
    title: 'Build the Future',
    text: 'Warp gates reshape travel for everyone who uses them, and Canis Stella offers a corporate career unlike any faction. These are long-term investments — build them when you have the resources and the ambition. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Maintenance & Ship Management ---
const maintenanceSteps = [
  {
    id: 'mnt-welcome',
    title: 'Ship Maintenance',
    text: 'Your ship degrades over time and through combat. This guide covers maintenance, loadout presets, and the ship management tools that keep you flying.',
    target: null,
  },
  {
    id: 'mnt-maintenance',
    title: 'Maintenance Screen',
    text: 'Open [[internal]] > Modules > Maintenance while docked to repair worn modules. Modules accumulate wear from use — thrusters, FSD, and weapons degrade fastest. Worn modules perform worse and cost more to repair the longer you wait. Run maintenance regularly to keep your ship at peak performance.',
    target: { tab: 'internal', folder: 'Modules', item: 'maintenance' },
  },
  {
    id: 'mnt-ship',
    title: 'Ship Panel',
    text: 'Open [[internal]] > Ship > Ship for your vessel dashboard — stats, cargo manifest, materials locker, shipyard, and outfitting access. Monitor your hull integrity, fuel, and cargo here. The ship panel is your command center for everything about your current vessel.',
    target: { tab: 'internal', folder: 'Ship', item: 'ship' },
  },
  {
    id: 'mnt-presets',
    title: 'Loadout Presets',
    text: 'Open [[internal]] > Ship > Loadout Presets to save and recall module configurations. Save a combat build, an exploration build, and a trade build, then swap between them at a station with one click (modules must be in your storage). Presets save time when switching roles — never re-outfit from scratch again.',
    target: { tab: 'internal', folder: 'Ship', item: 'presets' },
  },
  {
    id: 'mnt-rebuy',
    title: 'Rebuy & Insurance',
    text: 'If your ship is destroyed, you rebuy it at a fraction of its value from the rebuy screen. Always keep enough credits for a rebuy — flying without rebuy funds means losing the ship permanently. Custom ships cost more to rebuy since they include all custom parts. Check your rebuy cost on the Ship panel before dangerous trips.',
    target: { tab: 'internal', folder: 'Ship', item: 'ship' },
  },
  {
    id: 'mnt-done',
    title: 'Keep It Flying',
    text: 'A maintained ship is a surviving ship. Repair before combat, save your loadouts, and always have rebuy funds. The commander who respects their ship flies longer. Replay this guide anytime from the Codex.',
    target: null,
  },
];

// --- Settings & Controls ---
const settingsSteps = [
  {
    id: 'set-welcome',
    title: 'Settings & Controls',
    text: 'o7 is highly customizable — from the CRT aesthetic to physical controls. This guide covers the [[settings]] tab and controller configuration so you can tailor the experience to your hardware and preferences.',
    target: null,
  },
  {
    id: 'set-settings',
    title: 'Settings Screen',
    text: 'Open the [[settings]] tab to access eight categories: Display (CRT, fullscreen, scale, orientation), Color (themes, custom RGB), Mono (grayscale with per-category color), Type (fonts, sizes), Audio (volume, presets), Controls (gestures, filters), Data (save management), and Support (donations). Each has nested collapsible sections. Your appearance, display, audio, and control preferences are saved globally — they persist across both save slots and preview reloads, so your chosen theme applies no matter which save you load.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'set-display',
    title: 'Display & Accessibility',
    text: 'In [[settings]] > Display, toggle CRT effects, adjust the display scale (50-150%), set screen orientation (portrait/landscape with a lock), and enable mini-screen mode for small external displays like the Moto Razr 50. Text brightness scales up to 600% for a high-contrast glow. UI element sizing is independent per panel.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'set-color',
    title: 'Color & Mono',
    text: 'In [[settings]] > Color, choose from preset themes or set a custom RGB accent. In [[settings]] > Mono, enable a full monochrome mode and selectively restore color per category — stars, planets, ships, stations, and UI — for a classic green-phosphor look with color where you want it.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'set-audio',
    title: 'Audio',
    text: 'In [[settings]] > Audio, set master, SFX, and music volumes. Choose from six music presets, and override the track per screen if you prefer specific music in combat, exploration, or stations. Test sounds with the preview buttons. The Ship Copilot and Radio Chatter have independent toggles found in the Ship panel.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'set-controller',
    title: 'Controller Config',
    text: 'Open [[settings]] tab > Controller Config to rebind keyboard and gamepad controls. Every action supports multiple bindings for multi-controller play. Conflicts are auto-resolved. Navigate with d-pad or arrow keys, select with A or Enter, back with B or Escape. Reset all to defaults with one button. The focus system enables full controller play without a mouse.',
    target: { tab: 'settings', item: 'controllerconfig' },
  },
  {
    id: 'set-data',
    title: 'Save Management',
    text: 'In [[settings]] > Data, switch between Commander and Sandbox saves, export a backup JSON file, import a save to restore progress, or reset your game. Backups are recommended before major updates. The auto-save rolls a _bak backup automatically on each save.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'set-support',
    title: 'Support & Credits',
    text: 'In [[settings]] > Support, you can support development with a one-time donation via Base44 Payments, and view the Credits — the list of founders and contributors who helped build the galaxy. Each contributor\'s alias appears as a background NPC you can meet while flying. The credits list grows over time as more people contribute.',
    target: { tab: 'settings', item: 'settings' },
  },
  {
    id: 'set-done',
    title: 'Make It Yours',
    text: 'o7 is designed to be played your way — mouse, keyboard, touch, or controller; color or monochrome; portrait or landscape. Spend a few minutes in Settings to configure it to your hardware and taste. Replay this guide anytime from the Codex.',
    target: null,
  },
];

const salvageSteps = [
  { id: 'salvage-intro', title: 'Salvageable Wreckage', text: 'Your wake scanner has flagged salvageable wreckage in deep space. The further you explore, the more wreckage you find — and the rarer the components. These wrecks drop unique salvage components distinct from regular materials.', target: null },
  { id: 'salvage-open', title: 'Open the Salvage Screen', text: 'Open [[internal]] > Data > Salvage to review the wreck your scanners detected in this system.', target: { tab: 'internal', folder: 'Data', item: 'wreckage' } },
  { id: 'salvage-collect', title: 'Salvage the Wreck', text: 'Press SALVAGE WRECK to recover the unique components aboard. They are stored in your Salvaged Components locker, separate from regular materials.', target: { tab: 'internal', folder: 'Data', item: 'wreckage' } },
  { id: 'salvage-sell', title: 'Sell for Credits', text: 'Collected components can be sold for credits anytime from the Salvage screen — rarer components are worth far more. Keep exploring to find legendary wrecks.', target: { tab: 'internal', folder: 'Data', item: 'wreckage' } },
];

// --- Card Decks, Foils & Arena ---
const cardsSteps = [
  {
    id: 'crd-welcome',
    title: 'Card Collection',
    text: 'o7 has a collectible card meta-game. Every ship manufacturer has a 100-card deck, the Canis Stella corporation has a 150-card deck, and each achievement grants a Special Class card. Cards are earned through play — never bought with real money.',
    target: null,
  },
  {
    id: 'crd-binder',
    title: 'The Binder',
    text: 'Open [[role]] > Identity > Profile and switch to the Cards tab to view your binder. Each deck shows your collection progress. Sort by number, power, name, or rarity; filter by rarity; or toggle "Missing only" to find gaps. Tap a card you own for full stats and flavor.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'crd-grant',
    title: 'Earning Cards',
    text: 'Visit a station for the first time to draw one card themed to that station\'s economy. Join Canis Stella and gain corporate reputation to earn Canis Stella cards. Every achievement you earn grants a matching Special Class card automatically.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'crd-art',
    title: 'Card Art',
    text: 'Every card carries procedural art: a manufacturer glyph keeps each deck themed, while a starfield and planet sigil are seeded from the system where you acquired the card — so two cards from different worlds look different even within the same deck. Denser starfields come from higher-population systems; the sigil is colored by the system\'s dominant planet type. Tap a card in the binder to see its art, stats, and origin system.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'crd-foil',
    title: 'Foils',
    text: 'About 1 in 14 granted cards comes as a foil — a rare cosmetic variant with a gold border, a ✦ marker, and a stamped serial number. Foils are tracked separately and shown in the binder with an amber badge. A foil copy still counts toward deck completion.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'crd-trader',
    title: 'Duplicate Trader',
    text: 'In the Binder\'s Trader tab, spend duplicate cards for ones you\'re missing: 3 duplicates for a random missing card, or 5 duplicates for a specific missing card of your choice. Trading only covers the eight manufacturer decks — Canis Stella and Special cards keep their prestige.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'crd-arena',
    title: 'Card Arena',
    text: 'In the Binder\'s Arena tab, duel the AI with your collection. Pick a manufacturer deck, choose a game (Lane Skirmish, Stat Duel, or Void Trick), and optionally stake a card. Win to claim a foe card you\'re missing; lose and forfeit your wager. Victories also pay credits.',
    target: { tab: 'role', folder: 'Identity', item: 'profile' },
  },
  {
    id: 'crd-deck',
    title: 'Deck Completion',
    text: 'Complete a full 100-card manufacturer deck to earn a "Master of..." title and 50M credits. The Canis Stella deck pays 150M and the Special Class deck 250M plus the "Grand Archivist of o7" title. Check the binder header for each deck\'s reward.',
    target: null,
  },
  {
    id: 'crd-done',
    title: 'Collect Them All',
    text: 'With over 1,000 cards across ten decks, the binder is a long-term collection goal. Explore, trade, and join Canis Stella to fill it out. Replay this guide anytime from the Codex.',
    target: null,
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
  engineering: {
    id: 'engineering',
    name: 'Engineering & Materials',
    icon: '🔧',
    desc: 'Upgrading modules with blueprints, synthesis, and the material trader.',
    steps: engineeringSteps,
    trigger: (state, prev) => {
      const getEng = s => Object.values(s?.ship?.modules?.__engineering || {}).length;
      return getEng(state) > 0 && getEng(prev) === 0;
    },
  },
  combat: {
    id: 'combat',
    name: 'Combat & Bounties',
    icon: '⚔️',
    desc: 'Bounty hunting, conflict zones, piracy, and combat outfitting.',
    steps: combatSteps,
    trigger: (state, prev) => (state.totalKills ?? 0) > 0 && (prev?.totalKills ?? 0) === 0,
  },
  mining: {
    id: 'mining',
    name: 'Mining & Resources',
    icon: '⛏️',
    desc: 'Space mining, ring hotspots, surface survey, SRV, and the material refinery.',
    steps: miningSteps,
    trigger: (state, prev) => {
      const mats = s => Object.values(s?.materials || {}).reduce((a, b) => a + (b || 0), 0);
      return mats(state) > 0 && mats(prev) === 0;
    },
  },
  crew: {
    id: 'crew',
    name: 'Crew & Squadron',
    icon: '👥',
    desc: 'Hiring crew, multi-crew, wingmates, fighter hangar, and fleet management.',
    steps: crewSteps,
    trigger: (state, prev) => (state.crew?.length ?? 0) > 0 && (prev?.crew?.length ?? 0) === 0,
  },
  missions: {
    id: 'missions',
    name: 'Missions, Passengers & Trade',
    icon: '📋',
    desc: 'Mission board, chains, passengers, trade tools, market analysis, black market, and company.',
    steps: missionsSteps,
    trigger: (state, prev) => (state.completedMissions ?? 0) > 0 && (prev?.completedMissions ?? 0) === 0,
  },
  exploration: {
    id: 'exploration',
    name: 'Exploration & Exobiology',
    icon: '🔭',
    desc: 'FSS scanning, surface survey, exobiology, cartographics, and the discoveries database.',
    steps: explorationSteps,
    trigger: (state, prev) => {
      const scans = s => Object.keys(s?.scannedBodies || {}).length;
      return scans(state) > 0 && scans(prev) === 0;
    },
  },
  salvage: {
    id: 'salvage',
    name: 'Salvage & Wreckage',
    icon: '🧲',
    desc: 'Deep-space wreckage, unique salvage components, and selling salvage.',
    steps: salvageSteps,
    trigger: (state, prev) => {
      const w = s => s?.achievements?.milestones?.first_wreckage;
      return !!w(state) && !w(prev);
    },
  },
  commander: {
    id: 'commander',
    name: 'Commander Identity',
    icon: '🎖️',
    desc: 'Profile, ranks, reputation, titles, badge maker, achievements, and leaderboards.',
    steps: commanderSteps,
    trigger: (state, prev) => (state.achievements?.length ?? 0) > 0 && (prev?.achievements?.length ?? 0) === 0,
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galactic Politics & News',
    icon: '📰',
    desc: 'BGS faction status, power play, crime, StarNet news, community goals, and events.',
    steps: galaxySteps,
    trigger: (state, prev) =>
      (state.reputation && Object.keys(state.reputation).length > 0) &&
      (!prev?.reputation || Object.keys(prev.reputation).length === 0),
  },
  cabin: {
    id: 'cabin',
    name: 'Cabin Life',
    icon: '🏠',
    desc: 'Cabin rooms, aquarium, garden, and the genetics lab for specimen collection.',
    steps: cabinSteps,
    trigger: (state, prev) => (state.cabinRooms?.length ?? 0) > 0 && (prev?.cabinRooms?.length ?? 0) === 0,
  },
  infrastructure: {
    id: 'infrastructure',
    name: 'Warp Gates & Canis Stella',
    icon: '🌌',
    desc: 'Constructing warp gates and climbing the Canis Stella corporate ladder.',
    steps: infrastructureSteps,
    trigger: (state, prev) => (state.warpGates?.length ?? 0) > 0 && (prev?.warpGates?.length ?? 0) === 0,
  },
  maintenance: {
    id: 'maintenance',
    name: 'Ship Maintenance',
    icon: '🛠️',
    desc: 'Module maintenance, loadout presets, and rebuy insurance.',
    steps: maintenanceSteps,
    trigger: (state, prev) =>
      (state.ship?.integrity ?? 100) < 100 && (prev?.ship?.integrity ?? 100) >= 100,
  },
  settings: {
    id: 'settings',
    name: 'Settings & Controls',
    icon: '⚙️',
    desc: 'Display, color, mono, fonts, audio, controller config, and save management.',
    steps: settingsSteps,
    // Manual trigger only — always available from the Codex and footer button
  },
  cards: {
    id: 'cards',
    name: 'Card Decks & Arena',
    icon: '🃏',
    desc: 'Collectible manufacturer decks, foils, the duplicate trader, and the card arena.',
    steps: cardsSteps,
    trigger: (state, prev) => {
      const n = s => Object.keys(s?.cards?.owned || {}).length;
      return n(state) > 0 && n(prev) === 0;
    },
  },
};

export const TUTORIAL_CATEGORY_LIST = Object.values(TUTORIAL_CATEGORIES);