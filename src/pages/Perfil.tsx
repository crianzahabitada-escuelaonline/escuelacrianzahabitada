import { useState, useEffect } from "react";
import { User, Mail, Shield, LogOut, ShoppingBag, Download, BookOpen, Loader2, Save, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Profile = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  motivation: string;
  homeschool_experience: string;
  avatar_url: string;
  created_at: string;
};

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
  const { user, signOut } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "",
    motivation: "",
    homeschool_experience: "",
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [{ data: profileData }, { data: purchaseData }] = await Promise.all([
      supabase.from("profiles").select("full_name, email, phone, country, motivation, homeschool_experience, avatar_url, created_at").eq("id", user!.id).single(),
      supabase
        .from("product_purchases")
        .select("id, amount, status, created_at, product_id, digital_products(title, author, cover_url, file_url, product_type)")
        .eq("user_id", user!.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false }),
    ]);
    setProfile(profileData as Profile | null);
    if (profileData) {
      setForm({
        full_name: profileData.full_name || "",
        phone: (profileData as Profile).phone || "",
        country: (profileData as Profile).country || "",
        motivation: (profileData as Profile).motivation || "",
        homeschool_experience: (profileData as Profile).homeschool_experience || "",
      });
    }
    setPurchases((purchaseData as unknown as Purchase[]) || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        country: form.country,
        motivation: form.motivation,
        homeschool_experience: form.homeschool_experience,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Error al guardar: " + error.message);
      return;
    }
    toast.success("Perfil actualizado");
    setEditing(false);
    loadData();
  }

  const displayName = profile?.full_name || user?.email || "Usuario";
  const displayEmail = profile?.email || user?.email || "";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Mi Perfil</h1>

      {/* Profile Card */}
      <div className="organic-card p-6">
        <div className="flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            🌻
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-bold text-foreground text-lg">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
            {memberSince && <p className="text-xs text-muted-foreground mt-1">Miembro desde {memberSince}</p>}
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setEditing(true)}>
              <Edit2 className="h-3 w-3" /> Editar
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label>Nombre completo</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+54 9..." />
              </div>
              <div>
                <Label>País</Label>
                <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Argentina" />
              </div>
            </div>
            <div>
              <Label>Experiencia en homeschool</Label>
              <Input value={form.homeschool_experience} onChange={e => setForm({ ...form, homeschool_experience: e.target.value })} placeholder="Ej: 2 años, recién empezando..." />
            </div>
            <div>
              <Label>Motivación / ¿Por qué elegiste esta escuela?</Label>
              <Textarea value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })} rows={3} placeholder="Contanos qué te trajo aquí..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl gap-1">
                <X className="h-4 w-4" /> Cancelar
              </Button>
            </div>
          </div>
        ) : (
          profile && (profile.phone || profile.country || profile.motivation || profile.homeschool_experience) && (
            <div className="border-t pt-4 space-y-2 text-sm">
              {profile.phone && <p><span className="text-muted-foreground">Teléfono:</span> <span className="text-foreground">{profile.phone}</span></p>}
              {profile.country && <p><span className="text-muted-foreground">País:</span> <span className="text-foreground">{profile.country}</span></p>}
              {profile.homeschool_experience && <p><span className="text-muted-foreground">Experiencia:</span> <span className="text-foreground">{profile.homeschool_experience}</span></p>}
              {profile.motivation && <p><span className="text-muted-foreground">Motivación:</span> <span className="text-foreground">{profile.motivation}</span></p>}
            </div>
          )
        )}
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

      <Button variant="outline" className="rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={signOut}>
        <LogOut className="h-4 w-4" /> Cerrar Sesión
      </Button>
    </div>
  );
}