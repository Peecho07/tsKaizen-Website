// ---- Config ----
const FORM_ENDPOINT = "https://formspree.io/f/xkolwdag";
const CONTACT_EMAIL = "anthonypichardo31@tskaizen.com";
const CONTACT_PHONE = "561-260-3951";
const CONTACT_PHONE_TEL = "+15612603951";
const QUOTE_TURNAROUND = "2 business days";
const DEMO_LINK = "/#demo";

// Live client sites, linked from the Selected Work case studies ("View the site").
// Leave a value empty to hide that link.
const CLIENT_LINKS = {
  ngb: "https://nextgenblinds.com",  // NextGen Blinds
  wow: "https://waxonwheels.com",    // Wax On Wheels
  cd: "https://mycleardeal.com",     // MyClearDeal
};

// Before/after slider (Home and About). Drop the old site screenshot at BEFORE_AFTER_BEFORE_IMG.
// Until that file exists, the "before" side shows a "Screenshot coming soon" placeholder.
const BEFORE_AFTER_CLIENT = "Wax On Wheels";
const BEFORE_AFTER_URL = "waxonwheels.com";
const BEFORE_AFTER_BEFORE_IMG = "img/work/wow-home-before-desk.jpg"; // PLACEHOLDER: old site screenshot, 1440x900
const BEFORE_AFTER_AFTER_IMG = "img/work/wow-home-desk.jpg";

// Every page opens at the top, including when returning with Back
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function toTop() { if (!location.hash) window.scrollTo(0, 0); }
toTop();
window.addEventListener("pageshow", toTop);
// Clicking the tab you are already on also returns to the top
document.querySelectorAll('.nav-links a[aria-current="page"], .brand').forEach(function (a) {
  a.addEventListener("click", function (e) {
    // Pages use clean addresses (/pricing), but also match /pricing.html and /index.html
    const norm = function (p) { return p.replace(/^\//, "").replace(/\.html$/, "").replace(/^index$/, ""); };
    const here = norm(location.pathname.split("/").pop());
    if (norm(a.getAttribute("href")) === here) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
});

// Mobile menu
(function () {
  const btn = document.querySelector(".menu-btn");
  const links = document.getElementById("nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", function () {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Close" : "Menu";
  });
})();

// Fill shared values
document.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = CONTACT_EMAIL; });
document.querySelectorAll("[data-phone]").forEach(function (el) { el.textContent = CONTACT_PHONE; el.setAttribute("href", "tel:" + CONTACT_PHONE_TEL); });
document.querySelectorAll('a[href="/#demo"]').forEach(function (el) { el.setAttribute("href", DEMO_LINK); });
document.querySelectorAll("[data-client-link]").forEach(function (el) {
  const url = CLIENT_LINKS[el.dataset.clientLink];
  if (url) { el.setAttribute("href", url); el.hidden = false; } else { el.hidden = true; }
});
document.querySelectorAll("[data-turnaround]").forEach(function (el) { el.textContent = QUOTE_TURNAROUND; });
document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

// Copy email
document.querySelectorAll("[data-copy-email]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1800); };
    try {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(done).catch(function () { selectEmail(btn); });
    } catch (e) { selectEmail(btn); }
  });
});
function selectEmail(btn) {
  const code = btn.parentElement.querySelector("code");
  if (!code) return;
  const r = document.createRange(); r.selectNodeContents(code);
  const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
}

// Quote form
(function () {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const submit = form.querySelector("button[type=submit]");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    submit.disabled = true; submit.textContent = "Sending...";
    status.hidden = true;
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Bad response");
      form.reset();
      status.className = "form-status ok";
      status.textContent = "Got it. Your quote will land in your inbox within " + QUOTE_TURNAROUND + ".";
    } catch (err) {
      status.className = "form-status err";
      status.textContent = "That didn't send. Please email the same details to " + CONTACT_EMAIL + " and we'll quote from there.";
    }
    status.hidden = false;
    submit.disabled = false; submit.textContent = "Send my message";
  });
})();

// Quote form progress bar
(function () {
  const form = document.getElementById("quote-form");
  const bars = form ? form.querySelectorAll(".form-progress i") : [];
  if (!bars.length) return;
  const checks = [
    function () { return form.elements.name.value.trim() && form.elements.business.value.trim(); },
    function () { return /.+@.+\..+/.test(form.elements.email.value); },
    function () { return !!form.querySelector("input[name=need]:checked"); },
    function () { return form.elements.details.value.trim().length > 10; },
  ];
  const update = function () { checks.forEach(function (fn, i) { bars[i].classList.toggle("on", !!fn()); }); };
  form.addEventListener("input", update); form.addEventListener("change", update); update();
})();

