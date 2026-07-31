// Outfitting Screen — Coriolis-style module management
import React, { useState, useMemo } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import {
  MODULES, SHIP_SLOTS, computeShipStats, getModulesForSlot,
  getDefaultModules, getModulePrice, ENGINEERING_BLUEPRINTS,
  HARDPOINT_ENGINEERING, HARDPOINT_SIZES, SLOT_LABELS,
} from '@/lib/shipOutfitting';
import { Wrench, X, Zap, Shield, Package, Gauge, Weight, Crosshair, Settings } from 'lucide-react';

const STAT_KEYS = ['cargo','shield','power','range','damage','thrust','oxygen','scanRange','distro','scoopRate','fuel','hull','limpets','repair','srvs','fighters','bins','shieldBoost','moduleProtection'];

function getModStat(mod) {
  if (!mod) return { value: '—', unit: '' };
  const key = STAT_KEYS.find(k => mod[k] !== undefined);
  const val = key ? mod[key] : '—';
  let unit = '';
  if (mod.statLabel === 'Shield MJ') unit = ' MJ';
  else if (mod.statLabel === 'Cargo') unit = 'T';
  else if (mod.statLabel === 'Fuel T') unit = 'T';
  else if (mod.type === 'power_plant') unit = ' MW';
  return { value: val, unit };
}

