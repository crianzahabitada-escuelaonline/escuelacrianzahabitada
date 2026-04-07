import { useState } from "react";
import { MessageCircle, Heart, Palette, Gamepad2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", label: "Todos", icon: MessageCircle },
  { id: "arte", label: "Arte", icon: Palette },
  { id: "juegos", label: "Juegos", icon: Gamepad2 },
  { id: "curiosidades", label: "Curiosidades", icon: Sparkles },
];

const avatars = ["🦊", "🐰", "🦉", "🐻", "🦋", "🐢", "🌸", "🐝"];

const posts = [
  { id: 1, avatar: "🦊", name: "Zorrito Valiente", category: "arte", content: "¡Hoy pinté un arcoíris gigante! 🌈 ¿Alguien más quiere compartir sus dibujos?", likes: 12, replies: 5, time: "Hace 2h" },
  { id: 2, avatar: "🐰", name: "Conejita Luna", category: "juegos", content: "¿Conocen juegos divertidos para jugar en familia los domingos? 🎲", likes: 8, replies: 12, time: "Hace 4h" },
  { id: 3, avatar: "🦉", name: "Búho Sabio", category: "curiosidades", content: "¿Sabían que las mariposas prueban la comida con los pies? 🦋 ¡Increíble!", likes: 23, replies: 7, time: "Hace 6h" },
  { id: 4, avatar: "🐻", name: "Osito Miel", category: "arte", content: "Hice una casa de cartón para mi gato. ¡Le encanta! 🏠🐱", likes: 15, replies: 3, time: "Hace 1d" },
  { id: 5, avatar: "🦋", name: "Mariposa Sol", category: "curiosidades", content: "Hoy aprendí que los delfines duermen con un ojo abierto. 🐬", likes: 19, replies: 9, time: "Hace 1d" },
];

export default function Comunidad() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Comunidad de Niños 🌟</h1>
        <p className="text-muted-foreground mt-1">Un espacio seguro para compartir, aprender y divertirse juntos.</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            className="rounded-full gap-2"
            onClick={() => setActiveCategory(cat.id)}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* New post */}
      <div className="organic-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{avatars[0]}</span>
          <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
            ¿Qué quieres compartir hoy? ✨
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => (
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
