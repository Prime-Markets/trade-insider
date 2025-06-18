import { getSearchSchemaForModel } from '@/lib/schema/search'
import { tool } from 'ai'

/**
 * Creates an image search tool with the appropriate schema for the model.
 */
export function createImageSearchTool(fullModel: string) {
  return tool({
    description: 'Search for images related to trading, financial markets, charts, and market analysis',
    parameters: getSearchSchemaForModel(fullModel),
    execute: async ({ query }) => {
      try {
        const response = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            q: `${query} ${getCurrentDateFilter()}`,
            num: 10, // Limit to 10 images for better performance
            safe: 'active', // Enable safe search for professional content
            tbs: 'qdr:m', // Filter for images from the past month
            gl: 'us' // Geographic location for better results
          })
        })
        
        if (!response.ok) {
          throw new Error(`Image search API error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Filter and enhance results for trading/financial context
        if (data.images) {
          data.images = data.images.map((image: any) => ({
            ...image,
            // Add relevance scoring for financial content
            isFinancialContent: isFinanciallyRelevant(image.title, image.snippet),
            // Clean up title and snippet for better display
            displayTitle: cleanTitle(image.title),
            displaySnippet: cleanSnippet(image.snippet)
          }))
          
          // Sort by financial relevance
          data.images.sort((a: any, b: any) => {
            if (a.isFinancialContent && !b.isFinancialContent) return -1
            if (!a.isFinancialContent && b.isFinancialContent) return 1
            return 0
          })
        }
        
        return data
      } catch (error) {
        console.error('Image Search API error:', error)
        return {
          error: 'Failed to search for images',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  })
}

/**
 * Helper function to get current date filter for fresh market data
 */
function getCurrentDateFilter(): string {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  return `${currentYear} ${currentMonth} current price latest`
}

/**
 * Helper function to determine if an image is financially relevant
 */
function isFinanciallyRelevant(title: string = '', snippet: string = ''): boolean {
  const financialKeywords = [
    'stock', 'chart', 'trading', 'market', 'financial', 'investment', 'crypto',
    'forex', 'currency', 'analysis', 'price', 'graph', 'trend', 'NYSE', 'NASDAQ',
    'JSE', 'bitcoin', 'ethereum', 'earnings', 'portfolio', 'technical', 'fundamental',
    'candlestick', 'moving average', 'RSI', 'MACD', 'support', 'resistance',
    'bull', 'bear', 'dividend', 'revenue', 'profit', 'loss', 'sector', 'index'
  ]
  
  const text = `${title} ${snippet}`.toLowerCase()
  return financialKeywords.some(keyword => text.includes(keyword))
}

/**
 * Helper function to clean up image titles
 */
function cleanTitle(title: string = ''): string {
  if (!title) return 'Financial Chart'
  
  // Remove common unwanted suffixes and prefixes
  return title
    .replace(/\s*-\s*(Getty Images|Shutterstock|iStock|Adobe Stock).*$/i, '')
    .replace(/^(Image of|Picture of|Photo of)\s*/i, '')
    .trim()
}

/**
 * Helper function to clean up image snippets
 */
function cleanSnippet(snippet: string = ''): string {
  if (!snippet) return 'Market analysis visualization'
  
  // Clean up common snippet issues
  return snippet
    .replace(/\s*\.\.\.\s*$/, '')
    .replace(/^\s*\.\.\.\s*/, '')
    .trim()
}

// Default export for backward compatibility, using a default model
export const imageSearchTool = createImageSearchTool('openai:gpt-4o-mini')