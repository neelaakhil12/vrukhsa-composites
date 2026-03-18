import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, ChevronRight, Minus, Plus, ThumbsUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { fetchProductById } from '@/api/client';
import { Product } from '@/data/products';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId!),
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/" className="btn-vc-primary">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      variant: selectedVariants,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/cart';
  };

  // Mock reviews - in real app, fetch from API
  const reviews = [
    {
      id: 1,
      author: 'Rahul S.',
      rating: 5,
      date: '2 months ago',
      title: 'Excellent product!',
      content: 'Amazing quality and fast delivery. Highly recommended for anyone looking for a premium experience.',
      helpful: 234,
    },
    {
      id: 2,
      author: 'Priya M.',
      rating: 4,
      date: '1 month ago',
      title: 'Good value for money',
      content: 'Works great, minor issues with packaging but product is perfect.',
      helpful: 89,
    },
    {
      id: 3,
      author: 'Amit K.',
      rating: 5,
      date: '3 weeks ago',
      title: 'Worth every penny',
      content: 'Exceeded my expectations. The build quality is superb and performance is top-notch.',
      helpful: 156,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to={`/search?category=${product.category}`}>{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="bg-card rounded-sm p-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-sm overflow-hidden mb-4 group">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                <Heart size={20} className="text-muted-foreground hover:text-destructive transition-colors" />
              </button>
              <button className="absolute top-4 right-16 p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                <Share2 size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons - Mobile */}
            <div className="lg:hidden flex gap-3 mt-4">
              <button onClick={handleAddToCart} className="flex-1 btn-vc-primary py-4">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 btn-vc-secondary py-4">
                Buy Now
              </button>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="bg-card rounded-sm p-6">
            {/* Sponsored Badge */}
            {product.isSponsored && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mb-3 inline-block">
                Sponsored
              </span>
            )}

            {/* Product Name */}
            <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <span className="rating-badge text-sm px-3 py-1">
                {product.rating} <Star size={12} fill="currentColor" />
              </span>
              <span className="text-muted-foreground">
                {product.reviewCount.toLocaleString()} Ratings & Reviews
              </span>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-lg font-medium text-success">
                  {product.discountPercentage}% off
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                inclusive of all taxes
              </p>
            </div>

            {/* Offers */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Available Offers</h3>
              <div className="space-y-2">
                <div className="offer-tag flex items-start gap-2">
                  <span className="text-success font-medium">🏷️</span>
                  <span>Bank Offer: 10% off on HDFC Bank Credit Cards, up to ₹1500</span>
                </div>
                <div className="offer-tag flex items-start gap-2">
                  <span className="text-success font-medium">🏷️</span>
                  <span>No Cost EMI starting from ₹4,997/month</span>
                </div>
                <div className="offer-tag flex items-start gap-2">
                  <span className="text-success font-medium">🏷️</span>
                  <span>Special Price: Get extra ₹5000 off (price inclusive)</span>
                </div>
              </div>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6 space-y-4">
                {product.variants.map((variant: any) => (
                  <div key={variant.name}>
                    <h3 className="font-semibold mb-2">{variant.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                          className={`px-4 py-2 border rounded-sm text-sm font-medium transition-colors ${selectedVariants[variant.name] === option
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="quantity-selector inline-flex">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="quantity-btn"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center border-x border-border"
                  min={1}
                  max={10}
                />
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="quantity-btn"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t border-border pt-6 mb-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="text-primary" size={24} />
                  <div>
                    <p className="font-medium text-sm">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">By Tomorrow</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="text-primary" size={24} />
                  <div>
                    <p className="font-medium text-sm">7 Days Return</p>
                    <p className="text-xs text-muted-foreground">Policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary" size={24} />
                  <div>
                    <p className="font-medium text-sm">{product.warranty}</p>
                    <p className="text-xs text-muted-foreground">Coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex gap-4">
              <button onClick={handleAddToCart} className="flex-1 btn-vc-primary py-4 text-lg">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 btn-vc-secondary py-4 text-lg">
                Buy Now
              </button>
            </div>

            {/* Seller Info */}
            <div className="border-t border-border pt-4 mt-6">
              <p className="text-sm text-muted-foreground">
                Seller: <span className="text-primary font-medium">{product.seller}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <section className="bg-card rounded-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
              <div
                key={key}
                className={`flex py-3 ${index % 2 === 0 ? 'bg-muted/50' : ''} px-4 rounded-sm`}
              >
                <span className="w-40 text-muted-foreground flex-shrink-0">{key}</span>
                <span className="font-medium">{value as string}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-card rounded-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Ratings & Reviews</h2>
            <button className="btn-vc-primary text-sm">
              Rate Product
            </button>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-8 mb-8 pb-6 border-b border-border">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground">{product.rating}</div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {product.reviewCount.toLocaleString()} reviews
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = rating === 5 ? 65 : rating === 4 ? 20 : rating === 3 ? 10 : rating === 2 ? 3 : 2;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-3 text-sm">{rating}</span>
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="rating-badge text-xs">
                    {review.rating} <Star size={10} fill="currentColor" />
                  </span>
                  <span className="font-medium">{review.title}</span>
                </div>
                <p className="text-muted-foreground mb-3">{review.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {review.author} • {review.date}
                  </span>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ThumbsUp size={14} />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
