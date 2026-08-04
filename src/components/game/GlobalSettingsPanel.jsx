// Pre-game global settings panel — edits personalization stored in the
// global settings key so preferences set on the Save Select screen carry into
// the game (and across both save slots) without needing a loaded save.
// Only the shared personalization fields are exposed here; the full Settings
// screen (data/controls/etc.) remains available in-game.
import React, { useState } from 'react';
import { Settings as SettingsIcon, X, Monitor, Palette, Type, Volume2 } from 'lucide-react';
import { loadGlobalSettings, saveGlobalSettings } from '@/lib/globalSettings';
import { THEME_LIST } from '@/lib/themes';
import { FONT_LIST } from '@/lib/fonts';

export default function GlobalSettingsPanel({ onClose }) {
  // Only fields the user actually sets are persisted; absent fields fall back
  // in the UI below. This prevents the panel from seeding a default colorTheme
  // into the shared global store and overriding a customized save on load.
  const [s, setS] = useState(() => ({ ...(loadGlobalSettings() || {}) }));

  const update = (patch) => {
    setS(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      saveGlobalSettings(next);
      return next;
    });
  };
  const set = (key, val) => update({ [key]: val });
  const setSound = (key, val) => update(prev => ({ ...prev, sound: { ...(prev.sound || {}), [key]: val } }));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg border border-orange-700 bg-black p-4 space-y-3 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-orange-900 pb-2">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-orange-500" />
            <h2 className="text-orange-300 font-bold uppercase">Settings</h2>
          </div>
          <button onClick={onClose} className="text-orange-700 hover:text-orange-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="text-orange-700 text-[10px]">Applies to both Commander and Sandbox and persists across sessions.</div>

        <Section icon={Monitor} title="Display">
          <Row label="CRT Effects" hint="Scanlines, glow, flicker">
            <Toggle on={s.crtEffect ?? true} onClick={() => set('crtEffect', !(s.crtEffect ?? true))} />
          </Row>
          <Row label="Text Brightness">
            <input type="range" min="100" max="600" value={s.textBrightness || 100} onChange={e => set('textBrightness', parseInt(e.target.value))} className="flex-1" />
            <span className="text-orange-300 text-xs w-12 text-right">{s.textBrightness || 100}%</span>
          </Row>
          <Row label="Mini Screen">
            <Toggle on={s.miniScreen ?? false} onClick={() => set('miniScreen', !(s.miniScreen ?? false))} />
          </Row>
        </Section>

        <Section icon={Palette} title="Color Theme">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THEME_LIST.map(t => (
              <button key={t.id} onClick={() => set('colorTheme', t.id)} className={`border p-2 text-xs flex items-center gap-2 ${(s.colorTheme ?? 'elite') === t.id ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900 hover:border-orange-700'}`}>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color, boxShadow: `0 0 4px ${t.color}` }} />
                <span className="text-orange-400 truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Type} title="Font">
          <select value={s.fontFamily || 'courier'} onChange={e => set('fontFamily', e.target.value)} className="w-full bg-black border border-orange-900 text-orange-400 text-xs p-2">
            {FONT_LIST.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <Row label="Font Scale">
            <input type="range" min="50" max="150" value={s.fontScale || 100} onChange={e => set('fontScale', parseInt(e.target.value))} className="flex-1" />
            <span className="text-orange-300 text-xs w-12 text-right">{s.fontScale || 100}%</span>
          </Row>
        </Section>

        <Section icon={Volume2} title="Audio">
          <Row label="Sound">
            <Toggle on={s.sound?.enabled !== false} onClick={() => setSound('enabled', !(s.sound?.enabled !== false))} />
          </Row>
          <Row label="SFX Volume">
            <input type="range" min="0" max="100" value={Math.round((s.sound?.sfxVolume ?? 0.7) * 100)} onChange={e => setSound('sfxVolume', parseInt(e.target.value) / 100)} className="flex-1" />
            <span className="text-orange-300 text-xs w-12 text-right">{Math.round((s.sound?.sfxVolume ?? 0.7) * 100)}%</span>
          </Row>
          <Row label="Music Volume">
            <input type="range" min="0" max="100" value={Math.round((s.sound?.musicVolume ?? 0.4) * 100)} onChange={e => setSound('musicVolume', parseInt(e.target.value) / 100)} className="flex-1" />
            <span className="text-orange-300 text-xs w-12 text-right">{Math.round((s.sound?.musicVolume ?? 0.4) * 100)}%</span>
          </Row>
        </Section>

        <button onClick={onClose} className="w-full py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/40 text-xs font-bold uppercase">Done</button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="border border-orange-900 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-xs font-bold uppercase">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-orange-500 text-xs">{label}</div>
        {hint && <div className="text-orange-700 text-[10px]">{hint}</div>}
      </div>
      <div className="flex items-center gap-2 flex-1 justify-end">{children}</div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return <button onClick={onClick} className={`px-3 py-1 border text-xs ${on ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}>{on ? 'ON' : 'OFF'}</button>;
}