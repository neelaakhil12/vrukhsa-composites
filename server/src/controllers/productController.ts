import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
    constructor(private productService: ProductService) { }

    getAllProducts = async (req: Request, res: Response) => {
        try {
            const filters = req.query;
            const products = await this.productService.getAllProducts(filters);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    };

    getProductById = async (req: Request, res: Response) => {
        try {
            const product = await this.productService.getProductById(req.params.id as string);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching product', error });
        }
    };

    createProduct = async (req: Request, res: Response) => {
        try {
            const product = await this.productService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error creating product', error });
        }
    };

    updateProduct = async (req: Request, res: Response) => {
        try {
            const product = await this.productService.updateProduct(req.params.id as string, req.body);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error updating product', error });
        }
    };

    deleteProduct = async (req: Request, res: Response) => {
        try {
            const success = await this.productService.deleteProduct(req.params.id as string);
            if (!success) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product deleted effectively' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting product', error });
        }
    };

    restoreProduct = async (req: Request, res: Response) => {
        try {
            const success = await this.productService.restoreProduct(req.params.id as string);
            if (!success) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product restored successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error restoring product', error });
        }
    };
}
