// Crime & Punishment — notoriety, bounties, and station access
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { getNotorietyLevel, canDockAtStation, getCleanRecordCost, NOTORIETY_LEVELS } from '@/lib/crime';
import { Skull, ShieldCheck, AlertTriangle, Coins, ScrollText } from 'lucide-react';

export default function CrimeScreen() {
  const { state, payOffBounty } = useGameState();
  const crime = state.crime || { notoriety: 0, bounty: 0, crimes: [] };
  const level = getNotorietyLevel(crime.notoriety);
  const cleanCost = getCleanRecordCost(crime.bounty);
  const isSandbox = state.saveMode === 'sandbox';
  const atAnarchy = state.currentSystem?.security === 'anarchy';
  const canPayOff = (atAnarchy || isSandbox) && crime.bounty > 0;
  const dockAccess = canDockAtStation(crime.notoriety, state.currentSystem?.security);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className={`border p-4 ${crime.notoriety > 0 ? 'border-red-800' : 'border-green-800'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Skull className={`w-5 h-5 ${crime.notoriety > 0 ? 'text-red-500' : 'text-green-500'}`} />
          <h2 className="text-orange-300 font-bold uppercase">Criminal Record</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-orange-950 p-2">
            <div className="text-orange-700 text-[10px] uppercase">Status</div>
            <div className={`font-bold ${level.color}`}>{level.label}</div>
          </div>
          <div className="border border-orange-950 p-2">
            <div className="text-orange-700 text-[10px] uppercase">Notoriety</div>
            <div className="text-orange-300 font-bold">{crime.notoriety}</div>
          </div>
          <div className="border border-orange-950 p-2">
            <div className="text-orange-700 text-[10px] uppercase">Active Bounty</div>
            <div className="text-red-400 font-bold">{crime.bounty.toLocaleString()} CR</div>
          </div>
          <div className="border border-orange-950 p-2">
            <div className="text-orange-700 text-[10px] uppercase">Station Access</div>
            <div className={dockAccess ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{dockAccess ? 'PERMITTED' : 'DENIED'}</div>
          </div>
        </div>
      </div>

      {/* Notoriety ladder */}
      <div className="border border-orange-900 p-3">
        <h3 className="text-orange-500 text-xs font-bold uppercase mb-2">Notoriety Scale</h3>
        <div className="space-y-1">
          {NOTORIETY_LEVELS.map(l => (
            <div key={l.label} className={`flex items-center gap-2 text-[10px] ${crime.notoriety >= l.min && crime.notoriety <= l.max ? l.color + ' font-bold' : 'text-orange-800'}`}>
              <span className="w-32">{l.label}</span>
              <span>LVL {l.min}-{l.max === 999 ? '+' : l.max}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pay off bounty */}
      {crime.bounty > 0 && (
        <div className="border border-orange-900 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-500 text-xs font-bold uppercase">Clean Record</h3>
          </div>
          <div className="text-[10px] text-orange-600">
            {canPayOff
              ? `Pay ${cleanCost.toLocaleString()} CR to clear your bounty and reset notoriety.`
              : atAnarchy ? 'No bounty to pay off.' : 'Interstellar charges can only be cleared at Anarchy stations.'}
          </div>
          {canPayOff && (
            <button
              onClick={payOffBounty}
              disabled={!isSandbox && state.credits < cleanCost}
              className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/30 text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-2"
            >
              <Coins className="w-3.5 h-3.5" /> PAY {cleanCost.toLocaleString()} CR — CLEAN RECORD
            </button>
          )}
        </div>
      )}

      {/* Crime log */}
      {crime.crimes && crime.crimes.length > 0 && (
        <div className="border border-orange-900 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-orange-500" />
            <h3 className="text-orange-500 text-xs font-bold uppercase">Crime Log</h3>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {crime.crimes.slice().reverse().map((c, i) => (
              <div key={i} className="text-[10px] text-orange-600 border-b border-orange-950 pb-0.5">
                <span className="text-orange-400">{c.type}</span> — {new Date(c.date).toLocaleDateString()} — {c.bounty.toLocaleString()} CR
              </div>
            ))}
          </div>
        </div>
      )}

      {crime.notoriety === 0 && crime.bounty === 0 && (
        <div className="border border-green-900 p-4 text-center">
          <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-green-400 font-bold">Your record is clean.</div>
          <div className="text-orange-600 text-[10px] mt-1">Commit no crimes and the law will not trouble you.</div>
        </div>
      )}
    </div>
  );
}