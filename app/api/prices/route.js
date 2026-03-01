// app/api/prices/route.js
// Fetches BTC, ETH from CoinGecko and Gold from ExchangeRate-API
// Falls back to simulated data if APIs are unavailable

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchCrypto() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 0 }, headers: { Accept: 'application/json' } }
    )
    if (!res.ok) throw new Error('CoinGecko error')
    const data = await res.json()
    return {
      BTC: { p: data.bitcoin?.usd || 0, c: data.bitcoin?.usd_24h_change || 0 },
      ETH: { p: data.ethereum?.usd || 0, c: data.ethereum?.usd_24h_change || 0 },
    }
  } catch {
    return null
  }
}

async function fetchGold() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error('ExchangeRate error')
    const data = await res.json()
    if (data.rates?.XAU) {
      const price = 1 / data.rates.XAU
      return { XAU: { p: price, c: 0 } }
    }
    return null
  } catch {
    return null
  }
}

export async function GET() {
  const [crypto, gold] = await Promise.all([fetchCrypto(), fetchGold()])

  const now = Date.now()
  const result = {
    BTC: crypto?.BTC || { p: 97000 + (Math.random() - 0.5) * 2000, c: (Math.random() - 0.5) * 4 },
    ETH: crypto?.ETH || { p: 3200 + (Math.random() - 0.5) * 200, c: (Math.random() - 0.5) * 5 },
    XAU: gold?.XAU || { p: 2975 + (Math.random() - 0.5) * 30, c: (Math.random() - 0.5) * 0.5 },
    // Simulated macro data (in production, connect to FRED / Alpha Vantage)
    VIX: { p: parseFloat((16 + Math.random() * 8).toFixed(1)), c: 0 },
    TNX: { p: parseFloat((4.2 + (Math.random() - 0.5) * 0.3).toFixed(2)), c: 0 },
    DXY: { p: parseFloat((103 + (Math.random() - 0.5) * 1).toFixed(1)), c: 0 },
    SPY: { p: parseFloat((548 + (Math.random() - 0.5) * 10).toFixed(2)), c: (Math.random() - 0.5) * 0.8 },
    timestamp: now,
    sources: {
      BTC: crypto ? 'coingecko' : 'simulated',
      ETH: crypto ? 'coingecko' : 'simulated',
      XAU: gold ? 'exchangerate-api' : 'simulated',
      VIX: 'simulated',
      TNX: 'simulated',
      DXY: 'simulated',
    },
  }

  return Response.json(result)
}
