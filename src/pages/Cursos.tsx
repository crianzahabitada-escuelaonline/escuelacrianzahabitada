import { useEffect, useState } from "react";
import { BookOpen, Play, Lock, ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  is_published: boolean;
  price: number;
};

type LessonCount = { course_id: string; count: number };

export default function Cursos() {
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [purchases, setPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, description, cover_url, category, is_published, price")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setCourses((coursesData as Course[]) || []);

      if (coursesData && coursesData.length > 0) {
        const { data: lessonsData } = await supabase
          .from("course_lessons")
          .select("course_id");
        
        if (lessonsData) {
          const counts: Record<string, number> = {};
          lessonsData.forEach((l: any) => {
            counts[l.course_id] = (counts[l.course_id] || 0) + 1;
          });
          setLessonCounts(counts);
        }
      }

      if (user) {
        const { data: purchaseData } = await supabase
          .from("course_purchases")
          .select("course_id")
          .eq("user_id", user.id)
          .eq("status", "approved");
        setPurchases((purchaseData || []).map((p: any) => p.course_id));
      }

      setLoading(false);
    }
    load();
  }, [user]);

  async function handleBuy(course: Course) {
    if (!user) {
      toast.error("Iniciá sesión para comprar");
      navigate("/auth");
      return;
    }
    setBuyingId(course.id);
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
      setBuyingId(null);
    }
  }

  const hasAccess = (course: Course) =>
    course.price === 0 || hasActiveSubscription || isAdmin || purchases.includes(course.id);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Cursos Disponibles</h1>
          <p className="text-muted-foreground mt-1">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Cursos Disponibles</h1>
        <p className="text-muted-foreground mt-1">Explora nuestros cursos y empieza tu camino hacia una crianza más consciente.</p>
      </div>

      {courses.length === 0 ? (
        <div className="organic-card p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-heading font-bold text-foreground mb-2">Próximamente</h2>
          <p className="text-muted-foreground">Estamos preparando cursos increíbles para ti. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {courses.map(course => {
            const accessible = hasAccess(course);
            const isFree = course.price === 0;
            const purchased = purchases.includes(course.id);
            const isBuying = buyingId === course.id;

            return (
              <div key={course.id} className="organic-card overflow-hidden group">
                <div className="h-48 bg-secondary overflow-hidden relative">
                  {course.cover_url ? (
                    <img src={course.cover_url} alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  {/* Lock overlay for paid locked courses */}
                  {!isFree && !accessible && (
                    <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                      <Lock className="h-10 w-10 text-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {course.category || "General"}
                    </span>
                    {isFree ? (
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        ✨ Gratuito
                      </span>
                    ) : purchased ? (
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Comprado
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-heading font-bold text-foreground mt-2 mb-1 text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{course.description || ""}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <Play className="h-3.5 w-3.5" />{lessonCounts[course.id] || 0} lecciones
                    </span>
                  </div>

                  {/* Action area: similar to Ebooks */}
                  <div className="flex items-center justify-between mt-4">
                    {isFree ? (
                      <>
                        <span className="text-lg font-bold text-green-700">Gratis</span>
                        <Link to={`/cursos/${course.id}`}>
                          <Button size="sm" className="rounded-xl gap-1 bg-green-600 hover:bg-green-700">
                            <Play className="h-4 w-4" /> Ver Contenido
                          </Button>
                        </Link>
                      </>
                    ) : accessible ? (
                      <>
                        <span className="text-lg font-bold text-primary">USD ${course.price}</span>
                        <Link to={`/cursos/${course.id}`}>
                          <Button size="sm" className="rounded-xl gap-1">
                            <Play className="h-4 w-4" /> Ver Contenido
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-primary">USD ${course.price}</span>
                        <div className="flex items-center gap-2">
                          <Link to={`/cursos/${course.id}`}>
                            <Button size="sm" variant="outline" className="rounded-xl gap-1">
                              <Lock className="h-4 w-4" /> Ver Contenido
                            </Button>
                          </Link>
                          <Button size="sm" className="rounded-xl gap-1" onClick={() => handleBuy(course)} disabled={isBuying}>
                            {isBuying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                            {isBuying ? "..." : "Comprar"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
