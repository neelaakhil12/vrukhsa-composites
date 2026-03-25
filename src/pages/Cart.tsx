import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, discount, total } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    toast({
      title: "Removed from Cart",
      description: `${name} has been removed from your cart.`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="bg-card rounded-sm p-12 text-center max-w-lg mx-auto">
            <ShoppingBag size={80} className="mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/" className="btn-vc-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">Shopping Cart</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-sm">
              <div className="p-4 border-b border-border">
                <h1 className="text-xl font-bold">
                  Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h1>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <Link to={`/product/${item.id}`} className="w-24 h-24 flex-shrink-0 bg-muted rounded-sm overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {Object.entries(item.variant)
                            .filter(([_, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground mt-1">
                        Seller: Vruksha Composites
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg font-semibold">{formatPrice(item.price)}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                        <span className="text-sm text-success font-medium">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="quantity-btn disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="quantity-btn disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-muted-foreground">Delivery within</p>
                      <p className="font-medium text-sm">4-5 business days</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Place Order Button - Mobile */}
              <div className="lg:hidden p-4 border-t border-border">
                <Link to="/checkout" className="btn-vc-secondary w-full py-4 text-center block">
                  Place Order
                </Link>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-sm sticky top-20">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-muted-foreground uppercase text-sm">
                  Price Details
                </h2>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <span>Price ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>− {formatPrice(discount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-foreground italic text-xs">Calculated at checkout</span>
                </div>

                <div className="border-t border-dashed border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <p className="text-sm text-success font-medium">
                  You will save {formatPrice(discount)} on this order
                </p>
              </div>

              {/* Coupon Section */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-primary">
                  <Tag size={18} />
                  <span className="text-sm font-medium">Apply Coupon</span>
                </div>
              </div>

              {/* Place Order Button - Desktop */}
              <div className="hidden lg:block p-4 border-t border-border">
                <Link to="/checkout" className="btn-vc-secondary w-full py-4 text-center block text-lg">
                  Place Order
                </Link>
              </div>
            </div>

            {/* Safe & Secure */}
            <div className="mt-4 p-4 bg-card rounded-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <img
                  src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/security_icon-3e62c0.svg"
                  alt="Secure"
                  className="w-8 h-8"
                />
                <p className="text-sm">
                  Safe and Secure Payments. 100% Authentic products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
