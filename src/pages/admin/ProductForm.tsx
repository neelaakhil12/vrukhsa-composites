import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    Save, 
    Loader2, 
    PlusCircle, 
    MinusCircle, 
    CheckCircle,
    X,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '@/api/client';
import FileUpload from '@/components/FileUpload';
import { getImageUrl } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProductForm = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const isEditing = !!productId;

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
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
        seller: 'Vruksha Composites',
        deliveryTime: '4-5 business days'
    });

    // Custom UI for adding specifications (replacing prompt)
    const [newSpecKey, setNewSpecKey] = useState('');
    const [isAddingSpec, setIsAddingSpec] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch categories for the dropdown
                const { data: settingsData } = await api.get('/settings');
                setCategories(settingsData.categories || []);

                if (isEditing) {
                    const { data: product } = await api.get(`/products/${productId}`);
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
                        seller: product.seller || 'Vruksha Composites',
                        deliveryTime: product.deliveryTime || '4-5 business days'
                    });
                }
            } catch (error) {
                toast.error('Failed to load product data');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [productId, isEditing]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stockQuantity: parseInt(formData.stockQuantity) || 0,
            };

            if (isEditing) {
                await api.patch(`/products/${productId}`, data);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', data);
                toast.success('Product created successfully');
            }
            navigate('/admin');
        } catch (error) {
            toast.error('Failed to save product');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const addSpecification = () => {
        if (!newSpecKey.trim()) return;
        if (formData.specifications[newSpecKey]) {
            toast.error('Specification already exists');
            return;
        }
        setFormData({
            ...formData,
            specifications: { ...formData.specifications, [newSpecKey]: '' }
        });
        setNewSpecKey('');
        setIsAddingSpec(false);
    };

    const removeSpecification = (key: string) => {
        const { [key]: _, ...rest } = formData.specifications;
        setFormData({ ...formData, specifications: rest });
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
                <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm tracking-widest uppercase"
                    >
                        <ChevronLeft size={20} />
                        Back to Inventory
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Live Editing
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 lg:p-12 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
                            {isEditing ? 'Editing Product' : 'Create New Listing'}
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">
                            {isEditing ? `Update listing details for ${formData.name}` : 'Introduce a new high-quality product to your inventory.'}
                        </p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="p-8 lg:p-12 space-y-12">
                        {/* Section 1: Basic Information */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="bg-primary/10 p-2 rounded-xl text-primary"><Info size={20} /></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Core Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Display Name</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Lithium Nano Powder"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold placeholder:text-gray-300 text-lg"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Primary Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select Primary Category</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Sub-Category</label>
                                    <input
                                        type="text"
                                        value={formData.subCategory}
                                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                        placeholder="Pure Nano Powder"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Sale Price (₹)</label>
                                    <input
                                        type="number" required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-black text-xl text-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold text-gray-400 line-through"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Rich Text Description */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="bg-primary/10 p-2 rounded-xl text-primary"><MinusCircle size={20} className="rotate-90" /></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Technical Description</h2>
                            </div>
                            
                            <div className="quill-premium">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Product Narrative & Use Cases</label>
                                <ReactQuill 
                                    theme="snow"
                                    value={formData.description}
                                    onChange={(content) => setFormData({ ...formData, description: content })}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                                    placeholder="Write a detailed product description, include bullet points, headings and paragraphs..."
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['clean']
                                        ],
                                    }}
                                />
                            </div>
                        </section>

                        {/* Section 3: Specs & Inventory */}
                        <section className="space-y-8">
                             <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="bg-primary/10 p-2 rounded-xl text-primary"><PlusCircle size={20} /></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Specifications & Stock</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Warranty Details</label>
                                    <input
                                        type="text"
                                        value={formData.warranty}
                                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                        placeholder="e.g. 1 Year Manufacturer Warranty"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Expected Delivery Time</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryTime}
                                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                                        placeholder="e.g. 4-5 business days"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all outline-none font-bold text-gray-600"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Technical Parameters</label>
                                        {!isAddingSpec ? (
                                            <button 
                                                type="button" 
                                                onClick={() => setIsAddingSpec(true)}
                                                className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                                            >
                                                <PlusCircle size={16} />
                                                Add Parameter
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                                <input 
                                                    autoFocus
                                                    value={newSpecKey}
                                                    onChange={(e) => setNewSpecKey(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                                                    placeholder="Specify Name (e.g. Purity)"
                                                    className="px-4 py-2 text-xs border border-primary/20 rounded-lg outline-none focus:border-primary transition-all"
                                                />
                                                <button type="button" onClick={addSpecification} className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors"><CheckCircle size={14} /></button>
                                                <button type="button" onClick={() => setIsAddingSpec(false)} className="text-gray-400 p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={14} /></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {Object.entries(formData.specifications).length === 0 ? (
                                            <div className="bg-gray-50 border border-dashed rounded-2xl p-6 text-center text-gray-400 italic text-sm">
                                                No technical specifications added yet. Add parameters to help customers understand the product.
                                            </div>
                                        ) : (
                                            Object.entries(formData.specifications).map(([key, value]) => (
                                                <div key={key} className="flex gap-4 items-center group animate-in fade-in">
                                                    <div className="bg-primary/5 text-primary border border-primary/10 px-6 py-3.5 rounded-2xl min-w-[180px] text-xs font-black uppercase tracking-widest flex-shrink-0">
                                                        {key}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            specifications: { ...formData.specifications, [key]: e.target.value }
                                                        })}
                                                        placeholder={`Property value for ${key}`}
                                                        className="flex-1 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-bold text-gray-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpecification(key)}
                                                        className="p-3 text-gray-200 hover:text-red-500 transition-all transform hover:scale-110 active:scale-95"
                                                    >
                                                        <MinusCircle size={22} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Visuals */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="bg-primary/10 p-2 rounded-xl text-primary"><PlusCircle size={20} className="rotate-45" /></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Product Media</h2>
                            </div>

                            <div className="space-y-8">
                                <FileUpload
                                    label="Cover Media (Primary Image)"
                                    value={formData.images[0] || ''}
                                    onUpload={(url) => {
                                        const newImages = [...formData.images];
                                        newImages[0] = url;
                                        setFormData({ ...formData, images: newImages });
                                    }}
                                    placeholder="Upload the main product image that will appear on search results..."
                                />

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Gallery Collection</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                                            className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest"
                                        >
                                            <PlusCircle size={16} />
                                            Add More
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {formData.images.slice(1).map((img, idx) => (
                                            <FileUpload
                                                key={idx}
                                                value={img}
                                                onUpload={(url) => {
                                                    const newImages = [...formData.images];
                                                    newImages[idx + 1] = url;
                                                    setFormData({ ...formData, images: newImages });
                                                }}
                                                placeholder={`Gallery image ${idx + 1}`}
                                                className="animate-in zoom-in-95"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Form Submission */}
                        <div className="pt-12 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="w-full sm:w-auto px-12 py-5 rounded-[2rem] font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel Changes
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full sm:w-auto bg-primary text-white px-16 py-5 rounded-[2rem] font-black shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>{isEditing ? 'Sync Updates' : 'Publish Listing'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductForm;
