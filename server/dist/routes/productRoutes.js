"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const ProductService_1 = require("../services/ProductService");
const MySQLProductRepository_1 = require("../repositories/MySQLProductRepository");
const router = express_1.default.Router();
// Always use MySQL repository
const repository = new MySQLProductRepository_1.MySQLProductRepository();
const productService = new ProductService_1.ProductService(repository);
const productController = new productController_1.ProductController(productService);
// GET /api/products - Get all products
router.get('/', productController.getAllProducts);
// GET /api/products/:id - Get single product
router.get('/:id', productController.getProductById);
// POST /api/products - Create new product (Admin Only - simplified for now)
router.post('/', productController.createProduct);
// PATCH /api/products/:id - Update product
router.patch('/:id', productController.updateProduct);
// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', productController.deleteProduct);
// POST /api/products/:id/restore - Restore deleted product
router.post('/:id/restore', productController.restoreProduct);
exports.productRouter = router;
