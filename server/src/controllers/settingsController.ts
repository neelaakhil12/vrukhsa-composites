import { Request, Response } from 'express';
import pool from '../lib/mysql';
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
        const [rows] = await pool.query('SELECT * FROM Setting WHERE `key` = ?', ['main']);
        const setting = (rows as any[])[0];

        if (!setting) {
            await pool.query(
                'INSERT INTO Setting (`key`, value) VALUES (?, ?)',
                ['main', JSON.stringify(DEFAULT_SETTINGS_VALUE)]
            );
            res.json(DEFAULT_SETTINGS_VALUE);
            return;
        }

        const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        res.json(value);
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ message: 'Error reading site settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Setting WHERE `key` = ?', ['main']);
        const current = (rows as any[])[0];
        const currentValue = current ? (typeof current.value === 'string' ? JSON.parse(current.value) : current.value) : {};
        const merged = { ...currentValue, ...req.body };

        if (!current) {
            await pool.query(
                'INSERT INTO Setting (`key`, value) VALUES (?, ?)',
                ['main', JSON.stringify(merged)]
            );
        } else {
            await pool.query(
                'UPDATE Setting SET value = ? WHERE `key` = ?',
                [JSON.stringify(merged), 'main']
            );
        }
        
        res.json(merged);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating site settings' });
    }
};
