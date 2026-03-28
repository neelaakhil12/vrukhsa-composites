"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.banners = exports.products = exports.categories = void 0;
const products_master_json_1 = __importDefault(require("./products_master.json"));
// Derived from products_master.json "product_categories"
exports.categories = [
    { id: 'natural fibers', name: 'Natural Fibers', icon: '🌿' },
    { id: 'synthetic fibers', name: 'Synthetic Fibers', icon: '🧵' },
    { id: 'nano products', name: 'Nano Products', icon: '🔬' },
    { id: 'chemical powders', name: 'Chemical Powders', icon: '🧪' },
    { id: 'resins', name: 'Resins', icon: '🧴' },
    { id: 'composite making', name: 'Composite Making', icon: '🛠️' },
    { id: 'additive nanoworks', name: 'Additive NanoWorks', icon: '⚗️' },
    { id: 'additive nanoworks - pure micro powder', name: 'Micro Powder (ANW)', icon: '🌫️' },
    { id: 'additive nanoworks - pure nano powder', name: 'Nano Powder (ANW)', icon: '⚛️' },
    { id: 'additive nanoworks - pure oxide micro powder', name: 'Oxide Micro Powder', icon: '⚪' },
    { id: 'additive nanoworks - pure oxide nano powder', name: 'Oxide Nano Powder', icon: '❄️' },
    { id: 'additive nanoworks - spherical powders', name: 'Spherical Powders', icon: '🔮' },
    { id: 'yarns', name: 'Yarns', icon: '🧵' },
    { id: 'fiber fabrics', name: 'Fiber Fabrics', icon: '📏' },
    { id: 'rebars', name: 'Rebars', icon: '🏗️' },
    { id: 'testing services', name: 'Testing Services', icon: '🧪' },
];
// transform the master json to Product interface
const mappedProducts = products_master_json_1.default.products.map((item) => {
    // Process specifications to match Record<string, string>
    const specs = {};
    if (item.specifications) {
        Object.entries(item.specifications).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                specs[key] = value.join(', ');
            }
            else {
                specs[key] = String(value);
            }
        });
    }
    // Determine category based on product info if not directly mapped
    let category = (item.category || '').toLowerCase();
    // Special handling: Promote Additive NanoWorks subcategories to top-level category IDs
    if (item.category === 'Additive NanoWorks' && item.subcategory) {
        let sub = item.subcategory.toLowerCase();
        // Normalize "Spherical Powders for Additive Manufacturing" to "spherical powders"
        if (sub.includes('spherical powders')) {
            sub = 'spherical powders';
        }
        category = `${item.category.toLowerCase()} - ${sub}`;
    }
    // Special handling: Promote Yarns subcategory to top-level category for filtering
    if (item.subcategory === 'Yarns') {
        category = 'yarns';
    }
    // Special handling: Promote Fabrics subcategory to "Fiber Fabrics" top-level category
    if (item.subcategory === 'Fabrics') {
        category = 'fiber fabrics';
    }
    // Special handling: Promote Rebars subcategory to "Rebars" top-level category
    if (item.subcategory === 'Rebars' || (item.product_name && item.product_name.includes('Rebar'))) {
        category = 'rebars';
    }
    // Special handling: Promote Chemical Powders subcategory to "Chemical Powders" top-level category
    if (item.subcategory === 'Chemical Powders') {
        category = 'chemical powders';
    }
    // Special handling: Promote Resins subcategory to "Resins" top-level category
    if (item.subcategory === 'Resins') {
        category = 'resins';
    }
    // Special handling: Promote Testing Services subcategory to "Testing Services" top-level category
    if (item.subcategory === 'Testing Services') {
        category = 'testing services';
    }
    // Create a description
    let description = item.product_name || 'No Name Product';
    if (item.applications && item.applications.length > 0) {
        description = `Applications: ${item.applications.join(', ')}`;
    }
    else if (item.tags && item.tags.length > 0) {
        description = item.tags.join(', ');
    }
    // Map Variants
    const variants = [];
    if (item.specifications) {
        if (Array.isArray(item.specifications.sizes) && item.specifications.sizes.length > 0) {
            variants.push({ name: 'Size', options: item.specifications.sizes });
        }
        else if (Array.isArray(item.specifications.types_available) && item.specifications.types_available.length > 0) {
            // For Yarns, map types_available (12K, 24K) to "Size" variant
            if (item.subcategory === 'Yarns' || (item.product_name && item.product_name.toLowerCase().includes('yarn'))) {
                variants.push({ name: 'Size', options: item.specifications.types_available });
            }
            else {
                variants.push({ name: 'Type', options: item.specifications.types_available });
            }
        }
    }
    return {
        id: item.product_id || `VC-${Math.random().toString(36).substr(2, 9)}`,
        name: item.product_name || 'No Name Product',
        category: category,
        subCategory: item.subcategory ? item.subcategory.toLowerCase() : '',
        description: description,
        images: (item.images && item.images.length > 0) ? item.images : ['https://placehold.co/500x500?text=' + encodeURIComponent(item.product_name || 'Product').substring(0, 20)],
        price: 0, // Set to 0 or request price on enquiry
        originalPrice: 0,
        discountPercentage: 0,
        rating: 4.5,
        reviewCount: 0,
        inStock: true,
        stockQuantity: 100,
        variants: variants,
        specifications: specs,
        warranty: 'Standard Warranty',
        seller: products_master_json_1.default.company_info.vruksha_composites.name,
        isSponsored: false
    };
});
// ONLY export the mapped products, no legacy items
exports.products = mappedProducts;
exports.banners = [
    {
        id: '1',
        image: '/synthetic fiber/Synthetic Fiber Images/SYNTHETIC  Fibers - JPG/Nylon Carbon & Kevlar fabric (W-Type).jpg',
        title: 'Vruksha Composites',
        subtitle: 'Expertise in Advanced Materials & Research',
        link: '/search',
    },
    {
        id: '2',
        image: '/synthetic fiber/Synthetic Fiber Images/SYNTHETIC  Fibers - JPG/Carbon Fiber Fabric (2) Twill Type.jpg',
        title: 'Additive NanoWorks',
        subtitle: 'Building the Future, Atom by Atom!',
        link: '/search?category=additive%20nanoworks',
    },
    {
        id: '3',
        image: '/nature-fiber images/Nature Fibers - JPG/Sisal Fiber 6.JPG',
        title: 'Natural Fibers',
        subtitle: 'Sustainable, Eco-friendly, and High-Performance',
        link: '/search?category=natural%20fibers',
    },
];
