// Material Trader — exchange raw materials at different grades

export const MATERIAL_GRADES = {
  iron: 1, silicon: 1, carbon: 1, water: 1, nickel: 1, phosphorus: 1, sulphur: 1,
  chromium: 2, manganese: 2, zinc: 2, germanium: 2, tin: 2,
  tungsten: 3, mercury: 3, platinum: 3, palladium: 3,
  iridium: 4, painite: 4, pristine_diamond: 4, low_temp_diamond: 4, tritium: 4, bromellite: 4, void_opals: 4, alexandrite: 4, core_minerals: 4,
};

export const MATERIAL_NAMES = {
  iron: 'Iron', silicon: 'Silicon', carbon: 'Carbon', water: 'Water', nickel: 'Nickel',
  phosphorus: 'Phosphorus', sulphur: 'Sulphur', chromium: 'Chromium', manganese: 'Manganese',
  zinc: 'Zinc', germanium: 'Germanium', tin: 'Tin', tungsten: 'Tungsten', mercury: 'Mercury',
  platinum: 'Platinum', palladium: 'Palladium', iridium: 'Iridium', painite: 'Painite',
  pristine_diamond: 'Pristine Diamond', low_temp_diamond: 'Low Temp Diamond', tritium: 'Tritium',
  bromellite: 'Bromellite', void_opals: 'Void Opals', alexandrite: 'Alexandrite', core_minerals: 'Core Minerals',
};

export const GRADE_NAMES = { 1: 'Common', 2: 'Standard', 3: 'Rare', 4: 'Very Rare' };

export const ALL_MATERIAL_IDS = Object.keys(MATERIAL_GRADES);

export function getMaterialGrade(matId) {
  return MATERIAL_GRADES[matId] || 1;
}

export function getMaterialName(matId) {
  return MATERIAL_NAMES[matId] || matId;
}

// How many of `from` material you must give to receive 1 of `to` material
export function getGiveAmount(fromGrade, toGrade) {
  if (fromGrade === toGrade) return 6;
  const diff = fromGrade - toGrade;
  if (diff > 0) return Math.max(1, Math.round(6 / Math.pow(3, diff)));
  return 6 * Math.pow(3, Math.abs(diff));
}

export function getMaterialsByGrade(ownedMaterials) {
  const byGrade = { 1: [], 2: [], 3: [], 4: [] };
  for (const matId of ALL_MATERIAL_IDS) {
    const qty = ownedMaterials?.[matId] || 0;
    if (qty > 0) {
      const grade = getMaterialGrade(matId);
      byGrade[grade].push({ id: matId, name: getMaterialName(matId), qty, grade });
    }
  }
  return byGrade;
}