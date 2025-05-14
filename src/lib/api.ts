
import { toast } from "sonner";

export const API_BASE_URL = "https://test-server.com/api"; // Replace with actual API endpoint

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
  timestamp: string;
  price: number;
}

export interface StockPrice {
  stockId: string;
  symbol: string;
  prices: PricePoint[];
  average?: number;
  standardDeviation?: number;
}

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

// Register and get a token
export const registerAndGetToken = async (): Promise<boolean> => {
  try {
    // This is a mock implementation - replace with actual registration logic
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        name: "Stock Price App",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to register");
    }

    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Failed to connect to API server");
    return false;
  }
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
      const registered = await registerAndGetToken();
      if (!registered) {
        return { error: "Authentication failed" };
      }
    }
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`,
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Token expired or invalid
    if (response.status === 401) {
      const registered = await registerAndGetToken();
      if (registered) {
        return apiRequest(endpoint, method, body);
      } else {
        return { error: "Authentication failed" };
      }
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API request error:", error);
    return { error: String(error) };
  }
};

// API functions
export const fetchAllStocks = async (): Promise<ApiResponse<Stock[]>> => {
  return apiRequest<Stock[]>("/stocks");
};

export const fetchStockPrices = async (
  stockId: string, 
  minutes: number
): Promise<ApiResponse<StockPrice>> => {
  return apiRequest<StockPrice>(`/stocks/${stockId}/prices?minutes=${minutes}`);
};

export const fetchCorrelationMatrix = async (
  minutes: number
): Promise<ApiResponse<CorrelationData>> => {
  return apiRequest<CorrelationData>(`/correlation?minutes=${minutes}`);
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
