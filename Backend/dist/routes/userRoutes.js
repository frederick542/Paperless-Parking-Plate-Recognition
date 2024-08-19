"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userRoutes = (0, express_1.Router)();
userRoutes.post('/register', authController_1.default.userRegister);
userRoutes.post('/login', authController_1.default.userLogin);
userRoutes.post('/getHistory', authMiddleware_1.default.verifyTokenUser, userController_1.default.getHistory);
userRoutes.post('/getPaymentStatus', authMiddleware_1.default.verifyTokenUser, userController_1.default.getPaymentStatus);
userRoutes.post('/pay', authMiddleware_1.default.verifyTokenUser, userController_1.default.pay);
exports.default = userRoutes;
