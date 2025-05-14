
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StockPrice } from "@/lib/api";

interface StockStatsProps {
  data: StockPrice | null;
}

const StockStats: React.FC<StockStatsProps> = ({ data }) => {
  if (!data) return null;

  const prices = data.prices || [];
  
  let currentPrice = 0;
  let change = 0;
  let changePercent = 0;
  
  if (prices.length > 0) {
    currentPrice = prices[prices.length - 1].price;
    
    if (prices.length > 1) {
      const firstPrice = prices[0].price;
      change = currentPrice - firstPrice;
      changePercent = (change / firstPrice) * 100;
    }
  }
  
  // Define if price is up or down
  const isUp = change >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-1">Current Price</div>
          <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-1">Change</div>
          <div className={`text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
            {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-1">Average</div>
          <div className="text-2xl font-bold">${data.average?.toFixed(2) || 'N/A'}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-1">Standard Deviation</div>
          <div className="text-2xl font-bold">${data.standardDeviation?.toFixed(4) || 'N/A'}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockStats;
