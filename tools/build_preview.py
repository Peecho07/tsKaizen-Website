#!/usr/bin/env python3
"""
Build a single-file preview of the tsKaizen site.

The real site is a normal multi-page static site (index.html, services.html, ...).
Some hosts -- a Claude Artifact, an email attachment, a USB stick handed to a
client -- can only take ONE self-contained file. This script reads the pages that
already exist (they stay the single source of truth), inlines the CSS, JS and
SVGs, and swaps the page links for a tiny hash router so every page still works.

    python3 tools/build_preview.py           -> build/preview.html

Nothing here edits the site itself. Re-run it after changing any page.
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"

PAGES = [
    ("home", "index.html"),
    ("services", "services.html"),
    ("data", "data.html"),
    ("method", "method.html"),
    ("about", "about.html"),
    ("consultation", "consultation.html"),
]
FILE_TO_ROUTE = {f: r for r, f in PAGES}


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def data_uri(rel):
    raw = (ROOT / rel).read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(raw).decode("ascii")


def inline_assets(html, assets):
    """Point every asset src at an inlined data: URI."""
    for rel, uri in assets.items():
        html = html.replace('src="%s"' % rel, 'src="%s"' % uri)
        html = html.replace('href="%s"' % rel, 'href="%s"' % uri)
    return html


def rewrite_links(html):
    """page.html and page.html#anchor become hash routes the router understands."""
    def sub(m):
        file, anchor = m.group(1), m.group(2) or ""
        route = FILE_TO_ROUTE.get(file)
        if not route:
            return m.group(0)
        return 'href="#/%s%s"' % (route, ("/" + anchor.lstrip("#")) if anchor else "")
    return re.sub(r'href="([a-z]+\.html)(#[\w-]+)?"', sub, html)


def section(name, html):
    m = re.search(r"<main id=\"top\">(.*?)</main>", html, re.S)
    if not m:
        raise SystemExit("no <main> found in %s" % name)
    return m.group(1)


def main():
    assets = {
        "assets/img/logo.svg": data_uri("assets/img/logo.svg"),
        "assets/img/mark.svg": data_uri("assets/img/mark.svg"),
        "assets/img/ai-adoption-chart.svg": data_uri("assets/img/ai-adoption-chart.svg"),
    }

    index = read("index.html")
    header = re.search(r"<header>.*?</header>", index, re.S).group(0)
    footer = re.search(r"<footer>.*?</footer>", index, re.S).group(0)
    widgets = re.search(r'(<button class="totop".*?)<script', index, re.S).group(1)

    routes = []
    for route, file in PAGES:
        body = section(file, read(file))
        routes.append(
            '<div class="route" id="route-%s" data-route="%s" hidden>%s</div>'
            % (route, route, body)
        )

    doc = "\n".join(
        [
            "<title>tsKaizen</title>",
            "<style>",
            read("assets/css/site.css"),
            ".route[hidden]{display:none!important;}",
            "</style>",
            '<a class="skip" href="#top">Skip to content</a>',
            header,
            '<main id="top">',
            "\n".join(routes),
            "</main>",
            footer,
            widgets,
            "<script>",
            read("assets/js/site.js"),
            "</script>",
            "<script>",
            ROUTER,
            "</script>",
        ]
    )

    doc = rewrite_links(doc)
    doc = inline_assets(doc, assets)

    BUILD.mkdir(exist_ok=True)
    out = BUILD / "preview.html"
    out.write_text(doc, encoding="utf-8")
    print("wrote %s (%.1f KB)" % (out.relative_to(ROOT), len(doc) / 1024))


ROUTER = r"""
/* hash router: only used by the single-file preview build */
(function () {
  var ROUTES = ['home', 'services', 'data', 'method', 'about', 'consultation'];
  var TITLES = {
    home: 'tsKaizen | AI and Automation for Local Business',
    services: 'Services | tsKaizen',
    data: 'The Data | tsKaizen',
    method: 'Method | tsKaizen',
    about: 'About Us | tsKaizen',
    consultation: 'Book a Free Consultation | tsKaizen'
  };

  function parse() {
    var raw = (location.hash || '').replace(/^#\/?/, '');
    var bits = raw.split('/');
    var route = ROUTES.indexOf(bits[0]) > -1 ? bits[0] : 'home';
    return { route: route, anchor: bits[1] || '' };
  }

  function show(first) {
    var p = parse();
    document.querySelectorAll('.route').forEach(function (el) {
      el.hidden = el.getAttribute('data-route') !== p.route;
    });
    document.body.setAttribute('data-page', p.route);
    document.title = TITLES[p.route];
    document.querySelectorAll('.nav a[data-nav]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === p.route);
    });
    document.querySelectorAll('.route:not([hidden]) .reveal').forEach(function (el) {
      el.classList.add('in');
    });
    if (p.anchor) {
      var t = document.querySelector('.route:not([hidden]) #' + p.anchor);
      if (t) { t.scrollIntoView({ behavior: first ? 'auto' : 'smooth', block: 'start' }); return; }
    }
    if (!first) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  window.addEventListener('hashchange', function () { show(false); });
  show(true);
})();
"""

if __name__ == "__main__":
    main()
