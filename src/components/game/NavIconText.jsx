// Renders tutorial/codex text containing [[token]] markers as inline icons.
// Tokens map to bezel button action IDs (e.g. [[galaxy]], [[shipwright]]) so
// tutorials reference the actual icons players see on the bezel buttons.
// A few legacy tab tokens are kept as aliases for backward compatibility.
import React from 'react';
import { BEZEL_ACTIONS } from '@/lib/bezelContexts';

// Legacy tab tokens → a representative bezel action icon
const LEGACY_ALIASES = {
  nav: 'galaxy',
  external: 'ship',
  deploy: 'srv',
  comms: 'comms',
  settings: 'settings',
  docked: 'station',
  internal: 'ship',
  cons: 'station',
  role: 'ship',
  misc: 'codex',
};

// Build a regex that matches any known bezel action ID or legacy alias
const allTokens = [
  ...Object.keys(BEZEL_ACTIONS),
  ...Object.keys(LEGACY_ALIASES),
];
const TOKEN_RE = new RegExp(`(\\[\\[(?:${allTokens.join('|')})\\]\\])`, 'g');
const TOKEN_PARSE = new RegExp(`^\\[\\[(${allTokens.join('|')})\\]\\]$`);

export default function NavIconText({ text, className }) {
  if (!text) return null;
  const parts = text.split(TOKEN_RE);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const m = part.match(TOKEN_PARSE);
        if (m) {
          const token = m[1];
          const actionId = LEGACY_ALIASES[token] || token;
          const action = BEZEL_ACTIONS[actionId];
          if (action && action.icon) {
            const Icon = action.icon;
            return (
              <Icon
                key={i}
                className="inline w-[1.05em] h-[1.05em] align-[-0.18em] mx-[0.12em] shrink-0"
                aria-label={actionId}
              />
            );
          }
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}