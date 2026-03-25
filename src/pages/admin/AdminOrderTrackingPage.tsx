import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/api/client';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Loader2,
    Save,
    Package,
    Truck,
    MapPin,
    ShoppingBag,
    CheckCircle2,
    Phone,
    Mail,
    Calendar,
    ExternalLink,
    StickyNote,
    User,
    CreditCard,
    RefreshCw
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-orange-100 text-orange-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

const AdminOrderTrackingPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Tracking form state
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingLink, setTrackingLink] = useState('');
    const [trackingPlatform, setTrackingPlatform] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [internalNote, setInternalNote] = useState('');
    const [deliveryStages, setDeliveryStages] = useState<any[]>([]);
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    const fetchOrder = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data);
            setTrackingNumber(data.trackingNumber || '');
            setTrackingLink(data.trackingLink || '');
            setTrackingPlatform(data.trackingPlatform || '');
            setExpectedDeliveryDate(data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : '');
            setInternalNote(data.internalNote || '');
            setDeliveryStages(data.deliveryStages || []);
            setOrderStatus(data.orderStatus || 'placed');
            setPaymentStatus(data.paymentStatus || 'pending');
        } catch (err) {
            toast.error('Failed to load order');
            navigate('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, [orderId]);

    const toggleStage = (index: number) => {
        const newStages = [...deliveryStages];
        const current = newStages[index];
        const newCompleted = !current.isCompleted;
        newStages[index] = {
            ...current,
            isCompleted: newCompleted,
            completedAt: newCompleted ? (current.completedAt || new Date().toISOString()) : undefined,
        };
        setDeliveryStages(newStages);
    };

    const handleSaveTracking = async () => {
        try {
            setIsSaving(true);
            await api.put(`/orders/${orderId}/tracking`, {
                trackingNumber,
                trackingLink,
                trackingPlatform,
                expectedDeliveryDate: expectedDeliveryDate || undefined,
                internalNote,
                deliveryStages,
            });
            toast.success('Tracking info saved!');
        } catch (err) {
            toast.error('Failed to save tracking info');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus: status });
            setOrderStatus(status);
            // Auto-mark stage as completed
            const newStages = deliveryStages.map((s: any) =>
                s.status === status ? { ...s, isCompleted: true, completedAt: s.completedAt || new Date().toISOString() } : s
            );
            setDeliveryStages(newStages);
            toast.success(`Order status updated to: ${status.replace('_', ' ')}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handlePaymentUpdate = async (status: string) => {
        try {
            await api.put(`/orders/${orderId}/payment`, { paymentStatus: status });
            setPaymentStatus(status);
            toast.success('Payment status updated');
        } catch {
            toast.error('Failed to update payment status');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Nav */}
            <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm uppercase tracking-widest">
                        <ChevronLeft size={18} /> Admin
                    </button>
                    <h1 className="font-black text-gray-900 text-sm uppercase tracking-widest">
                        Order #{String(order.id || order._id).slice(-8).toUpperCase()}
                    </h1>
                    <button
                        onClick={fetchOrder}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <User size={14} /> Customer Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Name</p>
                                <p className="font-black text-gray-900">
                                    {order.userId?.name || order.shippingAddress.fullName}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Mail size={12} /> Email</p>
                                <p className="font-bold text-gray-900 break-all">
                                    {order.userId?.email || order.shippingAddress.email || '—'}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone size={12} /> Phone</p>
                                <p className="font-black text-primary text-lg">
                                    {order.shippingAddress.phone}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                <p className="font-medium text-gray-700 text-sm">
                                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Stages - Manual Checkboxes */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <Truck size={14} /> Delivery Stages
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">Check stages to mark them as completed for the customer.</p>
                        <div className="space-y-3">
                            {deliveryStages.map((stage: any, idx: number) => (
                                <label
                                    key={stage.status}
                                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2
                                        ${stage.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-primary/20'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={stage.isCompleted}
                                        onChange={() => toggleStage(idx)}
                                        className="w-5 h-5 accent-primary cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <p className={`font-black text-sm ${stage.isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                                            {stage.label}
                                        </p>
                                        {stage.completedAt && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Completed: {new Date(stage.completedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    {stage.isCompleted && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleSaveTracking}
                            disabled={isSaving}
                            className="mt-6 w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Delivery Stages
                        </button>
                    </div>

                    {/* Tracking Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <ExternalLink size={14} /> Tracking Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tracking Number</label>
                                <input
                                    value={trackingNumber}
                                    onChange={e => setTrackingNumber(e.target.value)}
                                    placeholder="e.g. DELHIVERY123456789"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/20 font-mono font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Courier / Platform</label>
                                <input
                                    value={trackingPlatform}
                                    onChange={e => setTrackingPlatform(e.target.value)}
                                    placeholder="e.g. Delhivery, Blue Dart, FedEx"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/20 font-bold"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tracking Link (URL)</label>
                                <input
                                    value={trackingLink}
                                    onChange={e => setTrackingLink(e.target.value)}
                                    placeholder="https://www.delhivery.com/tracking/..."
                                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/20 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Calendar size={12} /> Expected Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={expectedDeliveryDate}
                                    onChange={e => setExpectedDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/20 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <StickyNote size={12} /> Internal Note (not visible to user)
                                </label>
                                <input
                                    value={internalNote}
                                    onChange={e => setInternalNote(e.target.value)}
                                    placeholder="Staff notes..."
                                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/20 font-medium"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSaveTracking}
                            disabled={isSaving}
                            className="mt-5 w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Tracking Info
                        </button>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <Package size={14} /> Ordered Items
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        className="w-14 h-14 rounded-xl object-cover bg-white border"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                                    </div>
                                    <p className="font-black text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 pt-4 border-t flex justify-between items-center">
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Total Amount</span>
                            <span className="text-2xl font-black text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status Controls */}
                <div className="space-y-6">
                    {/* Order Summary Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Order ID</span>
                                <span className="font-mono font-black text-xs text-gray-700">#{String(order.id || order._id).slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Date</span>
                                <span className="font-bold text-xs text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Payment</span>
                                <span className="font-bold text-xs text-gray-700">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                                    {order.orderStatus.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Update Order Status */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Update Order Status</h2>
                        <div className="space-y-2">
                            {ORDER_STATUSES.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all capitalize
                                        ${orderStatus === status
                                            ? `${STATUS_COLORS[status]} border-2 border-current/20`
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Update Payment Status */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CreditCard size={14} /> Payment Status
                        </h2>
                        <div className="space-y-2">
                            {PAYMENT_STATUSES.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handlePaymentUpdate(status)}
                                    className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all capitalize
                                        ${paymentStatus === status
                                            ? status === 'paid' ? 'bg-green-100 text-green-700' : status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderTrackingPage;
