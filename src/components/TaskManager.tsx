import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle, Circle, Upload, FileText } from "lucide-react";
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

type Student = { id: string; full_name: string };
type Task = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_by: string | null;
};

interface TaskManagerProps {
  students: Student[];
  tasks: Task[];
  onTasksChanged: () => void;
  readOnly?: boolean;
}

type FormData = {
  title: string;
  description: string;
  student_id: string;
  due_date: string;
};

const emptyForm: FormData = { title: "", description: "", student_id: "", due_date: "" };

export default function TaskManager({ students, tasks, onTasksChanged, readOnly = false }: TaskManagerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStudent, setFilterStudent] = useState<string>("all");

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      student_id: task.student_id,
      due_date: task.due_date || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.student_id) {
      toast.error("Completá el título y seleccioná un estudiante");
      return;
    }
    if (form.title.length > 200) {
      toast.error("El título no puede superar los 200 caracteres");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("student_tasks")
          .update({
            title: form.title.trim(),
            description: form.description.trim() || null,
            student_id: form.student_id,
            due_date: form.due_date || null,
          })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Tarea actualizada");
      } else {
        const { error } = await supabase.from("student_tasks").insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          student_id: form.student_id,
          due_date: form.due_date || null,
          created_by: user?.id,
        });
        if (error) throw error;
        toast.success("Tarea creada");
      }
      setOpen(false);
      onTasksChanged();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar la tarea");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    const { error } = await supabase
      .from("student_tasks")
      .update({ status: newStatus })
      .eq("id", task.id);
    if (error) {
      toast.error("No se pudo actualizar el estado");
      return;
    }
    onTasksChanged();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("student_tasks").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar la tarea");
      return;
    }
    toast.success("Tarea eliminada");
    onTasksChanged();
  };

  const studentName = (id: string) => students.find((s) => s.id === id)?.full_name || "—";

  const filtered = filterStudent === "all" ? tasks : tasks.filter((t) => t.student_id === filterStudent);
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    if (a.due_date) return -1;
    return 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-heading font-bold text-foreground">
          {readOnly ? "Mis Tareas Asignadas" : "Gestión de Tareas"}
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!readOnly && students.length > 1 && (
            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                <SelectValue placeholder="Filtrar estudiante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!readOnly && (
            <Button size="sm" onClick={openNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Nueva
            </Button>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="organic-card p-6 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{readOnly ? "No tenés tareas asignadas por el momento." : "No hay tareas. ¡Creá una para empezar!"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <div
              key={task.id}
              className={`organic-card p-4 flex items-start gap-3 transition-opacity ${task.status === "completed" ? "opacity-60" : ""}`}
            >
              <button
                onClick={() => toggleStatus(task)}
                className="mt-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors"
                aria-label={task.status === "completed" ? "Marcar como pendiente" : "Marcar como completada"}
              >
                {task.status === "completed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-foreground text-sm ${task.status === "completed" ? "line-through" : ""}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {studentName(task.student_id)}
                  {task.due_date ? ` · Entrega: ${new Date(task.due_date).toLocaleDateString("es")}` : ""}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>
              {!readOnly && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Editar tarea">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" aria-label="Eliminar tarea">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog — only for teachers */}
      {!readOnly && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">{editingId ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground">Estudiante *</label>
                <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccioná un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Título *</label>
                <Input
                  className="mt-1"
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Leer capítulo 3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Textarea
                  className="mt-1"
                  maxLength={1000}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalles opcionales de la tarea…"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Fecha de entrega</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando…" : editingId ? "Guardar" : "Crear"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
