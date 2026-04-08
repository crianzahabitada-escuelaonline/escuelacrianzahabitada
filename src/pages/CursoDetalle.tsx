import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle, Lock, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Course = {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  category: string;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order_num: number;
  duration: string;
  is_free: boolean;
};

type Resource = {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
};

export default function CursoDetalle() {
  const { id } = useParams();
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeLesson, setActiveLesson] = useState(0);
  const [loading, setLoading] = useState(true);

  const canAccessPaid = hasActiveSubscription || isAdmin;

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [courseRes, lessonsRes, resourcesRes] = await Promise.all([
        supabase.from("courses").select("id, title, description, cover_url, category").eq("id", id).maybeSingle(),
        supabase.from("course_lessons").select("*").eq("course_id", id).order("order_num"),
        supabase.from("course_resources").select("*").eq("course_id", id),
      ]);
      setCourse(courseRes.data as Course | null);
      setLessons((lessonsRes.data as Lesson[]) || []);
      setResources((resourcesRes.data as Resource[]) || []);
      setLoading(false);
    }
    load();
  }, [id, user]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
  if (!course) return <div className="p-8 text-center text-muted-foreground">Curso no encontrado.</div>;

  const currentLesson = lessons[activeLesson];
  const isLessonLocked = currentLesson && !currentLesson.is_free && !canAccessPaid;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a Cursos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-foreground/5 aspect-video flex items-center justify-center overflow-hidden">
            {currentLesson && !isLessonLocked && currentLesson.video_url ? (
              <iframe
                src={currentLesson.video_url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={currentLesson.title}
              />
            ) : isLessonLocked ? (
              <div className="text-center p-8">
                <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Contenido exclusivo para miembros</p>
                <Link to="/membresia">
                  <Button className="mt-3 rounded-xl">Activar Membresía</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Play className="h-7 w-7 text-primary ml-1" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLesson ? currentLesson.title : "Selecciona una lección"}
                </p>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">{course.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
          </div>

          {/* Current lesson description */}
          {currentLesson && currentLesson.description && !isLessonLocked && (
            <div className="organic-card p-5">
              <h3 className="font-heading font-bold text-foreground text-sm mb-2">{currentLesson.title}</h3>
              <p className="text-sm text-muted-foreground">{currentLesson.description}</p>
            </div>
          )}

          {/* Resources */}
          {resources.length > 0 && canAccessPaid && (
            <div className="organic-card p-5 space-y-3">
              <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                📎 Material Descargable
              </h3>
              {resources.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.file_type?.toUpperCase()}</p>
                  </div>
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="rounded-xl gap-1">
                      <ExternalLink className="h-3 w-3" /> Abrir
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lesson List */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-foreground">Contenido del Curso</h3>
          {lessons.length === 0 ? (
            <div className="organic-card p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">El contenido se está preparando.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const locked = !lesson.is_free && !canAccessPaid;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => !locked && setActiveLesson(idx)}
                    disabled={locked}
                    className={`w-full text-left organic-card p-3 flex items-center gap-3 transition-colors ${
                      idx === activeLesson ? "ring-2 ring-primary" : ""
                    } ${locked ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/30"}`}
                  >
                    {locked ? (
                      <Lock className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                    ) : (
                      <Play className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.duration || "—"}
                        {lesson.is_free && " · Gratuita"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!canAccessPaid && lessons.some(l => !l.is_free) && (
            <div className="organic-card p-4 bg-secondary">
              <p className="text-sm text-foreground font-medium mb-2">🌿 Accede a todo el contenido</p>
              <p className="text-xs text-muted-foreground mb-3">
                Activa tu membresía para desbloquear todas las lecciones y materiales.
              </p>
              <Link to={user ? "/membresia" : "/auth"}>
                <Button size="sm" className="w-full rounded-xl">
                  {user ? "Ver Membresía" : "Iniciar Sesión"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
