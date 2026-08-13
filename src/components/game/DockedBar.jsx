// Docked quick-action bar — appears while docked at a station.
// Starport Services (dropdown), Launch, Trade, Dock Camera.
import React, { useState, useRef, useEffect } from 'react';
import { Store, Rocket, ArrowLeftRight, Radar, ChevronDown, Wrench, FlaskConical, Users, ScrollText, Boxes, Palette, Hammer, ClipboardList, Building } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { soundEngine } from '@/lib/soundEngine';

const SERVICE_ITEMS = [
  { id: 'missionboard', label: 'Mission Board', icon: ClipboardList },
  { id: 'market', label: 'Commodities Market', icon: Store },
  { id: 'stationcontacts', label: 'Contacts', icon: Users },
  { id: 'cartography', label: 'Universal Cartographics', icon: ScrollText },
  { id: 'crew', label: 'Crew Lounge', icon: Users },
  { id: 'outfitting', label: 'Outfitting', icon: Wrench },
  { id: 'livery', label: 'Livery', icon: Palette },
  { id: 'advmaintenance', label: 'Advanced Maintenance', icon: Wrench },
  { id: 'engineering', label: 'Engineers Workshop', icon: FlaskConical },
];

export default function DockedBar({ onNavigate }) {
  const { state, leaveStation } = useGameState();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  if (state.currentLocation !== 'station') return null;

  const go = (id) => { soundEngine.play('click'); onNavigate(id); setOpen(false); };
  const launch = () => { soundEngine.play('dock'); leaveStation(); onNavigate('system'); };

  return (
    <div ref={ref} className="relative z-[110] flex items-stretch border-b border-cyan-900/50 bg-black">
      {/* Starport Services dropdown */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => { soundEngine.play('select'); setOpen(o => !o); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border-b-2 ${open ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20' : 'border-transparent text-cyan-600 hover:text-cyan-400 hover:border-cyan-800'}`}
        >
          <Store className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Starport Services</span> <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-0.5 min-w-[210px] max-h-[70vh] overflow-y-auto border border-cyan-800 bg-black z-[110] shadow-lg shadow-black">
            {SERVICE_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs whitespace-nowrap text-left border-b border-cyan-950/50 last:border-b-0 text-cyan-600 hover:bg-cyan-950/30 hover:text-cyan-400"
                >
                  <Icon className="w-3.5 h-3.5" /> {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={launch} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-orange-600 hover:text-orange-400 border-l border-orange-900/50">
        <Rocket className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Launch</span>
      </button>
      <button onClick={() => go('market')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-orange-600 hover:text-orange-400 border-l border-orange-900/50">
        <ArrowLeftRight className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Trade</span>
      </button>
      <button onClick={() => go('dockcam')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-orange-600 hover:text-orange-400 border-l border-orange-900/50">
        <Radar className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Dock Camera</span>
      </button>
      <div className="ml-auto flex items-center px-3 text-[10px] text-cyan-800 uppercase tracking-widest">
        <Building className="w-3 h-3 mr-1" /> Docked
      </div>
    </div>
  );
}