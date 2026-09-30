/* ===== SITE CONFIG ===== */
const FORM_ENDPOINT = "https://formspree.io/f/xkolwdag";
const CALC_DEFAULTS = { hoursNow: 6, hoursAfter: 1, hourValue: 40, cost: 3000 };
/* Email and phone are written straight into the HTML on purpose, so they
   show even if this script fails and search engines can read them. */
/* ======================= */

(function () {
  // Header border on scroll + sticky mobile bar after the hero
  const head = document.querySelector(".site-head");
  const bar = document.querySelector(".mbar");
  const onScroll = () => {
    const y = window.scrollY;
    if (head) head.classList.toggle("scrolled", y > 8);
    if (bar) bar.classList.toggle("show", y > 420);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  // Year
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Payback calculator
  const calc = document.getElementById("calc");
  if (calc) {
    const $ = (id) => document.getElementById(id);
    const fields = ["hoursNow", "hoursAfter", "hourValue", "cost"];
    fields.forEach((f) => { if ($(f) && !$(f).value) $(f).value = CALC_DEFAULTS[f]; });
    const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
    const run = () => {
      const now = Math.max(0, +$("hoursNow").value || 0);
      const after = Math.max(0, +$("hoursAfter").value || 0);
      const rate = Math.max(0, +$("hourValue").value || 0);
      const cost = Math.max(0, +$("cost").value || 0);
      const saved = Math.max(0, now - after);
      const yearly = saved * rate * 52;
      $("outHours").textContent = saved % 1 ? saved.toFixed(1) : saved;
      $("outValue").textContent = money(yearly);
      let be, verdict;
      if (yearly <= 0) {
        be = "Not on these numbers";
        verdict = "The hours returned do not cover the cost. On a call, this is where we would tell you to skip it.";
      } else {
        const months = cost / (yearly / 12);
        if (months <= 12) {
          be = months < 1 ? "Under a month" : "Around month " + Math.ceil(months);
          verdict = "On your numbers, the time returned pays for the build inside a year.";
        } else {
          be = "Over " + Math.floor(months / 12) + " year" + (months >= 24 ? "s" : "");
          verdict = "Slow payback. Worth a conversation, but probably not the first thing to fix.";
        }
      }
      $("outBreak").textContent = be;
      $("outVerdict").textContent = verdict;
    };
    calc.addEventListener("input", run);
    run();
  }

  // Contact form (sends to Formspree, stays on the page)
  const form = document.getElementById("contact-form");
  if (form) {
    form.action = FORM_ENDPOINT;
    const status = document.getElementById("form-status");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const submit = form.querySelector("button[type=submit]");
      submit.disabled = true;
      submit.textContent = "Sending...";
      status.className = "form-status";
      try {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("bad status");
        form.reset();
        status.className = "form-status ok";
        status.textContent = "Got it. You will hear back by email, usually the same day, with a couple of times for the call.";
        submit.textContent = "Request sent";
      } catch (err) {
        status.className = "form-status err";
        status.innerHTML = 'That did not send. Email <a href="mailto:anthonypichardo31@tskaizen.com">anthonypichardo31@tskaizen.com</a> instead and it will reach the same inbox.';
        submit.disabled = false;
        submit.textContent = "Request my free call";
      }
      status.focus();
    });
  }
})();
