import { Request, Response } from 'express';
import pool from '../lib/mysql';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const [rows] = await pool.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        let cart = (rows as any[])[0];

        if (!cart) {
            await pool.query(
                'INSERT INTO Cart (userId, items, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
                [userId, JSON.stringify([]), new Date(), new Date()]
            );
            return res.json({ userId, items: [] });
        }

        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        res.json({ ...cart, items });
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
        const [products] = await pool.query('SELECT * FROM Product WHERE id = ?', [productId]);
        if ((products as any[]).length === 0) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        const [carts] = await pool.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        let cart = (carts as any[])[0];

        if (!cart) {
            await pool.query(
                'INSERT INTO Cart (userId, items, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
                [userId, JSON.stringify([]), new Date(), new Date()]
            );
            const [newCarts] = await pool.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
            cart = (newCarts as any[])[0];
        }

        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        const existingItemIndex = items.findIndex(
            (item: any) => item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += quantity;
        } else {
            items.push({ productId, quantity, variant });
        }

        await pool.query(
            'UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?',
            [JSON.stringify(items), new Date(), userId]
        );

        res.json({ ...cart, items });
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

        const [carts] = await pool.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        const cart = (carts as any[])[0];
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        const itemIndex = items.findIndex(
            (item: any) => item.productId === productId && (variant ? JSON.stringify(item.variant) === JSON.stringify(variant) : true)
        );

        if (itemIndex === -1) {
            res.status(404).json({ message: 'Item not in cart' });
            return;
        }

        items[itemIndex].quantity = quantity;

        await pool.query(
            'UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?',
            [JSON.stringify(items), new Date(), userId]
        );

        res.json({ ...cart, items });
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
        const { variant } = req.query;

        const [carts] = await pool.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        const cart = (carts as any[])[0];
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        let items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        items = items.filter(
            (item: any) => !(item.productId === productId && (variant ? JSON.stringify(item.variant) === String(variant) : true))
        );

        await pool.query(
            'UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?',
            [JSON.stringify(items), new Date(), userId]
        );

        res.json({ ...cart, items });
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

        await pool.query(
            'UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?',
            [JSON.stringify([]), new Date(), userId]
        );

        res.json({ message: 'Cart cleared', items: [] });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
