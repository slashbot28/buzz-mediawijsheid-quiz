/**
 * SoundFX & Voiceover Engine voor BUZZ! Mediawijsheid
 * Gebruikt Web Audio API (geen externe audiobestanden nodig) + Web Speech API (NL).
 */
class BuzzSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.voiceEnabled = false;
    this.voices = [];
    this._initVoices();
  }

  _initVoices() {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  _ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  _pickFlemishTeacherVoice() {
    if (!this.voices || !this.voices.length) return null;
    const femaleBeNames = ['dena', 'veerle', 'ellen', 'hanne', 'lotte', 'femke', 'sofie'];
    const femaleNlNames = ['fenna', 'colette', 'claire', 'xander', 'laura'];

    // 1. Vrouwelijke Vlaamse stem (nl-BE) - bv. Microsoft Dena/Veerle Natural in Edge
    const beFemale = this.voices.find((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return lang.startsWith('nl-be') && femaleBeNames.some((n) => name.includes(n));
    });
    if (beFemale) return beFemale;

    // 2. Elke Vlaamse stem (nl-BE)
    const beAny = this.voices.find((v) => v.lang.toLowerCase().startsWith('nl-be'));
    if (beAny) return beAny;

    // 3. Vrouwelijke Nederlandse stem (nl-NL) als fallback
    const nlFemale = this.voices.find((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return lang.startsWith('nl') && femaleNlNames.some((n) => name.includes(n));
    });
    if (nlFemale) return nlFemale;

    // 4. Elke Nederlandse stem
    return this.voices.find((v) => v.lang.toLowerCase().startsWith('nl')) || null;
  }

  getActiveVoiceName() {
    const v = this._pickFlemishTeacherVoice();
    return v ? `${v.name} (${v.lang})` : 'Standaard Nederlands (nl-BE)';
  }

  speak(text) {
    if (!this.voiceEnabled || this.muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    const voice = this._pickFlemishTeacherVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice ? voice.lang : 'nl-BE';
    utter.rate = 0.96;
    utter.pitch = 1.08;
    window.speechSynthesis.speak(utter);
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  playTone(freq, duration = 0.15, type = 'sine', volume = 0.2, delay = 0) {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /** Uniek buzzer-geluid per speler (0..3) */
  playBuzzer(playerIndex = 0) {
    const baseFreqs = [330, 392, 466.16, 554.37];
    const freq = baseFreqs[playerIndex % baseFreqs.length];
    this.playTone(freq, 0.12, 'sawtooth', 0.22, 0);
    this.playTone(freq * 1.5, 0.22, 'triangle', 0.24, 0.06);
  }

  /** Zachte klik bij het kiezen van een antwoordkleur */
  playOptionClick() {
    this.playTone(620, 0.07, 'sine', 0.14, 0);
  }

  /** Countdown tick */
  playTick(urgent = false) {
    this.playTone(urgent ? 980 : 720, 0.05, 'triangle', urgent ? 0.16 : 0.08, 0);
  }

  /** Goed antwoord TV-show akkoord */
  playCorrect() {
    this.playTone(523.25, 0.14, 'triangle', 0.22, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.22, 0.09);
    this.playTone(783.99, 0.18, 'triangle', 0.24, 0.18);
    this.playTone(1046.5, 0.35, 'sine', 0.26, 0.27);
  }

  /** Fout antwoord "wah-wah" */
  playWrong() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    this.playTone(230, 0.22, 'sawtooth', 0.18, 0);
    this.playTone(175, 0.38, 'sawtooth', 0.2, 0.18);
  }

  /** Ronde intro fanfare */
  playRoundIntro() {
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((n, i) => {
      this.playTone(n, 0.18, 'triangle', 0.2, i * 0.1);
    });
  }

  /** Grote finale / winnaar fanfare */
  playVictory() {
    const melody = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 523.25, d: 0.15, t: 0.15 },
      { f: 523.25, d: 0.15, t: 0.3 },
      { f: 659.25, d: 0.35, t: 0.45 },
      { f: 587.33, d: 0.18, t: 0.85 },
      { f: 659.25, d: 0.18, t: 1.05 },
      { f: 783.99, d: 0.55, t: 1.25 }
    ];
    melody.forEach((m) => this.playTone(m.f, m.d, 'triangle', 0.25, m.t));
  }
}

window.BuzzSound = new BuzzSoundEngine();
