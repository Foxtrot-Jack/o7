// Combat Screen — menu-driven ship combat overlay
import React, { useState, useEffect } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { getCrewBonuses } from '@/lib/crew';
import { getCombatStats, resolveCombatRound, TACTIC_INFO, COMBAT_TACTICS } from '@/lib/combat';
import { getWingmateBonuses } from '@/lib/wingmates';
import { Flame, Crosshair, Shield, LogOut, Skull, AlertTriangle } from 'lucide-react';

const TACTIC_ICONS = {
  aggressive: Flame,
  focused: Crosshair,
  defensive: Shield,
  flee: LogOut,
};

export default function CombatScreen({ enemy, context, missionId, bonds, onEnd }) {
  const { state, addCredits, completeBountyMission, update } = useGameState();
  const [playerStats, setPlayerStats] = useState(null);
  const [enemyStats, setEnemyStats] = useState({ ...enemy });
  const [log, setLog] = useState([`» Combat initiated — ${enemy.name} (${enemy.ship})`]);
  const [round, setRound] = useState(0);
  const [ended, setEnded] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const shipType = SHIP_MAP[state.ship.type];
    const shipClass = shipType?.class || (state.ship.type === 'custom' ? 2 : 1);
    const crewBonuses = getCrewBonuses(state.crew);
    const engineering = state.ship.modules?.__engineering;
    const stats = getCombatStats(state.ship.integrity, shipClass, crewBonuses, engineering);
    setPlayerStats(stats);
  }, []);

  const handleTactic = (tactic) => {
    if (ended || !playerStats) return;
    const wmBonuses = getWingmateBonuses(state.wingmates);
    const res = resolveCombatRound(playerStats, enemyStats, tactic, wmBonuses);
    setPlayerStats(res.player);
    setEnemyStats(res.enemy);
    setLog(prev => [...prev, ...res.log].slice(-12));
    setRound(r => r + 1);

    if (res.fled) {
      finishCombat('fled', res.player);
    } else if (res.enemyDestroyed) {
      finishCombat('victory', res.player);
    } else if (res.playerDestroyed) {
      finishCombat('defeat', res.player);
    }
  };

  const finishCombat = (outcome, finalPlayer) => {
    setEnded(true);
    const newIntegrity = Math.round((finalPlayer.hull / finalPlayer.maxHull) * 100);
    update(prev => ({ ...prev, ship: { ...prev.ship, integrity: Math.max(outcome === 'defeat' ? 5 : newIntegrity, 0) } }));

    if (outcome === 'victory') {
      addCredits(enemy.bounty);
      if (context === 'bounty' && missionId) completeBountyMission(missionId);
      if (context === 'conflict' && bonds) addCredits(bonds);
    }
    setResult(outcome);
    setTimeout(() => onEnd({ [outcome]: true, bounty: outcome === 'victory' ? enemy.bounty : 0, bonds }), 2000);
  };

  if (!playerStats) return <div className="p-4 text-orange-500">INITIALIZING COMBAT...</div>;

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col p-4 space-y-3 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-red-900 pb-2">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-500" />
          <span className="text-red-300 font-bold uppercase text-sm">Combat — Round {round}</span>
        </div>
        <span className="text-orange-600 text-[10px]">{context.toUpperCase()}</span>
      </div>

      {/* Enemy stats */}
      <div className="border border-red-900 p-3 space-y-2">
        <div className="text-red-300 font-bold text-xs">{enemyStats.name} — {enemyStats.ship}</div>
        <HealthBar label="SHIELD" current={enemyStats.shield} max={enemyStats.maxShield} color="bg-purple-600" />
        <HealthBar label="HULL" current={enemyStats.hull} max={enemyStats.maxHull} color="bg-red-600" />
        <div className="text-[10px] text-orange-700">DMG: {enemyStats.damage} · SPD: {enemyStats.speed} · BOUNTY: {enemyStats.bounty.toLocaleString()} CR</div>
      </div>

      {/* Combat log */}
      <div className="flex-1 border border-orange-900 p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
        <div className="text-[10px] text-orange-600 uppercase mb-1">Combat Log</div>
        {log.map((entry, i) => (
          <div key={i} className={`text-[11px] ${entry.includes('DESTROYED') || entry.includes('CRITICAL') ? 'text-red-400 font-bold' : 'text-orange-500'}`}>{entry}</div>
        ))}
      </div>

      {/* Player stats */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="text-orange-300 font-bold text-xs">{state.ship.name}</div>
        <HealthBar label="SHIELD" current={playerStats.shield} max={playerStats.maxShield} color="bg-cyan-600" />
        <HealthBar label="HULL" current={playerStats.hull} max={playerStats.maxHull} color="bg-orange-600" />
        <div className="text-[10px] text-orange-700">DMG: {playerStats.damage} · SPD: {playerStats.speed}</div>
      </div>

      {/* Result overlay */}
      {result && (
        <div className="border-2 border-orange-700 bg-black p-4 text-center">
          {result === 'victory' && <div className="text-green-400 font-bold text-lg">⚔ VICTORY — Enemy Destroyed!</div>}
          {result === 'defeat' && <div className="text-red-500 font-bold text-lg flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> SHIP CRITICAL — Emergency Escape!</div>}
          {result === 'fled' && <div className="text-yellow-400 font-bold text-lg">Escaped from combat.</div>}
        </div>
      )}

      {/* Tactic buttons */}
      {!ended && (
        <div className="grid grid-cols-2 gap-2">
          {Object.values(COMBAT_TACTICS).map(tactic => {
            const ti = TACTIC_INFO[tactic];
            const Icon = TACTIC_ICONS[tactic];
            return (
              <button
                key={tactic}
                onClick={() => handleTactic(tactic)}
                className={`border p-2 text-left transition-all ${
                  tactic === 'flee' ? 'border-yellow-800 text-yellow-500 hover:bg-yellow-950/30'
                  : tactic === 'aggressive' ? 'border-red-800 text-red-400 hover:bg-red-950/30'
                  : tactic === 'defensive' ? 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                  : 'border-orange-800 text-orange-400 hover:bg-orange-950/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{ti.name}</span>
                </div>
                <div className="text-[9px] text-orange-700 mt-0.5">{ti.desc}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HealthBar({ label, current, max, color }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] text-orange-600 mb-0.5">
        <span>{label}</span>
        <span>{Math.round(Math.max(0, current))}/{max}</span>
      </div>
      <div className="w-full h-2 bg-black border border-orange-900">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}