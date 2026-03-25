import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    key: string; // single document key, e.g. "main"
    // Appearance
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
    // Contact
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    // CMS
    aboutUs?: string;
    privacyPolicy?: string;
    termsAndConditions?: string;
    returnsPolicy?: string;
    // Featured
    featuredProductId?: string;
}

const SettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true, default: 'main' },
    banners: [{
        id: { type: String },
        image: { type: String },
        title: { type: String },
        subtitle: { type: String },
        link: { type: String },
    }],
    categories: [{
        id: { type: String },
        name: { type: String },
        image: { type: String },
        icon: { type: String },
    }],
    contactEmail: { type: String },
    contactPhone: { type: String },
    contactAddress: { type: String },
    aboutUs: { type: String },
    privacyPolicy: { type: String },
    termsAndConditions: { type: String },
    returnsPolicy: { type: String },
    featuredProductId: { type: String },
}, { timestamps: true });

export default mongoose.model<ISettings>('Settings', SettingsSchema);
