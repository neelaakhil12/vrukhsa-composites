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
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'appearance' | 'content' | 'orders'>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [siteSettings, setSiteSettings] = useState<any>({ banners: [], categories: [] });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subCategory: '',
        price: '',
        originalPrice: '',
        description: '',
        images: [] as string[],
        availableOffers: [] as string[],
        specifications: {} as Record<string, string>,
        stockQuantity: '0',
        warranty: '',
        isSponsored: false,
        seller: 'Vruksha Composites'
    });
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [{ data: productsData }, { data: settingsData }, { data: ordersData }] = await Promise.all([
                api.get('/products'),
                api.get('/settings'),
                api.get('/orders/admin/all')
            ]);
            setProducts(productsData);
            setSiteSettings(settingsData);
            setOrders(ordersData);
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || product.product_name || '',
                category: product.category || '',
                subCategory: product.subCategory || '',
                price: product.price?.toString() || '',
                originalPrice: product.originalPrice?.toString() || '',
                description: product.description || '',
                images: product.images || [],
                availableOffers: product.availableOffers || [],
                specifications: product.specifications || {},
                stockQuantity: product.stockQuantity?.toString() || '0',
                warranty: product.warranty || '',
                isSponsored: !!product.isSponsored,
                seller: product.seller || 'Vruksha Composites'
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                subCategory: '',
                price: '',
                originalPrice: '',
                description: '',
                images: [],
                availableOffers: [],
                specifications: {},
                stockQuantity: '0',
                warranty: '',
                isSponsored: false,
                seller: 'Vruksha Composites'
            });
        }
        setIsModalOpen(true);
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stockQuantity: parseInt(formData.stockQuantity) || 0,
            };

            if (editingProduct) {
                await api.patch(`/products/${editingProduct.id || editingProduct.product_id}`, data);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', data);
                toast.success('Product created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus: status });
            toast.success('Order status updated');
            fetchData();
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: status });
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/orders/${orderId}/payment`, { paymentStatus: status });
            toast.success('Payment status updated');
            fetchData();
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, paymentStatus: status });
            }
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
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
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
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
                                    <button
                                        onClick={() => { setActiveTab('products'); handleOpenModal(); }}
                                        className="flex items-center gap-3 p-4 border rounded-xl hover:bg-primary/5 hover:border-primary transition-all text-left"
                                    >
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary"><Plus size={20} /></div>
                                        <div>
                                            <p className="font-bold text-sm">Add New Product</p>
                                            <p className="text-xs text-gray-500">Expand your inventory</p>
                                        </div>
                                    </button>
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
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 w-full sm:w-auto"
                                >
                                    <Plus size={20} />
                                    <span>Add Product</span>
                                </button>
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
                                                                <button
                                                                    onClick={() => handleOpenModal(p)}
                                                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Product"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
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
                                                            <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <ImageIcon size={32} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Image URL</label>
                                                        <input
                                                            value={banner.image}
                                                            onChange={(e) => {
                                                                const newBanners = [...siteSettings.banners];
                                                                newBanners[index].image = e.target.value;
                                                                setSiteSettings({ ...siteSettings, banners: newBanners });
                                                            }}
                                                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                                                            placeholder="https://example.com/banner.jpg"
                                                        />
                                                    </div>
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
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm self-center group-hover:scale-110 transition-transform">
                                                <input
                                                    value={cat.icon}
                                                    onChange={(e) => {
                                                        const newCats = [...siteSettings.categories];
                                                        newCats[index].icon = e.target.value;
                                                        setSiteSettings({ ...siteSettings, categories: newCats });
                                                    }}
                                                    className="w-full h-full text-center bg-transparent border-none outline-none cursor-pointer"
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Display Name</label>
                                                <input
                                                    value={cat.name}
                                                    onChange={(e) => {
                                                        const newCats = [...siteSettings.categories];
                                                        newCats[index].name = e.target.value;
                                                        setSiteSettings({ ...siteSettings, categories: newCats });
                                                    }}
                                                    className="w-full bg-transparent border-none outline-none text-xs font-black text-gray-700 text-center uppercase tracking-tighter"
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
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">About Us</label>
                                        <textarea
                                            rows={6}
                                            value={siteSettings.aboutUs || ''}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, aboutUs: e.target.value })}
                                            placeholder="Write about your company here (Markdown supported)..."
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-y"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Privacy Policy</label>
                                        <textarea
                                            rows={6}
                                            value={siteSettings.privacyPolicy || ''}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, privacyPolicy: e.target.value })}
                                            placeholder="Privacy policy details..."
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-y"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Terms & Conditions</label>
                                        <textarea
                                            rows={6}
                                            value={siteSettings.termsAndConditions || ''}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, termsAndConditions: e.target.value })}
                                            placeholder="Terms and conditions..."
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-y"
                                        />
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
                                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
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
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }}
                                                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-300">
                    <div className="bg-white md:rounded-[2rem] shadow-2xl w-full max-w-2xl h-full md:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white relative">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900">{editingProduct ? 'Update Product' : 'New Listing'}</h2>
                                <p className="text-gray-400 text-xs md:text-sm mt-1">{editingProduct ? 'Modify active product specifications' : 'Add a new item to your store'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                                <XCircle size={28} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <form id="product-form" onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Display Name</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Lithium Nano Powder"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Primary Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium text-gray-700 appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select Primary Category</option>
                                            {(siteSettings?.categories || []).map((cat: any) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Subcategory</label>
                                        <input
                                            type="text"
                                            value={formData.subCategory}
                                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                            placeholder="Pure Nano Powder"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Sale Price (₹)</label>
                                        <input
                                            type="number" required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium text-gray-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Extended Description</label>
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Provide technical specifications and use cases..."
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-none"
                                        />
                                    </div>

                                    {/* Stock & Warranty */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Stock Quantity</label>
                                        <input
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Warranty Details</label>
                                        <input
                                            type="text"
                                            value={formData.warranty}
                                            onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                            placeholder="e.g. 1 Year Manufacturer Warranty"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium text-gray-600"
                                        />
                                    </div>

                                    {/* Availability & Sponsored */}
                                    <div className="md:col-span-2 flex items-center gap-6 p-4 bg-gray-50 rounded-2xl">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.isSponsored}
                                                onChange={(e) => setFormData({ ...formData, isSponsored: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Featured/Sponsored Product</span>
                                        </label>
                                    </div>

                                    {/* Available Offers */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Available Offers (one per line)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.availableOffers.join('\n')}
                                            onChange={(e) => {
                                                const offers = e.target.value.split('\n').filter(line => line.trim());
                                                setFormData({ ...formData, availableOffers: offers });
                                            }}
                                            placeholder="e.g. Bank Offer: 10% off on HDFC Cards&#10;No Cost EMI starting from ₹2,000/month"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-none"
                                        />
                                    </div>

                                    {/* Specifications Editor */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Technical Specifications</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const key = prompt('Enter specification name (e.g. Material)');
                                                    if (key) setFormData({ ...formData, specifications: { ...formData.specifications, [key]: '' } });
                                                }}
                                                className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold uppercase"
                                            >
                                                <PlusCircle size={14} />
                                                Add Specification
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {Object.entries(formData.specifications).length === 0 ? (
                                                <p className="text-sm text-gray-400 italic px-1">No specifications added yet.</p>
                                            ) : (
                                                Object.entries(formData.specifications).map(([key, value]) => (
                                                    <div key={key} className="flex gap-4 items-center">
                                                        <div className="bg-gray-100 px-4 py-3 rounded-xl min-w-[140px] text-xs font-bold text-gray-500 uppercase flex-shrink-0">
                                                            {key}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={value}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                specifications: { ...formData.specifications, [key]: e.target.value }
                                                            })}
                                                            placeholder={`Value for ${key}`}
                                                            className="flex-1 px-5 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary transition-all outline-none text-sm font-medium"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const { [key]: removed, ...rest } = formData.specifications;
                                                                setFormData({ ...formData, specifications: rest });
                                                            }}
                                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <MinusCircle size={20} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Cover Image URL</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="text"
                                                value={formData.images[0] || ''}
                                                onChange={(e) => {
                                                    const newImages = [...formData.images];
                                                    newImages[0] = e.target.value;
                                                    setFormData({ ...formData, images: newImages });
                                                }}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300"
                                            />
                                            {formData.images[0] && (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border">
                                                    <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Extra Images (one URL per line)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.images.slice(1).join('\n')}
                                            onChange={(e) => {
                                                const extraLines = e.target.value.split('\n').filter(line => line.trim());
                                                setFormData({ ...formData, images: [formData.images[0] || '', ...extraLines] });
                                            }}
                                            placeholder="https://example.com/extra1.jpg&#10;https://example.com/extra2.jpg"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300 resize-none"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={20} />
                                <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-300">
                    <div className="bg-white md:rounded-[2rem] shadow-2xl w-full max-w-4xl h-full md:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white relative">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <ShoppingBag className="text-primary" />
                                    Order Detail #{selectedOrder._id.slice(-8).toUpperCase()}
                                </h2>
                                <p className="text-gray-400 text-xs md:text-sm mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setIsOrderModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: Items & Status */}
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Items</h3>
                                        <div className="space-y-4">
                                            {selectedOrder.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl">
                                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} x {item.quantity}</p>
                                                    </div>
                                                    <p className="font-black text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center px-2">
                                            <span className="font-bold text-gray-500">Total Amount</span>
                                            <span className="text-2xl font-black text-primary">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </section>

                                    <section className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <RefreshCw size={14} />
                                            Update Order Status
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, status)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedOrder.orderStatus === status ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-500 border hover:border-primary/30'}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Side: Shipping & Payment */}
                                <div className="space-y-6">
                                    <section className="p-6 bg-gray-50 rounded-[2rem]">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Truck size={16} />
                                            Shipping Details
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{selectedOrder.shippingAddress.fullName}</p>
                                            <p className="text-gray-600 font-medium">{selectedOrder.shippingAddress.address}</p>
                                            <p className="text-gray-600 font-medium">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                                            <p className="text-primary font-bold mt-2">📞 {selectedOrder.shippingAddress.phone}</p>
                                        </div>
                                    </section>

                                    <section className="p-6 bg-gray-50 rounded-[2rem]">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CreditCard size={16} />
                                            Payment Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Method:</span>
                                                <span className="font-black text-gray-900 uppercase tracking-widest">{selectedOrder.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Status:</span>
                                                <div className="flex gap-2">
                                                    {['pending', 'paid', 'failed'].map((pStatus) => (
                                                        <button
                                                            key={pStatus}
                                                            onClick={() => handleUpdatePaymentStatus(selectedOrder._id, pStatus)}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.paymentStatus === pStatus ? (pStatus === 'paid' ? 'bg-green-500 text-white shadow-lg' : pStatus === 'failed' ? 'bg-red-500 text-white shadow-lg' : 'bg-yellow-500 text-white shadow-lg') : 'bg-white text-gray-400 border'}`}
                                                        >
                                                            {pStatus}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {selectedOrder.razorpayPaymentId && (
                                                <div className="pt-4 border-t border-dashed space-y-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Razorpay Payment ID</p>
                                                    <p className="font-mono text-xs text-primary bg-primary/5 p-2 rounded-lg">{selectedOrder.razorpayPaymentId}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
