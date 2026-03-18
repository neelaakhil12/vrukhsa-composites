
const productsData = require('./src/data/products_master.json');

const mapMasterProductToAppProduct = (masterProduct) => {
    // Convert specifications values to strings if they are arrays
    const specs = {};
    if (masterProduct.specifications) {
        Object.entries(masterProduct.specifications).forEach(([key, value]) => {
            specs[key] = Array.isArray(value) ? value.join(', ') : String(value);
        });
    }

    // Determine seller based on product code prefix or logic (defaulting to Vruksha)
    const sellerName = masterProduct.product_id?.startsWith('ANW')
        ? 'Additive NanoWorks'
        : 'Vruksha Composites';

    return {
        id: masterProduct.product_id,
        name: masterProduct.product_name,
        category: masterProduct.category?.toLowerCase() || 'uncategorized',
        subCategory: masterProduct.subcategory?.toLowerCase() || 'general',
        description: `High quality ${masterProduct.product_name}. ${masterProduct.tags?.join(', ') || ''}`,
        images: ['https://placehold.co/600x400?text=' + encodeURIComponent(masterProduct.product_name)], // Placeholder for now
        price: 1000, // Default price
        originalPrice: 1200,
        discountPercentage: 10,
        rating: 4.5,
        reviewCount: 0,
        inStock: true,
        stockQuantity: 100,
        variants: [], // tailored if needed later
        specifications: specs,
        warranty: 'Standard Warranty',
        seller: sellerName,
        isSponsored: false
    };
};

try {
    console.log('Testing mapping logic...');
    const mapped = (productsData.products || []).map(mapMasterProductToAppProduct);
    console.log('Successfully mapped', mapped.length, 'products.');
    // Check for undefined fields that shouldn't be
    mapped.forEach((p, i) => {
        if (!p.id) console.error(`Product at index ${i} is missing ID`, p);
        if (!p.name) console.error(`Product at index ${i} is missing Name`, p);
    });
} catch (e) {
    console.error('Mapping failed:', e);
}
