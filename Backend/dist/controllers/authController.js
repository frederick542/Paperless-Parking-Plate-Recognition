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
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = require("../services/authService");
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const token = yield (0, authService_1.handleAdminLogin)(username, password);
        res.json(token);
    }
    catch (error) {
        if (error.message === 'Invalid username or password') {
            res.status(401).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Server Error', error });
        }
    }
});
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { plate, password } = req.body;
    try {
        const token = yield (0, authService_1.handleUserLogin)(plate, password);
        res.json(token);
    }
    catch (error) {
        if (error.message === 'Invalid username or password') {
            res.status(401).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Server Error', error });
        }
    }
});
const userRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, plate } = req.body;
    try {
        if (!username || !password || !plate) {
            return res.status(400).send('Please fill all requirnment');
        }
        yield (0, authService_1.handleUserRegister)(username, password, plate);
        res.status(200).send('Succesfuly registered');
    }
    catch (error) {
        res.status(400).send('Invalid User');
    }
});
exports.default = { adminLogin, userRegister, userLogin };
