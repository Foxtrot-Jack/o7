// Sound & Music Settings — volumes, presets, per-screen track customization
import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Zap, ChevronDown, ChevronRight, Play, Square } from 'lucide-react';
import { useGameState } from '@/lib/gameState';
import { soundEngine } from '@/lib/soundEngine';
import { MUSIC_PRESET_LIST, MUSIC_TRACK_LIST, CONTEXT_LABELS, SFX_TEST_LIST } from '@/lib/soundPresets';

export default function SoundSettings() {
  const { state, update } = useGameState();
  const s = state.settings?.sound || {};
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [previewing, setPreviewing] = useState(null);

  const setSound = (key, val) => {
    update(prev => ({
      settings: {
        ...prev.settings,
        sound: { ...prev.settings?.sound, [key]: val },
      },
    }));
  };

  const setCustomTrack = (context, trackId) => {
    const custom = { ...(s.customTracks || {}) };
    if (trackId === '__preset__') {
      delete custom[context];
    } else {
      custom[context] = trackId;
    }
    setSound('customTracks', custom);
    if (trackId !== '__preset__') {
      setPreviewing(trackId);
      soundEngine.previewTrack(trackId);
      setTimeout(() => { setPreviewing(null); soundEngine.stopPreview(); }, 8000);
    }
  };

  const testSfx = (name) => {
    soundEngine.testSfx(name);
  };

  const stopPreview = () => {
    soundEngine.stopPreview();
    setPreviewing(null);
  };

  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Sound & Music</h3>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <span className="text-orange-600 text-xs">Master sound toggle</span>
        <button
          onClick={() => { setSound('enabled', !s.enabled); soundEngine.play('toggle_on'); }}
          className={`px-3 py-1 border text-xs ${s.enabled !== false ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
        >
          {s.enabled !== false ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Volume Sliders */}
      <div className="space-y-2">
        <VolumeSlider label="SFX Volume" value={s.sfxVolume ?? 0.7} onChange={v => setSound('sfxVolume', v)} />
        <VolumeSlider label="Music Volume" value={s.musicVolume ?? 0.4} onChange={v => setSound('musicVolume', v)} />
      </div>

      {/* Test Sounds */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-orange-500 text-[10px] uppercase">
          <Zap className="w-3 h-3" /> Test Sound Effects
        </div>
        <div className="flex flex-wrap gap-1">
          {SFX_TEST_LIST.map(sfx => (
            <button
              key={sfx.id}
              onClick={() => testSfx(sfx.id)}
              className="px-2 py-1 border border-orange-900 text-[10px] text-orange-600 hover:border-orange-700 hover:text-orange-400"
            >
              {sfx.label}
            </button>
          ))}
        </div>
      </div>

      {/* Music Presets */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-orange-500 text-[10px] uppercase">
          <Music className="w-3 h-3" /> Music Preset
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {MUSIC_PRESET_LIST.map(p => (
            <button
              key={p.id}
              onClick={() => { setSound('musicPreset', p.id); soundEngine.play('select'); }}
              className={`border p-1.5 text-left ${s.musicPreset === p.id || (!s.musicPreset && p.id === 'standard') ? 'border-orange-500 bg-orange-950/30' : 'border-orange-900 hover:border-orange-700'}`}
            >
              <div className="text-orange-400 text-[10px] font-bold">{p.name}</div>
              <div className="text-orange-700 text-[9px]">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Per-Screen Customizer */}
      <div className="border-t border-orange-950 pt-2">
        <button
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="flex items-center gap-1 text-orange-500 text-[10px] uppercase hover:text-orange-400"
        >
          {showCustomizer ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Per-Screen Track Customization
        </button>
        {showCustomizer && (
          <div className="mt-2 space-y-2">
            <div className="text-orange-700 text-[9px]">Override the preset track for each game context. Set to "Preset Default" to use the selected preset's track.</div>
            {Object.entries(CONTEXT_LABELS).map(([ctx, label]) => {
              const current = s.customTracks?.[ctx];
              return (
                <div key={ctx} className="flex items-center gap-2">
                  <span className="text-orange-600 text-[10px] w-32 flex-shrink-0">{label}</span>
                  <select
                    value={current || '__preset__'}
                    onChange={e => setCustomTrack(ctx, e.target.value)}
                    className="flex-1 bg-black border border-orange-900 text-orange-400 text-[10px] px-2 py-1"
                  >
                    <option value="__preset__">Preset Default</option>
                    {MUSIC_TRACK_LIST.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {previewing === current && current && (
                    <button onClick={stopPreview} className="px-1.5 py-1 border border-red-700 text-red-400 text-[9px]">
                      <Square className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => { setSound('customTracks', {}); soundEngine.play('cancel'); }}
              className="px-2 py-1 border border-orange-900 text-[10px] text-orange-600 hover:text-orange-400"
            >
              Reset All to Preset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VolumeSlider({ label, value, onChange, disabled }) {
  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-40' : ''}`}>
      <span className="text-orange-600 text-[10px] w-28 flex-shrink-0">{label}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className="text-orange-300 text-[10px] w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  );
}