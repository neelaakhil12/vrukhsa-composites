import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getSettings);
router.patch('/', protect, updateSettings);

export default router;
