import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { 
    ChevronLeft, 
    Truck, 
    CreditCard, 
    ShoppingBag, 
    RefreshCw, 
    Loader2,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data);
        } catch (error) {
            toast.error('Failed to load order details');
            navigate('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (status: string) => {
        try {
            setIsUpdating(true);
            await api.put(`/orders/${orderId}/status`, { orderStatus: status });
            toast.success('Order status updated');
            setOrder({ ...order, orderStatus: status });
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePaymentStatus = async (status: string) => {
        try {
            setIsUpdating(true);
            await api.put(`/orders/${orderId}/payment`, { paymentStatus: status });
            toast.success('Payment status updated');
            setOrder({ ...order, paymentStatus: status });
        } catch (error) {
            toast.error('Failed to update payment status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="text-primary" size={20} />
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items and Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Ordered Items</h3>
                            <div className="space-y-4">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-colors">
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.name} 
                                            className="w-20 h-20 object-cover rounded-xl shadow-sm" 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-lg leading-tight mb-1">{item.name}</p>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                ₹{item.price.toLocaleString()} x {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-xl">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-dashed space-y-3">
                                <div className="flex justify-between items-center text-gray-500 font-bold">
                                    <span>Subtotal</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 font-bold">
                                    <span>Shipping</span>
                                    <span className="text-green-500 uppercase tracking-widest text-xs">Free</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xl font-black text-gray-900">Total Charged</span>
                                    <span className="text-3xl font-black text-primary">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <RefreshCw size={14} />
                                Manage Order Lifecycle
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Order Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                disabled={isUpdating}
                                                onClick={() => handleUpdateOrderStatus(status)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${order.orderStatus === status ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Payment Status</label>
                                    <div className="flex gap-2">
                                        {['pending', 'paid', 'failed'].map((pStatus) => (
                                            <button
                                                key={pStatus}
                                                disabled={isUpdating}
                                                onClick={() => handleUpdatePaymentStatus(pStatus)}
                                                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${order.paymentStatus === pStatus ? (pStatus === 'paid' ? 'bg-green-500 border-green-500 text-white shadow-lg' : pStatus === 'failed' ? 'bg-red-500 border-red-500 text-white shadow-lg' : 'bg-yellow-500 border-yellow-500 text-white shadow-lg') : 'bg-white border-gray-100 text-gray-400 hover:border-primary/30'}`}
                                            >
                                                {pStatus}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Truck size={16} />
                                Shipping Destination
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="font-black text-gray-900 text-xl uppercase tracking-tight mb-2">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <div className="space-y-1 text-gray-600 font-medium">
                                        <p>{order.shippingAddress.address}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-primary font-black flex items-center gap-2">
                                            <span className="text-gray-400 text-xs">CONTACT:</span>
                                            {order.shippingAddress.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CreditCard size={16} />
                                Financial Record
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Gateway</span>
                                    <span className="font-black text-gray-900 uppercase tracking-widest">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                {order.razorpayPaymentId && (
                                    <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Razorpay Tracer ID</p>
                                        <p className="font-mono text-xs text-primary bg-white p-3 rounded-xl border border-primary/20 break-all">{order.razorpayPaymentId}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 flex flex-col items-center text-center">
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                                <CheckCircle className="text-primary" size={32} />
                           </div>
                           <h4 className="font-black text-gray-900">Need Assistance?</h4>
                           <p className="text-xs text-gray-500 mt-2 font-medium">Export this order as PDF or CSV for bookkeeping</p>
                           <button className="mt-6 w-full py-3 bg-white text-gray-900 font-black text-xs uppercase tracking-widest rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">Support Console</button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetailPage;
