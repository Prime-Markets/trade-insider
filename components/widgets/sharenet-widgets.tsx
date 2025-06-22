'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Volume2, DollarSign, BarChart3, RefreshCw } from 'lucide-react';

// Types
interface TimeSeriesData {
  date: string;
  fullDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface MarketData {
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  open: number;
  previousClose: number;
  // Additional quote data
  bid?: number;
  offer?: number;
  bidVol?: number;
  offerVol?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  earningsYield?: number;
  vwap?: number;
  high52Week?: number;
  low52Week?: number;
  tradingStatus?: string;
  sector?: string;
  fullName?: string;
  percentageMove1Week?: number;
  percentageMove1Month?: number;
  percentageMove1Year?: number;
  deals?: number;
  value?: number;
}

interface JSEStock {
  ticker: string;
  name: string;
  tradingViewSymbol: string;
}

interface SharenetChartProps {
  stock: JSEStock;
  theme?: 'light' | 'dark';
  height?: number;
  showTimeframes?: boolean;
}

interface SharenetMarketDataProps {
  stock: JSEStock;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

const formatPrice = (value: number) => `R${value.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `R${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `R${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `R${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `R${(num / 1e3).toFixed(1)}K`;
    return `R${num.toFixed(2)}`;
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

// Sharenet Chart Component
export function SharenetChart({ 
  stock, 
  theme = 'light', 
  height = 400, 
  showTimeframes = true 
}: SharenetChartProps) {
  const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1Y');

  const fetchTimeSeriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.sharenet.co.za/api/v1/px2/timeseries/${stock.ticker}?exchange=JSE&interval=interday&numOfDays=365`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.timeSeries && data.timeSeries.length > 0) {
        const formattedData = data.timeSeries.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: item.date,
          open: item.open / 100,
          high: item.high / 100,
          low: item.low / 100,
          close: item.close / 100,
          volume: item.volume,
          change: 0,
          changePercent: 0
        })).reverse();

        for (let i = 1; i < formattedData.length; i++) {
          formattedData[i].change = formattedData[i].close - formattedData[i-1].close;
          formattedData[i].changePercent = (formattedData[i].change / formattedData[i-1].close) * 100;
        }

        setChartData(formattedData);
      } else {
        throw new Error('No data available for this stock');
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stock.ticker) {
      fetchTimeSeriesData();
    }
  }, [stock.ticker]);

  const getFilteredData = () => {
    if (!chartData.length) return [];
    
    const days: Record<string, number> = {
      '1D': 1,
      '5D': 5,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };
    
    const numDays = days[timeframe] || 30;
    return chartData.slice(-numDays);
  };

  const formatPrice = (value: number) => `R${value.toFixed(2)}`;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const mutedTextColor = isDark ? 'text-gray-300' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`flex items-center justify-center rounded-lg ${bgColor} ${borderColor} border`} style={{ height }}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin" size={20} />
          <span className={mutedTextColor}>Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-lg ${bgColor} ${borderColor} border`} style={{ height }}>
        <div className="text-center">
          <Activity className="mx-auto mb-2 text-red-500" size={32} />
          <p className={`font-semibold ${textColor}`}>Chart Unavailable</p>
          <p className={`text-sm ${mutedTextColor}`}>{error}</p>
          <button 
            onClick={fetchTimeSeriesData}
            className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const latest = chartData[chartData.length - 1];
  const isPositive = latest?.change >= 0;

  return (
    <div className={`rounded-xl  ${bgColor} ${borderColor} border`}>
      <div className={`p-4 border-b ${borderColor}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`text-lg font-semibold ${textColor}`}>
            {stock.name} ({stock.ticker})
          </h3>
          {showTimeframes && (
            <div className="flex space-x-1">
              {['1D', '5D', '1M', '3M', '6M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {latest && (
          <div className="flex items-center space-x-3">
            <span className={`text-2xl font-bold ${textColor}`}>
              {formatPrice(latest.close)}
            </span>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-semibold text-sm">
                {formatPrice(Math.abs(latest.change))} ({Math.abs(latest.changePercent).toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={height - 120}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
            <XAxis 
              dataKey="date" 
              stroke={isDark ? '#9ca3af' : '#666'}
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#666'}
              fontSize={11}
              tickLine={false}
              tickFormatter={formatPrice}
            />
            <Tooltip 
              formatter={(value: number) => [formatPrice(value), 'Close Price']}
              labelStyle={{ color: isDark ? '#f3f4f6' : '#666' }}
              contentStyle={{ 
                backgroundColor: isDark ? '#1f2937' : '#fff', 
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, 
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={false}
              name="Close Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SharenetMarketData({ 
  stock, 
  theme = 'light', 
  compact = false 
}: SharenetMarketDataProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.sharenet.co.za/api/v1/px2/marketdata/quote/JSE?ticker=${stock.ticker}&type=advanced&includerefdata=true`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.quote || !Array.isArray(data.quote) || data.quote.length === 0) {
        throw new Error('No quote data available for this stock');
      }
      
      const quote = data.quote[0]; 
      const currentPrice = quote.lastPrice / 100; 
      const change = quote.move / 100; 
      const changePercent = quote.percentageMove;
      const previousPrice = quote.previousDaysClose / 100;
      
      setMarketData({
        currentPrice,
        change,
        changePercent,
        high: quote.dailyHigh / 100,
        low: quote.dailyLow / 100,
        volume: quote.volume,
        open: quote.open / 100,
        previousClose: previousPrice,
        bid: quote.bid / 100,
        offer: quote.offer / 100,
        bidVol: quote.bidVol,
        offerVol: quote.offerVol,
        marketCap: quote.marketCap,
        peRatio: quote.peRatio,
        dividendYield: quote.dy,
        earningsYield: quote.ey,
        vwap: quote.vwap / 100,
        high52Week: quote.high12m / 100,
        low52Week: quote.low12m / 100,
        tradingStatus: quote.tradingStatus,
        sector: quote.sector,
        fullName: quote.fullName,
        percentageMove1Week: quote.percentageMove1Week,
        percentageMove1Month: quote.percentageMove1Month,
        percentageMove1Year: quote.percentageMove1Year,
        deals: quote.deals,
        value: quote.value
      });
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stock.ticker) {
      fetchMarketData();
    }
  }, [stock.ticker]);

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `R${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `R${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `R${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `R${(num / 1e3).toFixed(1)}K`;
    return `R${num.toFixed(2)}`;
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const mutedTextColor = isDark ? 'text-gray-300' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`${bgColor} rounded-xl shadow-lg border ${borderColor} p-4`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin" size={16} />
          <span className={mutedTextColor}>Loading market data...</span>
        </div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className={`${bgColor} rounded-xl shadow-lg border ${borderColor} p-4`}>
        <div className="text-center">
          <p className={`text-sm ${mutedTextColor}`}>Market data unavailable</p>
          <button 
            onClick={fetchMarketData}
            className="mt-1 text-xs text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPositive = marketData.change >= 0;

  if (compact) {
    return (
      <div className={`${bgColor} rounded-lg border ${borderColor} p-3`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className={`font-semibold ${textColor}`}>
              {formatPrice(marketData.currentPrice)}
            </div>
            <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatPrice(marketData.change)} ({marketData.changePercent.toFixed(2)}%)
            </div>
          </div>
          <div className={`text-right text-sm ${mutedTextColor}`}>
            <div>Vol: {formatVolume(marketData.volume)}</div>
            <div>H: {formatPrice(marketData.high)} L: {formatPrice(marketData.low)}</div>
          </div>
        </div>
        
        {marketData.tradingStatus && (
          <div className={`text-xs px-2 py-1 rounded ${
            marketData.tradingStatus === 'Market Close' 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          }`}>
            {marketData.tradingStatus}
          </div>
        )}
        
        {(marketData.percentageMove1Week !== undefined || marketData.percentageMove1Month !== undefined) && (
          <div className={`text-xs mt-2 ${mutedTextColor}`}>
            {marketData.percentageMove1Week !== undefined && (
              <span className="mr-3">1W: {formatPercentage(marketData.percentageMove1Week)}</span>
            )}
            {marketData.percentageMove1Month !== undefined && (
              <span>1M: {formatPercentage(marketData.percentageMove1Month)}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${bgColor} rounded-xl  w-full border ${borderColor}`}>
      <div className={`p-4 border-b ${borderColor}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${textColor} flex items-center`}>
            <BarChart3 className="mr-2" size={20} />
            Market Data - {stock.name} ({stock.ticker})
          </h3>
          {marketData.tradingStatus && (
            <div className={`text-xs px-2 py-1 rounded ${
              marketData.tradingStatus === 'Market Close' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            }`}>
              {marketData.tradingStatus}
            </div>
          )}
        </div>
        {marketData.sector && (
          <p className={`text-sm ${mutedTextColor} mt-1`}>{marketData.sector}</p>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${textColor}`}>Current Price</h4>
              <p className={`text-sm ${mutedTextColor}`}>Last traded price</p>
            </div>
            <div className="text-right">
              <div className={`text-lg font-semibold ${textColor}`}>
                {formatPrice(marketData.currentPrice)}
              </div>
              <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{formatPrice(marketData.change)} ({marketData.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${textColor}`}>Daily Range</h4>
              <p className={`text-sm ${mutedTextColor}`}>Today's high and low</p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${textColor}`}>
                High: {formatPrice(marketData.high)}
              </div>
              <div className={`text-sm ${textColor}`}>
                Low: {formatPrice(marketData.low)}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${textColor}`}>Trading Activity</h4>
              <p className={`text-sm ${mutedTextColor}`}>
                {marketData.deals ? `${marketData.deals.toLocaleString()} deals today` : 'Volume and deals'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${textColor}`}>
                Volume: {formatVolume(marketData.volume)}
              </div>
              {marketData.value && (
                <div className={`text-sm ${textColor}`}>
                  Value: {formatLargeNumber(marketData.value)}
                </div>
              )}
            </div>
          </div>
        </div>
        {(marketData.bid || marketData.offer) && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${textColor}`}>Order Book</h4>
                <p className={`text-sm ${mutedTextColor}`}>Current bid and offer prices</p>
              </div>
              <div className="text-right">
                {marketData.bid && (
                  <div className={`text-sm ${textColor}`}>
                    Bid: {formatPrice(marketData.bid)}
                    {marketData.bidVol && <span className={`ml-1 ${mutedTextColor}`}>({marketData.bidVol})</span>}
                  </div>
                )}
                {marketData.offer && (
                  <div className={`text-sm ${textColor}`}>
                    Offer: {formatPrice(marketData.offer)}
                    {marketData.offerVol && <span className={`ml-1 ${mutedTextColor}`}>({marketData.offerVol})</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {(marketData.high52Week || marketData.low52Week) && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${textColor}`}>52-Week Range</h4>
                <p className={`text-sm ${mutedTextColor}`}>Annual high and low prices</p>
              </div>
              <div className="text-right">
                {marketData.high52Week && (
                  <div className={`text-sm ${textColor}`}>
                    High: {formatPrice(marketData.high52Week)}
                  </div>
                )}
                {marketData.low52Week && (
                  <div className={`text-sm ${textColor}`}>
                    Low: {formatPrice(marketData.low52Week)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {(marketData.peRatio || marketData.dividendYield || marketData.earningsYield) && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${textColor}`}>Financial Metrics</h4>
                <p className={`text-sm ${mutedTextColor}`}>Key financial ratios</p>
              </div>
              <div className="text-right space-y-1">
                {marketData.peRatio && (
                  <div className={`text-sm ${textColor}`}>
                    P/E: {marketData.peRatio.toFixed(2)}
                  </div>
                )}
                {marketData.dividendYield && (
                  <div className={`text-sm ${textColor}`}>
                    Div Yield: {marketData.dividendYield.toFixed(2)}%
                  </div>
                )}
                {marketData.earningsYield && (
                  <div className={`text-sm ${textColor}`}>
                    Earnings Yield: {marketData.earningsYield.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {marketData.marketCap && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${textColor}`}>Market Capitalization</h4>
                <p className={`text-sm ${mutedTextColor}`}>Total market value</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${textColor}`}>
                  {formatLargeNumber(marketData.marketCap)}
                </div>
              </div>
            </div>
          </div>
        )}
        {(marketData.percentageMove1Week !== undefined || 
          marketData.percentageMove1Month !== undefined || 
          marketData.percentageMove1Year !== undefined) && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${textColor}`}>Performance</h4>
                <p className={`text-sm ${mutedTextColor}`}>Price movement over time</p>
              </div>
              <div className="text-right space-y-1">
                {marketData.percentageMove1Week !== undefined && (
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-sm ${mutedTextColor}`}>1 Week:</span>
                    <span className={`text-sm font-medium ${
                      marketData.percentageMove1Week >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(marketData.percentageMove1Week)}
                    </span>
                  </div>
                )}
                {marketData.percentageMove1Month !== undefined && (
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-sm ${mutedTextColor}`}>1 Month:</span>
                    <span className={`text-sm font-medium ${
                      marketData.percentageMove1Month >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(marketData.percentageMove1Month)}
                    </span>
                  </div>
                )}
                {marketData.percentageMove1Year !== undefined && (
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-sm ${mutedTextColor}`}>1 Year:</span>
                    <span className={`text-sm font-medium ${
                      marketData.percentageMove1Year >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(marketData.percentageMove1Year)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {marketData.vwap && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${textColor}`}>VWAP</h4>
                <p className={`text-sm ${mutedTextColor}`}>Volume weighted average price</p>
              </div>
              <div className="text-right">
                <div className={`text-sm ${textColor}`}>
                  {formatPrice(marketData.vwap)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={`p-4 border-t ${borderColor} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between text-xs">
          <span className={mutedTextColor}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}