"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtUtils_1 = __importDefault(require("../utils/jwtUtils"));
const verifyToken = (role) => (req, res, next) => {
    const payload = JSON.parse(req.cookies.token);
    const token = payload.tokenVal;
    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }
    try {
        let decoded = jwtUtils_1.default.verifyToken(token);
        if (!decoded) {
            throw new Error('Invalid token');
        }
        if (role === 'admin') {
            req.body.user = decoded;
        }
        else if (role === 'user') {
            req.body.user = decoded;
        }
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
const verifyCookie = (req, res) => {
    const token = JSON.parse(req.cookies['token']);
    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }
    try {
        let decoded = jwtUtils_1.default.verifyToken(token.tokenVal);
        if (!decoded) {
            res.status(403).json({ message: 'No token provided' });
            return;
        }
        res.status(200).json({ message: 'Authorized' });
        return;
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
const verifyTokenAdmin = verifyToken('admin');
const verifyTokenUser = verifyToken('user');
exports.default = { verifyTokenAdmin, verifyTokenUser, verifyCookie };
