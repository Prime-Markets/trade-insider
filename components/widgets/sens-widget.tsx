'use client'
import { useState, useEffect } from 'react'
import { JSEStock } from '../../lib/utils/jse-detector'

interface SENSAnnouncement {
  id: string
  ticker: string
  headline: string
  datetime: string
  category: string
  url?: string
  summary?: string
}

interface SENSResponse {
  sensSummary: SENSAnnouncement[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

interface SENSWidgetProps {
  stock: JSEStock
  theme?: 'light' | 'dark'
  limit?: number
}

function getCurrentMonthDateRange() {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

function formatDateTime(datetime: string): string {
  const date = new Date(datetime)
  return date.toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRelativeTime(datetime: string): string {
  const date = new Date(datetime)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

export function SENSWidget({ stock, theme = 'light', limit = 20 }: SENSWidgetProps) {
  const [announcements, setAnnouncements] = useState<SENSAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSENS() {
      try {
        setLoading(true)
        setError(null)
        
        const { startDate, endDate } = getCurrentMonthDateRange()
        const url = `https://api.sharenet.co.za/api/v1/px2/sens/summary/${stock.ticker}?startDate=${startDate}&endDate=${endDate}&sort=datetime%20DESC&page=1&limit=${limit}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch SENS data: ${response.status}`)
        }
        
        const data: SENSResponse = await response.json()
        console.log('SENS data:', data)
        setAnnouncements(data.sensSummary || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SENS data')
        console.error('SENS fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (stock?.ticker) {
      fetchSENS()
    }
  }, [stock?.ticker, limit])

  const isDark = theme === 'dark'

  if (loading) {
    return (
      <div className={`sens-widget p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="animate-pulse">
          <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/4 mb-4`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-3">
              <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-2`}></div>
              <div className={`h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2`}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`sens-widget p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
        <p className="text-sm">Failed to load SENS announcements: {error}</p>
      </div>
    )
  }

  if (!stock?.ticker) {
    return (
      <div className={`sens-widget p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p className="text-sm">No stock ticker provided.</p>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className={`sens-widget p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p className="text-sm">No SENS announcements found for {stock.ticker} this month.</p>
      </div>
    )
  }

  return (
    <div className={`sens-widget rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          SENS Announcements - {stock.name} ({stock.ticker})
        </h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} this month
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {announcements.map((announcement, index) => (
          <div 
            key={announcement.id || `announcement-${index}`}
            className={`p-4 border-b last:border-b-0 transition-colors ${
              isDark 
                ? 'border-gray-700 hover:bg-gray-700' 
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h5 className={`font-medium text-sm leading-tight mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {announcement.headline}
                </h5>
                
                {announcement.summary && (
                  <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} 
                     style={{
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical',
                       overflow: 'hidden'
                     }}>
                    {announcement.summary}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDateTime(announcement.datetime)}
                  </span>
                  <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getRelativeTime(announcement.datetime)}
                  </span>
                  {announcement.category && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isDark 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {announcement.category}
                    </span>
                  )}
                </div>
              </div>
              
              {announcement.url && (
                <a
                  href={announcement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-shrink-0 text-xs px-2 py-1 rounded border transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  View
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}