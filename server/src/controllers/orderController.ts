import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const userEmail = (req as any).user.email;
        const { shippingAddress, paymentMethod = 'COD' } = req.body;

        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ message: 'Cart is empty' });
            return;
        }

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

        const totalAmount = orderItems.reduce(
            (sum: number, item: any) => sum + (item.price * item.quantity),
            0
        );

        // Calculate expected delivery: 4-5 business days from now
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);

        const order = await Order.create({
            userId,
            items: orderItems,
            shippingAddress: {
                ...shippingAddress,
                email: userEmail || shippingAddress.email || ''
            },
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'placed',
            totalAmount,
            expectedDeliveryDate,
            deliveryStages: [
                { status: 'placed', label: 'Order Placed', isCompleted: true, completedAt: new Date() },
                { status: 'confirmed', label: 'Order Confirmed', isCompleted: false },
                { status: 'processing', label: 'Processing & Packing', isCompleted: false },
                { status: 'shipped', label: 'Shipped', isCompleted: false },
                { status: 'out_for_delivery', label: 'Out for Delivery', isCompleted: false },
                { status: 'delivered', label: 'Delivered', isCompleted: false },
            ]
        });

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

// @desc    Get order by ID (for user or admin)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const reqUser = (req as any).user;
        let order;

        if (reqUser.role === 'admin') {
            order = await Order.findById(req.params.id).populate('userId', 'name email');
        } else {
            order = await Order.findOne({ _id: req.params.id, userId: reqUser._id });
        }

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

        if (['shipped', 'delivered'].includes(order.orderStatus)) {
            res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
            return;
        }

        order.orderStatus = 'cancelled';
        const cancelledStage = order.deliveryStages.find((s: any) => s.status === 'cancelled');
        if (!cancelledStage) {
            order.deliveryStages.push({ status: 'cancelled', label: 'Cancelled', isCompleted: true, completedAt: new Date() } as any);
        }
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
            .populate('userId', 'name email phone')
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

        order.orderStatus = orderStatus as any;
        // Auto-mark delivery stage as completed
        const stage = order.deliveryStages.find((s: any) => s.status === orderStatus);
        if (stage) {
            (stage as any).isCompleted = true;
            (stage as any).completedAt = (stage as any).completedAt || new Date();
        }
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

        order.paymentStatus = paymentStatus as any;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update order tracking info (Admin only)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = async (req: Request, res: Response) => {
    try {
        const { trackingNumber, trackingLink, trackingPlatform, expectedDeliveryDate, internalNote, deliveryStages } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
        if (trackingLink !== undefined) order.trackingLink = trackingLink;
        if (trackingPlatform !== undefined) order.trackingPlatform = trackingPlatform;
        if (expectedDeliveryDate !== undefined) order.expectedDeliveryDate = new Date(expectedDeliveryDate);
        if (internalNote !== undefined) order.internalNote = internalNote;
        if (deliveryStages !== undefined) order.deliveryStages = deliveryStages;

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
