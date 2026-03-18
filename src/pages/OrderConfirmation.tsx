import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchOrderById } from '@/api/client';

interface Order {
  _id: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to="/" className="btn-vc-primary">
            Go Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-card rounded-sm p-8 text-center mb-6">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-success mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-4">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="inline-block bg-muted px-4 py-2 rounded">
            <span className="text-sm text-muted-foreground">Order ID: </span>
            <span className="font-mono font-semibold">{order._id}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <div className="bg-card rounded-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Order Details
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 py-3 border-b border-border last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="bg-card rounded-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Order Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <span className="capitalize text-primary font-medium">{order.orderStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link to="/orders" className="flex-1 btn-vc-primary text-center py-3">
                View All Orders
              </Link>
              <Link to="/" className="flex-1 border border-primary text-primary hover:bg-primary/5 rounded-sm text-center py-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
