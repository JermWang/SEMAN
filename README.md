# $SEMAN — landing site

A single static site (no build step). Just `index.html`, `styles.css`, `app.js`, and your art in `assets/`.

## 🚀 Go live in 2 minutes (after you launch on pump.fun)

Open **`app.js`** and edit the `CONFIG` block at the very top. That's the only file you need to touch:

| Setting | What to do |
| --- | --- |
| `CONTRACT_ADDRESS` | Paste your pump.fun mint address. The tracker + all links go live instantly. |
| `TWITTER_URL` / `TELEGRAM_URL` | Your real socials. |
| `CREATOR_FEE_RATE` | pump.fun's creator-fee share of volume (`0.0005` = 0.05%). Set to the real rate. |
| `PLEDGE_PERCENT` | % of creator fees pledged to the kids (default `100`). |
| `RAISED_BASELINE_USD` | Starting figure for the counter so it matches reality (e.g. fees already earned). |
| `GOAL_USD` | Fundraising goal shown on the progress bar. |
| `MANUAL_RAISED_USD` | Optional. Set a number here to show a hand-set total instead of the live estimate. |

## How the live tracker works

- Pulls **live market cap, 24h volume, and price** from the free DexScreener API (no key, works straight from the browser).
- The big "pledged to the kids" number **ticks up in real time** = live 24h volume × `CREATOR_FEE_RATE` × `PLEDGE_PERCENT`, accumulated and saved in the browser so it doesn't reset on refresh.
- Before launch (empty `CONTRACT_ADDRESS`) it shows a tidy **pre-launch** state.
- After launch, if the pool isn't indexed yet, it shows **"indexing pool…"** and auto-recovers.

> Want *exact* creator fees instead of a volume-based estimate? Point the tracker at your own tiny JSON endpoint (a backend / Helius query / even a Google Sheet published as JSON) and set `MANUAL_RAISED_USD`, or swap the source inside `fetchStats()`.

## Run locally

```bash
npx serve .
```
Then open the URL it prints.

## Deploy

Drag the folder into **Vercel** or **Netlify**, or push to GitHub and enable **Pages**. It's fully static — no config needed.

## Art

- `assets/seman-art.gif` — the green `$SEMAN` logo (hero + footer)
- `assets/seman-PNG.png` — the swimmer (background + progress bar + face accents)
- `assets/scribble-pfp.png` — mission-section portrait
