// Commander Profile — career statistics, fleet record, exploration log
import React from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { User, Rocket, Ship, Map, Globe, DollarSign, Route, Trophy, Anchor, Clock, Zap, Telescope, Pickaxe } from 'lucide-react';
import BadgeDisplay from './BadgeDisplay';

export default function CommanderProfile() {
  const { state } = useGameState();

  const fmt = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return (n || 0).toLocaleString();
  };

  const createdDate = new Date(state.createdAt).toLocaleDateString();
  const daysActive = Math.max(1, Math.floor((Date.now() - state.createdAt) / 86400000));
  const systemsDiscovered = Object.keys(state.discoveredSystems || {}).length;
  const bodiesScanned = Object.keys(state.scannedBodies || {}).length;
  const firstDiscoveries = Object.values(state.achievements?.firstDiscoveries || {}).length;

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          {state.playerBadge && <BadgeDisplay badge={state.playerBadge} size={36} />}
          <User className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Commander Profile</h2>
          {state.saveMode === 'sandbox' && <span className="text-cyan-400 text-[9px] border border-cyan-700 px-1">SANDBOX</span>}
        </div>
        <div className="text-xs text-orange-600 flex flex-wrap gap-4">
          <span>ACTIVE SHIP: {state.ship.name}</span>
          <span>COMMISSIONED: {createdDate}</span>
          <span>DAYS ACTIVE: {daysActive}</span>
        </div>
      </div>

      <Section title="Career Statistics" icon={DollarSign}>
        <Stat label="Current Credits" value={`${fmt(state.credits)} CR`} icon={DollarSign} />
        <Stat label="Lifetime Earnings" value={`${fmt(state.lifetimeEarnings || 0)} CR`} icon={DollarSign} />
        <Stat label="Total Profit" value={`${fmt(state.totalProfit || 0)} CR`} icon={Trophy} />
        <Stat label="Light Years Traveled" value={`${fmt(state.lightYearsTraveled || 0)} LY`} icon={Route} />
        <Stat label="Total Jumps" value={(state.totalJumps || 0).toLocaleString()} icon={Zap} />
        <Stat label="Systems Visited" value={systemsDiscovered.toLocaleString()} icon={Map} />
      </Section>

      <Section title="Fleet & Assets" icon={Ship}>
        <Stat label="Current Ship" value={SHIP_MAP[state.ship.type]?.name || state.ship.type} icon={Ship} />
        <Stat label="Ships Stored" value={state.ownedShips.length} icon={Ship} />
        <Stat label="Ships Purchased" value={state.shipsPurchased || 0} icon={Ship} />
        <Stat label="Fleet Carriers" value={state.fleetCarriers.length} icon={Anchor} />
        <Stat label="Active Colonies" value={state.colonies.length} icon={Rocket} />
        <Stat label="Bookmarked Systems" value={state.bookmarkedSystems?.length || 0} icon={Map} />
      </Section>

      <Section title="Exploration Record" icon={Telescope}>
        <Stat label="Bodies Scanned" value={bodiesScanned.toLocaleString()} icon={Globe} />
        <Stat label="First Discoveries" value={firstDiscoveries} icon={Trophy} />
        <Stat label="FSS Scans" value={Object.keys(state.fssScannedSystems || {}).length} icon={Telescope} />
        <Stat label="Bodies Mapped" value={Object.keys(state.mappedBodies || {}).length} icon={Globe} />
        <Stat label="Surface Discoveries" value={Object.keys(state.surfaceDiscoveries || {}).length} icon={Pickaxe} />
      </Section>

      <Section title="Ranks" icon={Trophy}>
        <Stat label="Exploration" value={state.rank.exploration.name} icon={Telescope} />
        <Stat label="Trade" value={state.rank.trade.name} icon={DollarSign} />
        <Stat label="Mining" value={state.rank.mining.name} icon={Pickaxe} />
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="border border-orange-900 p-4 space-y-2">
      <h3 className="text-orange-500 text-sm font-bold uppercase flex items-center gap-2"><Icon className="w-4 h-4" /> {title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{children}</div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="border border-orange-950 p-2">
      <div className="text-orange-700 text-[10px] uppercase flex items-center gap-1">{Icon && <Icon className="w-2.5 h-2.5" />} {label}</div>
      <div className="text-orange-300 font-bold text-sm">{value}</div>
    </div>
  );
}