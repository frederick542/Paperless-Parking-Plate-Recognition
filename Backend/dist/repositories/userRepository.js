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
exports.payBills = exports.getPaymentData = exports.getPaymentStatusData = exports.getHistoryData = void 0;
const firebaseConfig_1 = require("../config/firebaseConfig");
const getHistoryData = (plate, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const firestoreHistoryRef = firebaseConfig_1.db
        .collection('user')
        .doc(plate)
        .collection('history')
        .orderBy('time_in')
        .limit(limit);
    const querySnapshot = yield firestoreHistoryRef.get();
    if (querySnapshot.empty) {
        return null;
    }
    const historyData = querySnapshot.docs.map((doc) => doc.data());
    return historyData;
});
exports.getHistoryData = getHistoryData;
const getPaymentStatusData = (plate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDocRef = firebaseConfig_1.db.collection('user').doc(plate);
        const docSnapshot = yield userDocRef.get();
        if (!docSnapshot.exists) {
            return null;
        }
        const userData = docSnapshot.data();
        if (!userData) {
            return null;
        }
        const paymentStatusData = userData.paidStatus;
        return paymentStatusData;
    }
    catch (error) {
        return null;
    }
});
exports.getPaymentStatusData = getPaymentStatusData;
const getPaymentData = (plate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDocRef = firebaseConfig_1.db.collection('user').doc(plate);
        const docSnapshot = yield userDocRef.get();
        const userData = docSnapshot.data();
        if (!userData) {
            return null;
        }
        const paymentStatusData = userData.currently_in;
        const locationDocRef = firebaseConfig_1.db.collection('location').doc(paymentStatusData[0]);
        const locationData = (yield locationDocRef.get()).data();
        if (!locationData) {
            return null;
        }
        const minutesElapsed = Math.round((new Date().getTime() - new Date(paymentStatusData[1]).getTime()) /
            (1000 * 60));
        let amountDue = 0;
        if (locationData.free_on_minutes < minutesElapsed) {
            amountDue = locationData.paid_per_hour * minutesElapsed;
        }
        return {
            location: paymentStatusData[0],
            time_in: paymentStatusData[1],
            incoming_paid: amountDue,
        };
    }
    catch (error) {
        return null;
    }
});
exports.getPaymentData = getPaymentData;
const payBills = (plate, paid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDocRef = firebaseConfig_1.db.collection('user').doc(plate);
        const userDoc = yield userDocRef.get();
        if (!userDoc.exists) {
            console.error(`Document for plate ${plate} does not exist.`);
            return false;
        }
        const userData = userDoc.data();
        const currentlyInArray = (userData === null || userData === void 0 ? void 0 : userData.currently_in) || [];
        currentlyInArray[2] = paid;
        userDocRef.update({
            currently_in: currentlyInArray,
            paidStatus: true,
        });
        return true;
    }
    catch (error) {
        return null;
    }
});
exports.payBills = payBills;
