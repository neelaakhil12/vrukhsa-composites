import { Request, Response } from 'express';
import Settings from '../models/Settings';
import { categories as defaultCategories } from '../data/products';

// Default settings when DB is empty
const DEFAULT_SETTINGS = {
    key: 'main',
    banners: [
        {
            id: '1',
            image: '',
            title: 'Vruksha Composites',
            subtitle: 'Expertise in Advanced Materials & Research',
            link: '/search',
        },
        {
            id: '2',
            image: '',
            title: 'Additive NanoWorks',
            subtitle: 'Building the Future, Atom by Atom!',
            link: '/search?category=additive%20nanoworks',
        },
    ],
    categories: defaultCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        image: '',
    })),
    contactEmail: 'info@vrukshacomposites.com',
    contactPhone: '+91 99999 99999',
    contactAddress: 'Hyderabad, Telangana, India',
    aboutUs: '',
    privacyPolicy: '',
    termsAndConditions: '',
    returnsPolicy: '',
};

export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne({ key: 'main' });
        if (!settings) {
            // Seed default settings on first access
            settings = await Settings.create(DEFAULT_SETTINGS);
        }
        res.json(settings.toObject());
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ message: 'Error reading site settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const updatedSettings = await Settings.findOneAndUpdate(
            { key: 'main' },
            { $set: req.body },
            { new: true, upsert: true, runValidators: false }
        );
        res.json(updatedSettings?.toObject());
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating site settings' });
    }
};
