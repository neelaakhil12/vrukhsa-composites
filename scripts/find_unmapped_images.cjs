
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Helper to recursively get all files
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            // Only include image files
            if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function findUnmappedImages() {
    console.log("Reading product data...");
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const products = data.products;

    // Collect all image paths currently assigned to products
    const assignedImages = new Set();
    products.forEach(p => {
        if (p.images) {
            p.images.forEach(img => {
                // Normalize path: resolve to absolute path for comparison
                // product images are like "/nature-fiber images/..." or "/placeholder.svg"
                if (img.startsWith('/')) {
                    // Remove leading slash and join with PUBLIC_DIR
                    const absolutePath = path.join(PUBLIC_DIR, img.substring(1));
                    assignedImages.add(path.resolve(absolutePath).toLowerCase());
                }
            });
        }
    });

    console.log(`Found ${assignedImages.size} assigned image references.`);

    console.log("Scanning public directory for images...");
    const allFiles = getAllFiles(PUBLIC_DIR);
    console.log(`Found ${allFiles.length} total image files in public directory.`);

    const unmappedImages = [];
    allFiles.forEach(file => {
        const absPath = path.resolve(file).toLowerCase();
        if (!assignedImages.has(absPath)) {
            // Get relative path for display
            const relPath = path.relative(PUBLIC_DIR, file);
            unmappedImages.push(relPath);
        }
    });

    const outputLines = [];
    outputLines.push("--- Unmapped Images Output ---");
    if (unmappedImages.length === 0) {
        outputLines.push("All images in the directory are mapped to products!");
    } else {
        outputLines.push(`Found ${unmappedImages.length} unmapped images:`);
        unmappedImages.forEach(img => outputLines.push(` - ${img}`));
    }

    fs.writeFileSync('unmapped_output.txt', outputLines.join('\n'));
    console.log("Wrote report to unmapped_output.txt");
}

findUnmappedImages();
