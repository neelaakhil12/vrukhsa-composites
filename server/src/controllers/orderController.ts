import { Request, Response } from 'express';
import pool from '../lib/mysql';

const DEFAULT_DELIVERY_STAGES = [
    { status: 'placed', label: 'Order Placed', isCompleted: false },
    { status: 'confirmed', label: 'Order Confirmed', isCompleted: false },
    { status: 'processing', label: 'Processing & Packing', isCompleted: false },
    { status: 'shipped', label: 'Shipped', isCompleted: false },
    { status: 'out_for_delivery', label: 'Out for Delivery', isCompleted: false },
    { status: 'delivered', label: 'Delivered', isCompleted: false },
];

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

        const [result] = await pool.query(
            'INSERT INTO Order (userId, items, totalAmount, shippingAddress, paymentMethod, paymentStatus, orderStatus, deliveryStages, expectedDeliveryDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                parseInt(String(userId)),
                JSON.stringify(items),
                parseFloat(String(totalAmount)) || 0,
                JSON.stringify({ ...shippingAddress, email: userEmail || shippingAddress?.email || '' }),
                paymentMethod,
                'pending',
                'placed',
                JSON.stringify(stages),
                expectedDeliveryDate,
                new Date(),
                new Date()
            ]
        );

        const orderId = (result as any).insertId;
        const [rows] = await pool.query('SELECT * FROM Order WHERE id = ?', [orderId]);
        res.status(201).json(mapRowToOrder((rows as any[])[0]));
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const [rows] = await pool.query(
            'SELECT o.*, u.name as userName, u.email as userEmail FROM Order o JOIN User u ON o.userId = u.id WHERE o.userId = ? ORDER BY o.createdAt DESC',
            [parseInt(String(userId))]
        );
        res.json((rows as any[]).map(mapRowToOrder));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const reqUser = (req as any).user;
        const [rows] = await pool.query(
            'SELECT o.*, u.name as userName, u.email as userEmail FROM Order o JOIN User u ON o.userId = u.id WHERE o.id = ?',
            [orderId]
        );
        const order = (rows as any[])[0];

        if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
        if (reqUser.role !== 'admin' && order.userId !== parseInt(String(reqUser.id))) {
            res.status(403).json({ message: 'Not authorized' }); return;
        }
        res.json(mapRowToOrder(order));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const userId = (req as any).user.id;
        const [rows] = await pool.query('SELECT * FROM Order WHERE id = ?', [orderId]);
        const order = (rows as any[])[0];

        if (!order || order.userId !== parseInt(String(userId))) {
            res.status(404).json({ message: 'Order not found' }); return;
        }
        if (['shipped', 'delivered'].includes(order.orderStatus)) {
            res.status(400).json({ message: 'Cannot cancel shipped/delivered orders' }); return;
        }

        await pool.query('UPDATE Order SET orderStatus = ? WHERE id = ?', ['cancelled', orderId]);
        res.json({ ...order, orderStatus: 'cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT o.*, u.name as userName, u.email as userEmail FROM Order o JOIN User u ON o.userId = u.id ORDER BY o.createdAt DESC'
        );
        res.json((rows as any[]).map(mapRowToOrder));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const { orderStatus } = req.body;
        const [rows] = await pool.query('SELECT * FROM Order WHERE id = ?', [orderId]);
        const order = (rows as any[])[0];
        if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

        const currentStages = typeof order.deliveryStages === 'string' ? JSON.parse(order.deliveryStages) : (order.deliveryStages || DEFAULT_DELIVERY_STAGES);
        const stages = currentStages.map((s: any) =>
            s.status === orderStatus ? { ...s, isCompleted: true, completedAt: s.completedAt || new Date().toISOString() } : s
        );

        await pool.query(
            'UPDATE Order SET orderStatus = ?, deliveryStages = ? WHERE id = ?',
            [orderStatus, JSON.stringify(stages), orderId]
        );
        res.json({ ...order, orderStatus, deliveryStages: stages });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const { paymentStatus } = req.body;
        await pool.query('UPDATE Order SET paymentStatus = ? WHERE id = ?', [paymentStatus, orderId]);
        res.json({ message: 'Payment status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateOrderTracking = async (req: Request, res: Response) => {
    try {
        const orderId = String(req.params.id);
        const { trackingNumber, trackingLink, trackingPlatform, expectedDeliveryDate, internalNote, deliveryStages } = req.body;

        const updates: string[] = [];
        const params: any[] = [];

        if (trackingNumber !== undefined) { updates.push('trackingNumber = ?'); params.push(trackingNumber); }
        if (trackingLink !== undefined) { updates.push('trackingLink = ?'); params.push(trackingLink); }
        if (trackingPlatform !== undefined) { updates.push('trackingPlatform = ?'); params.push(trackingPlatform); }
        if (expectedDeliveryDate) { updates.push('expectedDeliveryDate = ?'); params.push(new Date(expectedDeliveryDate)); }
        if (internalNote !== undefined) { updates.push('internalNote = ?'); params.push(internalNote); }
        if (deliveryStages !== undefined) { updates.push('deliveryStages = ?'); params.push(JSON.stringify(deliveryStages)); }

        if (updates.length > 0) {
            params.push(orderId);
            await pool.query(`UPDATE Order SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        const [rows] = await pool.query('SELECT * FROM Order WHERE id = ?', [orderId]);
        res.json(mapRowToOrder((rows as any[])[0]));
    } catch (error) {
        console.error('Tracking update error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

const mapRowToOrder = (row: any) => {
    if (!row) return null;
    return {
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        shippingAddress: typeof row.shippingAddress === 'string' ? JSON.parse(row.shippingAddress) : row.shippingAddress,
        deliveryStages: typeof row.deliveryStages === 'string' ? JSON.parse(row.deliveryStages) : row.deliveryStages,
        user: row.userName ? { name: row.userName, email: row.userEmail } : undefined
    };
};
