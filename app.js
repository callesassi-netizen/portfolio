/* ==========================================================
   PORTFÖLJ · 2026 — app.js
   - Scrubbed hero (video/canvas) driven av scroll-progress 0..1
   - Scroll-driven parallax på övriga sektioner (transform-only)
   - Nav active state via IntersectionObserver
   - prefers-reduced-motion respekteras
   ========================================================== */

(() => {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = matchMedia('(hover: none)').matches;

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpC = (c1, c2, t) => [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
  const rgb = c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  function interpStops(p, stops) {
    if (p <= stops[0][0]) return stops[0][1];
    if (p >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
    for (let i = 0; i < stops.length - 1; i++) {
      const [t1, c1] = stops[i];
      const [t2, c2] = stops[i + 1];
      if (p >= t1 && p <= t2) return lerpC(c1, c2, (p - t1) / (t2 - t1));
    }
    return stops[0][1];
  }
  const smoothstep = t => t * t * (3 - 2 * t);

  // ==========================================================
  // HERO · scrubbed media
  // ==========================================================
  const heroWrap   = $('.hero-wrap');
  const heroSticky = $('.hero-sticky');
  const heroVideo  = $('#heroVideo');
  const heroCanvas = $('#heroCanvas');
  const heroFill   = $('#heroProgressFill');
  const heroContentEl = $('.hero-content');
  const heroPanels = $$('.hero-panel');

  let heroProgress = 0;
  let useVideo = false;

  // ---- Scrub smoothing-state ----
  let videoTargetTime = 0;   // dit scrollen vill ha videon
  let videoCurrentTime = 0;  // dit vi faktiskt skickat browsern (smooth)
  let heroLoopRAF = null;    // separat rAF för kontinuerlig smoothing
  const SCRUB_LERP = 0.18;   // 0..1, högre = mer responsiv, lägre = mjukare
  const SCRUB_EPS = 0.012;   // ~1/3 frame @30fps — skippa under detta

  // Detektera om video har en faktisk källa (när användaren senare lägger in den)
  if (heroVideo && heroVideo.querySelector('source')) {
    useVideo = true;
    heroVideo.hidden = false;
    heroCanvas.style.display = 'none';
    // På touch: varken loop-spelning eller scrub (iOS scrubbar hackigt).
    // Frys en representativ bildruta som stillbild — panelerna sköter scroll-känslan.
    if (IS_TOUCH) {
      heroVideo.removeAttribute('loop');
      heroVideo.pause();
      const freezeFrame = () => {
        try { heroVideo.currentTime = Math.min(2.4, (heroVideo.duration || 8) * 0.3); } catch (_) {}
      };
      if (heroVideo.readyState >= 1) freezeFrame();
      else heroVideo.addEventListener('loadedmetadata', freezeFrame, { once: true });
    }
  }

  // ---- Canvas-placeholder: natt → gryning → soluppgång ----
  const ctx = heroCanvas?.getContext('2d', { alpha: false });

  // Färg-stops baserade på Scrubbed hero-screenshots (08-10)
  const SKY_TOP = [
    [0.00, [12,  9, 36]],     // djupt nattblått-lila
    [0.40, [44, 24, 64]],     // gryningens lila
    [0.70, [192, 116, 96]],   // varm korall
    [1.00, [180, 196, 214]],  // ljus morgonhimmel
  ];
  const SKY_LOW = [
    [0.00, [40, 18, 50]],
    [0.40, [120, 50, 60]],
    [0.70, [232, 152, 96]],
    [1.00, [248, 210, 156]],
  ];
  const MTN_FAR = [
    [0.00, [28, 20, 44]],
    [0.50, [80, 56, 68]],
    [1.00, [176, 156, 132]],
  ];
  const MTN_MID = [
    [0.00, [18, 14, 32]],
    [0.50, [56, 38, 50]],
    [1.00, [120, 96, 80]],
  ];
  const MTN_NEAR = [
    [0.00, [8, 6, 16]],
    [0.50, [30, 22, 28]],
    [1.00, [56, 46, 38]],
  ];
  const FG = [
    [0.00, [4, 3, 8]],
    [1.00, [16, 12, 10]],
  ];

  // Stjärnor — slumpas en gång
  const STARS = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.55,
    r: Math.random() * 1.3 + 0.3,
    tw: Math.random() * 0.6 + 0.3,
  }));

  function resizeCanvas() {
    if (!heroCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = heroCanvas.clientWidth;
    const h = heroCanvas.clientHeight;
    heroCanvas.width  = Math.max(1, Math.round(w * dpr));
    heroCanvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Mountain silhouette helper — deterministisk våg
  function mountainPath(w, h, baseY, amp, freq, seed) {
    const pts = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = t * w;
      const n = Math.sin(t * freq * Math.PI * 2 + seed) * 0.6
              + Math.sin(t * freq * Math.PI * 4 + seed * 1.7) * 0.3
              + Math.sin(t * freq * Math.PI * 8 + seed * 2.3) * 0.1;
      const y = baseY + n * amp;
      pts.push([x, y]);
    }
    return pts;
  }
  function fillMountain(pts, w, h, color) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function paintHero(p) {
    if (!ctx || useVideo) return;
    const w = heroCanvas.clientWidth;
    const h = heroCanvas.clientHeight;
    if (w === 0 || h === 0) return;

    // SKY gradient
    const skyTop = rgb(interpStops(p, SKY_TOP));
    const skyLow = rgb(interpStops(p, SKY_LOW));
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.75);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(1, skyLow);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // STARS — synliga 0..0.5, fade ut
    const starAlpha = 1 - smoothstep(clamp(p / 0.55, 0, 1));
    if (starAlpha > 0.01) {
      ctx.save();
      for (const s of STARS) {
        const a = starAlpha * s.tw;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#f5f0e3';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // MOON (synlig vid natt) → SUN (synlig vid dag)
    // Moon: stor, mjuk, övre vänster (visible p < 0.4)
    const moonA = clamp(1 - p / 0.45, 0, 1);
    if (moonA > 0.01) {
      ctx.save();
      ctx.globalAlpha = moonA * 0.85;
      const mx = w * 0.18, my = h * 0.22, mr = Math.min(w, h) * 0.06;
      const moonGlow = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 4);
      moonGlow.addColorStop(0, 'rgba(232, 220, 196, 0.7)');
      moonGlow.addColorStop(0.3, 'rgba(232, 220, 196, 0.18)');
      moonGlow.addColorStop(1, 'rgba(232, 220, 196, 0)');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
      ctx.fillStyle = '#ecdfc6';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Sun: visible p > 0.35, stiger upp och blir starkare
    const sunA = clamp((p - 0.35) / 0.35, 0, 1);
    if (sunA > 0.01) {
      const sx = w * (0.72 - p * 0.04);
      // Stiger från under horisonten (h*0.7) till h*0.18
      const sy = lerp(h * 0.72, h * 0.18, sunA);
      const sr = lerp(28, Math.min(w, h) * 0.08, sunA);

      ctx.save();
      ctx.globalAlpha = sunA;
      // Glow
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 6);
      glow.addColorStop(0, 'rgba(255, 220, 170, 0.85)');
      glow.addColorStop(0.25, 'rgba(255, 180, 120, 0.45)');
      glow.addColorStop(1, 'rgba(255, 180, 120, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(sx - sr * 6, sy - sr * 6, sr * 12, sr * 12);
      // Sun disc
      ctx.fillStyle = '#fbd7a0';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // HAZE/mist — synlig mest vid gryning
    const hazeA = Math.sin(p * Math.PI) * 0.6;
    if (hazeA > 0.01) {
      ctx.save();
      ctx.globalAlpha = hazeA;
      const haze = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.85);
      haze.addColorStop(0, 'rgba(255, 220, 190, 0)');
      haze.addColorStop(0.5, 'rgba(255, 220, 190, 0.35)');
      haze.addColorStop(1, 'rgba(255, 220, 190, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, h * 0.55, w, h * 0.30);
      ctx.restore();
    }

    // MOUNTAINS — bakifrån-och-fram
    const farPts = mountainPath(w, h, h * 0.62, h * 0.06, 2, 1.2);
    fillMountain(farPts, w, h, rgb(interpStops(p, MTN_FAR)));

    const midPts = mountainPath(w, h, h * 0.72, h * 0.07, 1.6, 3.7);
    fillMountain(midPts, w, h, rgb(interpStops(p, MTN_MID)));

    const nearPts = mountainPath(w, h, h * 0.84, h * 0.08, 1.1, 5.9);
    fillMountain(nearPts, w, h, rgb(interpStops(p, MTN_NEAR)));

    // FOREGROUND — flack platta, varm svart
    ctx.fillStyle = rgb(interpStops(p, FG));
    ctx.fillRect(0, h * 0.92, w, h * 0.08);

    // Trädsiluetter
    ctx.fillStyle = rgb(interpStops(p, FG));
    const trees = [0.12, 0.28, 0.40, 0.56, 0.78, 0.92];
    for (const tx of trees) {
      const x = tx * w;
      const baseY = h * 0.92;
      const treeH = h * 0.10 + Math.sin(tx * 12) * h * 0.02;
      ctx.beginPath();
      ctx.moveTo(x - 5, baseY);
      ctx.lineTo(x, baseY - treeH);
      ctx.lineTo(x + 5, baseY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- Är hero synlig? ----
  function heroIsVisible() {
    if (!heroWrap) return false;
    const r = heroWrap.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  // ---- Scrub-loop: kontinuerlig rAF som glider videoCurrentTime mot målet ----
  function scrubLoop() {
    if (useVideo && heroVideo.duration && !IS_TOUCH) {
      // Exponentiell ease mot mål
      videoCurrentTime += (videoTargetTime - videoCurrentTime) * SCRUB_LERP;
      // Bara seeka om diff > epsilon (ca 1/3 frame) — annars är det bortkastat
      if (Math.abs(videoCurrentTime - heroVideo.currentTime) > SCRUB_EPS) {
        try { heroVideo.currentTime = videoCurrentTime; } catch (_) {}
      }
    }
    // Fortsätt så länge hero är i view OCH det fortfarande finns gap att stänga
    const gap = Math.abs(videoTargetTime - videoCurrentTime);
    if (heroIsVisible() && gap > SCRUB_EPS * 0.5) {
      heroLoopRAF = requestAnimationFrame(scrubLoop);
    } else {
      heroLoopRAF = null;
    }
  }
  function ensureScrubLoop() {
    if (!heroLoopRAF && useVideo && heroIsVisible()) {
      heroLoopRAF = requestAnimationFrame(scrubLoop);
    }
  }

  // ---- Hero scroll-uppdatering: sätt mål, väck loopen ----
  function updateHero() {
    if (!heroWrap) return;
    const r = heroWrap.getBoundingClientRect();
    // Panel/content/progress: använder sticky-rangen (panels timing-mässigt knutet till sticky-fasen)
    const stickyRange = heroWrap.offsetHeight - window.innerHeight;
    const p = clamp(-r.top / stickyRange, 0, 1);
    heroProgress = p;

    // VIDEO scrub: använder hela hero-wrap-höjden så videon fortsätter
    // evolveras även medan hero-sticky glider ut → ingen "stilla" frame
    // i övergången mot cases-sektionen.
    const videoRange = heroWrap.offsetHeight;
    const pVideo = clamp(-r.top / videoRange, 0, 1);

    if (useVideo && heroVideo.duration && !IS_TOUCH) {
      videoTargetTime = pVideo * heroVideo.duration;
      ensureScrubLoop();
    } else if (!useVideo) {
      paintHero(p);
    }

    // Progressbar
    if (heroFill) heroFill.style.width = (p * 100).toFixed(1) + '%';

    // Innehållets opacity: synligt nästan hela vägen, snabb fade i slutet
    const contentOp = p < 0.96 ? 1 : clamp(1 - (p - 0.96) / 0.04, 0, 1);
    document.documentElement.style.setProperty('--hero-content-opacity', contentOp.toFixed(3));
    // Scroll-hint: bara i början
    const hintOp = clamp(1 - p / 0.15, 0, 1);
    document.documentElement.style.setProperty('--hero-hint-opacity', hintOp.toFixed(3));

    // Toggla aktiv panel baserat på data-from / data-to
    for (let i = 0; i < heroPanels.length; i++) {
      const panel = heroPanels[i];
      const from = parseFloat(panel.dataset.from);
      const to   = parseFloat(panel.dataset.to);
      const active = (p >= from && p <= to);
      if (active !== panel.classList.contains('is-active')) {
        panel.classList.toggle('is-active', active);
      }
    }
  }

  // ==========================================================
  // PARALLAX (övriga sektioner)
  // ==========================================================
  function updateParallax() {
    if (REDUCED) return;
    const sections = $$('[data-section]:not(.section-hero)');
    const vh = window.innerHeight;
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      // Bara uppdatera när sektionen är nära viewporten (perf)
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const layers = sec.querySelectorAll('.layer');
      for (const layer of layers) {
        const speed  = parseFloat(layer.dataset.speed) || 0.3;
        const driftx = parseFloat(layer.dataset.driftx) || 0;
        const ty = -r.top * (1 - speed);
        const tx = -r.top * driftx * 0.25;
        layer.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      }
    }
  }

  // ==========================================================
  // CASES · kort längs en S-bana
  // .ps__pin fastnar (sticky) i 100vh; scroll-läget (0..1) översätts till en
  // position på banan. Korten är absolut centrerade och styrs enbart av
  // transform längs en S-kurva (sin). Mitten-kortet blir störst + visar titel.
  // Self-contained: paint körs i den delade tick-loopen längre ner.
  // Vid prefers-reduced-motion lämnas sektionen i sin staplade fallback.
  // ==========================================================
  const FS_CONFIG = {
    scrubLen:     0.7,   // skärmhöjder scroll per projekt
    spreadFactor: 0.94,  // horisontellt avstånd mellan kort (× kortets bredd)
    arcAmp:       0.12,  // S-kurvans höjd (andel av höjd)
    sWaves:       0.9,   // S-kurvans frekvens (lägre = mjukare båge)
    maxScale:     1.0,   // storlek i mitten
    minScale:     0.56,  // storlek längst ut
    falloff:      0.46,  // hur snabbt korten krymper bort från mitten
    tilt:         4,     // graders lutning längs banan
    tail:         0.10,  // sista andelen där vyn tonar ut mjukt
  };
  let fsPaint     = () => {};
  let fsSetHeight = () => {};

  // Mobil (och touch-surfplattor i porträtt): kör INTE den scroll-drivna S-banan —
  // den hackar på svagare GPU:er och överflödar layouten. Sektionen faller då
  // tillbaka på en ren, native-scrollad lodrät stapel (se CSS).
  const CARDS_STATIC = REDUCED || matchMedia('(max-width: 820px)').matches;

  (function setupSpline() {
    const section = $('.ps');
    if (!section || CARDS_STATIC) return;

    const wrap  = $('[data-ps-wrap]', section);
    const pin   = $('[data-ps-pin]', section);
    const stage = $('[data-ps-track]', section);
    const fill  = $('[data-ps-fill]', section);
    const cards = stage ? Array.from(stage.children) : [];
    if (!wrap || !pin || !stage || !cards.length) return;

    section.setAttribute('data-ps-ready', '');

    fsSetHeight = () => {
      // total scroll-sträcka ≈ antal kort × scrubLen skärmar (+ marginal)
      wrap.style.height = (cards.length * FS_CONFIG.scrubLen + 0.6) * 100 + 'vh';
    };

    const progress = () => {
      const total = wrap.offsetHeight - window.innerHeight;
      const scrolled = clamp(-wrap.getBoundingClientRect().top, 0, total);
      return total > 0 ? scrolled / total : 0;
    };

    fsPaint = () => {
      const wr = wrap.getBoundingClientRect();
      if (wr.bottom < 0 || wr.top > window.innerHeight) return; // utanför view
      const p = progress();
      const H = pin.clientHeight;
      const last = cards.length - 1;
      const f = p * last;                 // position på banan
      const spreadX = cards[0].offsetWidth * FS_CONFIG.spreadFactor; // nära kortets bredd
      const amp = FS_CONFIG.arcAmp * H;
      const active = clamp(Math.round(f), 0, last);

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const d = i - f;                  // avstånd från mitten i "steg"
        const ad = Math.abs(d);
        const dd = clamp(d, -2.4, 2.4);

        const x = dd * spreadX;                                   // sidled längs banan
        const y = Math.sin(dd * FS_CONFIG.sWaves) * amp;          // S-kurvans höjdled
        const scale = clamp(FS_CONFIG.maxScale - ad * FS_CONFIG.falloff, FS_CONFIG.minScale, FS_CONFIG.maxScale);
        const rot = dd * FS_CONFIG.tilt * -0.5;                   // lätt lutning längs kurvan
        const op = clamp(1.2 - Math.max(ad - 0.6, 0) * 0.85, 0.05, 1);
        const z = 120 - Math.round(ad * 12);

        c.style.transform =
          'translate3d(calc(-50% + ' + x.toFixed(1) + 'px), calc(-50% + ' + y.toFixed(1) + 'px), 0)' +
          ' rotate(' + rot.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
        c.style.opacity = op.toFixed(3);
        c.style.zIndex = z;
        c.classList.toggle('is-hero', i === active && ad < 0.5);

        // subtil inre parallax: mitten-kortet = scale 1.0 → hela bilden syns
        const inner = c.querySelector('.ps__media-inner');
        if (inner) inner.style.transform = 'scale(' + (1 + Math.min(ad, 1) * 0.04).toFixed(3) + ')';
      }

      if (fill) fill.style.width = (p * 100).toFixed(2) + '%';

      // mjuk exit nära slutet
      const t = clamp((p - (1 - FS_CONFIG.tail)) / FS_CONFIG.tail, 0, 1);
      pin.style.opacity = (1 - t * 0.3).toFixed(3);
    };

    fsSetHeight();
  })();

  // ==========================================================
  // TYPEWRITER · scroll-driven char reveal
  // Funkar på .cases-typewriter, .om-typewriter (eller fler)
  // ==========================================================
  const twEls = $$('.cases-typewriter, .om-typewriter');

  function splitToChars(root) {
    const collected = [];
    const walk = (node) => {
      const kids = [...node.childNodes];
      for (const child of kids) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          if (!text) continue;
          const frag = document.createDocumentFragment();
          for (const ch of text) {
            const span = document.createElement('span');
            span.className = 'tw-char';
            // Bevara mellanslag — nbsp förhindrar att webbläsaren collapse:ar
            span.textContent = ch === ' ' ? ' ' : ch;
            frag.appendChild(span);
            collected.push(span);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      }
    };
    walk(root);
    return collected;
  }

  // Per-element state: split chars + visibility cursor
  const twData = twEls.map(el => ({
    el,
    chars: REDUCED ? [] : splitToChars(el),
    visible: -1,
  }));

  function updateTypewriter() {
    if (!twData.length) return;
    const vh = window.innerHeight;
    for (const t of twData) {
      if (!t.chars.length) continue;
      const r = t.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      // Range: börjar skrivas när h2:s top når 82% av vh, klar vid 30%
      const start = vh * 0.82;
      const end   = vh * 0.30;
      const p = clamp((start - r.top) / (start - end), 0, 1);
      const target = Math.floor(p * t.chars.length);
      if (target === t.visible) continue;
      if (target > t.visible) {
        for (let i = Math.max(0, t.visible); i < target; i++) {
          t.chars[i].classList.add('tw-visible');
        }
      } else {
        for (let i = (t.visible < 0 ? 0 : t.visible) - 1; i >= target; i--) {
          t.chars[i].classList.remove('tw-visible');
        }
      }
      t.visible = target;
    }
  }

  // ==========================================================
  // TICK · enda rAF-loop
  // ==========================================================
  let ticking = false;
  function tick() {
    updateHero();
    updateParallax();
    fsPaint();
    updateTypewriter();
    ticking = false;
  }
  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll',  requestTick, { passive: true });
  window.addEventListener('resize', () => { resizeCanvas(); fsSetHeight(); requestTick(); }, { passive: true });

  // ==========================================================
  // INIT
  // ==========================================================
  function init() {
    if (heroCanvas) {
      resizeCanvas();
      paintHero(0);
    }
    if (useVideo && !IS_TOUCH) {
      const onMeta = () => {
        // Hoppa direkt till rätt scroll-position så vi inte får en lång catch-up
        const r = heroWrap.getBoundingClientRect();
        // Samma range som updateHero — hela hero-wrap (250vh)
        const videoRange = heroWrap.offsetHeight;
        const p = clamp(-r.top / videoRange, 0, 1);
        videoTargetTime  = p * heroVideo.duration;
        videoCurrentTime = videoTargetTime;
        try { heroVideo.currentTime = videoCurrentTime; } catch (_) {}
        requestTick();
      };
      heroVideo.addEventListener('loadedmetadata', onMeta);
      // Om metadata redan finns vid init (cache), trigga direkt
      if (heroVideo.readyState >= 1 && !isNaN(heroVideo.duration)) onMeta();
    }
    requestTick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================================
  // NAV · active state
  // ==========================================================
  const navLinks = $$('[data-nav]');
  const sections = $$('[data-section]');
  const navMap = new Map(navLinks.map(a => [a.dataset.section, a]));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      // Välj den entry med störst intersectionRatio
      let best = null;
      for (const e of entries) {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
          best = e;
        }
      }
      if (best) {
        const id = best.target.id;
        navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.section === id));
      }
    }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -40% 0px' });
    sections.forEach(s => io.observe(s));
  }

  // ==========================================================
  // REVEAL · scroll-trigger fade-in för .reveal-element
  // ==========================================================
  const revealEls = $$('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !REDUCED) {
      const revealIO = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            revealIO.unobserve(e.target);
          }
        }
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => revealIO.observe(el));
    } else {
      // Saknar IO eller reduced-motion — visa direkt
      revealEls.forEach(el => el.classList.add('is-revealed'));
    }
  }

  // Smooth scroll på nav-klick (utöver html { scroll-behavior: smooth })
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id?.startsWith('#')) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  });
})();

