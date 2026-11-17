/**
 * MG GLSL Aurora Ribbons & Beat-Sync Type Intro
 * Aangepast: 'MOTION' en 'REEL' verwijderd, en overgang naar Quiz Lobby via de rode knop (of fysieke rode buzzer).
 */
(() => {
  const introScreen = document.getElementById('screenIntro');
  const canvas = document.getElementById('mgpro-canvas');
  const btnEnterQuiz = document.getElementById('btnIntroStartQuiz');
  const btnToggleIntroAudio = document.getElementById('btnIntroAudio');
  const btnReplayIntro = document.getElementById('btnReplayIntro');

  if (!introScreen || !canvas) return;

  const SETTINGS = {
    headline: 'Mediawijsheid',
    subhead: 'QUIZ',
    introTag: 'GET READY...',
    beatWords: 'WELKOM // BIJ // DE // MEDIA // WIJSHEID // QUIZ // 2027 // ',
    climaxText: 'SVS MELLE',
    ctaHandle: 'bewijs dat jullie echte media-experts zijn!',
    bgColor: '#060914',
    accentColor: '#60a5fa',
    secondaryColor: '#ec4899',
    enableAudio: true,
    showHud: false,
    audioTrack: 'auto'
  };
  const MODE = 'aurora';

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutQuint = (t) => 1 - Math.pow(1 - clamp01(t), 5);
  const easeOutBack = (t) => {
    t = clamp01(t);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const seg = (t, s, e) => clamp01((t - s) / (e - s));

  class ShowreelProAudio {
    constructor(defaultTrack = 'future_bass') {
      this.defaultTrack = defaultTrack;
      this.track = defaultTrack;
      this.ctx = null;
      this.masterGain = null;
      this.comp = null;
      this.noiseBuf = null;
      this.enabled = true;
      this.lastStep = -1;
      this.bassEnergy = 0;
      this.midEnergy = 0;
    }

    setTrack(track) {
      this.track = !track || track === 'auto' ? this.defaultTrack : track;
    }

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.comp = this.ctx.createDynamicsCompressor();
        this.comp.threshold.value = -14;
        this.comp.knee.value = 18;
        this.comp.ratio.value = 6;
        this.comp.attack.value = 0.003;
        this.comp.release.value = 0.14;

        const shaper = this.ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = Math.tanh(x * 1.45);
        }
        shaper.curve = curve;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.45;

        shaper.connect(this.comp);
        this.comp.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        const len = Math.floor(this.ctx.sampleRate * 1.5);
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const ch = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      } catch {
        this.ctx = null;
      }
    }

    get inputNode() {
      return this.comp || this.masterGain;
    }

    resume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        return this.ctx.resume().then(() => true).catch(() => false);
      }
      return Promise.resolve(!!(this.ctx && this.ctx.state === 'running'));
    }

    reset() {
      this.lastStep = -1;
      this.bassEnergy = 0;
      this.midEnergy = 0;
    }

    destroy() {
      if (this.ctx) {
        try {
          this.ctx.close();
        } catch {}
        this.ctx = null;
      }
    }

    kick(power = 1, is808 = false) {
      this.bassEnergy = Math.min(1, this.bassEnergy + 0.95 * power);
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(is808 ? 140 : 175, now);
      osc.frequency.exponentialRampToValueAtTime(is808 ? 34 : 42, now + (is808 ? 0.24 : 0.14));
      g.gain.setValueAtTime(0.95 * power, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (is808 ? 0.42 : 0.26));
      osc.connect(g);
      g.connect(this.inputNode);
      osc.start(now);
      osc.stop(now + (is808 ? 0.44 : 0.28));
    }

    snare(vol = 0.34) {
      this.midEnergy = Math.min(1, this.midEnergy + 0.85);
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running' || !this.noiseBuf) return;
      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1950;
      bp.Q.value = 0.9;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.inputNode);
      src.start(now);
      src.stop(now + 0.18);
    }

    hat(vol = 0.11, open = false) {
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running' || !this.noiseBuf) return;
      const now = this.ctx.currentTime;
      const dur = open ? 0.22 : 0.045;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(hp);
      hp.connect(g);
      g.connect(this.inputNode);
      src.start(now);
      src.stop(now + dur + 0.01);
    }

    crash(vol = 0.28) {
      this.midEnergy = 1;
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running' || !this.noiseBuf) return;
      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3400;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      src.connect(hp);
      hp.connect(g);
      g.connect(this.inputNode);
      src.start(now);
      src.stop(now + 1.0);
    }

    riser(dur = 0.85, vol = 0.22) {
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running' || !this.noiseBuf) return;
      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 2.4;
      bp.frequency.setValueAtTime(280, now);
      bp.frequency.exponentialRampToValueAtTime(4800, now + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.01, now);
      g.gain.linearRampToValueAtTime(vol, now + dur * 0.9);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.inputNode);
      src.start(now);
      src.stop(now + dur + 0.02);
    }

    supersaw(freq, dur = 0.32, vol = 0.16, detuneCents = 14) {
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const flt = this.ctx.createBiquadFilter();
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(4200, now);
      flt.frequency.exponentialRampToValueAtTime(520, now + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      flt.connect(g);
      g.connect(this.inputNode);

      [-detuneCents, 0, detuneCents].forEach((det) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(det, now);
        osc.connect(flt);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      });
    }

    bass(freq, dur = 0.2, vol = 0.28, wave = 'triangle') {
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const flt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now);
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(950, now);
      flt.frequency.exponentialRampToValueAtTime(180, now + dur);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(flt);
      flt.connect(g);
      g.connect(this.inputNode);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }

    update(t, dt) {
      this.bassEnergy = Math.max(0, this.bassEnergy - dt * 3.8);
      this.midEnergy = Math.max(0, this.midEnergy - dt * 4.5);

      const step = Math.floor(t * 8);
      if (step === this.lastStep) return;
      this.lastStep = step;

      const barStep = step % 16;
      if (step === 0) {
        this.kick(1.15, true);
        this.crash(0.32);
      }
      if (step === 16) this.riser(0.75, 0.26);
      if (step === 22) {
        this.crash(0.34);
        this.kick(1.15, false);
      }
      if (step === 44) this.riser(0.6, 0.28);
      if (step === 49) {
        this.crash(0.38);
        this.kick(1.2, true);
      }
      if (step === 89) {
        this.crash(0.36);
        this.kick(1.15, true);
      }
      if (step === 104) {
        this.crash(0.3);
        this.supersaw(220, 1.1, 0.2, 18);
        this.supersaw(329.63, 1.1, 0.16, 12);
      }

      const isDrop = t >= 6.2 && t < 13.0;
      const isOutro = t >= 13.0;

      if (isOutro) {
        if (barStep % 4 === 0) this.kick(0.7, true);
        return;
      }

      const chords = [
        [130.81, 164.81, 196.0],
        [146.83, 174.61, 220.0],
        [110.0, 130.81, 164.81],
        [98.0, 123.47, 146.83]
      ];
      const ch = chords[(step >> 3) % chords.length];
      if (barStep === 0 || barStep === 6 || barStep === 10) this.kick(1.05, true);
      if (barStep === 4 || barStep === 12) this.snare(0.34);
      if (barStep % 2 === 1) this.hat(0.11, barStep === 7);
      if (barStep % 4 === 0) {
        ch.forEach((f) => this.supersaw(f * (isDrop ? 2 : 1), isDrop ? 0.42 : 0.25, 0.11, 20));
        this.bass(ch[0] * 0.5, 0.36, 0.32, 'triangle');
      }
    }
  }

  class MgProRenderer {
    constructor(canvasEl, mode, settings, audio) {
      this.canvas = canvasEl;
      this.ctx = canvasEl.getContext('2d');
      this.mode = mode;
      this.settings = { ...settings };
      this.audio = audio;
      this.elapsed = 0;
      this.duration = 15.0;
      this.paused = false;
      this.raf = null;
      this.lastTs = 0;

      this.shaderCanvas = document.createElement('canvas');
      this.shaderCanvas.width = 192;
      this.shaderCanvas.height = 108;
      this.shaderCtx = this.shaderCanvas.getContext('2d');
      this.shaderImg = this.shaderCtx.createImageData(192, 108);
    }

    restart() {
      this.elapsed = 0;
      this.lastTs = performance.now();
    }

    start() {
      if (this.raf) return;
      this.lastTs = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, Math.max(0, (now - this.lastTs) / 1000));
        this.lastTs = now;
        if (!this.paused) {
          this.elapsed += dt;
          if (this.elapsed >= this.duration) {
            this.elapsed = 0;
            if (this.audio) this.audio.reset();
          }
          if (this.audio) this.audio.update(this.elapsed, dt);
        }
        this.draw(this.elapsed);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    stop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
    }

    hexToRgb(hex) {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#60a5fa');
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [96, 165, 250];
    }

    drawGlslShader(ctx, w, h, t, bass, accentHex, secondaryHex) {
      const sw = this.shaderCanvas.width;
      const sh = this.shaderCanvas.height;
      const data = this.shaderImg.data;
      const [ar, ag, ab] = this.hexToRgb(accentHex);
      const [br, bg, bb] = this.hexToRgb(secondaryHex);
      const beatPulse = 1 + bass * 0.45;

      let idx = 0;
      for (let py = 0; py < sh; py++) {
        const ny = (py / sh) * 2 - 1;
        for (let px = 0; px < sw; px++) {
          const nx = ((px / sw) * 2 - 1) * (sw / sh);
          const wave1 = Math.sin(nx * 3.2 + t * 1.8 + Math.sin(ny * 2.5 - t) * 1.2);
          const wave2 = Math.cos(ny * 4.5 - t * 2.2 + Math.cos(nx * 3.0 + t * 1.5));
          const ribbon = Math.exp(-Math.abs(ny + wave1 * 0.32 * beatPulse) * 4.2);
          const v = clamp01(ribbon * 0.85 + 0.25 * (0.5 + 0.5 * wave2));
          const v2 = clamp01(0.5 + 0.5 * Math.sin(nx * 4 - ny * 3 + t * 2.4));

          const mix = clamp01(v);
          const mix2 = clamp01(v2 * 0.65);
          const lum = 0.14 + mix * (0.65 + bass * 0.25);
          data[idx++] = Math.min(255, Math.floor((ar * mix + br * mix2) * lum));
          data[idx++] = Math.min(255, Math.floor((ag * mix + bg * mix2) * lum));
          data[idx++] = Math.min(255, Math.floor((ab * mix + bb * mix2) * lum));
          data[idx++] = 255;
        }
      }

      this.shaderCtx.putImageData(this.shaderImg, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 0.88;
      ctx.drawImage(this.shaderCanvas, 0, 0, w, h);
      ctx.restore();
    }

    drawBeatFullscreenWord(ctx, w, h, word, beatProgress, beatIndex, accentColor, secondaryColor) {
      const pop = easeOutBack(clamp01(beatProgress * 3.2));
      const fadeOut = 1 - seg(beatProgress, 0.78, 1.0);
      const scale = lerp(1.38, 0.96, easeOutQuint(clamp01(beatProgress * 2.2))) * (0.85 + 0.15 * pop);
      const tilt = (beatIndex % 2 === 0 ? -1 : 1) * 0.035 * (1 - clamp01(beatProgress * 2));

      ctx.save();
      ctx.translate(w * 0.5, h * 0.48);
      ctx.rotate(tilt);
      ctx.scale(scale, scale);
      ctx.globalAlpha = clamp01(fadeOut);

      const fontSize = Math.min(w * 0.15, h * 0.25);
      ctx.font = `900 ${fontSize}px "Inter", "Segoe UI", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const split = (1 - clamp01(beatProgress * 3.5)) * 14;
      if (split > 0.5) {
        ctx.fillStyle = accentColor;
        ctx.fillText(word, -split, 0);
        ctx.fillStyle = secondaryColor;
        ctx.fillText(word, split, 0);
      }

      if (beatIndex % 3 === 1) {
        ctx.lineWidth = Math.max(3, fontSize * 0.045);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeText(word, 0, 0);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha *= 0.28;
        ctx.fillText(word, 0, 0);
      } else {
        const tw = ctx.measureText(word).width + 64;
        const th = fontSize * 1.05;
        ctx.fillStyle = beatIndex % 2 === 0 ? accentColor : secondaryColor;
        ctx.fillRect(-tw * 0.5, -th * 0.5, tw, th);
        ctx.fillStyle = '#09090b';
        ctx.fillText(word, 0, 4);
      }
      ctx.restore();
    }

    draw(t) {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const s = this.settings;
      const bass = this.audio ? this.audio.bassEnergy : Math.pow(Math.abs(Math.sin(t * Math.PI * 2)), 4);
      const bg = s.bgColor || '#060914';
      const accent = s.accentColor || '#60a5fa';
      const secondary = s.secondaryColor || '#ec4899';

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      this.drawGlslShader(ctx, w, h, t, bass, accent, secondary);

      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.72);
      grad.addColorStop(0, 'rgba(0,0,0,0.08)');
      grad.addColorStop(1, 'rgba(0,0,0,0.68)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const words = (s.beatWords || 'WELKOM // BIJ // DE // MEDIA // WIJSHEID // QUIZ // 2027')
        .split('//')
        .map((x) => x.trim())
        .filter(Boolean);

      if (t < 2.8) {
        // ACT 1: Beat-Synced 3-2-1 Impact Intro (zonder MOTION en REEL)
        const beatIdx = Math.floor(t * 2);
        const beatFrac = (t * 2) % 1;
        const introWords = ['3', '2', '1', s.introTag || 'GET READY...', 'BUZZ!', 'QUIZ!'];
        this.drawBeatFullscreenWord(ctx, w, h, introWords[beatIdx % introWords.length], beatFrac, beatIdx, accent, secondary);
      } else if (t < 6.2) {
        // ACT 2: Hero Headline + Role Card
        const p = easeOutQuint(seg(t, 2.8, 3.6));
        const exit = seg(t, 5.8, 6.2);
        ctx.save();
        ctx.globalAlpha = clamp01(p * (1 - exit));
        const fs = Math.min(w * 0.085, h * 0.15);
        ctx.font = `900 ${fs}px "Inter", "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lift = (1 - p) * 40;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(s.headline || 'Mediawijsheid', w * 0.5, h * 0.43 + lift);

        const sub = s.subhead || 'QUIZ';
        ctx.font = `700 ${Math.max(16, fs * 0.28)}px "Inter", "Segoe UI", sans-serif`;
        const bw = ctx.measureText(sub).width + 44;
        ctx.fillStyle = accent;
        ctx.fillRect(w * 0.5 - bw * 0.5, h * 0.55 + lift, bw, 42);
        ctx.fillStyle = '#09090b';
        ctx.fillText(sub, w * 0.5, h * 0.55 + 21 + lift);
        ctx.restore();
      } else if (t < 11.2) {
        // ACT 3: Beat-Synced Typography Blitz
        const localT = t - 6.2;
        const beatIdx = Math.floor(localT * 2);
        const beatFrac = (localT * 2) % 1;
        const word = words[beatIdx % words.length] || 'QUIZ';
        this.drawBeatFullscreenWord(ctx, w, h, word, beatFrac, beatIdx, accent, secondary);
      } else if (t < 13.0) {
        // ACT 4: Climax Split Banner
        const p = easeOutBack(seg(t, 11.2, 11.8));
        ctx.save();
        ctx.translate(w * 0.5, h * 0.48);
        ctx.scale(p * (1 + bass * 0.06), p * (1 + bass * 0.06));
        const fs = Math.min(w * 0.095, h * 0.17);
        ctx.font = `900 ${fs}px "Inter", "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.strokeText(s.climaxText || 'SVS MELLE', 0, -fs * 0.55);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(s.headline || 'Mediawijsheid', 0, fs * 0.45);
        ctx.restore();
      } else {
        // ACT 5: End-Card
        const p = easeOutQuint(seg(t, 13.0, 13.7));
        ctx.save();
        ctx.globalAlpha = p;
        const fs = Math.min(w * 0.075, h * 0.13);
        ctx.font = `900 ${fs}px "Inter", "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(s.headline || 'Mediawijsheid', w * 0.5, h * 0.4);

        ctx.font = `700 ${Math.max(15, fs * 0.28)}px "Inter", "Segoe UI", sans-serif`;
        ctx.fillStyle = accent;
        ctx.fillText(s.ctaHandle || 'bewijs dat jullie echte media-experts zijn!', w * 0.5, h * 0.53);

        ctx.strokeStyle = secondary;
        ctx.lineWidth = 3 + bass * 4;
        ctx.strokeRect(w * 0.18, h * 0.24, w * 0.64, h * 0.44);
        ctx.restore();
      }
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  }
  window.addEventListener('resize', resize);
  resize();

  const audio = new ShowreelProAudio('future_bass');
  audio.enabled = SETTINGS.enableAudio;
  const renderer = new MgProRenderer(canvas, MODE, SETTINGS, audio);
  let introActive = true;

  function startIntro() {
    introActive = true;
    introScreen.classList.remove('hidden');
    audio.reset();
    renderer.restart();
    renderer.start();
  }

  function enterQuizFromIntro() {
    if (!introActive) return;
    introActive = false;
    renderer.stop();
    audio.destroy();
    introScreen.classList.add('hidden');
    if (window.BuzzSound) {
      window.BuzzSound.playRoundIntro();
    }
  }

  function updateAudioBtn() {
    if (!btnToggleIntroAudio) return;
    const unlocked = audio.ctx && audio.ctx.state === 'running';
    if (!audio.enabled) {
      btnToggleIntroAudio.textContent = '🔇 Muziek: Uit';
      btnToggleIntroAudio.classList.remove('animate-pulse', 'border-amber-400', 'text-amber-300');
    } else if (!unlocked) {
      btnToggleIntroAudio.textContent = '🔇 Klik ergens voor Muziek';
      btnToggleIntroAudio.classList.add('animate-pulse', 'border-amber-400', 'text-amber-300');
    } else {
      btnToggleIntroAudio.textContent = '🔊 Muziek: Aan';
      btnToggleIntroAudio.classList.remove('animate-pulse', 'border-amber-400', 'text-amber-300');
    }
  }

  // Probeer direct audio te starten (indien browser autoplay toestaat)
  audio.init();
  audio.resume().then(updateAudioBtn);

  // Unlock audio bij eerste klik of toetsaanslag
  const unlock = () => {
    if (!introActive) return;
    const wasSuspended = !audio.ctx || audio.ctx.state !== 'running';
    audio.resume().then((ok) => {
      if (ok && wasSuspended) {
        audio.reset();
      }
      updateAudioBtn();
    });
  };
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });

  if (btnEnterQuiz) {
    btnEnterQuiz.addEventListener('click', enterQuizFromIntro);
  }

  if (btnToggleIntroAudio) {
    btnToggleIntroAudio.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasSuspended = !audio.ctx || audio.ctx.state !== 'running';
      audio.resume().then(() => {
        if (wasSuspended) {
          audio.enabled = true;
          audio.reset();
        } else {
          audio.enabled = !audio.enabled;
        }
        updateAudioBtn();
      });
    });
  }

  if (btnReplayIntro) {
    btnReplayIntro.addEventListener('click', () => {
      audio.init();
      audio.resume().then(updateAudioBtn);
      startIntro();
    });
  }

  // Ook via de fysieke rode PS3 Buzz! knop (of toetsenbord Q/E/A/P) naar Start Quiz!
  if (window.BuzzDriver) {
    window.BuzzDriver.onPress((_playerIdx, button) => {
      if (introActive && button === 'red') {
        enterQuizFromIntro();
      }
    });
  }

  renderer.start();
})();
