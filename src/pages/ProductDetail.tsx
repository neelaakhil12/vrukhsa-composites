import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, ChevronRight, Minus, Plus, ThumbsUp, MessageSquare, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchProductById, fetchReviewsByProductId, submitReviewAPI } from '@/api/client';
import { Product } from '@/data/products';
import { getImageUrl } from '@/lib/utils';
import SEO from '@/components/SEO';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId!),
    enabled: !!productId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviewsByProductId(productId!),
    enabled: !!productId
  });

  const reviewMutation = useMutation({
    mutationFn: (newReview: { productId: string; rating: number; title: string; comment: string }) =>
      submitReviewAPI(newReview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setIsReviewModalOpen(false);
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to write a review.",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate({
      productId: productId!,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title={product.name}
        description={product.description}
        image={getImageUrl(product.images[0])}
        url={`https://vrukshacomposites.com/product/${product.id}`}
        type="product"
        productData={{
          name: product.name,
          description: product.description,
          image: getImageUrl(product.images[0]),
          price: product.price,
          currency: 'INR',
          availability: product.stockQuantity > 0 ? 'in stock' : 'out of stock',
          rating: product.rating,
          reviewCount: product.reviewCount
        }}
      />
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
                src={getImageUrl(product.images[selectedImage])}
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
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
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
                    <p className="font-medium text-sm">Delivery within 4-5 business days</p>
                    <p className="text-xs text-muted-foreground">Standard Shipping</p>
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
            {/* Seller Info */}
            <div className="border-t border-border pt-4 mt-6">
              <p className="text-sm text-muted-foreground">
                Seller: <span className="text-primary font-medium">{product.seller}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="bg-card rounded-sm p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <div 
              className="prose prose-gray max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

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
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="btn-vc-primary text-sm"
            >
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
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to rate this product!</p>
            ) : reviews.map((review: any) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="rating-badge text-xs">
                    {review.rating} <Star size={10} fill="currentColor" />
                  </span>
                  <span className="font-medium">{review.title}</span>
                </div>
                <p className="text-muted-foreground mb-3">{review.comment}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {review.userName} • {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ThumbsUp size={14} />
                    Helpful
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-sm shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="text-primary" />
              Write a Review
            </h2>
            
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={32} 
                        className={star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title (Optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full bg-background border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-1">
                  Review Details
                </label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike?"
                  className="w-full bg-background border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 btn-vc-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="flex-1 btn-vc-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
