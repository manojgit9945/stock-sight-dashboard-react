
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { StockPrice } from "@/lib/api";
import LoadingState from "@/components/LoadingState";

interface StockPriceChartProps {
  data: StockPrice | null;
  loading: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-2 bg-card/90 backdrop-blur border shadow-lg">
        <CardContent className="p-2 text-sm">
          <p className="font-semibold">
            {format(new Date(label), "MMM d, yyyy HH:mm:ss")}
          </p>
          <p className="text-primary font-medium">
            Price: ${Number(payload[0].value).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const formatYAxis = (value: number) => {
  return `$${value.toFixed(2)}`;
};

const StockPriceChart: React.FC<StockPriceChartProps> = ({ data, loading }) => {
  if (loading) {
    return <LoadingState type="chart" />;
  }

  if (!data || !data.prices || data.prices.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No price data available</p>
      </div>
    );
  }

  // Transform price data for the chart
  const chartData = data.prices.map((point) => ({
    timestamp: point.timestamp || point.lastUpdatedAt, // Use timestamp if available, otherwise lastUpdatedAt
    price: point.price,
  }));

  // Format labels for x-axis
  const formatXAxis = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm");
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#76767620" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#76767680"
          />
          <YAxis
            tickFormatter={formatYAxis}
            domain={["auto", "auto"]}
            stroke="#76767680"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#5BC0BE"
            strokeWidth={2}
            dot={false}
            animationDuration={500}
          />
          {data.average && (
            <ReferenceLine
              y={data.average}
              stroke="#FF6B6B"
              strokeDasharray="3 3"
              label={{
                position: "right",
                value: `Avg: $${data.average.toFixed(2)}`,
                fill: "#FF6B6B",
                fontSize: 12,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockPriceChart;
