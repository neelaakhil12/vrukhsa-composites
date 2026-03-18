
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');

function splitChoppedProducts() {
    const rawData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const data = JSON.parse(rawData);
    const newProducts = [];

    // Targets to split: Name -> New ID Suffix or Logic
    const targets = ['Banana Fiber', 'Sisal Fiber', 'Flax Fiber'];

    data.products.forEach(p => {
        // Check if this is a target product
        if (targets.includes(p.product_name)) {
            console.log(`Splitting Chopped version for: ${p.product_name}`);

            // Create Clone
            const chopped = JSON.parse(JSON.stringify(p));

            // Modify Clone
            chopped.product_id = `${p.product_id}-C`;
            chopped.product_name = `Chopped ${p.product_name}`;
            chopped.subcategory = "Chopped Fibers";
            chopped.images = []; // Will be filled by map logic
            chopped.specifications.forms_available = ["Chopped"];

            // Modify Parent (Original) - Optional? 
            // User didn't explicitly say remove chopped from parent, but "different products" implies separation.
            // Leaving "Chopped" in parent's "forms_available" might be confusing if they are separate cards?
            // "Banana Fiber" card might imply "Raw" primarily.
            // Let's remove "Chopped" from parent's forms to be clean.
            p.specifications.forms_available = p.specifications.forms_available.filter(f => f !== "Chopped");

            newProducts.push(chopped);
        }
    });

    data.products.push(...newProducts);

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 4));
    console.log(`Added ${newProducts.length} new Chopped products:`);
    newProducts.forEach(p => console.log(` - ${p.product_name}`));
}

splitChoppedProducts();
