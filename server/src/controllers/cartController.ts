import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId, items: [] }
            });
        }

        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId, quantity = 1, variant } = req.body;

        // Verify product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId, items: [] } });
        }

        const items = (cart.items as any[]) || [];
        const existingItemIndex = items.findIndex(
            item => item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += quantity;
        } else {
            items.push({ productId, quantity, variant });
        }

        const updatedCart = await prisma.cart.update({
            where: { userId },
            data: { items: items as any }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId } = req.params;
        const { quantity, variant } = req.body;

        if (quantity < 1) {
            res.status(400).json({ message: 'Quantity must be at least 1' });
            return;
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        const items = (cart.items as any[]) || [];
        const itemIndex = items.findIndex(
            item => item.productId === productId && (variant ? JSON.stringify(item.variant) === JSON.stringify(variant) : true)
        );

        if (itemIndex === -1) {
            res.status(404).json({ message: 'Item not in cart' });
            return;
        }

        items[itemIndex].quantity = quantity;

        const updatedCart = await prisma.cart.update({
            where: { userId },
            data: { items: items as any }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { productId } = req.params;
        const { variant } = req.query; // Optional variant filtering

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        let items = (cart.items as any[]) || [];
        items = items.filter(
            item => !(item.productId === productId && (variant ? JSON.stringify(item.variant) === String(variant) : true))
        );

        const updatedCart = await prisma.cart.update({
            where: { userId },
            data: { items: items as any }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const updatedCart = await prisma.cart.update({
            where: { userId },
            data: { items: [] }
        });

        res.json({ message: 'Cart cleared', items: [] });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
