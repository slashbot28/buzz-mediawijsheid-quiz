/**
 * Kinetix Spatial Oscilloscope Mini-Widget + Kinetic Orbitron Title
 * Geïmporteerd en geschaald voor linksboven in de header.
 */
(() => {
  const container = document.getElementById('kinetix-dial-container');
  const bezelSvg = document.getElementById('kinetix-bezel-svg');
  const glare = document.getElementById('kinetix-dial-glare');
  const ticksContainer = document.getElementById('kinetix-dial-ticks');
  const canvas = document.getElementById('kinetix-oscilloscope-canvas');
  const kineticWrap = document.getElementById('kinetix-kinetic-wrap');

  if (!container || !canvas) return;
  const ctx = canvas.getContext('2d');

  const config = {
    waveSpeed: 0.2,
    waveLines: 44,
    bezelAngle: 0,
    autoSpin: false,
    shockwavePower: 1.2
  };
  const colors = {
    primary: '#ff4d4d',
    accent: '#00f0ff',
    amber: '#ffd166',
    emerald: '#10b981'
  };

  let width = 96;
  let height = 96;
  let time = 0;
  let shockwave = 0;
  let bezelAngle = config.bezelAngle;
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function generateTicks() {
    if (!ticksContainer) return;
    ticksContainer.innerHTML = '';
    const size = ticksContainer.clientWidth || 84;
    const half = size / 2;
    const radius = half * 0.9;
    const totalTicks = 72;

    for (let i = 0; i < totalTicks; i++) {
      const tick = document.createElement('div');
      tick.className = 'kinetix-tick-mark';
      const deg = (360 / totalTicks) * i;
      const rad = (deg * Math.PI) / 180;
      const x = half + radius * Math.sin(rad);
      const y = half - radius * Math.cos(rad);
      tick.style.left = x.toFixed(1) + 'px';
      tick.style.top = y.toFixed(1) + 'px';
      tick.style.transform = `translate(-50%, -50%) rotate(${deg.toFixed(1)}deg)`;
      if (i % 9 === 0) tick.classList.add('major');
      else if (i % 3 === 0) tick.classList.add('medium');
      ticksContainer.appendChild(tick);
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = Math.max(64, rect.width || 84) * dpr;
    height = Math.max(64, rect.height || 84) * dpr;
    canvas.width = width;
    canvas.height = height;
    generateTicks();
  }

  window.addEventListener('resize', resize);
  resize();

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouse.targetX = Math.max(-1, Math.min(1, nx));
    mouse.targetY = Math.max(-1, Math.min(1, ny));
  });

  container.addEventListener('mouseleave', () => {
    mouse.targetX = 0;
    mouse.targetY = 0;
  });

  container.addEventListener('click', () => {
    shockwave = config.shockwavePower;
  });

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Kinetic text spans (Orbitron rock-bass-pulse)
  const spans = kineticWrap ? kineticWrap.querySelectorAll('.kinetix-fan-char') : [];
  let textTime = 0;

  function renderOscilloscope() {
    const dpr = window.devicePixelRatio || 1;
    const w = width;
    const h = height;
    const cx = w / 2;
    const cy = h / 2;
    const scaleFactor = (w / dpr) / 480;
    const u = dpr * scaleFactor;

    ctx.clearRect(0, 0, w, h);

    // 1. Crosshair & Circular Dot Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = Math.max(0.75, 1.5 * u);
    ctx.beginPath();
    ctx.moveTo(cx - 150 * u, cy);
    ctx.lineTo(cx + 150 * u, cy);
    ctx.moveTo(cx, cy - 150 * u);
    ctx.lineTo(cx, cy + 150 * u);
    ctx.stroke();

    // 2. Radar Sweep Beam
    const sweepAngle = (time * 1.6) % (Math.PI * 2);
    const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 * u);
    sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
    sweepGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.07)');
    sweepGrad.addColorStop(1, 'transparent');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 180 * u, sweepAngle - 0.55, sweepAngle, false);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * 180 * u, cy + Math.sin(sweepAngle) * 180 * u);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
    ctx.lineWidth = Math.max(1, 2.2 * u);
    ctx.stroke();
    ctx.restore();

    // 3. Central Pulsating Diamond Waveform
    const lineCount = config.waveLines;
    const halfLines = lineCount / 2;
    const maxH = 120 * u;
    const maxW = 155 * u;

    ctx.lineWidth = Math.max(0.9, 2.4 * u);
    for (let i = 0; i < lineCount; i++) {
      const normY = (i - halfLines) / halfLines;
      const y = cy + normY * maxH;
      const absY = Math.abs(normY);
      const envelope = Math.pow(Math.max(0, 1 - absY), 1.6);
      const oscillation = 0.84 + 0.16 * Math.sin(absY * 14 - time * 3.5);
      const shockBonus = shockwave * 0.8 * Math.sin(absY * 22 - time * 8);

      const halfW = envelope * maxW * (oscillation + shockBonus);
      if (halfW > 0.5) {
        const alpha = 0.4 + envelope * 0.55 + shockwave * 0.25;
        ctx.strokeStyle = colors.primary;
        ctx.globalAlpha = Math.min(alpha, 1.0);
        ctx.beginPath();
        ctx.moveTo(cx - halfW, y);
        ctx.lineTo(cx + halfW, y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;

    // Central Spine
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(1, 2.5 * u);
    ctx.beginPath();
    ctx.moveTo(cx - 155 * u, cy);
    ctx.lineTo(cx + 155 * u, cy);
    ctx.stroke();

    // 4. Exponential Easing Dot Stream
    const dotCount = 24;
    const startX = cx - 135 * u;
    const endX = cx + 150 * u;
    const spanX = endX - startX;
    const pulseIdx = (time * 18) % dotCount;

    for (let i = 0; i < dotCount; i++) {
      const p = i / (dotCount - 1);
      const x = startX + p * spanX;
      let y = cy;
      if (p >= 0.48) {
        const t = (p - 0.48) / 0.52;
        y = cy - Math.pow(t, 2.8) * (115 * u);
      }

      const isPulse = Math.abs(i - pulseIdx) < 2.0;
      const r = Math.max(1, (isPulse ? 5.5 : 3.2) * u);

      ctx.save();
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = (isPulse ? 10 : 4) * dpr;
      ctx.fillStyle = isPulse ? '#ffffff' : colors.primary;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function animateKineticText() {
    if (!spans.length) return;
    textTime += 0.02 * 0.2;
    const intensity = 0.35;
    spans.forEach((ch, i) => {
      const pulse = Math.sin(textTime * 4 + i * 0.25) * 0.5 + 0.5;
      const scale = 1.0 + pulse * 0.14 * intensity;
      const yShift = -Math.abs(Math.sin(textTime * 5 + i * 0.3)) * 5 * intensity;
      const rotX = Math.sin(textTime * 3 + i * 0.2) * 12 * intensity;
      const rotY = Math.cos(textTime * 2 + i * 0.2) * 8 * intensity;
      ch.style.transform = `translate3d(0px, ${yShift.toFixed(1)}px, 0) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    time += 0.018 * 1.1;
    shockwave = lerp(shockwave, 0, 0.05);

    if (bezelSvg) {
      bezelSvg.style.transform = `rotate(${bezelAngle.toFixed(2)}deg)`;
    }

    mouse.x = lerp(mouse.x, mouse.targetX, 0.1);
    mouse.y = lerp(mouse.y, mouse.targetY, 0.1);
    const tiltX = -mouse.y * 16;
    const tiltY = mouse.x * 16;
    container.style.transform = `perspective(600px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

    if (glare) {
      glare.style.transform = `translate(${(mouse.x * 4).toFixed(1)}px, ${(mouse.y * 4).toFixed(1)}px)`;
    }

    renderOscilloscope();
    animateKineticText();
  }

  loop();
})();
