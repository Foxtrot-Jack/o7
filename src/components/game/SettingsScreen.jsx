// Settings — restructured into intuitive tabbed categories
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { Settings, Monitor, Palette, Type, Volume2, Hand, Database, Download, Upload, RotateCcw, ArrowLeftRight, Lock, Unlock, Smartphone, Maximize } from 'lucide-react';
import { THEME_LIST } from '@/lib/themes';
import TextBrightnessSettings from '@/components/game/TextBrightnessSettings';
import SoundSettings from '@/components/game/SoundSettings';
import GestureDisplaySettings from '@/components/game/GestureDisplaySettings';
import ColorCustomizer from '@/components/game/ColorCustomizer';
import FontSelector from '@/components/game/FontSelector';

const TABS = [
  { id: 'display', label: 'Display', icon: Monitor },
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'type', label: 'Type', icon: Type },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'controls', label: 'Controls', icon: Hand },
  { id: 'data', label: 'Data', icon: Database },
];

export default function SettingsScreen() {
  const { state, update, resetGame, switchSave } = useGameState();
  const s = state.settings || {};
  const [tab, setTab] = useState('display');
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const set = (key, val) => update({ settings: { ...s, [key]: val } });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border border-orange-700 p-4 flex items-center gap-2 flex-shrink-0">
        <Settings className="w-5 h-5 text-orange-500" />
        <h2 className="text-orange-300 font-bold uppercase">Settings</h2>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-2 border-b border-orange-900/50 overflow-x-auto flex-shrink-0">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs whitespace-nowrap ${tab === t.id ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:text-orange-500'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'display' && (
          <>
            <TextBrightnessSettings />

            <div className="border border-orange-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-500" />
                <h3 className="text-orange-400 text-sm font-bold uppercase">Mini Screen Mode</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 text-xs">Compact UI for external displays (Moto Razr 50 cover screen)</span>
                <button onClick={() => set('miniScreen', !s.miniScreen)} className={`px-3 py-1 border text-xs ${s.miniScreen ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{s.miniScreen ? 'ON' : 'OFF'}</button>
              </div>
            </div>

            <div className="border border-orange-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-orange-500" />
                <h3 className="text-orange-400 text-sm font-bold uppercase">CRT Effects</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 text-xs">Scanlines, glow, and CRT flicker</span>
                <button onClick={() => set('crtEffect', !s.crtEffect)} className={`px-3 py-1 border text-xs ${s.crtEffect ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{s.crtEffect ? 'ON' : 'OFF'}</button>
              </div>
            </div>

            <div className="border border-orange-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-orange-500" />
                <h3 className="text-orange-400 text-sm font-bold uppercase">Window Mode</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 text-xs">Fullscreen hides browser chrome for an immersive cockpit view</span>
                <button
                  onClick={() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.(); }}
                  className={`px-3 py-1 border text-xs ${isFullscreen ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
                >
                  {isFullscreen ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN'}
                </button>
              </div>
              <div className="text-orange-700 text-[10px]">Press ESC to exit fullscreen. Contrast, saturation, and color inversion are in Controls settings.</div>
            </div>

            <div className="border border-orange-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Maximize className="w-3.5 h-3.5 text-orange-500" />
                <h3 className="text-orange-400 text-sm font-bold uppercase">Display Scale</h3>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min="50" max="150" value={s.displayScale || 100} onChange={e => set('displayScale', parseInt(e.target.value))} className="flex-1" />
                <span className="text-orange-300 text-xs w-12">{s.displayScale || 100}%</span>
              </div>
              <div className="text-orange-700 text-[10px]">Scales the entire game interface. Lower for more content on screen, higher for readability on small displays.</div>
            </div>

            <div className="border border-orange-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-500" />
                <h3 className="text-orange-400 text-sm font-bold uppercase">Screen Orientation</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => set('screenOrientation', 'portrait')} className={`flex-1 py-2 border text-xs flex items-center justify-center gap-2 ${s.screenOrientation === 'portrait' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:text-orange-500'}`}>
                  <Smartphone className="w-3.5 h-3.5" /> PORTRAIT
                </button>
                <button onClick={() => set('screenOrientation', 'landscape')} className={`flex-1 py-2 border text-xs flex items-center justify-center gap-2 ${(!s.screenOrientation || s.screenOrientation === 'landscape') ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:text-orange-500'}`}>
                  <Monitor className="w-3.5 h-3.5" /> LANDSCAPE
                </button>
                <button onClick={() => set('orientationLocked', !s.orientationLocked)} className={`px-3 py-2 border text-xs flex items-center justify-center gap-1.5 ${s.orientationLocked ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700 hover:text-orange-500'}`} title={s.orientationLocked ? 'Orientation locked — tap to unlock' : 'Orientation unlocked — tap to lock'}>
                  {s.orientationLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {s.orientationLocked ? 'LOCKED' : 'UNLOCKED'}
                </button>
              </div>
              <div className="text-orange-700 text-[10px]">Choose your preferred orientation, then press the lock to force it regardless of device rotation. When unlocked, the game follows your device's natural orientation.</div>
            </div>
          </>
        )}

        {tab === 'color' && (
          <>
            <div className="border border-orange-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-500" />
                <h3 className="text-orange-400 text-sm font-bold uppercase">Color Theme</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEME_LIST.map(t => (
                  <button key={t.id} onClick={() => set('colorTheme', t.id)} className={`border p-2 text-xs flex items-center gap-2 ${s.colorTheme === t.id ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900 hover:border-orange-700'}`}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color, boxShadow: `0 0 4px ${t.color}` }} />
                    <span className="text-orange-400 truncate">{t.name}</span>
                  </button>
                ))}
              </div>
              <div className="text-orange-700 text-[10px]">Changes the accent color of the entire interface, including 3D views.</div>
            </div>
            <ColorCustomizer />
          </>
        )}

        {tab === 'type' && <FontSelector />}
        {tab === 'audio' && <SoundSettings />}
        {tab === 'controls' && <GestureDisplaySettings />}

        {tab === 'data' && (
          <>
            <div className="border border-cyan-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-cyan-500" />
                <h3 className="text-cyan-400 text-sm font-bold uppercase">Switch Save</h3>
              </div>
              <div className="text-orange-700 text-[10px]">Return to save selection to switch between Commander and Sandbox profiles.</div>
              <button onClick={() => switchSave()} className="w-full py-2 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-xs font-bold">SWITCH SAVE SLOT</button>
            </div>

            <div className="border border-cyan-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-500" />
                <h3 className="text-cyan-400 text-sm font-bold uppercase">Export Save Data</h3>
              </div>
              <div className="text-orange-700 text-[10px]">Download a backup of your save file. Store it safely.</div>
              <button
                onClick={() => {
                  const key = state.saveMode === 'sandbox' ? 'starfarer_sandbox_v1' : 'starfarer_save_v1';
                  const data = localStorage.getItem(key);
                  if (!data) return;
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dogstar_${state.saveMode}_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full py-2 border border-cyan-700 text-cyan-400 hover:bg-cyan-950/30 text-xs font-bold"
              >DOWNLOAD SAVE FILE</button>
            </div>

            <div className="border border-cyan-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-500" />
                <h3 className="text-cyan-400 text-sm font-bold uppercase">Import Save Data</h3>
              </div>
              <div className="text-orange-700 text-[10px]">Restore from a backup file. This overwrites your current save.</div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      JSON.parse(ev.target.result);
                      const key = state.saveMode === 'sandbox' ? 'starfarer_sandbox_v1' : 'starfarer_save_v1';
                      localStorage.setItem(key, ev.target.result);
                      alert('Save imported! Reloading...');
                      window.location.reload();
                    } catch (err) {
                      alert('Invalid save file.');
                    }
                  };
                  reader.readAsText(file);
                }}
                className="text-orange-500 text-xs w-full"
              />
            </div>

            <div className="border border-red-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-500" />
                <h3 className="text-red-400 text-sm font-bold uppercase">Reset Game</h3>
              </div>
              <div className="text-orange-700 text-[10px]">{state.saveMode === 'sandbox' ? 'Resets sandbox to initial state. Cannot be undone.' : 'Erases all progress, ships, carriers, and achievements. Cannot be undone.'}</div>
              <button onClick={() => { if (confirm('Erase ALL progress? This cannot be undone.')) resetGame(); }} className="w-full py-2 border border-red-700 text-red-400 hover:bg-red-950/30 text-xs font-bold">RESET ALL PROGRESS</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}