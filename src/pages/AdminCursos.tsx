import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Eye, EyeOff, Users, BookOpen } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  content_url: string;
  category: string;
  is_published: boolean;
  created_at: string;
};

export default function AdminCursos() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general", content_url: "", cover_url: "" });
  const [saving, setSaving] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [subCount, setSubCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      loadCourses();
      loadStats();
    }
  }, [isAdmin]);

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses((data as Course[]) || []);
    setLoading(false);
  }

  async function loadStats() {
    const { count: sc } = await supabase.from("students").select("*", { count: "exact", head: true });
    const { count: sub } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
    setStudentCount(sc || 0);
    setSubCount(sub || 0);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("courses").insert({
      title: form.title,
      description: form.description,
      category: form.category,
      content_url: form.content_url,
      cover_url: form.cover_url,
      is_published: false,
    });
    setSaving(false);
    if (error) {
      toast.error("Error al crear curso: " + error.message);
    } else {
      toast.success("Curso creado exitosamente");
      setForm({ title: "", description: "", category: "general", content_url: "", cover_url: "" });
      setShowForm(false);
      loadCourses();
    }
  }

  async function togglePublish(course: Course) {
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    loadCourses();
    toast.success(course.is_published ? "Curso despublicado" : "Curso publicado");
  }

  async function deleteCourse(id: string) {
    if (!confirm("¿Estás segura de eliminar este curso?")) return;
    await supabase.from("courses").delete().eq("id", id);
    loadCourses();
    toast.success("Curso eliminado");
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">No tienes acceso a esta sección.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Gestiona cursos, estudiantes y membresías</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="organic-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-2xl font-heading font-bold text-foreground">{courses.length}</p>
            <p className="text-sm text-muted-foreground">Cursos</p>
          </div>
        </div>
        <div className="organic-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sage/20"><Users className="h-5 w-5 text-sage-foreground" /></div>
          <div>
            <p className="text-2xl font-heading font-bold text-foreground">{studentCount}</p>
            <p className="text-sm text-muted-foreground">Estudiantes</p>
          </div>
        </div>
        <div className="organic-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-terracotta/20"><Users className="h-5 w-5 text-terracotta-foreground" /></div>
          <div>
            <p className="text-2xl font-heading font-bold text-foreground">{subCount}</p>
            <p className="text-sm text-muted-foreground">Suscriptores Activos</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Nuevo Curso
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="organic-card p-6 space-y-4">
          <h3 className="font-heading font-bold text-foreground">Crear Nuevo Curso</h3>
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoría</Label>
              <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div>
              <Label>URL del contenido</Label>
              <Input value={form.content_url} onChange={e => setForm({...form, content_url: e.target.value})} placeholder="Link al video/contenido" />
            </div>
          </div>
          <div>
            <Label>URL de portada</Label>
            <Input value={form.cover_url} onChange={e => setForm({...form, cover_url: e.target.value})} placeholder="Link a la imagen de portada" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="rounded-xl">{saving ? "Guardando..." : "Crear Curso"}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancelar</Button>
          </div>
        </form>
      )}

      {/* Course list */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground">No hay cursos aún. ¡Crea el primero!</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="organic-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{course.description || "Sin descripción"}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${course.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {course.is_published ? "Publicado" : "Borrador"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => togglePublish(course)} className="rounded-xl gap-1">
                  {course.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {course.is_published ? "Ocultar" : "Publicar"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)} className="rounded-xl gap-1">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
