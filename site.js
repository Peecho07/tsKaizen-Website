// ---- Config ----
const FORM_ENDPOINT = "https://formspree.io/f/xkolwdag";
const CONTACT_EMAIL = "anthonypichardo31@tskaizen.com";
const QUOTE_TURNAROUND = "2 business days";

// Every page opens at the top, including when returning with Back
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function toTop() { if (!location.hash) window.scrollTo(0, 0); }
toTop();
window.addEventListener("pageshow", toTop);
// Clicking the tab you are already on also returns to the top
document.querySelectorAll('.nav-links a[aria-current="page"], .brand').forEach(function (a) {
  a.addEventListener("click", function (e) {
    const here = location.pathname.split("/").pop() || "index.html";
    if (a.getAttribute("href") === here) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
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
    submit.disabled = false; submit.textContent = "Send my quote request";
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
    function () { return !!form.querySelector("input[name=pages]:checked"); },
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

// Quote form: preselect the plan from ?plan= links on the pricing page
(function () {
  const sel = document.getElementById("q-plan"), care = document.getElementById("q-care");
  if (!sel) return;
  let plan = "";
  try { plan = new URLSearchParams(location.search).get("plan") || ""; } catch (e) {}
  const map = { launch: ["q-plan", "Launch"], growth: ["q-plan", "Growth"], pro: ["q-plan", "Pro"], custom: ["q-plan", "Custom"], care: ["q-care", "Care"], careplus: ["q-care", "Care Plus"] };
  if (map[plan]) document.getElementById(map[plan][0]).value = map[plan][1];
  if (plan === "care" || plan === "careplus") sel.value = "Care";
})();

// Pricing tabs
(function () {
  const tabs = document.querySelectorAll('.price-tabs [role="tab"]');
  if (!tabs.length) return;
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
  show(tabs[0]);
})();

// Care plan billing toggle
(function () {
  const btns = document.querySelectorAll("[data-bill]");
  if (!btns.length) return;
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      const mode = b.dataset.bill;
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      document.querySelectorAll("[data-monthly]").forEach(function (el) { el.textContent = el.dataset[mode]; });
    });
  });
})();

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

