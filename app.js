/* ==========================================================================
   Blomstrande — interaktion
   Allt scroll-drivet går genom EN rAF-throttlad loop (frame). Effekter läser
   och skriver CSS-variabler i stället för att styra stilar direkt, så CSS:en
   äger utseendet och JS bara matar den med tal.
   ========================================================================== */
(function () {
  'use strict';

  var root   = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = matchMedia('(pointer:fine)').matches;
  var mqLarge = matchMedia('(min-width:761px)');

  var clamp = function (v, a, b) { a = a || 0; b = b === undefined ? 1 : b; return v < a ? a : (v > b ? b : v); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Laddning ─────────────────────────────────────────────────────────
     Kort med flit. En preloader ska ge en andhämtning, inte en väntetid. */
  (function loader() {
    var el = $('#loader'), bar = $('#loaderBar'), num = $('#loaderCount');
    if (!el) return;
    if (reduce) { el.remove(); root.classList.add('anim'); return; }

    var pct = 0, dur = 780, t0 = performance.now();
    (function tick(now) {
      var p = clamp((now - t0) / dur);
      pct = Math.round(p * 100);
      if (bar) bar.style.width = pct + '%';
      if (num) num.textContent = pct;
      if (p < 1) { requestAnimationFrame(tick); }
      else {
        el.classList.add('is-done');
        root.classList.add('anim');
        setTimeout(function () { el.remove(); }, 1100);
      }
    })(t0);
  })();

  /* ── Hero-video ───────────────────────────────────────────────────────
     Fotot står still. Det enda som rör sig är skärmarna: monitorn scrollar
     genom sajter som är byggda, laptopen genom koden bakom dem. Videons
     första bildruta är identisk med stillbilden, så bytet syns inte.

     Den laddas bara när det är befogat — bred skärm, inte reducerad rörelse,
     inte sparläge — och pausar så fort hero lämnat vyn. */
  (function heroVideo() {
    var v = $('#heroVideo');
    if (!v) return;

    var conn = navigator.connection || {};
    if (reduce || innerWidth < 900 || conn.saveData ||
        /2g|slow-2g/.test(conn.effectiveType || '')) { v.remove(); return; }

    [['assets/hero.webm', 'video/webm'], ['assets/hero.mp4', 'video/mp4']]
      .forEach(function (s) {
        if (!v.canPlayType(s[1])) return;
        var el = document.createElement('source');
        el.src = s[0]; el.type = s[1];
        v.appendChild(el);
      });
    if (!v.firstChild) { v.remove(); return; }

    var seen = true;
    var play = function () {
      if (!seen || !v.src && !v.currentSrc) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay nekad — bilden räcker */ });
    };

    v.addEventListener('canplay', function () { v.classList.add('is-on'); play(); });

    /* Hämtas först när sidan i övrigt är klar. Annars konkurrerar drygt en
       halv megabyte video med hero-bilden om samma uppkoppling, och det är
       bilden besökaren ser först. */
    var start = function () { v.preload = 'auto'; v.load(); };
    if (document.readyState === 'complete') setTimeout(start, 300);
    else addEventListener('load', function () { setTimeout(start, 300); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { seen = e.isIntersecting; seen ? play() : v.pause(); });
      }, { threshold: 0.05 }).observe(v);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) v.pause(); else if (v.getBoundingClientRect().bottom > 0) play();
    });
  })();

  /* ── Magnetiska knappar ───────────────────────────────────────────────
     Dras mot pekaren inom sin egen radie och glider tillbaka på väg ut. */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(function (el) {
      var strength = 0.32;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * strength + 'px,' + dy * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ── Meny ─────────────────────────────────────────────────────────────── */
  (function menu() {
    var burger = $('#burger');
    if (!burger) return;
    var close = function () { document.body.classList.remove('is-menu', 'is-locked'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('is-menu');
      document.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#mobile a').forEach(function (a) { a.addEventListener('click', close); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* ── Språkväljare ─────────────────────────────────────────────────────── */
  (function langUI() {
    var wrap = $('#lang'), btn = $('#langBtn');
    if (!wrap || !btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function () { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (window.BL_I18N) window.BL_I18N.set(b.getAttribute('data-lang'));
        wrap.classList.remove('is-open');
      });
    });
  })();

  /* ── Reveals ──────────────────────────────────────────────────────────
     CSS:en som döljer elementen ligger bakom .js-klassen (satt inline i
     <head>), så utan JavaScript syns allt direkt i stället för aldrig. */
  (function reveals() {
    var els = $$('[data-reveal]').concat($$('.about__media'));
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    els.forEach(function (el) {
      var g = el.closest('[data-reveal-group]');
      if (g) {
        var sibs = $$('[data-reveal]', g);
        el.style.setProperty('--d', (sibs.indexOf(el) * 0.07) + 's');
      }
      io.observe(el);
    });
  })();

  /* ── Scrub-text ───────────────────────────────────────────────────────
     Orden delas i spans och tänds i takt med scrollen. De första orden
     får accentfärg så meningen får en tyngdpunkt. */
  var scrubs = [];

  function splitScrubs() {
    scrubs = [];
    $$('[data-scrub-text]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w' + (i < 2 ? ' is-head' : '');
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      var track = el.closest('[data-scrub-track]') || el;
      scrubs.push({ track: track, words: $$('.w', el), items: $$('[data-scrub-item]', track.parentNode || track) });
    });
    if (reduce) scrubs.forEach(function (s) {
      s.words.forEach(function (w) { w.classList.add('is-lit'); });
      s.items.forEach(function (li) { li.classList.add('is-on'); });
    });
  }
  splitScrubs();

  // Språkbytet skriver om textContent, vilket sopar bort ordspannen — bygg om
  // dem och kör en bildruta så orden tänds enligt nuvarande scrollposition.
  document.addEventListener('bl:lang', function () {
    splitScrubs();
    onScroll();
  });

  /* ── 3D-tilt på casekort ──────────────────────────────────────────────
     Medvetet svagt. Går man över ~7 grader slutar det kännas som material
     och börjar kännas som en leksak. */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (card) {
      var inner = $('.case__link', card) || card;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = 'perspective(1000px) rotateY(' + (px * 6).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg) translateZ(0)';
      });
      card.addEventListener('mouseleave', function () { inner.style.transform = ''; });
    });

    // Ljuskägla inuti tjänstekorten
    $$('.svc').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ── Ljuskägla i hero ─────────────────────────────────────────────────── */
  (function heroGlow() {
    var hero = $('[data-spotlight]');
    if (!hero || !fine || reduce) return;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
      hero.classList.add('is-lit');
    });
    hero.addEventListener('mouseleave', function () { hero.classList.remove('is-lit'); });
  })();

  /* ── Sifferuppräkning ─────────────────────────────────────────────────── */
  (function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-count-suffix') || '';
        var t0 = performance.now(), dur = 1100;
        (function step(now) {
          var p = clamp((now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ── Case-bandet ──────────────────────────────────────────────────────
     Innehållet dubbleras så att -50 % translate blir en sömlös loop, och
     farten sätts efter hur brett bandet faktiskt är — annars rusar ett kort
     band och ett långt kryper. Vid reducerad rörelse står det still och blir
     svepbart i stället (CSS sköter det). */
  (function marquee() {
    var wrap = $('[data-marquee]'), rail = $('#workRail');
    if (!wrap || !rail) return;

    if (reduce) { rail.style.animation = 'none'; return; }

    rail.innerHTML += rail.innerHTML;
    $$('[aria-hidden]', rail); // no-op, håller strukturen intakt

    function speed() {
      var w = rail.scrollWidth / 2;          // en uppsättning kort
      rail.style.setProperty('--dur', Math.max(28, Math.round(w / 55)) + 's');
    }
    speed();
    addEventListener('resize', speed);

    // Dubbletterna ska inte läsas upp eller nås med tabb
    var cards = $$('.case', rail);
    cards.slice(cards.length / 2).forEach(function (c) {
      c.setAttribute('aria-hidden', 'true');
      $$('a', c).forEach(function (a) { a.setAttribute('tabindex', '-1'); });
    });
  })();

  /* ── Aktiv sektion i menyn ────────────────────────────────────────────── */
  var navLinks = $$('[data-nav-link]');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);

  var procUpdate = null;
  /* ── Processen ────────────────────────────────────────────────────────
     Ett steg i taget i fokus: det som ligger närmast en tredjedel ner i
     vyn blir aktivt. Ryggraden fylls efter hur långt in i sektionen man
     kommit, så linjen och siffran berättar samma sak. */
  (function process() {
    var list = $('.psteps');
    var steps = $$('[data-step]');
    var count = $('#procCount');
    if (!list || !steps.length) return;

    if (reduce) {
      steps.forEach(function (s) { s.classList.add('is-active'); });
      list.style.setProperty('--pp', '1');
      return;
    }

    procUpdate = function () {
      var mark = innerHeight * 0.36;
      var best = 0, bestDist = Infinity;
      steps.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mark);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      steps.forEach(function (el, i) { el.classList.toggle('is-active', i === best); });
      if (count) count.textContent = ('0' + (best + 1)).slice(-2);

      // Linjen ska gå från första siffrans mitt till den sista — inte från
      // sektionens topp till dess botten, annars är den full innan sista
      // steget ens hunnit bli aktivt.
      var a = steps[0].getBoundingClientRect();
      var z = steps[steps.length - 1].getBoundingClientRect();
      var from = a.top + a.height / 2;
      var to = z.top + z.height / 2;
      var p = to > from ? clamp((mark - from) / (to - from)) : (from < mark ? 1 : 0);
      list.style.setProperty('--pp', p.toFixed(3));
    };
    procUpdate();
  })();

  /* ── En loop för allt scroll-drivet ───────────────────────────────────── */
  var nav = $('#nav'), progress = $('#progress');
  var parallax = $$('[data-parallax]');
  var ticking = false;

  function frame() {
    ticking = false;
    var vh = innerHeight;

    if (procUpdate) procUpdate();

    if (nav) nav.classList.toggle('is-stuck', scrollY > 24);

    if (progress) {
      var h = document.documentElement.scrollHeight - vh;
      progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }

    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    });

    if (!reduce) {
      scrubs.forEach(function (s) {
        var r = s.track.getBoundingClientRect();
        var total = r.height - vh;
        var p = total > 0 ? clamp(-r.top / total) : clamp((vh * 0.72 - r.top) / (vh * 0.5));
        var n = s.words.length;
        var lit = Math.round(clamp(p * 1.2) * n);
        for (var i = 0; i < n; i++) {
          var on = i < lit;
          if (on !== s.words[i].classList.contains('is-lit')) s.words[i].classList.toggle('is-lit', on);
        }

        // Samma förlopp matar panelen bredvid: linjen fylls och punkterna
        // glider in en och en, så de två spalterna hör ihop i stället för
        // att animeras var för sig.
        s.track.style.setProperty('--sp', p.toFixed(3));
        if (s.items.length) {
          var shown = Math.floor(clamp((p - 0.12) / 0.6) * s.items.length + 0.001);
          s.items.forEach(function (li, i) { li.classList.toggle('is-on', i < shown); });
        }
      });
    }

    var active = null;
    sections.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.top <= vh * 0.42 && r.bottom >= vh * 0.42) active = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + active);
    });
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  /* ── Formulär ─────────────────────────────────────────────────────────
     Öppnar e-postklienten med allt ifyllt. Fungerar utan backend och utan
     plugin. Vill du ha riktig serverleverans: skapa en gratis nyckel på
     web3forms.com och POSTa till https://api.web3forms.com/submit i
     stället för raden nedan. */
  (function form() {
    var f = $('#form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f);
      var body =
        (d.get('namn') ? 'Namn: ' + d.get('namn') + '\n' : '') +
        (d.get('epost') ? 'E-post: ' + d.get('epost') + '\n' : '') +
        '\n' + (d.get('meddelande') || '');
      location.href = 'mailto:Calle@blomstrande.net'
        + '?subject=' + encodeURIComponent(d.get('amne') || 'Hej Calle!')
        + '&body=' + encodeURIComponent(body);
      var note = $('#formNote');
      if (note) note.classList.add('is-ok');
    });
  })();

})();
