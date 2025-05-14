
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { initializeToken } from "@/lib/api";

const Index = () => {
  // Initialize the token when the Index page loads
  useEffect(() => {
    initializeToken();
  }, []);
  
  return <Navigate to="/" replace />;
};

export default Index;
