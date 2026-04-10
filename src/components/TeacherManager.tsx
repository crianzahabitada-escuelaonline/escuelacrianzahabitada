import { useState, useEffect } from "react";
import { UserCog, Plus, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Profile = { id: string; full_name: string; email: string };
type TeacherWithProfile = { user_id: string; profile?: Profile };

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTeachers = async () => {
    // Get all users with teacher role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "teacher" as any);

    if (!roles || roles.length === 0) {
      setTeachers([]);
      setLoading(false);
      return;
    }

    const ids = roles.map(r => r.user_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids);

    const merged = roles.map(r => ({
      user_id: r.user_id,
      profile: profs?.find(p => p.id === r.user_id),
    }));
    setTeachers(merged);
    setLoading(false);
  };

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name");
    if (data) setProfiles(data);
  };

  useEffect(() => {
    loadTeachers();
    loadProfiles();
  }, []);

  const handleAdd = async () => {
    if (!selectedUserId) {
      toast.error("Seleccioná un usuario");
      return;
    }
    // Check if already teacher
    if (teachers.some(t => t.user_id === selectedUserId)) {
      toast.error("Este usuario ya es maestro/a");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: selectedUserId,
      role: "teacher" as any,
    });
    setSaving(false);
    if (error) {
      toast.error("Error: " + error.message);
      return;
    }
    toast.success("Maestro/a agregado/a");
    setOpen(false);
    setSelectedUserId("");
    loadTeachers();
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`¿Quitar rol de maestro/a a "${name}"?`)) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "teacher" as any);
    if (error) {
      toast.error("Error: " + error.message);
      return;
    }
    toast.success("Rol removido");
    loadTeachers();
  };

  const label = (p?: Profile) =>
    p ? (p.full_name ? `${p.full_name} (${p.email})` : p.email) : "Usuario desconocido";

  // Filter out users who are already teachers
  const availableProfiles = profiles.filter(
    p => !teachers.some(t => t.user_id === p.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Maestros/as
        </h2>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Agregar Maestro/a
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : teachers.length === 0 ? (
        <div className="organic-card p-8 text-center">
          <UserCog className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No hay maestros registrados.</p>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="mt-3">
            Agregar primer maestro/a
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map(t => (
            <div key={t.user_id} className="organic-card p-4 flex items-center gap-4">
              <div className="p-2 rounded-xl bg-lavender/20">
                <UserCog className="h-5 w-5 text-lavender-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {t.profile?.full_name || "Sin nombre"}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {t.profile?.email || t.user_id}
                </p>
              </div>
              <button
                onClick={() => handleRemove(t.user_id, t.profile?.full_name || t.user_id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                aria-label="Quitar maestro"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Agregar Maestro/a</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Seleccioná un usuario registrado para darle el rol de maestro/a. Podrá gestionar estudiantes y tareas asignados.
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">Usuario</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar usuario…" />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {label(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving ? "Guardando…" : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
