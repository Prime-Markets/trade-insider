export interface JSEStock {
  ticker: string
  name: string
  tradingViewSymbol: string
}

interface APIStockData {
  tickerCode: string;
  tickerName: string;
  tickerId: number;
  tickerFullName: string;
  assetType: string;
  sectorName: string;
  exchangeCode: string;
  sectorGroup: string;
  sectorGroupId: number;
}

// Start with default stocks as fallback
export let JSE_STOCKS: Record<string, JSEStock> = {
  'NPN': { ticker: 'NPN', name: 'Naspers', tradingViewSymbol: 'JSE:NPN' },
  'PRX': { ticker: 'PRX', name: 'Prosus', tradingViewSymbol: 'JSE:PRX' },
  'SHP': { ticker: 'SHP', name: 'Shoprite', tradingViewSymbol: 'JSE:SHP' },
  'FSR': { ticker: 'FSR', name: 'FirstRand', tradingViewSymbol: 'JSE:FSR' },
  'SBK': { ticker: 'SBK', name: 'Standard Bank', tradingViewSymbol: 'JSE:SBK' },
  'ABG': { ticker: 'ABG', name: 'Absa Group', tradingViewSymbol: 'JSE:ABG' },
  'NED': { ticker: 'NED', name: 'Nedbank', tradingViewSymbol: 'JSE:NED' },
  'AGL': { ticker: 'AGL', name: 'Anglo American', tradingViewSymbol: 'JSE:AGL' },
  'BHP': { ticker: 'BHP', name: 'BHP Group', tradingViewSymbol: 'JSE:BHP' },
  'IMP': { ticker: 'IMP', name: 'Impala Platinum', tradingViewSymbol: 'JSE:IMP' },
  'AMS': { ticker: 'AMS', name: 'Anglo American Platinum', tradingViewSymbol: 'JSE:AMS' },
  'SOL': { ticker: 'SOL', name: 'Sasol', tradingViewSymbol: 'JSE:SOL' },
  'MTN': { ticker: 'MTN', name: 'MTN Group', tradingViewSymbol: 'JSE:MTN' },
  'VOD': { ticker: 'VOD', name: 'Vodacom', tradingViewSymbol: 'JSE:VOD' },
  'WHL': { ticker: 'WHL', name: 'Woolworths', tradingViewSymbol: 'JSE:WHL' },
  'PIK': { ticker: 'PIK', name: 'Pick n Pay', tradingViewSymbol: 'JSE:PIK' },
  'TKG': { ticker: 'TKG', name: 'Telkom', tradingViewSymbol: 'JSE:TKG' },
  'REM': { ticker: 'REM', name: 'Remgro', tradingViewSymbol: 'JSE:REM' },
  'INL': { ticker: 'INL', name: 'Investec', tradingViewSymbol: 'JSE:INL' },
  'CFR': { ticker: 'CFR', name: 'Financiere Richemont', tradingViewSymbol: 'JSE:CFR' }
}

// Function to fetch and update JSE_STOCKS
async function updateJSEStocks(): Promise<void> {
  try {
    const response = await fetch('https://api.sharenet.co.za/api/v1/px2/reference/tickers/JSE?limit=2000');
    const data = await response.json();
    
    const newStocks: Record<string, JSEStock> = {};
    
    Object.values(data.ticker).forEach((stock: any) => {
      const stockData = stock as APIStockData;
      
      if (stockData.assetType === 'STOCK') {
        newStocks[stockData.tickerCode] = {
          ticker: stockData.tickerCode,
          name: stockData.tickerFullName || stockData.tickerName,
          tradingViewSymbol: `JSE:${stockData.tickerCode}`
        };
      }
    });
    
    // Update the global JSE_STOCKS variable
    JSE_STOCKS = newStocks;
    console.log(`Updated JSE_STOCKS with ${Object.keys(newStocks).length} stocks`);
    
  } catch (error) {
    console.error('Error fetching JSE stocks, keeping existing data:', error);
  }
}

updateJSEStocks();

let updateInterval: NodeJS.Timeout | null = null;

export function startPeriodicUpdates(intervalHours: number = 24): void {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  updateInterval = setInterval(() => {
    updateJSEStocks();
  }, intervalHours * 60 * 60 * 1000);
}

export function stopPeriodicUpdates(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

export { updateJSEStocks };

export function detectJSEStocks(text: string): JSEStock[] {
  const detectedStocks: JSEStock[] = []
  const upperText = text.toUpperCase()
 
  const jsePatterns = [
    /JSE[:\s]+([A-Z]{2,5})/g,
    /\b([A-Z]{2,5})\s+(?:on\s+)?(?:the\s+)?JSE/g,
    /\b([A-Z]{2,5})\s+(?:stock|share|equity)/gi
  ]
 
  for (const pattern of jsePatterns) {
    let match
    while ((match = pattern.exec(upperText)) !== null) {
      const ticker = match[1]
      if (JSE_STOCKS[ticker]) {
        detectedStocks.push(JSE_STOCKS[ticker])
      }
    }
  }
 
  Object.values(JSE_STOCKS).forEach(stock => {
    if (upperText.includes(stock.name.toUpperCase()) ||
        upperText.includes(stock.ticker)) {
      if (!detectedStocks.find(s => s.ticker === stock.ticker)) {
        detectedStocks.push(stock)
      }
    }
  })
 
  return detectedStocks
}

export function shouldShowJSEWidgets(text: string): boolean {
  const jseKeywords = [
    'JSE', 'johannesburg stock exchange', 'south african market',
    'jse stock', 'jse share', 'jse listed', 'rand', 'ZAR'
  ]
 
  const upperText = text.toUpperCase()
  return jseKeywords.some(keyword => upperText.includes(keyword.toUpperCase())) ||
         detectJSEStocks(text).length > 0
}