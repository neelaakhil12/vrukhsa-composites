import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    ShoppingBag, 
    RefreshCw, 
    Truck, 
    CreditCard, 
    Loader2,
    Calendar,
    User,
    Mail,
    Phone
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const OrderDetailPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${orderId}`);
                setOrder(data);
            } catch (error) {
                toast.error('Failed to load order details');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleUpdateOrderStatus = async (status: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus: status });
            toast.success('Order status updated');
            setOrder({ ...order, orderStatus: status });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleUpdatePaymentStatus = async (status: string) => {
        try {
            await api.put(`/orders/${orderId}/payment`, { paymentStatus: status });
            toast.success('Payment status updated');
            setOrder({ ...order, paymentStatus: status });
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                    <button onClick={() => navigate('/admin')} className="text-primary font-bold">Back to Dashboard</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
                <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm tracking-widest uppercase"
                    >
                        <ChevronLeft size={20} />
                        Back to Orders
                    </button>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${order.orderStatus === 'delivered' ? 'bg-blue-100 text-blue-600' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            {order.orderStatus}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {order.paymentStatus}
                        </span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-8 lg:p-12 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                                    <ShoppingBag className="text-primary" size={32} />
                                    Order #{order._id.slice(-8).toUpperCase()}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-400 mt-3 font-medium text-sm">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.createdAt).toLocaleString()}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="flex items-center gap-1.5 uppercase font-black text-[10px] tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">Full ID: {order._id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => window.print()}
                                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    Print Invoice
                                </button>
                            </div>
                        </div>

                        <div className="p-8 lg:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Side: Items & Status (Col Span 2) */}
                                <div className="lg:col-span-2 space-y-12">
                                    <section>
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                            <span className="w-8 h-px bg-gray-200" />
                                            Order Inventory
                                        </h3>
                                        <div className="space-y-4">
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex gap-6 items-center p-4 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-xl transition-all group">
                                                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-gray-900 text-lg tracking-tight truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-500 font-bold mt-1">
                                                            ₹{item.price.toLocaleString()} <span className="text-primary lowercase font-medium">x</span> {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-gray-900 text-xl tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-8 p-8 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col md:flex-row justify-between items-center bg-gray-50/50">
                                            <div className="text-center md:text-left mb-4 md:mb-0">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                                <p className="text-sm text-gray-500 font-medium">Includes taxes and shipping</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-4xl font-black text-primary tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-8 lg:p-10">
                                        <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                            <RefreshCw size={18} />
                                            Logistics Control
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateOrderStatus(status)}
                                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${order.orderStatus === status ? 'bg-primary text-white shadow-2xl shadow-primary/40 -translate-y-1' : 'bg-white text-gray-400 border border-gray-100 hover:border-primary/30 hover:text-primary active:scale-95'}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Side: Customer & Shipping & Payment */}
                                <div className="space-y-8">
                                    <section className="p-8 bg-gray-900 text-white rounded-[2.5rem] shadow-2xl">
                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                            <User size={14} />
                                            Customer Profile
                                        </h3>
                                        <div className="space-y-4">
                                            <p className="text-2xl font-black tracking-tight uppercase">{order.userId?.name || 'Guest User'}</p>
                                            <p className="flex items-center gap-3 text-gray-400 text-sm font-bold"><Mail size={14} className="text-primary"/> {order.userId?.email || 'N/A'}</p>
                                        </div>
                                    </section>

                                    <section className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                            <Truck size={16} />
                                            Destination
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="font-black text-gray-800 uppercase tracking-tight">{order.shippingAddress.fullName}</p>
                                            <p className="text-gray-500 font-medium leading-relaxed">{order.shippingAddress.address}</p>
                                            <p className="text-gray-500 font-bold">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                            <div className="mt-4 pt-4 border-t border-gray-50">
                                                <p className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                                                    <Phone size={14}/> {order.shippingAddress.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                            <CreditCard size={16} />
                                            Transaction
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Method</span>
                                                <span className="font-black text-gray-900 uppercase tracking-widest text-sm">{order.paymentMethod}</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Payment Status</p>
                                                <div className="flex gap-2">
                                                    {['pending', 'paid', 'failed'].map((pStatus) => (
                                                        <button
                                                            key={pStatus}
                                                            onClick={() => handleUpdatePaymentStatus(pStatus)}
                                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${order.paymentStatus === pStatus ? (pStatus === 'paid' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : pStatus === 'failed' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-yellow-500 text-white shadow-lg shadow-yellow-200') : 'bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200'}`}
                                                        >
                                                            {pStatus}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {order.razorpayPaymentId && (
                                                <div className="pt-6 border-t border-gray-50 space-y-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gateway Reference</p>
                                                    <p className="font-mono text-[10px] text-primary bg-primary/5 p-3 rounded-xl break-all border border-primary/5">{order.razorpayPaymentId}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderDetailPage;
