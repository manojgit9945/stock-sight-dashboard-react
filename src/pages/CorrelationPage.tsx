
import React from "react";
import { Button } from "@/components/ui/button";
import { useCorrelation } from "@/contexts/CorrelationContext";
import Layout from "@/components/Layout";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import { ArrowUp } from "lucide-react";

const CorrelationPage: React.FC = () => {
  const { correlationData, loadingCorrelation, timeRange, setTimeRange, refreshCorrelation } = useCorrelation();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Stock Correlation Heatmap</h2>
            <p className="text-sm text-muted-foreground">
              Visualize the correlation between different stocks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <Button variant="outline" size="icon" onClick={refreshCorrelation}>
              <ArrowUp className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        </div>

        {/* Heatmap */}
        <CorrelationHeatmap data={correlationData} loading={loadingCorrelation} />
      </div>
    </Layout>
  );
};

export default CorrelationPage;
