# MeraDhobi · Premium Laundry Care Website

A complete, static multi-page website for **MeraDhobi**, a fictional doorstep laundry
service. Built with **HTML5, CSS3 and vanilla JavaScript** (a CSS 3D parallax
hero, Lucide for icons). No frameworks, no build step, no backend.

> **Demo notice:** all prices, references and statistics are sample data for
> demonstration purposes. Nothing is sent to a server.

---

## Running the site

Open `index.html` directly in a browser, or serve the folder (recommended so all
browsers treat assets consistently):

```bash
# any one of these, from the project root
python3 -m http.server 8080
npx serve .
```

Then visit `http://localhost:8080`.

## Pages

| Page                 | Purpose                                        |
|----------------------|------------------------------------------------|
| `index.html`         | Brand story: parallax hero → problem → solution → services → journey → fabrics → route → trust → CTA |
| `services.html`      | Six expandable service cards + add-ons         |
| `how-it-works.html`  | Full scroll-animated roadmap timeline          |
| `pricing.html`       | Demo rate card + live price estimator          |
| `about.html`         | Brand story and values                         |
| `contact.html`       | Contact channels, map visual, FAQ accordion    |
| `booking.html`       | Validated pickup form with demo confirmation   |

## Structure

```
├── index.html … booking.html      7 HTML pages
├── css/
│   ├── style.css                  design tokens, typography, nav/footer, hero
│   ├── components.css             cards, forms, calculator, roadmap, FAQ…
│   ├── animations.css             reveals, marquee, reduced-motion overrides
│   └── responsive.css             breakpoints: 1024 / 768 / 520 px
├── js/
│   ├── main.js                    shared bootstrap (year stamp)
│   ├── navigation.js              sticky header, mobile drawer, active link
│   ├── animations.js              IntersectionObserver reveals, parallax, hero transition
│   ├── cards.js                   service + fabric card expansion, FAQ accordion
│   ├── roadmap.js                 strip auto-advance + SVG path scroll drawing
│   ├── pricing.js                 price estimator
│   └── booking.js                 form validation + demo confirmation
└── assets/
    └── images/                    photography + the hero shirt cut-out
```

## The hero (CSS 3D parallax)

The hero is built with CSS `perspective` rather than WebGL. The headline is
pushed deep into the scene and the shirt cut-out floats in front of it:

- **Depth:** `perspective: 1px` on `.hero` is a deliberately shallow camera, so a
  `translateZ(-1px)` plane projects to half size; the headline carries
  `translateZ(-1px) scale(2)` to restore its design size while sitting *behind*
  the shirt (`translateZ(0)`), which the browser then occludes correctly.
- **Overlap:** a negative top margin of half a headline line lowers the shirt so
  its collar covers the lower half of the final line only.
- **Parallax:** `animations.js` moves the bubbles, headline and shirt at three
  different rates on scroll, and nudges the shirt toward the pointer; offsets are
  passed as CSS custom properties so CSS keeps ownership of the depth transform.
- **CTAs:** the two hero buttons sit either side of the shirt and fade in once
  25% of the viewport has been scrolled.
- **Bubbles:** animated with a single `bubble-rise` keyframe; per-bubble position,
  size, duration and delay come from inline custom properties.

## Accessibility & motion

- Semantic landmarks, skip link, visible focus states, keyboard-operable cards,
  roadmap titles and FAQ.
- `prefers-reduced-motion` disables reveals, parallax, marquee and bubbles, and
  reveals the hero CTAs outright instead of leaving them scroll-gated.

## Credits

- Fonts: [Manrope](https://fonts.google.com/specimen/Manrope),
  [Fraunces](https://fonts.google.com/specimen/Fraunces) (Google Fonts, OFL).
- Icons: inline SVG paths (Lucide icon shapes, ISC license) drawn directly in markup,
  no runtime dependency required beyond the optional CDN script.
- Problem-section photography (Flickr, sourced via the Openverse API):
  "Clothes Peg" by Sean MacEntee (CC BY 2.0),
  "laundry night" by ginnerobot (CC BY-SA 2.0),
  "folds, mumbai" by nevil zaveri (CC BY 2.0).

