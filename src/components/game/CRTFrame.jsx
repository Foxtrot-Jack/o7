// CRT visual effect wrapper — scanlines, glow, curvature, flicker
import React from 'react';

export default function CRTFrame({ children, enabled = true }) {
  if (!enabled) return <>{children}</>;

  return (
    <div className="crt-container relative w-full h-full overflow-hidden bg-black">
      {/* Main content */}
      <div className="crt-content relative z-10 w-full h-full">
        {children}
      </div>

      {/* Scanlines overlay */}
      <div
        className="crt-scanlines pointer-events-none absolute inset-0 z-20"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="crt-vignette pointer-events-none absolute inset-0 z-20"
        style={{
          boxShadow: 'inset 0 0 150px 40px rgba(0,0,0,0.8)',
          borderRadius: '8px',
        }}
      />

      {/* Chromatic aberration / glow tint */}
      <div
        className="crt-glow pointer-events-none absolute inset-0 z-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,136,0,0.03) 0%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Flicker animation */}
      <div
        className="crt-flicker pointer-events-none absolute inset-0 z-20"
        style={{
          background: 'rgba(255,136,0,0.02)',
          animation: 'crtFlicker 0.15s infinite',
        }}
      />

      <style>{`
        @keyframes crtFlicker {
          0% { opacity: 0.9; }
          50% { opacity: 1; }
          100% { opacity: 0.95; }
        }
        .crt-container {
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 2px rgba(255,136,0,0.5), 0 0 8px rgba(255,136,0,0.2);
        }
        .crt-container * {
          text-shadow: inherit;
        }
        .crt-container::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 30;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,136,0,0.02) 0%, transparent 50%, rgba(255,136,0,0.02) 100%);
        }
      `}</style>
    </div>
  );
}