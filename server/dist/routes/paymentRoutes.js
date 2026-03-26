"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
router.get('/config', authMiddleware_1.protect, paymentController_1.getRazorpayConfig);
router.post('/create-order', authMiddleware_1.protect, paymentController_1.createRazorpayOrder);
router.post('/verify', authMiddleware_1.protect, paymentController_1.verifyPayment);
exports.paymentRouter = router;
