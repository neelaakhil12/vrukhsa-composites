import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '@/api/client';
import {
    LayoutDashboard,
    Package,
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Search as SearchIcon,
    Loader2,
    CheckCircle,
    XCircle,
    PlusCircle,
    MinusCircle,
    Save,
    Layout,
    Image as ImageIcon,
    X,
    Menu,
    FileText,
    ShoppingBag,
    Eye,
    Truck,
    CreditCard,
    LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import { getImageUrl } from '@/lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminDashboard = () => {
    const { user, isLoading: authLoading, logout } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'appearance' | 'content' | 'orders'>('dashboard');
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [siteSettings, setSiteSettings] = useState<any>(() => {
        const saved = localStorage.getItem('vruksha_admin_settings_draft');
        return saved ? JSON.parse(saved) : { banners: [], categories: [] };
    });

    // Save to localStorage whenever siteSettings changes
    useEffect(() => {
        if (siteSettings) {
            localStorage.setItem('vruksha_admin_settings_draft', JSON.stringify(siteSettings));
        }
    }, [siteSettings]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [{ data: productsData }, { data: settingsData }, { data: ordersData }] = await Promise.all([
                api.get('/products?showDeleted=true'),
                api.get('/settings'),
                api.get('/orders/admin/all')
            ]);
            setProducts(productsData);
            // Only update site settings if we don't have a local draft, or optionally merge
            // For now, let's always fetch the latest from server but allow local edits to persist if we just refreshed
            // If the user just loaded the page, we want the server data. 
            // If they are editing, we want the draft.
            setSiteSettings(settingsData);
            setOrders(ordersData);
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to archive this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product archived successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to archive product');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await api.post(`/products/${id}/restore`);
            toast.success('Product restored successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to restore product');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus: status });
            toast.success('Order status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/orders/${orderId}/payment`, { paymentStatus: status });
            toast.success('Payment status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    const filteredProducts = products.filter(p =>
        (p.name || p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: products.length,
        active: products.filter(p => !p.isDeleted).length,
        archived: products.filter(p => p.isDeleted).length,
        categories: new Set(products.map(p => p.category)).size
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-2xl lg:shadow-none flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 object-contain rounded" />
                        <span>VC Admin</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <nav className="mt-6 px-4 space-y-2 flex-1">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Package size={20} />
                        <span className="font-medium">Products</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('appearance'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Layout size={20} />
                        <span className="font-medium">Appearance</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('content'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FileText size={20} />
                        <span className="font-medium">Pages & Content</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ShoppingBag size={20} />
                        <span className="font-medium">Orders</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-100 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={async () => {
                            try {
                                await logout();
                            } catch (error) {
                                console.error('Failed to logout', error);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                <header className="h-16 bg-white border-b px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-sm lg:text-lg font-bold text-gray-900 uppercase tracking-wider truncate max-w-[150px] md:max-w-none">
                            {activeTab === 'dashboard' ? 'Overview' : activeTab === 'products' ? 'Product Inventory' : activeTab === 'appearance' ? 'Site Appearance' : 'Pages & Content'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden md:block text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </header>

                <div className="p-4 lg:p-8 overflow-y-auto">
                    {activeTab === 'dashboard' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Analytics Dashboard</h1>
                                <p className="text-gray-500 text-sm mt-1">Monitor store performance and inventory health.</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Active Items', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                                    { label: 'Archived Items', value: stats.archived, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                                    { label: 'Total Categories', value: stats.categories, icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-50' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                                <p className="text-3xl font-black mt-1 text-gray-900">{stat.value}</p>
                                            </div>
                                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                                                <stat.icon size={26} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity Placeholder */}
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Link
                                        to="/admin/products/new"
                                        className="flex items-center gap-3 p-4 border rounded-xl hover:bg-primary/5 hover:border-primary transition-all text-left"
                                    >
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary"><Plus size={20} /></div>
                                        <div>
                                            <p className="font-bold text-sm">Add New Product</p>
                                            <p className="text-xs text-gray-500">Expand your inventory</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'products' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Products</h1>
                                    <p className="text-gray-500 text-sm mt-1">Manage and update your product listings effectively.</p>
                                </div>
                                <Link
                                    to="/admin/products/new"
                                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 w-full sm:w-auto"
                                >
                                    <Plus size={20} />
                                    <span>Add Product</span>
                                </Link>
                            </div>

                            {/* Search & Filters */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <button
                                    onClick={fetchData}
                                    className="p-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    title="Refresh List"
                                >
                                    <RefreshCw size={22} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {/* Products Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product Details</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Base Price</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                                        <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
                                                        <span className="font-medium">Syncing with database...</span>
                                                    </td>
                                                </tr>
                                            ) : filteredProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                                        <Package className="mx-auto mb-4 opacity-20" size={48} />
                                                        <span className="font-medium text-lg">No products match your criteria.</span>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredProducts.map((p) => (
                                                    <tr key={p.id || p.product_id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                                    <Package size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900 leading-tight">{p.name || p.product_name}</div>
                                                                    <div className="text-gray-400 text-[10px] font-mono mt-1 uppercase tracking-tighter">ID: {p.id || p.product_id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{p.category}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-gray-900">₹{p.price}</div>
                                                            {p.originalPrice && <div className="text-xs text-gray-400 line-through">₹{p.originalPrice}</div>}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            {p.isDeleted ? (
                                                                <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2.5 py-1 rounded-lg w-fit">
                                                                    <XCircle size={14} />
                                                                    <span className="text-xs font-bold uppercase tracking-wide">Archived</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-green-500 bg-green-50 px-2.5 py-1 rounded-lg w-fit">
                                                                    <CheckCircle size={14} />
                                                                    <span className="text-xs font-bold uppercase tracking-wide">Active</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Link
                                                                    to={`/admin/products/edit/${p.id || p.product_id}`}
                                                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Product"
                                                                >
                                                                    <Pencil size={18} />
                                                                </Link>
                                                                {p.isDeleted ? (
                                                                    <button
                                                                        onClick={() => handleRestore(p.id || p.product_id)}
                                                                        className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                                        title="Restore Product"
                                                                    >
                                                                        <RefreshCw size={18} />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleDelete(p.id || p.product_id)}
                                                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                                        title="Archive Product"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {activeTab === 'appearance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            {/* Banner Management */}
                            <section className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Hero Banners</h2>
                                        <p className="text-gray-500 text-sm mt-1">Manage the image carousel on the home page</p>
                                    </div>
                                    <button
                                        onClick={() => setSiteSettings({
                                            ...siteSettings,
                                            banners: [
                                                ...siteSettings.banners,
                                                { id: Date.now().toString(), image: '', title: 'New Banner', subtitle: '', link: '/search' }
                                            ]
                                        })}
                                        className="bg-primary/5 text-primary hover:bg-primary hover:text-white px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <PlusCircle size={20} />
                                        Add Banner
                                    </button>
                                </div>
                                <div className="grid gap-6">
                                    {(siteSettings?.banners || []).map((banner: any, index: number) => (
                                        <div key={banner.id} className="group relative bg-gray-50 p-6 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all">
                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                                <div className="lg:col-span-1">
                                                    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200 border relative group/img">
                                                        {banner.image ? (
                                                            <img src={getImageUrl(banner.image)} alt="Banner" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <ImageIcon size={32} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <FileUpload
                                                        label="Banner Image"
                                                        value={banner.image}
                                                        onUpload={(url) => {
                                                            const newBanners = [...siteSettings.banners];
                                                            newBanners[index].image = url;
                                                            setSiteSettings({ ...siteSettings, banners: newBanners });
                                                        }}
                                                        placeholder="Upload banner image..."
                                                    />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Main Title</label>
                                                        <input
                                                            value={banner.title}
                                                            onChange={(e) => {
                                                                const newBanners = [...siteSettings.banners];
                                                                newBanners[index].title = e.target.value;
                                                                setSiteSettings({ ...siteSettings, banners: newBanners });
                                                            }}
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                                                            placeholder="Banner Title"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Subtitle</label>
                                                        <input
                                                            value={banner.subtitle}
                                                            onChange={(e) => {
                                                                const newBanners = [...siteSettings.banners];
                                                                newBanners[index].subtitle = e.target.value;
                                                                setSiteSettings({ ...siteSettings, banners: newBanners });
                                                            }}
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                                                            placeholder="Secondary text..."
                                                        />
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newBanners = siteSettings.banners.filter((_: any, i: number) => i !== index);
                                                    setSiteSettings({ ...siteSettings, banners: newBanners });
                                                }}
                                                className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Category Management */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Categories</h2>
                                        <p className="text-gray-500 text-sm mt-1">Manage categories, icons, and names for the homepage grid</p>
                                    </div>
                                    <button
                                        onClick={() => setSiteSettings({
                                            ...siteSettings,
                                            categories: [
                                                ...siteSettings.categories,
                                                { id: Date.now().toString(), name: 'New Category', icon: '📦' }
                                            ]
                                        })}
                                        className="bg-primary/5 text-primary hover:bg-primary hover:text-white px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <PlusCircle size={20} />
                                        Add Category
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(siteSettings?.categories || []).map((cat: any, index: number) => (
                                        <div key={cat.id} className="relative flex flex-col gap-3 bg-gray-50 p-5 rounded-3xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-primary/10 group">
                                            <button
                                                onClick={() => {
                                                    const newCats = siteSettings.categories.filter((_: any, i: number) => i !== index);
                                                    setSiteSettings({ ...siteSettings, categories: newCats });
                                                }}
                                                className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                <X size={14} />
                                            </button>
                                            <FileUpload
                                                value={cat.image}
                                                onUpload={(url) => {
                                                    const newCats = [...siteSettings.categories];
                                                    newCats[index].image = url;
                                                    setSiteSettings({ ...siteSettings, categories: newCats });
                                                }}
                                                className="w-full"
                                            />
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Display Name</label>
                                                <input
                                                    value={cat.name}
                                                    onChange={(e) => {
                                                        const newCats = [...siteSettings.categories];
                                                        newCats[index].name = e.target.value;
                                                        setSiteSettings({ ...siteSettings, categories: newCats });
                                                    }}
                                                    className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 outline-none focus:border-primary/20 text-xs font-black text-gray-700 uppercase tracking-tighter"
                                                    placeholder="Category Name"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={async () => {
                                        try {
                                            setIsSavingSettings(true);
                                            await api.patch('/settings', siteSettings);
                                            toast.success('Site settings updated successfully');
                                        } catch (error) {
                                            toast.error('Failed to update site settings');
                                        } finally {
                                            setIsSavingSettings(false);
                                        }
                                    }}
                                    disabled={isSavingSettings}
                                    className="bg-primary text-white px-16 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-4"
                                >
                                    {isSavingSettings ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                                    <span>Sync Appearance Settings</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to discard your unsaved changes?')) {
                                            fetchData(); // Re-fetch from server
                                            localStorage.removeItem('vruksha_admin_settings_draft');
                                        }
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-widest flex items-center gap-1"
                                >
                                    <Trash2 size={14} />
                                    Discard Draft
                                </button>
                            </div>
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="mb-8">
                                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Contact Information</h2>
                                    <p className="text-gray-500 text-sm mt-1">Update the contact details displayed on the storefront</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Support Email</label>
                                        <input
                                            type="email"
                                            value={siteSettings.contactEmail || ''}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                                            placeholder="support@vrukshacomposites.com"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Support Phone</label>
                                        <input
                                            type="text"
                                            value={siteSettings.contactPhone || ''}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                                            placeholder="+91 99999 99999"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Physical Address</label>
                                        <textarea
                                            rows={2}
                                            value={siteSettings.contactAddress || ''}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, contactAddress: e.target.value })}
                                            placeholder="Company Address..."
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="mb-8">
                                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Site Pages</h2>
                                    <p className="text-gray-500 text-sm mt-1">Manage the content of informational pages</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">About Us</label>
                                        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent focus-within:border-primary/20 transition-all">
                                            <ReactQuill
                                                theme="snow"
                                                value={siteSettings.aboutUs || ''}
                                                onChange={(content) => setSiteSettings({ ...siteSettings, aboutUs: content })}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Privacy Policy</label>
                                        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent focus-within:border-primary/20 transition-all">
                                            <ReactQuill
                                                theme="snow"
                                                value={siteSettings.privacyPolicy || ''}
                                                onChange={(content) => setSiteSettings({ ...siteSettings, privacyPolicy: content })}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Terms & Conditions</label>
                                        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent focus-within:border-primary/20 transition-all">
                                            <ReactQuill
                                                theme="snow"
                                                value={siteSettings.termsAndConditions || ''}
                                                onChange={(content) => setSiteSettings({ ...siteSettings, termsAndConditions: content })}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Returns Policy</label>
                                        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent focus-within:border-primary/20 transition-all">
                                            <ReactQuill
                                                theme="snow"
                                                value={siteSettings.returnsPolicy || ''}
                                                onChange={(content) => setSiteSettings({ ...siteSettings, returnsPolicy: content })}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={async () => {
                                        try {
                                            setIsSavingSettings(true);
                                            await api.patch('/settings', siteSettings);
                                            toast.success('Content settings updated successfully');
                                            localStorage.removeItem('vruksha_admin_settings_draft');
                                        } catch (error) {
                                            toast.error('Failed to update settings');
                                        } finally {
                                            setIsSavingSettings(false);
                                        }
                                    }}
                                    disabled={isSavingSettings}
                                    className="bg-primary text-white px-16 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-4"
                                >
                                    {isSavingSettings ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                                    <span>Publish Content Changes</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="p-4 lg:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Customer Orders</h1>
                                <button onClick={fetchData} className="p-2 text-primary hover:bg-primary/5 rounded-full transition-all">
                                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">No orders found yet.</td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order.id || order._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{String(order.id || order._id).slice(-8).toUpperCase()}</td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900">{order.userId?.name || 'Guest'}</p>
                                                            <p className="text-xs text-gray-400">{order.userId?.email || 'N/A'}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                                {order.paymentStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'delivered' ? 'bg-blue-100 text-blue-600' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/admin/orders/${order.id || order._id}`}
                                                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </Link>
                                                            <Link
                                                                to={`/admin/orders/${order.id || order._id}/tracking`}
                                                                className="p-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest px-3"
                                                                title="Manage Tracking"
                                                            >
                                                                <Truck size={14} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
