// Renders a text string containing [[token]] markers as inline lucide nav-tab
// icons, so tutorials and codex can refer to nav panels by their actual icon
// (Navigation / External / Deploy / Comms / Settings / Docked bar).
import React from 'react';
import { Map, Package, Cpu, MessageSquare, Settings, Anchor } from 'lucide-react';

const NAV_ICONS = {
  // New 5-tab structure + docked bar
  nav: Map,
  external: Package,
  deploy: Cpu,
  comms: MessageSquare,
  settings: Settings,
  docked: Anchor,
  // Legacy tokens — mapped to the new tab they now live under, so any
  // not-yet-updated reference still renders a sensible icon.
  internal: Package,
  cons: Anchor,
  role: Package,
  misc: Package,
};

const TOKEN_RE = /(\[\[(?:nav|external|deploy|comms|settings|docked|internal|cons|role|misc)\]\])/g;

export default function NavIconText({ text, className }) {
  if (!text) return null;
  const parts = text.split(TOKEN_RE);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const m = part.match(/^\[\[(nav|external|deploy|comms|settings|docked|internal|cons|role|misc)\]\]$/);
        if (m) {
          const Icon = NAV_ICONS[m[1]];
          if (Icon) {
            return (
              <Icon
                key={i}
                className="inline w-[1.05em] h-[1.05em] align-[-0.18em] mx-[0.12em] shrink-0"
                aria-label={m[1]}
              />
            );
          }
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}