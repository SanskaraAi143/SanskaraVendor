
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loader from "./components/Loader";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import BookingsPage from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import { Suspense, lazy } from "react";

const queryClient = new QueryClient();

// Demo auth state - in a real app, this would come from authentication
const isAuthenticated = false;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes inside MainLayout */}
            <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/services" element={<Dashboard />} /> {/* Placeholder */}
              <Route path="/tasks" element={<Dashboard />} /> {/* Placeholder */}
              <Route path="/staff" element={<Dashboard />} /> {/* Placeholder */}
              <Route path="/notifications" element={<Dashboard />} /> {/* Placeholder */}
              <Route path="/reviews" element={<Dashboard />} /> {/* Placeholder */}
              <Route path="/payments" element={<Dashboard />} /> {/* Placeholder */}
              <Route path="/settings" element={<Dashboard />} /> {/* Placeholder */}
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
