
const normalize = (str) => {
    return str.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/aluminium/g, 'aluminum');
}

const productName = "Banana Fiber Mat (UDorBD)";
const cleanName = productName.split('(')[0].trim();
const normName = normalize(cleanName);

console.log(`Product: "${productName}"`);
console.log(`Clean: "${cleanName}"`);
console.log(`Norm: "${normName}"`);

const path = require('path');
const imgName = "Banana Fiber Mat 5.JPG";
const imgNorm = normalize(path.parse(imgName).name);

console.log(`Image: "${imgName}"`);
console.log(`ImgNorm: "${imgNorm}"`);

console.log(`Starts with? ${imgNorm.startsWith(normName)}`);

const products = ["Banana Fiber", "Banana Fiber Mat (UDorBD)"];
const normNames = products.map(p => normalize(p.split('(')[0].trim()));
normNames.sort((a, b) => b.length - a.length); // Longest first

console.log("NormNames:", normNames);

const potentialMatches = normNames.filter(name => imgNorm.startsWith(name));
console.log("Matches:", potentialMatches);
