// Save Select — choose between Commander and Sandbox saves
import React, { useState, useEffect } from 'react';
import { Rocket, FlaskConical, ChevronRight } from 'lucide-react';

const STYLES = {
  orange: {
    border: 'border-orange-700 hover:border-orange-500 hover:bg-orange-950/20',
    icon: 'text-orange-500', title: 'text-orange-300', subtitle: 'text-orange-700',
    stats: 'text-orange-600', empty: 'text-orange-800', chevron: 'text-orange-600',
    badge: 'border-orange-700 text-orange-500',
  },
  cyan: {
    border: 'border-cyan-700 hover:border-cyan-500 hover:bg-cyan-950/20',
    icon: 'text-cyan-500', title: 'text-cyan-300', subtitle: 'text-cyan-700',
    stats: 'text-cyan-600', empty: 'text-cyan-800', chevron: 'text-cyan-600',
    badge: 'border-cyan-700 text-cyan-500',
  },
};

export default function SaveSelect({ onSelect }) {
  const [saves, setSaves] = useState({ normal: null, sandbox: null });

  useEffect(() => {
    try {
      const normal = JSON.parse(localStorage.getItem('starfarer_save_v1') || 'null');
      const sandbox = JSON.parse(localStorage.getItem('starfarer_sandbox_v1') || 'null');
      setSaves({ normal, sandbox });
    } catch (e) { /* ignore */ }
  }, []);

  const fmt = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return (n || 0).toLocaleString();
  };

  return (
    <div className="crt-container w-full h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-orange-300 text-2xl font-bold uppercase tracking-widest">o7</h1>
          <p className="text-orange-700 text-xs mt-1">Select Commander Profile</p>
        </div>
        <SaveCard icon={Rocket} title="Commander" subtitle="Main save — progress is permanent" save={saves.normal} fmt={fmt} s={STYLES.orange} onSelect={() => onSelect('normal')} />
        <SaveCard icon={FlaskConical} title="Sandbox" subtitle="Testing ground — everything unlocked & free" save={saves.sandbox} fmt={fmt} s={STYLES.cyan} badge="TESTING" onSelect={() => onSelect('sandbox')} />
      </div>
    </div>
  );
}

function SaveCard({ icon: Icon, title, subtitle, save, fmt, s, badge, onSelect }) {
  return (
    <button onClick={onSelect} className={`w-full border ${s.border} p-4 flex items-center gap-4 transition-all text-left`}>
      <Icon className={`w-8 h-8 ${s.icon} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className={`${s.title} font-bold text-lg uppercase`}>{title}</h2>
          {badge && <span className={`text-[9px] border ${s.badge} px-1`}>{badge}</span>}
        </div>
        <p className={`${s.subtitle} text-xs`}>{subtitle}</p>
        {save ? (
          <div className={`${s.stats} text-[10px] mt-1 flex gap-3`}>
            <span>CR: {fmt(save.credits)}</span>
            <span>SHIP: {save.ship?.name || '—'}</span>
            <span>JUMPS: {save.totalJumps || 0}</span>
          </div>
        ) : (
          <div className={`${s.empty} text-[10px] mt-1`}>— New —</div>
        )}
      </div>
      <ChevronRight className={`w-5 h-5 ${s.chevron} flex-shrink-0`} />
    </button>
  );
}