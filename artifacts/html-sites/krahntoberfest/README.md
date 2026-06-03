# 🍺 Krahntoberfest — Upgraded Website

A single-file, zero-dependency redesign of the Krahntoberfest site. Bavarian-neon
festival vibe with glassmorphism, an animated backdrop, and everything self-contained
in `index.html` (no build step, no frameworks).

## What's inside
- **Animated hero** — glowing title, floating festival emoji, Bavarian diamond backdrop
- **Live countdown** to the event date
- **Schedule** — visual timeline of the day's shenanigans
- **Gallery** — "Hall of Foam" tiles, ready to swap for real photos
- **Games** — Pretzel Frenzy tap game + a confetti "Hype Cannon"
- **RSVP form** — opens a pre-filled email (mailto), so it works with no backend
- Mobile-first, responsive, and respects `prefers-reduced-motion`

## How to edit (look for `[EDIT]` markers in `index.html`)
1. **Event date/time** — top of the `<script>`: `const EVENT = new Date('2026-10-03T14:00:00');`
2. **Date / time / location chips** — in the hero section (`[EDIT]` comments)
3. **Schedule items** — in the `#schedule` timeline
4. **Photos** — drop images in a `photos/` folder and replace each gallery tile's
   emoji with `<img src="photos/your-pic.jpg" alt="...">`
5. **Host email** — search for `thomas@krahnborn.com` (RSVP form + footer)

## Deploy
It's just one HTML file — upload `index.html` (and a `photos/` folder if you add
images) to your host and you're live. Works on GitHub Pages, Netlify, or any
static host as-is.

Prost! 🥨
