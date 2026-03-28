import mongoose, { Document } from 'mongoose';
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
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}
export interface IDeliveryStage {
    status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    label: string;
    completedAt?: Date;
    note?: string;
    isCompleted: boolean;
}
export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentMethod: 'COD' | 'CARD' | 'UPI' | 'RAZORPAY';
    paymentStatus: 'pending' | 'paid' | 'failed';
    orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    totalAmount: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    trackingNumber?: string;
    trackingLink?: string;
    trackingPlatform?: string;
    expectedDeliveryDate?: Date;
    deliveryStages: IDeliveryStage[];
    internalNote?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.d.ts.map