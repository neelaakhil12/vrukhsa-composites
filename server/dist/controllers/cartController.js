"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const mysql_1 = __importDefault(require("../lib/mysql"));
// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await mysql_1.default.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        let cart = rows[0];
        if (!cart) {
            await mysql_1.default.query('INSERT INTO Cart (userId, items, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [userId, JSON.stringify([]), new Date(), new Date()]);
            return res.json({ userId, items: [] });
        }
        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        res.json({ ...cart, items });
    }
    catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getCart = getCart;
// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1, variant } = req.body;
        // Verify product exists
        const [products] = await mysql_1.default.query('SELECT * FROM Product WHERE id = ?', [productId]);
        if (products.length === 0) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const [carts] = await mysql_1.default.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        let cart = carts[0];
        if (!cart) {
            await mysql_1.default.query('INSERT INTO Cart (userId, items, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [userId, JSON.stringify([]), new Date(), new Date()]);
            const [newCarts] = await mysql_1.default.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
            cart = newCarts[0];
        }
        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        const existingItemIndex = items.findIndex((item) => item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant));
        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += quantity;
        }
        else {
            items.push({ productId, quantity, variant });
        }
        await mysql_1.default.query('UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?', [JSON.stringify(items), new Date(), userId]);
        res.json({ ...cart, items });
    }
    catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.addToCart = addToCart;
// @desc    Update item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity, variant } = req.body;
        if (quantity < 1) {
            res.status(400).json({ message: 'Quantity must be at least 1' });
            return;
        }
        const [carts] = await mysql_1.default.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        const cart = carts[0];
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }
        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        const itemIndex = items.findIndex((item) => item.productId === productId && (variant ? JSON.stringify(item.variant) === JSON.stringify(variant) : true));
        if (itemIndex === -1) {
            res.status(404).json({ message: 'Item not in cart' });
            return;
        }
        items[itemIndex].quantity = quantity;
        await mysql_1.default.query('UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?', [JSON.stringify(items), new Date(), userId]);
        res.json({ ...cart, items });
    }
    catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.updateCartItem = updateCartItem;
// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { variant } = req.query;
        const [carts] = await mysql_1.default.query('SELECT * FROM Cart WHERE userId = ?', [userId]);
        const cart = carts[0];
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }
        let items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        items = items.filter((item) => !(item.productId === productId && (variant ? JSON.stringify(item.variant) === String(variant) : true)));
        await mysql_1.default.query('UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?', [JSON.stringify(items), new Date(), userId]);
        res.json({ ...cart, items });
    }
    catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.removeFromCart = removeFromCart;
// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await mysql_1.default.query('UPDATE Cart SET items = ?, updatedAt = ? WHERE userId = ?', [JSON.stringify([]), new Date(), userId]);
        res.json({ message: 'Cart cleared', items: [] });
    }
    catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.clearCart = clearCart;
