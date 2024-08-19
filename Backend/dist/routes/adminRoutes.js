"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parkManagementController_1 = __importDefault(require("../controllers/parkManagementController"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminRoutes = (0, express_1.Router)();
adminRoutes.post('/login', authController_1.default.adminLogin);
adminRoutes.post('/queryParking', authMiddleware_1.default.verifyTokenAdmin, parkManagementController_1.default.queryVehicle);
adminRoutes.post('/changePlate', authMiddleware_1.default.verifyTokenAdmin, parkManagementController_1.default.changePlateNumber);
exports.default = adminRoutes;
