# APEX v3 — Adaptive Portfolio Economics System

A production-grade **Next.js 14** portfolio management system with live market data, risk analytics, and the LCGS three-layer capital framework.

## Features

- 🔐 **Auth** — Register / Sign-in / Demo mode (localStorage-persisted)
- 📊 **Dashboard** — Live KPIs, donut allocation, health score ring
- ⚙️ **Portfolio Engine** — Markov regime, Kelly criterion, CPPI floor
- 📋 **Positions** — Real-time P&L, stop-loss monitoring, funnel triggers
- 🔄 **Profit Funnel** — Mechanical rotation: Spec → Growth → Safe → Cash
- 📉 **Risk & CVaR** — EGARCH volatility, VaR, Sharpe/Sortino/Calmar
- 🌐 **Macro Engine** — 6-signal MRS composite, regime classification
- ⚡ **Stress Tests** — 6 historical scenarios with LCGS advantage analysis
- 🎲 **Monte Carlo** — 1,000 paths, 10-year projection with percentile bands
- 💰 **Tax Engine** — Post-tax CAGR, bracket-aware rotation, TLH opportunities
- 🏆 **Milestones** — Wealth compounding tracker with projections
- 🔔 **Alerts** — Auto-generated system alerts with cooldown logic

## Live Data Sources

| Asset | Source | Fallback |
|-------|--------|----------|
| BTC, ETH | CoinGecko API (free) | Simulated |
| Gold (XAU) | ExchangeRate-API (free) | Simulated |
| VIX, Rates | Simulated (connect FRED for production) | — |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State**: Zustand (persisted to localStorage)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Language**: JavaScript (ES2022+)

---

## Quick Start

### 1. Clone or download this project

```bash
# If starting fresh:
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Or just copy these files into your existing Next.js repo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local — the app works with empty keys (simulated data)
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Push to GitHub (your existing repo)

```bash
# Copy ALL files from this folder into your GitHub repo root, then:

cd your-github-repo

git add .
git commit -m "feat: Add APEX v3 — Adaptive Portfolio Economics System (Next.js rebuild)"
git push origin main
```

### If your repo already has Next.js files

Just merge/replace the following:
- `app/` → entire folder
- `components/` → entire folder
- `hooks/` → entire folder
- `store/` → entire folder
- `tailwind.config.js` → replace
- `next.config.js` → replace (merge if you have custom config)
- `package.json` → merge dependencies

---

## Project Structure

```
apex-v3/
├── app/
│   ├── api/
│   │   └── prices/route.js     ← Live price API (BTC, ETH, Gold)
│   ├── globals.css             ← Global styles + Tailwind
│   ├── layout.js               ← Root layout + metadata
│   └── page.js                 ← Main app entry + router
├── components/
│   ├── auth/
│   │   └── AuthPage.js         ← Login / Register / Demo
│   ├── layout/
│   │   ├── Sidebar.js          ← Navigation sidebar
│   │   ├── Topbar.js           ← Live ticker + actions
│   │   └── StatusBar.js        ← Status + countdown
│   ├── modals/
│   │   └── AddPositionModal.js ← Add position form
│   ├── pages/
│   │   ├── Dashboard.js        ← Main dashboard
│   │   ├── Portfolio.js        ← Engine config + output
│   │   ├── Positions.js        ← Position table + controls
│   │   ├── Risk.js             ← CVaR + EGARCH + matrix
│   │   ├── Macro.js            ← MRS signals + rebalance
│   │   └── OtherPages.js       ← Funnel/Stress/MC/Tax/Milestones/Alerts/Settings
│   └── ui/index.js             ← Reusable UI components
├── hooks/
│   └── useLiveData.js          ← 60s price refresh hook
├── store/
│   └── apexStore.js            ← Zustand state + all logic
├── .env.example                ← Environment template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## Connecting Real APIs (Production)

### FRED (Macro Data — Free)
```js
// In app/api/prices/route.js, add:
const fredRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`)
```

### Alpha Vantage (Stock Prices — Free tier)
```js
const avRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY}`)
```

### Stripe (Billing — for plan upgrades)
```bash
npm install stripe @stripe/stripe-js
# Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
```

---

## License

MIT — Free to use, modify, and deploy.
