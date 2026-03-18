
const fs = require('fs');

const fibers = [
    'Banana', 'Jute', 'Sisal', 'Flax', 'Kenaf',
    'Ramie', 'Bamboo', 'Sunhemp', 'Pineapple',
    'Angora', 'Coir', 'Areca'
];

let aliases = {};
fibers.forEach(f => {
    const key = `${f.toLowerCase()}mat`;
    const target = `${f.toLowerCase()}matud`;
    aliases[key] = target;
    aliases[`${f.toLowerCase()}fabric`] = target;
    aliases[`${f.toLowerCase()}fiber`] = target;// Also map generic fiber images to Mat UD if they match nothing else? 
    // Wait, user said "images mentioning only fiber name with MAT ... then it need to be considered UD"
    // What if image is just "Banana Fiber.jpg"? Should it go to "Banana Fiber" (Raw) or "Banana Mat UD"?
    // "Banana Fiber" product exists (Raw). So "Banana Fiber.jpg" should go to Raw.
    // "Banana Mat.jpg" -> "Banana Mat UD".
    // So distinct aliases for 'mat' are needed.
});

console.log("const MAT_ALIASES = " + JSON.stringify(aliases, null, 4) + ";");
