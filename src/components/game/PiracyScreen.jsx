// Piracy — interdict NPC traders and steal cargo in low-security systems
import React, { useState } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { canPirate, generateNPCTrader, resolvePiracy } from '@/lib/piracy';
import { computeShipStats } from '@/lib/shipOutfitting';
import { Skull, Crosshair, Package, Swords, Shield, Fuel, ScanLine } from 'lucide-react';

export default function PiracyScreen() {
  const { state, addCargo, addCrime, addCredits, update } = useGameState();
  const [traders, setTraders] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);

  const system = state.currentSystem;
  const canPirateHere = canPirate(system);

  const shipType = SHIP_MAP[state.ship.type];
  const shipClass = shipType?.class || 1;
  const stats = computeShipStats(state.ship.type, state.ship.modules);
  const playerCombatPower = (stats.totalDamage || 10) + (stats.shield || 50) + (stats.maxHull || 100);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const count = 1 + Math.floor(Math.random() * 3);
      const found = [];
      for (let i = 0; i < count; i++) {
        found.push(generateNPCTrader(system.security));
      }
      setTraders(found);
      setScanning(false);
      setLog(prev => [`Scanned for traders — ${count} contacts found.`, ...prev].slice(5));
    }, 1000);
  };

  const handleDemand = (trader) => {
    if (trader.willFight) {
      // Combat resolution
      const outcome = resolvePiracy(playerCombatPower, trader);
      if (outcome.success) {
        // Player wins — gets cargo, takes some damage
        for (const item of trader.cargo) {
          addCargo(item.commodity, item.qty);
        }
        update(prev => ({ ...prev, ship: { ...prev.ship, integrity: Math.max(0, (prev.ship.integrity ?? 100) - outcome.damage) } }));
        addCrime('piracy');
        setResult({ type: 'combat_win', trader, cargo: trader.cargo, damage: outcome.damage });
        setLog(prev => [`Defeated ${trader.shipName} in combat. Cargo seized.`, ...prev].slice(5));
      } else {
        // Player loses — takes damage, trader escapes
        update(prev => ({ ...prev, ship: { ...prev.ship, integrity: Math.max(0, (prev.ship.integrity ?? 100) - outcome.damage) } }));
        addCrime('piracy');
        setResult({ type: 'combat_loss', trader, damage: outcome.damage });
        setLog(prev => [`${trader.shipName} escaped after a fierce fight. Ship damaged.`, ...prev].slice(5));
      }
    } else {
      // Trader complies — drops cargo
      for (const item of trader.cargo) {
        addCargo(item.commodity, item.qty);
      }
      addCrime('piracy');
      setResult({ type: 'comply', trader, cargo: trader.cargo });
      setLog(prev => [`${trader.shipName} surrendered cargo without resistance.`, ...prev].slice(5));
    }
    // Remove this trader from the list
    setTraders(prev => prev.filter(t => t.id !== trader.id));
  };

  const handleRelease = (trader) => {
    setTraders(prev => prev.filter(t => t.id !== trader.id));
    setLog(prev => [`Released ${trader.shipName} without incident.`, ...prev].slice(5));
  };

  if (!canPirateHere) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-orange-500">
          <Skull className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Piracy not viable in this system.</p>
          <p className="text-orange-700 text-xs mt-1">Travel to a Low Security or Anarchy system to find vulnerable traders.</p>
          <p className="text-orange-800 text-[10px] mt-2">Current security: {system?.security || 'unknown'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Piracy — {system.name}</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">
          Security: <span className="text-red-400">{system.security}</span> · Scan for NPC traders and demand their cargo.
          Warning: piracy is a crime and increases notoriety. Traders may fight back.
        </div>
      </div>

      {/* Scan button */}
      <button
        onClick={handleScan}
        disabled={scanning}
        className={`w-full py-2 border text-xs font-bold flex items-center justify-center gap-1 ${scanning ? 'border-orange-950 text-orange-800 animate-pulse' : 'border-orange-500 text-orange-300 hover:bg-orange-950/50'}`}
      >
        <ScanLine className="w-3.5 h-3.5" /> {scanning ? 'SCANNING...' : 'SCAN FOR TRADERS'}
      </button>

      {/* Combat power */}
      <div className="border border-orange-950 p-2 text-[10px] text-orange-600">
        Your combat power: <span className="text-orange-300">{playerCombatPower}</span> · Hull: <span className="text-orange-300">{state.ship.integrity?.toFixed(0)}%</span>
      </div>

      {/* Result modal */}
      {result && (
        <div className={`border p-3 space-y-1 ${result.type === 'combat_loss' ? 'border-red-800' : 'border-green-800'}`}>
          <div className={`text-xs font-bold ${result.type === 'combat_loss' ? 'text-red-400' : 'text-green-400'}`}>
            {result.type === 'comply' && '✓ CARGO SURRENDERED'}
            {result.type === 'combat_win' && '⚔ COMBAT VICTORY — CARGO SEIZED'}
            {result.type === 'combat_loss' && '✗ COMBAT DEFEAT — TARGET ESCAPED'}
          </div>
          {result.cargo && (
            <div className="text-[10px] text-orange-400">
              {result.cargo.map((c, i) => (
                <div key={i}><Package className="w-2.5 h-2.5 inline" /> {c.name} ×{c.qty}</div>
              ))}
            </div>
          )}
          {result.damage > 0 && <div className="text-red-500 text-[10px]">Hull damage taken: {result.damage.toFixed(0)}</div>}
          <button onClick={() => setResult(null)} className="text-[10px] text-orange-600 hover:text-orange-400 border border-orange-900 px-2 py-0.5 mt-1">DISMISS</button>
        </div>
      )}

      {/* Trader contacts */}
      {traders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Trader Contacts</h3>
          {traders.map(trader => (
            <div key={trader.id} className="border border-orange-900 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-orange-300 text-xs font-bold">{trader.shipName}</span>
                </div>
                <span className="text-[10px] text-orange-700">CP: {trader.combatPower}</span>
              </div>
              <div className="text-[10px] text-orange-600">Cargo manifest:</div>
              <div className="flex flex-wrap gap-1">
                {trader.cargo.map((c, i) => (
                  <span key={i} className="text-[9px] border border-orange-950 text-orange-500 px-1.5 py-0.5">
                    <Package className="w-2 h-2 inline" /> {c.name} ×{c.qty}
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDemand(trader)}
                  className="flex-1 py-1.5 border border-red-700 text-red-400 hover:bg-red-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Swords className="w-3 h-3" /> DEMAND CARGO
                </button>
                <button
                  onClick={() => handleRelease(trader)}
                  className="px-3 py-1.5 border border-orange-800 text-orange-500 hover:bg-orange-950/30 text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Shield className="w-3 h-3" /> RELEASE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity log */}
      {log.length > 0 && (
        <div className="border border-orange-950 p-2 space-y-0.5">
          <div className="text-[10px] text-orange-700 uppercase">Activity Log</div>
          {log.map((entry, i) => (
            <div key={i} className="text-[10px] text-orange-500">{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}