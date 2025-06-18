'use client'

import { useMemo } from 'react'
import { detectJSEStocks, shouldShowJSEWidgets, JSEStock } from '../../lib/utils/jse-detector'
import { TradingViewChart } from './tradingview-chart'
import { TradingViewCompanyProfile } from './tradingview-company-profile'
import { SENSWidget } from './sens-widget'
import { SharenetChart, SharenetMarketData } from './sharenet-widgets'

interface JSEWidgetSectionProps {
  content: string
  theme?: 'light' | 'dark'
}

export function JSEWidgetSection({ content, theme = 'light' }: JSEWidgetSectionProps) {
  const detectedStocks = useMemo(() => detectJSEStocks(content), [content])
  const showWidgets = useMemo(() => shouldShowJSEWidgets(content), [content])
 
  if (!showWidgets && detectedStocks.length === 0) {
    return null
  }
 
  const primaryStock = detectedStocks[0]
 
  return (
    <div className="jse-widgets-section mt-6 space-y-6">
      <div className="border-t pt-6">
        {primaryStock && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-1 mb-6">
              <div className="lg:col-span-2">
                <SharenetChart
                  stock={primaryStock}
                  theme={theme}
                  height={400}
                  showTimeframes={true}
                />
              </div>

              <div className="space-y-4 mt-3">
                <div>
                  <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Market Statistics
                  </h4>
                  <SharenetMarketData
                    stock={primaryStock}
                    theme={theme}
                    compact={false}
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                Technical Analysis - TradingView
              </h4>
              <TradingViewChart
                symbol={primaryStock.tradingViewSymbol}
                theme={theme}
                height={400}
              />
            </div>
            <div className="mb-6">
              <SENSWidget
                stock={primaryStock}
                theme={theme}
                limit={10}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}