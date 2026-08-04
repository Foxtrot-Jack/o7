// Renders a text string containing [[token]] markers as inline lucide nav-tab
// icons, so tutorials and codex can refer to nav panels by their actual icon
// instead of the word label (Internal / External / Cons / Role / Misc / Settings).
import React from 'react';
import { Cpu, Radar, Store, Medal, Boxes, Settings } from 'lucide-react';

const NAV_ICONS = {
  internal: Cpu,
  external: Radar,
  cons: Store,
  role: Medal,
  misc: Boxes,
  settings: Settings,
};

const TOKEN_RE = /(\[\[(?:internal|external|cons|role|misc|settings)\]\])/g;

export default function NavIconText({ text, className }) {
  if (!text) return null;
  const parts = text.split(TOKEN_RE);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const m = part.match(/^\[\[(internal|external|cons|role|misc|settings)\]\]$/);
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