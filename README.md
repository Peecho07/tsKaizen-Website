# tsKaizen — website

Static marketing site for tsKaizen, an AI and automation consultancy in Orlando, FL.
No build step, no framework: plain HTML, one stylesheet, one script. Open a file in a
browser and it works.

## Pages

| File | Page | What it covers |
| --- | --- | --- |
| `index.html` | Home | Hero, mission, the three services, selected work, the hidden cost of no automation, the data at a glance, the method, who we help |
| `services.html` | Services | Deep dive on each service, selected work, how engagements are shaped, FAQ |
| `data.html` | The Data | AI adoption chart, headline stats, what the numbers mean for a local business, what the data does *not* say |
| `method.html` | Method | Advise / Build / Improve, the seven-step engagement timeline, working principles, FAQ |
| `about.html` | About Us | Anthony's story, what the name means, how clients are worked with, selected work, the promise |
| `consultation.html` | Book a free consultation | Consultation form, direct contact, what happens next, quick answers |
| `404.html` | Not found | Fallback page with links back into the site |

Every page shares the same header, footer, assistant widget, and back-to-top button.

## Structure

```
assets/css/site.css   all styling, including the multi-page components
assets/js/site.js     nav drawer, scroll reveal, consultation form, assistant widget
assets/img/logo.svg   the tsKaizen wordmark (transparent, sits on any dark background)
assets/img/mark.svg   the loop mark, used as favicon, hero icon and chat avatar
assets/img/ai-adoption-chart.svg
tools/build_preview.py  builds a single-file version of the whole site
legacy/               the original one-page landing page, kept for reference
```

### Brand

| Token | Value | Used for |
| --- | --- | --- |
| ink | `#16182E` | Deep base, button text on amber |
| amber | `#F59E0B` | Primary action, accents, eyebrows |
| indigo | `#6366F1` / `#4F46E5` | Gradients, glow, focus states |
| ivory | `#FAF7F0` | Headings and body highlights |

Type: **Space Grotesk** for headings and UI, **DM Sans** for body copy.

## Editing content

Copy lives directly in the page files — search for the text and change it. Because the
header and footer are repeated in each page, a nav or footer change has to be made in all
seven files (`index`, `services`, `data`, `method`, `about`, `consultation`, `404`).

Things you will most likely want to change:

- **Contact details** — phone and email appear in the footer of every page and in
  `consultation.html`.
- **Form destination** — `FORMSPREE` at the top of the form section in `assets/js/site.js`.
- **Assistant** — `BOT_URL` in `assets/js/site.js`. When the live bot cannot be reached the
  widget falls back to built-in demo answers, so it never looks broken in front of a client.
- **Selected work** — the three project cards (Wax on Wheels, For the Plot, Cafe Coqui)
  appear on `index.html`, `services.html`, and `about.html`.
- **Domain** — `sitemap.xml` and `robots.txt` assume `https://tskaizen.com`.

## Running it locally

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening the `.html` files directly from disk works too.

## Publishing

The site is ready for any static host. For **GitHub Pages**: repository *Settings →
Pages → Source: Deploy from a branch*, pick the branch and the `/ (root)` folder. `.nojekyll`
is already present so the `assets/` folder is served as-is. Netlify, Vercel, and Cloudflare
Pages need no configuration either — point them at the repository root.

## Single-file preview

For anywhere that can only take one file (a Claude Artifact, an email attachment, a client's
USB stick):

```bash
python3 tools/build_preview.py     # -> build/preview.html
```

It reads the real pages, inlines the CSS, JS, and SVGs, and swaps the page links for a hash
router (`#/services`, `#/about`) so all six pages still work inside one file. The pages stay
the single source of truth — re-run it after any content change.
