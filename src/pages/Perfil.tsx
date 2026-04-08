import { useState, useEffect } from "react";
import { User, Mail, Bell, Shield, LogOut, ShoppingBag, Download, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Purchase = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_id: string;
  digital_products: {
    title: string;
    author: string | null;
    cover_url: string | null;
    file_url: string | null;
    product_type: string;
  } | null;
};

export default function Perfil() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; email: string; created_at: string } | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [{ data: profileData }, { data: purchaseData }] = await Promise.all([
      supabase.from("profiles").select("full_name, email, created_at").eq("id", user!.id).single(),
      supabase
        .from("product_purchases")
        .select("id, amount, status, created_at, product_id, digital_products(title, author, cover_url, file_url, product_type)")
        .eq("user_id", user!.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false }),
    ]);
    setProfile(profileData);
    setPurchases((purchaseData as unknown as Purchase[]) || []);
    setLoading(false);
  }

  const displayName = profile?.full_name || user?.email || "Usuario";
  const displayEmail = profile?.email || user?.email || "";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Mi Perfil</h1>

      <div className="organic-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
          🌻
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground text-lg">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{displayEmail}</p>
          {memberSince && <p className="text-xs text-muted-foreground mt-1">Miembro desde {memberSince}</p>}
        </div>
      </div>

      {/* Mis Compras */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">Mis Compras</h2>
        </div>

        {loading ? (
          <div className="organic-card p-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="organic-card p-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aún no tenés compras. Visitá la <a href="/ebooks" className="text-primary underline">tienda</a> para explorar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map((p) => {
              const prod = p.digital_products;
              return (
                <div key={p.id} className="organic-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    {prod?.cover_url ? (
                      <img src={prod.cover_url} alt={prod.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{prod?.title || "Producto"}</p>
                    <p className="text-xs text-muted-foreground">
                      {prod?.product_type === "libro" ? "Libro" : "Guía"} · USD ${p.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  {prod?.file_url ? (
                    <a href={prod.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="rounded-xl gap-1">
                        <Download className="h-4 w-4" /> Descargar
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Próximamente</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
