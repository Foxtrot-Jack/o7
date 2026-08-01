// Time-Based Events — rare, time-limited cosmic phenomena

export const EVENT_TYPES = [
  {
    id: 'supernova',
    name: 'Supernova Imminent',
    desc: 'A massive star is about to go supernova. Scan it for unprecedented exploration data.',
    duration: 24 * 60 * 60 * 1000,
    reward: 5000000,
    type: 'exploration',
    icon: '💥',
  },
  {
    id: 'comet',
    name: 'Cometary Transit',
    desc: 'A rare comet is passing through the system. Collect rare materials from its tail.',
    duration: 12 * 60 * 60 * 1000,
    reward: 2000000,
    type: 'mining',
    icon: '☄️',
  },
  {
    id: 'artifact',
    name: 'Alien Artifact Detected',
    desc: 'Anomalous readings suggest an alien artifact. Investigate for a unique Codex entry.',
    duration: 48 * 60 * 60 * 1000,
    reward: 10000000,
    type: 'exploration',
    icon: '🛸',
  },
  {
    id: 'pilgrim',
    name: 'Pilgrim Fleet Arrived',
    desc: 'A pilgrim fleet has arrived seeking transport. Lucrative passenger missions available.',
    duration: 6 * 60 * 60 * 1000,
    reward: 3000000,
    type: 'passenger',
    icon: '🚂',
  },
  {
    id: 'derelict',
    name: 'Derelict Megaship',
    desc: 'A derelict megaship has been detected. Salvage valuable technology before it drifts away.',
    duration: 18 * 60 * 60 * 1000,
    reward: 4000000,
    type: 'salvage',
    icon: '🏚️',
  },
];

export function generateTimeEvent() {
  const template = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...template,
    deadline: Date.now() + template.duration,
    completed: false,
    claimed: false,
    discoveredAt: Date.now(),
  };
}

export function getTimeRemaining(deadline) {
  const ms = deadline - Date.now();
  if (ms <= 0) return 'EXPIRED';
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function maybeGenerateEvent() {
  // 30% chance to generate an event when called
  if (Math.random() < 0.3) return generateTimeEvent();
  return null;
}

// Cooldown proportional to payout — at least 30 min, scales with reward
export function getEventCooldown(reward) {
  return Math.max(30 * 60 * 1000, Math.floor(reward * 0.5));
}