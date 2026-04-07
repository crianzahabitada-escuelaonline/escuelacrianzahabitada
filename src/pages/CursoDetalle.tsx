import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle, Download, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const lessons = [
  { id: 1, title: "Introducción: ¿Qué es la crianza respetuosa?", duration: "12:30", completed: true, free: true },
  { id: 2, title: "Los 4 pilares del respeto", duration: "18:45", completed: true, free: true },
  { id: 3, title: "Escucha activa con tus hijos", duration: "22:10", completed: false, free: false },
  { id: 4, title: "Validar emociones sin juicio", duration: "15:20", completed: false, free: false },
  { id: 5, title: "Límites y libertad: el equilibrio", duration: "20:00", completed: false, free: false },
  { id: 6, title: "Resolución de conflictos", duration: "25:15", completed: false, free: false },
];

const downloads = [
  { name: "Guía de Escucha Activa", type: "PDF", size: "2.3 MB" },
  { name: "Ficha de Reflexión Semanal", type: "PDF", size: "1.1 MB" },
  { name: "Plantilla de Comunicación Familiar", type: "PDF", size: "850 KB" },
];

export default function CursoDetalle() {
  const { id } = useParams();
  const [activeLesson, setActiveLesson] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a Cursos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-foreground/5 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Play className="h-7 w-7 text-primary ml-1" />
              </div>
              <p className="text-sm text-muted-foreground">{lessons[activeLesson].title}</p>
              <p className="text-xs text-muted-foreground mt-1">{lessons[activeLesson].duration}</p>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Crianza Respetuosa: Primeros Pasos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Un curso completo para entender y aplicar los principios de la crianza respetuosa en tu día a día.
            </p>
          </div>

          {/* Downloads */}
          <div className="organic-card p-5 space-y-3">
            <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
              <Download className="h-4 w-4" /> Material Descargable
            </h3>
            {downloads.map((dl) => (
              <div key={dl.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-terracotta" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{dl.name}</p>
                    <p className="text-xs text-muted-foreground">{dl.type} · {dl.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-foreground">Contenido del Curso</h3>
          <div className="space-y-2">
            {lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(idx)}
                className={`w-full text-left organic-card p-3 flex items-center gap-3 transition-colors ${
                  idx === activeLesson ? "ring-2 ring-primary" : ""
                }`}
              >
                {lesson.completed ? (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                ) : lesson.free ? (
                  <Play className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
