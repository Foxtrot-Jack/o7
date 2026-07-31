// Player Titles — earn and equip cosmetic titles
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { TITLES, getEarnedTitles, getLockedTitles, getTitle } from '@/lib/playerTitles';
import { Medal, Lock, CheckCircle, Star } from 'lucide-react';

export default function PlayerTitlesScreen() {
  const { state, update } = useGameState();
  const earned = getEarnedTitles(state);
  const locked = getLockedTitles(state);
  const currentTitle = state.playerTitle || 'none';
  const currentTitleDef = getTitle(currentTitle);

  const handleEquip = (titleId) => {
    update(prev => ({ ...prev, playerTitle: titleId === currentTitle ? 'none' : titleId }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-3">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-orange-500" />
          <h2 className="text-orange-300 font-bold uppercase">Player Titles</h2>
        </div>
        <div className="text-[10px] text-orange-600 mt-1">Cosmetic titles earned from gameplay milestones. Equip one to display alongside your commander name on leaderboards and in your profile.</div>
      </div>

      {/* Current title */}
      <div className="border border-cyan-800 p-3 space-y-1">
        <div className="text-cyan-700 text-[10px] uppercase">Equipped Title</div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-bold">{currentTitleDef.name}</span>
        </div>
        <div className="text-orange-600 text-[10px]">{currentTitleDef.desc}</div>
      </div>

      {/* Earned titles */}
      <div className="space-y-2">
        <h3 className="text-green-500 text-xs font-bold uppercase">Earned ({earned.length}/{TITLES.length})</h3>
        {earned.map(title => (
          <div key={title.id} className={`border p-3 space-y-1 ${currentTitle === title.id ? 'border-cyan-600 bg-cyan-950/20' : 'border-green-900'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentTitle === title.id ? <Star className="w-3.5 h-3.5 text-cyan-400" /> : <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                <span className={`text-xs font-bold ${currentTitle === title.id ? 'text-cyan-300' : 'text-orange-300'}`}>{title.name}</span>
              </div>
              <button
                onClick={() => handleEquip(title.id)}
                className={`px-3 py-1 border text-[10px] font-bold ${currentTitle === title.id ? 'border-cyan-600 text-cyan-400' : 'border-orange-700 text-orange-400 hover:bg-orange-950/30'}`}
              >
                {currentTitle === title.id ? 'EQUIPPED' : 'EQUIP'}
              </button>
            </div>
            <div className="text-[10px] text-orange-600">{title.desc}</div>
          </div>
        ))}
      </div>

      {/* Locked titles */}
      {locked.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-orange-700 text-xs font-bold uppercase">Locked ({locked.length})</h3>
          {locked.map(title => (
            <div key={title.id} className="border border-orange-950 p-3 space-y-1 opacity-60">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-orange-800" />
                <span className="text-orange-700 text-xs font-bold">{title.name}</span>
              </div>
              <div className="text-[10px] text-orange-700">{title.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}