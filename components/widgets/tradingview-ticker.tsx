'use client'
import { useEffect, useRef } from 'react'

interface TradingViewTickerProps {
  symbols: string[] // ['JSE:SHP', 'JSE:NPN', etc.]
  theme?: 'light' | 'dark'
}

export function TradingViewTicker({ 
  symbols, 
  theme = 'light' 
}: TradingViewTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || symbols.length === 0) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: symbols.map(symbol => ({
        proName: symbol,
        title: symbol.split(':')[1] // Extract ticker from JSE:TICKER
      })),
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en'
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbols, theme])

  return (
    <div className="tradingview-widget-container">
      <div ref={containerRef} id="tradingview_ticker" />
    </div>
  )
}