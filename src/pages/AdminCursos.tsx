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
  Calendar, Video, Grip, Play,
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

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  order_num: number;
  duration: string;
  is_free: boolean;
};

type Student = {
  id: string;
  full_name: string;
  age: number | null;
  tutor_id: string;
};

type Task = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
};

type Note = {
  id: string;
  student_id: string;
  subject: string;
  content: string;
  grade: number | null;
  created_at: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  event_time: string;
  is_public: boolean;
  meeting_url: string;
};

export default function AdminCursos() {
  const { isAdmin, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [subCount, setSubCount] = useState(0);

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", category: "general", content_url: "", cover_url: "" });
  const [savingCourse, setSavingCourse] = useState(false);

  // Lesson form
  const [lessonCourseId, setLessonCourseId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", video_url: "", duration: "", is_free: false });
  const [savingLesson, setSavingLesson] = useState(false);

  // Task form
  const [taskStudentId, setTaskStudentId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "" });
  const [savingTask, setSavingTask] = useState(false);

  // Note form
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ subject: "", content: "", grade: "" });
  const [savingNote, setSavingNote] = useState(false);

  // Event form
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", event_type: "webinar", event_date: "", event_time: "18:00", is_public: true, meeting_url: "" });
  const [savingEvent, setSavingEvent] = useState(false);

  // Expanded
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    const [coursesRes, lessonsRes, studentsRes, tasksRes, notesRes, eventsRes, subRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("course_lessons").select("*").order("order_num"),
      supabase.from("students").select("*").order("full_name"),
      supabase.from("student_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("student_notes").select("*").order("created_at", { ascending: false }),
      supabase.from("calendar_events").select("*").order("event_date"),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    ]);
    setCourses((coursesRes.data as Course[]) || []);
    setLessons((lessonsRes.data as Lesson[]) || []);
    setStudents((studentsRes.data as Student[]) || []);
    setTasks((tasksRes.data as Task[]) || []);
    setNotes((notesRes.data as Note[]) || []);
    setEvents((eventsRes.data as CalendarEvent[]) || []);
    setSubCount(subRes.count || 0);
    setLoading(false);
  }

  // ---- Course CRUD ----
  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setSavingCourse(true);
    const { error } = await supabase.from("courses").insert({
      title: courseForm.title, description: courseForm.description,
      category: courseForm.category, content_url: courseForm.content_url,
      cover_url: courseForm.cover_url, is_published: false,
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
    if (!confirm("¿Eliminar este curso y todas sus lecciones?")) return;
    await supabase.from("courses").delete().eq("id", id);
    loadAll();
    toast.success("Curso eliminado");
  }

  // ---- Lesson CRUD ----
  async function handleCreateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonCourseId) return;
    setSavingLesson(true);
    const courseLessons = lessons.filter(l => l.course_id === lessonCourseId);
    const { error } = await supabase.from("course_lessons").insert({
      course_id: lessonCourseId, title: lessonForm.title,
      description: lessonForm.description, video_url: lessonForm.video_url,
      duration: lessonForm.duration, is_free: lessonForm.is_free,
      order_num: courseLessons.length,
    });
    setSavingLesson(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Lección agregada");
    setLessonForm({ title: "", description: "", video_url: "", duration: "", is_free: false });
    setLessonCourseId(null);
    loadAll();
  }

  async function deleteLesson(id: string) {
    await supabase.from("course_lessons").delete().eq("id", id);
    loadAll();
    toast.success("Lección eliminada");
  }

  // ---- Task CRUD ----
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskStudentId) return;
    setSavingTask(true);
    const { error } = await supabase.from("student_tasks").insert({
      student_id: taskStudentId, title: taskForm.title,
      description: taskForm.description, due_date: taskForm.due_date || null,
    });
    setSavingTask(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Tarea creada");
    setTaskForm({ title: "", description: "", due_date: "" });
    setTaskStudentId(null);
    loadAll();
  }

  async function toggleTaskStatus(task: Task) {
    await supabase.from("student_tasks").update({ status: task.status === "pending" ? "completed" : "pending" }).eq("id", task.id);
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
      student_id: noteStudentId, subject: noteForm.subject,
      content: noteForm.content, grade: noteForm.grade ? parseFloat(noteForm.grade) : null,
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

  // ---- Event CRUD ----
  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setSavingEvent(true);
    const { error } = await supabase.from("calendar_events").insert({
      title: eventForm.title, description: eventForm.description,
      event_type: eventForm.event_type, event_date: eventForm.event_date,
      event_time: eventForm.event_time, is_public: eventForm.is_public,
      meeting_url: eventForm.meeting_url, created_by: user?.id,
    });
    setSavingEvent(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success("Evento creado");
    setEventForm({ title: "", description: "", event_type: "webinar", event_date: "", event_time: "18:00", is_public: true, meeting_url: "" });
    setShowEventForm(false);
    loadAll();
  }

  async function deleteEvent(id: string) {
    if (!confirm("¿Eliminar este evento?")) return;
    await supabase.from("calendar_events").delete().eq("id", id);
    loadAll();
    toast.success("Evento eliminado");
  }

  if (!isAdmin) return <div className="p-8 text-center text-muted-foreground">No tienes acceso.</div>;

  const courseLessons = (courseId: string) => lessons.filter(l => l.course_id === courseId);
  const studentTasks = (studentId: string) => tasks.filter(t => t.student_id === studentId);
  const studentNotes = (studentId: string) => notes.filter(n => n.student_id === studentId);

  const eventTypeLabels: Record<string, string> = { webinar: "Webinar", session: "Acompañamiento", class: "Ciclo Educativo" };
  const eventTypeColors: Record<string, string> = { webinar: "bg-sage/20 text-sage-foreground", session: "bg-terracotta/20 text-terracotta-foreground", class: "bg-lavender/20 text-lavender-foreground" };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Gestiona cursos, estudiantes, calendario y más</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Cursos", value: courses.length, color: "bg-primary/10 text-primary" },
          { icon: GraduationCap, label: "Estudiantes", value: students.length, color: "bg-sage/20 text-sage-foreground" },
          { icon: Calendar, label: "Eventos", value: events.length, color: "bg-terracotta/20 text-terracotta-foreground" },
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

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="courses" className="rounded-xl gap-1"><BookOpen className="h-4 w-4" /> Cursos</TabsTrigger>
          <TabsTrigger value="students" className="rounded-xl gap-1"><GraduationCap className="h-4 w-4" /> Estudiantes</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-xl gap-1"><Calendar className="h-4 w-4" /> Calendario</TabsTrigger>
        </TabsList>

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
                  <Label>URL de portada</Label>
                  <Input value={courseForm.cover_url} onChange={e => setCourseForm({ ...courseForm, cover_url: e.target.value })} placeholder="Link imagen" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savingCourse} className="rounded-xl">{savingCourse ? "Guardando..." : "Crear Curso"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCourseForm(false)} className="rounded-xl">Cancelar</Button>
              </div>
            </form>
          )}

          {loading ? <p className="text-muted-foreground">Cargando...</p> : courses.length === 0 ? (
            <div className="organic-card p-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No hay cursos. ¡Crea el primero!</p>
            </div>
          ) : (
            courses.map(course => {
              const cLessons = courseLessons(course.id);
              const isExpanded = expandedCourse === course.id;
              return (
                <div key={course.id} className="organic-card overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    <button onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                      className="flex-1 flex items-center gap-4 text-left">
                      {course.cover_url ? (
                        <img src={course.cover_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                        <p className="text-xs text-muted-foreground">{cLessons.length} lecciones · {course.category}</p>
                      </div>
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${course.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {course.is_published ? "Publicado" : "Borrador"}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => togglePublish(course)} className="rounded-xl gap-1">
                      {course.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)} className="rounded-xl">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-1">
                          <Play className="h-4 w-4" /> Lecciones ({cLessons.length})
                        </h4>
                        <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs"
                          onClick={() => setLessonCourseId(lessonCourseId === course.id ? null : course.id)}>
                          <Plus className="h-3 w-3" /> Agregar Lección
                        </Button>
                      </div>

                      {lessonCourseId === course.id && (
                        <form onSubmit={handleCreateLesson} className="bg-muted/30 rounded-xl p-3 space-y-2">
                          <Input placeholder="Título de la lección *" value={lessonForm.title}
                            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                          <Textarea placeholder="Descripción" value={lessonForm.description}
                            onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} rows={2} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="URL del video" value={lessonForm.video_url}
                              onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
                            <Input placeholder="Duración (ej: 15:30)" value={lessonForm.duration}
                              onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={lessonForm.is_free}
                                onChange={e => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                                className="rounded" />
                              Lección gratuita (visible sin membresía)
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={savingLesson} className="rounded-xl">
                              {savingLesson ? "..." : "Agregar"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setLessonCourseId(null)} className="rounded-xl">Cancelar</Button>
                          </div>
                        </form>
                      )}

                      {cLessons.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sin lecciones. Agrega la primera.</p>
                      ) : (
                        <div className="space-y-1">
                          {cLessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 group">
                              <Grip className="h-4 w-4 text-muted-foreground/50" />
                              <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration || "—"} {lesson.is_free && " · 🆓 Gratuita"}
                                </p>
                              </div>
                              {lesson.video_url && <Video className="h-3 w-3 text-primary" />}
                              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                                onClick={() => deleteLesson(lesson.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        {/* ===== STUDENTS TAB ===== */}
        <TabsContent value="students" className="space-y-4">
          {loading ? <p className="text-muted-foreground">Cargando...</p> : students.length === 0 ? (
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
                  <button onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left">
                    <div className="p-2 rounded-xl bg-sage/20"><GraduationCap className="h-5 w-5 text-sage-foreground" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{student.full_name}</h3>
                      <p className="text-xs text-muted-foreground">{student.age ? `${student.age} años` : ""} · {sTasks.length} tareas · {sNotes.length} notas</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {sTasks.filter(t => t.status === "completed").length}/{sTasks.length}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4">
                      {/* Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-heading font-bold text-foreground text-sm flex items-center gap-1"><ClipboardList className="h-4 w-4" /> Tareas</h4>
                          <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs"
                            onClick={() => { setTaskStudentId(student.id); setNoteStudentId(null); }}><Plus className="h-3 w-3" /> Nueva Tarea</Button>
                        </div>
                        {taskStudentId === student.id && (
                          <form onSubmit={handleCreateTask} className="bg-muted/30 rounded-xl p-3 mb-3 space-y-2">
                            <Input placeholder="Título" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                            <Textarea placeholder="Descripción" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
                            <div className="flex gap-2 items-end">
                              <div className="flex-1"><Label className="text-xs">Fecha límite</Label><Input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
                              <Button type="submit" size="sm" disabled={savingTask} className="rounded-xl">{savingTask ? "..." : "Crear"}</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setTaskStudentId(null)} className="rounded-xl">Cancelar</Button>
                            </div>
                          </form>
                        )}
                        {sTasks.length === 0 ? <p className="text-xs text-muted-foreground">Sin tareas</p> : (
                          <div className="space-y-1">{sTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 group">
                              <button onClick={() => toggleTaskStatus(task)} className={task.status === "completed" ? "text-primary" : "text-muted-foreground"}>
                                {task.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                                {task.due_date && <p className="text-xs text-muted-foreground">{new Date(task.due_date).toLocaleDateString("es")}</p>}
                              </div>
                              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0" onClick={() => deleteTask(task.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            </div>
                          ))}</div>
                        )}
                      </div>
                      {/* Notes */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-heading font-bold text-foreground text-sm flex items-center gap-1"><FileText className="h-4 w-4" /> Notas</h4>
                          <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs"
                            onClick={() => { setNoteStudentId(student.id); setTaskStudentId(null); }}><Plus className="h-3 w-3" /> Nueva Nota</Button>
                        </div>
                        {noteStudentId === student.id && (
                          <form onSubmit={handleCreateNote} className="bg-muted/30 rounded-xl p-3 mb-3 space-y-2">
                            <Input placeholder="Materia" value={noteForm.subject} onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })} required />
                            <Textarea placeholder="Observaciones" value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} rows={2} />
                            <div className="flex gap-2 items-end">
                              <div className="w-24"><Label className="text-xs">Nota</Label><Input type="number" step="0.1" min="0" max="10" value={noteForm.grade} onChange={e => setNoteForm({ ...noteForm, grade: e.target.value })} /></div>
                              <Button type="submit" size="sm" disabled={savingNote} className="rounded-xl">{savingNote ? "..." : "Guardar"}</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setNoteStudentId(null)} className="rounded-xl">Cancelar</Button>
                            </div>
                          </form>
                        )}
                        {sNotes.length === 0 ? <p className="text-xs text-muted-foreground">Sin notas</p> : (
                          <div className="space-y-1">{sNotes.map(note => (
                            <div key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{note.subject}</p>
                                {note.content && <p className="text-xs text-muted-foreground truncate">{note.content}</p>}
                              </div>
                              {note.grade !== null && <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{note.grade}</span>}
                              <p className="text-xs text-muted-foreground shrink-0">{new Date(note.created_at).toLocaleDateString("es")}</p>
                              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0" onClick={() => deleteNote(note.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            </div>
                          ))}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        {/* ===== CALENDAR TAB ===== */}
        <TabsContent value="calendar" className="space-y-4">
          <Button onClick={() => setShowEventForm(!showEventForm)} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Nuevo Evento
          </Button>

          {showEventForm && (
            <form onSubmit={handleCreateEvent} className="organic-card p-6 space-y-4">
              <h3 className="font-heading font-bold text-foreground">Crear Evento</h3>
              <div>
                <Label>Título *</Label>
                <Input value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} required />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <select value={eventForm.event_type} onChange={e => {
                    const type = e.target.value;
                    setEventForm({ ...eventForm, event_type: type, is_public: type === "webinar" });
                  }}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="webinar">Webinar (público)</option>
                    <option value="session">Acompañamiento (privado)</option>
                    <option value="class">Ciclo Educativo (privado)</option>
                  </select>
                </div>
                <div>
                  <Label>Fecha *</Label>
                  <Input type="date" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} required />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input type="time" value={eventForm.event_time} onChange={e => setEventForm({ ...eventForm, event_time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>URL de reunión (Zoom, Meet, etc.)</Label>
                <Input value={eventForm.meeting_url} onChange={e => setEventForm({ ...eventForm, meeting_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={eventForm.is_public}
                    onChange={e => setEventForm({ ...eventForm, is_public: e.target.checked })} className="rounded" />
                  Visible para todos (público)
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savingEvent} className="rounded-xl">{savingEvent ? "Guardando..." : "Crear Evento"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowEventForm(false)} className="rounded-xl">Cancelar</Button>
              </div>
            </form>
          )}

          {events.length === 0 ? (
            <div className="organic-card p-8 text-center">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No hay eventos. ¡Crea el primero!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="organic-card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eventTypeColors[event.event_type] || "bg-muted text-muted-foreground"}`}>
                        {eventTypeLabels[event.event_type] || event.event_type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${event.is_public ? "bg-sage/20 text-sage-foreground" : "bg-terracotta/20 text-terracotta-foreground"}`}>
                        {event.is_public ? "Público" : "Privado"}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })} · {event.event_time}h
                    </p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)} className="rounded-xl">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
