const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');

function updateSynthetics() {
    console.log("Reading product data...");
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    let products = data.products;

    // Helper to check if product exists
    const exists = (name) => products.some(p => p.product_name === name);

    const newEntries = [];

    // --- 1. Missing Fibers ---
    if (!exists('Nylon Fiber 6')) {
        newEntries.push({
            product_id: 'VC-SF-007',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Nylon Fiber 6',
            specifications: {
                material: 'Nylon 6',
                types_available: ['18mm', '24mm']
            },
            applications: ['Concrete reinforcement', 'Industrial textiles'],
            tags: ['synthetic', 'nylon', 'reinforcement'],
            images: ['/placeholder.svg']
        });
    }

    if (!exists('Polyvinyl Alcohol Fiber (PVA)')) {
        newEntries.push({
            product_id: 'VC-SF-008',
            category: 'Synthetic Fibers',
            subcategory: 'Chopped Fibers',
            product_name: 'Polyvinyl Alcohol Fiber (PVA)',
            specifications: {
                material: 'PVA',
                types_available: ['Chopped', 'Fiber']
            },
            applications: ['Cement reinforcement', 'Paper industry'],
            tags: ['synthetic', 'pva', 'reinforcement'],
            images: ['/placeholder.svg']
        });
    }

    // --- 2. Yarns ---
    const yarns = [
        { name: 'Carbon Fiber Yarn', id: 'VC-SF-Y-001', specs: ['12K', '24K'] },
        { name: 'Aramid Fiber Yarn', id: 'VC-SF-Y-002', specs: ['12K', '24K'] }, // Diagram says 12k, 24k
        { name: 'Glass Fiber Yarn', id: 'VC-SF-Y-003', specs: ['12K', '24K'] },
        { name: 'Basalt Fiber Yarn', id: 'VC-SF-Y-004', specs: ['12K', '24K'] }
    ];

    yarns.forEach(y => {
        if (!exists(y.name)) {
            newEntries.push({
                product_id: y.id,
                category: 'Synthetic Fibers',
                subcategory: 'Yarns',
                product_name: y.name,
                specifications: {
                    material: y.name.replace(' Yarn', ''),
                    types_available: y.specs
                },
                applications: ['Weaving', 'Filament winding', 'Pultrusion'],
                tags: ['synthetic', 'yarn', 'roving', 'towing'],
                images: ['/placeholder.svg']
            });
        }
    });

    // --- 3. Fabrics (Split by Weave/Direction) ---
    // Carbon
    const carbonFabrics = [
        { name: 'Carbon Fiber Fabric (Twill)', id: 'VC-SF-F-001-TW', type: 'Twill Weave' },
        { name: 'Carbon Fiber Fabric (Plain)', id: 'VC-SF-F-001-PL', type: 'Plain Weave' },
        { name: 'Carbon Fiber Fabric UD', id: 'VC-SF-F-001-UD', type: 'Unidirectional' },
        { name: 'Carbon Fiber Fabric BD', id: 'VC-SF-F-001-BD', type: 'Bidirectional' }
    ];
    // Basalt
    const basaltFabrics = [
        { name: 'Basalt Fiber Fabric (Twill)', id: 'VC-SF-F-002-TW', type: 'Twill Weave' },
        { name: 'Basalt Fiber Fabric (Plain)', id: 'VC-SF-F-002-PL', type: 'Plain Weave' },
        { name: 'Basalt Fiber Fabric UD', id: 'VC-SF-F-002-UD', type: 'Unidirectional' },
        { name: 'Basalt Fiber Fabric BD', id: 'VC-SF-F-002-BD', type: 'Bidirectional' }
    ];
    // Kevlar (Aramid)
    const kevlarFabrics = [
        { name: 'Kevlar Fiber Fabric (Twill)', id: 'VC-SF-F-003-TW', type: 'Twill Weave' },
        { name: 'Kevlar Fiber Fabric (Plain)', id: 'VC-SF-F-003-PL', type: 'Plain Weave' },
        { name: 'Kevlar Fiber Fabric UD', id: 'VC-SF-F-003-UD', type: 'Unidirectional' },
        { name: 'Kevlar Fiber Fabric BD', id: 'VC-SF-F-003-BD', type: 'Bidirectional' }
    ];
    // Glass
    const glassFabrics = [
        { name: 'Glass Fiber Fabric (Twill)', id: 'VC-SF-F-004-TW', type: 'Twill Weave' },
        { name: 'Glass Fiber Fabric (Plain)', id: 'VC-SF-F-004-PL', type: 'Plain Weave' },
        { name: 'Glass Fiber Fabric UD', id: 'VC-SF-F-004-UD', type: 'Unidirectional' },
        { name: 'Glass Fiber Fabric BD', id: 'VC-SF-F-004-BD', type: 'Bidirectional' },
        { name: 'Glass Fiber Fabric (S-Type)', id: 'VC-SF-F-004-S', type: 'S-Type' },
        { name: 'Glass Fiber Fabric (AR-Type)', id: 'VC-SF-F-004-AR', type: 'AR-Type' }
    ];
    // UHMWPE
    const uhmwpeFabrics = [
        { name: 'UHMWPE Fiber Fabric UD', id: 'VC-SF-F-005-UD', type: 'Unidirectional' },
        { name: 'UHMWPE Fiber Fabric BD', id: 'VC-SF-F-005-BD', type: 'Bidirectional' },
        { name: 'UHMWPE Fiber Fabric (Twill)', id: 'VC-SF-F-005-TW', type: 'Twill Weave' },
        { name: 'UHMWPE Fiber Fabric (Plain)', id: 'VC-SF-F-005-PL', type: 'Plain Weave' }
    ];

    const allFabrics = [...carbonFabrics, ...basaltFabrics, ...kevlarFabrics, ...glassFabrics, ...uhmwpeFabrics];

    allFabrics.forEach(f => {
        if (!exists(f.name)) {
            newEntries.push({
                product_id: f.id,
                category: 'Synthetic Fibers',
                subcategory: 'Fabrics',
                product_name: f.name,
                specifications: {
                    type: f.type,
                    forms_available: [f.type]
                },
                applications: ['Structural reinforcement', 'Aerospace', 'Automotive', 'Marine'],
                tags: ['synthetic', 'fabric', 'weave', 'reinforcement'],
                images: ['/placeholder.svg']
            });
        }
    });

    if (newEntries.length > 0) {
        data.products.push(...newEntries);
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 4));
        console.log(`Added ${newEntries.length} new synthetic products.`);
    } else {
        console.log("No new products to add.");
    }
}

updateSynthetics();
