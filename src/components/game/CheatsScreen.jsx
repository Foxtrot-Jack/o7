// Cheats Screen — unlocked by discovering the Sol system
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { SOL_CHEATS } from '@/lib/solSystem';
import { Sun, Zap, TrendingUp, Globe, Wrench, Coins, Crown, RefreshCw, Eye, Gem, Lock, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

const CHEAT_ICONS = {
  infinite_fuel: Sun,
  instant_jumps: Zap,
  best_prices: TrendingUp,
  max_colonies: Globe,
  free_outfitting: Wrench,
  max_credits: Coins,
  golden_theme: Crown,
  galaxy_flip: RefreshCw,
  reveal_systems: Eye,
  max_materials: Gem,
};

const TYPE_STYLES = {
  passive: 'border-cyan-700 text-cyan-400',
  active: 'border-green-700 text-green-400',
  cosmetic: 'border-purple-700 text-purple-400',
};

const TYPE_LABELS = { passive: 'PASSIVE', active: 'ACTIVE', cosmetic: 'COSMETIC' };

export default function CheatsScreen() {
  const { state, isCheatActive, toggleCheat, applyMaxCredits, applyMaxColonies, applyRevealSystems, applyMaxMaterials } = useGameState();

  if (!state.cheats?.unlocked) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Lock className="w-12 h-12 mx-auto text-orange-700" />
          <h2 className="text-orange-500 font-bold uppercase text-sm">Cheats Locked</h2>
          <p className="text-orange-700 text-xs max-w-md">
            Discover the legendary Sol system — humanity's lost cradle — hidden somewhere in the galaxy.
            Finding it will unlock powerful cheats tied to each planetary body.
          </p>
          <div className="text-orange-800 text-[10px]">In sandbox mode, use the Route Plotter and search for "Sol".</div>
        </div>
      </div>
    );
  }

  const handleActiveCheat = (cheatId) => {
    switch (cheatId) {
      case 'max_credits': applyMaxCredits(); break;
      case 'max_colonies': applyMaxColonies(); break;
      case 'reveal_systems': applyRevealSystems(); break;
      case 'max_materials': applyMaxMaterials(); break;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-yellow-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h2 className="text-yellow-300 font-bold uppercase">Sol System — Cheat Registry</h2>
        </div>
        <p className="text-yellow-600 text-xs">
          You found humanity's cradle. Each body in the Sol system grants a unique cheat.
          Toggle passive and cosmetic cheats on or off, or trigger one-time cheats.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOL_CHEATS.map(cheat => {
          const Icon = CHEAT_ICONS[cheat.id] || Sparkles;
          const active = isCheatActive(cheat.id);
          const isToggle = cheat.type === 'passive' || cheat.type === 'cosmetic';

          return (
            <div key={cheat.id} className={`border p-3 space-y-2 ${active ? 'border-yellow-600 bg-yellow-950/10' : 'border-orange-900'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${active ? 'text-yellow-400' : 'text-orange-600'}`} />
                  <div>
                    <div className={`font-bold text-sm ${active ? 'text-yellow-300' : 'text-orange-400'}`}>{cheat.name}</div>
                    <div className="text-orange-700 text-[10px]">{cheat.bodyName}</div>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 border text-[9px] ${TYPE_STYLES[cheat.type]}`}>{TYPE_LABELS[cheat.type]}</span>
              </div>
              <p className="text-orange-600 text-[10px]">{cheat.desc}</p>
              {isToggle ? (
                <button
                  onClick={() => toggleCheat(cheat.id)}
                  className={`w-full py-1.5 border text-xs font-bold flex items-center justify-center gap-1.5 ${active ? 'border-yellow-500 text-yellow-300 bg-yellow-950/20' : 'border-orange-700 text-orange-500 hover:bg-orange-950/30'}`}
                >
                  {active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              ) : (
                <button
                  onClick={() => handleActiveCheat(cheat.id)}
                  className="w-full py-1.5 border border-green-600 text-green-400 hover:bg-green-950/30 text-xs font-bold"
                >
                  ACTIVATE
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}