// Free website check form (and any other [data-formspree] form)
document.querySelectorAll("form[data-formspree]").forEach(function (form) {
  const status = form.querySelector(".form-status");
  const btn = form.querySelector("button[type=submit]");
  const label = btn.textContent;
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Bad response");
      form.reset();
      status.className = "form-status ok";
      status.textContent = form.dataset.success || "Got it. We'll reply within " + QUOTE_TURNAROUND + ".";
    } catch (err) {
      status.className = "form-status err";
      status.textContent = "That didn't send. Email the same details to " + CONTACT_EMAIL + " and we'll take it from there.";
    }
    status.hidden = false; btn.disabled = false; btn.textContent = label;
  });
});

// Feature tabs on Home ([data-tabs])
document.querySelectorAll("[data-tabs]").forEach(function (root) {
  const tabs = root.querySelectorAll('[role="tab"]');
  function show(tab) {
    tabs.forEach(function (t) {
      const on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { show(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      show(next); next.focus();
    });
  });
});

// Hero rotator: the last word of the headline flips through what we take off your plate,
// then rests on the first word ("AI." on Home)
(function () {
  const rot = document.querySelector("[data-rotator]");
  if (!rot) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const words = Array.prototype.slice.call(rot.querySelectorAll(".rot-w"));
  let cur = 0;
  function fit() { rot.style.width = words[cur].offsetWidth + "px"; }
  function next() {
    const prev = words[cur];
    cur = (cur + 1) % words.length;
    prev.classList.remove("is-on"); prev.classList.add("is-off");
    words[cur].classList.remove("is-off"); words[cur].classList.add("is-on");
    fit();
    setTimeout(function () { prev.classList.remove("is-off"); }, 650);
    // Linger on the first word before the next cycle
    setTimeout(next, cur === 0 ? 4200 : 1900);
  }
  fit();
  window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  setTimeout(next, 3200);
})();

// Hero motion graphics: three scenes take turns, with tabs to jump between them
(function () {
  const mg = document.querySelector("[data-mg]");
  if (!mg) return;
  const scenes = Array.prototype.slice.call(mg.querySelectorAll(".mg-scene"));
  const tabs = Array.prototype.slice.call(mg.querySelectorAll(".mg-tabs button"));
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = 7000;
  mg.style.setProperty("--mg-dur", DUR / 1000 + "s");
  let cur = 0, timer = 0, counter = 0, visible = true;
  function count(el) {
    clearInterval(counter);
    const to = +el.dataset.countTo, start = Date.now() + 1400;
    el.textContent = reduce ? to : 12;
    if (reduce) return;
    counter = setInterval(function () {
      const k = Math.min(1, Math.max(0, (Date.now() - start) / 3600));
      el.textContent = Math.round(12 + (to - 12) * (1 - Math.pow(1 - k, 3)));
      if (k >= 1) clearInterval(counter);
    }, 50);
  }
  function show(n) {
    cur = (n + scenes.length) % scenes.length;
    scenes.forEach(function (s, i) { s.classList.toggle("is-on", i === cur); });
    // Re-trigger the progress bar on the active tab
    tabs.forEach(function (t, i) { t.setAttribute("aria-pressed", "false"); if (i === cur) { void t.offsetWidth; t.setAttribute("aria-pressed", "true"); } });
    const c = scenes[cur].querySelector("[data-count-to]");
    if (c) count(c);
    clearTimeout(timer);
    if (!reduce && visible) timer = setTimeout(function () { show(cur + 1); }, DUR);
  }
  tabs.forEach(function (t, i) { t.addEventListener("click", function () { show(i); }); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    mg.classList.toggle("is-paused", !visible);
    if (visible) show(cur); else clearTimeout(timer);
  }).observe(mg);
  show(0);
})();

// Client banner: scrolls the wordmarks and pops whichever one is passing the middle
(function () {
  const mq = document.querySelector("[data-marquee]");
  if (!mq) return;
  const track = mq.querySelector(".mq-track");
  const items = Array.prototype.slice.call(track.children);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { items.forEach(function (it) { it.classList.add("is-pop"); }); return; }
  const perSet = 3;
  let x = 0, setW = 0, last = 0, hover = false, visible = true, raf = 0, popped = null;
  function measure() { setW = items[perSet].offsetLeft - items[0].offsetLeft; }
  function frame(now) {
    raf = 0;
    const dt = Math.min(64, now - (last || now)); last = now;
    if (!hover) { x -= dt * 0.05; if (setW && x <= -setW) x += setW; }
    track.style.transform = "translate3d(" + x + "px,0,0)";
    // Pop the wordmark nearest the center of the banner
    const mid = mq.getBoundingClientRect().left + mq.clientWidth / 2;
    let best = null, bd = 1e9;
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bd) { bd = d; best = items[i]; }
    }
    if (best !== popped) { if (popped) popped.classList.remove("is-pop"); best.classList.add("is-pop"); popped = best; }
    if (visible) raf = requestAnimationFrame(frame);
  }
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  mq.addEventListener("mouseenter", function () { hover = true; });
  mq.addEventListener("mouseleave", function () { hover = false; });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting; last = 0;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }).observe(mq);
  raf = requestAnimationFrame(frame);
})();

