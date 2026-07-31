// Combat system — menu-driven ship combat for bounty hunting and conflict zones

export const COMBAT_TACTICS = {
  AGGRESSIVE: 'aggressive',
  FOCUSED: 'focused',
  DEFENSIVE: 'defensive',
  FLEE: 'flee',
};

export const TACTIC_INFO = {
  aggressive: { name: 'Aggressive Attack', desc: 'Max damage, vulnerable to return fire', damageMod: 1.5, defenseMod: 0.6 },
  focused: { name: 'Focused Fire', desc: 'Balanced offense and defense', damageMod: 1.0, defenseMod: 1.0 },
  defensive: { name: 'Defensive Maneuver', desc: 'Minimize damage, shields recharge', damageMod: 0.5, defenseMod: 1.6 },
  flee: { name: 'Attempt Flee', desc: 'Disengage from combat', damageMod: 0, defenseMod: 0.7 },
};

// Compute combat stats from ship data
export function getCombatStats(shipIntegrity, shipClass, crewBonuses, engineering) {
  const cls = shipClass || 1;
  const maxHull = cls * 150;
  const maxShield = cls * 100;
  const baseDamage = cls * 20;
  const baseSpeed = Math.max(3, 13 - cls * 2);

  const eng = engineering || {};
  let hullMod = 1, shieldMod = 1, damageMod = 1, speedMod = 1;
  for (const [slot, e] of Object.entries(eng)) {
    if (!e?.blueprint) continue;
    const mult = 1 + 0.1 * (e.level || 1);
    if (e.blueprint === 'reinforced' && slot === 'bulkheads') hullMod *= mult;
    if (e.blueprint === 'reinforced' && slot === 'shield_generator') shieldMod *= mult;
    if (e.blueprint === 'overcharged' && slot === 'weapon') damageMod *= mult;
    if (e.blueprint === 'dirty_drives' && slot === 'thrusters') speedMod *= mult;
  }

  const combatBonus = crewBonuses?.combatDamage || 0;

  return {
    maxHull: Math.round(maxHull * hullMod),
    hull: Math.round(maxHull * hullMod * Math.max(0.05, (shipIntegrity || 100) / 100)),
    maxShield: Math.round(maxShield * shieldMod),
    shield: Math.round(maxShield * shieldMod),
    damage: Math.round(baseDamage * damageMod * (1 + combatBonus)),
    speed: Math.round(baseSpeed * speedMod),
  };
}

const PILOT_NAMES = ['Red Corsair', 'Ghost Hunter', 'Iron Claw', 'Nightshade', 'Void Reaver', 'Dread Siren', 'Black Scythe', 'Rogue Echo', 'Ash Marauder', 'Frost Wolf'];
const SHIP_NAMES = ['Sparrowhawk Mk-I', 'Peregrine Mk-II', 'Kestrel Mk-III', 'Falcon Mk-III', 'Raven', 'Condor', 'Albatross Mk-II'];

export function generateEnemy(threatLevel = 1) {
  const name = PILOT_NAMES[Math.floor(Math.random() * PILOT_NAMES.length)];
  const ship = SHIP_NAMES[Math.min(threatLevel, SHIP_NAMES.length - 1)];
  const hull = 80 + threatLevel * 50;
  const shield = 40 + threatLevel * 35;
  return {
    name,
    ship,
    maxHull: Math.round(hull),
    hull: Math.round(hull),
    maxShield: Math.round(shield),
    shield: Math.round(shield),
    damage: Math.round(12 + threatLevel * 10),
    speed: Math.round(5 + Math.random() * 5),
    bounty: Math.round((1000 + threatLevel * 2000) * (0.8 + Math.random() * 0.5)),
    threatLevel,
  };
}

// Resolve one combat round — returns updated stats + log
export function resolveCombatRound(player, enemy, tactic, wingmateBonuses) {
  const ti = TACTIC_INFO[tactic];
  const log = [];
  const p = { ...player };
  const e = { ...enemy };

  if (tactic === 'flee') {
    const speedRatio = p.speed / (p.speed + e.speed);
    let fleeChance = 0.25 + speedRatio * 0.35;
    if (wingmateBonuses?.speedBonus) fleeChance += wingmateBonuses.speedBonus;
    if (Math.random() < fleeChance) {
      return { player: p, enemy: e, fled: true, enemyDestroyed: false, playerDestroyed: false, log: ['» Successfully disengaged from combat.'] };
    }
    log.push('» Failed to escape — taking fire!');
  }

  // Player attacks
  if (tactic !== 'flee') {
    let dmg = p.damage * ti.damageMod * (0.8 + Math.random() * 0.4);
    if (wingmateBonuses?.damageBonus) dmg += wingmateBonuses.damageBonus;
    if (e.shield > 0) {
      const sd = Math.min(e.shield, dmg);
      e.shield -= sd;
      const overflow = dmg - sd;
      if (overflow > 0 && e.shield <= 0) {
        const hd = Math.min(e.hull, overflow * 0.5);
        e.hull -= hd;
        log.push(`» Hit ${enemy.name} shields for ${Math.round(sd)}, hull for ${Math.round(hd)}`);
      } else {
        log.push(`» Hit ${enemy.name} shields for ${Math.round(sd)}`);
      }
    } else {
      const hd = Math.min(e.hull, dmg);
      e.hull -= hd;
      log.push(`» Hit ${enemy.name} hull for ${Math.round(hd)} dmg`);
    }
    // Wingmate attacks
    if (wingmateBonuses?.extraAttacks) {
      for (const wa of wingmateBonuses.extraAttacks) {
        if (e.hull <= 0) break;
        let wd = wa.damage * (0.7 + Math.random() * 0.6);
        if (e.shield > 0) { e.shield -= Math.min(e.shield, wd); }
        else { e.hull -= Math.min(e.hull, wd); }
        log.push(`» Wingmate ${wa.name} fires for ${Math.round(wd)} dmg`);
      }
    }
  }

  const enemyDestroyed = e.hull <= 0;
  if (!enemyDestroyed) {
    let ed = enemy.damage * (0.7 + Math.random() * 0.6) / ti.defenseMod;
    if (p.shield > 0) {
      const sd = Math.min(p.shield, ed);
      p.shield -= sd;
      const overflow = ed - sd;
      if (overflow > 0 && p.shield <= 0) {
        const hd = Math.min(p.hull, overflow * 0.4);
        p.hull -= hd;
        log.push(`» ${enemy.name} hits your shields for ${Math.round(sd)}, hull for ${Math.round(hd)}`);
      } else {
        log.push(`» ${enemy.name} hits your shields for ${Math.round(sd)}`);
      }
    } else {
      const hd = Math.min(p.hull, ed);
      p.hull -= hd;
      log.push(`» ${enemy.name} hits your hull for ${Math.round(hd)} dmg`);
    }
  } else {
    log.push(`» ${enemy.name} DESTROYED! Bounty: ${enemy.bounty.toLocaleString()} CR`);
  }

  const playerDestroyed = p.hull <= 0;
  if (playerDestroyed) log.push('» SHIP CRITICAL — hull breach!');

  // Shield regen on defensive
  if (!playerDestroyed && p.shield < p.maxShield && tactic === 'defensive') {
    const regen = p.maxShield * 0.15;
    p.shield = Math.min(p.maxShield, p.shield + regen);
    log.push(`» Shields recharging (+${Math.round(regen)})`);
  }

  return { player: p, enemy: e, fled: false, enemyDestroyed, playerDestroyed, log };
}