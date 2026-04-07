import { BookOpen, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import coverLecto from "@/assets/cover-lectoescritura.jpg";
import coverHomeschool from "@/assets/cover-homeschooling.jpg";

const courses = [
  {
    id: 1,
    title: "Lectoescritura",
    desc: "Acompaña el proceso de lectura y escritura de tus hijos desde una mirada respetuosa, creativa y conectada con su ritmo natural de desarrollo.",
    lessons: 10,
    duration: "5h",
    students: 120,
    image: coverLecto,
    category: "Educación",
  },
  {
    id: 2,
    title: "Cómo Iniciar en el Homeschooling",
    desc: "Todo lo que necesitás saber para comenzar a educar en casa: organización, recursos, marco legal, rutinas y cómo crear un ambiente de aprendizaje amoroso.",
    lessons: 8,
    duration: "4h",
    students: 95,
    image: coverHomeschool,
    category: "Homeschooling",
  },
];

export default function Cursos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Cursos Disponibles</h1>
        <p className="text-muted-foreground mt-1">Explora nuestros cursos y empieza tu camino hacia una crianza más consciente.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="organic-card overflow-hidden group">
            <div className="h-48 bg-secondary overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {course.category}
              </span>
              <h3 className="font-heading font-bold text-foreground mt-2 mb-1 text-lg">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{course.desc}</p>
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
