import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useProductImage } from "@/hooks/useImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Použití nového systému správy obrázků
  const productImage = useProductImage(product.id, product.fotka_url);
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        <Image
          src={productImage}
          alt={product.nazev}
          width={400}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {product.nazev}
        </h3>
        <p className="text-gray-600 mb-4">{product.popis}</p>

        {/* Technické parametry */}
        <div className="mb-4 space-y-1">
          {Object.entries(product.technicke_parametry).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-500 capitalize">
                {key.replace(/_/g, " ")}:
              </span>
              <span className="text-gray-900 font-medium">{value}</span>
            </div>
          ))}
        </div>

        <Link
          href="/kontakt"
          className="block w-full text-center bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Poptat
        </Link>
      </div>
    </div>
  );
}
