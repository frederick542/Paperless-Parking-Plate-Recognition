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
const userService_1 = require("../services/userService");
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    let data;
    try {
        data = yield (0, userService_1.handleHistory)(user.plate);
    }
    catch (error) {
        return res.status(404).send('No data found');
    }
    res.status(200).send(data);
});
const getPaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    let data;
    try {
        data = yield (0, userService_1.handlePaymentStatus)(user.plate);
        if (!data) {
            return res.status(200).send('alreadyPaid');
        }
    }
    catch (error) {
        return res.status(404).send('No data found');
    }
    res.status(200).send(data);
});
const pay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, paid } = req.body;
    let data;
    if (!user || !paid) {
        return res.status(400).send('Bad Request');
    }
    try {
        data = yield (0, userService_1.handlePayment)(user.plate, paid);
        if (!data) {
            return res.status(200).send('Currently not in any places');
        }
    }
    catch (error) {
        return res.status(404).send('No data found');
    }
    res.status(200).send(data);
});
exports.default = { getHistory, getPaymentStatus, pay };
