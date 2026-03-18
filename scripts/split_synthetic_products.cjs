const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');

function splitSynthetics() {
    console.log("Reading product data...");
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    let products = data.products;

    // 1. Remove Old "Combined" Products
    const toRemove = [
        'Steel Fiber (Hooked end / Crimped / Micro)',
        'Glass Fiber (E, AR, S, 6MM, 12MM & Powder)',
        'Polypropylene Fiber (Plastic, Micro / 6MM, 12MM, 54MM)'
    ];

    products = products.filter(p => !toRemove.includes(p.product_name));

    // 2. Add New Split Products
    const newProducts = [
        // --- Steel Fiber ---
        {
            product_id: 'VC-SF-001-Hooked',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Steel Fiber (Hooked)',
            specifications: { material: 'Steel', type: 'Hooked End', sizes: ['30mm', '35mm', '60mm'] },
            applications: ['Concrete reinforcement', 'Industrial flooring'],
            tags: ['synthetic', 'steel', 'hooked', 'reinforcement'],
            images: ['/placeholder.svg']
        },
        {
            product_id: 'VC-SF-001-Crimped',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Steel Fiber (Crimped)',
            specifications: { material: 'Steel', type: 'Crimped', sizes: ['30mm', '35mm', '60mm'] },
            applications: ['Concrete reinforcement', 'Shotcrete'],
            tags: ['synthetic', 'steel', 'crimped', 'reinforcement'],
            images: ['/placeholder.svg']
        },
        {
            product_id: 'VC-SF-001-Micro',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Steel Fiber (Micro)',
            specifications: { material: 'Steel', type: 'Micro', sizes: ['6mm', '12mm'] }, // Assumption on sizes or based on use case
            applications: ['UHPC', 'Refractory'],
            tags: ['synthetic', 'steel', 'micro', 'reinforcement'],
            images: ['/placeholder.svg']
        },

        // --- Glass Fiber ---
        {
            product_id: 'VC-SF-002-E',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Glass Fiber (E-Type)',
            specifications: { material: 'E-Glass', form: 'Chopped Strands', sizes: ['6mm', '12mm', '24mm'] },
            applications: ['General composites', 'Automotive', 'Marine'],
            tags: ['synthetic', 'glass', 'e-glass', 'reinforcement'],
            images: ['/placeholder.svg']
        },
        {
            product_id: 'VC-SF-002-AR',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Glass Fiber (AR-Type)',
            specifications: { material: 'AR-Glass', form: 'Chopped Strands', sizes: ['6mm', '12mm', '24mm'] },
            applications: ['GRC', 'Concrete reinforcement', 'Alkali Resistant'],
            tags: ['synthetic', 'glass', 'ar-glass', 'reinforcement'],
            images: ['/placeholder.svg']
        },
        {
            product_id: 'VC-SF-002-S',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Glass Fiber (S-Type)',
            specifications: { material: 'S-Glass', form: 'Chopped Strands', sizes: ['6mm', '12mm'] },
            applications: ['High performance composites', 'Aerospace', 'Ballistic'],
            tags: ['synthetic', 'glass', 's-glass', 'reinforcement'],
            images: ['/placeholder.svg']
        },
        // Glass Powder? Diagram says "Glass powder"
        {
            product_id: 'VC-SF-002-Powder',
            category: 'Synthetic Fibers',
            subcategory: 'Powders',
            product_name: 'Glass Powder',
            specifications: { material: 'Glass', form: 'Powder', mesh_size: '300 mesh' }, // Example spec
            applications: ['Fillers', 'Coatings', 'Resin systems'],
            tags: ['synthetic', 'glass', 'powder', 'filler'],
            images: ['/placeholder.svg']
        },

        // --- Polypropylene Fiber ---
        {
            product_id: 'VC-SF-003-Mono',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Polypropylene Fiber (Mono-filament)',
            specifications: { material: 'Polypropylene', type: 'Mono-filament', sizes: ['6mm', '12mm'] },
            applications: ['Crack control', 'Plastering', 'Screeds'],
            tags: ['synthetic', 'pp', 'monofilament', 'reinforcement'],
            images: ['/placeholder.svg']
        },
        {
            product_id: 'VC-SF-003-Macro',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Polypropylene Fiber (Macro-filament)',
            specifications: { material: 'Polypropylene', type: 'Macro-filament', sizes: ['40mm', '54mm'] },
            applications: ['Structural concrete', 'Flooring', 'Shotcrete'],
            tags: ['synthetic', 'pp', 'macro', 'reinforcement'],
            images: ['/placeholder.svg']
        }
    ];

    products.push(...newProducts);

    // 3. Update Specifications for Existing Chopped Fibers
    products.forEach(p => {
        if (p.product_name.includes('Basalt Fiber') && p.subcategory === 'Chopped Fibers') {
            p.specifications.types_available = ['Chopped', '18mm', '12mm', '18mm', '24mm']; // 18 appears 2x in diagram? Typo? "8,12,18,24" likely
            p.specifications.sizes = ['8mm', '12mm', '18mm', '24mm'];
        }
        if (p.product_name.includes('Carbon Fiber') && p.subcategory === 'Chopped Fibers') {
            p.specifications.types_available = ['Chopped', '8mm', '12mm', '18mm', '24mm'];
            p.specifications.sizes = ['8mm', '12mm', '18mm', '24mm'];
        }
        if (p.product_name.includes('Aramid Fiber') && p.subcategory === 'Chopped Fibers') {
            p.specifications.types_available = ['Chopped', '8mm', '12mm', '18mm', '24mm'];
            p.specifications.sizes = ['8mm', '12mm', '18mm', '24mm'];
        }
        if (p.product_name.includes('Nylon Fiber 6') && p.subcategory === 'Chopped Fibers') {
            p.specifications.types_available = ['18mm', '24mm'];
            p.specifications.sizes = ['18mm', '24mm'];
        }
    });

    data.products = products;
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 4));
    console.log(`Split synthetic products. Total products: ${products.length}`);
}

splitSynthetics();
