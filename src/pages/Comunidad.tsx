import { useState } from "react";
import { MessageCircle, Heart, Users, GraduationCap, Baby, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type CommunitySection = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  emoji: string;
  ageRange?: string;
};

const sections: CommunitySection[] = [
  { id: "preescolar", label: "Preescolar", icon: Baby, description: "Familias con niños de 3 a 5 años", emoji: "🌱", ageRange: "3-5 años" },
  { id: "primaria-baja", label: "Primaria Baja", icon: BookOpen, description: "Familias con niños de 6 a 8 años (1° a 3° grado)", emoji: "🌿", ageRange: "6-8 años" },
  { id: "primaria-alta", label: "Primaria Alta", icon: GraduationCap, description: "Familias con niños de 9 a 11 años (4° a 6° grado)", emoji: "🌳", ageRange: "9-11 años" },
  { id: "secundaria", label: "Secundaria", icon: GraduationCap, description: "Familias con adolescentes de 12 a 15 años", emoji: "🍃", ageRange: "12-15 años" },
  { id: "padres", label: "Solo Padres", icon: Users, description: "Espacio exclusivo para madres y padres", emoji: "💛" },
  { id: "educadores", label: "Educadores", icon: Shield, description: "Comunidad de docentes y facilitadores", emoji: "📚" },
];

const samplePosts: Record<string, { id: number; avatar: string; name: string; content: string; likes: number; replies: number; time: string }[]> = {
  preescolar: [
    { id: 1, avatar: "🌸", name: "María G.", content: "¿Qué actividades sensoriales recomiendan para niños de 4 años? Estamos empezando con la mesa de estaciones 🍂", likes: 8, replies: 5, time: "Hace 2h" },
    { id: 2, avatar: "🦋", name: "Ana L.", content: "Hoy hicimos pan casero con mi pequeña. ¡Le encantó amasar! La mejor actividad Waldorf para preescolar 🍞", likes: 15, replies: 3, time: "Hace 5h" },
  ],
  "primaria-baja": [
    { id: 3, avatar: "🌻", name: "Laura P.", content: "¿Cómo manejan la lectoescritura en primer grado con enfoque Waldorf? Mi hijo tiene 6 años 📖", likes: 12, replies: 8, time: "Hace 1h" },
    { id: 4, avatar: "🐝", name: "Carmen R.", content: "Compartimos nuestro cuaderno de época sobre los animales de la granja. ¡Quedó hermoso! 🐄", likes: 20, replies: 6, time: "Hace 3h" },
  ],
  "primaria-alta": [
    { id: 5, avatar: "🦉", name: "Patricia M.", content: "Mi hija de 10 años empezó a estudiar astronomía. ¿Alguien tiene recursos Waldorf para 5° grado? 🌟", likes: 9, replies: 4, time: "Hace 4h" },
  ],
  secundaria: [
    { id: 6, avatar: "🍃", name: "Roberto S.", content: "¿Cómo acompañan a sus adolescentes en la transición? Mi hijo de 13 necesita más autonomía 🌊", likes: 11, replies: 7, time: "Hace 2h" },
  ],
  padres: [
    { id: 7, avatar: "💛", name: "Sofía V.", content: "Necesito consejos para no sentirme sola en el camino del homeschooling. ¿Cómo manejan la presión social? 🤗", likes: 25, replies: 18, time: "Hace 1h" },
    { id: 8, avatar: "🌺", name: "Diego M.", content: "Como papá homeschooler, a veces me siento fuera de lugar. ¿Hay más papás por aquí? 💪", likes: 30, replies: 12, time: "Hace 3h" },
  ],
  educadores: [
    { id: 9, avatar: "📚", name: "Prof. Elena", content: "Comparto mi planificación trimestral para 2° grado basada en pedagogía Waldorf. ¿Alguien quiere intercambiar? ✨", likes: 18, replies: 10, time: "Hace 2h" },
    { id: 10, avatar: "🎨", name: "Maestra Lucía", content: "Taller de acuarela húmedo sobre húmedo: tips para trabajar con grupos grandes de niños 🎨", likes: 22, replies: 8, time: "Hace 5h" },
  ],
};

export default function Comunidad() {
  const [activeSection, setActiveSection] = useState("preescolar");
  const { hasActiveSubscription, isAdmin } = useAuth();

  const currentSection = sections.find(s => s.id === activeSection)!;
  const posts = samplePosts[activeSection] || [];

  if (!hasActiveSubscription && !isAdmin) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Comunidad Crianza Habitada</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            La comunidad está disponible para miembros con suscripción activa. 
            Activa tu membresía para unirte a las conversaciones.
          </p>
          <Button className="mt-4 rounded-xl" asChild>
            <a href="/membresia">Activar Membresía</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Comunidad 🌟</h1>
        <p className="text-muted-foreground mt-1">Conecta con familias y educadores en tu misma etapa.</p>
      </div>

      {/* Section selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`organic-card p-3 text-center transition-all ${
              activeSection === section.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-secondary/50"
            }`}
          >
            <span className="text-2xl block mb-1">{section.emoji}</span>
            <p className="text-xs font-medium text-foreground">{section.label}</p>
            {section.ageRange && (
              <p className="text-[10px] text-muted-foreground">{section.ageRange}</p>
            )}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="organic-card p-4 flex items-center gap-3">
        <currentSection.icon className="h-6 w-6 text-primary" />
        <div>
          <h2 className="font-heading font-bold text-foreground">{currentSection.label}</h2>
          <p className="text-sm text-muted-foreground">{currentSection.description}</p>
        </div>
      </div>

      {/* New post */}
      <div className="organic-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentSection.emoji}</span>
          <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
            ¿Qué quieres compartir en {currentSection.label}? ✨
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="organic-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{post.avatar}</span>
              <div>
                <p className="font-medium text-foreground">{post.name}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
              </div>
            </div>
            <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-terracotta transition-colors">
                <Heart className="h-4 w-4" /> {post.likes}
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4" /> {post.replies} respuestas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
