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