export default function OutfittingScreen() {
  const { state, getSystemData, update, addCredits } = useGameState();
  const systemData = getSystemData();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [engineeringSlot, setEngineeringSlot] = useState(null);

  const shipType = SHIP_MAP[state.ship.type];
  const slots = SHIP_SLOTS[state.ship.type];
  const modules = state.ship.modules || getDefaultModules(state.ship.type);
  const stats = useMemo(() => computeShipStats(state.ship.type, modules), [state.ship.type, modules]);
  const isDocked = state.currentLocation === 'station';

  if (!slots) {
    return <div className="p-4 text-orange-500">No outfitting data for this ship.</div>;
  }

  const equipModule = (slotKey, moduleId) => {
    const mod = MODULES[moduleId];
    if (!mod) return;
    const isSb = state.saveMode === 'sandbox';
    const price = isSb ? 0 : getModulePrice(moduleId);
    const currentModId = modules[slotKey];
    const refund = (!isSb && currentModId) ? Math.floor(getModulePrice(currentModId) * 0.9) : 0;
    const netCost = price - refund;
    if (!isSb && netCost > state.credits) {
      alert('INSUFFICIENT CREDITS');
      return;
    }
    if (!isSb && netCost !== 0) addCredits(-netCost);
    const newModules = { ...(state.ship.modules || modules), [slotKey]: moduleId };
    const newStats = computeShipStats(state.ship.type, newModules);
    update(prev => ({
      ...prev,
      ship: { ...prev.ship, modules: newModules, cargoCapacity: newStats.cargoCapacity, fuelCapacity: newStats.fuelCapacity },
    }));
    setSelectedSlot(null);
  };

  const unequipModule = (slotKey) => {
    const currentModId = modules[slotKey];
    if (!currentModId) return;
    const isSb = state.saveMode === 'sandbox';
    const refund = isSb ? 0 : Math.floor(getModulePrice(currentModId) * 0.9);
    if (!isSb && refund > 0) addCredits(refund);
    const newModules = { ...modules };
    delete newModules[slotKey];
    const newStats = computeShipStats(state.ship.type, newModules);
    update(prev => ({
      ...prev,
      ship: { ...prev.ship, modules: newModules, cargoCapacity: newStats.cargoCapacity, fuelCapacity: newStats.fuelCapacity },
    }));
    setSelectedSlot(null);
  };

  const applyEngineering = (slotKey, blueprintId, level) => {
    const newModules = { ...(state.ship.modules || modules) };
    if (!newModules.__engineering) newModules.__engineering = {};
    newModules.__engineering = { ...newModules.__engineering, [slotKey]: { blueprint: blueprintId, level } };
    update(prev => ({
      ...prev,
      ship: { ...prev.ship, modules: newModules },
    }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            <h2 className="text-orange-300 font-bold uppercase">Outfitting — {state.ship.name}</h2>
          </div>
          <span className="text-orange-400 text-xs">{state.credits.toLocaleString()} CR</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <StatPill icon={Package} label="Cargo" value={`${stats.cargoCapacity}T`} />
          <StatPill icon={Gauge} label="Jump Range" value={`${stats.jumpRange} LY`} />
          <StatPill icon={Shield} label="Shield" value={`${stats.shield} MJ`} />
          <StatPill icon={Zap} label="Power" value={`${stats.power} MW`} />
          <StatPill icon={Weight} label="Mass" value={`${stats.mass}T`} />
          <StatPill icon={Crosshair} label="DPS" value={stats.totalDamage} />
        </div>
        {!isDocked && <div className="text-orange-700 text-[10px] mt-2">⚠ Dock at a station to modify your loadout.</div>}
      </div>

      <SlotSection title="Core Internals" slots={Object.entries(slots.core).map(([key, size]) => ({ key: `core_${key}`, label: SLOT_LABELS[key] || key.toUpperCase(), size, type: 'core' }))} modules={modules} onSelect={setSelectedSlot} onEngineering={setEngineeringSlot} disabled={!isDocked} />
      <SlotSection title="Optional Internals" slots={slots.optional.map((size, i) => ({ key: `opt_${i}`, label: `Size ${size}`, size, type: 'optional' }))} modules={modules} onSelect={setSelectedSlot} onEngineering={setEngineeringSlot} disabled={!isDocked} />
      <SlotSection title="Hardpoints" slots={slots.hardpoints.map((size, i) => ({ key: `hp_${i}`, label: HARDPOINT_SIZES[size] || `Size ${size}`, size, type: 'hardpoint' }))} modules={modules} onSelect={setSelectedSlot} onEngineering={setEngineeringSlot} disabled={!isDocked} />
      <SlotSection title="Utility Mounts" slots={Array.from({ length: slots.utility }, (_, i) => ({ key: `util_${i}`, label: `Utility ${i+1}`, size: 0, type: 'utility' }))} modules={modules} onSelect={setSelectedSlot} onEngineering={setEngineeringSlot} disabled={!isDocked} />

      {selectedSlot && (
        <ModulePicker
          slot={selectedSlot}
          currentModuleId={modules[selectedSlot.key]}
          onEquip={(modId) => equipModule(selectedSlot.key, modId)}
          onUnequip={() => unequipModule(selectedSlot.key)}
          onClose={() => setSelectedSlot(null)}
          credits={state.credits}
          isSandbox={state.saveMode === 'sandbox'}
        />
      )}

      {engineeringSlot && (
        <EngineeringPanel
          slotKey={engineeringSlot}
          moduleId={modules[engineeringSlot]}
          currentEng={(modules.__engineering || {})[engineeringSlot]}
          onApply={applyEngineering}
          onClose={() => setEngineeringSlot(null)}
          outfittingLevel={state.saveMode === 'sandbox' ? 5 : Math.min(5, Math.max(1, Math.ceil(Math.log10((state.currentSystem.population || 1) + 1))))}
        />
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="border border-orange-900 p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-orange-700 text-[9px] uppercase"><Icon className="w-2.5 h-2.5" />{label}</div>
      <div className="text-orange-300 font-bold text-sm">{value}</div>
    </div>
  );
}

function SlotSection({ title, slots, modules, onSelect, onEngineering, disabled }) {
  return (
    <div className="border border-orange-900 p-3">
      <h3 className="text-orange-500 text-xs font-bold uppercase mb-2">{title} ({slots.length})</h3>
      <div className="space-y-1">
        {slots.map(slot => {
          const mod = modules[slot.key] ? MODULES[modules[slot.key]] : null;
          const stat = getModStat(mod);
          return (
            <div key={slot.key} className={`flex items-center justify-between border p-2 text-xs ${mod ? 'border-orange-800' : 'border-orange-950'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 text-[10px] uppercase">{slot.label}</span>
                  <span className="text-orange-800 text-[9px]">Size {slot.size}</span>
                </div>
                <div className="text-orange-300 truncate">{mod ? mod.name : <span className="text-orange-800">— Empty —</span>}</div>
                {mod && <div className="text-orange-600 text-[9px]">{mod.statLabel}: {stat.value}{stat.unit}</div>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => !disabled && onSelect(slot)} disabled={disabled} className="px-2 py-1 border border-orange-700 text-orange-400 hover:bg-orange-950/30 text-[10px] disabled:opacity-30">
                  {mod ? 'CHANGE' : 'EQUIP'}
                </button>
                {mod && (
                  <button onClick={() => onEngineering(slot.key)} className="px-2 py-1 border border-purple-800 text-purple-400 hover:bg-purple-950/30 text-[10px]">
                    <Settings className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModulePicker({ slot, currentModuleId, onEquip, onUnequip, onClose, credits, isSandbox = false }) {
  const [filter, setFilter] = useState('all');
  const available = useMemo(() => {
    const mods = getModulesForSlot(slot.type, slot.size, null);
    if (slot.type === 'core') {
      const coreAbbr = slot.key.replace('core_', '');
      return mods.filter(m => m.id.startsWith(coreAbbr + '_'));
    }
    return mods;
  }, [slot]);

  const filtered = filter === 'all' ? available : available.filter(m => m.class === filter || (filter === 'premium' && m.premium));
  const currentMod = currentModuleId ? MODULES[currentModuleId] : null;
  const refund = currentMod ? Math.floor(getModulePrice(currentMod.id) * 0.9) : 0;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[80vh] flex flex-col border border-orange-700 bg-black" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-orange-900 p-3">
          <h3 className="text-orange-300 font-bold text-sm uppercase">Select Module — {slot.label} (Size {slot.size})</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-orange-600" /></button>
        </div>
        <div className="flex gap-1 p-2 border-b border-orange-900">
          {['all', 'E', 'D', 'C', 'B', 'A', 'premium'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2 py-0.5 border text-[10px] ${filter === f ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{f === 'premium' ? 'EXP' : f.toUpperCase()}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 && <div className="text-orange-700 text-xs text-center py-4">No modules available.</div>}
          {filtered.map(mod => {
            const price = isSandbox ? 0 : getModulePrice(mod.id);
            const netCost = isSandbox ? 0 : price - refund;
            const canAfford = isSandbox || netCost <= credits;
            const isEquipped = currentModuleId === mod.id;
            const stat = getModStat(mod);
            return (
              <button key={mod.id} onClick={() => !isEquipped && onEquip(mod.id)} disabled={isEquipped || !canAfford} className={`w-full text-left border p-2 text-xs ${isEquipped ? 'border-green-700' : canAfford ? 'border-orange-900 hover:border-orange-700' : 'border-gray-900 opacity-40'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-bold ${mod.premium ? 'text-yellow-400' : 'text-orange-300'}`}>{mod.name}</span>
                    {mod.premium && <span className="text-yellow-500 text-[9px] ml-1">EXPANDED</span>}
                  </div>
                  <span className="text-orange-400">{isEquipped ? '✓ EQUIPPED' : isSandbox ? 'FREE' : netCost >= 0 ? `${netCost.toLocaleString()} CR` : `+${Math.abs(netCost).toLocaleString()} CR`}</span>
                </div>
                <div className="text-orange-600 text-[9px]">{mod.statLabel}: {stat.value}{stat.unit} · Mass: {mod.mass}T</div>
              </button>
            );
          })}
        </div>
        {currentMod && (
          <div className="border-t border-orange-900 p-2">
            <button onClick={onUnequip} className="w-full py-1.5 border border-red-900 text-red-500 hover:bg-red-950/30 text-xs">
              SELL {currentMod.name} (+{refund.toLocaleString()} CR)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EngineeringPanel({ slotKey, moduleId, currentEng, onApply, onClose, outfittingLevel }) {
  const mod = MODULES[moduleId];
  if (!mod) return null;
  const blueprints = ENGINEERING_BLUEPRINTS[mod.type] || HARDPOINT_ENGINEERING[mod.type] || [];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm border border-purple-700 bg-black" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-purple-900 p-3">
          <h3 className="text-purple-300 font-bold text-sm uppercase">Engineering — {mod.name}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-purple-600" /></button>
        </div>
        <div className="p-3 space-y-3">
          <div className="text-purple-600 text-[10px]">Station Engineering Level: {outfittingLevel}/5 — Can engineer up to grade {outfittingLevel}.</div>
          {blueprints.length === 0 && <div className="text-purple-700 text-xs text-center py-4">No engineering available for this module type.</div>}
          {blueprints.map(bp => (
            <div key={bp.id} className="border border-purple-900 p-2">
              <div className="text-purple-300 font-bold text-xs">{bp.name}</div>
              <div className="text-purple-600 text-[9px] mb-2">{bp.desc}</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(lvl => {
                  const canEngineer = lvl <= outfittingLevel;
                  const isActive = currentEng?.blueprint === bp.id && currentEng?.level === lvl;
                  return (
                    <button key={lvl} onClick={() => canEngineer && onApply(slotKey, bp.id, lvl)} disabled={!canEngineer} className={`flex-1 py-1 border text-[10px] ${isActive ? 'border-purple-500 bg-purple-950/40 text-purple-300' : canEngineer ? 'border-purple-800 text-purple-500 hover:bg-purple-950/30' : 'border-gray-900 text-gray-800 cursor-not-allowed'}`}>
                      G{lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}