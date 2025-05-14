
import React from "react";
import { Button } from "@/components/ui/button";
import { useStocks } from "@/contexts/StocksContext";
import Layout from "@/components/Layout";
import StockSelector from "@/components/StockSelector";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import StockPriceChart from "@/components/StockPriceChart";
import StockStats from "@/components/StockStats";
import { ArrowUp } from "lucide-react";

const StockPricePage: React.FC = () => {
  const {
    selectedStock,
    stockPrices,
    loadingPrices,
    timeRange,
    setTimeRange,
    refreshData,
  } = useStocks();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Stock Price Chart</h2>
            <p className="text-sm text-muted-foreground">
              {selectedStock
                ? `${selectedStock.symbol} - ${selectedStock.name}`
                : "Select a stock to view price data"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StockSelector />
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <Button variant="outline" size="icon" onClick={refreshData}>
              <ArrowUp className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        </div>

        {/* Chart */}
        <StockPriceChart data={stockPrices} loading={loadingPrices} />

        {/* Stats */}
        <StockStats data={stockPrices} />
      </div>
    </Layout>
  );
};

export default StockPricePage;
