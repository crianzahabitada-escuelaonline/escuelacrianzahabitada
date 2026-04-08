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

export default function Comunidad() {
  const [activeSection, setActiveSection] = useState("preescolar");
  const { hasActiveSubscription, isAdmin } = useAuth();

  const currentSection = sections.find(s => s.id === activeSection)!;

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

      {/* Empty state */}
      <div className="organic-card p-10 text-center">
        <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <h3 className="font-heading font-bold text-foreground mb-1">Aún no hay publicaciones</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Sé el primero en compartir algo en {currentSection.label}. ¡Tu experiencia puede inspirar a otras familias!
        </p>
      </div>
    </div>
  );
}
