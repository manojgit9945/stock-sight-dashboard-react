
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchCorrelationMatrix, CorrelationData } from "@/lib/api";
import { toast } from "sonner";

interface CorrelationContextType {
  correlationData: CorrelationData | null;
  loadingCorrelation: boolean;
  timeRange: number;
  setTimeRange: (minutes: number) => void;
  refreshCorrelation: () => void;
}

const CorrelationContext = createContext<CorrelationContextType | undefined>(undefined);

export const CorrelationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [loadingCorrelation, setLoadingCorrelation] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<number>(60); // Default to 60 minutes

  const loadCorrelationData = async () => {
    setLoadingCorrelation(true);
    const response = await fetchCorrelationMatrix(timeRange);
    
    if (response.error) {
      toast.error("Failed to load correlation data");
      setLoadingCorrelation(false);
      return;
    }
    
    if (response.data) {
      setCorrelationData(response.data);
    }
    
    setLoadingCorrelation(false);
  };

  // Load correlation data when time range changes
  useEffect(() => {
    loadCorrelationData();
  }, [timeRange]);

  const refreshCorrelation = () => {
    loadCorrelationData();
  };

  return (
    <CorrelationContext.Provider
      value={{
        correlationData,
        loadingCorrelation,
        timeRange,
        setTimeRange,
        refreshCorrelation
      }}
    >
      {children}
    </CorrelationContext.Provider>
  );
};

export const useCorrelation = (): CorrelationContextType => {
  const context = useContext(CorrelationContext);
  if (context === undefined) {
    throw new Error("useCorrelation must be used within a CorrelationProvider");
  }
  return context;
};
