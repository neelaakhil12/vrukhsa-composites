import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  badge?: string;
  countdown?: string;
}

const ProductSection = ({
  title,
  subtitle,
  products,
  viewAllLink,
  badge,
  countdown,
}: ProductSectionProps) => {
  return (
    <section className="bg-card py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
                {badge && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded animate-pulse">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {countdown && (
              <div className="hidden md:flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm">
                <span className="text-xs">Ends in</span>
                <span className="font-mono font-bold">{countdown}</span>
              </div>
            )}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="btn-vc-primary text-sm flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
