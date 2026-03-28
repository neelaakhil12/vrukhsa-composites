"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
// Rate Limiter: 5 account creations/logins per minute per IP
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: 'Too many attempts, please try again later.'
});
router.post('/register', authLimiter, authController_1.registerUser);
router.post('/login', authLimiter, authController_1.loginUser);
router.post('/logout', authController_1.logoutUser);
router.post('/verify-otp', authController_1.verifyOtp);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
exports.authRouter = router;
