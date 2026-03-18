
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');

function addCompositeProducts() {
    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

    // Check if products already exist to avoid duplicates
    const existingNames = new Set(productsData.products.map(p => p.product_name));

    const newProducts = [
        {
            product_id: "VC-CM-001",
            category: "Composite Making",
            subcategory: "Plates",
            product_name: "Composite Plate",
            specifications: {
                type: "Composite Plate",
                material: "Composite"
            },
            applications: ["Structural", "Testing"],
            tags: ["composite", "plate", "testing"],
            images: []
        },
        {
            product_id: "VC-CM-002",
            category: "Composite Making",
            subcategory: "Moulds",
            product_name: "Composite Mould",
            specifications: {
                type: "Mould",
                material: "Composite"
            },
            applications: ["Manufacturing", "Moulding"],
            tags: ["composite", "mould"],
            images: []
        },
        {
            product_id: "VC-CM-003",
            category: "Composite Making",
            subcategory: "Testing",
            product_name: "Composite Testing",
            specifications: {
                type: "Testing Service/Equipment"
            },
            applications: ["Quality Control", "R&D"],
            tags: ["composite", "testing"],
            images: []
        },
        {
            product_id: "VC-CM-004",
            category: "Composite Making",
            subcategory: "Samples",
            product_name: "Testing Sample",
            specifications: {
                type: "Sample"
            },
            applications: ["Testing"],
            tags: ["sample", "testing"],
            images: []
        },
        {
            product_id: "VC-CM-005",
            category: "Composite Making",
            subcategory: "General",
            product_name: "Composite", // Matches Composite.JPG
            specifications: {
                type: "General Composite"
            },
            applications: ["Various"],
            tags: ["composite"],
            images: []
        }
    ];

    let addedCount = 0;
    newProducts.forEach(p => {
        if (!existingNames.has(p.product_name)) {
            productsData.products.push(p);
            // Increment total_products count if it exists
            if (productsData.total_products) {
                productsData.total_products++;
            }
            addedCount++;
            console.log(`Added product: ${p.product_name}`);
        } else {
            console.log(`Product already exists: ${p.product_name}`);
        }
    });

    if (addedCount > 0) {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 4));
        console.log(`Successfully added ${addedCount} products.`);
    } else {
        console.log("No new products added.");
    }
}

addCompositeProducts();
