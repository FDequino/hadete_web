(function () {
  'use strict';

  /* ── header state ─────────────────────────────────────── */
  var header = document.getElementById('siteHeader');
  var burger = document.getElementById('burger');

  var alwaysSolid = header.dataset.alwaysSolid === 'true';
  var lastY = window.scrollY, acc = 0, tucked = false;
  function onScroll() {
    var y = Math.max(0, window.scrollY);
    var d = y - lastY;
    /* pages that open on a light background keep the solid header from the
       first pixel, otherwise the white wordmark sits on cream and vanishes */
    if (!alwaysSolid) header.classList.toggle('solid', y > 40);

    if (Math.abs(d) < 3) { lastY = y; return; }
    if ((d > 0) !== (acc > 0)) acc = 0;
    acc += d;

    if (!header.classList.contains('open')) {
      if (y <= 420 && tucked) { tucked = false; header.classList.remove('hidden'); acc = 0; }
      else if (!tucked && acc > 160 && y > 420) { tucked = true; header.classList.add('hidden'); acc = 0; }
      else if (tucked && acc < -110) { tucked = false; header.classList.remove('hidden'); acc = 0; }
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('#primaryNav a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── language ───────────────────────────────────────────
     Each language has its own URL, so switching is a link, not a
     DOM rewrite. English lives at the root, Spanish under /es/. ── */
  var DICT = (window.I18N && window.I18N.DICT) || {};
  var today = new Date().getMonth() + 1;
  var selected = today;

  /* the page is already in its language; this only reaches the few
     strings the calendar builds at runtime */
  function t(key) {
    return (DICT[LANG] && DICT[LANG][key]) || '';
  }
  var IS_ES = document.documentElement.lang === 'es';
  var LANG = IS_ES ? 'es' : 'en';

  (function buildSwitch() {
    var box = document.getElementById('langSwitch');
    if (!box) return;
    var LANGS = (window.I18N && window.I18N.LANGS) || [{ code: 'en', label: 'EN', name: 'English' }];
    var here = location.pathname.split('/').pop() || 'index.html';
    var clean = here === 'index.html' ? '' : here;   // '' → forma de carpeta, sin index.html
    var up = LANG === 'en' ? '' : '../';              // English lives at root, others under /code/
    function hrefFor(code) {
      var sub = code === 'en' ? '' : code + '/';
      return (up + sub + clean) || './';
    }
    var current = LANGS.filter(function (l) { return l.code === LANG; })[0] || LANGS[0];

    var items = LANGS.map(function (l) {
      if (l.code === LANG) {
        return '<span class="on" aria-current="true" hreflang="' + l.code + '">' + l.name + '</span>';
      }
      return '<a role="menuitem" hreflang="' + l.code + '" href="' + hrefFor(l.code) + '">' + l.name + '</a>';
    }).join('');

    box.innerHTML =
      '<button type="button" class="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="Language">' +
        '<span class="lang-cur">' + current.label + '</span>' +
        '<svg class="lang-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">' +
          '<path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="lang-menu" role="menu">' + items + '</div>';

    var btn = box.querySelector('.lang-btn');
    function close() { box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = box.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* ── leaving for the portal: fade out first, no hard flash ── */
  (function () {
    var reduceMo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Array.prototype.slice.call(document.querySelectorAll('a[href^="https://manage.hadete.com"]'))
      .forEach(function (link) {
        link.addEventListener('click', function (e) {
          if (reduceMo || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
          e.preventDefault();
          var url = link.href;
          document.body.classList.add('leaving');
          setTimeout(function () { window.location.href = url; }, 340);
        });
      });
  })();

  /* ── harvest calendar data ────────────────────────────── */
  var CAL = {
    months: {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    },
    short: {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    },
    /* a new language needs its own row labels and month names here too */
    rows: [
      { en: 'Extra virgin olive oil', es: 'Aceite de oliva extra virgen', pick: [4, 6], ship: [6, 11] },
      { en: 'Sun-dried raisins', es: 'Pasas de uva', pick: [2, 4], ship: [4, 9] },
      { en: 'Mung beans', es: 'Poroto mung', pick: [4, 6], ship: [6, 11] }
    ],
    fallback: 'en'
  };

  function calLang() { return CAL.months[LANG] ? LANG : CAL.fallback; }

  var STR = {
    en: {
      picking: 'Picking',
      loading: 'New crop ready to load',
      none: 'No new crop lands this month; we load against what is left of the last harvest.'
    }
  };

  /* ── harvest calendar ─────────────────────────────────── */
  var monthsEl = document.getElementById('calMonths');
  var rowsEl = document.getElementById('calRows');
  var readEl = document.getElementById('calRead');
  var hasCal = !!(monthsEl && rowsEl && readEl);

  function pct(n) { return (n / 12 * 100) + '%'; }

  function buildCal() {
    if (!hasCal) return;
    var cl = calLang();
    var shortNames = CAL.short[cl];

    /* month header */
    monthsEl.innerHTML = '<div class="cal-spacer"></div><div class="strip"></div>';
    var strip = monthsEl.querySelector('.strip');
    shortNames.forEach(function (name, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<b>' + name + '</b><i>' + name.charAt(0) + '</i>';
      b.setAttribute('aria-label', CAL.months[cl][i]);
      if (i + 1 === today) b.classList.add('today');
      b.addEventListener('click', function () { select(i + 1); });
      strip.appendChild(b);
    });

    /* product rows */
    rowsEl.innerHTML = '';
    CAL.rows.forEach(function (row) {
      var r = document.createElement('div');
      r.className = 'cal-row';

      var label = document.createElement('div');
      label.className = 'cal-label';
      label.textContent = row[cl] || row[CAL.fallback];

      var track = document.createElement('div');
      track.className = 'cal-track';

      var cells = document.createElement('div');
      cells.className = 'cal-cells';
      for (var i = 0; i < 12; i++) cells.appendChild(document.createElement('i'));
      track.appendChild(cells);

      track.appendChild(bar('pick', row.pick, shortNames));
      track.appendChild(bar('ship', row.ship, shortNames));

      r.appendChild(label);
      r.appendChild(track);
      rowsEl.appendChild(r);
    });

    select(selected);
  }

  function bar(kind, range, shortNames) {
    var el = document.createElement('div');
    el.className = 'bar ' + kind;
    el.style.left = pct(range[0] - 1);
    el.style.width = pct(range[1] - range[0] + 1);
    var s = document.createElement('span');
    s.textContent = shortNames[range[0] - 1] + '–' + shortNames[range[1] - 1];
    el.appendChild(s);
    return el;
  }

  function inRange(m, r) { return m >= r[0] && m <= r[1]; }

  function select(m) {
    if (!hasCal) return;
    selected = m;

    monthsEl.querySelectorAll('button').forEach(function (b, i) {
      b.classList.toggle('on', i === m - 1);
    });
    rowsEl.querySelectorAll('.cal-cells').forEach(function (cells) {
      cells.querySelectorAll('i').forEach(function (c, i) {
        c.classList.toggle('on', i === m - 1);
      });
    });

    var picking = CAL.rows.filter(function (r) { return inRange(m, r.pick); }).map(function (r) { return (r[calLang()] || r[CAL.fallback]).toLowerCase(); });
    var loading = CAL.rows.filter(function (r) { return inRange(m, r.ship); }).map(function (r) { return (r[calLang()] || r[CAL.fallback]).toLowerCase(); });

    var strings = {
      picking: t('harvest.picking') || STR.en.picking,
      loading: t('harvest.loading') || STR.en.loading,
      none: t('harvest.none') || STR.en.none
    };

    var out = [CAL.months[calLang()][m - 1] + '.'];
    if (picking.length) out.push(strings.picking + ': ' + list(picking) + '.');
    if (loading.length) out.push(strings.loading + ': ' + list(loading) + '.');
    else out.push(strings.none);

    readEl.textContent = out.join(' ');
  }

  function list(items) {
    var and = (DICT[LANG] && DICT[LANG]['list.and']) || ' and ';
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(', ') + and + items[items.length - 1];
  }

  /* ── reveal the calendar once, when it comes into view ── */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var calEl = document.getElementById('cal');
  if (calEl && !reduce && 'IntersectionObserver' in window) {
    calEl.classList.add('reveal');
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { calEl.classList.add('in'); obs.disconnect(); }
      });
    }, { threshold: .3 }).observe(calEl);
  }

  /* ── origin map follows the region you are reading ────── */
  var regions = Array.prototype.slice.call(document.querySelectorAll('.region'));
  var pins = Array.prototype.slice.call(document.querySelectorAll('.geo-map .pin'));

  function lightZone(zone) {
    pins.forEach(function (p) { p.classList.toggle('on', p.dataset.zone === zone); });
    regions.forEach(function (r) { r.classList.toggle('on', r.dataset.zone === zone); });
  }
  if (regions.length) {
    lightZone(regions[0].dataset.zone);
    regions.forEach(function (r) {
      r.addEventListener('mouseenter', function () { lightZone(r.dataset.zone); });
      r.addEventListener('focus', function () { lightZone(r.dataset.zone); });
    });
    if ('IntersectionObserver' in window) {
      var zoneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) lightZone(e.target.dataset.zone);
        });
      }, { rootMargin: '-38% 0px -38% 0px' });
      regions.forEach(function (r) { zoneObserver.observe(r); });
    }
  }

  /* ── the steps light up as you read them ──────────────── */
  var steps = document.querySelector('.steps');
  if (steps) {
    var items = Array.prototype.slice.call(steps.children);
    if (!reduce && 'IntersectionObserver' in window) {
      steps.classList.add('stagger');
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { steps.classList.add('in'); obs.disconnect(); }
        });
      }, { threshold: .25 }).observe(steps);
    }
    if ('IntersectionObserver' in window) {
      var stepObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add('lit');
        });
      }, { rootMargin: '0px 0px -38% 0px' });
      items.forEach(function (li) { stepObserver.observe(li); });
    } else {
      items.forEach(function (li) { li.classList.add('lit'); });
    }
  }

  /* ── the links draw across the world as you scroll ──────
     The dots are real <circle> elements laid along each path.
     Scrolling only flips how many of them are visible, which is
     far cheaper than re-rasterising an SVG mask every frame. ── */
  var world = document.querySelector('.world .world-live');
  if (world) {
    var DOT_GAP = 7;                       /* space between dots, in viewBox units */
    var linkPaths = Array.prototype.slice.call(world.querySelectorAll('.link'));
    var places = {};
    Array.prototype.slice.call(world.querySelectorAll('.place')).forEach(function (g) {
      places[g.dataset.place] = g;
    });

    function dotify(path, r) {
      var len = path.getTotalLength();
      var n = Math.max(2, Math.round(len / DOT_GAP));
      var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'linkdots');
      var dots = [];
      for (var i = 0; i <= n; i++) {
        var pt = path.getPointAtLength(len * i / n);
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', pt.x.toFixed(1));
        c.setAttribute('cy', pt.y.toFixed(1));
        c.setAttribute('r', r);
        group.appendChild(c);
        dots.push(c);
      }
      path.parentNode.insertBefore(group, path);
      path.remove();
      return { dots: dots, shown: -1 };
    }

    /* every route on the map is the same thing: a chain of dots that
       fills in as you scroll. The three contact routes go first, the
       market routes follow, but they are built and drawn identically. */
    var chains = linkPaths.map(function (path) { return dotify(path, 1.15); });
    Array.prototype.slice.call(world.querySelectorAll('.mlink')).forEach(function (path) {
      chains.push(dotify(path, 1.15));
    });

    var order = ['mvd', 'mia', 'kul'];
    var track = document.querySelector('.world-track');
    var worldOn = true;
    /* on phones the map is static: no scroll-jacking, everything drawn at once */
    var worldStatic = window.matchMedia('(max-width:860px)').matches;

    function drawLinks() {
      var b = track.getBoundingClientRect();
      var vh = window.innerHeight;
      var travel = b.height - vh * 0.85;
      var p = travel > 0 ? (vh * 0.15 - b.top) / travel : 0;
      p = Math.max(0, Math.min(1, p));

      chains.forEach(function (ch, i) {
        /* the three contact routes lead, the nine markets follow close behind */
        var from = i < 3 ? i * 0.10 : 0.30 + (i - 3) * 0.042;
        var k = Math.max(0, Math.min(1, (p - from) / 0.36));
        var want = Math.round(k * ch.dots.length);
        if (want !== ch.shown) {                       /* only touch what changed */
          var lo = Math.min(want, ch.shown < 0 ? 0 : ch.shown);
          var hi = Math.max(want, ch.shown < 0 ? ch.dots.length : ch.shown);
          for (var j = lo; j < hi; j++) {
            ch.dots[j].style.opacity = j < want ? 1 : 0;
          }
          ch.shown = want;
        }
        var g = places[order[i]];
        if (g) g.classList.toggle('lit', k > 0.9);
      });

      world.parentNode.classList.toggle('markets-in', p > 0.3);
    }

    /* the handler only runs while the map is anywhere near the screen */
    if (!worldStatic && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        worldOn = entries[0].isIntersecting;
        if (worldOn) drawLinks();
      }, { rootMargin: '200px 0px 200px 0px' }).observe(track);
    }

    /* ── hovering a destination tells you what moves there ── */
    var tip = document.getElementById('mapTip');
    var wrap = world.parentNode;
    if (tip) {
      function notes() {
        return (window.I18N && window.I18N[IS_ES ? 'MAPNOTES_ES' : 'MAPNOTES_EN']) || {};
      }
      function showTip(node) {
        var key = node.dataset.place || node.dataset.market;
        var info = notes()[key];
        if (!info) return;
        tip.innerHTML = '<b></b><span></span>';
        tip.querySelector('b').textContent = info[0];
        tip.querySelector('span').textContent = info[1];

        var c = node.querySelector('circle');
        var box = world.getBoundingClientRect();
        var pt = c.getBoundingClientRect();
        var x = pt.left - box.left + pt.width / 2;
        var y = pt.top - box.top;
        tip.style.left = Math.min(Math.max(x + 14, 8), box.width - 262) + 'px';
        tip.style.top = Math.max(y - 12, 8) + 'px';
        tip.classList.add('on');
      }
      function hideTip() { tip.classList.remove('on'); }

      Array.prototype.slice.call(world.querySelectorAll('.place, .mnode')).forEach(function (g) {
        g.addEventListener('mouseenter', function () { showTip(g); });
        g.addEventListener('mouseleave', hideTip);
      });
      wrap.addEventListener('mouseleave', hideTip);
    }

    if (worldStatic) {
      /* draw every route and light every contact at once, no scroll needed */
      chains.forEach(function (ch) {
        ch.dots.forEach(function (d) { d.style.opacity = 1; });
        ch.shown = ch.dots.length;
      });
      world.parentNode.classList.add('markets-in');
      order.forEach(function (k) { if (places[k]) places[k].classList.add('lit'); });
    } else {
      var wTicking = false;
      window.addEventListener('scroll', function () {
        if (!worldOn || wTicking) return;
        wTicking = true;
        requestAnimationFrame(function () { drawLinks(); wTicking = false; });
      }, { passive: true });
      window.addEventListener('resize', drawLinks);
      drawLinks();
    }
  }

  /* ── products come in once, quietly ───────────────────── */
  var prods = Array.prototype.slice.call(document.querySelectorAll('.prod'));
  if (prods.length && !reduce && 'IntersectionObserver' in window) {
    prods.forEach(function (el) { el.classList.add('reveal'); });
    var prodObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); prodObs.unobserve(e.target); }
      });
    }, { threshold: .12 });
    prods.forEach(function (el) { prodObs.observe(el); });
  }

  /* ── which section you are in ─────────────────────────── */
  /* links read index.html#products, not #products, so match on the hash */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#primaryNav a[href*="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').split('#')[1];
      if (id) byId[id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('current'); });
        var a = byId[e.target.id];
        if (a) a.classList.add('current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }


  /* ── WhatsApp composer ─────────────────────────────────
     The bubble used to jump straight to WhatsApp with a fixed string.
     Now it opens a small composer: the visitor sees the draft, can edit
     it, and only then leaves the site. Fewer empty chats, better first
     messages, and the send still counts as a conversion. ── */
  (function () {
    var bubble = document.querySelector('a.wa');
    var panel = document.getElementById('waPanel');
    if (!bubble || !panel) return;

    var NUMBER = '5493515637679';
    var text = document.getElementById('waText');
    var send = document.getElementById('waSend');
    var close = document.getElementById('waClose');

    var DRAFT_EN = 'Hello Hadeté, I am writing from your website. I am interested in:\n\n' +
                   '· Product:\n· Volume:\n· Destination port:\n\nThank you.';

    function draft() {
      var d = window.I18N && window.I18N.DICT &&
              window.I18N.DICT[document.documentElement.lang];
      return (d && d['wa.draft']) || DRAFT_EN;
    }

    function open_() {
      if (!text.value.trim()) text.value = draft();
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('open'); });
      bubble.setAttribute('aria-expanded', 'true');
      setTimeout(function () { text.focus(); text.setSelectionRange(text.value.length, text.value.length); }, 120);
    }
    function close_() {
      panel.classList.remove('open');
      bubble.setAttribute('aria-expanded', 'false');
      setTimeout(function () { panel.hidden = true; }, 220);
    }

    bubble.setAttribute('aria-expanded', 'false');
    bubble.addEventListener('click', function (e) {
      e.preventDefault();                      /* the href stays as the no-JS fallback */
      if (panel.hidden) open_(); else close_();
    });
    close.addEventListener('click', close_);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close_();
    });

    send.addEventListener('click', function () {
      var body = text.value.trim() || draft();
      if (window.hadeteTrack) window.hadeteTrack('contact_whatsapp', { channel: 'whatsapp' });
      window.open('https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
      close_();
    });
  })();

  /* ── boot ─────────────────────────────────────────────── */
  if (hasCal) buildCal();

  /* first visit only: send a Spanish-speaking browser to /es/ once */
  (function suggestLang() {
    if (IS_ES) return;
    var seen = null;
    try { seen = sessionStorage.getItem('hadete-lang-seen'); } catch (e) {}
    if (seen) return;
    try { sessionStorage.setItem('hadete-lang-seen', '1'); } catch (e) {}
    if ((navigator.language || '').slice(0, 2).toLowerCase() !== 'es') return;
    if (document.referrer && document.referrer.indexOf(location.host) > -1) return;
    var here = location.pathname.split('/').pop() || 'index.html';
    var clean = here === 'index.html' ? '' : here;
    location.replace('es/' + clean + location.search + location.hash);
  })();
})();
