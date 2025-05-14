
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useStocks } from "@/contexts/StocksContext";
import { Stock } from "@/lib/api";

const StockSelector: React.FC = () => {
  const { stocks, loadingStocks, selectedStock, setSelectedStock } = useStocks();
  
  const handleStockChange = (value: string) => {
    const stock = stocks.find(s => s.id === value);
    if (stock) {
      setSelectedStock(stock);
    }
  };
  
  if (loadingStocks) {
    return <Skeleton className="h-10 w-[180px]" />;
  }
  
  return (
    <Select
      value={selectedStock?.id || ""}
      onValueChange={handleStockChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a stock" />
      </SelectTrigger>
      <SelectContent>
        {stocks.map((stock: Stock) => (
          <SelectItem key={stock.id} value={stock.id}>
            {stock.symbol} - {stock.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StockSelector;
