/* ============================================================================
   THE DARK TIDES — behaviour
   Small, dependency-free modules. Each one is self-contained and bails out
   quietly if its markup is not on the page.

   01  Helpers
   02  Atmosphere particles
   03  Community member counter  (public API for a live count later)
   04  Scroll reveal
   05  FAQ accordion
   06  Navigation
   ========================================================================= */
(function () {
  'use strict';

  /* ==========================================================
     01 — HELPERS
     ========================================================== */

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return motionQuery.matches;
  }

  function onReducedMotionChange(handler) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handler);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handler);
    }
  }

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  /* ==========================================================
     02 — ATMOSPHERE PARTICLES
     Tiny motes drifting upward, like sediment in deep water.
     Count stays low on purpose — atmosphere, not confetti.
     ========================================================== */

  var Particles = {
    host: null,

    init: function () {
      this.host = $('[data-particles]');
      if (!this.host) return;

      this.render();
      onReducedMotionChange(this.render.bind(this));
    },

    render: function () {
      this.host.innerHTML = '';
      if (prefersReducedMotion()) return;

      var count = window.innerWidth < 720 ? 12 : 22;

      for (var i = 0; i < count; i++) {
        var mote = document.createElement('span');
        var size = random(1.2, 3.2);

        mote.style.left = random(0, 100) + '%';
        mote.style.setProperty('--size', size.toFixed(2) + 'px');
        mote.style.setProperty('--dur', random(26, 58).toFixed(1) + 's');
        mote.style.setProperty('--delay', (-random(0, 50)).toFixed(1) + 's');
        mote.style.setProperty('--drift', random(-70, 70).toFixed(0) + 'px');
        mote.style.setProperty('--peak', random(0.18, 0.55).toFixed(2));

        this.host.appendChild(mote);
      }
    }
  };

  /* ==========================================================
     03 — COMMUNITY MEMBER COUNTER
     Counts 0 -> target on load with an easing curve.

     Swapping in a live Discord member count later needs no
     redesign — just call:

       DarkTides.setMemberCount(12345);

     from wherever the API response arrives. The element keeps
     its formatting, suffix and animation behaviour.
     ========================================================== */

  var Counter = {
    root: null,
    numberEl: null,
    suffixEl: null,
    target: 0,
    suffix: '',
    duration: 2600,
    frame: null,

    init: function () {
      this.root = $('[data-counter]');
      if (!this.root) return;

      this.numberEl = $('[data-counter-number]', this.root);
      this.suffixEl = $('[data-counter-suffix]', this.root);
      this.target = parseInt(this.root.getAttribute('data-count-to'), 10) || 0;
      this.suffix = this.root.getAttribute('data-count-suffix') || '';
      this.duration = parseInt(this.root.getAttribute('data-count-duration'), 10) || 2600;

      // The full value is announced once, not on every tick.
      this.root.setAttribute('aria-label', this.format(this.target) + this.suffix);
      if (this.numberEl) this.numberEl.setAttribute('aria-hidden', 'true');
      if (this.suffixEl) this.suffixEl.setAttribute('aria-hidden', 'true');

      this.run(this.target);
    },

    format: function (value) {
      return value.toLocaleString('en-US');
    },

    // easeOutExpo — fast start, long elegant settle
    ease: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },

    paint: function (value, done) {
      if (this.numberEl) this.numberEl.textContent = this.format(value);
      if (this.suffixEl) this.suffixEl.textContent = done ? this.suffix : '';
    },

    run: function (target) {
      var self = this;
      this.target = target;
      this.root.setAttribute('aria-label', this.format(target) + this.suffix);

      if (this.frame) cancelAnimationFrame(this.frame);

      // Reduced motion: land on the final value straight away.
      if (prefersReducedMotion()) {
        this.paint(target, true);
        return;
      }

      var start = null;
      var duration = this.duration;

      function step(now) {
        if (start === null) start = now;

        var progress = Math.min((now - start) / duration, 1);
        var value = Math.round(self.ease(progress) * target);

        self.paint(value, progress === 1);

        if (progress < 1) {
          self.frame = requestAnimationFrame(step);
        } else {
          self.frame = null;
        }
      }

      this.paint(0, false);
      this.frame = requestAnimationFrame(step);
    },

    // public entry point for a live member count
    setValue: function (value) {
      if (!this.root || typeof value !== 'number' || !isFinite(value)) return;
      this.run(Math.max(0, Math.round(value)));
    }
  };

  /* ==========================================================
     04 — SCROLL REVEAL
     Elements fade up as they enter the viewport. Siblings in the
     same grid are staggered so a row arrives like a small swell.
     ========================================================== */

  var Reveal = {
    init: function () {
      var items = $$('.reveal');
      if (!items.length) return;

      if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      // stagger by position among reveal siblings
      items.forEach(function (el) {
        var siblings = $$('.reveal', el.parentElement).filter(function (node) {
          return node.parentElement === el.parentElement;
        });
        var index = siblings.indexOf(el);
        if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 5) * 90 + 'ms');
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08
      });

      items.forEach(function (el) { observer.observe(el); });
    }
  };

  /* ==========================================================
     05 — FAQ ACCORDION
     Height is animated explicitly so the panel can start from
     `hidden` (which keeps it out of the a11y tree when closed).
     ========================================================== */

  var Faq = {
    init: function () {
      var root = $('[data-faq]');
      if (!root) return;

      var self = this;

      $$('.faq__trigger', root).forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          var expanded = trigger.getAttribute('aria-expanded') === 'true';
          if (expanded) self.close(trigger);
          else self.open(trigger);
        });
      });
    },

    panelOf: function (trigger) {
      return document.getElementById(trigger.getAttribute('aria-controls'));
    },

    /* Drop any settle callback still pending from an earlier toggle.
       Without this, spamming a question lets a stale "close" handler fire
       after a new "open" and hide a panel that is meant to be visible. */
    clearPending: function (panel) {
      if (panel._dtEnd) {
        panel.removeEventListener('transitionend', panel._dtEnd);
        panel._dtEnd = null;
      }
      if (panel._dtTimer) {
        clearTimeout(panel._dtTimer);
        panel._dtTimer = null;
      }
    },

    /* Settle once the height transition finishes. transitionend alone is not
       dependable — it never fires for a zero-length change, and a throttled
       or backgrounded tab can drop it entirely — so a timer backs it up and
       whichever arrives first wins. */
    afterHeight: function (panel, done) {
      var settle = function () {
        Faq.clearPending(panel);
        done();
      };

      panel._dtEnd = function (event) {
        if (event.propertyName !== 'height') return;
        settle();
      };
      panel.addEventListener('transitionend', panel._dtEnd);

      var ms = (parseFloat(getComputedStyle(panel).transitionDuration) || 0) * 1000;
      panel._dtTimer = setTimeout(settle, ms + 90);
    },

    open: function (trigger) {
      var panel = this.panelOf(trigger);
      if (!panel) return;

      var item = trigger.closest('.faq__item');
      trigger.setAttribute('aria-expanded', 'true');
      if (item) item.classList.add('is-open');

      this.clearPending(panel);

      // A closed panel has no laid-out height, so the animation has to start
      // from zero; an interrupted close continues from wherever it got to.
      var wasClosed = panel.hidden;
      panel.hidden = false;

      if (prefersReducedMotion()) {
        panel.style.height = 'auto';
        return;
      }

      var from = wasClosed ? 0 : panel.offsetHeight;
      var to = panel.scrollHeight;

      panel.style.height = from + 'px';
      void panel.offsetHeight; // force a reflow to lock in the start value

      if (from === to) {
        panel.style.height = 'auto';
        return;
      }

      panel.style.height = to + 'px';
      this.afterHeight(panel, function () { panel.style.height = 'auto'; });
    },

    close: function (trigger) {
      var panel = this.panelOf(trigger);
      if (!panel) return;

      var item = trigger.closest('.faq__item');
      trigger.setAttribute('aria-expanded', 'false');
      if (item) item.classList.remove('is-open');

      this.clearPending(panel);

      if (prefersReducedMotion()) {
        panel.style.height = '';
        panel.hidden = true;
        return;
      }

      var from = panel.offsetHeight;

      if (from === 0) {
        panel.hidden = true;
        panel.style.height = '';
        return;
      }

      panel.style.height = from + 'px';
      void panel.offsetHeight;
      panel.style.height = '0px';

      this.afterHeight(panel, function () {
        panel.hidden = true;
        panel.style.height = '';
      });
    }
  };

  /* ==========================================================
     06 — NAVIGATION
     Floating glass bar: scrolled state, mobile menu, and the
     active-section indicator.
     ========================================================== */

  var Nav = {
    header: null,
    toggle: null,
    menu: null,
    scrim: null,
    links: [],
    sections: [],
    ticking: false,

    init: function () {
      this.header = $('[data-header]');
      this.toggle = $('[data-nav-toggle]');
      this.menu = $('[data-nav-menu]');
      this.scrim = $('[data-nav-scrim]');
      if (!this.header) return;

      this.links = $$('.nav__link', this.header);
      this.sections = this.links
        .map(function (link) {
          var id = link.getAttribute('href');
          return id && id.charAt(0) === '#' ? document.getElementById(id.slice(1)) : null;
        })
        .filter(Boolean);

      this.bindMenu();
      this.bindScroll();
      this.update();
    },

    /* ---- mobile menu ---- */

    isOpen: function () {
      return this.toggle && this.toggle.getAttribute('aria-expanded') === 'true';
    },

    openMenu: function () {
      if (!this.toggle || !this.menu) return;
      this.toggle.setAttribute('aria-expanded', 'true');
      this.toggle.setAttribute('aria-label', 'Close navigation menu');
      this.menu.classList.add('is-open');
      if (this.scrim) {
        this.scrim.hidden = false;
        void this.scrim.offsetHeight;
        this.scrim.classList.add('is-visible');
      }
    },

    closeMenu: function (returnFocus) {
      if (!this.toggle || !this.menu) return;
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-label', 'Open navigation menu');
      this.menu.classList.remove('is-open');

      if (this.scrim) {
        var scrim = this.scrim;
        scrim.classList.remove('is-visible');
        window.setTimeout(function () {
          if (!scrim.classList.contains('is-visible')) scrim.hidden = true;
        }, 320);
      }

      if (returnFocus) this.toggle.focus();
    },

    bindMenu: function () {
      var self = this;
      if (!this.toggle || !this.menu) return;

      this.toggle.addEventListener('click', function () {
        if (self.isOpen()) self.closeMenu();
        else self.openMenu();
      });

      if (this.scrim) {
        this.scrim.addEventListener('click', function () { self.closeMenu(); });
      }

      // close after picking a destination
      $$('a', this.menu).forEach(function (link) {
        link.addEventListener('click', function () { self.closeMenu(); });
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && self.isOpen()) self.closeMenu(true);
      });

      // keep focus inside the open panel
      document.addEventListener('focusin', function (event) {
        if (!self.isOpen()) return;
        if (self.header.contains(event.target)) return;
        self.closeMenu();
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth >= 980 && self.isOpen()) self.closeMenu();
      });
    },

    /* ---- scrolled state + active link ---- */

    bindScroll: function () {
      var self = this;
      window.addEventListener('scroll', function () {
        if (self.ticking) return;
        self.ticking = true;
        requestAnimationFrame(function () {
          self.update();
          self.ticking = false;
        });
      }, { passive: true });
    },

    update: function () {
      var y = window.scrollY || window.pageYOffset;

      this.header.classList.toggle('is-scrolled', y > 24);

      if (!this.sections.length) return;

      // Nav order is not document order (Activations sits after About in
      // the markup), so sort by real position before picking the current
      // section — otherwise a later section gets overwritten by an earlier one.
      var ordered = this.sections
        .map(function (section) {
          return { el: section, top: section.getBoundingClientRect().top + y };
        })
        .sort(function (a, b) { return a.top - b.top; });

      // the section currently crossing the line just below the navbar
      var line = y + 140;
      var current = ordered[0].el;

      for (var i = 0; i < ordered.length; i++) {
        if (ordered[i].top <= line) current = ordered[i].el;
      }

      // at the very bottom, highlight the last section outright
      var atBottom = window.innerHeight + y >= document.body.offsetHeight - 4;
      if (atBottom) current = ordered[ordered.length - 1].el;

      var activeId = current ? current.id : null;

      this.links.forEach(function (link) {
        var isActive = link.getAttribute('href') === '#' + activeId;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
  };

  /* ==========================================================
     BOOT
     ========================================================== */

  function start() {
    Particles.init();
    Counter.init();
    Reveal.init();
    Faq.init();
    Nav.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* Public surface — kept intentionally small.
     DarkTides.setMemberCount(n) replaces the counter value and
     re-runs the animation, so a live Discord count can be wired
     in without touching the component. */
  window.DarkTides = {
    setMemberCount: function (value) { Counter.setValue(value); },
    closeMenu: function () { Nav.closeMenu(); }
  };
})();
