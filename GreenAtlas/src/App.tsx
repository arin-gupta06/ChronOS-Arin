import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider } from "./context/DashboardContext";
import HomePage from "./pages/HomePage";
import MapModulePage from "./pages/MapModulePage";
import RiskAnalysisPage from "./pages/RiskAnalysisPage";
import EnvironmentalTrendsPage from "./pages/EnvironmentalTrendsPage";
import PollutionInsightsPage from "./pages/PollutionInsightsPage";
import AgriculturalStabilityPage from "./pages/AgriculturalStabilityPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapModulePage />} />
          <Route path="/risk/*" element={<RiskAnalysisPage />} />
          <Route path="/trends/*" element={<EnvironmentalTrendsPage />} />
          <Route path="/pollution/*" element={<PollutionInsightsPage />} />
          <Route
            path="/agriculture/*"
            element={<AgriculturalStabilityPage />}
          />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <BrowserRouter>
        <DashboardProvider>
          <AnimatedRoutes />
        </DashboardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
