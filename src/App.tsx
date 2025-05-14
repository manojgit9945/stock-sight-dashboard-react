
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StocksProvider } from "@/contexts/StocksContext";
import { CorrelationProvider } from "@/contexts/CorrelationContext";
import StockPricePage from "./pages/StockPricePage";
import CorrelationPage from "./pages/CorrelationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StocksProvider>
          <CorrelationProvider>
            <Routes>
              <Route path="/" element={<StockPricePage />} />
              <Route path="/correlation" element={<CorrelationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CorrelationProvider>
        </StocksProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
