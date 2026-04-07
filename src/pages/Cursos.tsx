import { BookOpen, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const courses = [
  { id: 1, title: "Crianza Respetuosa: Primeros Pasos", desc: "Aprende las bases de una crianza basada en el respeto mutuo y la empatía.", lessons: 12, duration: "6h", students: 234, emoji: "🌿", category: "Crianza" },
  { id: 2, title: "Comunicación No Violenta en Familia", desc: "Herramientas para comunicarte con tus hijos de manera amorosa y efectiva.", lessons: 8, duration: "4h", students: 189, emoji: "💛", category: "Comunicación" },
  { id: 3, title: "Límites con Amor", desc: "Cómo establecer límites saludables manteniendo el vínculo afectivo.", lessons: 10, duration: "5h", students: 156, emoji: "🌻", category: "Crianza" },
  { id: 4, title: "El Juego como Herramienta Educativa", desc: "Descubre el poder del juego libre en el desarrollo infantil.", lessons: 6, duration: "3h", students: 312, emoji: "🎨", category: "Educación" },
  { id: 5, title: "Gestión Emocional para Padres", desc: "Cuida tu bienestar emocional para poder acompañar mejor a tus hijos.", lessons: 9, duration: "4.5h", students: 278, emoji: "🧘", category: "Bienestar" },
  { id: 6, title: "Alimentación Consciente en la Infancia", desc: "Una guía para crear hábitos alimentarios saludables desde el amor.", lessons: 7, duration: "3.5h", students: 145, emoji: "🍎", category: "Salud" },
];

export default function Cursos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Cursos Disponibles</h1>
        <p className="text-muted-foreground mt-1">Explora nuestros cursos y empieza tu camino hacia una crianza más consciente.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div key={course.id} className="organic-card overflow-hidden group">
            <div className="h-36 bg-secondary flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
              {course.emoji}
            </div>
            <div className="p-5">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {course.category}
              </span>
              <h3 className="font-heading font-bold text-foreground mt-2 mb-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{course.desc}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.lessons} lecciones</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.students}</span>
              </div>
              <Link to={`/cursos/${course.id}`}>
                <Button className="w-full mt-4 rounded-xl">Ver Curso</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
