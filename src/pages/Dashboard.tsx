import { useEffect, useState, useCallback, useMemo } from "react";
import { BookOpen, Calendar, ClipboardList, ArrowRight, CheckCircle, Clock, Lock, AlertTriangle, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TaskManager from "@/components/TaskManager";

type Student = { id: string; full_name: string; age: number | null };
type Task = { id: string; student_id: string; title: string; description: string | null; due_date: string | null; status: string; created_by: string | null };

const CLASS_DAYS = ["Lunes", "Miércoles", "Viernes"];

function getDeadlineInfo(dueDate: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

function DeadlineBanner({ tasks, studentName }: { tasks: Task[]; studentName: (id: string) => string }) {
  const { overdue, today, tomorrow, thisWeek } = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const thisWeek: Task[] = [];
    for (const t of tasks) {
      if (t.status !== "pending" || !t.due_date) continue;
      const diff = getDeadlineInfo(t.due_date);
      if (diff < 0) overdue.push(t);
      else if (diff === 0) today.push(t);
      else if (diff === 1) tomorrow.push(t);
      else if (diff <= 7) thisWeek.push(t);
    }
    return { overdue, today, tomorrow, thisWeek };
  }, [tasks]);

  if (overdue.length === 0 && today.length === 0 && tomorrow.length === 0 && thisWeek.length === 0) return null;

  return (
    <div className="space-y-3">
      {overdue.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-destructive text-sm">
              {overdue.length === 1 ? "1 tarea vencida" : `${overdue.length} tareas vencidas`}
            </p>
            <ul className="mt-1 space-y-0.5">
              {overdue.slice(0, 3).map(t => (
                <li key={t.id} className="text-xs text-destructive/80">
                  • {t.title} — {studentName(t.student_id)} (venció {new Date(t.due_date!).toLocaleDateString("es")})
                </li>
              ))}
              {overdue.length > 3 && <li className="text-xs text-destructive/70">y {overdue.length - 3} más…</li>}
            </ul>
          </div>
        </div>
      )}

      {today.length > 0 && (
        <div className="rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-terracotta-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-terracotta-foreground text-sm">
              {today.length === 1 ? "1 tarea vence hoy" : `${today.length} tareas vencen hoy`}
            </p>
            <ul className="mt-1 space-y-0.5">
              {today.map(t => (
                <li key={t.id} className="text-xs text-foreground/70">• {t.title} — {studentName(t.student_id)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(tomorrow.length > 0 || thisWeek.length > 0) && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Próximos vencimientos</p>
            <ul className="mt-1 space-y-0.5">
              {tomorrow.map(t => (
                <li key={t.id} className="text-xs text-foreground/70">• {t.title} — {studentName(t.student_id)} (mañana)</li>
              ))}
              {thisWeek.slice(0, 3).map(t => {
                const diff = getDeadlineInfo(t.due_date!);
                return (
                  <li key={t.id} className="text-xs text-foreground/70">
                    • {t.title} — {studentName(t.student_id)} (en {diff} días)
                  </li>
                );
              })}
              {thisWeek.length > 3 && <li className="text-xs text-muted-foreground">y {thisWeek.length - 3} más esta semana…</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin, hasActiveSubscription } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [sRes, tRes] = await Promise.all([
      supabase.from("students").select("id, full_name, age").order("full_name"),
      supabase.from("student_tasks").select("id, student_id, title, description, due_date, status, created_by").order("due_date"),
    ]);
    setStudents(sRes.data || []);
    setTasks(tRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const upcomingTasks = pendingTasks
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const studentName = (id: string) => students.find(s => s.id === id)?.full_name || "—";

  // Non-admin users get the student/family portal view
  if (!isAdmin) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="rounded-3xl bg-secondary p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            ¡Bienvenida a tu espacio! 🌱
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Aquí encontrarás las tareas asignadas por tu maestra y tu calendario de clases.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <>
            {/* Deadline reminders */}
            <DeadlineBanner tasks={tasks} studentName={studentName} />
            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="organic-card p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-terracotta/20 text-terracotta-foreground">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{pendingTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Tareas Pendientes</p>
                </div>
              </div>
              <div className="organic-card p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-sage/20 text-sage-foreground">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{completedTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Tareas Completadas</p>
                </div>
              </div>
            </div>

            {/* Class Calendar */}
            <div className="space-y-4">
              <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Calendario de Clases
              </h2>
              <div className="organic-card p-5">
                <p className="text-sm text-muted-foreground mb-4">
                  Las clases se realizan <strong className="text-foreground">3 veces por semana</strong>:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {CLASS_DAYS.map(day => (
                    <div key={day} className="rounded-xl bg-secondary p-4 text-center">
                      <p className="font-medium text-foreground text-sm">{day}</p>
                      {hasActiveSubscription ? (
                        <p className="text-xs text-primary mt-1 font-medium">Horario confirmado</p>
                      ) : (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Por definir</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {!hasActiveSubscription && (
                  <div className="mt-4 p-3 rounded-xl bg-accent/30 text-center">
                    <p className="text-xs text-foreground">
                      Los horarios se asignan al activar tu membresía.
                    </p>
                    <Link to="/membresia" className="text-xs text-primary font-medium hover:underline">
                      Activar membresía →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks — read only for students */}
            <TaskManager students={students} tasks={tasks} onTasksChanged={loadData} readOnly />
          </>
        )}
      </div>
    );
  }

  // Admin / Teacher view
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl bg-secondary p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Panel de Maestra 🌱
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Gestioná las tareas y el progreso de tus estudiantes.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, label: "Estudiantes", value: String(students.length), color: "bg-primary/10 text-primary" },
              { icon: ClipboardList, label: "Tareas Pendientes", value: String(pendingTasks.length), color: "bg-terracotta/20 text-terracotta-foreground" },
              { icon: CheckCircle, label: "Tareas Completadas", value: String(completedTasks.length), color: "bg-sage/20 text-sage-foreground" },
            ].map(stat => (
              <div key={stat.label} className="organic-card p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Students list */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold text-foreground">Mis Estudiantes</h2>
                <Link to="/admin" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Gestionar <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {students.length === 0 ? (
                <div className="organic-card p-6 text-center text-muted-foreground">
                  <p>No hay estudiantes registrados aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map(student => {
                    const sTasks = tasks.filter(t => t.student_id === student.id);
                    const sPending = sTasks.filter(t => t.status === "pending").length;
                    return (
                      <div key={student.id} className="organic-card p-4 flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-sage/20">
                          <BookOpen className="h-5 w-5 text-sage-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{student.full_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {student.age ? `${student.age} años · ` : ""}{sTasks.length} tareas · {sPending} pendientes
                          </p>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          {sTasks.length > 0 ? Math.round(((sTasks.length - sPending) / sTasks.length) * 100) : 0}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming tasks */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-heading font-bold text-foreground">Próximas Tareas</h2>
              {upcomingTasks.length === 0 ? (
                <div className="organic-card p-6 text-center text-muted-foreground">
                  <p>No hay tareas próximas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="organic-card p-4">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-terracotta-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm">{task.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {studentName(task.student_id)} · {task.due_date ? new Date(task.due_date).toLocaleDateString("es") : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Management — full CRUD for teachers */}
          <TaskManager students={students} tasks={tasks} onTasksChanged={loadData} />
        </>
      )}
    </div>
  );
}
