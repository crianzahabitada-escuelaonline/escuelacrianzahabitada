import { useState, useEffect } from "react";
import { MessageCircle, Heart, Users, Video, FileText, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import GroupManager from "@/components/GroupManager";

type Group = {
  id: string; slug: string; label: string; emoji: string;
  description: string; age_range: string | null; display_order: number;
};

type GroupContent = {
  id: string; group_id: string; title: string; description: string | null;
  content_type: string; file_url: string | null; cover_url: string | null;
  duration: string | null; is_published: boolean;
};

export default function Comunidad() {
  const { user, hasActiveSubscription, isAdmin } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState("");
  const [content, setContent] = useState<GroupContent[]>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (user) loadUserGroups();
  }, [user]);

  useEffect(() => {
    if (activeGroup && user) loadContent(activeGroup);
  }, [activeGroup, user]);

  async function loadGroups() {
    const { data } = await supabase.from("community_groups").select("*").order("display_order");
    if (data) {
      setGroups(data);
      if (data.length > 0) setActiveGroup(data[0].id);
    }
    setLoading(false);
  }

  async function loadUserGroups() {
    if (!user) return;
    // Direct memberships
    const { data: directMemberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    // Memberships via students (tutor)
    const { data: myStudents } = await supabase
      .from("students")
      .select("id")
      .eq("tutor_id", user.id);
    
    let studentMemberships: { group_id: string }[] = [];
    if (myStudents && myStudents.length > 0) {
      const studentIds = myStudents.map(s => s.id);
      const { data } = await supabase
        .from("student_groups")
        .select("group_id")
        .in("student_id", studentIds);
      studentMemberships = data || [];
    }

    const groupIds = new Set<string>();
    directMemberships?.forEach(m => groupIds.add(m.group_id));
    studentMemberships.forEach(m => groupIds.add(m.group_id));
    setUserGroups(Array.from(groupIds));
  }

  async function loadContent(groupId: string) {
    const { data } = await supabase
      .from("group_content")
      .select("*")
      .eq("group_id", groupId)
      .eq("is_published", true)
      .order("display_order");
    setContent(data || []);
  }

  const currentGroup = groups.find(g => g.id === activeGroup);
  const isMember = isAdmin || userGroups.includes(activeGroup);

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Comunidad Crianza Habitada</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Iniciá sesión para acceder a la comunidad.
          </p>
          <Button className="mt-4 rounded-xl" asChild>
            <a href="/auth">Iniciar Sesión</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription && !isAdmin) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Comunidad Crianza Habitada</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            La comunidad está disponible para miembros con suscripción activa.
            Activa tu membresía para unirte.
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

      {/* Group selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {groups.map((group) => {
          const memberOfGroup = isAdmin || userGroups.includes(group.id);
          return (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`organic-card p-3 text-center transition-all relative ${
                activeGroup === group.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-secondary/50"
              } ${!memberOfGroup ? "opacity-50" : ""}`}
            >
              <span className="text-2xl block mb-1">{group.emoji}</span>
              <p className="text-xs font-medium text-foreground">{group.label}</p>
              {group.age_range && (
                <p className="text-[10px] text-muted-foreground">{group.age_range}</p>
              )}
              {!memberOfGroup && (
                <Lock className="h-3 w-3 text-muted-foreground absolute top-2 right-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Group header */}
      {currentGroup && (
        <div className="organic-card p-4 flex items-center gap-3">
          <span className="text-3xl">{currentGroup.emoji}</span>
          <div>
            <h2 className="font-heading font-bold text-foreground">{currentGroup.label}</h2>
            <p className="text-sm text-muted-foreground">{currentGroup.description}</p>
          </div>
          {!isMember && (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" /> Sin acceso
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {isMember ? (
        content.length === 0 ? (
          <div className="organic-card p-10 text-center">
            <Video className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-heading font-bold text-foreground mb-1">Sin contenido aún</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Próximamente se agregarán videos y recursos para {currentGroup?.label}.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map(c => (
              <div key={c.id} className="organic-card overflow-hidden flex flex-col">
                {c.cover_url ? (
                  <img src={c.cover_url} alt={c.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className={`w-full h-40 flex items-center justify-center ${
                    c.content_type === "video" ? "bg-primary/10" : "bg-lavender/10"
                  }`}>
                    {c.content_type === "video" ? (
                      <Play className="h-10 w-10 text-primary" />
                    ) : (
                      <FileText className="h-10 w-10 text-lavender-foreground" />
                    )}
                  </div>
                )}
                <div className="p-4 space-y-2 flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.content_type === "video"
                      ? "bg-primary/10 text-primary"
                      : "bg-lavender/20 text-lavender-foreground"
                  }`}>
                    {c.content_type === "video" ? "🎥 Video" : "📄 Recurso"}
                  </span>
                  <h3 className="font-heading font-bold text-foreground">{c.title}</h3>
                  {c.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  )}
                  {c.duration && (
                    <p className="text-xs text-muted-foreground">⏱ {c.duration}</p>
                  )}
                  {c.file_url && c.content_type === "video" && (
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="rounded-xl gap-1 w-full mt-2">
                        <Play className="h-3 w-3" /> Ver video
                      </Button>
                    </a>
                  )}
                  {c.file_url && c.content_type === "product" && (
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="rounded-xl gap-1 w-full mt-2">
                        <FileText className="h-3 w-3" /> Ver recurso
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="organic-card p-10 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-heading font-bold text-foreground mb-1">Contenido exclusivo</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            No tenés acceso a este grupo. Contactá con la administración para ser asignada.
          </p>
        </div>
      )}

      {/* Admin: Group Management */}
      {isAdmin && (
        <div className="pt-6 border-t border-border">
          <GroupManager />
        </div>
      )}
    </div>
  );
}
