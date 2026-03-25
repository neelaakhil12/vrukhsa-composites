import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { categories as defaultCategories } from '../data/products';

const DEFAULT_SETTINGS_VALUE = {
    banners: [
        { id: '1', image: '', title: 'Vruksha Composites', subtitle: 'Expertise in Advanced Materials & Research', link: '/search' },
        { id: '2', image: '', title: 'Additive NanoWorks', subtitle: 'Building the Future, Atom by Atom!', link: '/search?category=additive%20nanoworks' },
    ],
    categories: defaultCategories.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon, image: '' })),
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
        let setting = await prisma.setting.findUnique({ where: { key: 'main' } });
        if (!setting) {
            setting = await prisma.setting.create({
                data: { key: 'main', value: DEFAULT_SETTINGS_VALUE as any }
            });
        }
        res.json(setting.value);
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ message: 'Error reading site settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        // Get current settings first to merge
        let current = await prisma.setting.findUnique({ where: { key: 'main' } });
        const currentValue = (current?.value as any) || {};
        const merged = { ...currentValue, ...req.body };

        const updated = await prisma.setting.upsert({
            where: { key: 'main' },
            update: { value: merged as any },
            create: { key: 'main', value: merged as any },
        });
        res.json(updated.value);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating site settings' });
    }
};
