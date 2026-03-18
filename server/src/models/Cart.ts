import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    variant?: {
        size?: string;
        color?: string;
    };
}

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    updatedAt: Date;
}

const CartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    variant: {
        size: { type: String },
        color: { type: String }
    }
}, { _id: false });

const CartSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema]
}, {
    timestamps: true
});

export default mongoose.model<ICart>('Cart', CartSchema);
