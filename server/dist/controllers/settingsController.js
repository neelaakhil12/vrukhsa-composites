"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const mysql_1 = __importDefault(require("../lib/mysql"));
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
        const [rows] = await mysql_1.default.query('SELECT * FROM Setting WHERE `key` = ?', ['main']);
        const setting = rows[0];
        if (!setting) {
            await mysql_1.default.query('INSERT INTO Setting (`key`, value) VALUES (?, ?)', ['main', JSON.stringify(DEFAULT_SETTINGS_VALUE)]);
            res.json(DEFAULT_SETTINGS_VALUE);
            return;
        }
        const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        res.json(value);
    }
    catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ message: 'Error reading site settings' });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const [rows] = await mysql_1.default.query('SELECT * FROM Setting WHERE `key` = ?', ['main']);
        const current = rows[0];
        const currentValue = current ? (typeof current.value === 'string' ? JSON.parse(current.value) : current.value) : {};
        const merged = { ...currentValue, ...req.body };
        if (!current) {
            await mysql_1.default.query('INSERT INTO Setting (`key`, value) VALUES (?, ?)', ['main', JSON.stringify(merged)]);
        }
        else {
            await mysql_1.default.query('UPDATE Setting SET value = ? WHERE `key` = ?', [JSON.stringify(merged), 'main']);
        }
        res.json(merged);
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating site settings' });
    }
};
exports.updateSettings = updateSettings;
