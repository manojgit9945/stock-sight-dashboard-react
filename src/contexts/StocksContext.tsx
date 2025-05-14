
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  fetchAllStocks, 
  Stock, 
  StockPrice, 
  fetchStockPrices, 
  calculateStatistics 
} from "@/lib/api";
import { toast } from "sonner";

interface StocksContextType {
  stocks: Stock[];
  loadingStocks: boolean;
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
  stockPrices: StockPrice | null;
  loadingPrices: boolean;
  timeRange: number;
  setTimeRange: (minutes: number) => void;
  refreshData: () => void;
}

const StocksContext = createContext<StocksContextType | undefined>(undefined);

export const StocksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockPrices, setStockPrices] = useState<StockPrice | null>(null);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<number>(60); // Default to 60 minutes

  const loadStocks = async () => {
    setLoadingStocks(true);
    const response = await fetchAllStocks();
    
    if (response.error) {
      toast.error("Failed to load stocks");
      setLoadingStocks(false);
      return;
    }
    
    if (response.data) {
      setStocks(response.data);
      // Auto-select the first stock if none is selected
      if (response.data.length > 0 && !selectedStock) {
        setSelectedStock(response.data[0]);
      }
    }
    
    setLoadingStocks(false);
  };

  const loadStockPrices = async () => {
    if (!selectedStock) return;
    
    setLoadingPrices(true);
    const response = await fetchStockPrices(selectedStock.id, timeRange);
    
    if (response.error) {
      toast.error(`Failed to load price data for ${selectedStock.symbol}`);
      setLoadingPrices(false);
      return;
    }
    
    if (response.data) {
      // Enhance data with statistics
      const { average, standardDeviation } = calculateStatistics(response.data.prices);
      const enhancedData = {
        ...response.data,
        average,
        standardDeviation
      };
      setStockPrices(enhancedData);
    }
    
    setLoadingPrices(false);
  };

  // Load initial stocks data
  useEffect(() => {
    loadStocks();
  }, []);

  // Load price data when selected stock or time range changes
  useEffect(() => {
    if (selectedStock) {
      loadStockPrices();
    }
  }, [selectedStock, timeRange]);

  const refreshData = () => {
    loadStocks();
    if (selectedStock) {
      loadStockPrices();
    }
  };

  return (
    <StocksContext.Provider
      value={{
        stocks,
        loadingStocks,
        selectedStock,
        setSelectedStock,
        stockPrices,
        loadingPrices,
        timeRange,
        setTimeRange,
        refreshData
      }}
    >
      {children}
    </StocksContext.Provider>
  );
};

export const useStocks = (): StocksContextType => {
  const context = useContext(StocksContext);
  if (context === undefined) {
    throw new Error("useStocks must be used within a StocksProvider");
  }
  return context;
};
