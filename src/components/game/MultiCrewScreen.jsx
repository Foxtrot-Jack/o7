// Multi-Crew — assign crew to active combat roles
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { CREW_ROLES, getAssignedCrewCount } from '@/lib/multiCrew';
import { Users, UserCog, Zap, Shield, Wrench, Gauge } from 'lucide-react';

const ROLE_ICONS = { pilot: Gauge, gunner: Zap, shield: Shield, engineer: Wrench };

export default function MultiCrewScreen() {
  const { state, update } = useGameState();
  const crew = state.crew || [];
  const crewRoles = state.crewRoles || { pilot: null, gunner: null, shield: null, engineer: null };

  const assign = (role, crewId) => {
    update(prev => {
      const roles = { ...(prev.crewRoles || {}) };
      // Remove this crew from any other role
      for (const [r, id] of Object.entries(roles)) {
        if (id === crewId) roles[r] = null;
      }
      roles[role] = roles[role] === crewId ? null : crewId;
      return { ...prev, crewRoles: roles };
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Multi-Crew Assignment</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">
          Assign crew to active combat roles. Each role unlocks a unique ability usable during ship combat.
          Assigned: {getAssignedCrewCount(crewRoles)}/{Object.keys(CREW_ROLES).length}
        </div>
      </div>

      {/* Role slots */}
      <div className="space-y-2">
        {Object.entries(CREW_ROLES).map(([roleKey, roleDef]) => {
          const Icon = ROLE_ICONS[roleKey] || Users;
          const assignedId = crewRoles[roleKey];
          const assignedMember = crew.find(c => c.id === assignedId);
          return (
            <div key={roleKey} className={`border p-3 space-y-2 ${assignedMember ? 'border-cyan-800' : 'border-orange-900'}`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${assignedMember ? 'text-cyan-400' : 'text-orange-600'}`} />
                <span className="text-orange-300 font-bold text-xs">{roleDef.label}</span>
                <span className="text-[9px] text-orange-700 ml-auto">{assignedMember ? 'ASSIGNED' : 'EMPTY'}</span>
              </div>
              <div className="border border-orange-950 p-1.5 text-[10px]">
                <div className="text-orange-400 font-bold">{roleDef.ability.name}</div>
                <div className="text-orange-700">{roleDef.ability.desc}</div>
                <div className="text-orange-800 mt-0.5">Cooldown: {roleDef.ability.cooldown} rounds</div>
              </div>
              {assignedMember ? (
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 text-xs">{assignedMember.name || assignedMember.role || 'Crew Member'}</span>
                  <button onClick={() => assign(roleKey, assignedId)} className="text-[10px] text-orange-600 hover:text-orange-400 border border-orange-900 px-2 py-0.5">UNASSIGN</button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {crew.length === 0 && <span className="text-orange-700 text-[10px]">No crew hired. Visit Crew Quarters to hire crew.</span>}
                  {crew.map(c => {
                    const inRole = Object.entries(crewRoles).find(([r, id]) => id === c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => assign(roleKey, c.id)}
                        className="text-[10px] border border-orange-800 text-orange-500 hover:bg-orange-950/30 px-2 py-0.5"
                      >
                        {c.name || c.role || 'Crew'} {inRole ? `(${CREW_ROLES[inRole[0]]?.label})` : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}