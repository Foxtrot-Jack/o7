// Materials Locker — displays all non-cargo materials collected by the player
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { FlaskConical, Box } from 'lucide-react';

const MATERIAL_INFO = {
  iron: { name: 'Iron', grade: 1 },
  silicon: { name: 'Silicon', grade: 1 },
  carbon: { name: 'Carbon', grade: 1 },
  water: { name: 'Water', grade: 1 },
  nickel: { name: 'Nickel', grade: 1 },
  phosphorus: { name: 'Phosphorus', grade: 2 },
  sulphur: { name: 'Sulphur', grade: 2 },
  chromium: { name: 'Chromium', grade: 2 },
  manganese: { name: 'Manganese', grade: 2 },
  zinc: { name: 'Zinc', grade: 2 },
  germanium: { name: 'Germanium', grade: 3 },
  tin: { name: 'Tin', grade: 3 },
  tungsten: { name: 'Tungsten', grade: 3 },
  mercury: { name: 'Mercury', grade: 3 },
  platinum: { name: 'Platinum', grade: 4 },
  palladium: { name: 'Palladium', grade: 4 },
  iridium: { name: 'Iridium', grade: 4 },
  painite: { name: 'Painite', grade: 5 },
  pristine_diamond: { name: 'Pristine Diamond', grade: 5 },
  low_temp_diamond: { name: 'Low Temp Diamond', grade: 5 },
  tritium: { name: 'Tritium', grade: 4 },
  bromellite: { name: 'Bromellite', grade: 4 },
  void_opals: { name: 'Void Opals', grade: 5 },
  alexandrite: { name: 'Alexandrite', grade: 5 },
  core_minerals: { name: 'Core Minerals', grade: 4 },
};

const GRADE_COLORS = {
  1: 'text-gray-400 border-gray-700',
  2: 'text-green-400 border-green-800',
  3: 'text-blue-400 border-blue-800',
  4: 'text-purple-400 border-purple-800',
  5: 'text-orange-400 border-orange-700',
};

export default function MaterialsLocker() {
  const { state } = useGameState();
  const materials = state.materials || {};
  const refinery = state.refinery || [];

  // Combine materials from locker and refinery
  const allMaterials = [];
  for (const [id, qty] of Object.entries(materials)) {
    if (qty > 0) {
      allMaterials.push({ id, qty, source: 'locker', ...MATERIAL_INFO[id] });
    }
  }
  for (const item of refinery) {
    if (item.qty > 0) {
      const existing = allMaterials.find(m => m.id === item.materialId);
      if (existing) {
        existing.qty += item.qty;
      } else {
        allMaterials.push({ id: item.materialId, qty: item.qty, source: 'refinery', ...MATERIAL_INFO[item.materialId] });
      }
    }
  }

  // Sort by grade (highest first), then by name
  allMaterials.sort((a, b) => (b.grade || 0) - (a.grade || 0) || a.name.localeCompare(b.name));

  const totalMaterials = allMaterials.reduce((sum, m) => sum + m.qty, 0);
  const uniqueTypes = allMaterials.length;

  return (
    <div className="space-y-3">
      <div className="border border-orange-900 p-3">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Materials Locker</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-orange-700">TOTAL UNITS: <span className="text-orange-300">{totalMaterials}</span></div>
          <div className="text-orange-700">UNIQUE TYPES: <span className="text-orange-300">{uniqueTypes}</span></div>
        </div>
        <div className="text-orange-700 text-[10px] mt-1">
          Materials are preserved even if your ship is destroyed. Used for synthesis, engineering, and warp gate construction.
        </div>
      </div>

      {allMaterials.length === 0 ? (
        <div className="text-center text-orange-700 py-8">
          <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No materials collected yet.</p>
          <p className="text-[10px] mt-1">Mine asteroids and planetary surfaces to gather materials.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {allMaterials.map(mat => {
            const grade = mat.grade || 1;
            const colorClass = GRADE_COLORS[grade] || GRADE_COLORS[1];
            return (
              <div key={mat.id} className={`flex items-center justify-between border p-2 text-xs ${colorClass}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] opacity-60">G{grade}</span>
                  <span className="font-bold">{mat.name || mat.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  {mat.source === 'refinery' && (
                    <span className="text-[8px] text-orange-700 uppercase">ref</span>
                  )}
                  <span className="font-bold">{mat.qty}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}