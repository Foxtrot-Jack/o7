// Reusable SVG badge renderer — displays a badge design at any size
import React, { useId } from 'react';
import { SHAPE_PATHS, BADGE_SYMBOLS } from '@/lib/badgeUtils';

export default function BadgeDisplay({ badge, size = 64, className = '' }) {
  const rawId = useId();
  const clipId = `clip-${rawId.replace(/:/g, '')}`;

  if (!badge) return null;

  const shapePath = SHAPE_PATHS[badge.shape] || SHAPE_PATHS.shield;
  const symbol = BADGE_SYMBOLS.find(s => s.id === badge.symbol);
  const hasSymbol = symbol && symbol.path;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id={clipId}>
          <path d={shapePath} />
        </clipPath>
      </defs>

      {/* Background pattern (clipped to shape) */}
      <g clipPath={`url(#${clipId})`}>
        {badge.pattern === 'solid' && (
          <rect width="100" height="100" fill={badge.bgColor} />
        )}
        {badge.pattern === 'split' && (
          <>
            <rect width="50" height="100" fill={badge.bgColor} />
            <rect x="50" width="50" height="100" fill={badge.bgColor2} />
          </>
        )}
        {badge.pattern === 'quartered' && (
          <>
            <rect width="50" height="50" fill={badge.bgColor} />
            <rect x="50" width="50" height="50" fill={badge.bgColor2} />
            <rect y="50" width="50" height="50" fill={badge.bgColor2} />
            <rect x="50" y="50" width="50" height="50" fill={badge.bgColor} />
          </>
        )}
        {badge.pattern === 'striped' && (
          <>
            <rect width="100" height="100" fill={badge.bgColor} />
            {[15, 35, 55, 75].map(y => (
              <rect key={y} y={y} width="100" height="8" fill={badge.bgColor2} />
            ))}
          </>
        )}
      </g>

      {/* Symbol */}
      {hasSymbol && (
        <path d={symbol.path} fill={badge.symbolColor} />
      )}

      {/* Text / initials */}
      {badge.text && (
        <text
          x="50"
          y={hasSymbol ? 88 : 58}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill={badge.textColor}
          fontFamily="'Courier New', monospace"
        >
          {badge.text}
        </text>
      )}

      {/* Border */}
      {badge.borderStyle === 'solid' && (
        <path d={shapePath} fill="none" stroke={badge.borderColor} strokeWidth={4} />
      )}
      {badge.borderStyle === 'double' && (
        <>
          <path d={shapePath} fill="none" stroke={badge.borderColor} strokeWidth={5} />
          <path d={shapePath} fill="none" stroke={badge.bgColor} strokeWidth={1.5} />
        </>
      )}
      {badge.borderStyle === 'dashed' && (
        <path d={shapePath} fill="none" stroke={badge.borderColor} strokeWidth={4} strokeDasharray="5 3" />
      )}
    </svg>
  );
}