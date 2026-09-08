/* tsKaizen — shared site behaviour (all pages) */
(function () {
  'use strict';

  /* current year in the footer */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* mark the nav link for the page we are on */
  var page = (document.body.getAttribute('data-page') || '').toLowerCase();
  document.querySelectorAll('.nav a[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === page) a.classList.add('active');
  });

  /* mobile nav drawer */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) setOpen(false);
    });
  }

  /* scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* back to top */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     Consultation form -> Formspree
     ------------------------------------------------------------------ */
  var FORMSPREE = 'https://formspree.io/f/xkolwdag';
  var CONTACT_EMAIL = 'anthonypichardo31@tskaizen.com';
  var form = document.getElementById('consultForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitConsult();
    });
  }

  async function submitConsult() {
    var val = function (id) {
      var el = document.getElementById(id);
      return el ? (el.value || '').trim() : '';
    };
    var name = val('f-name'), company = val('f-company'), email = val('f-email'),
        phone = val('f-phone'), service = val('f-service'), budget = val('f-budget'),
        problem = val('f-problem');
    var msg = document.getElementById('formMsg');

    if (!name || !company || !email || !service || !problem) {
      msg.className = 'form-msg err';
      msg.textContent = 'Please fill in all required fields so I can help you properly.';
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      msg.className = 'form-msg err';
      msg.textContent = 'That email does not look right. Mind double-checking it?';
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

    try {
      var res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name, company: company, email: email, phone: phone || '-',
          service: service, budget: budget || 'Not specified', message: problem,
          _subject: 'New consultation: ' + company + ' (' + service + ')'
        })
      });
      if (res.ok) {
        msg.className = 'form-msg ok';
        msg.textContent = 'Thanks ' + name + '! Your request is in. I will get back to you fast.';
        ['f-name', 'f-company', 'f-email', 'f-phone', 'f-service', 'f-budget', 'f-problem']
          .forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
      } else {
        msg.className = 'form-msg err';
        msg.textContent = 'Something went wrong. Please email ' + CONTACT_EMAIL + ' directly.';
      }
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = 'Network hiccup. Please email ' + CONTACT_EMAIL + ' directly.';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send my request'; }
    }
  }

  /* ------------------------------------------------------------------
     Assistant widget (demo replies, upgraded to the live bot when set)
     ------------------------------------------------------------------ */
  var BOT_URL = 'https://ts-kaizen-website--AnthonyPichardo.replit.app';
  var fab = document.getElementById('chatFab'),
      panel = document.getElementById('chatPanel'),
      body = document.getElementById('chatBody'),
      input = document.getElementById('chatInput'),
      send = document.getElementById('chatSend');

  if (fab && panel) {
    var toggleChat = function () {
      panel.classList.toggle('open');
      if (panel.classList.contains('open') && input) input.focus();
    };
    fab.addEventListener('click', toggleChat);
    fab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleChat(); }
    });

    var add = function (text, who) {
      var d = document.createElement('div');
      d.className = 'msg ' + who;
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    };

    var demo = function (q) {
      q = q.toLowerCase();
      if (/offer|service|do you|build|provide/.test(q)) return 'I offer three things: modern websites, AI assistants that answer chats and calls 24/7, and automation that handles repetitive work. Which sounds closest to what you need?';
      if (/price|cost|how much|budget/.test(q)) return 'Pricing depends on your needs. Most clients start with a free consultation, then choose a build plus a monthly plan to keep it improving. Want to book that consultation?';
      if (/website|site|web/.test(q)) return 'I build fast, modern, mobile-first websites that turn visitors into customers. Want me to look at your current one?';
      if (/chat|call|phone|bot|assistant/.test(q)) return 'The AI assistant answers customer messages and phone calls around the clock and captures every lead, even when you are closed. You are using a small demo of it now.';
      if (/automat|workflow|streamline/.test(q)) return 'Automation takes the busywork off your plate: follow-ups, scheduling, reminders, and data entry that run themselves. What task eats the most time?';
      if (/data|stat|trend|grow/.test(q)) return 'AI use jumped from 20% of organizations in 2017 to 88% in 2025, and most adopters see a return within the first year. Starting early is the easiest edge you can get.';
      if (/work|project|client|portfolio|example/.test(q)) return 'Recent work includes Wax on Wheels (mobile detailing), For the Plot (creative studio), and Cafe Coqui (neighborhood cafe). Head to the Home page to see what each one needed.';
      if (/consult|book|meet|contact/.test(q)) return 'Love it. Open the Book a free consultation page and tell me what you are solving, or email ' + CONTACT_EMAIL + '. I respond fast.';
      if (/hi|hello|hey/.test(q)) return 'Hey! Ask me about websites, AI assistants, or automation and how they could help your business.';
      return 'Great question. The best next step is a quick consultation, free and no obligation. Open the consultation page and tell me more.';
    };

    var csend = async function () {
      var q = (input.value || '').trim();
      if (!q) return;
      add(q, 'user');
      input.value = '';
      if (BOT_URL) {
        try {
          var r = await fetch(BOT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q })
          });
          var d = await r.json();
          add(d.reply || d.text || 'Thanks! I will get back to you shortly.', 'bot');
          return;
        } catch (err) { /* fall through to the local demo reply */ }
      }
      setTimeout(function () { add(demo(q), 'bot'); }, 380);
    };

    if (send) send.addEventListener('click', csend);
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') csend(); });
  }
})();
