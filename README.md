# events.patrickbray.com

Standalone booking site for Patrick B Ray private events: weddings, corporate,
private parties. Thematically matched to patrickbray.com, but a separate site
with no links to merch, shows, tip jar or press kit.

Static HTML, CSS and JS. No build step, no framework, no dependencies.
Deployed on GitHub Pages.

## Layout

```
index.html              the whole site, one page
assets/css/site.css     layout and brand system
assets/css/estimator.css  price estimator styles
assets/js/estimator.js  price estimator, PRICING object lives at the top
assets/js/site.js       lazy BookLive iframe loader, footer year
assets/video/           Skinny Dennis promo clips and their posters
assets/img/             photography, mostly by Heavy Glow
CNAME                   custom domain for GitHub Pages
```

## Editing the things that change

**Prices.** `assets/js/estimator.js`, the `PRICING` object at the top. The
`tables.standard` grid is dollars by lineup and hours. `travel[].add` is what
gets added per region, and accepts either a flat number or an object keyed by
lineup when the cost scales with how many people travel. Nothing below the
"machinery" comment needs touching.

**The booking form.** It is the BookLive inquiry form (`pbr-music`), the same
one embedded at patrickbray.com/book-patrick, so enquiries land in the booking
pipeline Patrick already uses. The embed URL and its colour parameters live in
`index.html`; BookLive's iframeResizer is loaded lazily from `site.js` once the
form scrolls into view.

Because it is a cross origin iframe, the estimator cannot prefill it. The
estimator writes its summary into `#bookEstimate` above the form instead, so
the visitor can paste it into the message box.

**Copy.** All of it is in `index.html`, in plain sight.

## Brand

Palette and type are lifted from patrickbray.com so the two sites read as
siblings.

| Token | Value | Use |
| --- | --- | --- |
| rust | `#AB593F` | primary, buttons, accents |
| olive | `#32382A` | ink, dark sections |
| tan | `#B59E8C` | pricing section ground |
| cream | `#CBBBAE` | reserved |
| navy | `#2C3859` | reserved |
| paper | `#F7F3ED` | page background |

Display type is Averia Serif Libre, body is Libre Franklin. Both are Google
Fonts, matching the music site.

## Local preview

```bash
cd ~/events-site && python3 -m http.server 8787
# http://localhost:8787
```

## Deploy

Push to `main`. GitHub Pages serves it. The custom domain needs one DNS record
on patrickbray.com, which is registered at Squarespace:

```
Type: CNAME   Host: events   Data: patrickray007-eng.github.io
```
