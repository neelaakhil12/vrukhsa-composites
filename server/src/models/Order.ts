import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface IShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentMethod: 'COD' | 'CARD' | 'UPI' | 'RAZORPAY';
    paymentStatus: 'pending' | 'paid' | 'failed';
    orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    createdAt: Date;
}

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true }
}, { _id: false });

const ShippingAddressSchema = new Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
}, { _id: false });

const OrderSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: ['COD', 'CARD', 'UPI', 'RAZORPAY'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'placed'
    },
    totalAmount: { type: Number, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
}, {
    timestamps: true
});

export default mongoose.model<IOrder>('Order', OrderSchema);
