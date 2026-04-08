import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Cursos from "@/pages/Cursos";
import CursoDetalle from "@/pages/CursoDetalle";
import Ebooks from "@/pages/Ebooks";
import Comunidad from "@/pages/Comunidad";
import Calendario from "@/pages/Calendario";
import Perfil from "@/pages/Perfil";
import Auth from "@/pages/Auth";
import Membresia from "@/pages/Membresia";
import AdminCursos from "@/pages/AdminCursos";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            {/* Protected app pages */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/cursos" element={<AppLayout><Cursos /></AppLayout>} />
            <Route path="/cursos/:id" element={<AppLayout><CursoDetalle /></AppLayout>} />
            <Route path="/ebooks" element={<AppLayout><Ebooks /></AppLayout>} />
            <Route path="/comunidad" element={<ProtectedRoute><AppLayout><Comunidad /></AppLayout></ProtectedRoute>} />
            <Route path="/calendario" element={<AppLayout><Calendario /></AppLayout>} />
            <Route path="/perfil" element={<ProtectedRoute><AppLayout><Perfil /></AppLayout></ProtectedRoute>} />
            <Route path="/membresia" element={<ProtectedRoute><AppLayout><Membresia /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AppLayout><AdminCursos /></AppLayout></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
