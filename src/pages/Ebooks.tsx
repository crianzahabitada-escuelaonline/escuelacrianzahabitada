import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const ebooks = [
  { id: 1, title: "Crianza Consciente", author: "Crianza Habitada", price: 12.99, rating: 4.8, emoji: "📖", desc: "Una guía completa para criar desde la presencia y el amor." },
  { id: 2, title: "Emociones en la Infancia", author: "Crianza Habitada", price: 9.99, rating: 4.9, emoji: "🌈", desc: "Aprende a acompañar las emociones de tus hijos sin reprimirlas." },
  { id: 3, title: "Jugar para Crecer", author: "Crianza Habitada", price: 14.99, rating: 4.7, emoji: "🧩", desc: "El juego como motor del aprendizaje y la conexión familiar." },
  { id: 4, title: "Recetas para el Alma Familiar", author: "Crianza Habitada", price: 11.50, rating: 4.6, emoji: "🍃", desc: "Rituales y recetas para nutrir el vínculo familiar." },
];

export default function Ebooks() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Tienda de E-books</h1>
        <p className="text-muted-foreground mt-1">Recursos digitales para acompañarte en el camino de la crianza.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ebooks.map((book) => (
          <div key={book.id} className="organic-card overflow-hidden group">
            <div className="h-44 bg-secondary flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
              {book.emoji}
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-foreground">{book.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{book.desc}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-xs font-medium text-foreground">{book.rating}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-primary">€{book.price}</span>
                <Button size="sm" className="rounded-xl gap-1">
                  <ShoppingCart className="h-4 w-4" /> Comprar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
