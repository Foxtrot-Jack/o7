// Display Settings — brightness, mini-screen, CRT, reset
import React from 'react';
import { useGameState } from '@/lib/gameState';
import { Settings, Sun, Monitor, Tv, RotateCcw } from 'lucide-react';

export default function SettingsScreen() {
  const { state, update, resetGame } = useGameState();
  const s = state.settings || {};

  const set = (key, val) => update({ settings: { ...s, [key]: val } });

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="border border-orange-700 p-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Display Settings</h2>
      </div>

      <div className="border border-orange-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Text Brightness</h3>
        </div>
        <div className="flex items-center gap-3">
          <input type="range" min="50" max="150" value={s.textBrightness || 100} onChange={e => set('textBrightness', parseInt(e.target.value))} className="flex-1" />
          <span className="text-orange-300 text-xs w-12">{s.textBrightness || 100}%</span>
        </div>
        <div className="text-orange-700 text-[10px]">Increase for dimmed screens. 100% is default; 150% maxes out visibility.</div>
      </div>

      <div className="border border-orange-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">Mini Screen Mode</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-orange-600 text-xs">Compact UI for external displays (Moto Razr 50 cover screen)</span>
          <button onClick={() => set('miniScreen', !s.miniScreen)} className={`px-3 py-1 border text-xs ${s.miniScreen ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{s.miniScreen ? 'ON' : 'OFF'}</button>
        </div>
      </div>

      <div className="border border-orange-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-orange-500" />
          <h3 className="text-orange-400 text-sm font-bold uppercase">CRT Effects</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-orange-600 text-xs">Scanlines, glow, and CRT flicker</span>
          <button onClick={() => set('crtEffect', !s.crtEffect)} className={`px-3 py-1 border text-xs ${s.crtEffect ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{s.crtEffect ? 'ON' : 'OFF'}</button>
        </div>
      </div>

      <div className="border border-red-900 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-red-500" />
          <h3 className="text-red-400 text-sm font-bold uppercase">Reset Game</h3>
        </div>
        <div className="text-orange-700 text-[10px]">Erases all progress, ships, carriers, and achievements. Cannot be undone.</div>
        <button onClick={() => { if (confirm('Erase ALL progress? This cannot be undone.')) resetGame(); }} className="w-full py-2 border border-red-700 text-red-400 hover:bg-red-950/30 text-xs font-bold">RESET ALL PROGRESS</button>
      </div>
    </div>
  );
}