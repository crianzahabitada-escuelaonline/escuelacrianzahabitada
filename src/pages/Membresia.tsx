import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Star, Shield, BookOpen, Users, Download } from "lucide-react";
import { useState } from "react";

export default function Membresia() {
  const { user, hasActiveSubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-mp-preference", {
        body: { user_id: user.id, email: user.email },
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error("No se pudo crear el link de pago");
      }
    } catch (err: any) {
      toast.error("Error al iniciar el pago: " + (err.message || "Intenta de nuevo"));
    }
    setLoading(false);
  }

  const benefits = [
    { icon: BookOpen, text: "Acceso ilimitado a todos los cursos" },
    { icon: Download, text: "Descarga de materiales y guías" },
    { icon: Users, text: "Comunidad de familias conscientes" },
    { icon: Star, text: "Contenido exclusivo mensual" },
    { icon: Shield, text: "Asesoría para inscripción Escuela ROYAL (EEUU)" },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">Membresía Escuela Online</h1>
        <p className="text-muted-foreground mt-1">Accede a todo el contenido con tu membresía mensual</p>
      </div>

      {hasActiveSubscription ? (
        <div className="organic-card p-8 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-foreground">¡Tu membresía está activa!</h2>
          <p className="text-muted-foreground mt-2">
            Tienes acceso completo a todos los cursos y recursos de la escuela.
          </p>
        </div>
      ) : (
        <div className="organic-card p-8 text-center">
          <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-3xl font-heading font-bold text-primary">USD $97</span>
            <span className="text-muted-foreground">/mes</span>
          </div>

          <h2 className="text-xl font-heading font-bold text-foreground mb-4">
            Plan Mensual Completo
          </h2>

          <div className="text-left space-y-3 mb-6">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <b.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{b.text}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleSubscribe} disabled={loading} className="w-full rounded-xl text-lg py-6 gap-2">
            {loading ? "Preparando pago..." : "Suscribirme con Mercado Pago"}
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            Pago seguro procesado por Mercado Pago. Puedes cancelar en cualquier momento.
          </p>
        </div>
      )}

      {/* ROYAL section */}
      <div className="organic-card p-6">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-heading font-bold text-foreground">Escuela Paraguas ROYAL - Estados Unidos</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Ayudamos a las familias que hacen educación en el hogar con la inscripción en la 
              Escuela Paraguas ROYAL de Estados Unidos, proporcionando cobertura legal y 
              certificación académica reconocida internacionalmente.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Consulta con nosotros para más información: <span className="text-primary font-medium">crianzahabitada@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
