import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, mongoose.DefaultSchemaOptions> & ICart & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICart>;
export default _default;
//# sourceMappingURL=Cart.d.ts.map