// Input System — singleton manager for keyboard + gamepad input.
// Supports multi-bind (multiple physical inputs per action),
// live rebinding via capture mode, and persistent config in localStorage.
import { getDefaultBindings } from './keybinds';

const STORAGE_KEY = 'starfarer_keybinds';

const GAMEPAD_BUTTON_NAMES = [
  'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT',
  'Back', 'Start', 'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right',
];

const KEY_LABELS = {
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
  Enter: '⏎', Space: '␣', Escape: 'ESC', Backspace: '⌫',
  ShiftLeft: 'L-SHIFT', ShiftRight: 'R-SHIFT',
  ControlLeft: 'L-CTRL', ControlRight: 'R-CTRL',
  Tab: 'TAB', Delete: 'DEL', Insert: 'INS',
  Home: 'HOME', End: 'END', PageUp: 'PGUP', PageDown: 'PGDN',
  BracketLeft: '[', BracketRight: ']',
  Semicolon: ';', Quote: "'", Backquote: '`',
  Comma: ',', Period: '.', Slash: '/',
  Backslash: '\\', Minus: '-', Equal: '=',
};

class InputSystem {
  constructor() {
    this.bindings = this._loadBindings();
    this.listeners = new Set();
    this.captureCallback = null;
    this.previousGamepadState = {};
    this.enabled = true;
    this._initKeyboard();
    this._initGamepadPolling();
  }

  _loadBindings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaults = getDefaultBindings();
        for (const id in defaults) {
          if (!parsed[id]) parsed[id] = defaults[id];
        }
        return parsed;
      }
    } catch (_) { /* ignore */ }
    return getDefaultBindings();
  }

  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bindings)); } catch (_) { /* ignore */ }
  }

  getBindings() { return this.bindings; }

  getBindingsForAction(actionId) {
    return this.bindings[actionId] || [];
  }

  setBindingsForAction(actionId, bindings) {
    this.bindings[actionId] = bindings;
    this._save();
  }

  addBinding(actionId, binding) {
    if (!this.bindings[actionId]) this.bindings[actionId] = [];
    if (!this._findBindingIndex(actionId, binding).found) {
      this.bindings[actionId].push(binding);
      this._save();
    }
  }

  removeBinding(actionId, index) {
    if (this.bindings[actionId]) {
      this.bindings[actionId].splice(index, 1);
      this._save();
    }
  }

  resetAction(actionId) {
    const defaults = getDefaultBindings();
    this.bindings[actionId] = defaults[actionId] || [];
    this._save();
  }

  resetToDefaults() {
    this.bindings = getDefaultBindings();
    this._save();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  setEnabled(enabled) { this.enabled = enabled; }

  // --- Capture mode (for rebinding) ---

  startCapture(callback) { this.captureCallback = callback; }
  cancelCapture() { this.captureCallback = null; }
  isCapturing() { return this.captureCallback !== null; }

  // --- Conflict detection ---

  findConflicts(binding, excludeActionId) {
    const conflicts = [];
    for (const actionId in this.bindings) {
      if (actionId === excludeActionId) continue;
      if (this._findBindingIndex(actionId, binding).found) {
        conflicts.push(actionId);
      }
    }
    return conflicts;
  }

  _findBindingIndex(actionId, binding) {
    const list = this.bindings[actionId] || [];
    for (let i = 0; i < list.length; i++) {
      if (this._bindingEquals(list[i], binding)) return { found: true, index: i };
    }
    return { found: false, index: -1 };
  }

  _bindingEquals(a, b) {
    if (a.type !== b.type) return false;
    if (a.type === 'key') return a.code === b.code;
    if (a.type === 'gamepad') return a.button === b.button && (a.gamepadIndex ?? null) === (b.gamepadIndex ?? null);
    return false;
  }

  // --- Keyboard ---

  _initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (this.captureCallback) {
        if (e.code === 'Escape') {
          const cb = this.captureCallback;
          this.captureCallback = null;
          cb(null);
          e.preventDefault();
          return;
        }
        e.preventDefault();
        const binding = { type: 'key', code: e.code };
        const cb = this.captureCallback;
        this.captureCallback = null;
        cb(binding);
        return;
      }
      if (!this.enabled) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      this._dispatchKey(e.code);
    });
  }

  _dispatchKey(code) {
    for (const actionId in this.bindings) {
      for (const b of this.bindings[actionId]) {
        if (b.type === 'key' && b.code === code) {
          this._notify(actionId);
          return;
        }
      }
    }
  }

  // --- Gamepad ---

  _initGamepadPolling() {
    const poll = () => {
      this._pollGamepads();
      requestAnimationFrame(poll);
    };
    poll();
  }

  _pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gi = 0; gi < gamepads.length; gi++) {
      const gp = gamepads[gi];
      if (!gp) continue;
      if (!this.previousGamepadState[gi]) this.previousGamepadState[gi] = {};
      const prev = this.previousGamepadState[gi];
      for (let bi = 0; bi < gp.buttons.length; bi++) {
        const pressed = gp.buttons[bi].pressed;
        const wasPressed = prev[bi] || false;
        if (pressed && !wasPressed) {
          if (this.captureCallback) {
            const binding = { type: 'gamepad', button: bi, gamepadIndex: null };
            const cb = this.captureCallback;
            this.captureCallback = null;
            cb(binding);
            return;
          }
          if (this.enabled) this._dispatchGamepad(bi);
        }
        prev[bi] = pressed;
      }
    }
  }

  _dispatchGamepad(button) {
    for (const actionId in this.bindings) {
      for (const b of this.bindings[actionId]) {
        if (b.type === 'gamepad' && b.button === button) {
          this._notify(actionId);
          return;
        }
      }
    }
  }

  _notify(actionId) {
    for (const listener of this.listeners) {
      listener(actionId, 'down');
    }
  }

  // --- Display formatting ---

  formatBinding(binding) {
    if (binding.type === 'key') return this._formatKey(binding.code);
    if (binding.type === 'gamepad') return this._formatGamepadButton(binding.button, binding.gamepadIndex);
    return '?';
  }

  _formatKey(code) {
    if (KEY_LABELS[code]) return KEY_LABELS[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('F') && /^F\d+$/.test(code)) return code;
    if (code.startsWith('Numpad')) return 'NUM ' + code.slice(6);
    return code;
  }

  _formatGamepadButton(button, gamepadIndex) {
    const name = GAMEPAD_BUTTON_NAMES[button] || `B${button}`;
    const prefix = gamepadIndex != null ? `GP${gamepadIndex + 1} ` : 'GP ';
    return prefix + name;
  }
}

export const inputSystem = new InputSystem();