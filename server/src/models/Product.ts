import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    category: string;
    subCategory: string;
    description: string;
    images: string[];
    price: number;
    originalPrice: number;
    discountPercentage: number;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    stockQuantity: number;
    variants: { name: string; options: string[] }[];
    specifications: Record<string, string>;
    availableOffers: string[];
    warranty: string;
    seller: string;
    isSponsored: boolean;
    isDeleted: boolean;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    variants: [{
        name: { type: String },
        options: [{ type: String }]
    }],
    specifications: { type: Object },
    availableOffers: [{ type: String }],
    warranty: { type: String },
    seller: { type: String },
    isSponsored: { type: Boolean, default: false },
    deliveryTime: { type: String, default: '4-5 business days' },
    isDeleted: { type: Boolean, default: false, index: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model<IProduct>('Product', ProductSchema);
