// Gesture & Display Settings — per-screen gesture controls and display inversion
import React, { useState } from 'react';
import { useGameState } from '@/lib/gameState';
import { INTERACTIVE_SCREENS } from '@/lib/screenSettings';
import { Hand, Monitor, ZoomIn, Move, RotateCw, ScanLine, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react';

const GESTURE_FIELDS = [
  { key: 'pinchZoom', label: 'Pinch to Zoom', type: 'toggle', icon: ZoomIn, default: true, desc: 'Two-finger pinch gesture to zoom in/out of 3D views' },
  { key: 'pinchSensitivity', label: 'Pinch Sensitivity', type: 'range', min: 25, max: 200, default: 100, unit: '%' },
  { key: 'panEnabled', label: 'Swipe to Pan', type: 'toggle', icon: Move, default: true, desc: 'Drag to pan the camera across 3D views' },
  { key: 'panSensitivity', label: 'Pan Sensitivity', type: 'range', min: 25, max: 200, default: 100, unit: '%' },
  { key: 'invertPan', label: 'Invert Pan (Natural Drag)', type: 'toggle', default: false, desc: 'ON: drag moves the world (natural scroll). OFF: drag moves the camera' },
  { key: 'rotateEnabled', label: 'Rotation Gestures', type: 'toggle', icon: RotateCw, default: true, desc: 'Two-finger rotate to orbit the camera around the scene' },
  { key: 'rotateSensitivity', label: 'Rotate Sensitivity', type: 'range', min: 25, max: 200, default: 100, unit: '%' },
  { key: 'doubleTapZoom', label: 'Double-Tap Zoom', type: 'toggle', default: true, desc: 'Double-tap to toggle zoom level on 3D views' },
  { key: 'scrollInvert', label: 'Invert Mouse Scroll', type: 'toggle', default: false, desc: 'ON: scroll up zooms out. OFF: scroll up zooms in' },
];

const DISPLAY_FIELDS = [
  { key: 'invertColors', label: 'Invert Colors', type: 'toggle', icon: ScanLine, default: false },
  { key: 'hueRotate', label: 'Hue Rotation', type: 'range', min: 0, max: 360, default: 0, unit: '\u00b0' },
  { key: 'saturation', label: 'Saturation', type: 'range', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'contrast', label: 'Contrast', type: 'range', min: 50, max: 200, default: 100, unit: '%' },
  { key: 'flipHorizontal', label: 'Flip Horizontal', type: 'toggle', icon: FlipHorizontal, default: false },
  { key: 'flipVertical', label: 'Flip Vertical', type: 'toggle', icon: FlipVertical, default: false },
];

function formatVal(field, val) {
  if (field.type === 'toggle') return val ? 'ON' : 'OFF';
  return `${val}${field.unit}`;
}

function ToggleBtn({ value, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 border text-[10px] ${value ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
    >
      {value ? 'ON' : 'OFF'}
    </button>
  );
}

function RangeInput({ field, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={field.min} max={field.max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-24" />
      <span className="text-orange-300 text-[10px] w-10 text-right">{value}{field.unit}</span>
    </div>
  );
}

export default function GestureDisplaySettings() {
  const { state, update } = useGameState();
  const [tab, setTab] = useState('gestures');
  const [selectedScreen, setSelectedScreen] = useState(INTERACTIVE_SCREENS[0].id);

  const fields = tab === 'gestures' ? GESTURE_FIELDS : DISPLAY_FIELDS;
  const category = tab;
  const globalSettings = state.settings?.[category]?.global || {};
  const screenOverrides = state.settings?.[category]?.screens?.[selectedScreen] || {};

  const setGlobal = (key, val) => {
    update(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [category]: {
          ...prev.settings?.[category],
          global: { ...prev.settings?.[category]?.global, [key]: val },
        },
      },
    }));
  };

  const setScreenOverride = (key, val) => {
    update(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [category]: {
          ...prev.settings?.[category],
          screens: {
            ...prev.settings?.[category]?.screens,
            [selectedScreen]: { ...prev.settings?.[category]?.screens?.[selectedScreen], [key]: val },
          },
        },
      },
    }));
  };

  const removeScreenOverride = (key) => {
    update(prev => {
      const current = { ...prev.settings?.[category]?.screens?.[selectedScreen] };
      delete current[key];
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [category]: {
            ...prev.settings?.[category],
            screens: {
              ...prev.settings?.[category]?.screens,
              [selectedScreen]: current,
            },
          },
        },
      };
    });
  };

  const resetScreen = () => {
    update(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [category]: {
          ...prev.settings?.[category],
          screens: {
            ...prev.settings?.[category]?.screens,
            [selectedScreen]: {},
          },
        },
      },
    }));
  };

  return (
    <div className="border border-orange-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Hand className="w-4 h-4 text-orange-500" />
        <h3 className="text-orange-400 text-sm font-bold uppercase">Gestures &amp; Display</h3>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('gestures')}
          className={`flex-1 py-1.5 border text-xs flex items-center justify-center gap-1.5 ${tab === 'gestures' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
        >
          <Hand className="w-3.5 h-3.5" /> GESTURES
        </button>
        <button
          onClick={() => setTab('display')}
          className={`flex-1 py-1.5 border text-xs flex items-center justify-center gap-1.5 ${tab === 'display' ? 'border-orange-500 bg-orange-950/40 text-orange-300' : 'border-orange-900 text-orange-700'}`}
        >
          <Monitor className="w-3.5 h-3.5" /> DISPLAY &amp; INVERSION
        </button>
      </div>

      <div className="border border-orange-900/50 p-3 space-y-1">
        <div className="text-orange-500 text-xs font-bold uppercase mb-1">Global Defaults</div>
        {fields.map(field => {
          const val = globalSettings[field.key] ?? field.default;
          const Icon = field.icon;
          return (
            <div key={field.key} className="py-0.5">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />}
                <span className="text-orange-500 text-xs flex-1">{field.label}</span>
                {field.type === 'toggle'
                  ? <ToggleBtn value={val} onClick={() => setGlobal(field.key, !val)} />
                  : <RangeInput field={field} value={val} onChange={v => setGlobal(field.key, v)} />}
              </div>
              {field.desc && <div className="text-orange-800 text-[9px] pl-6 mt-0.5">{field.desc}</div>}
            </div>
          );
        })}
      </div>

      <div className="border border-orange-900/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-orange-500 text-xs font-bold uppercase">Per-Screen Overrides</div>
          <button onClick={resetScreen} className="text-orange-700 text-[10px] hover:text-orange-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> RESET
          </button>
        </div>
        <select
          value={selectedScreen}
          onChange={e => setSelectedScreen(e.target.value)}
          className="w-full bg-black border border-orange-900 text-orange-400 text-xs px-2 py-1"
        >
          {INTERACTIVE_SCREENS.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div className="space-y-1">
          {fields.map(field => {
            const isOverridden = field.key in screenOverrides;
            const inheritedVal = globalSettings[field.key] ?? field.default;
            const effectiveVal = isOverridden ? screenOverrides[field.key] : inheritedVal;
            const Icon = field.icon;
            return (
              <div key={field.key} className={`flex items-center gap-2 py-0.5 ${isOverridden ? '' : 'opacity-60'}`}>
                <input
                  type="checkbox"
                  checked={isOverridden}
                  onChange={e => e.target.checked ? setScreenOverride(field.key, inheritedVal) : removeScreenOverride(field.key)}
                  className="accent-orange-500 flex-shrink-0"
                />
                {Icon && <Icon className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />}
                <span className="text-orange-500 text-xs flex-1">{field.label}</span>
                {isOverridden
                  ? (field.type === 'toggle'
                      ? <ToggleBtn value={effectiveVal} onClick={() => setScreenOverride(field.key, !effectiveVal)} />
                      : <RangeInput field={field} value={effectiveVal} onChange={v => setScreenOverride(field.key, v)} />)
                  : <span className="text-orange-700 text-[10px] italic">Inherited: {formatVal(field, inheritedVal)}</span>}
              </div>
            );
          })}
        </div>
        <div className="text-orange-700 text-[10px]">Check a box to override the global default for this screen only. Uncheck to inherit.</div>
      </div>
    </div>
  );
}