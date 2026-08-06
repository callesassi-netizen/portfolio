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

  /* ── Hero-sekvens ─────────────────────────────────────────────────────
     Fotot forvandlas till en blomma i takt med scrollen. Det ar inte en video
     som spelas — webblasare ar opalitliga pa att soka i video bildruta for
     bildruta, sarskilt bakat. I stallet ligger 121 stillbilder och
     scrollpositionen valjer vilken som ritas.

     Bildruta 1 ar identisk med stillbilden under, sa inbytet syns inte.
     Sekvensen hamtas forst efter att sidan i ovrigt ar klar, och bara pa
     breda skarmar utan reducerad rorelse — pa mobil visas bara fotot.

     VIKTIGT: canvasen far tandas forst nar en bildruta verkligen ar ritad.
     Raknas laddade och misslyckade hamtningar i samma hog blir en tom svart
     canvas liggande over fotot sa fort mappen saknas. */
  (function heroSeq() {
    var cv = $('#heroSeq'), track = $('#heroTrack'), stage = $('#heroStage');
    var hero = $('#hero');
    if (!cv || !track || !stage || !hero) return;

    var conn = navigator.connection || {};
    if (reduce || innerWidth < 1000 || conn.saveData ||
        /2g|slow-2g/.test(conn.effectiveType || '')) { cv.remove(); return; }

    var N = 121, POS_X = 0.90, POS_Y = 0.5;
    /* Blommans tyngdpunkt i kallbilden, matt pa de sista bildrutorna.
       Den star still dar genom hela slutet, sa en konstant racker. */
    var SRC_W = 1280, SRC_H = 720, BLOM_X = 0.725, BLOM_Y = 0.445;
    /* Forloppet ligger sent med flit: texten ska finnas kvar anda tills
       hero borjar slappa och nasta sektion kommer underifran. */
    var SUG_START = 0.74, SUG_SLUT = 1.0, SUG_STEG = 0.04;
    /* Suget raknar pa en langre stracka an bildsekvensen: den fortsatter en
       halv skarmhojd efter att hero slutat vara fastnalad. Da hinner texten
       vara kvar genom hela forvandlingen och sugs in forst nar sektionen
       borjar lamna och nasta kommer underifran. */
    var SUG_EXTRA = 0.5;
    var BOKST_SPRID = 0.42;   // hur mycket bokstaverna sprids i tid
    var BOKST_DRAG = 6.4;     // hur langt de dras ut pa vagen in
    var pad = function (n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; };

    var bilder = new Array(N), duger = new Array(N);
    var laddade = 0, trasiga = 0, igang = false, dod = false;
    var ctx = cv.getContext('2d', { alpha: false });
    var cw = 0, ch = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    var visad = -1, onskad = 0;

    /* Ingen sekvens gick att hamta — lamna sidan precis som den var. */
    function avbryt() {
      if (dod) return;
      dod = true;
      root.classList.remove('heroseq');
      hero.style.removeProperty('--hp');
      if (cv.parentNode) cv.parentNode.removeChild(cv);
    }

    function matt() {
      var r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (w === cw && h === ch) return true;
      cw = cv.width = w; ch = cv.height = h;
      visad = -1;
      return true;
    }

    /* Samma beskarning som object-fit:cover med object-position 90% 50% —
       raknad har i stallet for i CSS, sa den beter sig likadant overallt. */
    function rita(i) {
      if (dod || !duger[i]) return false;
      var im = bilder[i];
      if (!im || !im.naturalWidth) return false;
      if (!matt()) return false;
      var iw = im.naturalWidth, ih = im.naturalHeight;
      var skala = Math.max(cw / iw, ch / ih);
      var sw = cw / skala, sh = ch / skala;
      ctx.drawImage(im, (iw - sw) * POS_X, (ih - sh) * POS_Y, sw, sh, 0, 0, cw, ch);
      visad = i;
      if (!cv.classList.contains('is-on')) cv.classList.add('is-on');
      return true;
    }

    function narmaste(i) {
      if (duger[i]) return i;
      for (var d = 1; d < N; d++) {
        if (i - d >= 0 && duger[i - d]) return i - d;
        if (i + d < N && duger[i + d]) return i + d;
      }
      return -1;
    }

    /* ── Texten sugs in i blomman ────────────────────────────────────
       Blommans plats pa skarmen raknas med samma cover-matte som canvasen
       ritar med, sa riktningen stammer i alla fonsterformat. Elementens
       utgangslagen lases av med offsetLeft/offsetTop, som ar layoutvarden
       och alltsa oberoende av de transformer vi sjalva satter. */
    var inn = $('.hero__in', stage);
    var barn = inn ? $$(':scope > *', inn) : [];
    var bas = [], sugAktiv = false;
    var h1 = $('.hero__h1', stage);
    var tecken = [], teckenBas = [];

    /* Rubriken delas i bokstaver sa de kan dras ut var for sig. Elementbarn
       (den korallfargade punkten) lamnas hela — bara textnoder delas. */
    function delaTecken() {
      if (!h1) return;
      tecken = []; teckenBas = [];
      $$('.line > span', h1).forEach(function (rad) {
        if (rad.dataset.delad === '1') return;
        var noder = Array.prototype.slice.call(rad.childNodes);
        rad.textContent = '';
        noder.forEach(function (n) {
          if (n.nodeType === 3) {
            n.nodeValue.split('').forEach(function (c) {
              /* span, inte i — <i> ar kursivt som standard och lutade hela
                 rubriken. */
              var i = document.createElement('span');
              i.className = 'ch';
              if (c === ' ') { i.className = 'ch ch--mellan'; i.innerHTML = '&nbsp;'; }
              else i.textContent = c;
              rad.appendChild(i);
            });
          } else {
            var w = document.createElement('span');
            w.className = 'ch';
            w.appendChild(n);
            rad.appendChild(w);
          }
        });
        rad.dataset.delad = '1';
      });
      tecken = $$('.ch', h1);
    }

    var teckenRank = [];
    function matTecken() {
      if (!inn) return;
      teckenBas = tecken.map(function (el) {
        return {
          x: inn.offsetLeft + el.offsetLeft + el.offsetWidth / 2,
          y: inn.offsetTop + el.offsetTop + el.offsetHeight / 2
        };
      });
      /* Rangordna efter avstand till blomman: narmast ger sig ivag forst. */
      var b = blompunkt() || { x: 0, y: 0 };
      var ordn = teckenBas.map(function (p, i) {
        return { i: i, d: Math.hypot(b.x - p.x, b.y - p.y) };
      }).sort(function (a2, b2) { return a2.d - b2.d; });
      teckenRank = new Array(teckenBas.length);
      ordn.forEach(function (o, r) {
        teckenRank[o.i] = ordn.length > 1 ? r / (ordn.length - 1) : 0;
      });
    }

    function matBas() {
      if (!inn) return;
      matTecken();
      bas = barn.map(function (el) {
        return {
          x: inn.offsetLeft + el.offsetLeft + el.offsetWidth / 2,
          y: inn.offsetTop + el.offsetTop + el.offsetHeight / 2
        };
      });
    }

    function blompunkt() {
      var w = cv.offsetWidth, h = cv.offsetHeight;
      if (!w || !h) return null;
      var s = Math.max(w / SRC_W, h / SRC_H);
      var sw = w / s, sh = h / s;
      var ox = (SRC_W - sw) * POS_X, oy = (SRC_H - sh) * POS_Y;
      var x = (BLOM_X * SRC_W - ox) * s;
      var y = (BLOM_Y * SRC_H - oy) * s;
      /* canvasen ar dessutom uppskalad 1.065 kring sin egen mitt */
      return { x: w / 2 + (x - w / 2) * 1.065, y: h / 2 + (y - h / 2) * 1.065 };
    }

    function sug(p) {
      if (!inn || !barn.length) return;
      var t = clamp((p - SUG_START) / (SUG_SLUT - SUG_START));
      if (t <= 0 && !sugAktiv) return;
      if (!bas.length) matBas();
      var b = blompunkt();
      if (!b) return;

      if (t > 0 && !sugAktiv) { sugAktiv = true; inn.classList.add('is-suck'); }
      if (t <= 0 && sugAktiv) { sugAktiv = false; inn.classList.remove('is-suck'); }

      var fonster = 1 - SUG_STEG * (barn.length - 1);
      barn.forEach(function (el, i) {
        if (el === h1) return;                 // rubriken hanteras bokstav for bokstav
        var ti = clamp((t - SUG_STEG * i) / fonster);
        if (ti <= 0) { el.style.transform = ''; el.style.opacity = ''; el.style.filter = ''; return; }
        var e = ti * ti * (3 - 2 * ti) * ti;   // mjuk start, drar ivag pa slutet
        el.style.transform = 'translate(' + ((b.x - bas[i].x) * e).toFixed(1) + 'px,' +
                             ((b.y - bas[i].y) * e).toFixed(1) + 'px) scale(' + (1 - 0.82 * e).toFixed(3) + ')';
        el.style.opacity = (1 - e).toFixed(3);
        el.style.filter = e > 0.05 ? 'blur(' + (e * 3.5).toFixed(1) + 'px)' : '';
      });

      /* Bokstaverna: de som star narmast blomman ger sig ivag forst, sa ordet
         tojs ut mot den i stallet for att flyttas i klump. Uttojningen sker
         langs fardriktningen — rotera dit, skala i x, rotera tillbaka — och
         den vaxer pa vagen for att sedan klappa ihop nar bokstaven ar framme. */
      if (tecken.length && teckenBas.length === tecken.length) {
        var fonsterB = 1 - BOKST_SPRID;
        for (var k = 0; k < tecken.length; k++) {
          var el2 = tecken[k], bb = teckenBas[k];
          var ddx = b.x - bb.x, ddy = b.y - bb.y;
          var avst = Math.sqrt(ddx * ddx + ddy * ddy);
          var rank = teckenRank[k];
          var tk = clamp((t - BOKST_SPRID * rank) / fonsterB);
          if (tk <= 0) { el2.style.transform = ''; el2.style.opacity = ''; continue; }
          var ek = tk * tk * (3 - 2 * tk) * tk;
          var drag = 1 + BOKST_DRAG * ek * (1 - ek);      // toppar mitt i farden
          var vinkel = Math.atan2(ddy, ddx) * 180 / Math.PI;
          var kryp = 1 - 0.9 * ek;
          el2.style.transform =
            'translate(' + (ddx * ek).toFixed(1) + 'px,' + (ddy * ek).toFixed(1) + 'px)' +
            ' rotate(' + vinkel.toFixed(1) + 'deg)' +
            ' scale(' + (kryp * drag).toFixed(3) + ',' + (kryp / Math.sqrt(drag)).toFixed(3) + ')' +
            ' rotate(' + (-vinkel).toFixed(1) + 'deg)';
          el2.style.opacity = (1 - ek * ek).toFixed(3);
          if (avst < 0) el2.style.opacity = 0;
        }
      }

      inn.style.pointerEvents = t > 0.45 ? 'none' : '';
    }

    function progress() {
      var stracka = track.offsetHeight - stage.offsetHeight;
      if (stracka <= 0) return 0;
      return clamp(-track.getBoundingClientRect().top / stracka);
    }

    function progressSug() {
      var tot = track.offsetHeight - stage.offsetHeight + stage.offsetHeight * SUG_EXTRA;
      if (tot <= 0) return 0;
      return clamp(-track.getBoundingClientRect().top / tot);
    }

    var kor = false;
    function tick() {
      kor = false;
      if (dod) return;
      var p = progress();
      hero.style.setProperty('--hp', p.toFixed(4));
      sug(progressSug());
      onskad = Math.round(p * (N - 1));
      if (!igang) return;
      var i = narmaste(onskad);
      if (i >= 0 && i !== visad) rita(i);
    }
    function begar() { if (!kor && !dod) { kor = true; requestAnimationFrame(tick); } }

    function hamta(i, sedan) {
      if (dod || bilder[i]) { if (sedan) sedan(); return; }
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () {
        duger[i] = true; laddade++;
        /* Tracken blir hog forst nar det finns nagot att visa i den. */
        if (!igang && laddade >= 6) { igang = true; root.classList.add('heroseq'); }
        begar();
        if (sedan) sedan();
      };
      im.onerror = function () {
        trasiga++;
        if (laddade === 0 && trasiga >= 5) { avbryt(); return; }
        if (sedan) sedan();
      };
      bilder[i] = im;
      im.src = 'assets/hero-seq/' + pad(i + 1) + '.webp';
    }

    /* Tva svep: forst var femte bildruta sa hela forloppet gar att scrolla
       igenom nastan direkt, sedan resten som fyller igen luckorna. */
    function svep() {
      var grovt = [], rest = [], i;
      for (i = 0; i < N; i++) (i % 5 === 0 ? grovt : rest).push(i);
      var k = 0;
      (function nasta() {
        if (dod) return;
        if (k < grovt.length) return hamta(grovt[k++], nasta);
        var j = 0;
        (function fyll() {
          if (dod || j >= rest.length) return;
          var tre = 0;
          while (tre < 3 && j < rest.length) { hamta(rest[j++]); tre++; }
          setTimeout(fyll, 60);
        })();
      })();
    }

    delaTecken();
    matBas();
    /* Sprakbytet skriver om rubriken, sa bokstaverna maste delas pa nytt.
       Handelsen skickas pa document och bubblar inte — den maste lyssnas
       av dar, inte pa window. */
    document.addEventListener('bl:lang', function () {
      if (!h1) return;
      $$('.line > span', h1).forEach(function (r) { delete r.dataset.delad; });
      delaTecken(); bas = []; matBas(); visad = -1; begar();
    });

    if (document.readyState === 'complete') setTimeout(svep, 350);
    else addEventListener('load', function () { setTimeout(svep, 350); });

    addEventListener('scroll', begar, { passive: true });
    addEventListener('resize', function () { visad = -1; bas = []; begar(); }, { passive: true });
  })();

  /* ── Kameradrift i hero ───────────────────────────────────────────────
     Fotot föreställer ett skrivbord med en lampa. En lysande cirkel som
     följer pekaren blir en andra lampa, och den läser som en effekt.
     I stället får bilden röra sig — några pixlar bort från pekaren, mjukt
     eftersläpande, som att luta på huvudet i ett rum. Man ser den inte.
     Man känner djupet. */
  (function heroDrift() {
    var hero = $('[data-spotlight]');
    if (!hero || !fine || reduce) return;
    var media = $('.hero__media', hero);
    if (!media) return;

    var AMP_X = 16, AMP_Y = 10;
    var tx = 0, ty = 0, cx = 0, cy = 0, aktiv = false;

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -AMP_X;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -AMP_Y;
      aktiv = true;
    }, { passive: true });

    hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; });

    (function ride() {
      if (aktiv || Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
        cx = lerp(cx, tx, 0.05);
        cy = lerp(cy, ty, 0.05);
        media.style.setProperty('--hx', cx.toFixed(2) + 'px');
        media.style.setProperty('--hy', cy.toFixed(2) + 'px');
      }
      requestAnimationFrame(ride);
    })();
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

    /* Navigeringens ljusa lage horde ihop med att hero var en skarmhog.
       Nu ar hero en scrollsträcka, sa den far byta forst nar hero slappt —
       en gradd bar over det morka fotot ser ut som ett fel. */
    if (nav) {
      var slapp = 24;
      var hs = document.getElementById('heroStage');
      if (hs && root.classList.contains('heroseq')) {
        var hr = hs.getBoundingClientRect();
        slapp = scrollY + hr.bottom - nav.offsetHeight;
      }
      nav.classList.toggle('is-stuck', scrollY > slapp);
    }

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
