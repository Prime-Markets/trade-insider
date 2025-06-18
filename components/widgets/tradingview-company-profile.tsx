'use client'
import { useEffect, useRef } from 'react'

interface TradingViewCompanyProfileProps {
  symbol: string
  theme?: 'light' | 'dark'
}

export function TradingViewCompanyProfile({ 
  symbol, 
  theme = 'light' 
}: TradingViewCompanyProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: 400,
      symbol: symbol,
      colorTheme: theme,
      isTransparent: false,
      locale: 'en'
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, theme])

  return (
    <div className="tradingview-widget-container">
      <div ref={containerRef} id={`tradingview_profile_${symbol.replace(':', '_')}`} />
    </div>
  )
}