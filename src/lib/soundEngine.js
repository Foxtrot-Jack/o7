// Procedural Sound Engine — Web Audio API SFX + ambient music generation
// All sounds are synthesized at runtime; no audio files needed.

import { MUSIC_TRACKS, MUSIC_PRESETS, SCALES } from './soundPresets';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.musicNodes = null;
    this.currentContext = null;
    this.pendingContext = null;
    this.settings = {
      enabled: true,
      sfxVolume: 0.7,
      musicVolume: 0.4,
      musicPreset: 'standard',
      customTracks: {},
    };
  }

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this._applyVolumes();
    } catch (e) {
      console.warn('Sound engine init failed:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (this.pendingContext) {
          const c = this.pendingContext;
          this.pendingContext = null;
          this.startMusic(c);
        }
      }).catch(() => {});
    }
  }

  setSettings(settings) {
    if (!settings) return;
    this.settings = { ...this.settings, ...settings };
    this._applyVolumes();
    if (!this.settings.enabled) {
      this.stopMusic();
    } else if (this.currentContext && !this.musicNodes) {
      this.startMusic(this.currentContext);
    } else if (this.musicNodes) {
      this._restartMusic();
    }
  }

  _applyVolumes() {
    if (!this.ctx) return;
    const master = this.settings.enabled ? 1 : 0;
    this.masterGain.gain.setTargetAtTime(master, this.ctx.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfxVolume ?? 0.7, this.ctx.currentTime, 0.05);
    this.musicGain.gain.setTargetAtTime(this.settings.musicVolume ?? 0.4, this.ctx.currentTime, 0.05);
  }

  _restartMusic() {
    if (!this.currentContext) return;
    const ctx = this.currentContext;
    this.stopMusic();
    this.startMusic(ctx);
  }

  // ===== SFX DISPATCH =====
  play(name) {
    if (!this.settings.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    switch (name) {
      case 'click': this._blip(800, 0.06, 'square', 0.2, t); break;
      case 'select': this._blip(1000, 0.05, 'sine', 0.15, t); break;
      case 'back': this._sweep(700, 400, 0.1, 'square', 0.15, t); break;
      case 'confirm': this._chord([523, 659, 784], 0.15, 'sine', 0.12, t); break;
      case 'cancel': this._blip(300, 0.1, 'sawtooth', 0.15, t); break;
      case 'error': this._buzz(150, 0.2, t); break;
      case 'toggle_on': this._sweep(600, 1000, 0.08, 'square', 0.12, t); break;
      case 'toggle_off': this._sweep(1000, 400, 0.08, 'square', 0.12, t); break;
      case 'notification': this._chord([784, 1047], 0.2, 'sine', 0.1, t); break;
      case 'scan': this._sweep(400, 1400, 0.4, 'sine', 0.12, t); break;
      case 'scan_complete': this._chord([523, 659, 784, 1047], 0.3, 'sine', 0.1, t); break;
      case 'body_discovered': this._chord([523, 784, 1047], 0.4, 'triangle', 0.1, t); break;
      case 'fss_tune': this._blip(600 + Math.random() * 400, 0.04, 'sine', 0.08, t); break;
      case 'jump': this._jumpSound(t); break;
      case 'warp': this._warpSound(t); break;
      case 'dock': this._dockSound(t); break;
      case 'undock': this._sweep(300, 800, 0.3, 'sawtooth', 0.15, t); break;
      case 'buy': this._chord([659, 880], 0.12, 'sine', 0.1, t); break;
      case 'sell': this._chord([880, 659], 0.12, 'sine', 0.1, t); break;
      case 'credits': this._creditsSound(t); break;
      case 'weapon': this._weaponSound(t); break;
      case 'shield_hit': this._shieldHitSound(t); break;
      case 'hull_hit': this._noiseBurst(0.1, 0.2, 2000, t); break;
      case 'explosion': this._explosionSound(t); break;
      case 'mining': this._miningSound(t); break;
      case 'alert': this._alertSound(t); break;
      case 'typing': this._blip(1200 + Math.random() * 200, 0.02, 'square', 0.05, t); break;
      default: break;
    }
  }

  // ===== SFX PRIMITIVES =====
  _blip(freq, dur, type, gain, t) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _sweep(f1, f2, dur, type, gain, t) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _chord(freqs, dur, type, gain, t) {
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g).connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }
  }

  _buzz(freq, dur, t) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 0.8, t + dur);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  _noiseBurst(dur, gain, filterFreq, t) {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * dur, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  // ===== COMPLEX SFX =====
  _jumpSound(t) {
    const sr = this.ctx.sampleRate;
    const dur = 1.2;
    const buf = this.ctx.createBuffer(1, sr * dur, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.pow(1 - i / data.length, 1.5);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + dur);
    filter.Q.value = 3;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur);
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);
    og.gain.setValueAtTime(0.25, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    osc.connect(og).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.1);
  }

  _warpSound(t) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.6);
    this._noiseBurst(1.0, 0.15, 500, t);
  }

  _dockSound(t) {
    const notes = [440, 554, 659];
    notes.forEach((f, i) => {
      this._blip(f, 0.15, 'sine', 0.12, t + i * 0.12);
    });
    this._noiseBurst(0.5, 0.08, 400, t);
  }

  _creditsSound(t) {
    const notes = [659, 784, 988, 1319];
    notes.forEach((f, i) => {
      this._blip(f, 0.1, 'triangle', 0.08, t + i * 0.06);
    });
  }

  _weaponSound(t) {
    const sr = this.ctx.sampleRate;
    const dur = 0.15;
    const buf = this.ctx.createBuffer(1, sr * dur, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + dur);
    filter.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur);
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    og.gain.setValueAtTime(0.1, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(og).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  _shieldHitSound(t) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
    this._noiseBurst(0.05, 0.05, 3000, t);
  }

  _explosionSound(t) {
    this._noiseBurst(0.5, 0.35, 800, t);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  _miningSound(t) {
    this._noiseBurst(0.08, 0.15, 1500, t);
    this._blip(150, 0.06, 'sawtooth', 0.08, t);
  }

  _alertSound(t) {
    this._blip(880, 0.1, 'square', 0.12, t);
    setTimeout(() => { if (this.ctx) this._blip(880, 0.1, 'square', 0.12, this.ctx.currentTime); }, 200);
  }

  // ===== MUSIC SYSTEM =====
  _getTrackForContext(context) {
    const preset = MUSIC_PRESETS[this.settings.musicPreset] || MUSIC_PRESETS.standard;
    const custom = this.settings.customTracks?.[context];
    return custom || preset.tracks[context] || 'minimal';
  }

  startMusic(context) {
    if (!this.settings.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.pendingContext = context;
      return;
    }
    if (this.currentContext === context && this.musicNodes) return;
    this.stopMusic();
    this.currentContext = context;
    const trackId = this._getTrackForContext(context);
    const track = MUSIC_TRACKS[trackId] || MUSIC_TRACKS.minimal;
    this.musicNodes = this._createMusicNodes(track, context);
  }

  stopMusic() {
    if (!this.musicNodes) return;
    const t = this.ctx ? this.ctx.currentTime : 0;
    try {
      if (this.musicNodes.gain) {
        this.musicNodes.gain.gain.cancelScheduledValues(t);
        this.musicNodes.gain.gain.setValueAtTime(this.musicNodes.gain.gain.value, t);
        this.musicNodes.gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      }
    } catch (e) {}
    const nodes = this.musicNodes;
    setTimeout(() => {
      if (!nodes) return;
      nodes.oscillators?.forEach(o => { try { o.stop(); } catch (e) {} });
      nodes.intervals?.forEach(i => clearInterval(i));
      nodes.timeouts?.forEach(to => clearTimeout(to));
    }, 1600);
    this.musicNodes = null;
    this.currentContext = null;
  }

  _createMusicNodes(track, context) {
    const nodes = { oscillators: [], intervals: [], timeouts: [], gain: null };
    const t = this.ctx.currentTime;

    const musicBus = this.ctx.createGain();
    musicBus.gain.setValueAtTime(0, t);
    musicBus.gain.linearRampToValueAtTime(0.3, t + 3);
    musicBus.connect(this.musicGain);
    nodes.gain = musicBus;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = track.filter || 800;
    filter.Q.value = 1;
    filter.connect(musicBus);

    // Drone oscillator
    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone.type = track.oscType || 'sine';
    drone.frequency.value = track.baseFreq || 55;
    droneGain.gain.value = track.droneGain || 0.12;
    drone.connect(droneGain).connect(filter);
    drone.start(t);
    nodes.oscillators.push(drone);

    // LFO for drone frequency modulation
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = track.lfoRate || 0.08;
    lfoGain.gain.value = track.baseFreq ? track.baseFreq * 0.1 : 5;
    lfo.connect(lfoGain).connect(drone.frequency);
    lfo.start(t);
    nodes.oscillators.push(lfo);

    // Harmonic drone (fifth above)
    const harm = this.ctx.createOscillator();
    const harmGain = this.ctx.createGain();
    harm.type = track.oscType || 'sine';
    harm.frequency.value = (track.baseFreq || 55) * 1.5;
    harmGain.gain.value = (track.droneGain || 0.12) * 0.4;
    harm.connect(harmGain).connect(filter);
    harm.start(t);
    nodes.oscillators.push(harm);

    // Melodic note scheduler
    const scale = SCALES[track.scale] || SCALES.minor;
    const baseFreq = track.baseFreq || 55;
    const noteInterval = (track.noteRate || 5000);
    const noteGain = track.noteGain || 0.06;
    const oscType = track.oscType || 'sine';

    const scheduleNote = () => {
      if (this.currentContext !== context) return;
      if (!this.ctx || this.ctx.state !== 'running') return;
      this._playMusicNote(baseFreq, scale, filter, noteGain, oscType);
    };

    const intervalId = setInterval(scheduleNote, noteInterval);
    nodes.intervals.push(intervalId);

    // First note after 2 seconds
    const firstTimeout = setTimeout(scheduleNote, 2000);
    nodes.timeouts.push(firstTimeout);

    // Second harmonic layer (high, sparse)
    if (track.harmonicLayer !== false) {
      const harmIntervalId = setInterval(() => {
        if (this.currentContext !== context) return;
        if (!this.ctx || this.ctx.state !== 'running') return;
        if (Math.random() < 0.4) {
          const noteIdx = Math.floor(Math.random() * scale.length);
          const freq = baseFreq * Math.pow(2, (scale[noteIdx] + 24) / 12);
          this._playMusicNote(freq, [0], filter, noteGain * 0.5, oscType);
        }
      }, noteInterval * 1.7);
      nodes.intervals.push(harmIntervalId);
    }

    return nodes;
  }

  _playMusicNote(baseFreq, scale, dest, gain, oscType) {
    const t = this.ctx.currentTime;
    const noteIdx = Math.floor(Math.random() * scale.length);
    const octave = Math.random() < 0.3 ? 2 : (Math.random() < 0.5 ? 1 : 0);
    const semitones = scale[noteIdx] + 12 * octave + 12;
    const freq = baseFreq * Math.pow(2, semitones / 12);

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = oscType;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + 4);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + 4.5);
  }

  // Test a specific SFX (for settings UI)
  testSfx(name) {
    this.play(name);
  }

  // Preview a music track
  previewTrack(trackId) {
    if (!this.settings.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;
    this.stopMusic();
    this.currentContext = '__preview';
    const track = MUSIC_TRACKS[trackId] || MUSIC_TRACKS.minimal;
    this.musicNodes = this._createMusicNodes(track, '__preview');
  }

  stopPreview() {
    if (this.currentContext === '__preview') {
      this.stopMusic();
    }
  }
}

export const soundEngine = new SoundEngine();