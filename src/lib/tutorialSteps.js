// Tutorial step definitions — each step highlights a menu element and explains it.
// target: { tab, folder?, item? } — NavBar auto-opens the tab/folder and pulses
// the matching item (or the tab itself if no item is specified).
export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome, Commander',
    text: 'o7 is a menu-driven space simulation. Everything — travel, trading, outfitting — is done through on-screen menus. No flight stick required. This quick tutorial covers the essentials. You can replay it anytime from the footer TUTORIAL button.',
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
    text: 'You are ready to explore the galaxy. Plot a route, scan some systems, trade some cargo, and build your fortune. The universe has roughly four billion stars waiting. Tap the TUTORIAL button in the footer anytime to replay this guide.',
    target: null,
  },
];