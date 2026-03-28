import mongoose, { Document } from 'mongoose';
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
    variants: {
        name: string;
        options: string[];
    }[];
    specifications: Record<string, string>;
    availableOffers: string[];
    warranty: string;
    seller: string;
    isSponsored: boolean;
    isDeleted: boolean;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
export default _default;
//# sourceMappingURL=Product.d.ts.map