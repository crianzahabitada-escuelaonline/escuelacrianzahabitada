import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Leaf, LogIn, UserPlus } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [reg, setReg] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    homeschoolExperience: "",
    motivation: "",
    // Child
    childName: "",
    childDob: "",
    childAge: "",
    specialNeeds: "",
    previousEducation: "",
    languages: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Bienvenida de vuelta!");
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.fullName || !reg.email || !reg.password || !reg.childName) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: reg.email,
      password: reg.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: reg.fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Update profile with extra data
      await supabase.from("profiles").update({
        full_name: reg.fullName,
        phone: reg.phone,
        country: reg.country,
        homeschool_experience: reg.homeschoolExperience,
        motivation: reg.motivation,
      }).eq("id", data.user.id);

      // Add student
      await supabase.from("students").insert({
        tutor_id: data.user.id,
        full_name: reg.childName,
        date_of_birth: reg.childDob || null,
        age: reg.childAge ? parseInt(reg.childAge) : null,
        special_needs: reg.specialNeeds,
        previous_education: reg.previousEducation,
        languages: reg.languages,
      });
    }

    setLoading(false);
    toast.success("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Crianza Habitada</h1>
          </div>
          <p className="text-muted-foreground">Escuela Online de Crianza Consciente</p>
          <p className="text-sm text-muted-foreground mt-1">Dra. Paola Patricelli</p>
        </div>

        <div className="organic-card p-6">
          {/* Tab buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "login" ? "default" : "outline"}
              className="flex-1 rounded-xl gap-2"
              onClick={() => setMode("login")}
            >
              <LogIn className="h-4 w-4" /> Iniciar Sesión
            </Button>
            <Button
              variant={mode === "register" ? "default" : "outline"}
              className="flex-1 rounded-xl gap-2"
              onClick={() => setMode("register")}
            >
              <UserPlus className="h-4 w-4" /> Inscribirme
            </Button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Correo electrónico</Label>
                <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="login-password">Contraseña</Label>
                <Input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                  🌿 Datos del Tutor/a
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>Nombre completo *</Label>
                    <Input value={reg.fullName} onChange={e => setReg({...reg, fullName: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Correo electrónico *</Label>
                    <Input type="email" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Contraseña *</Label>
                    <Input type="password" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} required minLength={6} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Teléfono</Label>
                      <Input value={reg.phone} onChange={e => setReg({...reg, phone: e.target.value})} />
                    </div>
                    <div>
                      <Label>País</Label>
                      <Input value={reg.country} onChange={e => setReg({...reg, country: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label>Experiencia con homeschooling</Label>
                    <Textarea value={reg.homeschoolExperience} onChange={e => setReg({...reg, homeschoolExperience: e.target.value})} placeholder="Cuéntanos si tienes experiencia previa..." rows={2} />
                  </div>
                  <div>
                    <Label>Motivación para unirte</Label>
                    <Textarea value={reg.motivation} onChange={e => setReg({...reg, motivation: e.target.value})} placeholder="¿Qué te motiva a unirte a nuestra escuela?" rows={2} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                  🌻 Datos del Niño/a
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>Nombre completo del niño/a *</Label>
                    <Input value={reg.childName} onChange={e => setReg({...reg, childName: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Fecha de nacimiento</Label>
                      <Input type="date" value={reg.childDob} onChange={e => setReg({...reg, childDob: e.target.value})} />
                    </div>
                    <div>
                      <Label>Edad</Label>
                      <Input type="number" min="0" max="18" value={reg.childAge} onChange={e => setReg({...reg, childAge: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label>Necesidades especiales</Label>
                    <Textarea value={reg.specialNeeds} onChange={e => setReg({...reg, specialNeeds: e.target.value})} placeholder="Si aplica, cuéntanos aquí..." rows={2} />
                  </div>
                  <div>
                    <Label>Nivel educativo previo</Label>
                    <Input value={reg.previousEducation} onChange={e => setReg({...reg, previousEducation: e.target.value})} placeholder="Ej: Jardín de infantes, primer grado..." />
                  </div>
                  <div>
                    <Label>Idiomas</Label>
                    <Input value={reg.languages} onChange={e => setReg({...reg, languages: e.target.value})} placeholder="Ej: Español, Inglés..." />
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 text-sm">
                <p className="font-medium text-foreground">💰 Membresía mensual: USD $97/mes</p>
                <p className="text-muted-foreground mt-1">
                  Después de registrarte, podrás activar tu membresía para acceder a todos los cursos y recursos de la escuela. 
                  El pago se procesa a través de Mercado Pago.
                </p>
              </div>

              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Registrando..." : "Registrarme en la Escuela"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          También ayudamos con la inscripción a la Escuela Paraguas ROYAL de Estados Unidos
        </p>
      </div>
    </div>
  );
}
