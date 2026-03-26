async function test() {
    console.log("Fetching /api/debug-db...");
    try {
        const res1 = await fetch('https://vrukshacomposites.com/api/debug-db');
        const text1 = await res1.text();
        console.log("DEBUG-DB:", text1);
    } catch (e) {
        console.error("DEBUG-DB Failed:", e.message);
    }

    console.log("\\nFetching /api/products...");
    try {
        const res2 = await fetch('https://vrukshacomposites.com/api/products');
        const text2 = await res2.text();
        console.log("PRODUCTS:", text2);
        console.log("Status:", res2.status);
    } catch (e) {
        console.error("PRODUCTS Failed:", e.message);
    }
}
test();
