import { useEffect, useState, useCallback } from "react";
import { BookOpen, Calendar, ClipboardList, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TaskManager from "@/components/TaskManager";

type Student = { id: string; full_name: string; age: number | null };
type Task = { id: string; student_id: string; title: string; description: string | null; due_date: string | null; status: string; created_by: string | null };

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-3xl bg-secondary p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          ¡Bienvenida a tu espacio! 🌱
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Un lugar donde la crianza se vive con presencia, amor y comunidad.
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
                {isAdmin && (
                  <Link to="/admin" className="text-sm text-primary hover:underline flex items-center gap-1">
                    Gestionar <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
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

          {/* Task Management */}
          <TaskManager students={students} tasks={tasks} onTasksChanged={loadData} />
      )}
    </div>
  );
}
