import { toast } from "sonner";

// Updated API_BASE_URL to use HTTP instead of HTTPS
export const API_BASE_URL = "http://20.244.56.144/evaluation-service"; 

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Define response types based on API contracts
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector?: string;
}

export interface PricePoint {
  price: number;
  lastUpdatedAt: string;
  timestamp?: string; // Add this as an optional property for internal use
}

export interface StockPrice {
  stockId: string;
  symbol: string;
  prices: PricePoint[];
  average?: number;
  standardDeviation?: number;
}

// Add the CorrelationData interface
export interface CorrelationData {
  matrix: {
    [key: string]: {
      [key: string]: number;
    };
  };
  stockIds: string[];
  symbols: string[];
}

// Token management
const getToken = (): string | null => {
  return localStorage.getItem("api_token");
};

const setToken = (token: string): void => {
  localStorage.setItem("api_token", token);
};

// Use the provided token
export const initializeToken = (): void => {
  // Updated token from the user's request
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MjAzMzYwLCJpYXQiOjE3NDcyMDMwNjAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQxMzczOWQ0LTZmMTItNGMxNy1iYWYzLTEzOTZkZTU3YWM4OCIsInN1YiI6Im1hbm9qMTIzbDI4OEBnbWFpbC5jb20ifSwiZW1haWwiOiJtYW5vajEyM2wyODhAZ21haWwuY29tIiwibmFtZSI6Im1hbm9qIGwiLCJyb2xsTm8iOiJlbmcyMmNzMDU2MSIsImFjY2Vzc0NvZGUiOiJDdnRQY1UiLCJjbGllbnRJRCI6ImQxMzczOWQ0LTZmMTItNGMxNy1iYWYzLTEzOTZkZTU3YWM4OCIsImNsaWVudFNlY3JldCI6Ik1TdGViZHJKd1NydGJTa24ifQ.MZ3jax4IjL6bqxgabqIBKOh9ptpAzTN_RPk9JVZkezY";
  setToken(token);
};

