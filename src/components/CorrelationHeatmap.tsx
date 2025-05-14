
import React, { useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { CorrelationData } from "@/lib/api";
import LoadingState from "@/components/LoadingState";

interface CorrelationHeatmapProps {
  data: CorrelationData | null;
  loading: boolean;
}

interface HeatmapPoint {
  x: number;
  y: number;
  z: number; // correlation value
  xSymbol: string;
  ySymbol: string;
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data, loading }) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapPoint | null>(null);

  if (loading) {
    return <LoadingState type="heatmap" />;
  }

  if (!data || !data.matrix || Object.keys(data.matrix).length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No correlation data available</p>
      </div>
    );
  }

  // Transform the correlation matrix into a format suitable for the heatmap
  const heatmapData: HeatmapPoint[] = [];
  const { matrix, symbols } = data;

  Object.keys(matrix).forEach((stockId1, index1) => {
    Object.keys(matrix[stockId1]).forEach((stockId2, index2) => {
      heatmapData.push({
        x: index1,
        y: index2,
        z: matrix[stockId1][stockId2],
        xSymbol: symbols[index1] || stockId1,
        ySymbol: symbols[index2] || stockId2,
      });
    });
  });

  // Get color based on correlation value
  const getColor = (value: number): string => {
    if (value >= 0.8) return "#6FFFE9"; // Strong positive: cyan
    if (value >= 0.5) return "#5BC0BE"; // Moderate positive: teal
    if (value >= 0.2) return "#3A506B"; // Weak positive: dark blue
    if (value >= -0.2) return "#555555"; // No correlation: gray
    if (value >= -0.5) return "#9E2A2B"; // Weak negative: light red
    if (value >= -0.8) return "#D90429"; // Moderate negative: red
    return "#9D0208"; // Strong negative: dark red
  };

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-2 bg-card/90 backdrop-blur border shadow-lg">
          <CardContent className="p-2 text-sm">
            <p className="font-semibold">
              {data.xSymbol} vs {data.ySymbol}
            </p>
            <p className="text-primary font-medium">
              Correlation: {data.z.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 10, right: 0, bottom: 40, left: 40 }}
          >
            <XAxis
              type="number"
              dataKey="x"
              name="x"
              tickCount={symbols.length}
              ticks={[...Array(symbols.length).keys()]}
              tickFormatter={(value) => symbols[value] || ""}
              angle={-45}
              textAnchor="end"
              height={40}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="y"
              tickCount={symbols.length}
              ticks={[...Array(symbols.length).keys()]}
              tickFormatter={(value) => symbols[value] || ""}
            />
            <ZAxis type="number" dataKey="z" range={[100, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={heatmapData}
              shape="square"
            >
              {heatmapData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.z)}
                  onMouseEnter={() => setHoveredCell(entry)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Color legend */}
      <div className="flex flex-col items-center space-y-2">
        <p className="text-sm font-medium">Correlation Strength</p>
        <div className="flex w-3/4 h-4 rounded-md overflow-hidden">
          <div
            className="flex-1 h-full bg-gradient-to-r from-[#9D0208] via-[#555555] to-[#6FFFE9]"
            style={{ height: "100%" }}
          ></div>
        </div>
        <div className="flex w-3/4 justify-between">
          <span className="text-xs">-1.0</span>
          <span className="text-xs">-0.5</span>
          <span className="text-xs">0</span>
          <span className="text-xs">+0.5</span>
          <span className="text-xs">+1.0</span>
        </div>
      </div>

      {/* Display details of hovered cell */}
      {hoveredCell && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">
              {hoveredCell.xSymbol} vs {hoveredCell.ySymbol}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Correlation</p>
                <p className="text-xl font-bold">{hoveredCell.z.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strength</p>
                <p className="text-xl font-bold">
                  {Math.abs(hoveredCell.z) >= 0.8
                    ? "Strong"
                    : Math.abs(hoveredCell.z) >= 0.5
                    ? "Moderate"
                    : Math.abs(hoveredCell.z) >= 0.2
                    ? "Weak"
                    : "No correlation"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CorrelationHeatmap;
