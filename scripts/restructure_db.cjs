
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');

function restructureProducts() {
    console.log("Reading products...");
    const rawData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const data = JSON.parse(rawData);

    // List of Natural Fibers to ensure have: Raw, Chopped, Mat UD, Mat BD
    // Based on user diagram/list
    const fibers = [
        'Banana', 'Jute', 'Sisal', 'Flax', 'Kenaf',
        'Ramie', 'Bamboo', 'Sunhemp', 'Pineapple',
        'Angora', 'Coir', 'Areca'
    ];

    const newProductList = [];

    // Helper to find existing product by fuzzy name matching
    const findProduct = (nameIncludes) => {
        return data.products.find(p => p.product_name.includes(nameIncludes));
    };

    // We will rebuild the "Natural Fibers" category items largely from scratch or transformation
    // Keep non-natural fibers as is
    const otherProducts = data.products.filter(p => !p.category.includes("Natural Fibers"));
    const existingNaturalFibers = data.products.filter(p => p.category.includes("Natural Fibers"));

    // Process each fiber type
    fibers.forEach(fiber => {
        const baseName = `${fiber} Fiber`; // e.g., "Banana Fiber"
        // Find base raw product (usually exists)
        let rawProduct = existingNaturalFibers.find(p => p.product_name === baseName || p.product_name === `${fiber} Leaf Fiber` || p.product_name === fiber);

        if (!rawProduct) {
            // Try stricter match if fuzzy failed or overly broad
            rawProduct = existingNaturalFibers.find(p => p.product_name.startsWith(fiber) && !p.product_name.includes("Mat") && !p.product_name.includes("Chopped"));
        }

        if (!rawProduct) {
            console.log(`Warning: Could not find base product for ${fiber}`);
            return;
        }

        // 1. Raw Fiber Product
        // Ensure "Chopped" is NOT in forms_available
        const rawP = JSON.parse(JSON.stringify(rawProduct));
        rawP.specifications.forms_available = rawP.specifications.forms_available.filter(f => f !== "Chopped");
        // Ensure name is consistent
        if (!rawP.product_name.includes("Leaf") && !rawP.product_name.includes("Fiber") && fiber !== "Coir" && fiber !== "Areca") {
            // Coir/Areca usually Coir Fiber. Just keeping original name if reasonable.
        }
        newProductList.push(rawP);

        // 2. Chopped Product
        // Check if already created or need to create
        let choppedP = existingNaturalFibers.find(p => p.product_name === `Chopped ${baseName}` || p.product_name === `Chopped ${fiber}`);
        if (!choppedP) {
            // Create from raw
            choppedP = JSON.parse(JSON.stringify(rawP));
            choppedP.product_id = `${rawP.product_id}-C`;
            choppedP.product_name = `Chopped ${rawP.product_name}`; // e.g. Chopped Banana Fiber
            choppedP.subcategory = "Chopped Fibers";
            choppedP.specifications.forms_available = ["Chopped", "Treated", "Untreated"];
            choppedP.images = [];
        } else {
            // Ensure specs
            choppedP.specifications.forms_available = ["Chopped", "Treated", "Untreated"];
        }
        newProductList.push(choppedP);

        // 3. Mat Products (UD and BD)
        // Find existing mat product to clone from
        // We renamed some to "Banana Mat", "Kenaf Mat", etc.
        let matSource = existingNaturalFibers.find(p => p.product_name.includes(`${fiber} Mat`) || p.product_name.includes(`${fiber} Fiber Mat`));

        // Coir and Areca might not have mats in original data, but we create them if requested? 
        // User list implies: Banana, Jute, Sisal, Flax, Kenaf, Ramie, Bamboo, Sunhemp, Pineapple HAVE Mats.
        // Angora, Coir, Areca maybe not? Diagram shows Mats for: Banana, Jute, Sisal, Flax, Kenaf, Ramie, Bamboo, Sunhemp, Pineapple.
        // So we only create Mats for those.

        const hasMats = ['Banana', 'Jute', 'Sisal', 'Flax', 'Kenaf', 'Ramie', 'Bamboo', 'Sunhemp', 'Pineapple'].includes(fiber);

        if (hasMats) {
            if (!matSource) {
                // If no existing mat, create from Raw but change cat
                matSource = JSON.parse(JSON.stringify(rawP));
                matSource.subcategory = "Mats and Fabrics";
                matSource.images = [];
            }

            // Create UD
            const udP = JSON.parse(JSON.stringify(matSource));
            udP.product_id = `${rawP.product_id.replace('-C', '')}-M-UD`; // Generate distinctive ID
            udP.product_name = `${fiber} Mat UD`; // Explicit naming
            udP.specifications.type = "Unidirectional Map";
            udP.specifications.forms_available = ["UD Mat"];
            udP.images = []; // Will be mapped cleanly
            newProductList.push(udP);

            // Create BD
            const bdP = JSON.parse(JSON.stringify(matSource));
            bdP.product_id = `${rawP.product_id.replace('-C', '')}-M-BD`;
            bdP.product_name = `${fiber} Mat BD`;
            bdP.specifications.type = "Bidirectional Map";
            bdP.specifications.forms_available = ["BD Mat"];
            bdP.images = [];
            newProductList.push(bdP);
        }
    });

    // Add back everything else (Synthetics, Resins, etc.)
    newProductList.push(...otherProducts);

    data.products = newProductList;
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 4));
    console.log("Database restructured successfully.");
    console.log(`Total products: ${newProductList.length}`);
}

restructureProducts();
