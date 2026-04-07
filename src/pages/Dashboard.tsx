import { BookOpen, Calendar, Play, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const myCourses = [
  { id: 1, title: "Crianza Respetuosa: Primeros Pasos", progress: 65, lessons: 12, image: "🌿" },
  { id: 2, title: "Comunicación No Violenta en Familia", progress: 30, lessons: 8, image: "💛" },
  { id: 3, title: "Límites con Amor", progress: 0, lessons: 10, image: "🌻" },
];

const upcomingEvents = [
  { id: 1, title: "Webinar: Emociones en la Infancia", date: "12 Abr", time: "18:00", type: "webinar" },
  { id: 2, title: "Acompañamiento Individual", date: "15 Abr", time: "10:00", type: "session" },
  { id: 3, title: "Charla: Juego Libre y Creatividad", date: "20 Abr", time: "19:00", type: "webinar" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-3xl bg-secondary p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          ¡Bienvenida a tu espacio! 🌱
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Un lugar donde la crianza se vive con presencia, amor y comunidad. Explora tus cursos, conecta con otros padres y sigue creciendo.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quick stats */}
        {[
          { icon: BookOpen, label: "Cursos Activos", value: "2", color: "bg-primary/10 text-primary" },
          { icon: Play, label: "Lecciones Completadas", value: "14", color: "bg-terracotta/20 text-terracotta-foreground" },
          { icon: Calendar, label: "Próximo Evento", value: "12 Abr", color: "bg-sage/20 text-sage-foreground" },
        ].map((stat) => (
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
        {/* My Courses */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-foreground">Mis Cursos</h2>
            <Link to="/cursos" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {myCourses.map((course) => (
              <div key={course.id} className="organic-card p-4 flex items-center gap-4">
                <div className="text-3xl">{course.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.lessons} lecciones</p>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">{course.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-foreground">Próximos Eventos</h2>
            <Link to="/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
              Calendario <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="organic-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.date} · {event.time}h
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      event.type === "webinar"
                        ? "bg-sage/20 text-sage-foreground"
                        : "bg-terracotta/20 text-terracotta-foreground"
                    }`}
                  >
                    {event.type === "webinar" ? "Webinar" : "Sesión"}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl">
                  {event.type === "webinar" ? "Registrarse" : "Ver detalles"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
