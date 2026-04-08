import { useEffect, useState } from "react";
import { BookOpen, Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, description, cover_url, category, is_published, price")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setCourses((coursesData as Course[]) || []);

      // Get lesson counts
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

      setLoading(false);
    }
    load();
  }, []);

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
          {courses.map(course => (
            <div key={course.id} className="organic-card overflow-hidden group">
              <div className="h-48 bg-secondary overflow-hidden">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/30" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {course.category || "General"}
                </span>
                <h3 className="font-heading font-bold text-foreground mt-2 mb-1 text-lg">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{course.description || ""}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="h-3.5 w-3.5" />{lessonCounts[course.id] || 0} lecciones
                    </span>
                  </div>
                  <span className="text-lg font-heading font-bold text-primary">${course.price ?? 10} USD</span>
                </div>
                <Link to={`/cursos/${course.id}`}>
                  <Button className="w-full mt-3 rounded-xl">Ver Curso</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
