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
exports.getAdminByUsername = exports.checkVehicleIn = exports.checkVehicleRegistered = void 0;
const firebaseConfig_1 = require("../config/firebaseConfig");
const ADMIN_COLLECTION = 'admin';
const getAdminByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield firebaseConfig_1.db.collection(ADMIN_COLLECTION).doc(username).get();
    if (!doc.exists)
        return null;
    return Object.assign({ id: doc.id }, doc.data());
});
exports.getAdminByUsername = getAdminByUsername;
const checkVehicleRegistered = (license_plate) => __awaiter(void 0, void 0, void 0, function* () {
    const docRef = firebaseConfig_1.db.collection('user').doc(license_plate);
    const doc = yield docRef.get();
    return doc.exists;
});
exports.checkVehicleRegistered = checkVehicleRegistered;
const checkVehicleIn = (LOCATION, license_plate) => __awaiter(void 0, void 0, void 0, function* () {
    const locationDocRef = firebaseConfig_1.db
        .collection('location')
        .doc(LOCATION)
        .collection('in')
        .doc(license_plate);
    const doc = yield locationDocRef.get();
    return doc.exists;
});
exports.checkVehicleIn = checkVehicleIn;
