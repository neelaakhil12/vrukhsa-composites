"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const products_1 = require("../data/products");
const DEFAULT_SETTINGS_VALUE = {
    banners: [
        { id: '1', image: '', title: 'Vruksha Composites', subtitle: 'Expertise in Advanced Materials & Research', link: '/search' },
        { id: '2', image: '', title: 'Additive NanoWorks', subtitle: 'Building the Future, Atom by Atom!', link: '/search?category=additive%20nanoworks' },
    ],
    categories: products_1.categories.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon, image: '' })),
    contactEmail: 'info@vrukshacomposites.com',
    contactPhone: '+91 99999 99999',
    contactAddress: 'Hyderabad, Telangana, India',
    aboutUs: '',
    privacyPolicy: '',
    termsAndConditions: '',
    returnsPolicy: '',
};
const getSettings = async (req, res) => {
    try {
        let setting = await prisma_1.default.setting.findUnique({ where: { key: 'main' } });
        if (!setting) {
            setting = await prisma_1.default.setting.create({
                data: { key: 'main', value: DEFAULT_SETTINGS_VALUE }
            });
        }
        res.json(setting.value);
    }
    catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ message: 'Error reading site settings' });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        // Get current settings first to merge
        let current = await prisma_1.default.setting.findUnique({ where: { key: 'main' } });
        const currentValue = current?.value || {};
        const merged = { ...currentValue, ...req.body };
        const updated = await prisma_1.default.setting.upsert({
            where: { key: 'main' },
            update: { value: merged },
            create: { key: 'main', value: merged },
        });
        res.json(updated.value);
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating site settings' });
    }
};
exports.updateSettings = updateSettings;
