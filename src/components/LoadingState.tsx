
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  type?: "chart" | "heatmap";
}

const LoadingState: React.FC<LoadingStateProps> = ({ type = "chart" }) => {
  if (type === "chart") {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[350px] w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  
  // Heatmap loading state
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-[400px] w-full" />
      <div className="flex justify-center">
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

export default LoadingState;
