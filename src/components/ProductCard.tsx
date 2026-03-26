import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

const ProductCard = ({ product, layout = 'grid' }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (layout === 'list') {
    return (
      <Link to={`/product/${product.id}`} className="product-card flex gap-4 p-4">
        <div className="w-40 h-40 flex-shrink-0 bg-muted rounded-sm overflow-hidden">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            {product.isSponsored && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mb-2 inline-block">
                Sponsored
              </span>
            )}
            <h3 className="font-medium text-foreground line-clamp-2 mb-2">{product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="rating-badge">
                {product.rating} <Star size={10} fill="currentColor" />
              </span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="price-current text-xl">{formatPrice(product.price)}</span>
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
            <span className="price-discount">{product.discountPercentage}% off</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Delivery within 4-5 business days
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAddToCart}
            className="btn-vc-primary text-sm"
          >
            Add to Cart
          </button>
          <button className="p-2 border border-border rounded-sm hover:bg-muted">
            <Heart size={20} className="text-muted-foreground" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card group">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={getImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.isSponsored && (
          <span className="absolute top-2 left-2 text-xs text-muted-foreground bg-white/90 px-2 py-0.5 rounded">
            Sponsored
          </span>
        )}
        {product.discountPercentage > 30 && (
          <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={18} className="text-muted-foreground hover:text-destructive transition-colors" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[40px] mb-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="rating-badge">
            {product.rating} <Star size={10} fill="currentColor" />
          </span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="price-current text-lg">{formatPrice(product.price)}</span>
          <span className="price-original text-sm">{formatPrice(product.originalPrice)}</span>
        </div>
        <span className="price-discount block mt-1">{product.discountPercentage}% off</span>

        <button
          onClick={handleAddToCart}
          className="w-full mt-3 btn-vc-primary text-sm py-2"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
