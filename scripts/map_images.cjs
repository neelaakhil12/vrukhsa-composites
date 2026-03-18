const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products_master.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Function to recursively get all image files
function getAllImages(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllImages(filePath, fileList);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(ext)) {
                const relativePath = path.relative(PUBLIC_DIR, filePath).split(path.sep).join('/');
                fileList.push({
                    name: file,
                    path: '/' + relativePath,
                    normalizedName: normalize(path.parse(file).name)
                });
            }
        }
    });

    return fileList;
}

function normalize(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/aluminium/g, 'aluminum')
        .replace(/nanopowder/g, '')
        .replace(/micropowder/g, '')
        .replace(/oxidepowder/g, 'oxide')
        .replace(/powder/g, '');
}

// Map of common aliases or variations -> normalized product name key
const ALIASES = {
    // Synthetic / Brand aliases
    'kevlar': 'aramidfiber',
    'kevalr': 'aramidfiber',
    'kevalr': 'aramidfiber',
    // 'nomex': 'aramidfiber', // REMOVED: Now maps to specific Nomex products
    'aramid': 'aramidfiber',
    'aramid': 'aramidfiber',
    'carbonfabric': 'carbonfiber',
    'carbonpowder': 'carbonfiber',
    'choppedcarbon': 'carbonfiber',
    'choppedbasalt': 'basaltfiber',
    'bananayarn': 'bananafiber',
    'silkyarn': 'silkfiber',
    'silk': 'silkfiber',
    'epoxyresin': 'epoxyresin',
    'epoxy': 'epoxyresin',
    'gfrp': 'gfrprebar', // Remapped to GFRP Rebar
    'bfrp': 'bfrprebar', // Remapped to BFRP Rebar
    'palmyra': 'palmyrafiber',
    'vimhal': 'vimalfiber',

    // --- Mat Aliases ---
    // Rule: Only map [fiber]mat, [fiber]fabric, [fiber]fibermat to Mat products.
    // DO NOT map [fiber]fiber (Raw) to Mat products.

    // Banana
    'bananamat': 'bananamatud',
    'bananafibermat': 'bananamatud',
    'bananafibermatud': 'bananamatud',
    'bananafibermatbd': 'bananamatbd',
    // Jute
    'jutemat': 'jutematud',
    'jutefibermat': 'jutematud',
    'jutefibermatud': 'jutematud',
    'jutefibermatbd': 'jutematbd',
    'jutefiberbd': 'jutematbd', // Explicit BD fiber image -> BD Mat
    // Sisal
    'sisalmat': 'sisalmatud',
    'sisalfibermat': 'sisalmatud',
    'sisalfibermatud': 'sisalmatud',
    'sisalfibermatbd': 'sisalmatbd',
    // Flax
    'flaxmat': 'flaxmatud',
    'flaxfibermat': 'flaxmatud',
    'flaxfibermatud': 'flaxmatud',
    'flaxfibermatbd': 'flaxmatbd',
    'flaxfabric': 'flaxmatud',
    // Kenaf
    'kenafmat': 'kenafmatud',
    'kenaffibermat': 'kenafmatud',
    'kenaffibermatud': 'kenafmatud',
    'kenaffibermatbd': 'kenafmatbd',
    // 'kenaffiber': 'kenafmatud', // REMOVED: Raw fiber should not map to Mat
    // Ramie
    'ramiemat': 'ramiematud',
    'ramiefibermat': 'ramiematud',
    'ramiefibermatud': 'ramiematud',
    'ramiefibermatbd': 'ramiematbd',
    // 'ramiefiber': 'ramiematud', // REMOVED
    // Bamboo
    'bamboomat': 'bamboomatud',
    'bamboofibermat': 'bamboomatud',
    'bamboofibermatud': 'bamboomatud',
    'bamboofibermatbd': 'bamboomatbd',
    // 'bamboofiber': 'bamboomatud', // REMOVED
    // Sunhemp
    'sunhempmat': 'sunhempmatud',
    'sunhempfibermat': 'sunhempmatud',
    'sunhempfibermatud': 'sunhempmatud',
    'sunhempfibermatbd': 'sunhempmatbd',
    'sunhempfiberbd': 'sunhempmatbd', // Specifically map "Sun Hemp Fiber BD" to Mat BD
    // 'sunhempfiber': 'sunhempmatud', // REMOVED
    // Pineapple
    'pineapplemat': 'pineapplematud',
    'pineapplefibermat': 'pineapplematud',
    'pineapplefibermatud': 'pineapplematud',
    'pineapplefibermatbd': 'pineapplematbd',
    'pineappleleaf': 'pineappleleaffiber',
    'pineapplefabric': 'pineapplematud',
    'pineapplefiber': 'pineappleleaffiber', // Alias for Raw variants (safe due to longest match)

    // Areca / Coir / Angora if needed?
    'arecafibermat': 'arecamatud', // If Areca Mat exists
    'coirfibermat': 'coirmatud', // If Coir Mat exists

    // --- Synthetic Aliases ---
    // Steel Fiber
    'steelfiberhooked': 'steelfiber',
    'steelfibercrimped': 'steelfiber',
    'steelfibermicro': 'steelfiber',
    'hookedend': 'steelfiber',
    'crimped': 'steelfiber',
    'microsteel': 'steelfiber',

    // Glass Fiber
    'glassfiberetype': 'glassfiber',
    'glassfiberartype': 'glassfiber',
    'glassfibers': 'glassfiber',
    'glassfiberstype': 'glassfiber',
    'glasspowder': 'glasspowder', // This is separate because name is just "Glass Powder" -> 'glasspowder'

    // Polypropylene
    'polypropylenefibermonofilament': 'polypropylenefiber',
    'monofilament': 'polypropylenefiber',
    'polypropylenefibermacrofilament': 'polypropylenefiber',
    'macro': 'polypropylenefiber',
    'macrofilament': 'polypropylenefiber',

    // Nylon
    'nylonfiber': 'nylonfiber6',
    'nylonfabric': 'nylonfiber6',

    // PVA
    'pvafiber': 'polyvinylalcoholfiber', // Key stripped of (PVA)

    // Carbon Fabric
    // Mapped to 'carbonfiberfabric' due to parens stripping
    'carbonfiberfabrictwill': 'carbonfiberfabric',
    'carbonfabrictwill': 'carbonfiberfabric',
    'carbonfiberfabricplain': 'carbonfiberfabric',
    'carbonfabricplain': 'carbonfiberfabric',
    'carbonfiberfabricud': 'carbonfiberfabricud',
    'carbonfiberfabricunidirectional': 'carbonfiberfabricud',
    'carbonfiberfabricunidirecitonal': 'carbonfiberfabricud',
    'carbonfiberfabricbd': 'carbonfiberfabricbd',

    // Carbon Yarn
    'carbonfiberyarn': 'carbonfiberyarn',
    'carbonyarn': 'carbonfiberyarn',

    // Basalt Fabric
    'basaltfiberfabrictwill': 'basaltfiberfabric',
    'basaltfiberfabricplain': 'basaltfiberfabric',
    'basaltfiberfabricud': 'basaltfiberfabricud',
    'basaltfiberfabricunidirectional': 'basaltfiberfabricud',
    'basaltfiberfabricbd': 'basaltfiberfabricbd',
    'basaltfiberfabricbidirectional': 'basaltfiberfabricbd',

    // Basalt Yarn
    'basaltfiberyarn': 'basaltfiberyarn',

    // Kevlar (Aramid) Fabric
    'kevlarfiberfabrictwill': 'kevlarfiberfabric',
    'kevlarfabrictwill': 'kevlarfiberfabric',
    'kevlarfiberfabricplain': 'kevlarfiberfabric',
    'kevlarfabricplain': 'kevlarfiberfabric',
    'kevlarfiberfabricud': 'kevlarfiberfabricud',
    'kevlarfabricud': 'kevlarfiberfabricud',
    'kevlarfabricunidirectional': 'kevlarfiberfabricud',
    'kevlarfiberfabricbd': 'kevlarfiberfabricbd',
    'kevlarfabricbidirectional': 'kevlarfiberfabricbd',

    // Kevlar Yarn
    'kevlarfiberyarn': 'aramidfiberyarn',
    'kevalrfiberyarn': 'aramidfiberyarn',

    // Glass Fabric
    'glassfiberfabrictwill': 'glassfiberfabric',
    'glassfibermatplain': 'glassfiberfabric',
    'glassfiberfabricplain': 'glassfiberfabric',
    'glassfibermatud': 'glassfiberfabricud',
    'glassfibermatunidirectional': 'glassfiberfabricud',
    'glassmatunidirectional': 'glassfiberfabricud',
    'glassfibermatbd': 'glassfiberfabricbd',

    // Glass Yarn
    'glassfiberyarn': 'glassfiberyarn',

    // UHMWPE
    'uhmwpefabrictwill': 'uhmwpefiberfabric',
    'uhmwpefabricplain': 'uhmwpefiberfabric',
    'uhmwpefabricunidirectional': 'uhmwpefiberfabricud',
    'uhmwpefabricbidirectional': 'uhmwpefiberfabricbd',
    'uhmwpefabric': 'uhmwpefiberfabric',

    // Typos
    'polyproplene': 'polypropylenefiber',
    'plastic': 'polypropylenefiber',
    'pva': 'polyvinylalcoholfiber',
    'uhmwpe': 'uhmwpefiber',
    'optical': 'opticalfiber',
    'sunhempstick': 'sunhempfiber',

    // Hybrid Carbon & Kevlar Specifics (Typos & Missing "Fiber")
    'hybriccarbonkevlarfabricwtype': 'hybridcarbonkevlarfiberfabricwtype',
    'hybridcarbomkevlarfabricttype': 'hybridcarbonkevlarfiberfabricttype',
    'hybridcarbonkevlarfabricwtype': 'hybridcarbonkevlarfiberfabricwtype',
    'hybridcarbonkevlarfabricttype': 'hybridcarbonkevlarfiberfabricttype',

    'nomex': 'nomexfiberfabric', // Broad alias - might fail if product key is nomexfiberfabricUD
    'nomexfiber': 'nomexfiberfabricud', // Default to UD
    'nomexfiberud': 'nomexfiberfabricud',
    'nomexfiberbd': 'nomexfiberfabricbd',
};

