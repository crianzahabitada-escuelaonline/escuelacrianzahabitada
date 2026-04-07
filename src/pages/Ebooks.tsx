import { ShoppingCart, Star, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

import coverLuz from "@/assets/cover-luz-corazon.jpg";
import coverCamino from "@/assets/cover-camino-hogar.jpg";
import cover7Rituales from "@/assets/cover-7-rituales.jpg";
import coverCirculo from "@/assets/cover-circulo-medicina.jpg";
import coverVacaciones from "@/assets/cover-vacaciones-educan.png";
import coverArbol from "@/assets/cover-arbol-espera.jpg";

type Product = {
  id: number;
  title: string;
  author: string;
  price: number;
  cover: string;
  desc: string;
  type: "libro" | "guia";
  pages?: string;
};

const products: Product[] = [
  {
    id: 1,
    title: "Luz en el Corazón",
    author: "Paola Patricelli",
    price: 30,
    cover: coverLuz,
    desc: "Cuentos y caminos para el tiempo de Micael. Un libro para familias y educadores que desean sembrar imágenes vivas de bondad en la infancia.",
    type: "libro",
    pages: "Libro completo ilustrado",
  },
  {
    id: 2,
    title: "El Camino del Hogar",
    author: "Paola Patricelli",
    price: 30,
    cover: coverCamino,
    desc: "Crianza Waldorf y la Presencia Habitada. 12 semanas para cultivar el alma creativa de tu familia y despertar tu presencia.",
    type: "libro",
    pages: "Programa de 12 semanas",
  },
  {
    id: 3,
    title: "7 Rituales para Habitar la Crianza con Alma",
    author: "Paola Patricelli",
    price: 15,
    cover: cover7Rituales,
    desc: "Un camino poético hacia la presencia, el arte y el vínculo. Incluye invocaciones, reflexiones, imágenes guía y actos rituales cotidianos.",
    type: "guia",
    pages: "7 rituales con ejercicios",
  },
  {
    id: 4,
    title: "Círculo de Medicina Sagrada para Niñas",
    author: "Paola Patricelli",
    price: 15,
    cover: coverCirculo,
    desc: "Mi Voz, Mi Espacio y Mis Límites Sagrados. Guía completa con ejercicios de arteterapia para mamás y actividades rituales para niñas.",
    type: "guia",
    pages: "Guía con ejercicios prácticos",
  },
  {
    id: 5,
    title: "El Árbol de la Espera",
    author: "Paola Patricelli",
    price: 15,
    cover: coverArbol,
    desc: "Una guía familiar para vivir el Adviento: cuentos, creación y rituales. Inspirado en la tradición Waldorf con los 4 Reinos de la Naturaleza.",
    type: "guia",
    pages: "Guía de Adviento · 4 semanas",
  },
  {
    id: 6,
    title: "Vacaciones que Educan",
    author: "Paola Patricelli",
    price: 15,
    cover: coverVacaciones,
    desc: "Actividades y propuestas para que las vacaciones sean un tiempo de aprendizaje, juego y conexión familiar.",
    type: "guia",
    pages: "Cuadernillo de actividades",
  },
];

export default function Ebooks() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Tienda de E-books y Guías</h1>
        <p className="text-muted-foreground mt-1">Recursos digitales de Paola Patricelli para acompañarte en el camino de la crianza consciente.</p>
      </div>

      {/* Libros section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">Libros Digitales</h2>
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">USD $30</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {products.filter(p => p.type === "libro").map((book) => (
            <ProductCard key={book.id} product={book} />
          ))}
        </div>
      </div>

      {/* Guías section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-terracotta" />
          <h2 className="text-lg font-heading font-bold text-foreground">Guías y Cuadernillos</h2>
          <span className="text-xs font-medium bg-terracotta/20 text-terracotta-foreground px-2 py-1 rounded-full">USD $15</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.filter(p => p.type === "guia").map((book) => (
            <ProductCard key={book.id} product={book} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="organic-card overflow-hidden group">
      <div className="aspect-square bg-secondary overflow-hidden">
        <img
          src={product.cover}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          product.type === "libro"
            ? "bg-primary/10 text-primary"
            : "bg-terracotta/20 text-terracotta-foreground"
        }`}>
          {product.type === "libro" ? "Libro" : "Guía"}
        </span>
        <h3 className="font-heading font-bold text-foreground mt-2 leading-tight">{product.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{product.author}</p>
        {product.pages && (
          <p className="text-xs text-primary mt-1">{product.pages}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.desc}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-primary">USD ${product.price}</span>
          <Button size="sm" className="rounded-xl gap-1">
            <ShoppingCart className="h-4 w-4" /> Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
