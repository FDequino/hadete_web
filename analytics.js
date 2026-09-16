/* ============================================================
   HADETÉ — measurement
   ------------------------------------------------------------
   Fill in the IDs below and nothing else. Anything left empty
   simply does not load, so the site stays fast until the
   accounts exist.

     GA4          Google Analytics 4        G-XXXXXXXXXX
     ADS          Google Ads                AW-XXXXXXXXX
     ADS_LABEL    conversion label          AW-XXXXXXXXX/AbCdEfGh
     META         Meta (Facebook) Pixel     123456789012345
     LINKEDIN     LinkedIn Insight Tag      1234567

   What this file does, in order:

   1. Consent Mode v2 — everything starts DENIED. Nothing that
      can identify a visitor runs until they accept. That is the
      requirement for traffic from the EEA and the UK, which is
      where the organic-raisin buyers are.
   2. Click-id capture — gclid, wbraid, gbraid and msclkid, plus
      the UTM set, are kept for 90 days and written into the
      enquiry form as hidden fields. That is what closes the loop
      months later: when a quotation turns into a container, you
      upload that click id as an offline conversion and Google
      Ads learns which keyword paid for it.
   3. Events — "generate_lead" on the form, "contact_whatsapp"
      on the floating button, "contact_email" on a mailto click.
   ============================================================ */

(function () {
  'use strict';

  var CONFIG = {
    GA4: '',
    ADS: '',
    ADS_LABEL: '',
    META: '',
    LINKEDIN: ''
  };

  var STORE = 'hadete-attribution';
  var DAYS = 90;

  /* ── 1. Consent Mode v2 ───────────────────────────────── */

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var consent = null;
  try { consent = localStorage.getItem('hadete-consent'); } catch (e) {}

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  function grantConsent(persist) {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    if (persist) { try { localStorage.setItem('hadete-consent', 'granted'); } catch (e) {} }
    if (window.fbq) window.fbq('consent', 'grant');
  }

  function denyConsent() {
    try { localStorage.setItem('hadete-consent', 'denied'); } catch (e) {}
  }

  if (consent === 'granted') grantConsent(false);

  /* ── 2. Click ids and campaign source ─────────────────── */

  var CLICK_IDS = ['gclid', 'wbraid', 'gbraid', 'msclkid', 'fbclid', 'li_fat_id'];
  var UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  function readStore() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!raw || !raw.t) return null;
      if (Date.now() - raw.t > DAYS * 864e5) return null;
      return raw;
    } catch (e) { return null; }
  }

  function captureAttribution() {
    var q = new URLSearchParams(location.search);
    var found = {};
    CLICK_IDS.concat(UTMS).forEach(function (k) {
      var v = q.get(k);
      if (v) found[k] = v;
    });
    if (!Object.keys(found).length) return readStore();
    found.landing = location.pathname;
    found.referrer = document.referrer || '';
    found.t = Date.now();
    try { localStorage.setItem(STORE, JSON.stringify(found)); } catch (e) {}
    return found;
  }

  var attribution = captureAttribution();

  function stampForm() {
    var form = document.querySelector('form[action*="formsubmit"]');
    if (!form || !attribution) return;
    Object.keys(attribution).forEach(function (k) {
      if (k === 't') return;
      if (form.querySelector('[name="' + k + '"]')) return;
      var i = document.createElement('input');
      i.type = 'hidden';
      i.name = k;
      i.value = attribution[k];
      form.appendChild(i);
    });
  }

  /* ── 3. Tag loading, only after consent ───────────────── */

  var loaded = false;

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
    return s;
  }

  function loadTags() {
    if (loaded) return;
    loaded = true;

    if (CONFIG.GA4 || CONFIG.ADS) {
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + (CONFIG.GA4 || CONFIG.ADS));
      gtag('js', new Date());
      if (CONFIG.GA4) gtag('config', CONFIG.GA4, { send_page_view: true });
      /* enhanced conversions let Google match a lead by hashed email */
      if (CONFIG.ADS) gtag('config', CONFIG.ADS, { allow_enhanced_conversions: true });
    }

    if (CONFIG.META) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', CONFIG.META);
      window.fbq('track', 'PageView');
    }

    if (CONFIG.LINKEDIN) {
      window._linkedin_partner_id = CONFIG.LINKEDIN;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(CONFIG.LINKEDIN);
      loadScript('https://snap.licdn.com/li/li.js');
    }
  }

  /* ── 4. Events ────────────────────────────────────────── */

  function track(name, params) {
    params = params || {};
    if (attribution && attribution.gclid) params.gclid = attribution.gclid;
    if (window.gtag && (CONFIG.GA4 || CONFIG.ADS)) gtag('event', name, params);
    if (CONFIG.ADS && CONFIG.ADS_LABEL && name === 'generate_lead') {
      gtag('event', 'conversion', { send_to: CONFIG.ADS_LABEL });
    }
    if (window.fbq) {
      window.fbq('track', name === 'generate_lead' ? 'Lead' : 'Contact', params);
    }
  }
  window.hadeteTrack = track;

  function wire() {
    stampForm();

    var form = document.querySelector('form[action*="formsubmit"]');
    if (form) {
      form.addEventListener('submit', function () {
        var email = form.querySelector('[name="email"]');
        if (email && email.value && window.gtag && CONFIG.ADS) {
          gtag('set', 'user_data', { email: email.value.trim().toLowerCase() });
        }
        var product = form.querySelector('[name="product"]');
        track('generate_lead', {
          form: 'enquiry',
          product: product ? product.value : '',
          language: document.documentElement.lang
        });
      });
    }

    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target : null;
      if (!t) return;
      if (t.closest('a.wa, a[href*="wa.me"]')) {
        track('contact_whatsapp', { language: document.documentElement.lang });
        return;
      }
      var mail = t.closest('a[href^="mailto:"]');
      if (mail) {
        track('contact_email', { address: mail.getAttribute('href').replace('mailto:', '') });
      }
    }, true);
  }

  /* ── 5. Consent banner ────────────────────────────────── */

  var COPY = {
    en: {
      text: 'We use cookies only to measure how this site is found and whether an enquiry came from an ad. Nothing loads until you decide.',
      ok: 'Accept', no: 'Decline', more: 'Privacy policy'
    },
    es: {
      text: 'Usamos cookies solo para medir cómo se llega a este sitio y si una consulta vino de un anuncio. No se carga nada hasta que decidas.',
      ok: 'Aceptar', no: 'Rechazar', more: 'Política de privacidad'
    }
  };

  function banner() {
    if (consent === 'granted' || consent === 'denied') return;
    if (!CONFIG.GA4 && !CONFIG.ADS && !CONFIG.META && !CONFIG.LINKEDIN) return;

    var c = COPY[document.documentElement.lang === 'es' ? 'es' : 'en'];
    var el = document.createElement('div');
    el.className = 'consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<p>' + c.text + ' <a href="privacidad.html">' + c.more + '</a></p>' +
      '<div class="consent-acts">' +
      '<button type="button" data-consent="no">' + c.no + '</button>' +
      '<button type="button" data-consent="ok">' + c.ok + '</button>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('on'); });

    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (!b) return;
      if (b.dataset.consent === 'ok') { grantConsent(true); loadTags(); }
      else denyConsent();
      el.classList.remove('on');
      setTimeout(function () { el.remove(); }, 300);
    });
  }

  /* ── boot ─────────────────────────────────────────────── */

  function start() {
    wire();
    banner();
    if (consent === 'granted') loadTags();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
