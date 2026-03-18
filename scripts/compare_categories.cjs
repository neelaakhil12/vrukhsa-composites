const fs = require('fs');

const filePath = 'c:/Users/Neelam/Desktop/ecom-experience/src/data/products_master.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Find anything Nano-related
const nanoProducts = data.products.filter(p =>
    (p.category && p.category.toLowerCase().includes('nano')) ||
    (p.subcategory && p.subcategory.toLowerCase().includes('nano')) ||
    (p.product_name && p.product_name.toLowerCase().includes('nano'))
);

// Chemical Powders
const chemicalPowders = data.products.filter(p =>
    (p.category && p.category.toLowerCase().includes('chemical powders')) ||
    (p.subcategory && p.subcategory.toLowerCase().includes('chemical powders'))
);

console.log(`Found ${nanoProducts.length} Nano-related products.`);
console.log(`Found ${chemicalPowders.length} Chemical Powders products.`);

const nanoNames = nanoProducts.map(p => ({ id: p.product_id, name: p.product_name.toLowerCase().trim() }));
const chemNames = chemicalPowders.map(p => ({ id: p.product_id, name: p.product_name.toLowerCase().trim() }));

console.log('\n--- Cross-Check: Exact Name Repeats ---');
let duplicates = [];
nanoNames.forEach(np => {
    chemNames.forEach(cp => {
        if (np.name === cp.name) {
            duplicates.push({ name: np.name, ids: [np.id, cp.id] });
        }
    });
});

if (duplicates.length > 0) {
    console.log('Repeated products (exact names):');
    duplicates.forEach(d => console.log(`- "${d.name}" (IDs: ${d.ids.join(', ')})`));
} else {
    console.log('No exact name repeats found.');
}

console.log('\n--- Cross-Check: Potential Partial Repeats (e.g. Nano vs Micro) ---');
const keywords = ['silica', 'alumina', 'carbon', 'titanium', 'iron', 'oxide', 'quartz', 'zirconia'];
keywords.forEach(kw => {
    const nanoMatches = nanoProducts.filter(p => p.product_name.toLowerCase().includes(kw));
    const chemMatches = chemicalPowders.filter(p => p.product_name.toLowerCase().includes(kw));
    if (nanoMatches.length > 0 && chemMatches.length > 0) {
        console.log(`Products containing "${kw}":`);
        console.log(`  Nano: ${nanoMatches.map(m => `[${m.product_id}] ${m.product_name}`).join(', ')}`);
        console.log(`  Chem: ${chemMatches.map(m => `[${m.product_id}] ${m.product_name}`).join(', ')}`);
    }
});
