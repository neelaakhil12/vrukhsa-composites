import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const CARTS_JSON_PATH = path.join(__dirname, '../../../src/data/carts.json');

const readCarts = async () => {
    try {
        const data = await fs.promises.readFile(CARTS_JSON_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeCarts = async (carts: any[]) => {
    await fs.promises.writeFile(CARTS_JSON_PATH, JSON.stringify(carts, null, 4));
};

const isCloudMode = () => mongoose.connection.readyState === 1;

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        if (isCloudMode()) {
            let cart = await Cart.findOne({ userId }).populate('items.productId');
            if (!cart) {
                cart = await Cart.create({ userId, items: [] });
            }
            res.json(cart);
        } else {
            const carts = await readCarts();
            let cart = carts.find((c: any) => c.userId === userId);
            if (!cart) {
                cart = { userId, items: [] };
                carts.push(cart);
                await writeCarts(carts);
            }
            res.json(cart);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { productId, quantity = 1, variant } = req.body;

        if (isCloudMode()) {
            const product = await Product.findById(productId);
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }

            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = await Cart.create({ userId, items: [] });
            }

            const existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity, variant });
            }

            await cart.save();
            const populatedCart = await Cart.findById(cart._id).populate('items.productId');
            res.json(populatedCart);
        } else {
            const carts = await readCarts();
            let cart = carts.find((c: any) => c.userId === userId);
            if (!cart) {
                cart = { userId, items: [] };
                carts.push(cart);
            }

            const existingItemIndex = cart.items.findIndex(
                (item: any) => (item.productId.toString() === productId) || (item.productId === productId)
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity, variant });
            }

            await writeCarts(carts);
            res.json(cart);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            res.status(400).json({ message: 'Quantity must be at least 1' });
            return;
        }

        if (isCloudMode()) {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }

            const itemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (itemIndex === -1) {
                res.status(404).json({ message: 'Item not in cart' });
                return;
            }

            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            const populatedCart = await Cart.findById(cart._id).populate('items.productId');
            res.json(populatedCart);
        } else {
            const carts = await readCarts();
            let cart = carts.find((c: any) => c.userId === userId);
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }

            const itemIndex = cart.items.findIndex(
                (item: any) => (item.productId.toString() === productId) || (item.productId === productId)
            );

            if (itemIndex === -1) {
                res.status(404).json({ message: 'Item not in cart' });
                return;
            }

            cart.items[itemIndex].quantity = quantity;
            await writeCarts(carts);
            res.json(cart);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { productId } = req.params;

        if (isCloudMode()) {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }

            cart.items = cart.items.filter(
                item => item.productId.toString() !== productId
            );

            await cart.save();
            const populatedCart = await Cart.findById(cart._id).populate('items.productId');
            res.json(populatedCart);
        } else {
            const carts = await readCarts();
            let cart = carts.find((c: any) => c.userId === userId);
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }

            cart.items = cart.items.filter(
                (item: any) => (item.productId.toString() !== productId) && (item.productId !== productId)
            );

            await writeCarts(carts);
            res.json(cart);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        if (isCloudMode()) {
            const cart = await Cart.findOne({ userId });
            if (cart) {
                cart.items = [];
                await cart.save();
            }
            res.json({ message: 'Cart cleared', items: [] });
        } else {
            const carts = await readCarts();
            const cartIndex = carts.findIndex((c: any) => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex].items = [];
                await writeCarts(carts);
            }
            res.json({ message: 'Cart cleared', items: [] });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