// Kinetic headline: the hero title is drawn as particles that drift in, settle into the
// letters, ripple every few seconds and scatter around the pointer
(function () {
  const h = document.querySelector("[data-kinetic]");
  if (!h || !window.requestAnimationFrame) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const PAD = 40;
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  let parts = [], W = 0, H = 0, dpr = 1, raf = 0, visible = true, t0 = 0, started = false;
  const ptr = { x: -9999, y: -9999 };

  // Lay each word out where the browser put it, in its own font and color
  function targets() {
    const box = h.getBoundingClientRect();
    W = Math.ceil(box.width) + PAD * 2; H = Math.ceil(box.height) + PAD * 2;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.textBaseline = "alphabetic";
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const cs = getComputedStyle(n.parentElement);
      o.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
      o.fillStyle = n.parentElement.dataset.kColor || cs.color;
      if ("letterSpacing" in o) o.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      const re = /\S+/g; let m;
      while ((m = re.exec(n.data))) {
        const r = document.createRange();
        r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const rc = r.getBoundingClientRect();
        const fm = o.measureText(m[0]);
        const asc = fm.actualBoundingBoxAscent || parseFloat(cs.fontSize) * .75;
        const desc = fm.actualBoundingBoxDescent || 0;
        const base = rc.top - box.top + PAD + (rc.height + asc - desc) / 2;
        o.fillText(m[0], rc.left - box.left + PAD, base);
      }
    }
    const fs = parseFloat(getComputedStyle(h).fontSize);
    const step = Math.max(2, Math.round(fs / 28));
    const data = o.getImageData(0, 0, W, H).data;
    const out = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      const i = (y * W + x) * 4;
      if (data[i + 3] > 100) out.push({ x: x, y: y, c: "rgb(" + data[i] + "," + data[i + 1] + "," + data[i + 2] + ")" });
    }
    return { pts: out, size: step * .9 };
  }

  let size = 2;
  function build() {
    // Read the real colors before hiding the text
    h.classList.remove("is-live");
    h.querySelectorAll("em").forEach(function (e) { e.dataset.kColor = getComputedStyle(e).color; });
    h.dataset.kColor = getComputedStyle(h).color;
    const res = targets();
    size = res.size;
    const old = parts;
    parts = res.pts.map(function (p, i) {
      const prev = old[i];
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
      return {
        tx: p.x, ty: p.y, c: p.c,
        x: prev ? prev.x : p.x + Math.cos(a) * d, y: prev ? prev.y : p.y + Math.sin(a) * d,
        vx: 0, vy: 0, ph: Math.random() * Math.PI * 2, delay: prev ? 0 : Math.random() * 500 + (p.x / W) * 600
      };
    });
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.inset = -PAD + "px"; cv.style.width = W + "px"; cv.style.height = H + "px";
    if (!cv.parentNode) h.appendChild(cv);
    h.classList.add("is-live");
  }

  function frame(now) {
    raf = 0;
    if (!t0) t0 = now;
    const t = now - t0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // A ripple sweeps across the words once every 7 seconds, then they rest
    const cyc = (t - 1800) % 7000;
    const wave = t > 1800 && cyc < 2200 ? (cyc / 2200) * (W + 400) - 200 : -9999;
    let last = "";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (t > p.delay) {
        let gx = p.tx, gy = p.ty;
        const dw = p.tx - wave;
        if (dw > -90 && dw < 90) gy -= Math.cos(dw / 90 * Math.PI / 2) * 6;
        gx += Math.sin(t / 900 + p.ph) * .25; gy += Math.cos(t / 1100 + p.ph) * .25;
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 4900) { const f = (4900 - d2) / 4900 * 2.4; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx = (p.vx + (gx - p.x) * .07) * .82;
        p.vy = (p.vy + (gy - p.y) * .07) * .82;
        p.x += p.vx; p.y += p.vy;
      }
      if (p.c !== last) { ctx.fillStyle = p.c; last = p.c; }
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
    if (visible) raf = requestAnimationFrame(frame);
  }
  function go() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  function start() {
    if (started) return; started = true;
    build(); go();
    let rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { build(); go(); }, 150); });
    const hero = h.closest("section") || h;
    hero.addEventListener("pointermove", function (e) { const b = cv.getBoundingClientRect(); ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; });
    hero.addEventListener("pointerleave", function () { ptr.x = ptr.y = -9999; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; go(); }).observe(h);
  }
  // Wait for the web fonts so the particles land on the real letter shapes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start); else start();
  setTimeout(start, 2500);
})();

// Reviews: a deck of cards that shuffles the front review to the back
(function () {
  const deck = document.querySelector("[data-reviews]");
  if (!deck) return;
  const cards = Array.prototype.slice.call(deck.querySelectorAll(".rv-card"));
  const dots = Array.prototype.slice.call(document.querySelectorAll(".rv-dots button"));
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0, timer = 0, busy = false;
  function lay() {
    cards.forEach(function (c, i) {
      const pos = (i - cur + cards.length) % cards.length;
      c.dataset.pos = pos;
      c.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
    });
    dots.forEach(function (d, i) { d.setAttribute("aria-selected", i === cur ? "true" : "false"); });
  }
  function show(n, fling) {
    n = (n + cards.length) % cards.length;
    if (n === cur || busy) return;
    const front = cards[cur];
    if (fling && !reduce) {
      busy = true;
      front.classList.add("is-leaving");
      setTimeout(function () { front.classList.remove("is-leaving"); cur = n; lay(); busy = false; }, 420);
    } else { cur = n; lay(); }
  }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1, true); }, 5500); }
  document.querySelectorAll("[data-rv]").forEach(function (b) {
    b.addEventListener("click", function () { show(cur + (b.dataset.rv === "next" ? 1 : -1), b.dataset.rv === "next"); auto(); });
  });
  dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i, i > cur); auto(); }); });
  deck.addEventListener("click", function () { show(cur + 1, true); auto(); });
  deck.addEventListener("mouseenter", function () { clearInterval(timer); });
  deck.addEventListener("mouseleave", auto);
  lay(); auto();
})();
