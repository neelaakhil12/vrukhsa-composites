"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const cartController_1 = require("../controllers/cartController");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
router.get('/', cartController_1.getCart);
router.post('/add', cartController_1.addToCart);
router.put('/update/:productId', cartController_1.updateCartItem);
router.delete('/remove/:productId', cartController_1.removeFromCart);
router.delete('/clear', cartController_1.clearCart);
exports.cartRouter = router;
