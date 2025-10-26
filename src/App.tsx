import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DentistProvider } from "./contexts/DentistContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Dentists from "./pages/Dentists";
import Appointments from "./pages/Appointments";
import Finances from "./pages/Finances";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import History from "./pages/History";
import Schedules from "./pages/Schedules";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DentistProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />
              <Route path="/dentists" element={<ProtectedRoute><Layout><Dentists /></Layout></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><Layout><Appointments /></Layout></ProtectedRoute>} />
              <Route path="/finances" element={<ProtectedRoute><Layout><Finances /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
              <Route path="/schedules" element={<ProtectedRoute><Layout><Schedules /></Layout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DentistProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
