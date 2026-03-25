import { Request, Response } from 'express';
import prisma from '../lib/prisma';

const DEFAULT_DELIVERY_STAGES = [
    { status: 'placed', label: 'Order Placed', isCompleted: false },
    { status: 'confirmed', label: 'Order Confirmed', isCompleted: false },
    { status: 'processing', label: 'Processing & Packing', isCompleted: false },
    { status: 'shipped', label: 'Shipped', isCompleted: false },
    { status: 'out_for_delivery', label: 'Out for Delivery', isCompleted: false },
    { status: 'delivered', label: 'Delivered', isCompleted: false },
];

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userEmail = (req as any).user.email;
        const { shippingAddress, paymentMethod = 'COD', items, totalAmount } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ message: 'No items in order' });
            return;
        }

        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);

        const stages = DEFAULT_DELIVERY_STAGES.map(s => ({
            ...s,
            isCompleted: s.status === 'placed',
            completedAt: s.status === 'placed' ? new Date().toISOString() : undefined,
        }));

        const orderData: any = {
            userId: parseInt(String(userId)),
            items,
            totalAmount: parseFloat(String(totalAmount)) || 0,
            shippingAddress: { ...shippingAddress, email: userEmail || shippingAddress?.email || '' },
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'placed',
            deliveryStages: stages,
            expectedDeliveryDate,
        };

        const order = await (prisma.order.create as any)({ data: orderData });
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
        const userId = (req as any).user.id;
        const orders = await prisma.order.findMany({
            where: { userId: parseInt(String(userId)) },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
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
        const orderId = String(req.params.id);
        const reqUser = (req as any).user;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: { select: { name: true, email: true } } }
        });

        if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
        if (reqUser.role !== 'admin' && (order as any).userId !== parseInt(String(reqUser.id))) {
            res.status(403).json({ message: 'Not authorized' }); return;
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
        const orderId = String(req.params.id);
        const userId = (req as any).user.id;
        const order = await prisma.order.findUnique({ where: { id: orderId } });

        if (!order || (order as any).userId !== parseInt(String(userId))) {
            res.status(404).json({ message: 'Order not found' }); return;
        }
        if (['shipped', 'delivered'].includes(order.orderStatus)) {
            res.status(400).json({ message: 'Cannot cancel shipped/delivered orders' }); return;
        }

        const updated = await prisma.order.update({ where: { id: orderId }, data: { orderStatus: 'cancelled' } });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const { orderStatus } = req.body;
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

        const stages = (((order as any).deliveryStages as any[]) || DEFAULT_DELIVERY_STAGES).map((s: any) =>
            s.status === orderStatus ? { ...s, isCompleted: true, completedAt: s.completedAt || new Date().toISOString() } : s
        );

        const updated = await (prisma.order.update as any)({ where: { id: orderId }, data: { orderStatus, deliveryStages: stages } });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const { paymentStatus } = req.body;
        const updated = await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update tracking info (Admin)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const { trackingNumber, trackingLink, trackingPlatform, expectedDeliveryDate, internalNote, deliveryStages } = req.body;

        const updateData: any = {};
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (trackingLink !== undefined) updateData.trackingLink = trackingLink;
        if (trackingPlatform !== undefined) updateData.trackingPlatform = trackingPlatform;
        if (expectedDeliveryDate) updateData.expectedDeliveryDate = new Date(expectedDeliveryDate);
        if (internalNote !== undefined) updateData.internalNote = internalNote;
        if (deliveryStages !== undefined) updateData.deliveryStages = deliveryStages;

        const updated = await (prisma.order.update as any)({ where: { id: orderId }, data: updateData });
        res.json(updated);
    } catch (error) {
        console.error('Tracking update error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
