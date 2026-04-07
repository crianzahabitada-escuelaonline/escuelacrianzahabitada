import { User, Mail, Bell, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Perfil() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Mi Perfil</h1>

      <div className="organic-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
          🌻
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground text-lg">María García</h2>
          <p className="text-sm text-muted-foreground">maria@ejemplo.com</p>
          <p className="text-xs text-muted-foreground mt-1">Miembro desde Enero 2026</p>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { icon: User, label: "Editar Perfil", desc: "Nombre, foto y datos personales" },
          { icon: Mail, label: "Notificaciones Email", desc: "Gestiona tus preferencias de correo" },
          { icon: Bell, label: "Notificaciones", desc: "Alertas de cursos y eventos" },
          { icon: Shield, label: "Privacidad y Seguridad", desc: "Contraseña y configuración de cuenta" },
        ].map((item) => (
          <div key={item.label} className="organic-card p-4 flex items-center gap-4 cursor-pointer">
            <div className="p-2 rounded-xl bg-muted">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
        <LogOut className="h-4 w-4" /> Cerrar Sesión
      </Button>
    </div>
  );
}
