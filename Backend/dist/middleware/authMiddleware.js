"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const verifyTokenAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }
    try {
        const decoded = jwtUtils_1.default.verifyToken(token);
        req.body.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.default = { verifyTokenAdmin };
