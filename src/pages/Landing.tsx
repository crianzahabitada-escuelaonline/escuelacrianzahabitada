import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Calendar, Star, Heart, Leaf, Sparkles, GraduationCap, Baby, Palette, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/landing-hero.jpg";
import communityImg from "@/assets/landing-community.jpg";

const pillars = [
  {
    icon: Baby,
    title: "Acompañamiento al Niño",
    description: "Clases semanales en vivo, tareas guiadas y seguimiento personalizado con maestra Waldorf. Una escuela real, con ritmo y calidez.",
    color: "primary",
  },
  {
    icon: Heart,
    title: "Acompañamiento a Padres y Tutores",
    description: "Formación, encuentros y herramientas para que puedas acompañar la infancia con seguridad, presencia y consciencia.",
    color: "accent",
  },
  {
    icon: GraduationCap,
    title: "Espacio para Educadores",
    description: "Recursos exclusivos, cursos de formación y acompañamiento profesional para educadores que desean integrar la pedagogía Waldorf.",
    color: "terracotta",
  },
  {
    icon: HeartHandshake,
    title: "Sesiones Terapéuticas",
    description: "Espacios de contención y terapia para padres y familias. Acompañamiento emocional en el camino de la crianza consciente.",
    color: "lavender",
  },
];

const features = [
  {
    icon: BookOpen,
    title: "Cursos y Clases Semanales",
    description: "Contenido en video con pedagogía Waldorf: clases para niños, formación para padres y recursos para educadores.",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Conectá con familias y educadores que comparten el mismo camino. Foros, grupos y apoyo constante.",
  },
  {
    icon: Calendar,
    title: "Encuentros en Vivo",
    description: "Webinars, talleres, clases semanales y círculos de acompañamiento con maestra Waldorf.",
  },
  {
    icon: Palette,
    title: "Recursos y E-books",
    description: "Guías, cuadernillos y materiales descargables para cada etapa del desarrollo infantil.",
  },
];

const testimonials = [
  {
    name: "María G.",
    text: "Crianza Habitada me dio las herramientas para conectar con mis hijos desde un lugar más amoroso y presente.",
  },
  {
    name: "Laura P.",
    text: "Los cursos y la comunidad transformaron nuestra manera de hacer homeschool. ¡Gracias, Paola!",
  },
  {
    name: "Andrea S.",
    text: "Cada recurso está hecho con tanto cuidado y cariño. Se nota la pedagogía Waldorf en cada detalle.",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  accent: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  terracotta: { bg: "bg-terracotta/10", text: "text-terracotta", border: "border-terracotta/20" },
  lavender: { bg: "bg-lavender/10", text: "text-lavender", border: "border-lavender/20" },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">Crianza Habitada</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/ebooks">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Tienda</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="rounded-xl">Ingresar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" /> Membresía Anual · Pedagogía Waldorf
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
              Tu escuela de <span className="text-primary">acompañamiento</span> Waldorf online
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Una membresía anual con maestra Waldorf que acompaña a niños con clases semanales, tareas y seguimiento — y a padres, tutores y educadores con formación, comunidad y contención.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="rounded-xl gap-2 text-base">
                  Unirme a la escuela <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ebooks">
                <Button size="lg" variant="outline" className="rounded-xl text-base">
                  Ver recursos
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-border">
              <img
                src={heroImg}
                alt="Madre e hija caminando por un prado con flores silvestres, estilo acuarela Waldorf"
                width={1920}
                height={1080}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-lg border border-border hidden md:block">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                <span className="font-heading font-bold text-foreground">+500 familias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">nos acompañan en este camino</p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Pillars */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" /> ¿Qué incluye la membresía?
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Cuatro pilares de acompañamiento
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Crianza Habitada es mucho más que cursos online: es una escuela viva con acompañamiento real, semanal y personalizado.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {pillars.map((p) => {
              const colors = colorMap[p.color] || colorMap.primary;
              return (
                <div key={p.title} className={`organic-card p-6 border ${colors.border} hover:shadow-md transition-shadow`}>
                  <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center mb-4`}>
                    <p.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Todo lo que necesitás en un solo lugar
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Herramientas, cursos y comunidad para que tu familia florezca con la guía de la pedagogía Waldorf.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="organic-card p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Community */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-border">
            <img
              src={communityImg}
              alt="Niños jugando con juguetes de madera en un espacio cálido Waldorf"
              width={800}
              height={600}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Creada por Paola Patricelli
            </h2>
            <p className="text-muted-foreground">
              Educadora Waldorf, madre y guía de cientos de familias que buscan una crianza más consciente y conectada. Con más de 10 años de experiencia acompañando el desarrollo infantil.
            </p>
            <p className="text-muted-foreground">
              Crianza Habitada nació como una escuela de acompañamiento real: con clases semanales para los niños, formación para los padres, herramientas para educadores y espacios terapéuticos para toda la familia.
            </p>
            <Link to="/auth">
              <Button className="rounded-xl gap-2 mt-2">
                Únete a la escuela <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-10">
            Lo que dicen nuestras familias
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="organic-card p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm italic mb-4">"{t.text}"</p>
                <p className="font-heading font-bold text-foreground text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="organic-card p-8 md:p-12 bg-primary/5 border-primary/20">
            <Leaf className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Tu familia merece este acompañamiento
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Accedé a la escuela completa: clases semanales para niños, formación para padres, espacio para educadores, sesiones terapéuticas, comunidad y todos los recursos.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="rounded-xl gap-2 text-base">
                  Comenzar mi membresía <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ebooks">
                <Button size="lg" variant="outline" className="rounded-xl text-base">
                  Explorar tienda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="font-heading font-bold text-foreground">Crianza Habitada</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Crianza Habitada. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
