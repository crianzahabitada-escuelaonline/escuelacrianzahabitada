import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Trash2, Video, FileText, Users, UserPlus, X, Upload,
} from "lucide-react";

type Group = {
  id: string; slug: string; label: string; emoji: string;
  description: string; age_range: string | null; display_order: number;
};

type GroupContent = {
  id: string; group_id: string; title: string; description: string | null;
  content_type: string; file_url: string | null; cover_url: string | null;
  duration: string | null; is_published: boolean; display_order: number;
};

type Profile = { id: string; full_name: string; email: string };
type Student = { id: string; full_name: string; tutor_id: string };
type GroupMember = { id: string; group_id: string; user_id: string };
type StudentGroup = { id: string; group_id: string; student_id: string };

export default function GroupManager() {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [content, setContent] = useState<GroupContent[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Content dialog
  const [contentOpen, setContentOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<GroupContent | null>(null);
  const [contentForm, setContentForm] = useState({
    title: "", description: "", content_type: "video", file_url: "", cover_url: "", duration: "", is_published: true,
  });
  const [saving, setSaving] = useState(false);

  // Member dialog
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberType, setMemberType] = useState<"user" | "student">("user");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    loadGroups();
    loadProfiles();
    loadStudents();
  }, [isAdmin]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData(selectedGroup);
    }
  }, [selectedGroup]);

  async function loadGroups() {
    const { data } = await supabase.from("community_groups").select("*").order("display_order");
    if (data) {
      setGroups(data);
      if (data.length > 0 && !selectedGroup) setSelectedGroup(data[0].id);
    }
    setLoading(false);
  }

  async function loadProfiles() {
    const { data } = await supabase.from("profiles").select("id, full_name, email").order("full_name");
    if (data) setProfiles(data);
  }

  async function loadStudents() {
    const { data } = await supabase.from("students").select("id, full_name, tutor_id").order("full_name");
    if (data) setStudents(data);
  }

  async function loadGroupData(groupId: string) {
    const [contentRes, membersRes, studentGroupsRes] = await Promise.all([
      supabase.from("group_content").select("*").eq("group_id", groupId).order("display_order"),
      supabase.from("group_members").select("*").eq("group_id", groupId),
      supabase.from("student_groups").select("*").eq("group_id", groupId),
    ]);
    setContent(contentRes.data || []);
    setGroupMembers(membersRes.data || []);
    setStudentGroups(studentGroupsRes.data || []);
  }

  const currentGroup = groups.find(g => g.id === selectedGroup);

  // Content CRUD
  const openNewContent = () => {
    setEditingContent(null);
    setContentForm({ title: "", description: "", content_type: "video", file_url: "", cover_url: "", duration: "", is_published: true });
    setContentOpen(true);
  };

  const openEditContent = (c: GroupContent) => {
    setEditingContent(c);
    setContentForm({
      title: c.title, description: c.description || "", content_type: c.content_type,
      file_url: c.file_url || "", cover_url: c.cover_url || "", duration: c.duration || "", is_published: c.is_published,
    });
    setContentOpen(true);
  };

  const saveContent = async () => {
    if (!contentForm.title.trim()) { toast.error("El título es obligatorio"); return; }
    setSaving(true);
    try {
      const payload = {
        group_id: selectedGroup,
        title: contentForm.title.trim(),
        description: contentForm.description.trim(),
        content_type: contentForm.content_type,
        file_url: contentForm.file_url.trim(),
        cover_url: contentForm.cover_url.trim(),
        duration: contentForm.duration.trim(),
        is_published: contentForm.is_published,
      };
      if (editingContent) {
        const { error } = await supabase.from("group_content").update(payload).eq("id", editingContent.id);
        if (error) throw error;
        toast.success("Contenido actualizado");
      } else {
        const { error } = await supabase.from("group_content").insert(payload);
        if (error) throw error;
        toast.success("Contenido agregado");
      }
      setContentOpen(false);
      loadGroupData(selectedGroup);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const deleteContent = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    const { error } = await supabase.from("group_content").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Contenido eliminado");
    loadGroupData(selectedGroup);
  };

  // Member management
  const addMember = async () => {
    try {
      if (memberType === "user" && selectedUserId) {
        const { error } = await supabase.from("group_members").insert({ group_id: selectedGroup, user_id: selectedUserId });
        if (error) throw error;
        toast.success("Miembro agregado al grupo");
      } else if (memberType === "student" && selectedStudentId) {
        const { error } = await supabase.from("student_groups").insert({ group_id: selectedGroup, student_id: selectedStudentId });
        if (error) throw error;
        toast.success("Estudiante agregado al grupo");
      }
      setMemberOpen(false);
      setSelectedUserId("");
      setSelectedStudentId("");
      loadGroupData(selectedGroup);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from("group_members").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Miembro removido");
    loadGroupData(selectedGroup);
  };

  const removeStudentGroup = async (id: string) => {
    const { error } = await supabase.from("student_groups").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Estudiante removido del grupo");
    loadGroupData(selectedGroup);
  };

  const profileName = (userId: string) => {
    const p = profiles.find(pr => pr.id === userId);
    return p ? (p.full_name || p.email) : userId.slice(0, 8);
  };

  const studentName = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    return s?.full_name || studentId.slice(0, 8);
  };

  // Filter out already-added members
  const availableUsers = profiles.filter(p => !groupMembers.some(gm => gm.user_id === p.id));
  const availableStudents = students.filter(s => !studentGroups.some(sg => sg.student_id === s.id));

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-foreground">Gestión de Grupos</h2>
      </div>

      {/* Group selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`organic-card p-3 text-center transition-all ${
              selectedGroup === g.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-secondary/50"
            }`}
          >
            <span className="text-2xl block mb-1">{g.emoji}</span>
            <p className="text-xs font-medium text-foreground">{g.label}</p>
            {g.age_range && <p className="text-[10px] text-muted-foreground">{g.age_range}</p>}
          </button>
        ))}
      </div>

      {currentGroup && (
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="rounded-xl">
            <TabsTrigger value="content" className="rounded-xl gap-1">
              <Video className="h-4 w-4" /> Contenido
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-xl gap-1">
              <Users className="h-4 w-4" /> Miembros
            </TabsTrigger>
          </TabsList>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Videos y productos digitales de <strong>{currentGroup.label}</strong>
              </p>
              <Button size="sm" onClick={openNewContent}>
                <Plus className="h-4 w-4 mr-1" /> Agregar contenido
              </Button>
            </div>

            {content.length === 0 ? (
              <div className="organic-card p-8 text-center">
                <Video className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No hay contenido en este grupo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {content.map(c => (
                  <div key={c.id} className="organic-card p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${c.content_type === "video" ? "bg-primary/10" : "bg-lavender/20"}`}>
                      {c.content_type === "video" ? (
                        <Video className="h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-lavender-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">{c.title}</h3>
                        {!c.is_published && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Borrador</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.content_type === "video" ? "Video" : "Producto digital"}
                        {c.duration ? ` · ${c.duration}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditContent(c)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Editar">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteContent(c.id, c.title)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" aria-label="Eliminar">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MEMBERS TAB */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Miembros de <strong>{currentGroup.label}</strong>
              </p>
              <Button size="sm" onClick={() => { setMemberOpen(true); setMemberType("user"); setSelectedUserId(""); setSelectedStudentId(""); }}>
                <UserPlus className="h-4 w-4 mr-1" /> Agregar miembro
              </Button>
            </div>

            {/* Users */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Maestros y Padres</h3>
              {groupMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin miembros aún.</p>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map(gm => (
                    <div key={gm.id} className="organic-card p-3 flex items-center justify-between">
                      <span className="text-sm text-foreground">{profileName(gm.user_id)}</span>
                      <button onClick={() => removeMember(gm.id)} className="p-1 rounded hover:bg-destructive/10">
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Students */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Estudiantes</h3>
              {studentGroups.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin estudiantes aún.</p>
              ) : (
                <div className="space-y-2">
                  {studentGroups.map(sg => (
                    <div key={sg.id} className="organic-card p-3 flex items-center justify-between">
                      <span className="text-sm text-foreground">{studentName(sg.student_id)}</span>
                      <button onClick={() => removeStudentGroup(sg.id)} className="p-1 rounded hover:bg-destructive/10">
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Content Dialog */}
      <Dialog open={contentOpen} onOpenChange={setContentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingContent ? "Editar Contenido" : "Agregar Contenido"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <Select value={contentForm.content_type} onValueChange={v => setContentForm({ ...contentForm, content_type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="product">Producto digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Título *</label>
              <Input className="mt-1" value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} placeholder="Título del contenido" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Textarea className="mt-1" rows={3} value={contentForm.description} onChange={e => setContentForm({ ...contentForm, description: e.target.value })} placeholder="Descripción…" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">URL del archivo</label>
              <Input className="mt-1" value={contentForm.file_url} onChange={e => setContentForm({ ...contentForm, file_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">URL de portada</label>
                <Input className="mt-1" value={contentForm.cover_url} onChange={e => setContentForm({ ...contentForm, cover_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Duración</label>
                <Input className="mt-1" value={contentForm.duration} onChange={e => setContentForm({ ...contentForm, duration: e.target.value })} placeholder="Ej: 15 min" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_published" checked={contentForm.is_published} onChange={e => setContentForm({ ...contentForm, is_published: e.target.checked })} className="rounded" />
              <label htmlFor="is_published" className="text-sm text-foreground">Publicado (visible para miembros)</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setContentOpen(false)}>Cancelar</Button>
              <Button onClick={saveContent} disabled={saving}>{saving ? "Guardando…" : editingContent ? "Guardar" : "Agregar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Agregar Miembro a {currentGroup?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Tipo de miembro</label>
              <Select value={memberType} onValueChange={v => setMemberType(v as "user" | "student")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Maestro / Padre</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {memberType === "user" ? (
              <div>
                <label className="text-sm font-medium text-foreground">Seleccionar usuario</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-foreground">Seleccionar estudiante</label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    {availableStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setMemberOpen(false)}>Cancelar</Button>
              <Button onClick={addMember} disabled={memberType === "user" ? !selectedUserId : !selectedStudentId}>Agregar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
