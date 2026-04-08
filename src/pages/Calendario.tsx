import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Video, Users, GraduationCap, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const eventTypeConfig: Record<string, { label: string; color: string; icon: typeof Video }> = {
  webinar: { label: "Webinar", color: "bg-sage/20 text-sage-foreground", icon: Video },
  session: { label: "Acompañamiento", color: "bg-terracotta/20 text-terracotta-foreground", icon: Users },
  class: { label: "Ciclo Educativo", color: "bg-lavender/20 text-lavender-foreground", icon: GraduationCap },
};

type CalEvent = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  event_time: string;
  is_public: boolean;
  meeting_url: string;
};

export default function Calendario() {
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [user]);

  async function loadEvents() {
    const { data } = await supabase.from("calendar_events").select("*").order("event_date");
    setEvents((data as CalEvent[]) || []);
    setLoading(false);
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const monthName = currentMonth.toLocaleDateString("es", { month: "long", year: "numeric" });

  const filtered = useMemo(() => {
    let list = events.filter(e => {
      const d = new Date(e.event_date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    if (filter !== "all") list = list.filter(e => e.event_type === filter);
    return list;
  }, [events, filter, month, year]);

  const eventDays = new Set(filtered.map(e => new Date(e.event_date).getDate()));

  const canAccessPrivate = hasActiveSubscription || isAdmin;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Calendario</h1>
        <p className="text-muted-foreground mt-1">Webinars gratuitos, acompañamientos y ciclos educativos.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} className="rounded-full" onClick={() => setFilter("all")}>Todos</Button>
        {Object.entries(eventTypeConfig).map(([key, val]) => (
          <Button key={key} variant={filter === key ? "default" : "outline"} className="rounded-full gap-2" onClick={() => setFilter(key)}>
            <val.icon className="h-4 w-4" /> {val.label}
          </Button>
        ))}
      </div>

      {loading ? <p className="text-muted-foreground">Cargando...</p> : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-3 organic-card p-5">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-heading font-bold text-foreground capitalize">{monthName}</h3>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                <div key={d} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasEvent = eventDays.has(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div key={day} className={`py-2 rounded-xl text-sm relative transition-colors ${
                    hasEvent ? "bg-primary/10 text-primary font-bold hover:bg-primary/20" :
                    isToday ? "bg-muted font-bold text-foreground" : "text-foreground hover:bg-muted"
                  }`}>
                    {day}
                    {hasEvent && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event list */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-heading font-bold text-foreground">Eventos del Mes</h3>
            {filtered.length === 0 ? (
              <div className="organic-card p-6 text-center text-muted-foreground">
                <p>No hay eventos este mes.</p>
              </div>
            ) : (
              filtered.map(event => {
                const typeInfo = eventTypeConfig[event.event_type] || eventTypeConfig.webinar;
                const isPrivate = !event.is_public;
                const locked = isPrivate && !canAccessPrivate;
                return (
                  <div key={event.id} className={`organic-card p-4 ${locked ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString("es", { day: "numeric", month: "short" })} · {event.event_time}h
                      </span>
                      {isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                    {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                    {locked ? (
                      <p className="text-xs text-terracotta-foreground mt-3 bg-terracotta/10 rounded-xl p-2">
                        🔒 Disponible con membresía activa
                      </p>
                    ) : event.meeting_url ? (
                      <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl gap-1">
                          <ExternalLink className="h-3 w-3" /> Unirme
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl" disabled>
                        {event.event_type === "webinar" ? "Próximamente" : "Reservar turno"}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
