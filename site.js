/* Amberwick — page behaviour: sticky header shadow, active section in the menu,
   mobile menu, scroll reveal, and the enquiry form. No dependencies. */
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Header shadow once the page has scrolled */
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.getElementById('menu-toggle');
  var drawer = document.getElementById('menu-drawer');

  function setMenu(open) {
    if (!toggle || !drawer) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    var wide = window.matchMedia('(min-width: 901px)');
    var closeOnWide = function () { if (wide.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', closeOnWide);
    else wide.addListener(closeOnWide);
  }

  /* Anchor links: keep the URL hash in sync without a jump; CSS handles smooth scroll
     and the 72px offset (scroll-margin-top), and respects prefers-reduced-motion. */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? document.getElementById('top') : document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      var top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* Scroll reveal, one-shot */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Active section in the wide menu */
  var navLinks = document.querySelectorAll('.nav-wide a[data-nav]');
  var sections = ['approach', 'services', 'year', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && navLinks.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.dataset.nav === e.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* Enquiry form */
  var form = document.getElementById('enquiry');
  if (!form) return;

  var endpoint = (form.getAttribute('data-endpoint') || '').trim();
  var mailto = (form.getAttribute('data-mailto') || '').trim();
  var sent = form.querySelector('.enquiry-sent');
  var fail = form.querySelector('.enquiry-fail');
  var submitBtn = form.querySelector('.btn-submit');

  function fieldOf(input) { return input.closest('.field'); }

  function setError(input, message) {
    var field = fieldOf(input);
    var err = field && field.querySelector('.field-error');
    if (!field) return;
    field.classList.toggle('invalid', !!message);
    if (err) err.textContent = message || '';
  }

  ['name', 'email'].forEach(function (n) {
    var input = form.elements[n];
    if (input) input.addEventListener('input', function () { setError(input, ''); });
  });

  function validate() {
    var name = form.elements.name;
    var email = form.elements.email;
    var ok = true;

    if (!name.value.trim()) {
      setError(name, 'Please tell us your name.');
      if (ok) name.focus();
      ok = false;
    }
    if (!email.value.trim() || email.value.indexOf('@') < 0) {
      setError(email, 'Please enter an email address we can reply to.');
      if (ok) email.focus();
      ok = false;
    }
    return ok;
  }

  function showSent() {
    form.classList.add('done');
    if (sent) {
      sent.hidden = false;
      sent.setAttribute('tabindex', '-1');
      sent.focus({ preventScroll: true });
    }
  }

  function showFail() {
    if (fail) fail.hidden = false;
    if (submitBtn) submitBtn.disabled = false;
  }

  function sendByMail() {
    var v = function (n) { return (form.elements[n] && form.elements[n].value.trim()) || ''; };
    var lines = [
      'Name: ' + v('name'),
      'Email: ' + v('email'),
      'Building or address: ' + (v('building') || '—'),
      '',
      v('message')
    ];
    var subject = 'Enquiry' + (v('building') ? ' · ' + v('building') : '');
    var href = 'mailto:' + mailto +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
    showSent();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (fail) fail.hidden = true;
    if (form.elements._gotcha && form.elements._gotcha.value) { showSent(); return; }
    if (!validate()) return;

    if (!endpoint) {
      if (mailto) sendByMail(); else showSent();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    var data = new FormData(form);
    data.delete('_gotcha');

    fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      showSent();
    }).catch(function () {
      showFail();
    });
  });
})();