// Generic API request function with authentication
const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: object
): Promise<ApiResponse<T>> => {
  try {
    const token = getToken();
    
    if (!token) {
      initializeToken();
    }
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    };

    const options: RequestInit = { 
      method, 
      headers,
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const apiUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API request to: ${apiUrl}`);
    const response = await fetch(apiUrl, options);
    
    // Token expired or invalid
    if (response.status === 401) {
      initializeToken();
      return apiRequest(endpoint, method, body);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API request error:", error);
    toast.error(`API request failed: ${String(error)}`);
    return { error: String(error) };
  }
};

// Transform the API stock response format to our internal format
const transformStocksResponse = (apiResponse: { stocks: Record<string, string> }): Stock[] => {
  return Object.entries(apiResponse.stocks).map(([name, symbol]) => ({
    id: symbol,
    symbol,
    name,
  }));
};

// Transform the API price response format to our internal format
const transformPriceResponse = (stockId: string, symbol: string, prices: PricePoint[]): StockPrice => {
  return {
    stockId,
    symbol,
    prices: prices.map(price => ({
      price: price.price,
      lastUpdatedAt: price.lastUpdatedAt,
      timestamp: price.lastUpdatedAt, // Map lastUpdatedAt to timestamp for compatibility
    })),
  };
};

// API functions
export const fetchAllStocks = async (): Promise<ApiResponse<Stock[]>> => {
  const response = await apiRequest<{ stocks: Record<string, string> }>("/stocks");
  
  if (response.error) {
    return { error: response.error };
  }
  
  if (response.data) {
    const transformedStocks = transformStocksResponse(response.data);
    return { data: transformedStocks };
  }
  
  return { error: "No data received" };
};

export const fetchStockPrices = async (
  stockId: string, 
  minutes: number
): Promise<ApiResponse<StockPrice>> => {
  const endpoint = minutes 
    ? `/stocks/${stockId}?minutes=${minutes}`
    : `/stocks/${stockId}`;
  
  const response = await apiRequest<PricePoint[] | { stock: PricePoint }>(endpoint);
  
  if (response.error) {
    return { error: response.error };
  }
  
  if (response.data) {
    let prices: PricePoint[] = [];
    
    // Handle both single price point and array of price points
    if (Array.isArray(response.data)) {
      prices = response.data;
    } else if (response.data.stock) {
      // For single price point response
      prices = [response.data.stock];
    }
    
    // Transform prices to match our internal format and calculate statistics
    const transformedPrices = transformPriceResponse(stockId, stockId, prices);
    
    // Calculate statistics on the transformed data
    const { average, standardDeviation } = calculateStatistics(transformedPrices.prices);
    const enhancedData = {
      ...transformedPrices,
      average,
      standardDeviation
    };
    
    return { data: enhancedData };
  }
  
  return { error: "No data received" };
};

// This is a placeholder since the API doesn't provide correlation data directly
// In a real implementation, we would calculate this from the price data of multiple stocks
export const fetchCorrelationMatrix = async (
  minutes: number
): Promise<ApiResponse<CorrelationData>> => {
  // First get all stocks
  const stocksResponse = await fetchAllStocks();
  
  if (stocksResponse.error || !stocksResponse.data) {
    return { error: stocksResponse.error || "Failed to fetch stocks" };
  }
  
  const stocks = stocksResponse.data;
  
  // Then fetch price data for each stock
  const pricePromises = stocks.slice(0, 5).map(stock => 
    fetchStockPrices(stock.symbol, minutes)
  );
  
  try {
    const priceResponses = await Promise.all(pricePromises);
    
    // Filter out any stocks that didn't return price data
    const validPrices = priceResponses
      .filter(response => response.data && response.data.prices && response.data.prices.length > 0)
      .map(response => response.data!);
    
    if (validPrices.length < 2) {
      return { error: "Not enough price data to calculate correlations" };
    }
    
    // Calculate correlation matrix
    const stockIds = validPrices.map(price => price.stockId);
    const symbols = validPrices.map(price => price.symbol);
    
    // Create an empty correlation matrix
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    // Fill the matrix with correlation values
    stockIds.forEach(id1 => {
      matrix[id1] = {};
      stockIds.forEach(id2 => {
        if (id1 === id2) {
          matrix[id1][id2] = 1; // Perfect correlation with self
        } else {
          // Calculate correlation between two stocks
          const stock1 = validPrices.find(p => p.stockId === id1);
          const stock2 = validPrices.find(p => p.stockId === id2);
          
          if (stock1 && stock2) {
            matrix[id1][id2] = calculateCorrelation(stock1.prices, stock2.prices);
          } else {
            matrix[id1][id2] = 0;
          }
        }
      });
    });
    
    return { 
      data: {
        matrix,
        stockIds,
        symbols
      }
    };
  } catch (error) {
    console.error("Error calculating correlation matrix:", error);
    return { error: `Failed to calculate correlation matrix: ${error}` };
  }
};

// Helper function to calculate correlation between two price series
const calculateCorrelation = (prices1: PricePoint[], prices2: PricePoint[]): number => {
  // Ensure we have an equal number of data points by taking the minimum length
  const length = Math.min(prices1.length, prices2.length);
  
  if (length < 2) return 0; // Not enough data points
  
  // Extract just the prices
  const p1 = prices1.slice(0, length).map(p => p.price);
  const p2 = prices2.slice(0, length).map(p => p.price);
  
  // Calculate means
  const mean1 = p1.reduce((sum, val) => sum + val, 0) / length;
  const mean2 = p2.reduce((sum, val) => sum + val, 0) / length;
  
  // Calculate correlation coefficient
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < length; i++) {
    const diff1 = p1[i] - mean1;
    const diff2 = p2[i] - mean2;
    
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }
  
  if (denominator1 === 0 || denominator2 === 0) return 0;
  
  return numerator / Math.sqrt(denominator1 * denominator2);
};

// Calculate statistics from price data
export const calculateStatistics = (prices: PricePoint[]): { average: number; standardDeviation: number } => {
  if (prices.length === 0) {
    return { average: 0, standardDeviation: 0 };
  }

  const priceValues = prices.map(point => point.price);
  const sum = priceValues.reduce((acc, price) => acc + price, 0);
  const average = sum / priceValues.length;
  
  const squaredDiffs = priceValues.map(price => Math.pow(price - average, 2));
  const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / priceValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  return { average, standardDeviation };
};
