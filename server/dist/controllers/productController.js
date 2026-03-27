"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
class ProductController {
    constructor(productService) {
        this.productService = productService;
        this.getAllProducts = async (req, res) => {
            try {
                const filters = req.query;
                const products = await this.productService.getAllProducts(filters);
                res.json(products);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching products', error: error.message, stack: error.stack });
            }
        };
        this.getProductById = async (req, res) => {
            try {
                const product = await this.productService.getProductById(req.params.id);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }
                res.json(product);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching product', error });
            }
        };
        this.createProduct = async (req, res) => {
            try {
                const product = await this.productService.createProduct(req.body);
                res.status(201).json(product);
            }
            catch (error) {
                res.status(500).json({ message: 'Error creating product', error });
            }
        };
        this.updateProduct = async (req, res) => {
            try {
                const product = await this.productService.updateProduct(req.params.id, req.body);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }
                res.json(product);
            }
            catch (error) {
                res.status(500).json({ message: 'Error updating product', error });
            }
        };
        this.deleteProduct = async (req, res) => {
            try {
                const success = await this.productService.deleteProduct(req.params.id);
                if (!success) {
                    return res.status(404).json({ message: 'Product not found' });
                }
                res.json({ message: 'Product deleted effectively' });
            }
            catch (error) {
                res.status(500).json({ message: 'Error deleting product', error });
            }
        };
        this.restoreProduct = async (req, res) => {
            try {
                const success = await this.productService.restoreProduct(req.params.id);
                if (!success) {
                    return res.status(404).json({ message: 'Product not found' });
                }
                res.json({ message: 'Product restored successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Error restoring product', error });
            }
        };
    }
}
exports.ProductController = ProductController;
