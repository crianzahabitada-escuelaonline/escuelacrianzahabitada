import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, ShoppingBag, Calendar, Video,
  Play, File, DollarSign, ExternalLink, Clock, Lock,
} from "lucide-react";

type Course = {
  id: string; title: string; description: string; cover_url: string;
  category: string; is_published: boolean; price: number;
};
type DigitalProduct = {
  id: string; title: string; description: string; author: string; price: number;
  product_type: string; cover_url: string; file_url: string; pages_info: string;
  is_published: boolean;
};
type CalendarEvent = {
  id: string; title: string; description: string; event_type: string;
  event_date: string; event_time: string; is_public: boolean; meeting_url: string;
};

export default function MaestrosPanel() {
  const { isAdmin, isTeacher, user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const canAccess = isAdmin || isTeacher;

  useEffect(() => {
    if (canAccess) loadAll();
    else setLoading(false);
  }, [canAccess]);

  async function loadAll() {
    setLoading(true);
    const [coursesRes, productsRes, eventsRes] = await Promise.all([
      supabase.from("courses").select("*").eq("category", "maestros").eq("is_published", true).order("created_at", { ascending: false }),
      supabase.from("digital_products").select("*").eq("product_type", "maestro").eq("is_published", true).order("created_at", { ascending: false }),
      supabase.from("calendar_events").select("*").eq("event_type", "teacher").order("event_date"),
    ]);
    setCourses((coursesRes.data as Course[]) || []);
    setProducts((productsRes.data as DigitalProduct[]) || []);
    setEvents((eventsRes.data as CalendarEvent[]) || []);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-heading font-bold text-foreground">Acceso restringido</h2>
        <p className="text-muted-foreground text-center">Necesitás iniciar sesión para acceder al Portal de Maestros.</p>
        <Button onClick={() => navigate("/auth")} className="rounded-xl">Iniciar Sesión</Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <GraduationCap className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-heading font-bold text-foreground">Portal exclusivo para maestros</h2>
        <p className="text-muted-foreground text-center max-w-md">Este espacio está reservado para maestros y educadores. Si sos maestra/o, contactate con Paola para activar tu acceso.</p>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="organic-card p-6 bg-gradient-to-r from-primary/10 to-sage/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Portal de Maestros</h1>
            <p className="text-muted-foreground mt-1">Pedagogía Waldorf — Espacio exclusivo para maestros y educadores</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Cursos disponibles", value: courses.length, color: "bg-primary/10 text-primary" },
          { icon: ShoppingBag, label: "Recursos digitales", value: products.length, color: "bg-lavender/20 text-lavender-foreground" },
          { icon: Calendar, label: "Próximas capacitaciones", value: upcomingEvents.length, color: "bg-sage/20 text-sage-foreground" },
        ].map(s => (
          <div key={s.label} className="organic-card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="capacitaciones" className="space-y-4">
        <TabsList className="rounded-xl flex-wrap">
          <TabsTrigger value="capacitaciones" className="rounded-xl gap-1">
            <Calendar className="h-4 w-4" /> Capacitaciones
          </TabsTrigger>
          <TabsTrigger value="cursos" className="rounded-xl gap-1">
            <BookOpen className="h-4 w-4" /> Cursos para Maestros
          </TabsTrigger>
          <TabsTrigger value="recursos" className="rounded-xl gap-1">
            <ShoppingBag className="h-4 w-4" /> Recursos Digitales
          </TabsTrigger>
        </TabsList>

        {/* ===== CAPACITACIONES ===== */}
        <TabsContent value="capacitaciones" className="space-y-6">
          {loading ? <p className="text-muted-foreground">Cargando...</p> : (
            <>
              {/* Próximas */}
              <div>
                <h2 className="font-heading font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Próximas Capacitaciones
                </h2>
                {upcomingEvents.length === 0 ? (
                  <div className="organic-card p-8 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No hay capacitaciones próximas programadas.</p>
                    <p className="text-xs text-muted-foreground mt-1">Paola publicará las fechas pronto.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => {
                      const date = new Date(event.event_date);
                      const today = new Date();
                      const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={event.id} className="organic-card p-5 flex items-start gap-4">
                          <div className="shrink-0 text-center bg-primary/10 rounded-xl p-3 min-w-[64px]">
                            <p className="text-2xl font-heading font-bold text-primary leading-none">{date.getDate()}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {date.toLocaleDateString("es", { month: "short" })}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {diffDays <= 7 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta/20 text-terracotta-foreground font-medium">
                                  {diffDays === 0 ? "¡Hoy!" : diffDays === 1 ? "Mañana" : `En ${diffDays} días`}
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-foreground">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {date.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })} · {event.event_time}hs
                            </p>
                          </div>
                          {event.meeting_url && (
                            <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="rounded-xl gap-1 shrink-0">
                                <Video className="h-4 w-4" /> Unirse
                              </Button>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pasadas */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 className="font-heading font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" /> Capacitaciones anteriores
                  </h2>
                  <div className="space-y-2">
                    {pastEvents.slice().reverse().map(event => {
                      const date = new Date(event.event_date);
                      return (
                        <div key={event.id} className="organic-card p-4 flex items-center gap-4 opacity-60">
                          <div className="shrink-0 text-center bg-muted rounded-xl p-2 min-w-[52px]">
                            <p className="text-lg font-heading font-bold text-muted-foreground leading-none">{date.getDate()}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {date.toLocaleDateString("es", { month: "short" })}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground text-sm">{event.title}</h3>
                            <p className="text-xs text-muted-foreground">{date.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })} · {event.event_time}hs</p>
                          </div>
                          {event.meeting_url && (
                            <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs shrink-0">
                                <ExternalLink className="h-3 w-3" /> Ver grabación
                              </Button>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== CURSOS ===== */}
        <TabsContent value="cursos" className="space-y-4">
          {loading ? <p className="text-muted-foreground">Cargando...</p> : courses.length === 0 ? (
            <div className="organic-card p-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Próximamente cursos de formación Waldorf.</p>
              <p className="text-xs text-muted-foreground mt-1">Paola está preparando los contenidos para vos.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course.id} className="organic-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/cursos/${course.id}`)}>
                  {course.cover_url ? (
                    <img src={course.cover_url} alt={course.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-40 bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage-foreground font-medium">
                        🌿 Pedagogía Waldorf
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-foreground">{course.title}</h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-primary flex items-center gap-1">
                        {course.price === 0 ? (
                          <span className="text-sm text-sage-foreground">✓ Incluido</span>
                        ) : (
                          <><DollarSign className="h-3 w-3" />USD {course.price}</>
                        )}
                      </span>
                      <Button size="sm" className="rounded-xl gap-1">
                        <Play className="h-3 w-3" /> Ver curso
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== RECURSOS DIGITALES ===== */}
        <TabsContent value="recursos" className="space-y-4">
          {loading ? <p className="text-muted-foreground">Cargando...</p> : products.length === 0 ? (
            <div className="organic-card p-8 text-center">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Próximamente recursos y materiales para maestros.</p>
              <p className="text-xs text-muted-foreground mt-1">Guías, cuadernillos y herramientas pedagógicas Waldorf.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="organic-card overflow-hidden flex flex-col">
                  {product.cover_url ? (
                    <img src={product.cover_url} alt={product.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-lavender/10 flex items-center justify-center">
                      <File className="h-10 w-10 text-lavender-foreground" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1 space-y-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-lavender/20 text-lavender-foreground font-medium w-fit capitalize">
                      {product.product_type === "maestro" ? "Recurso Waldorf" : product.product_type}
                    </span>
                    <h3 className="font-heading font-bold text-foreground">{product.title}</h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{product.description}</p>
                    )}
                    {product.pages_info && (
                      <p className="text-xs text-primary">{product.pages_info}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{product.author}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-primary flex items-center gap-1 text-sm">
                        {product.price === 0 ? (
                          <span className="text-sage-foreground">✓ Gratis</span>
                        ) : (
                          <><DollarSign className="h-3 w-3" />USD {product.price}</>
                        )}
                      </span>
                      {product.file_url && (
                        <a href={product.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs">
                            <ExternalLink className="h-3 w-3" /> Descargar
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
