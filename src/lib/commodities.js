// Commodity definitions for the trading system
// Legally distinct from Elite Dangerous but inspired by its economy model

export const COMMODITY_CATEGORIES = {
  MINERALS: 'Minerals',
  METALS: 'Metals',
  CHEMICALS: 'Chemicals',
  CONSUMER: 'Consumer Items',
  FOODS: 'Foods',
  INDUSTRIAL: 'Industrial Materials',
  MEDICAL: 'Medical',
  TECHNOLOGY: 'Technology',
  SALVAGE: 'Salvage',
  LEGAL_DRUGS: 'Legal Drugs',
  RAW: 'Raw Materials',
};

// Each commodity: id, name, category, basePrice, avgSupply, avgDemand, legality (0=legal, 1=restricted)
export const COMMODITIES = [
  // Minerals
  { id: 'water', name: 'Water', category: COMMODITY_CATEGORIES.MINERALS, basePrice: 120, legality: 0 },
  { id: 'liquid_oxygen', name: 'Liquid Oxygen', category: COMMODITY_CATEGORIES.MINERALS, basePrice: 180, legality: 0 },
  { id: 'hydrogen_fuel', name: 'Hydrogen Fuel', category: COMMODITY_CATEGORIES.MINERALS, basePrice: 90, legality: 0 },
  { id: 'helium', name: 'Helium', category: COMMODITY_CATEGORIES.MINERALS, basePrice: 150, legality: 0 },
  { id: 'silicon', name: 'Silicon', category: COMMODITY_CATEGORIES.MINERALS, basePrice: 200, legality: 0 },
  { id: 'rock_salt', name: 'Rock Salt', category: COMMODITY_CATEGORIES.MINERALS, basePrice: 80, legality: 0 },

  // Metals
  { id: 'iron', name: 'Iron', category: COMMODITY_CATEGORIES.METALS, basePrice: 170, legality: 0 },
  { id: 'copper', name: 'Copper', category: COMMODITY_CATEGORIES.METALS, basePrice: 250, legality: 0 },
  { id: 'aluminium', name: 'Aluminium', category: COMMODITY_CATEGORIES.METALS, basePrice: 300, legality: 0 },
  { id: 'titanium', name: 'Titanium', category: COMMODITY_CATEGORIES.METALS, basePrice: 450, legality: 0 },
  { id: 'platinum', name: 'Platinum', category: COMMODITY_CATEGORIES.METALS, basePrice: 1200, legality: 0 },
  { id: 'palladium', name: 'Palladium', category: COMMODITY_CATEGORIES.METALS, basePrice: 3000, legality: 0 },
  { id: 'iridium', name: 'Iridium', category: COMMODITY_CATEGORIES.METALS, basePrice: 4500, legality: 0 },
  { id: 'indite', name: 'Indite', category: COMMODITY_CATEGORIES.METALS, basePrice: 2100, legality: 0 },
  { id: 'bertrandite', name: 'Bertrandite', category: COMMODITY_CATEGORIES.METALS, basePrice: 1800, legality: 0 },
  { id: 'coltan', name: 'Coltan', category: COMMODITY_CATEGORIES.METALS, basePrice: 1500, legality: 0 },
  { id: 'gallite', name: 'Gallite', category: COMMODITY_CATEGORIES.METALS, basePrice: 2200, legality: 0 },

  // Chemicals
  { id: 'explosives', name: 'Explosives', category: COMMODITY_CATEGORIES.CHEMICALS, basePrice: 400, legality: 0 },
  { id: 'polymers', name: 'Polymers', category: COMMODITY_CATEGORIES.CHEMICALS, basePrice: 320, legality: 0 },
  { id: 'semiconductors', name: 'Semiconductors', category: COMMODITY_CATEGORIES.CHEMICALS, basePrice: 700, legality: 0 },
  { id: 'superconductors', name: 'Superconductors', category: COMMODITY_CATEGORIES.CHEMICALS, basePrice: 3500, legality: 0 },
  { id: 'hydrogen_peroxide', name: 'Hydrogen Peroxide', category: COMMODITY_CATEGORIES.CHEMICALS, basePrice: 260, legality: 0 },
  { id: 'agricultural_med', name: 'Agri-Medicines', category: COMMODITY_CATEGORIES.CHEMICALS, basePrice: 600, legality: 0 },

  // Consumer Items
  { id: 'domestic_appliances', name: 'Domestic Appliances', category: COMMODITY_CATEGORIES.CONSUMER, basePrice: 480, legality: 0 },
  { id: 'clothing', name: 'Clothing', category: COMMODITY_CATEGORIES.CONSUMER, basePrice: 200, legality: 0 },
  { id: 'consumer_tech', name: 'Consumer Technology', category: COMMODITY_CATEGORIES.CONSUMER, basePrice: 3700, legality: 0 },
  { id: 'geology_equipment', name: 'Geology Equipment', category: COMMODITY_CATEGORIES.CONSUMER, basePrice: 1200, legality: 0 },
  { id: 'aquaponic_systems', name: 'Aquaponic Systems', category: COMMODITY_CATEGORIES.CONSUMER, basePrice: 1800, legality: 0 },

  // Foods
  { id: 'basic_food', name: 'Basic Foodstuffs', category: COMMODITY_CATEGORIES.FOODS, basePrice: 100, legality: 0 },
  { id: 'fish', name: 'Fish', category: COMMODITY_CATEGORIES.FOODS, basePrice: 250, legality: 0 },
  { id: 'grain', name: 'Grain', category: COMMODITY_CATEGORIES.FOODS, basePrice: 130, legality: 0 },
  { id: 'tea', name: 'Tea', category: COMMODITY_CATEGORIES.FOODS, basePrice: 350, legality: 0 },
  { id: 'fruit_veg', name: 'Fruit and Vegetables', category: COMMODITY_CATEGORIES.FOODS, basePrice: 180, legality: 0 },
  { id: 'synthetic_meat', name: 'Synthetic Meat', category: COMMODITY_CATEGORIES.FOODS, basePrice: 220, legality: 0 },
  { id: 'coffee', name: 'Coffee', category: COMMODITY_CATEGORIES.FOODS, basePrice: 400, legality: 0 },

  // Industrial Materials
  { id: 'ceramic_composites', name: 'Ceramic Composites', category: COMMODITY_CATEGORIES.INDUSTRIAL, basePrice: 350, legality: 0 },
  { id: 'insulating_membrane', name: 'Insulating Membrane', category: COMMODITY_CATEGORIES.INDUSTRIAL, basePrice: 410, legality: 0 },
  { id: 'structural_regulators', name: 'Structural Regulators', category: COMMODITY_CATEGORIES.INDUSTRIAL, basePrice: 900, legality: 0 },
  { id: 'power_generators', name: 'Power Generators', category: COMMODITY_CATEGORIES.INDUSTRIAL, basePrice: 1500, legality: 0 },
  { id: 'thermal_laquers', name: 'Thermal Laquers', category: COMMODITY_CATEGORIES.INDUSTRIAL, basePrice: 280, legality: 0 },

  // Medical
  { id: 'medicines', name: 'Medicines', category: COMMODITY_CATEGORIES.MEDICAL, basePrice: 800, legality: 0 },
  { id: 'performance_enhancers', name: 'Performance Enhancers', category: COMMODITY_CATEGORIES.MEDICAL, basePrice: 2200, legality: 1 },
  { id: 'progenitor_cells', name: 'Progenitor Cells', category: COMMODITY_CATEGORIES.MEDICAL, basePrice: 3400, legality: 0 },

  // Technology
  { id: 'computer_components', name: 'Computer Components', category: COMMODITY_CATEGORIES.TECHNOLOGY, basePrice: 500, legality: 0 },
  { id: 'robotics', name: 'Robotics', category: COMMODITY_CATEGORIES.TECHNOLOGY, basePrice: 1900, legality: 0 },
  { id: 'advanced_catalysers', name: 'Advanced Catalysers', category: COMMODITY_CATEGORIES.TECHNOLOGY, basePrice: 1100, legality: 0 },
  { id: 'micro_weave_cooling_hoses', name: 'Micro-Weave Cooling Hoses', category: COMMODITY_CATEGORIES.TECHNOLOGY, basePrice: 340, legality: 0 },
  { id: 'hn_shock_mounts', name: 'HN Shock Mounts', category: COMMODITY_CATEGORIES.TECHNOLOGY, basePrice: 380, legality: 0 },

  // Salvage
  { id: 'scrap_metal', name: 'Scrap Metal', category: COMMODITY_CATEGORIES.SALVAGE, basePrice: 60, legality: 0 },
  { id: 'biowaste', name: 'Biowaste', category: COMMODITY_CATEGORIES.SALVAGE, basePrice: 110, legality: 0 },
  { id: 'ancient_artifacts', name: 'Ancient Artifacts', category: COMMODITY_CATEGORIES.SALVAGE, basePrice: 8000, legality: 0 },
  { id: 'occupation_certs', name: 'Occupation Certificates', category: COMMODITY_CATEGORIES.SALVAGE, basePrice: 2500, legality: 0 },

  // Legal Drugs
  { id: 'tobacco', name: 'Tobacco', category: COMMODITY_CATEGORIES.LEGAL_DRUGS, basePrice: 700, legality: 0 },
  { id: 'wine', name: 'Wine', category: COMMODITY_CATEGORIES.LEGAL_DRUGS, basePrice: 500, legality: 0 },
  { id: 'beer', name: 'Beer', category: COMMODITY_CATEGORIES.LEGAL_DRUGS, basePrice: 300, legality: 0 },
  { id: 'narcotics', name: 'Narcotics', category: COMMODITY_CATEGORIES.LEGAL_DRUGS, basePrice: 5000, legality: 1 },

  // Raw (mining yield)
  { id: 'pristine_diamond', name: 'Pristine Diamond', category: COMMODITY_CATEGORIES.RAW, basePrice: 6000, legality: 0 },
  { id: 'painite', name: 'Painite', category: COMMODITY_CATEGORIES.RAW, basePrice: 12000, legality: 0 },
  { id: 'alexandrite', name: 'Alexandrite', category: COMMODITY_CATEGORIES.RAW, basePrice: 9000, legality: 0 },
  { id: 'low_temp_diamond', name: 'Low Temperature Diamond', category: COMMODITY_CATEGORIES.RAW, basePrice: 7000, legality: 0 },
  { id: 'tritium', name: 'Tritium', category: COMMODITY_CATEGORIES.RAW, basePrice: 4000, legality: 0 },
  { id: 'bromellite', name: 'Bromellite', category: COMMODITY_CATEGORIES.RAW, basePrice: 8500, legality: 0 },
  { id: 'void_opals', name: 'Void Opals', category: COMMODITY_CATEGORIES.RAW, basePrice: 10000, legality: 0 },
  { id: 'core_minerals', name: 'Core Minerals', category: COMMODITY_CATEGORIES.RAW, basePrice: 2000, legality: 0 },
  { id: 'water_geode', name: 'Water Geode', category: COMMODITY_CATEGORIES.RAW, basePrice: 3000, legality: 0 },
  { id: 'rough_opals', name: 'Rough Opals', category: COMMODITY_CATEGORIES.RAW, basePrice: 4500, legality: 0 },
];

