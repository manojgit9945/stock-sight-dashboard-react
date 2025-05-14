
import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartBar, ChartArea } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <h1 className="font-bold text-xl mr-auto flex items-center gap-2">
            <span className="text-finance-teal">Stock</span>
            <span className="text-finance-cyan">Viz</span>
          </h1>

          {/* Navigation */}
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )
              }
            >
              <ChartArea className="h-4 w-4" />
              {!isMobile && <span>Price Charts</span>}
            </NavLink>
            <NavLink
              to="/correlation"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )
              }
            >
              <ChartBar className="h-4 w-4" />
              {!isMobile && <span>Correlation</span>}
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4 md:py-6">
        <Card className="p-4 md:p-6">{children}</Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StockViz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
