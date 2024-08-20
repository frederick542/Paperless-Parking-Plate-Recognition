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
exports.handlePayment = exports.handlePaymentStatus = exports.handleHistory = void 0;
const userRepository_1 = require("../repositories/userRepository");
const maxHistory = 10;
const handleHistory = (plate) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, userRepository_1.getHistoryData)(plate, maxHistory);
});
exports.handleHistory = handleHistory;
const handlePaymentStatus = (plate) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, userRepository_1.getPaymentStatusData)(plate))) {
        return yield (0, userRepository_1.getPaymentData)(plate);
    }
    return null;
});
exports.handlePaymentStatus = handlePaymentStatus;
const handlePayment = (plate, paid) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, userRepository_1.getPaymentStatusData)(plate))) {
        return yield (0, userRepository_1.payBills)(plate, paid);
    }
    return null;
});
exports.handlePayment = handlePayment;
