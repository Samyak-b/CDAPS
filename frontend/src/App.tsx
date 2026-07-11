import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CityProvider } from "./contexts/CityContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CityDetailModal } from "./components/dashboard/CityDetailModal";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import Prediction from "./pages/Prediction";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Predict from "./pages/Predict";
import CitizenPortal from "./pages/CitizenPortal";
import ReportModeration from "./pages/ReportModeration";
import CitizenLogin from "./pages/CitizenLogin";
import CitizenSignup from "./pages/CitizenSignup";
import Home from "./pages/Home";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CityProvider>
          <CityDetailModal />
          <BrowserRouter>
            <Routes>
              {/* Public Citizen Portal & Auth */}
              <Route path="/citizen" element={<CitizenPortal />} />
              <Route path="/citizen/login" element={<CitizenLogin />} />
              <Route path="/citizen/signup" element={<CitizenSignup />} />

              {/* Admin Auth */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin/Police Dashboard */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/prediction" element={<Prediction />} />
                <Route path="/admin/reports" element={<ReportModeration />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/index" element={<Index />} />
              </Route>

              {/* Default Home portal selector */}
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CityProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
