import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { 
    ChevronLeft, 
    Save, 
    Loader2, 
    PlusCircle, 
    MinusCircle, 
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductForm = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subCategory: '',
        price: '',
        originalPrice: '',
        description: '',
        stockQuantity: '0',
        warranty: '',
        isSponsored: false,
        images: [''],
        availableOffers: [] as string[],
        specifications: {} as Record<string, string>
    });

    useEffect(() => {
        fetchInitialData();
    }, [productId]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const { data: settings } = await api.get('/settings');
            setCategories(settings.categories || []);

            if (productId) {
                const { data: product } = await api.get(`/products/${productId}`);
                setFormData({
                    name: product.name || product.product_name || '',
                    category: product.category || '',
                    subCategory: product.subCategory || '',
                    price: product.price?.toString() || '',
                    originalPrice: product.originalPrice?.toString() || '',
                    description: product.description || '',
                    stockQuantity: product.stockQuantity?.toString() || '0',
                    warranty: product.warranty || '',
                    isSponsored: product.isSponsored || false,
                    images: product.images?.length ? product.images : [''],
                    availableOffers: product.availableOffers || [],
                    specifications: product.specifications || {}
                });
            }
        } catch (error) {
            toast.error('Failed to load product data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stockQuantity: parseInt(formData.stockQuantity) || 0,
            };

            if (productId) {
                await api.patch(`/products/${productId}`, data);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', data);
                toast.success('Product created successfully');
            }
            navigate('/admin');
        } catch (error) {
            toast.error('Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-gray-900">{productId ? 'Edit Product' : 'Add New Product'}</h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                                {productId ? `Editing #${productId.slice(-6)}` : 'Create listing'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={isSaving}
                        className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>{productId ? 'Update Product' : 'Publish Product'}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-8">
                <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Core Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Product Name</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Lithium Nano Powder"
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Description (Full Details)</label>
                                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent focus-within:border-primary/20 transition-all">
                                        <ReactQuill 
                                            theme="snow"
                                            value={formData.description}
                                            onChange={(content) => setFormData({ ...formData, description: content })}
                                            className="bg-white min-h-[300px]"
                                            placeholder="Provide technical specifications, use cases, and detailed features..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Technical Specifications</h2>
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
                                    <p className="text-sm text-gray-400 italic px-1 bg-gray-50 p-4 rounded-2xl text-center border border-dashed">No specifications added yet.</p>
                                ) : (
                                    Object.entries(formData.specifications).map(([key, value]) => (
                                        <div key={key} className="flex gap-4 items-center group">
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
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <MinusCircle size={20} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Organization & Pricing</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Primary Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Stock Quantity</label>
                                    <input
                                        type="number" required
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Old Price</label>
                                        <input
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-medium text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Media</h2>
                            <div className="space-y-4">
                                <FileUpload
                                    label="Cover Image"
                                    value={formData.images[0] || ''}
                                    onUpload={(url) => {
                                        const newImages = [...formData.images];
                                        newImages[0] = url;
                                        setFormData({ ...formData, images: newImages });
                                    }}
                                />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gallery</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                                            className="text-primary font-bold text-xs uppercase"
                                        >+ Add</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {formData.images.slice(1).map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <FileUpload
                                                    value={img}
                                                    onUpload={(url) => {
                                                        const newImages = [...formData.images];
                                                        newImages[idx + 1] = url;
                                                        setFormData({ ...formData, images: newImages });
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newImages = formData.images.filter((_, i) => i !== idx + 1);
                                                        setFormData({ ...formData, images: newImages });
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.isSponsored}
                                    onChange={(e) => setFormData({ ...formData, isSponsored: e.target.checked })}
                                    className="w-6 h-6 rounded-lg border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">Featured Product</span>
                            </label>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProductForm;
