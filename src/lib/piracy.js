// Piracy — NPC trader interdiction and cargo theft

import { COMMODITIES } from './commodities';

const TRADER_SHIPS = ['Type-6 Transporter', 'Hauler', 'Cobra Mk-III', 'Adder', 'Type-7 Transporter', 'Dolphin', 'Python', 'Type-9 Heavy'];

export function canPirate(system) {
  return system?.security === 'anarchy' || system?.security === 'low';
}

export function generateNPCTrader(systemSecurity) {
  const shipName = TRADER_SHIPS[Math.floor(Math.random() * TRADER_SHIPS.length)];
  const cargoCount = 1 + Math.floor(Math.random() * 3);
  const cargo = [];
  const usedIds = new Set();
  for (let i = 0; i < cargoCount; i++) {
    let comm;
    let attempts = 0;
    do {
      comm = COMMODITIES[Math.floor(Math.random() * Math.min(80, COMMODITIES.length))];
      attempts++;
    } while (usedIds.has(comm.id) && attempts < 10);
    usedIds.add(comm.id);
    const qty = 2 + Math.floor(Math.random() * 12);
    cargo.push({ commodity: comm.id, qty, name: comm.name });
  }
  // Compliance chance: lower in anarchy, higher in low-sec
  const compliance = systemSecurity === 'anarchy' ? 0.4 + Math.random() * 0.3 : 0.6 + Math.random() * 0.3;
  // Combat power: weaker traders in low-sec
  const combatPower = systemSecurity === 'anarchy' ? 30 + Math.floor(Math.random() * 70) : 15 + Math.floor(Math.random() * 40);
  return {
    id: `trader_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    shipName,
    cargo,
    compliance,
    combatPower,
    willFight: Math.random() > compliance,
  };
}

export function resolvePiracy(playerCombatPower, trader) {
  const traderPower = trader.combatPower * 2;
  if (playerCombatPower >= traderPower) {
    return { success: true, fled: false, damage: Math.floor(trader.combatPower * 0.3) };
  }
  // Player loses — takes more damage, trader may flee
  return { success: false, fled: true, damage: Math.floor(trader.combatPower * 0.6) };
}