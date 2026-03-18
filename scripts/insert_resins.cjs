const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Neelam/Desktop/ecom-experience/src/data/products_master.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const resins = [
    {
        "product_id": "VC-RS-001",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "Thermoplastic resin",
        "specifications": {
            "form": "Liquid / Pellets",
            "application": "Composite manufacturing"
        },
        "applications": [
            "Automotive",
            "Aerospace",
            "Industrial manufacturing"
        ],
        "tags": [
            "resin",
            "thermoplastic",
            "composite"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-RS-002",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "Phenolic resin / Vinyl ester resin",
        "specifications": {
            "type": "Thermosetting",
            "application": "High temperature resistance"
        },
        "applications": [
            "Chemical tanks",
            "Pipes",
            "Corrosion resistant parts"
        ],
        "tags": [
            "phenolic",
            "vinyl ester",
            "resin"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-RS-003",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "Polyester resin",
        "specifications": {
            "type": "Unsaturated polyester",
            "application": "General purpose laminating"
        },
        "applications": [
            "Fiberglass boat building",
            "Automotive body parts",
            "Roofing"
        ],
        "tags": [
            "polyester",
            "resin",
            "fiberglass"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-RS-004",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "Epoxy resin (LY556, GY250 & HY951)",
        "specifications": {
            "grades": "LY556, GY250, HY951",
            "application": "High-performance composites"
        },
        "applications": [
            "Structural applications",
            "Electrical insulation",
            "Aerospace"
        ],
        "tags": [
            "epoxy",
            "resin",
            "LY556",
            "GY250",
            "HY951"
        ],
        "images": [
            "/synthetic fiber/Synthetic Fiber Images/SYNTHETIC  Fibers - JPG/Epoxy Resin.jpg"
        ]
    },
    {
        "product_id": "VC-RS-005",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "GP resin / catalyst",
        "specifications": {
            "type": "General Purpose",
            "system": "Resin + Catalyst"
        },
        "applications": [
            "Hand lay-up",
            "Spray-up",
            "General repairs"
        ],
        "tags": [
            "GP resin",
            "catalyst",
            "resin"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-RS-006",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "Bio resin (PLA, Neem Shell, CNSL)",
        "specifications": {
            "sources": "PLA, Neem Shell, CNSL",
            "type": "Bio-based"
        },
        "applications": [
            "Sustainable manufacturing",
            "Eco-friendly composites",
            "Bio-polymers"
        ],
        "tags": [
            "bio resin",
            "PLA",
            "Neem Shell",
            "CNSL",
            "eco-friendly"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-RS-007",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "Huntsman resin",
        "specifications": {
            "brand": "Huntsman",
            "application": "Specialty resins"
        },
        "applications": [
            "Industrial applications",
            "Advanced materials",
            "Coatings"
        ],
        "tags": [
            "huntsman",
            "resin",
            "industrial"
        ],
        "images": [
            "/placeholder.svg"
        ]
    },
    {
        "product_id": "VC-RS-008",
        "category": "Synthetic Fibers",
        "subcategory": "Resins",
        "product_name": "L12/K6 hardener",
        "specifications": {
            "type": "Hardener",
            "compatibility": "Epoxy systems"
        },
        "applications": [
            "Curing agent",
            "Epoxy binding",
            "Industrial use"
        ],
        "tags": [
            "hardener",
            "L12",
            "K6",
            "curing agent"
        ],
        "images": [
            "/placeholder.svg"
        ]
    }
];

// Find index of VC-CH-P-021
const index = data.products.findIndex(p => p.product_id === 'VC-CH-P-021');
if (index !== -1) {
    data.products.splice(index + 1, 0, ...resins);
    data.total_products = data.products.length;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Inserted ${resins.length} resins products. Total products: ${data.total_products}`);
} else {
    console.error('Could not find product VC-CH-P-021');
    process.exit(1);
}
