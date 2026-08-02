// Fleet Carrier Command — buy, name, jump, and manage carriers
import React, { useState } from 'react';
import { useGameState, SHIP_MAP } from '@/lib/gameState';
import { generateStarsInRange, distance3D } from '@/lib/galaxy';
import { Rocket, Fuel, Banknote, Plus, Edit2, Check, Anchor, Trash2 } from 'lucide-react';

const CARRIER_COST = 5000000000;
const MAX_CARRIERS = 5;

export default function CarrierScreen({ onNavigate }) {
  const { state, buyFleetCarrier, jumpCarrier, renameCarrier, decommissionCarrier } = useGameState();
  const [showBuy, setShowBuy] = useState(false);
  const [carrierName, setCarrierName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [jumpState, setJumpState] = useState(null);

  const isSandbox = state.saveMode === 'sandbox';
  const hasVendor = isSandbox || (state.currentSystem?.population || 0) > 1000000000;

  const handleBuy = () => {
    buyFleetCarrier(carrierName || 'Unnamed Carrier');
    setShowBuy(false);
    setCarrierName('');
  };

  const handleRename = (id) => {
    if (nameInput.trim()) renameCarrier(id, nameInput.trim());
    setEditingId(null);
  };

  const startJump = (carrier) => {
    const cs = carrier.system || state.currentSystem;
    const stars = generateStarsInRange(cs.x, cs.y, cs.z, 500);
    const targets = stars
      .map(s => ({ ...s, distance: distance3D({ x: cs.x, y: cs.y, z: cs.z }, { x: s.x, y: s.y, z: s.z }) }))
      .filter(s => s.distance > 1 && s.distance <= 500)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
    setJumpState({ carrierId: carrier.id, targets });
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Fleet Carrier Command</h2>
        </div>
        <div className="text-orange-700 text-xs">CARRIERS: {state.fleetCarriers.length} / {MAX_CARRIERS}</div>
      </div>

      {state.fleetCarriers.length < MAX_CARRIERS && (
        <div className="border border-orange-900 p-4 space-y-2">
          {!showBuy ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-400 text-sm font-bold">Purchase Fleet Carrier</div>
                <div className="text-orange-700 text-[10px]">{isSandbox ? 'All services available (sandbox mode).' : hasVendor ? 'Fleet carrier vendor detected in this system.' : 'No vendor here. Visit a high-population system (1B+).'}</div>
              </div>
              <button onClick={() => setShowBuy(true)} disabled={!hasVendor || (!isSandbox && state.credits < CARRIER_COST)} className="flex items-center gap-1 px-3 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs disabled:opacity-30">
                <Plus className="w-3.5 h-3.5" /> BUY
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-orange-400 text-sm font-bold">Name Your Fleet Carrier</div>
              <input value={carrierName} onChange={e => setCarrierName(e.target.value)} placeholder="e.g., The Stellar Vanguard" className="w-full bg-black border border-orange-700 text-orange-300 px-2 py-1.5 text-xs" maxLength={30} />
              <div className="flex gap-2">
                <button onClick={() => setShowBuy(false)} className="flex-1 py-1.5 border border-orange-900 text-orange-700 text-xs">CANCEL</button>
                <button onClick={handleBuy} disabled={!isSandbox && state.credits < CARRIER_COST} className="flex-1 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30">{isSandbox ? 'CONFIRM — FREE' : `CONFIRM — ${CARRIER_COST.toLocaleString()} CR`}</button>
              </div>
            </div>
          )}
          <div className="text-orange-700 text-[10px]">Cost: {CARRIER_COST.toLocaleString()} CR · Jump range: 500 LY · Tritium fuel required · Carries all your stored ships</div>
        </div>
      )}

      {state.fleetCarriers.length === 0 ? (
        <div className="border border-orange-900 p-8 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <div className="text-orange-700 text-sm">No fleet carriers owned.</div>
          <div className="text-orange-800 text-[10px] mt-1">Fleet carriers carry your entire fleet between systems.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {state.fleetCarriers.map(c => {
            const ships = state.ownedShips.filter(s => s.storedAt?.carrierId === c.id);
            const isHere = c.systemSeed === state.currentSystem.seed;
            return (
              <div key={c.id} className={`border p-3 space-y-3 ${c.isGuilded ? 'border-yellow-600 bg-yellow-950/10' : 'border-orange-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-4 h-4 text-orange-500" />
                    {editingId === c.id ? (
                      <div className="flex gap-1">
                        <input value={nameInput} onChange={e => setNameInput(e.target.value)} className="bg-black border border-orange-700 text-orange-300 px-1 text-xs w-40" maxLength={30} />
                        <button onClick={() => handleRename(c.id)} className="text-orange-400"><Check className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`font-bold text-sm ${c.isGuilded ? 'text-yellow-300' : 'text-orange-300'}`}>{c.name}</span>
                        {c.isGuilded && <span className="text-[9px] border border-yellow-600 text-yellow-500 px-1">★ GUILDED</span>}
                        <button onClick={() => { setEditingId(c.id); setNameInput(c.name); }} className="text-orange-600 hover:text-orange-400"><Edit2 className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                  <div className={`text-[10px] ${isHere ? 'text-green-500' : 'text-orange-700'}`}>{isHere ? '◆ IN THIS SYSTEM' : c.systemName || 'UNKNOWN'}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="border border-orange-950 p-1.5"><div className="text-orange-700 text-[10px] uppercase flex items-center gap-1"><Fuel className="w-2.5 h-2.5" /> Tritium</div><div className="text-orange-300">{c.tritium} / {c.tritiumCapacity}</div></div>
                  <div className="border border-orange-950 p-1.5"><div className="text-orange-700 text-[10px] uppercase flex items-center gap-1"><Banknote className="w-2.5 h-2.5" /> Bank</div><div className="text-orange-300">{(c.bankBalance || 0).toLocaleString()} CR</div></div>
                  <div className="border border-orange-950 p-1.5"><div className="text-orange-700 text-[10px] uppercase">Ships</div><div className="text-orange-300">{ships.length}{c.shipCapacity ? `/${c.shipCapacity}` : ''}</div></div>
                </div>

                {isHere && (
                  <div className="border-t border-orange-900 pt-2">
                    <button onClick={() => onNavigate('carrierinterior')} className="w-full py-1.5 border border-green-500 text-green-300 hover:bg-green-950/30 text-xs font-bold">ENTER INTERIOR</button>
                  </div>
                )}
                {/* Jump section — available remotely (carrier need not be in current system) */}
                <div className="border-t border-orange-900 pt-2 space-y-2">
                  {!isHere && (
                    <div className="text-orange-700 text-[10px] text-center">REMOTE JUMP — Carrier in {c.systemName || 'another system'}</div>
                  )}
                  {jumpState && jumpState.carrierId === c.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <button onClick={() => startJump(c, 'full')} className={`flex-1 py-1 border text-[10px] ${jumpState.mode === 'micro' ? 'border-orange-900 text-orange-700' : 'border-cyan-600 text-cyan-400'}`}>FULL 500 LY</button>
                        <button onClick={() => startJump(c, 'micro')} className={`flex-1 py-1 border text-[10px] ${jumpState.mode === 'micro' ? 'border-cyan-600 text-cyan-400' : 'border-orange-900 text-orange-700'}`}>MICRO 50 LY</button>
                      </div>
                      <div className="text-orange-400 text-xs font-bold">Select Jump Destination ({jumpState.mode === 'micro' ? '50' : '500'} LY max)</div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {jumpState.targets.length === 0 && <div className="text-orange-700 text-[10px] text-center py-2">No systems in range</div>}
                        {jumpState.targets.map(sys => {
                          const tc = Math.ceil(sys.distance / 10);
                          return (
                            <button key={sys.seed} onClick={() => { jumpCarrier(c.id, sys); setJumpState(null); }} disabled={!isSandbox && c.tritium < tc} className="w-full flex justify-between border border-orange-900 p-1.5 text-xs hover:border-orange-700 disabled:opacity-30">
                              <span className="text-orange-400">{sys.name}</span><span className="text-orange-600">{sys.distance.toFixed(0)} LY · {tc}T</span>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => setJumpState(null)} className="w-full py-1 border border-orange-900 text-orange-700 text-xs">CANCEL</button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => startJump(c, 'full')} disabled={!isSandbox && c.tritium < 5} className="flex-1 py-1.5 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-[10px] font-bold disabled:opacity-30">JUMP 500 LY</button>
                      <button onClick={() => startJump(c, 'micro')} disabled={!isSandbox && c.tritium < 1} className="flex-1 py-1.5 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[10px] font-bold disabled:opacity-30">MICRO 50 LY</button>
                    </div>
                  )}
                </div>

                {ships.length > 0 && (
                  <div className="border-t border-orange-900 pt-2">
                    <div className="text-orange-700 text-[10px] uppercase mb-1">Stored Ships</div>
                    <div className="flex flex-wrap gap-1">
                      {ships.map(s => <span key={s.id} className="text-[10px] text-orange-500 border border-orange-900 px-1">{s.customName || SHIP_MAP[s.typeId]?.name || s.typeId}</span>)}
                    </div>
                  </div>
                )}

                {/* Decommission */}
                <div className="border-t border-orange-900 pt-2">
                  <button
                    onClick={() => { if (confirm(`Decommission ${c.name}? You'll receive 3.75B CR (75% refund). Ships on this carrier will be relocated to ${c.systemName || 'its system'}.`)) decommissionCarrier(c.id); }}
                    className="w-full py-1 border border-red-900 text-red-600 hover:bg-red-950/30 text-[10px] flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> DECOMMISSION (75% REFUND)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}