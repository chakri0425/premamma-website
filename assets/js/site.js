// Premamma website — shared behaviour
(function () {
  'use strict';

  // ---------- mobile menu ----------
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  if (menu && openBtn && closeBtn) {
    openBtn.addEventListener('click', function () {
      menu.classList.add('open');
      openBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    });
    closeBtn.addEventListener('click', function () {
      menu.classList.remove('open');
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    });
  }

  // ---------- countdown to the book release ----------
  var RELEASE = new Date('2026-12-06T17:30:00+05:30').getTime();
  var countEls = document.querySelectorAll('[data-countdown]');
  function tick() {
    var diff = RELEASE - Date.now();
    countEls.forEach(function (el) {
      if (diff <= 0) {
        el.innerHTML = '<p class="body">The book was released on 6 December 2026.</p>';
        return;
      }
      var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60;
      el.querySelector('[data-d]').textContent = d;
      el.querySelector('[data-h]').textContent = h;
      el.querySelector('[data-m]').textContent = m;
    });
  }
  if (countEls.length) { tick(); setInterval(tick, 30000); }

  // ---------- language toggle (Her Story page) ----------
  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang-btn');
      document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      document.querySelectorAll('[data-lang-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-lang-panel') !== lang;
      });
    });
  });

  // ---------- gallery lightbox ----------
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbClose = lb.querySelector('button');
    var lastBtn = null;
    document.querySelectorAll('[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        lastBtn = b;
        lbImg.src = b.getAttribute('data-full');
        lbImg.alt = b.querySelector('img').alt;
        lb.classList.add('open');
        lbClose.focus();
      });
    });
    function closeLb() { lb.classList.remove('open'); if (lastBtn) lastBtn.focus(); }
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function stars(n) { n = Math.max(1, Math.min(5, parseInt(n, 10) || 5)); return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
  }
  var apiAvailable = location.protocol === 'http:' || location.protocol === 'https:';

  // ---------- review list ----------
  var list = document.getElementById('review-list');
  if (list) {
    var limit = parseInt(list.getAttribute('data-limit') || '0', 10);
    var summary = document.getElementById('review-summary');
    if (!apiAvailable) {
      list.innerHTML = '<div class="empty">Reviews appear here once the website is online.</div>';
    } else {
      fetch('/api/reviews', { headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (data) {
          var items = data.reviews || [];
          if (summary && items.length) {
            var avg = items.reduce(function (a, r) { return a + (r.rating || 0); }, 0) / items.length;
            summary.textContent = '★ ' + avg.toFixed(1) + ' average from ' + items.length + (items.length === 1 ? ' reader' : ' readers');
          }
          if (!items.length) {
            list.innerHTML = '<div class="empty">No reviews yet. Be the first to share what Premamma’s story meant to you.</div>';
            return;
          }
          if (limit) items = items.slice(0, limit);
          list.innerHTML = items.map(function (r) {
            return '<article class="review"><p class="stars" aria-label="' + r.rating + ' out of 5 stars">' + stars(r.rating) + '</p>' +
              '<p class="txt">“' + esc(r.review) + '”</p>' +
              '<p class="who">' + esc(r.name) + (r.city ? ' · ' + esc(r.city) : '') + ' · ' + fmtDate(r.createdAt) + '</p></article>';
          }).join('');
        })
        .catch(function () {
          list.innerHTML = '<div class="empty">Reviews could not be loaded right now. Please try again later.</div>';
        });
    }
  }

  // ---------- form submission (reviews + messages) ----------
  document.querySelectorAll('form[data-api]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!apiAvailable) {
        status.className = 'form-status err';
        status.textContent = 'This form works once the website is online.';
        return;
      }
      var body = {};
      new FormData(form).forEach(function (v, k) { body[k] = v; });
      btn.disabled = true;
      status.textContent = 'Sending…';
      fetch(form.getAttribute('data-api'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j && res.j.error || 'Something went wrong.');
          form.reset();
          status.className = 'form-status ok';
          status.textContent = form.getAttribute('data-success');
        })
        .catch(function (err) {
          status.className = 'form-status err';
          status.textContent = err.message || 'Something went wrong. Please try again.';
        })
        .finally(function () { btn.disabled = false; });
    });
  });
})();