export const COMMODITY_MAP = COMMODITIES.reduce((map, c) => { map[c.id] = c; return map; }, {});

// Economy types and their buy/sell modifiers per commodity category
export const ECONOMY_TYPES = [
  { id: 'extraction', name: 'Extraction', produces: ['MINERALS', 'METALS', 'RAW'], consumes: ['CONSUMER', 'FOODS', 'MEDICAL', 'TECHNOLOGY'] },
  { id: 'refinery', name: 'Refinery', produces: ['METALS', 'CHEMICALS'], consumes: ['MINERALS', 'INDUSTRIAL', 'FOODS'] },
  { id: 'industrial', name: 'Industrial', produces: ['INDUSTRIAL', 'TECHNOLOGY', 'CHEMICALS'], consumes: ['METALS', 'MINERALS', 'FOODS', 'CONSUMER'] },
  { id: 'agriculture', name: 'Agriculture', produces: ['FOODS', 'LEGAL_DRUGS'], consumes: ['INDUSTRIAL', 'TECHNOLOGY', 'MEDICAL'] },
  { id: 'high_tech', name: 'High Tech', produces: ['TECHNOLOGY', 'MEDICAL', 'CONSUMER'], consumes: ['METALS', 'CHEMICALS', 'INDUSTRIAL'] },
  { id: 'service', name: 'Service', produces: ['CONSUMER', 'SALVAGE'], consumes: ['FOODS', 'TECHNOLOGY', 'MEDICAL'] },
  { id: 'military', name: 'Military', produces: ['INDUSTRIAL', 'TECHNOLOGY'], consumes: ['FOODS', 'MEDICAL', 'CONSUMER'] },
  { id: 'colony', name: 'Colony', produces: ['FOODS', 'SALVAGE'], consumes: ['TECHNOLOGY', 'MEDICAL', 'INDUSTRIAL', 'CONSUMER'] },
  { id: 'tourism', name: 'Tourism', produces: ['CONSUMER', 'LEGAL_DRUGS'], consumes: ['FOODS', 'TECHNOLOGY'] },
];

export function getCommodityById(id) {
  return COMMODITY_MAP[id];
}