function mapImages() {
    console.log("Reading product data...");
    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

    console.log("Scanning public directory for images...");
    const allImages = getAllImages(PUBLIC_DIR);
    console.log(`Found ${allImages.length} images in total.`);

    const productMap = {};
    const normNames = [];

    productsData.products.forEach(p => {
        p.images = [];
        const cleanName = p.product_name.split('(')[0].trim();
        const normName = normalize(cleanName);

        if (!productMap[normName]) {
            productMap[normName] = [];
            normNames.push(normName);
        }
        productMap[normName].push(p);
    });

    // Sort normalized names by length descending
    normNames.sort((a, b) => b.length - a.length);

    let mappedImagesCount = 0;

    allImages.forEach(img => {
        const imgNorm = img.normalizedName;
        let candidates = []; // { target: string, matchLen: number }

        // 1. Exact/Prefix match with normalized names
        normNames.forEach(name => {
            if (imgNorm.startsWith(name)) {
                candidates.push({ target: name, matchLen: name.length });
            }
        });

        // 2. Alias match
        for (const [alias, target] of Object.entries(ALIASES)) {
            if (imgNorm.startsWith(alias)) {
                if (productMap[target]) {
                    candidates.push({ target: target, matchLen: alias.length });
                }
            }
        }

        // Sort by match length descending
        candidates.sort((a, b) => b.matchLen - a.matchLen);

        // 3. Fallback: Prefix stripping (raw, pure, natural)
        if (candidates.length === 0) {
            const prefixes = ['raw', 'pure', 'natural'];
            for (const prefix of prefixes) {
                if (imgNorm.startsWith(prefix)) {
                    const stripped = imgNorm.replace(prefix, '');
                    normNames.forEach(name => {
                        if (stripped.startsWith(name)) {
                            candidates.push({ target: name, matchLen: name.length });
                        }
                    });
                }
            }
            candidates.sort((a, b) => b.matchLen - a.matchLen);
        }

        let matches = candidates.map(c => c.target);
        matches = [...new Set(matches)]; // Unique

        // HANDLE UD/BD SPECIFIC LOGIC
        if (matches.length > 0) {
            const isBD = imgNorm.includes('bd') || imgNorm.includes('bi-directional') || imgNorm.includes('bidirectional');

            if (isBD) {
                // STRICT filtering for BD
                matches = matches.filter(m => m.endsWith('bd'));
            } else {
                // Default to Non-BD (UD)
                matches = matches.filter(m => !m.endsWith('bd'));
            }
        }

        if (matches.length > 0) {
            const bestMatch = matches[0]; // First is best (longest)
            if (productMap[bestMatch]) {
                productMap[bestMatch].forEach(p => {
                    const pNameLower = p.product_name.toLowerCase();
                    const imgLower = img.normalizedName;

                    // FILTER: Twill vs Plain
                    if (pNameLower.includes('(twill)') || pNameLower.includes('twill type')) {
                        if (!imgLower.includes('twill')) return;
                    }
                    if (pNameLower.includes('(plain)') || pNameLower.includes('plain type')) {
                        if (!imgLower.includes('plain')) return;
                    }

                    // FILTER: Hooked vs Crimped vs Micro (Steel)
                    if (pNameLower.includes('hooked') && !imgLower.includes('hooked')) return;
                    if (pNameLower.includes('crimped') && !imgLower.includes('crimped')) return;
                    // 'micro' check also for PP? Or just Steel?
                    // Steel Fiber (Micro) -> 'steelfiber'.
                    // PP Fiber (Micro) -> 'polypropylenefiber'.
                    // Be careful with geneic 'micro'.
                    if (pNameLower.includes('(micro)') && !imgLower.includes('micro')) return;


                    // FILTER: Glass Variants (E, AR, S)
                    if (pNameLower.includes('e-type') && (!imgLower.includes('etype') && !imgLower.includes('e-type'))) return;
                    if (pNameLower.includes('ar-type') && (!imgLower.includes('artype') && !imgLower.includes('ar-type'))) return;
                    if (pNameLower.includes('s-type') && (!imgLower.includes('stype') && !imgLower.includes('s-type'))) return;

                    // FILTER: PP Variants (Mono vs Macro)
                    if (pNameLower.includes('mono') && !imgLower.includes('mono')) return;
                    if (pNameLower.includes('macro') && !imgLower.includes('macro')) return;

                    // FILTER: Hybrid Types (T-Type vs W-Type)
                    if (pNameLower.includes('t-type') && !imgLower.includes('ttype')) return; // Normalized img has 'ttype'
                    if (pNameLower.includes('w-type') && !imgLower.includes('wtype')) return;

                    // Add image if passed filters
                    if (!p.images.includes(img.path)) {
                        p.images.push(img.path);
                    }
                });
                mappedImagesCount++;
            }
        }
    });

    console.log(`Mapped ${mappedImagesCount} images to products.`);

    let updatedCount = 0;
    let missingImages = [];

    productsData.products.forEach(product => {
        if (product.images.length > 0) {
            updatedCount++;
            product.images.sort();
        } else {
            product.images = ['/placeholder.svg'];
            missingImages.push(product.product_name);
        }
    });

    console.log(`Updated ${updatedCount} products with images.`);

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 4));
    console.log(`Saved updates to ${PRODUCTS_FILE}`);

    const missingListPath = path.join(__dirname, '../missing_products.txt');
    fs.writeFileSync(missingListPath, missingImages.join('\n'));
    console.log(`Missing products list saved to: ${missingListPath}`);
}

mapImages();
