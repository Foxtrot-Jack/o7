// Engineering — material costs and helpers for module engineering blueprints
// Blueprints themselves are defined in shipOutfitting.js (ENGINEERING_BLUEPRINTS)

// Material cost per grade level (grade 1-5)
// Each blueprint requires materials + credits per grade
export const ENGINEERING_COSTS = {
  // Core modules
  fsd: {
    baseMaterials: { phosphorus: 2, germanium: 1 },
    materialsPerLevel: { phosphorus: 1, germanium: 1, arsenic: 1 },
    creditsPerLevel: 500000,
  },
  thrusters: {
    baseMaterials: { iron: 3, nickel: 2 },
    materialsPerLevel: { iron: 2, nickel: 1, chromium: 1 },
    creditsPerLevel: 400000,
  },
  power_plant: {
    baseMaterials: { carbon: 2, nickel: 2 },
    materialsPerLevel: { carbon: 2, nickel: 2, manganese: 1 },
    creditsPerLevel: 450000,
  },
  shield_generator: {
    baseMaterials: { tin: 2, tungsten: 1 },
    materialsPerLevel: { tin: 1, tungsten: 1, zinc: 2 },
    creditsPerLevel: 600000,
  },
  // Hardpoints
  pl: { baseMaterials: { iron: 2 }, materialsPerLevel: { iron: 2, sulphur: 1 }, creditsPerLevel: 200000 },
  bl: { baseMaterials: { iron: 2, carbon: 1 }, materialsPerLevel: { iron: 2, carbon: 1, phosphorus: 1 }, creditsPerLevel: 250000 },
  bml: { baseMaterials: { carbon: 2, germanium: 1 }, materialsPerLevel: { carbon: 2, germanium: 1, arsenic: 1 }, creditsPerLevel: 300000 },
  mc: { baseMaterials: { iron: 3 }, materialsPerLevel: { iron: 3, nickel: 1 }, creditsPerLevel: 200000 },
  can: { baseMaterials: { iron: 2, tungsten: 1 }, materialsPerLevel: { iron: 2, tungsten: 1, chromium: 1 }, creditsPerLevel: 350000 },
  rg: { baseMaterials: { tungsten: 2, mercury: 1 }, materialsPerLevel: { tungsten: 2, mercury: 1, selenium: 1 }, creditsPerLevel: 400000 },
  mr: { baseMaterials: { iron: 2, phosphorus: 2 }, materialsPerLevel: { iron: 2, phosphorus: 2, sulphur: 1 }, creditsPerLevel: 250000 },
  pa: { baseMaterials: { tungsten: 2, mercury: 2 }, materialsPerLevel: { tungsten: 2, mercury: 2, technetium: 1 }, creditsPerLevel: 500000 },
  tor: { baseMaterials: { iron: 3, phosphorus: 3 }, materialsPerLevel: { iron: 3, phosphorus: 3, chromium: 2 }, creditsPerLevel: 400000 },
};

export function getEngineeringCost(moduleType, currentLevel, targetLevel) {
  const costDef = ENGINEERING_COSTS[moduleType];
  if (!costDef) return null;
  const materials = {};
  for (let lvl = currentLevel + 1; lvl <= targetLevel; lvl++) {
    for (const [mat, qty] of Object.entries(costDef.baseMaterials)) {
      materials[mat] = (materials[mat] || 0) + qty;
    }
    for (const [mat, qty] of Object.entries(costDef.materialsPerLevel)) {
      materials[mat] = (materials[mat] || 0) + qty * (lvl - 1);
    }
  }
  const credits = costDef.creditsPerLevel * (targetLevel - currentLevel);
  return { materials, credits };
}

export function canAffordEngineering(materials, credits, cost) {
  if (!cost) return false;
  if (credits < cost.credits) return false;
  for (const [mat, qty] of Object.entries(cost.materials)) {
    if ((materials[mat] || 0) < qty) return false;
  }
  return true;
}

import { ENGINEERING_BLUEPRINTS, HARDPOINT_ENGINEERING } from './shipOutfitting';

// Get blueprints available for a module type
export function getBlueprintsForModule(moduleType) {
  return ENGINEERING_BLUEPRINTS[moduleType] || HARDPOINT_ENGINEERING[moduleType] || [];
}