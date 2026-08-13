// Ship Statistics — jump range, shields, and other static ship benefits.
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { computeShipStats } from '@/lib/shipOutfitting';
import { SHIP_MAP } from '@/lib/gameState';

export default function ShipStatistics() {
  const { state } = useGameState();
  const ship = state.ship || {};
  const stats = computeShipStats(ship.type, ship.modules || {});
  const emptyJump = Math.round((stats.jumpRange || 8) * 1.25);
  const rows = [
    ['Ship', ship.name || SHIP_MAP[ship.type]?.name || '---'],
    ['Jump Range (Loaded)', `${stats.jumpRange || 8} LY`],
    ['Jump Range (Empty)', `${emptyJump} LY`],
    ['Shield Strength', stats.shield ? `${stats.shield} MJ` : 'None'],
    ['Cargo Capacity', `${stats.cargoCapacity || 0} T`],
    ['Fuel Capacity', `${stats.fuelCapacity || 8} T`],
    ['Total Mass', `${Math.round(stats.mass || 10)} T`],
    ['Power', `${Math.round(stats.power || 0)} / ${Math.round(stats.powerDraw || 0)} MW`],
    ['Total Damage', `${Math.round(stats.totalDamage || 0)}`],
    ['Hull Integrity', `${Math.round(ship.integrity ?? 100)}%`],
    ['Module Wear', `${Math.round(ship.moduleWear ?? 0)}%`],
  ];
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center gap-2 text-orange-400 uppercase text-sm border-b border-orange-900/50 pb-2">
        <BarChart3 className="w-4 h-4" /> Ship Statistics
      </div>
      <div className="border border-orange-900 bg-black/60 divide-y divide-orange-950/50">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between px-3 py-2 text-xs">
            <span className="text-orange-600 uppercase">{k}</span>
            <span className="text-orange-300 font-bold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}