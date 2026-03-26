"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CARTS_JSON_PATH = path_1.default.join(__dirname, '../../../src/data/carts.json');
const readCarts = async () => {
    try {
        const data = await fs_1.default.promises.readFile(CARTS_JSON_PATH, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
};
const writeCarts = async (carts) => {
    await fs_1.default.promises.writeFile(CARTS_JSON_PATH, JSON.stringify(carts, null, 4));
};
const isCloudMode = () => mongoose_1.default.connection.readyState === 1;
// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        if (isCloudMode()) {
            let cart = await Cart_1.default.findOne({ userId }).populate('items.productId');
            if (!cart) {
                cart = await Cart_1.default.create({ userId, items: [] });
            }
            res.json(cart);
        }
        else {
            const carts = await readCarts();
            let cart = carts.find((c) => c.userId === userId);
            if (!cart) {
                cart = { userId, items: [] };
                carts.push(cart);
                await writeCarts(carts);
            }
            res.json(cart);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getCart = getCart;
// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1, variant } = req.body;
        if (isCloudMode()) {
            const product = await Product_1.default.findById(productId);
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            let cart = await Cart_1.default.findOne({ userId });
            if (!cart) {
                cart = await Cart_1.default.create({ userId, items: [] });
            }
            const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            }
            else {
                cart.items.push({ productId, quantity, variant });
            }
            await cart.save();
            const populatedCart = await Cart_1.default.findById(cart._id).populate('items.productId');
            res.json(populatedCart);
        }
        else {
            const carts = await readCarts();
            let cart = carts.find((c) => c.userId === userId);
            if (!cart) {
                cart = { userId, items: [] };
                carts.push(cart);
            }
            const existingItemIndex = cart.items.findIndex((item) => (item.productId.toString() === productId) || (item.productId === productId));
            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            }
            else {
                cart.items.push({ productId, quantity, variant });
            }
            await writeCarts(carts);
            res.json(cart);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.addToCart = addToCart;
// @desc    Update item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;
        if (quantity < 1) {
            res.status(400).json({ message: 'Quantity must be at least 1' });
            return;
        }
        if (isCloudMode()) {
            const cart = await Cart_1.default.findOne({ userId });
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (itemIndex === -1) {
                res.status(404).json({ message: 'Item not in cart' });
                return;
            }
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            const populatedCart = await Cart_1.default.findById(cart._id).populate('items.productId');
            res.json(populatedCart);
        }
        else {
            const carts = await readCarts();
            let cart = carts.find((c) => c.userId === userId);
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }
            const itemIndex = cart.items.findIndex((item) => (item.productId.toString() === productId) || (item.productId === productId));
            if (itemIndex === -1) {
                res.status(404).json({ message: 'Item not in cart' });
                return;
            }
            cart.items[itemIndex].quantity = quantity;
            await writeCarts(carts);
            res.json(cart);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.updateCartItem = updateCartItem;
// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        if (isCloudMode()) {
            const cart = await Cart_1.default.findOne({ userId });
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }
            cart.items = cart.items.filter(item => item.productId.toString() !== productId);
            await cart.save();
            const populatedCart = await Cart_1.default.findById(cart._id).populate('items.productId');
            res.json(populatedCart);
        }
        else {
            const carts = await readCarts();
            let cart = carts.find((c) => c.userId === userId);
            if (!cart) {
                res.status(404).json({ message: 'Cart not found' });
                return;
            }
            cart.items = cart.items.filter((item) => (item.productId.toString() !== productId) && (item.productId !== productId));
            await writeCarts(carts);
            res.json(cart);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.removeFromCart = removeFromCart;
// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        if (isCloudMode()) {
            const cart = await Cart_1.default.findOne({ userId });
            if (cart) {
                cart.items = [];
                await cart.save();
            }
            res.json({ message: 'Cart cleared', items: [] });
        }
        else {
            const carts = await readCarts();
            const cartIndex = carts.findIndex((c) => c.userId === userId);
            if (cartIndex !== -1) {
                carts[cartIndex].items = [];
                await writeCarts(carts);
            }
            res.json({ message: 'Cart cleared', items: [] });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.clearCart = clearCart;
