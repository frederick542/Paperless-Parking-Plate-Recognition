"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const authRepository_1 = require("../repositories/authRepository");
const loginAdmin = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield (0, authRepository_1.getAdminByUsername)(username);
    if (!admin) {
        throw new Error('Invalid username or password');
    }
    const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
    if (!isMatch) {
        throw new Error('Invalid username or password');
    }
    const adminPayload = {
        username: admin.username,
        location: admin.location,
    };
    const token = jwtUtils_1.default.generateToken(adminPayload);
    return {
        token: token,
        location: admin.location,
    };
});
exports.loginAdmin = loginAdmin;
