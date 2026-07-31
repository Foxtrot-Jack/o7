// Multi-Crew system — active crew roles with combat abilities

export const CREW_ROLES = {
  pilot: {
    id: 'pilot', label: 'Pilot',
    ability: { id: 'evasive', name: 'Evasive Maneuver', desc: '+15% flee chance this round', cooldown: 3 },
  },
  gunner: {
    id: 'gunner', label: 'Gunner',
    ability: { id: 'overcharge', name: 'Overcharge Weapons', desc: '+50% damage this round', cooldown: 3 },
  },
  shield: {
    id: 'shield', label: 'Shield Operator',
    ability: { id: 'shieldBoost', name: 'Shield Boost', desc: 'Restore 30% shields', cooldown: 4 },
  },
  engineer: {
    id: 'engineer', label: 'Engineer',
    ability: { id: 'emergencyRepair', name: 'Emergency Repair', desc: 'Restore 15% hull', cooldown: 5 },
  },
};

export function getRoleLabel(roleId) {
  return CREW_ROLES[roleId]?.label || roleId;
}

export function getAssignedCrewCount(crewRoles) {
  return Object.values(crewRoles || {}).filter(v => v).length;
}