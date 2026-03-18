import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { shippingAddress, paymentMethod = 'COD' } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ message: 'Cart is empty' });
            return;
        }

        // Transform cart items to order items
        const orderItems = cart.items.map((item: any) => {
            const product = item.productId;
            return {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images?.[0] || ''
            };
        });

        // Calculate total
        const totalAmount = orderItems.reduce(
            (sum: number, item: any) => sum + (item.price * item.quantity),
            0
        );

        // Create order
        const order = await Order.create({
            userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
            orderStatus: 'placed',
            totalAmount
        });

        // Clear cart after order
        cart.items = [];
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const order = await Order.findOne({ _id: req.params.id, userId });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const order = await Order.findOne({ _id: req.params.id, userId });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Can only cancel if not shipped yet
        if (['shipped', 'delivered'].includes(order.orderStatus)) {
            res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
            return;
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        order.orderStatus = orderStatus;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update payment status (Admin only)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
