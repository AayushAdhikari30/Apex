'use client'
import { useEffect, useCallback, useRef } from 'react'
import useApexStore from '@/store/apexStore'

export function useLiveData() {
  const { setPrices, setMacro, updatePositionPrices, checkAlerts, checkFunnelTriggers, setLastSync } = useApexStore()
  const timerRef = useRef(null)

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/prices', { cache: 'no-store' })
      if (!res.ok) throw new Error('Price fetch failed')
      const data = await res.json()

      const prices = {
        BTC: { p: data.BTC.p, c: data.BTC.c },
        ETH: { p: data.ETH.p, c: data.ETH.c },
        XAU: { p: data.XAU.p, c: data.XAU.c },
        SPY: { p: data.SPY.p, c: data.SPY.c },
        VIX: { p: data.VIX.p, c: 0 },
        TNX: { p: data.TNX.p, c: 0 },
        DXY: { p: data.DXY.p, c: 0 },
      }

      setPrices(prices)
      updatePositionPrices(prices)

      // Update macro with live VIX / rates
      setMacro({
        rate: data.TNX.p,
        vix: data.VIX.p,
        dxy: data.DXY.p,
      })

      checkAlerts()
      checkFunnelTriggers()
      setLastSync(new Date().toISOString())
    } catch (err) {
      console.error('[useLiveData] fetch error:', err)
    }
  }, [setPrices, setMacro, updatePositionPrices, checkAlerts, checkFunnelTriggers, setLastSync])

  useEffect(() => {
    fetchPrices()
    timerRef.current = setInterval(fetchPrices, 60000)
    return () => clearInterval(timerRef.current)
  }, [fetchPrices])

  return { refetch: fetchPrices }
}
