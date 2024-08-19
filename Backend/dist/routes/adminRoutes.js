"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parkManagementController_1 = __importDefault(require("../controllers/parkManagementController"));
const authController_1 = __importDefault(require("../controllers/authController"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminRoutes = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/cache/' });
adminRoutes.post('/login', authController_1.default.login);
adminRoutes.post('/readPlate', upload.single('file'), parkManagementController_1.default.postPlate);
adminRoutes.get('/queryParking', authMiddleware_1.default.verifyTokenAdmin, parkManagementController_1.default.queryVehicle);
exports.default = adminRoutes;
