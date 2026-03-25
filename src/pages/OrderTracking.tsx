import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/api/client';
import { getImageUrl } from '@/lib/utils';
import {
    CheckCircle2,
    Circle,
    Package,
    Truck,
    MapPin,
    ShoppingBag,
    ExternalLink,
    ChevronLeft,
    Loader2,
    Clock,
    AlertCircle
} from 'lucide-react';

const STAGE_ICONS: Record<string, React.ReactNode> = {
    placed: <ShoppingBag size={20} />,
    confirmed: <CheckCircle2 size={20} />,
    processing: <Package size={20} />,
    shipped: <Truck size={20} />,
    out_for_delivery: <MapPin size={20} />,
    delivered: <CheckCircle2 size={20} />,
    cancelled: <AlertCircle size={20} />,
};

const OrderTracking = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${orderId}`);
                setOrder(data);
            } catch (err) {
                navigate('/orders');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            </div>
        );
    }

    if (!order) return null;

    const stages = order.deliveryStages || [];
    const activeStageIdx = [...stages].reverse().findIndex((s: any) => s.isCompleted);
    const lastCompleted = activeStageIdx >= 0 ? stages.length - 1 - activeStageIdx : -1;

    const isCancelled = order.orderStatus === 'cancelled';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm mb-6 uppercase tracking-widest"
                >
                    <ChevronLeft size={18} /> Back to Orders
                </button>

                {/* Order Header */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest
                                ${isCancelled ? 'bg-red-100 text-red-600' :
                                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' :
                                'bg-primary/10 text-primary'}`}>
                                {order.orderStatus.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Expected Delivery */}
                    {!isCancelled && order.expectedDeliveryDate && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                            <Clock className="text-primary flex-shrink-0" size={20} />
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Expected Delivery</p>
                                <p className="font-black text-gray-900 text-lg">
                                    {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delivery Timeline */}
                {!isCancelled && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Delivery Progress</h2>
                        <div className="relative">
                            {stages.filter((s: any) => s.status !== 'cancelled').map((stage: any, idx: number) => {
                                const isCompleted = stage.isCompleted;
                                const isActive = !isCompleted && idx === lastCompleted + 1;
                                return (
                                    <div key={stage.status} className="flex gap-4 mb-6 last:mb-0">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                                            ${isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/30' :
                                            isActive ? 'bg-primary/10 text-primary border-2 border-primary animate-pulse' :
                                            'bg-gray-100 text-gray-300'}`}>
                                            {STAGE_ICONS[stage.status] || <Circle size={20} />}
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 pt-1">
                                            <p className={`font-black text-sm ${isCompleted ? 'text-gray-900' : isActive ? 'text-primary' : 'text-gray-300'}`}>
                                                {stage.label}
                                            </p>
                                            {stage.completedAt && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(stage.completedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                            {stage.note && (
                                                <p className="text-xs text-gray-500 mt-1 italic">{stage.note}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tracking Info */}
                {order.trackingNumber && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tracking Details</h2>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tracking Number</p>
                                <p className="font-mono font-black text-gray-900 text-lg mt-1">{order.trackingNumber}</p>
                                {order.trackingPlatform && (
                                    <p className="text-xs text-gray-500 mt-1">via {order.trackingPlatform}</p>
                                )}
                            </div>
                            {order.trackingLink && (
                                <a
                                    href={order.trackingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex-shrink-0"
                                >
                                    Track <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ordered Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center">
                                <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border"
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                </div>
                                <p className="font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                        <span className="font-bold text-gray-400">Total Paid</span>
                        <span className="text-2xl font-black text-primary">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Delivery Address</h2>
                    <p className="font-black text-gray-900 uppercase">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-600 mt-1">{order.shippingAddress.address}</p>
                    <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    <p className="text-primary font-bold mt-2">📞 {order.shippingAddress.phone}</p>
                    {order.shippingAddress.email && (
                        <p className="text-gray-500 text-sm mt-1">✉️ {order.shippingAddress.email}</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderTracking;
