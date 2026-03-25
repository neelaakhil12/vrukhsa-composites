import express from 'express';
import { ProductController } from '../controllers/productController';
import { ProductService } from '../services/ProductService';
import { PrismaProductRepository } from '../repositories/PrismaProductRepository';

const router = express.Router();

// Always use Prisma (MySQL) repository
const repository = new PrismaProductRepository();
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
