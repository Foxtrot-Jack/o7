// Crew Screen — hire and manage NPC co-pilots
import React, { useState, useEffect } from 'react';
import { useGameState } from '@/lib/gameState';
import { CREW_ROLES, CREW_ROLE_MAP, generateCrewName, calculateSalaryOwed, getCrewLevel, CREW_LEVELS, getCrewTotalXp, getCrewMorale, grantShoreLeave, moraleLabel, MORALE_MAX } from '@/lib/crew';
import { Users, UserPlus, UserMinus, Coins } from 'lucide-react';

export default function CrewScreen() {
  const { state, isSandbox, update, addCredits } = useGameState();
  const [salaryOwed, setSalaryOwed] = useState(0);
  const crew = state.crew || [];

  useEffect(() => {
    const calc = () => setSalaryOwed(calculateSalaryOwed(crew));
    calc();
    const timer = setInterval(calc, 5000);
    return () => clearInterval(timer);
  }, [crew]);

  const handleHire = (role) => {
    const r = CREW_ROLES.find(rr => rr.id === role);
    if (!r) return;
    if (!isSandbox && state.credits < r.hireCost) return;
    if (crew.length >= 4) return;
    if (!isSandbox) addCredits(-r.hireCost);
    update({
      crew: [...crew, {
        id: `crew_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role, name: generateCrewName(), hireDate: Date.now(), lastPaid: Date.now(),
      }],
    });
  };

  const handleFire = (crewId) => {
    update({ crew: crew.filter(c => c.id !== crewId) });
  };

  const handlePaySalary = () => {
    if (salaryOwed <= 0) return;
    if (!isSandbox && state.credits < salaryOwed) return;
    if (!isSandbox) addCredits(-salaryOwed);
    const now = Date.now();
    update({ crew: crew.map(c => ({ ...c, lastPaid: now })) });
  };

  const handleTrain = (crewId) => {
    const cost = 50000;
    if (!isSandbox && state.credits < cost) return;
    if (!isSandbox) addCredits(-cost);
    update(prev => ({
      ...prev,
      crew: prev.crew.map(c => c.id === crewId ? { ...c, xp: (c.xp || 0) + 500 } : c),
    }));
  };

  const handleShoreLeave = (crewId) => {
    update({ crew: grantShoreLeave(crew, crewId, state.currentLocation === 'station') });
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Crew Quarters</h2>
        <span className="text-orange-700 text-xs ml-auto">{crew.length}/4 BERTHS</span>
      </div>

      {/* Salary panel */}
      <div className="border border-orange-900 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-500" />
          <span className="text-orange-400 text-sm font-bold uppercase">Salary</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600">OWED: <span className="text-orange-300">{salaryOwed.toLocaleString()} CR</span></span>
          <button
            onClick={handlePaySalary}
            disabled={salaryOwed <= 0 || (!isSandbox && state.credits < salaryOwed)}
            className="px-3 py-1 border border-orange-500 text-orange-300 hover:bg-orange-950/50 text-xs font-bold disabled:opacity-30"
          >
            {isSandbox ? 'PAY (FREE)' : `PAY ${salaryOwed.toLocaleString()} CR`}
          </button>
        </div>
        <div className="text-orange-700 text-[10px]">Salary accrues over time based on crew role rates. Low morale raises salary demand; grant shore leave at a station to recover it.</div>
      </div>

      {/* Current crew */}
      {crew.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-orange-500 text-xs font-bold uppercase">Active Crew</h3>
          {crew.map(member => {
            const role = CREW_ROLE_MAP[member.role];
            return (
              <div key={member.id} className="border border-orange-900 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-orange-300 text-sm font-bold">{member.name}</div>
                    <div className="text-orange-600 text-xs">{role.name} · {role.bonusLabel}</div>
                    <div className="text-orange-700 text-[10px]">Salary: {role.salary.toLocaleString()} CR/hr</div>
                  </div>
                  <button
                    onClick={() => handleFire(member.id)}
                    className="px-2 py-1 border border-red-800 text-red-500 hover:bg-red-950/30 text-[10px] flex items-center gap-1"
                  >
                    <UserMinus className="w-3 h-3" /> DISMISS
                  </button>
                </div>
                {(() => {
                  const totalXp = getCrewTotalXp(member);
                  const level = getCrewLevel(totalXp);
                  const nextLevel = CREW_LEVELS[level.idx + 1];
                  const pct = nextLevel ? Math.min(100, ((totalXp - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100) : 100;
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-cyan-400">Lv.{level.level} {level.title}</span>
                        <span className="text-orange-600">{totalXp.toLocaleString()} XP</span>
                        <span className="text-orange-700">×{level.bonusMult} bonus</span>
                      </div>
                      <div className="w-full h-1.5 bg-black border border-orange-950">
                        <div className="h-full bg-cyan-600" style={{ width: `${pct}%` }} />
                      </div>
                      {(() => {
                        const isDocked = state.currentLocation === 'station';
                        const morale = getCrewMorale(member, isDocked);
                        const onLeave = !!(member.onLeave && member.leaveUntil && Date.now() < member.leaveUntil);
                        const mColor = morale >= 85 ? 'bg-green-600' : morale >= 60 ? 'bg-cyan-600' : morale >= 35 ? 'bg-yellow-600' : 'bg-red-600';
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-orange-600">Morale: <span className="text-orange-300">{moraleLabel(morale)}</span></span>
                              <span className="text-orange-700">{morale}/{MORALE_MAX}</span>
                            </div>
                            <div className="w-full h-1.5 bg-black border border-orange-950">
                              <div className={`h-full ${mColor}`} style={{ width: `${morale}%` }} />
                            </div>
                            {onLeave ? (
                              <div className="text-center text-[9px] text-green-500 border border-green-900 py-1">ON SHORE LEAVE — morale recovering</div>
                            ) : (
                              <button
                                onClick={() => handleShoreLeave(member.id)}
                                disabled={!isDocked}
                                className="w-full py-1 border border-green-700 text-green-400 hover:bg-green-950/30 text-[9px] font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                                title={isDocked ? 'Grant 12h shore leave for fast morale recovery' : 'Must be docked to grant shore leave'}
                              >
                                GRANT SHORE LEAVE
                              </button>
                            )}
                          </div>
                        );
                      })()}
                      <button
                        onClick={() => handleTrain(member.id)}
                        disabled={!isSandbox && state.credits < 50000}
                        className="w-full py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-[9px] font-bold disabled:opacity-30"
                      >
                        {isSandbox ? 'TRAIN (FREE)' : 'TRAIN — 50K CR (+500 XP)'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Hire panel */}
      <div className="space-y-2">
        <h3 className="text-orange-500 text-xs font-bold uppercase">Available Recruits</h3>
        {CREW_ROLES.map(role => (
          <div key={role.id} className="border border-orange-900 p-3 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-orange-300 text-sm font-bold">{role.name}</div>
              <div className="text-orange-600 text-xs">{role.bonusLabel}</div>
              <div className="text-orange-700 text-[10px]">{role.desc}</div>
              <div className="text-orange-700 text-[10px]">Hire: {isSandbox ? 'FREE' : `${role.hireCost.toLocaleString()} CR`} · Salary: {role.salary.toLocaleString()} CR/hr</div>
            </div>
            <button
              onClick={() => handleHire(role.id)}
              disabled={crew.length >= 4 || (!isSandbox && state.credits < role.hireCost)}
              className="px-3 py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold disabled:opacity-30 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> HIRE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}