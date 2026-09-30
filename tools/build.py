#!/usr/bin/env python3
"""Builds the static site: wraps each page body in src/ with the shared head,
header and footer, and writes it to its clean URL folder.

Edit a page:   change src/<page>.html, then run  python3 tools/build.py
Edit nav/foot: change the functions below, then run the same command.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# ===== BUSINESS CONFIG (edit here) =====
SITE_URL = "https://tskaizen.com"
EMAIL = "anthonypichardo31@tskaizen.com"
PHONE_DISPLAY = "(561) 260-3951"   # TODO(Ant): confirm this is the number you want public
PHONE_TEL = "+15612603951"
FOUNDER = "Anthony Pichardo"
CITY = "Orlando"
REGION = "FL"
# =======================================

PAGES = [
    # slug, out path, nav key, title, description
    ("home", "index.html", "home",
     "Websites, AI Assistants and Automation for Orlando Small Businesses | tsKaizen",
     "tsKaizen builds fast websites, AI assistants that answer questions and calls, and automations that stop the retyping. Fixed price, demo first, and you own everything. Orlando, FL."),
    ("services", "services/index.html", "services",
     "Services: Websites, AI Assistants and Automation | tsKaizen Orlando",
     "Custom websites, AI assistants trained on your business, and automations between the tools you already use. How each works, what it includes, and how the fixed price gets set."),
    ("work", "work/index.html", "work",
     "Work: Websites and Systems for Local Businesses | tsKaizen",
     "Recent website rebuilds and assistant builds for local businesses in Central Florida, and the problems each one solved."),
    ("about", "about/index.html", "about",
     "About Anthony Pichardo and tsKaizen | Orlando AI and Web Studio",
     "tsKaizen is a one-person Orlando studio. The person on your first call designs it, builds it and hands it over."),
    ("contact", "contact/index.html", "contact",
     "Book a Free 30-Minute Call | tsKaizen Orlando",
     "Tell us what is eating your week. Free 30-minute call, no pitch deck, and a straight answer on what is worth fixing first."),
    ("404", "404.html", "",
     "Page not found | tsKaizen",
     "That page does not exist."),
]

CUR = ' aria-current="page"'
NAV = [("services", "/services/", "Services"), ("work", "/work/", "Work"),
       ("about", "/about/", "About"), ("faq", "/#faq", "FAQ")]

ICON = {
 "phone": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
 "mail": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
 "pin": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
 "menu": '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
}

MARK = ('<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#16182E"/>'
        '<path d="M22.5 11.2A8 8 0 1 0 24 16" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M19.6 10.6l3.4.4-.5 3.4" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def schema(slug):
    biz = {
        "@context": "https://schema.org", "@type": "ProfessionalService",
        "name": "tsKaizen", "url": SITE_URL + "/", "email": EMAIL, "telephone": PHONE_TEL,
        "image": SITE_URL + "/assets/og.png",
        "description": "Websites, AI assistants and automation for small businesses.",
        "founder": {"@type": "Person", "name": FOUNDER},
        "address": {"@type": "PostalAddress", "addressLocality": CITY, "addressRegion": REGION, "addressCountry": "US"},
        "areaServed": [{"@type": "City", "name": "Orlando"}, {"@type": "AdministrativeArea", "name": "Central Florida"}],
        "priceRange": "Fixed price, quoted per project",
    }
    out = [biz]
    faq_file = SRC / f"{slug}.faq.json"
    if faq_file.exists():
        qa = json.loads(faq_file.read_text())
        out.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]})
    return "\n".join(f'<script type="application/ld+json">{json.dumps(o)}</script>' for o in out)


def head(slug, out, title, desc):
    canon = SITE_URL + "/" + out.replace("index.html", "")
    robots = '<meta name="robots" content="noindex">' if slug == "404" else ""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="tsKaizen">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE_URL}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FAF7F0">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Space+Grotesk:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/assets/site.css">
{schema(slug) if slug != "404" else ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""


def header(active):
    links = "".join(
        f'<a href="{href}"{CUR if key == active else ""}>{label}</a>' for key, href, label in NAV)
    return f"""<header class="site-head">
  <div class="wrap head-inner">
    <a class="brand" href="/" aria-label="tsKaizen home">{MARK}tsKaizen</a>
    <a class="head-phone" href="tel:{PHONE_TEL}" aria-label="Call {PHONE_DISPLAY}">{ICON["phone"]}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu">{ICON["menu"]}</button>
    <nav class="nav" id="nav" aria-label="Main">
      {links}
      <a class="btn btn-primary" href="/contact/"{CUR if active == "contact" else ""}>Book a free call</a>
    </nav>
  </div>
</header>
"""


def footer(slug):
    mbar = "" if slug in ("contact", "404") else f"""<div class="mbar" aria-label="Quick actions">
  <a class="btn btn-primary" href="/contact/">Book a free call</a>
  <a class="btn btn-secondary" href="tel:{PHONE_TEL}" aria-label="Call {PHONE_DISPLAY}">{ICON["phone"]}</a>
</div>
"""
    return f"""<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="/">{MARK}tsKaizen</a>
        <p>Websites, AI assistants and automation for small businesses. Built to remove work, not add another login.</p>
      </div>
      <div>
        <h2>Pages</h2>
        <ul>
          <li><a href="/services/">Services</a></li>
          <li><a href="/work/">Work</a></li>
          <li><a href="/about/">About</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/contact/">Book a free call</a></li>
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></li>
          <li><span style="display:inline-block;padding:6px 0">{CITY}, Florida. Remote anywhere.</span></li>
        </ul>
      </div>
    </div>
    <div class="foot-base">
      <span>&copy; <span data-year>2026</span> tsKaizen. Built in Orlando.</span>
      <span>No mailing list. We only reply to what you send.</span>
    </div>
  </div>
</footer>
{mbar}<script src="/assets/site.js" defer></script>
</body>
</html>
"""


def build():
    icons = {f"{{{{icon:{k}}}}}": v for k, v in ICON.items()}
    tokens = {"{{EMAIL}}": EMAIL, "{{PHONE_DISPLAY}}": PHONE_DISPLAY, "{{PHONE_TEL}}": PHONE_TEL,
              "{{CHECK}}": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
              **icons}
    urls = []
    for slug, out, active, title, desc in PAGES:
        body = (SRC / f"{slug}.html").read_text()
        for k, v in tokens.items():
            body = body.replace(k, v)
        faq_file = SRC / f"{slug}.faq.json"
        if faq_file.exists():
            items = json.loads(faq_file.read_text())
            body = body.replace("{{FAQ}}", "\n".join(
                f'<details><summary>{q}</summary><div class="a"><p>{a}</p></div></details>' for q, a in items))
        html = head(slug, out, title, desc) + header(active) + '<main id="main">\n' + body + "\n</main>\n" + footer(slug)
        dest = ROOT / out
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html)
        if slug != "404":
            urls.append(SITE_URL + "/" + out.replace("index.html", ""))
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    print("built", len(PAGES), "pages")


if __name__ == "__main__":
    build()
