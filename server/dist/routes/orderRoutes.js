"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_2 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
router.post('/', orderController_1.createOrder);
router.get('/', orderController_1.getMyOrders);
router.get('/:id', orderController_1.getOrderById);
router.put('/:id/cancel', orderController_1.cancelOrder);
// Admin only routes
router.get('/admin/all', authMiddleware_2.admin, orderController_1.getAllOrders);
router.put('/:id/status', authMiddleware_2.admin, orderController_1.updateOrderStatus);
router.put('/:id/payment', authMiddleware_2.admin, orderController_1.updatePaymentStatus);
router.put('/:id/tracking', authMiddleware_2.admin, orderController_1.updateOrderTracking);
exports.orderRouter = router;
