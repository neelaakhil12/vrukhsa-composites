import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(__dirname, '../../../src/data/site_settings.json');

const readSettings = async () => {
    const data = await fs.promises.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(data);
};

const writeSettings = async (data: any) => {
    await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(data, null, 4));
};

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await readSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error reading site settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const currentSettings = await readSettings();
        const updatedSettings = { ...currentSettings, ...req.body };
        await writeSettings(updatedSettings);
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating site settings' });
    }
};
