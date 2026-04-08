import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Trash2, Eye, EyeOff, Users, BookOpen, CheckCircle, Clock,
  ClipboardList, FileText, ChevronDown, ChevronUp, GraduationCap,
} from "lucide-react";

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

type Student = {
  id: string;
  full_name: string;
  age: number | null;
  tutor_id: string;
  created_at: string;
};

type Task = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
  created_at: string;
};

type Note = {
  id: string;
  student_id: string;
  subject: string;
  content: string;
  grade: number | null;
  created_at: string;
};

export default function AdminCursos() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [subCount, setSubCount] = useState(0);

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", category: "general", content_url: "", cover_url: "" });
  const [savingCourse, setSavingCourse] = useState(false);

  // Task form
  const [taskStudentId, setTaskStudentId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "" });
  const [savingTask, setSavingTask] = useState(false);

  // Note form
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ subject: "", content: "", grade: "" });
  const [savingNote, setSavingNote] = useState(false);

  // Expanded students
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    const [coursesRes, studentsRes, tasksRes, notesRes, subRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("students").select("*").order("full_name"),
      supabase.from("student_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("student_notes").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    ]);
    setCourses((coursesRes.data as Course[]) || []);
    setStudents((studentsRes.data as Student[]) || []);
    setTasks((tasksRes.data as Task[]) || []);
    setNotes((notesRes.data as Note[]) || []);
    setSubCount(subRes.count || 0);
    setLoading(false);
  }

  // ---- Course CRUD ----
  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setSavingCourse(true);
    const { error } = await supabase.from("courses").insert({
      title: courseForm.title,
      description: courseForm.description,
      category: courseForm.category,
      content_url: courseForm.content_url,
      cover_url: courseForm.cover_url,
      is_published: false,
    });
    setSavingCourse(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Curso creado");
    setCourseForm({ title: "", description: "", category: "general", content_url: "", cover_url: "" });
    setShowCourseForm(false);
    loadAll();
  }

  async function togglePublish(course: Course) {
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    loadAll();
    toast.success(course.is_published ? "Curso despublicado" : "Curso publicado");
  }

  async function deleteCourse(id: string) {
    if (!confirm("¿Eliminar este curso?")) return;
    await supabase.from("courses").delete().eq("id", id);
    loadAll();
    toast.success("Curso eliminado");
  }

  // ---- Task CRUD ----
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskStudentId) return;
    setSavingTask(true);
    const { error } = await supabase.from("student_tasks").insert({
      student_id: taskStudentId,
      title: taskForm.title,
      description: taskForm.description,
      due_date: taskForm.due_date || null,
      status: "pending",
    });
    setSavingTask(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Tarea creada");
    setTaskForm({ title: "", description: "", due_date: "" });
    setTaskStudentId(null);
    loadAll();
  }

  async function toggleTaskStatus(task: Task) {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    await supabase.from("student_tasks").update({ status: newStatus }).eq("id", task.id);
    loadAll();
  }

  async function deleteTask(id: string) {
    await supabase.from("student_tasks").delete().eq("id", id);
    loadAll();
    toast.success("Tarea eliminada");
  }

  // ---- Note CRUD ----
  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteStudentId) return;
    setSavingNote(true);
    const { error } = await supabase.from("student_notes").insert({
      student_id: noteStudentId,
      subject: noteForm.subject,
      content: noteForm.content,
      grade: noteForm.grade ? parseFloat(noteForm.grade) : null,
    });
    setSavingNote(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Nota agregada");
    setNoteForm({ subject: "", content: "", grade: "" });
    setNoteStudentId(null);
    loadAll();
  }

  async function deleteNote(id: string) {
    await supabase.from("student_notes").delete().eq("id", id);
    loadAll();
    toast.success("Nota eliminada");
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">No tienes acceso a esta sección.</div>;
  }

  const studentTasks = (studentId: string) => tasks.filter(t => t.student_id === studentId);
  const studentNotes = (studentId: string) => notes.filter(n => n.student_id === studentId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Gestiona cursos, estudiantes, tareas y notas</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Cursos", value: courses.length, color: "bg-primary/10 text-primary" },
          { icon: GraduationCap, label: "Estudiantes", value: students.length, color: "bg-sage/20 text-sage-foreground" },
          { icon: ClipboardList, label: "Tareas Activas", value: tasks.filter(t => t.status === "pending").length, color: "bg-terracotta/20 text-terracotta-foreground" },
          { icon: Users, label: "Suscriptores", value: subCount, color: "bg-primary/10 text-primary" },
        ].map(s => (
          <div key={s.label} className="organic-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="students" className="rounded-xl gap-1"><GraduationCap className="h-4 w-4" /> Estudiantes</TabsTrigger>
          <TabsTrigger value="courses" className="rounded-xl gap-1"><BookOpen className="h-4 w-4" /> Cursos</TabsTrigger>
        </TabsList>

        {/* ===== STUDENTS TAB ===== */}
        <TabsContent value="students" className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : students.length === 0 ? (
            <div className="organic-card p-8 text-center">
              <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aún no hay estudiantes registrados.</p>
            </div>
          ) : (
            students.map(student => {
              const sTasks = studentTasks(student.id);
              const sNotes = studentNotes(student.id);
              const isExpanded = expandedStudent === student.id;
              return (
                <div key={student.id} className="organic-card overflow-hidden">
                  {/* Student header */}
                  <button
                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="p-2 rounded-xl bg-sage/20">
                      <GraduationCap className="h-5 w-5 text-sage-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{student.full_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {student.age ? `${student.age} años` : "Sin edad"} · {sTasks.length} tareas · {sNotes.length} notas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {sTasks.filter(t => t.status === "completed").length}/{sTasks.length} completadas
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4">
                      {/* Tasks section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-heading font-bold text-foreground text-sm flex items-center gap-1">
                            <ClipboardList className="h-4 w-4" /> Tareas
                          </h4>
                          <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs"
                            onClick={() => { setTaskStudentId(student.id); setNoteStudentId(null); }}>
                            <Plus className="h-3 w-3" /> Nueva Tarea
                          </Button>
                        </div>

                        {taskStudentId === student.id && (
                          <form onSubmit={handleCreateTask} className="bg-muted/30 rounded-xl p-3 mb-3 space-y-2">
                            <Input placeholder="Título de la tarea" value={taskForm.title}
                              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                            <Textarea placeholder="Descripción (opcional)" value={taskForm.description}
                              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Label className="text-xs">Fecha límite</Label>
                                <Input type="date" value={taskForm.due_date}
                                  onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                              </div>
                              <Button type="submit" size="sm" disabled={savingTask} className="rounded-xl">
                                {savingTask ? "..." : "Crear"}
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setTaskStudentId(null)} className="rounded-xl">
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        )}

                        {sTasks.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sin tareas asignadas</p>
                        ) : (
                          <div className="space-y-1">
                            {sTasks.map(task => (
                              <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 group">
                                <button onClick={() => toggleTaskStatus(task)}
                                  className={`shrink-0 ${task.status === "completed" ? "text-primary" : "text-muted-foreground"}`}>
                                  {task.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                    {task.title}
                                  </p>
                                  {task.due_date && (
                                    <p className="text-xs text-muted-foreground">{new Date(task.due_date).toLocaleDateString("es")}</p>
                                  )}
                                </div>
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                                  onClick={() => deleteTask(task.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-heading font-bold text-foreground text-sm flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Notas y Calificaciones
                          </h4>
                          <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs"
                            onClick={() => { setNoteStudentId(student.id); setTaskStudentId(null); }}>
                            <Plus className="h-3 w-3" /> Nueva Nota
                          </Button>
                        </div>

                        {noteStudentId === student.id && (
                          <form onSubmit={handleCreateNote} className="bg-muted/30 rounded-xl p-3 mb-3 space-y-2">
                            <Input placeholder="Materia / Asunto" value={noteForm.subject}
                              onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })} required />
                            <Textarea placeholder="Observaciones" value={noteForm.content}
                              onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} rows={2} />
                            <div className="flex gap-2 items-end">
                              <div className="w-24">
                                <Label className="text-xs">Calificación</Label>
                                <Input type="number" step="0.1" min="0" max="10" placeholder="0-10"
                                  value={noteForm.grade} onChange={e => setNoteForm({ ...noteForm, grade: e.target.value })} />
                              </div>
                              <Button type="submit" size="sm" disabled={savingNote} className="rounded-xl">
                                {savingNote ? "..." : "Guardar"}
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setNoteStudentId(null)} className="rounded-xl">
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        )}

                        {sNotes.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sin notas registradas</p>
                        ) : (
                          <div className="space-y-1">
                            {sNotes.map(note => (
                              <div key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 group">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{note.subject}</p>
                                  {note.content && <p className="text-xs text-muted-foreground truncate">{note.content}</p>}
                                </div>
                                {note.grade !== null && (
                                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {note.grade}
                                  </span>
                                )}
                                <p className="text-xs text-muted-foreground shrink-0">
                                  {new Date(note.created_at).toLocaleDateString("es")}
                                </p>
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                                  onClick={() => deleteNote(note.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        {/* ===== COURSES TAB ===== */}
        <TabsContent value="courses" className="space-y-4">
          <Button onClick={() => setShowCourseForm(!showCourseForm)} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Nuevo Curso
          </Button>

          {showCourseForm && (
            <form onSubmit={handleCreateCourse} className="organic-card p-6 space-y-4">
              <h3 className="font-heading font-bold text-foreground">Crear Nuevo Curso</h3>
              <div>
                <Label>Título *</Label>
                <Input value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoría</Label>
                  <Input value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} />
                </div>
                <div>
                  <Label>URL del contenido</Label>
                  <Input value={courseForm.content_url} onChange={e => setCourseForm({ ...courseForm, content_url: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>URL de portada</Label>
                <Input value={courseForm.cover_url} onChange={e => setCourseForm({ ...courseForm, cover_url: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savingCourse} className="rounded-xl">{savingCourse ? "Guardando..." : "Crear Curso"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCourseForm(false)} className="rounded-xl">Cancelar</Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : courses.length === 0 ? (
              <p className="text-muted-foreground">No hay cursos aún.</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
