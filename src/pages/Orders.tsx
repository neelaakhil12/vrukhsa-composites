import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { fetchMyOrders, cancelOrderAPI } from '@/api/client';
import { toast } from 'sonner';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  placed: {
    label: 'Placed',
    color: 'text-blue-600 bg-blue-50',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-600 bg-blue-50',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-orange-600 bg-orange-50',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-success bg-success/10',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-destructive bg-destructive/10',
    icon: XCircle,
  },
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrderAPI(orderId);
      setOrders(orders.map(o =>
        o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o
      ));
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

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
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login to View Orders</h1>
          <Link to="/login" className="btn-vc-primary">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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
          <Link to="/account">My Account</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">Orders</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {/* Filters */}
        <div className="bg-card rounded-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by order ID or product name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                {status === 'all' ? 'All Orders' : statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.orderStatus] || statusConfig.placed;
              const StatusIcon = config.icon;
              return (
                <div key={order._id} className="bg-card rounded-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-medium text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ordered on</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                      <StatusIcon size={16} />
                      {config.label}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-border">
                    {order.items.map((item, index) => (
                      <div key={index} className="p-4 flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="p-4 border-t border-border bg-muted/50 flex flex-wrap gap-4">
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-sm text-primary hover:underline font-bold"
                    >
                      Track Order →
                    </Link>
                    {['placed', 'confirmed'].includes(order.orderStatus) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-sm p-12 text-center">
            <Package size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : "You haven't placed any orders yet"}
            </p>
            <Link to="/" className="btn-vc-primary">
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
