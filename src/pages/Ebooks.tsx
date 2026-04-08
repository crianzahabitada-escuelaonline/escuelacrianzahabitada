import { useState, useEffect } from "react";
import { ShoppingCart, BookOpen, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_url: string;
  description: string;
  product_type: string;
  pages_info: string;
  file_url: string;
};

export default function Ebooks() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("digital_products")
        .select("*")
        .eq("is_published", true)
        .order("product_type")
        .order("created_at", { ascending: false });
      setProducts((data as Product[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const libros = products.filter(p => p.product_type === "libro");
  const guias = products.filter(p => p.product_type !== "libro");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Tienda de E-books y Guías</h1>
        <p className="text-muted-foreground mt-1">Recursos digitales para acompañarte en el camino de la crianza consciente.</p>
      </div>

      {products.length === 0 ? (
        <div className="organic-card p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-heading font-bold text-foreground mb-2">Próximamente</h3>
          <p className="text-muted-foreground">Estamos preparando materiales especiales para ti. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <>
          {libros.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold text-foreground">Libros Digitales</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {libros.map(book => <ProductCard key={book.id} product={book} />)}
              </div>
            </div>
          )}

          {guias.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-terracotta" />
                <h2 className="text-lg font-heading font-bold text-foreground">Guías y Cuadernillos</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {guias.map(book => <ProductCard key={book.id} product={book} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="organic-card overflow-hidden group">
      <div className="aspect-square bg-secondary overflow-hidden">
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <BookOpen className="h-16 w-16 text-primary/30" />
          </div>
        )}
      </div>
      <div className="p-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          product.product_type === "libro"
            ? "bg-primary/10 text-primary"
            : "bg-terracotta/20 text-terracotta-foreground"
        }`}>
          {product.product_type === "libro" ? "Libro" : "Guía"}
        </span>
        <h3 className="font-heading font-bold text-foreground mt-2 leading-tight">{product.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{product.author}</p>
        {product.pages_info && (
          <p className="text-xs text-primary mt-1">{product.pages_info}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
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
