import mongoose, { Document } from 'mongoose';
export interface ISettings extends Document {
    key: string;
    banners: Array<{
        id: string;
        image: string;
        title: string;
        subtitle: string;
        link: string;
    }>;
    categories: Array<{
        id: string;
        name: string;
        image?: string;
        icon?: string;
    }>;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    aboutUs?: string;
    privacyPolicy?: string;
    termsAndConditions?: string;
    returnsPolicy?: string;
    featuredProductId?: string;
}
declare const _default: mongoose.Model<ISettings, {}, {}, {}, mongoose.Document<unknown, {}, ISettings, {}, mongoose.DefaultSchemaOptions> & ISettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISettings>;
export default _default;
//# sourceMappingURL=Settings.d.ts.map