import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/user/Dashboard";
import ExamPage from "./pages/user/ExamPage";
import NotFound from "./pages/NotFound";
import UserLayout from "./layouts/UserLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Login />} />

            {/* Student/User Routes inside UserLayout */}
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Full screen pages like ExamPage */}
            <Route path="/exam/:examId" element={<ExamPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
