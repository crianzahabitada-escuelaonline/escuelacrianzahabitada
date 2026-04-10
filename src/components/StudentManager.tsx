import { useState, useEffect } from "react";
import { Plus, Pencil, UserPlus, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type Student = {
  id: string;
  full_name: string;
  age: number | null;
  date_of_birth: string | null;
  languages: string | null;
  previous_education: string | null;
  special_needs: string | null;
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
};

interface StudentManagerProps {
  students: Student[];
  onStudentsChanged: () => void;
}

type FormData = {
  full_name: string;
  age: string;
  date_of_birth: string;
  languages: string;
  previous_education: string;
  special_needs: string;
  tutor_id: string;
};

const emptyForm: FormData = {
  full_name: "",
  age: "",
  date_of_birth: "",
  languages: "",
  previous_education: "",
  special_needs: "",
  tutor_id: "",
};

export default function StudentManager({ students, onStudentsChanged }: StudentManagerProps) {
  const { user, isAdmin, isTeacher } = useAuth();
  const canManage = isAdmin || isTeacher;
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkTutorId, setBulkTutorId] = useState("");

  // Load profiles for admin tutor selection
  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name")
      .then(({ data }) => {
        if (data) setProfiles(data);
      });
  }, [isAdmin]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, tutor_id: isAdmin ? "" : user!.id });
    setBulkMode(false);
    setOpen(true);
  };

  const openBulk = () => {
    setBulkMode(true);
    setBulkText("");
    setBulkTutorId("");
    setOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingId(s.id);
    setBulkMode(false);
    setForm({
      full_name: s.full_name,
      age: s.age?.toString() || "",
      date_of_birth: s.date_of_birth || "",
      languages: s.languages || "",
      previous_education: s.previous_education || "",
      special_needs: s.special_needs || "",
      tutor_id: "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const tutorId = isAdmin && form.tutor_id ? form.tutor_id : user!.id;
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        age: form.age ? parseInt(form.age) : null,
        date_of_birth: form.date_of_birth || null,
        languages: form.languages.trim() || null,
        previous_education: form.previous_education.trim() || null,
        special_needs: form.special_needs.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Estudiante actualizado");
      } else {
        const { error } = await supabase.from("students").insert({
          ...payload,
          tutor_id: tutorId,
        });
        if (error) throw error;
        toast.success("Estudiante agregado");
      }
      setOpen(false);
      onStudentsChanged();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async () => {
    const lines = bulkText
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error("Ingresá al menos un nombre");
      return;
    }
    const tutorId = isAdmin && bulkTutorId ? bulkTutorId : user!.id;
    setSaving(true);
    try {
      const rows = lines.map(name => ({
        full_name: name,
        tutor_id: tutorId,
      }));
      const { error } = await supabase.from("students").insert(rows);
      if (error) throw error;
      toast.success(`${lines.length} estudiante(s) agregado(s)`);
      setOpen(false);
      onStudentsChanged();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás segura de eliminar a "${name}"? Se eliminarán también sus tareas y notas.`)) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar: " + error.message);
      return;
    }
    toast.success("Estudiante eliminado");
    onStudentsChanged();
  };

  const tutorLabel = (p: Profile) =>
    p.full_name ? `${p.full_name} (${p.email})` : p.email;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-heading font-bold text-foreground">Mis Estudiantes</h2>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={openBulk}>
              <Users className="h-4 w-4 mr-1" /> Carga rápida
            </Button>
          )}
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="organic-card p-8 text-center">
          <UserPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No hay estudiantes registrados.</p>
          <Button size="sm" variant="outline" onClick={openNew} className="mt-3">
            Agregar primer estudiante
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map(student => (
            <div key={student.id} className="organic-card p-4 flex items-center gap-4">
              <div className="p-2 rounded-xl bg-sage/20">
                <UserPlus className="h-5 w-5 text-sage-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{student.full_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {student.age ? `${student.age} años` : ""}
                  {student.languages ? ` · ${student.languages}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(student)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Editar estudiante"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(student.id, student.full_name)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                  aria-label="Eliminar estudiante"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {bulkMode
                ? "Carga Rápida de Estudiantes"
                : editingId
                ? "Editar Estudiante"
                : "Agregar Estudiante"}
            </DialogTitle>
          </DialogHeader>

          {bulkMode ? (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Escribí un nombre por línea para agregar varios estudiantes a la vez.
              </p>
              {isAdmin && profiles.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground">Asignar a tutor/familia</label>
                  <Select value={bulkTutorId} onValueChange={setBulkTutorId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar tutor…" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {tutorLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Nombres (uno por línea)</label>
                <Textarea
                  className="mt-1"
                  rows={6}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={"María García\nJuan Pérez\nLucía López"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bulkText.split("\n").filter(l => l.trim()).length} estudiante(s)
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleBulkSave} disabled={saving}>
                  {saving ? "Guardando…" : "Agregar todos"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {isAdmin && !editingId && profiles.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground">Asignar a tutor/familia</label>
                  <Select value={form.tutor_id} onValueChange={v => setForm({ ...form, tutor_id: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar tutor…" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {tutorLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Nombre completo *</label>
                <Input
                  className="mt-1"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Nombre del estudiante"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Edad</label>
                  <Input
                    type="number"
                    className="mt-1"
                    min={1}
                    max={18}
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    placeholder="Ej: 8"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha de nacimiento</label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={form.date_of_birth}
                    onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Idiomas</label>
                <Input
                  className="mt-1"
                  value={form.languages}
                  onChange={e => setForm({ ...form, languages: e.target.value })}
                  placeholder="Ej: Español, Inglés"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Educación previa</label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={form.previous_education}
                  onChange={e => setForm({ ...form, previous_education: e.target.value })}
                  placeholder="Descripción breve…"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Necesidades especiales</label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={form.special_needs}
                  onChange={e => setForm({ ...form, special_needs: e.target.value })}
                  placeholder="Opcional…"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando…" : editingId ? "Guardar" : "Agregar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
