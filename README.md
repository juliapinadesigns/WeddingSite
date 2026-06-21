# Julia & Louis — Wedding Website

A clean, static wedding site. No build step — just HTML, CSS, and a little JS.

## Structure
- `index.html` — Home (built)
- `schedule.html`, `story.html`, `travel.html`, `faq.html`, `gallery.html`, `rsvp.html` — placeholder pages, ready to build out
- `css/style.css` — all styles + the Provence color palette (CSS variables at the top)
- `js/main.js` — nav, scroll reveals, hero parallax, countdown
- `assets/` — drop `hero.jpg` here for the hero background

## Editing the basics
- **Names / date / location:** edit the text in `index.html` (the `.reveal` section).
- **Countdown:** change `data-date` on `#countdownGrid` in `index.html` (format `YYYY-MM-DDTHH:MM:SS`).
- **Colors:** edit the variables under `:root` in `css/style.css`.
- **Hero photo:** add `assets/hero.jpg`, then uncomment the `background-image` line in the `.hero__media` rule.

## Run locally
Open `index.html` in a browser, or:
```
python3 -m http.server 8000
```
then visit http://localhost:8000

## Deploy to Vercel
Import the repo in Vercel — it auto-detects a static site, no config needed.