/* ==========================================================
   § 03 OM (Terminal sequencer) + § 04 KONTAKT (Postcard form)
   Drop-in från design_handoff_om_kontakt — egen IIFE, ingen scope-krock.
   ========================================================== */

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ──────────────────────────────────────────────────────────
  // TERMINAL SEQUENCER
  // ──────────────────────────────────────────────────────────
  const PROMPT = '<span class="term-prompt"><span class="at">calle@blomstrande</span>:<span class="path">~</span>$</span> ';

  const SCRIPT = [
    { type: 'cmd', text: 'whoami' },
    { type: 'out', html: '<span class="term-h">Carl-Johan "Calle" Blomstrand</span>\n<span class="term-dim">└─ digital innehållsproducent · kommunikatör · WordPress-byggare · webbhotell/cPanel · e-handel · AI-nyfiken problemlösare</span>' },
    { type: 'blank' },

    { type: 'cmd', text: 'tree ./verktyg/' },
    { type: 'out', html:
        '<span class="term-path">verktyg/</span>\n' +
        '├── <span class="term-path">webb/</span>\n' +
        '│   ├── wordpress       <span class="term-comment"># hemsidor åt kunder</span>\n' +
        '│   ├── cms\n' +
        '│   ├── e-handel\n' +
        '│   ├── webbhotell      <span class="term-comment"># cPanel · DNS · e-post · SSL</span>\n' +
        '│   ├── struktur\n' +
        '│   └── innehåll\n' +
        '├── <span class="term-path">kommunikation/</span>\n' +
        '│   ├── content\n' +
        '│   ├── copy            <span class="term-comment"># sv + en</span>\n' +
        '│   ├── kampanjer\n' +
        '│   └── kundkommunikation\n' +
        '├── <span class="term-path">analys/</span>\n' +
        '│   ├── webbanalys\n' +
        '│   ├── kampanjdata\n' +
        '│   └── rapportering\n' +
        '├── <span class="term-path">design/</span>\n' +
        '│   ├── canva\n' +
        '│   ├── grafisk produktion\n' +
        '│   └── visuell känsla\n' +
        '├── <span class="term-path">ai/</span>                  <span class="term-hot"># obsession</span>\n' +
        '│   ├── claude code\n' +
        '│   ├── chatgpt\n' +
        '│   ├── hermes\n' +
        '│   ├── n8n\n' +
        '│   ├── zapier\n' +
        '│   └── smarta flöden\n' +
        '├── <span class="term-path">projekt/</span>\n' +
        '│   ├── purrfect\n' +
        '│   ├── wordpress-hemsidor\n' +
        '│   ├── kundhemsidor\n' +
        '│   └── egna idéer\n' +
        '└── <span class="term-path">personligt/</span>\n' +
        '    ├── natur\n' +
        '    ├── hundar\n' +
        '    └── träning'
    },
    { type: 'blank' },

    { type: 'cmd', text: 'echo $STATUS' },
    { type: 'out', html: '<span class="term-mag">öppen för nya webbprojekt</span> · WordPress-hemsidor · innehåll · <span class="term-em">Purrfect</span> · smarta digitala lösningar\n<span class="term-dim">svarar oftast inom 1–2 arbetsdagar</span>' },
    { type: 'blank' },

    { type: 'prompt-only' },
  ];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function jitter(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

  async function runTerminal(body) {
    body.innerHTML = '';
    const writeLine = () => {
      const line = document.createElement('div');
      line.className = 'term-line';
      body.appendChild(line);
      return line;
    };

    for (let i = 0; i < SCRIPT.length; i++) {
      const step = SCRIPT[i];

      if (step.type === 'blank') {
        const sp = document.createElement('div');
        sp.className = 'term-blank';
        body.appendChild(sp);
        await sleep(prefersReduced ? 0 : 120);
        continue;
      }

      if (step.type === 'prompt-only') {
        const line = writeLine();
        line.innerHTML = PROMPT + '<span class="cursor"></span>';
        break;
      }

      if (step.type === 'cmd') {
        const line = writeLine();
        line.innerHTML = PROMPT;
        const span = document.createElement('span');
        span.className = 'term-cmd';
        line.appendChild(span);

        if (prefersReduced) {
          span.textContent = step.text;
        } else {
          await sleep(jitter(140, 360));
          for (const ch of step.text) {
            span.textContent += ch;
            await sleep(jitter(28, 72));
          }
        }
        await sleep(prefersReduced ? 0 : 180);
        continue;
      }

      if (step.type === 'out') {
        const html = step.html.replace(/\n/g, '<br>');
        const line = writeLine();
        if (prefersReduced) {
          line.innerHTML = html;
        } else {
          await sleep(60);
          const segments = html.split(/<br>/);
          for (let j = 0; j < segments.length; j++) {
            const seg = segments[j];
            const lineEl = j === 0 ? line : writeLine();
            lineEl.innerHTML = seg || '&nbsp;';
            await sleep(jitter(15, 50));
          }
        }
        await sleep(prefersReduced ? 0 : 220);
        continue;
      }
    }
  }

  function setupTerminal() {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      runTerminal(body);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      io.observe(body);
      setTimeout(start, 600);
    } else {
      start();
    }
  }

  // ──────────────────────────────────────────────────────────
  // POSTCARD FORM
  // ──────────────────────────────────────────────────────────
  function setupPostcardForm() {
    const form = document.getElementById('postcard-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.elements.name.value || '').trim();
      const email = (form.elements.email.value || '').trim();
      const message = (form.elements.message.value || '').trim();
      if (!name || !email || !message) {
        ['name', 'email', 'message'].forEach((k) => {
          const el = form.elements[k];
          if (el && !el.value.trim()) {
            el.style.outline = '2px solid rgba(217, 83, 59, 0.5)';
            el.style.outlineOffset = '4px';
            setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 2400);
          }
        });
        return;
      }
      const subject = `Brevkort från ${name}`;
      const body = `${message}\n\n— ${name}\n${email}`;
      const url = `mailto:calle.sassi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;
    });
  }

  function boot() {
    setupTerminal();
    setupPostcardForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
