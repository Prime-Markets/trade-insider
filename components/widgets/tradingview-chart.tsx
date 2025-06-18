'use client'
import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string // JSE:SHP, JSE:NPN, etc.
  theme?: 'light' | 'dark'
  height?: number
}

export function TradingViewChart({
  symbol,
  theme = 'light',
  height = 400
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Generate unique container ID
    const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
    containerRef.current.id = containerId

    // Clear any existing content
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    
    script.innerHTML = JSON.stringify({
      autosize: false,
      width: '100%',
      height: height,
      symbol: symbol,
      interval: 'D',
      timezone: 'Africa/Johannesburg',
      theme: theme,
      style: '1',
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: containerId
    })

    // Add script loading handler
    script.onload = () => {
      console.log(`TradingView widget loaded for ${symbol}`)
    }

    containerRef.current.appendChild(script)

    // Cleanup function
    return () => {
      if (containerRef.current) {
        // Clear the container completely
        containerRef.current.innerHTML = ''
        
        // Remove any TradingView specific cleanup if needed
        if (widgetRef.current) {
          try {
            // Some TradingView widgets have destroy methods
            if (typeof widgetRef.current.destroy === 'function') {
              widgetRef.current.destroy()
            }
          } catch (error) {
            console.warn('Error destroying TradingView widget:', error)
          }
          widgetRef.current = null
        }
      }
    }
  }, [symbol, theme, height])

  return (
    <div className="tradingview-widget-container">
      <div 
        ref={containerRef} 
        style={{ height: height }}
        className="tradingview-widget"
      />
    </div>
  )
}