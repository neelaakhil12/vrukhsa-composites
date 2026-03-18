const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Neelam/Desktop/ecom-experience/src/data/products_master.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const tests = [
    {
        "product_id": "VC-TS-001",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "Tensile test",
        "specifications": {
            "type": "Mechanical Test",
            "standards": "ASTM D3039 / ISO 527"
        },
        "applications": [
            "Material characterization",
            "Quality control",
            "Structural validation"
        ],
        "tags": [
            "test",
            "tensile",
            "mechanical"
        ],
        "images": [
            "/composite_making img/Composite making images/Testing Sample.JPG",
            "/composite_making img/Composite making images/Composite Testing.JPG"
        ]
    },
    {
        "product_id": "VC-TS-002",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "Compression test",
        "specifications": {
            "type": "Mechanical Test",
            "standards": "ASTM D695 / ISO 604"
        },
        "applications": [
            "Compressive strength analysis",
            "Core material testing",
            "Structural components"
        ],
        "tags": [
            "test",
            "compression",
            "mechanical"
        ],
        "images": [
            "/composite_making img/Composite making images/Testing Sample 2.jpg"
        ]
    },
    {
        "product_id": "VC-TS-003",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "Flexural test",
        "specifications": {
            "type": "3-Point / 4-Point Bending",
            "standards": "ASTM D790 / ISO 178"
        },
        "applications": [
            "Flexural modulus determination",
            "Bending strength analysis",
            "Panel testing"
        ],
        "tags": [
            "test",
            "flexural",
            "bending"
        ],
        "images": [
            "/composite_making img/Composite making images/Testing Sample 3.JPG"
        ]
    },
    {
        "product_id": "VC-TS-004",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "Impact test (IZOD)",
        "specifications": {
            "type": "Impact Strength",
            "method": "IZOD / Charpy"
        },
        "applications": [
            "Toughness testing",
            "Dynamic load analysis",
            "Failure analysis"
        ],
        "tags": [
            "test",
            "impact",
            "IZOD"
        ],
        "images": [
            "/composite_making img/Composite making images/Composite Testing 2.JPG"
        ]
    },
    {
        "product_id": "VC-TS-005",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "Water Absorption",
        "specifications": {
            "type": "Physical Test",
            "method": "Immersion"
        },
        "applications": [
            "Environmental durability",
            "Marine composites",
            "Moisture intake analysis"
        ],
        "tags": [
            "test",
            "water absorption",
            "durability"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-TS-006",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "XRD test",
        "specifications": {
            "full_name": "X-Ray Diffraction",
            "analysis": "Crystalline structure"
        },
        "applications": [
            "Phase identification",
            "Crystallinity analysis",
            "Material science"
        ],
        "tags": [
            "test",
            "XRD",
            "diffraction"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-TS-007",
        "category": "Composite Making",
        "subcategory": "Testing Services",
        "product_name": "SEM Test",
        "specifications": {
            "full_name": "Scanning Electron Microscopy",
            "magnification": "High resolution"
        },
        "applications": [
            "Surface morphology",
            "Fractography",
            "Microstructure analysis"
        ],
        "tags": [
            "test",
            "SEM",
            "microscopy"
        ],
        "images": [
            "/placeholder.svg"
        ]
    }
];

// Append to the end of products array
data.products.push(...tests);
data.total_products = data.products.length;
fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
console.log(`Inserted ${tests.length} testing products. Total products: ${data.total_products}`);
