// CarrierCrewPanel — hire, view, and dismiss NPC crew for a fleet carrier.
// Crew provide income efficiency bonuses and cost salaries paid from the
// carrier's bank balance. Shown as an expandable section within the carrier card.
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { CARRIER_CREW_ROLES, CARRIER_CREW_ROLE_MAP, getCarrierCrewLevel, getCarrierCrewBonuses, createCarrierCrewMember, calculateCarrierCrewSalaryRate } from '@/lib/carrierCrew';
import { calculateCarrierIncomeRate, calculateCarrierTritiumUpkeep } from '@/lib/carrierEconomy';
import { Users, Plus, Trash2, TrendingUp, Fuel, Wallet } from 'lucide-react';

export default function CarrierCrewPanel({ carrier }) {
  const { state, update } = useGameState();
  const [showHire, setShowHire] = useState(false);
  const isSandbox = state.saveMode === 'sandbox';

  const crew = carrier.crew || [];
  const population = carrier.system?.population || 0;

  // Calculate current economy stats
  const crewBonuses = getCarrierCrewBonuses(crew);

  const incomeRate = calculateCarrierIncomeRate(carrier, population, crewBonuses);
  const tritiumUpkeep = calculateCarrierTritiumUpkeep(carrier);
  const salaryRate = calculateCarrierCrewSalaryRate(crew);
  const netIncome = incomeRate - salaryRate;

  const handleHire = (roleId) => {
    const role = CARRIER_CREW_ROLE_MAP[roleId];
    if (!role) return;
    if (!isSandbox && state.credits < role.hireCost) return;
    const newMember = createCarrierCrewMember(roleId);
    update(prev => ({
      ...prev,
      credits: isSandbox ? prev.credits : prev.credits - role.hireCost,
      fleetCarriers: prev.fleetCarriers.map(c =>
        c.id === carrier.id ? { ...c, crew: [...(c.crew || []), newMember] } : c
      ),
    }));
    setShowHire(false);
  };

  const handleDismiss = (crewId) => {
    update(prev => ({
      ...prev,
      fleetCarriers: prev.fleetCarriers.map(c =>
        c.id === carrier.id ? { ...c, crew: (c.crew || []).filter(m => m.id !== crewId) } : c
      ),
    }));
  };

  const handleCollectIncome = () => {
    const amount = carrier.pendingIncome || 0;
    if (amount <= 0) return;
    update(prev => ({
      ...prev,
      fleetCarriers: prev.fleetCarriers.map(c =>
        c.id === carrier.id ? { ...c, pendingIncome: 0, bankBalance: (c.bankBalance || 0) + amount } : c
      ),
    }));
  };

  const handleWithdraw = () => {
    const amount = carrier.bankBalance || 0;
    if (amount <= 0) return;
    update(prev => ({
      ...prev,
      credits: prev.credits + amount,
      fleetCarriers: prev.fleetCarriers.map(c =>
        c.id === carrier.id ? { ...c, bankBalance: 0 } : c
      ),
    }));
  };

  const handleDeposit = () => {
    const amount = 1000000; // 1M CR deposit
    if (!isSandbox && state.credits < amount) return;
    update(prev => ({
      ...prev,
      credits: isSandbox ? prev.credits : prev.credits - amount,
      fleetCarriers: prev.fleetCarriers.map(c =>
        c.id === carrier.id ? { ...c, bankBalance: (c.bankBalance || 0) + amount } : c
      ),
    }));
  };

  return (
    <div className="border-t border-orange-900 pt-2 space-y-2">
      {/* Economy summary */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div className="border border-green-900 p-1.5 flex items-center gap-1">
          <TrendingUp className="w-2.5 h-2.5 text-green-500" />
          <div>
            <div className="text-green-700 uppercase text-[8px]">Income/h</div>
            <div className="text-green-400">{incomeRate.toLocaleString()} CR</div>
          </div>
        </div>
        <div className="border border-orange-950 p-1.5 flex items-center gap-1">
          <Wallet className="w-2.5 h-2.5 text-orange-500" />
          <div>
            <div className="text-orange-700 uppercase text-[8px]">Salaries/h</div>
            <div className="text-orange-400">{salaryRate.toLocaleString()} CR</div>
          </div>
        </div>
        <div className="border border-cyan-950 p-1.5 flex items-center gap-1">
          <Fuel className="w-2.5 h-2.5 text-cyan-500" />
          <div>
            <div className="text-cyan-700 uppercase text-[8px]">Tritium/h</div>
            <div className="text-cyan-400">{tritiumUpkeep} T</div>
          </div>
        </div>
        <div className={`border p-1.5 flex items-center gap-1 ${netIncome >= 0 ? 'border-green-900' : 'border-red-900'}`}>
          <TrendingUp className={`w-2.5 h-2.5 ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <div>
            <div className={`uppercase text-[8px] ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>Net/h</div>
            <div className={netIncome >= 0 ? 'text-green-400' : 'text-red-400'}>{netIncome.toLocaleString()} CR</div>
          </div>
        </div>
      </div>

      {/* Pending income + bank actions */}
      <div className="border border-green-900 p-1.5 space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-700 uppercase">Pending Income</span>
          <span className="text-green-400 font-bold">{(carrier.pendingIncome || 0).toLocaleString()} CR</span>
        </div>
        <div className="flex gap-1">
          <button onClick={handleCollectIncome} disabled={(carrier.pendingIncome || 0) <= 0} className="flex-1 py-1 border border-green-600 text-green-400 hover:bg-green-950/30 text-[9px] font-bold disabled:opacity-30">
            COLLECT TO BANK
          </button>
          <button onClick={handleWithdraw} disabled={(carrier.bankBalance || 0) <= 0} className="flex-1 py-1 border border-orange-600 text-orange-400 hover:bg-orange-950/30 text-[9px] font-bold disabled:opacity-30">
            WITHDRAW BANK ({(carrier.bankBalance || 0).toLocaleString()})
          </button>
        </div>
        <button onClick={handleDeposit} disabled={!isSandbox && state.credits < 1000000} className="w-full py-1 border border-orange-900 text-orange-600 hover:bg-orange-950/30 text-[9px] disabled:opacity-30">
          DEPOSIT 1M CR TO BANK
        </button>
      </div>

      {/* Crew list */}
      <div className="border border-orange-950 p-1.5 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-orange-400 uppercase text-[10px] font-bold flex items-center gap-1">
            <Users className="w-3 h-3" /> Carrier Crew ({crew.length})
          </span>
          <button onClick={() => setShowHire(!showHire)} className="text-cyan-500 hover:text-cyan-400 text-[9px] flex items-center gap-0.5">
            <Plus className="w-2.5 h-2.5" /> HIRE
          </button>
        </div>

        {showHire && (
          <div className="border border-cyan-900 p-1.5 space-y-1">
            {CARRIER_CREW_ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleHire(role.id)}
                disabled={!isSandbox && state.credits < role.hireCost}
                className="w-full flex items-center justify-between border border-cyan-950 p-1 text-left hover:bg-cyan-950/20 disabled:opacity-30"
              >
                <div>
                  <div className="text-cyan-400 text-[10px] font-bold">{role.name}</div>
                  <div className="text-cyan-700 text-[8px]">{role.bonusLabel} · {role.salary.toLocaleString()} CR/h</div>
                </div>
                <div className="text-cyan-500 text-[10px]">{isSandbox ? 'FREE' : `${role.hireCost.toLocaleString()} CR`}</div>
              </button>
            ))}
          </div>
        )}

        {crew.length === 0 ? (
          <div className="text-orange-800 text-[9px] text-center py-1">No crew hired. Hire crew to boost carrier income.</div>
        ) : (
          <div className="space-y-0.5">
            {crew.map(member => {
              const role = CARRIER_CREW_ROLE_MAP[member.role];
              const level = getCarrierCrewLevel(member.xp || 0);
              if (!role) return null;
              return (
                <div key={member.id} className="flex items-center gap-1.5 border border-orange-950/50 p-1 text-[9px]">
                  <div className="flex-1">
                    <div className="text-orange-300 font-bold">{member.name}</div>
                    <div className="text-orange-700">{role.name} · {level.title} (Lv.{level.level})</div>
                    <div className="text-orange-800">XP: {(member.xp || 0).toLocaleString()} · Morale: {member.morale ?? 75}</div>
                  </div>
                  <button onClick={() => handleDismiss(member.id)} className="text-red-700 hover:text-red-500">
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}