// Work page: reveal each case study as it scrolls in, and count the stats up from zero
(function () {
  const els = document.querySelectorAll("[data-reveal]");
  if (els.length) {
    if (!("IntersectionObserver" in window)) els.forEach(function (e) { e.classList.add("is-in"); });
    else {
      const io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -12% 0px" });
      els.forEach(function (e) { io.observe(e); });
    }
  }
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  nums.forEach(function (b) {
    const to = +b.dataset.count;
    if (!to) return;
    b.textContent = "0" + (b.dataset.suffix || "");
    const start = performance.now() + 500;
    (function tick(now) {
      const k = Math.min(1, Math.max(0, (now - start) / 1400));
      b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + (b.dataset.suffix || "");
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  });
})();

// Scroll reveal for every page: each section below the header fades up as it enters,
// its blocks and grid items one after another. Case studies keep their own reveal.
(function () {
  if (!document.documentElement.classList.contains("js") || !("IntersectionObserver" in window)) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const GRIDS = ".work-grid, .plans, .inds, .side, .quote-grid, .demo-grid, .split";
  const secs = Array.prototype.slice.call(document.querySelectorAll("main > section")).slice(1)
    .filter(function (s) { return !s.querySelector("[data-reveal]") && !s.classList.contains("logos"); });
  const io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.classList.add("sr-in");
      // Drop the reveal styles once played so hover transitions run without delay
      setTimeout(function () {
        e.target.querySelectorAll(".sr").forEach(function (el) { el.classList.remove("sr"); el.style.removeProperty("--sr-d"); });
      }, 2400);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  secs.forEach(function (s) {
    const wrap = s.querySelector(".wrap") || s;
    let i = 0;
    Array.prototype.forEach.call(wrap.children, function (el) {
      const grid = el.matches(GRIDS) ? el : null;
      if (grid && grid.children.length > 1) {
        Array.prototype.forEach.call(grid.children, function (c, k) { c.classList.add("sr"); c.style.setProperty("--sr-d", Math.min(i + k, 8) * 0.09 + "s"); });
        i += 1;
      } else {
        el.classList.add("sr"); el.style.setProperty("--sr-d", Math.min(i, 8) * 0.09 + "s"); i++;
      }
    });
    io.observe(s);
  });
})();

// Before/after slider: drag the divider (mouse, touch or pen), or use the arrow keys
document.querySelectorAll("[data-ba]").forEach(function (root) {
  const stage = root.querySelector(".ba-stage");
  const handle = root.querySelector(".ba-handle");
  const before = root.querySelector("[data-ba-before]");
  const after = root.querySelector("[data-ba-after]");
  const url = root.querySelector("[data-ba-url]");
  if (url) url.textContent = BEFORE_AFTER_URL;
  if (after) { after.src = BEFORE_AFTER_AFTER_IMG; after.alt = BEFORE_AFTER_CLIENT + " website after the rebuild"; }
  if (before) {
    before.alt = BEFORE_AFTER_CLIENT + " website before the rebuild";
    before.addEventListener("load", function () { root.classList.add("has-before"); });
    before.src = BEFORE_AFTER_BEFORE_IMG;
  }
  let pos = 50, drag = false;
  function set(p) {
    pos = Math.max(0, Math.min(100, p));
    root.style.setProperty("--ba-pos", pos + "%");
    handle.setAttribute("aria-valuenow", Math.round(pos));
  }
  function fromEvent(e) { const r = stage.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button > 0) return;
    drag = true; root.classList.add("is-drag");
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    fromEvent(e);
  });
  stage.addEventListener("pointermove", function (e) { if (drag) { e.preventDefault(); fromEvent(e); } });
  function end() { drag = false; root.classList.remove("is-drag"); }
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  handle.addEventListener("keydown", function (e) {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(pos - step);
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") set(pos + step);
    else if (e.key === "Home") set(0);
    else if (e.key === "End") set(100);
    else return;
    e.preventDefault();
  });
  set(50);
});
