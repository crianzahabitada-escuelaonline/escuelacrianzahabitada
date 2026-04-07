import { useState } from "react";
import { ChevronLeft, ChevronRight, Video, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const eventTypes = {
  webinar: { label: "Webinar", color: "bg-sage/20 text-sage-foreground", icon: Video },
  session: { label: "Acompañamiento", color: "bg-terracotta/20 text-terracotta-foreground", icon: Users },
  class: { label: "Ciclo Educativo", color: "bg-lavender/20 text-lavender-foreground", icon: GraduationCap },
};

const events = [
  { id: 1, title: "Webinar: Emociones en la Infancia", day: 12, type: "webinar" as const, time: "18:00", desc: "Charla gratuita sobre cómo acompañar emociones." },
  { id: 2, title: "Acompañamiento Individual", day: 15, type: "session" as const, time: "10:00", desc: "Sesión personalizada de crianza." },
  { id: 3, title: "Ciclo: Comunicación Familiar", day: 18, type: "class" as const, time: "17:00", desc: "Clase semanal del ciclo de comunicación." },
  { id: 4, title: "Charla: Juego Libre", day: 20, type: "webinar" as const, time: "19:00", desc: "El juego como herramienta de desarrollo." },
  { id: 5, title: "Ciclo: Límites Saludables", day: 22, type: "class" as const, time: "17:00", desc: "Clase semanal sobre límites y amor." },
  { id: 6, title: "Acompañamiento Grupal", day: 25, type: "session" as const, time: "11:00", desc: "Sesión grupal para familias." },
];

const daysInMonth = 30;
const firstDayOffset = 2; // Tuesday

export default function Calendario() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const eventDays = new Set(filtered.map((e) => e.day));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Calendario</h1>
        <p className="text-muted-foreground mt-1">Organiza tus acompañamientos, clases y eventos.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} className="rounded-full" onClick={() => setFilter("all")}>Todos</Button>
        {Object.entries(eventTypes).map(([key, val]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            className="rounded-full gap-2"
            onClick={() => setFilter(key)}
          >
            <val.icon className="h-4 w-4" />
            {val.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-3 organic-card p-5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="font-heading font-bold text-foreground">Abril 2026</h3>
            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasEvent = eventDays.has(day);
              return (
                <div
                  key={day}
                  className={`py-2 rounded-xl text-sm relative cursor-pointer transition-colors ${
                    hasEvent
                      ? "bg-primary/10 text-primary font-bold hover:bg-primary/20"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {day}
                  {hasEvent && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-heading font-bold text-foreground">Próximos Eventos</h3>
          {filtered.map((event) => {
            const typeInfo = eventTypes[event.type];
            return (
              <div key={event.id} className="organic-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{event.day} Abr · {event.time}h</span>
                </div>
                <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{event.desc}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl">
                  {event.type === "webinar" ? "Registrarse gratis" : "Reservar turno"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
