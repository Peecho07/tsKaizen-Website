# tsKaizen website

Static site, no framework. Pages live in `src/`, shared header, footer, SEO tags and schema live in `tools/build.py`.

## Edit and rebuild
1. Change a page in `src/` (or email/phone at the top of `tools/build.py`)
2. Run `python3 tools/build.py`
3. Commit the generated files too (`index.html`, `services/`, `work/`, `about/`, `contact/`, `sitemap.xml`)

FAQ answers live in `src/home.faq.json` and feed both the accordion and the FAQ schema.

## Open TODOs (search the repo for `TODO(Ant)`)
- Headshot on About
- Real screenshots, names and live links on Work (only with each owner's permission)
- Reviews section on Home (commented out until there is a real quote)
- Confirm the public phone number in `tools/build.py`
