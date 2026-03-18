import express from 'express';
import { ProductController } from '../controllers/productController';
import { ProductService } from '../services/ProductService';
import { MongoProductRepository } from '../repositories/MongoProductRepository';
import { JsonProductRepository } from '../repositories/JsonProductRepository';

const router = express.Router();

// Dependency Injection
const isCloudMode = process.env.DATA_MODE === 'cloud';
const repository = isCloudMode ? new MongoProductRepository() : new JsonProductRepository();
const productService = new ProductService(repository);
const productController = new ProductController(productService);

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

export const productRouter = router;
