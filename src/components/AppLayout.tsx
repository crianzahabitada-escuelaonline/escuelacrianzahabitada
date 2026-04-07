import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Home,
  Library,
  Menu,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import logoMain from "@/assets/logo-crianza-habitada.png";
import logoPaola from "@/assets/logo-paola-patricelli.jpg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/cursos", icon: BookOpen, label: "Mis Cursos" },
  { to: "/ebooks", icon: Library, label: "E-books" },
  { to: "/comunidad", icon: MessageCircle, label: "Comunidad" },
  { to: "/calendario", icon: Calendar, label: "Calendario" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b">
        <div className="flex items-center gap-2">
          <img src={logoMain} alt="Crianza Habitada" className="h-10 w-auto" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden lg:flex flex-col items-center gap-2 px-6 py-4">
          <img src={logoMain} alt="Crianza Habitada" className="h-16 w-auto" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mb-3">
          <div className="p-3 rounded-2xl bg-secondary text-center">
            <img src={logoPaola} alt="Paola Patricelli" className="h-14 w-auto mx-auto mb-2 rounded-lg" />
            <p className="text-xs text-muted-foreground">Creadora</p>
            <p className="text-xs font-medium text-secondary-foreground">Lic. Paola Patricelli</p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
