import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Lock, BookOpen, ExternalLink, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Course = {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  category: string;
  price: number;
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

function isDirectVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/.test(lower) || lower.includes("/storage/v1/object/");
}

export default function CursoDetalle() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeLesson, setActiveLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [buying, setBuying] = useState(false);

  const isFree = course?.price === 0;
  const canAccessPaid = hasActiveSubscription || isAdmin || hasPurchased || isFree;

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [courseRes, lessonsRes, resourcesRes] = await Promise.all([
        supabase.from("courses").select("id, title, description, cover_url, category, price").eq("id", id).maybeSingle(),
        supabase.from("course_lessons").select("*").eq("course_id", id).order("order_num"),
        supabase.from("course_resources").select("*").eq("course_id", id),
      ]);
      setCourse(courseRes.data as Course | null);
      setLessons((lessonsRes.data as Lesson[]) || []);
      setResources((resourcesRes.data as Resource[]) || []);

      // Check if user purchased this course
      if (user) {
        const { data: purchase } = await supabase
          .from("course_purchases" as any)
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .eq("status", "approved")
          .maybeSingle();
        setHasPurchased(!!purchase);
      }

      setLoading(false);
    }
    load();
  }, [id, user]);

  // Handle payment return
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast.success("¡Pago exitoso! Ya tienes acceso al curso.");
      setHasPurchased(true);
    } else if (status === "failure") {
      toast.error("El pago no se pudo completar.");
    } else if (status === "pending") {
      toast.info("Tu pago está pendiente de confirmación.");
    }
  }, [searchParams]);

  async function handleBuyCourse() {
    if (!user || !course) return;
    setBuying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-course-preference", {
        body: {
          user_id: user.id,
          email: user.email,
          course_id: course.id,
          course_title: course.title,
          course_price: course.price,
        },
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se obtuvo enlace de pago");
      }
    } catch (err: any) {
      toast.error("Error al iniciar compra: " + (err.message || "Intenta de nuevo"));
    } finally {
      setBuying(false);
    }
  }

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
          <div className="rounded-2xl bg-foreground/5 aspect-video flex items-center justify-center overflow-hidden relative">
            {currentLesson && canAccessPaid && currentLesson.video_url ? (
              isDirectVideoUrl(currentLesson.video_url) ? (
                <video
                  src={currentLesson.video_url}
                  className="w-full h-full"
                  controls
                  controlsList="nodownload"
                  title={currentLesson.title}
                />
              ) : (
                <iframe
                  src={currentLesson.video_url}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={currentLesson.title}
                />
              )
            ) : (
              <div className="text-center p-8">
                {currentLesson ? (
                  <>
                    <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-foreground font-medium">{currentLesson.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {canAccessPaid ? "Sin video disponible" : "Compra este curso o activa tu membresía para reproducir"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Play className="h-7 w-7 text-primary ml-1" />
                    </div>
                    <p className="text-sm text-muted-foreground">Selecciona una lección</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">{course.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
          </div>

          {currentLesson && currentLesson.description && canAccessPaid && (
            <div className="organic-card p-5">
              <h3 className="font-heading font-bold text-foreground text-sm mb-2">{currentLesson.title}</h3>
              <p className="text-sm text-muted-foreground">{currentLesson.description}</p>
            </div>
          )}

          {resources.length > 0 && (
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
                  {canAccessPaid ? (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-xl gap-1">
                        <ExternalLink className="h-3 w-3" /> Abrir
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-xl gap-1 opacity-50" disabled>
                      <Lock className="h-3 w-3" /> Bloqueado
                    </Button>
                  )}
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

          {/* Purchase / Membership CTA */}
          {!canAccessPaid && lessons.some(l => !l.is_free) && (
            <div className="space-y-3">
              {/* Buy individual course */}
              <div className="organic-card p-4 bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground font-medium mb-1">🛒 Comprar este curso</p>
                <p className="text-2xl font-heading font-bold text-primary mb-2">${course.price} USD</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Acceso permanente a todas las lecciones y materiales de este curso.
                </p>
                {user ? (
                  <Button onClick={handleBuyCourse} disabled={buying} className="w-full rounded-xl gap-2">
                    {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {buying ? "Procesando..." : "Comprar Curso"}
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button className="w-full rounded-xl">Iniciar Sesión para Comprar</Button>
                  </Link>
                )}
              </div>

              {/* Membership option */}
              <div className="organic-card p-4 bg-secondary">
                <p className="text-sm text-foreground font-medium mb-2">🌿 O accede a todo con membresía</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Activa tu membresía para desbloquear todos los cursos y materiales.
                </p>
                <Link to={user ? "/membresia" : "/auth"}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl">
                    {user ? "Ver Membresía" : "Iniciar Sesión"}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {hasPurchased && (
            <div className="organic-card p-3 bg-primary/5 border border-primary/20 text-center">
              <p className="text-sm text-primary font-medium">✅ Curso comprado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
