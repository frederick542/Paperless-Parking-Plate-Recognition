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
exports.parkOut = exports.parkIn = exports.uploadPlatePicture = void 0;
const firebaseConfig_1 = require("../config/firebaseConfig");
const uploadPlatePicture = (file, destinationPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield firebaseConfig_1.storageBucket.upload(file.path, {
            destination: destinationPath,
            metadata: {
                contentType: file.mimetype,
            },
        });
    }
    catch (error) {
        throw new Error('Failed to upload file');
    }
});
exports.uploadPlatePicture = uploadPlatePicture;
const parkIn = (destinationPath, location, license_plaete) => __awaiter(void 0, void 0, void 0, function* () {
    const imageUrl = yield (0, firebaseConfig_1.getUrl)(destinationPath);
    const currentDate = new Date();
    const operation = 'in';
    const locationDocRef = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection(operation)
        .doc(license_plaete);
    yield locationDocRef.set({
        time_in: currentDate,
        image: imageUrl,
    });
    const userDocRef = firebaseConfig_1.db.collection('user').doc(license_plaete);
    yield userDocRef.update({
        currently_in: [location, currentDate],
    });
});
exports.parkIn = parkIn;
const parkOut = (destinationPath, location, license_plate) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const imageUrl = yield (0, firebaseConfig_1.getUrl)(destinationPath);
    const currentDate = new Date().toISOString();
    const [userDocSnap, locationDocSnap] = yield Promise.all([
        firebaseConfig_1.db.collection('user').doc(license_plate).get(),
        firebaseConfig_1.db.collection('location').doc(location).get(),
    ]);
    if (!userDocSnap.exists || !locationDocSnap.exists) {
        console.log('No such document!');
        return 'No such document!';
    }
    const paidPerHour = ((_a = locationDocSnap.data()) === null || _a === void 0 ? void 0 : _a.paid_per_hour) || 0;
    const paidStatus = ((_b = userDocSnap.data()) === null || _b === void 0 ? void 0 : _b.paidStatus) || false;
    const time_in = (_c = userDocSnap.data()) === null || _c === void 0 ? void 0 : _c.currently_in[1];
    const time_out = new Date();
    if (!paidStatus) {
        return 'Not paid, cannot proceed with park out';
    }
    if (!time_in) {
        return 'No valid time_in!';
    }
    const minutesElapsed = (time_out.getTime() - time_in.toDate().getTime()) / (1000 * 60);
    const amountDue = paidPerHour * minutesElapsed;
    const userDocRefHistory = userDocSnap.ref
        .collection('history')
        .doc(currentDate);
    const locationDocRef = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection('out')
        .doc(`${license_plate}::${time_out.getTime()}`);
    const locationDocRefIn = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection('in')
        .doc(license_plate);
    const batch = firebaseConfig_1.db.batch();
    batch.set(locationDocRef, {
        time_in: time_in,
        time_out: time_out,
        image: imageUrl,
        paid: amountDue,
    });
    batch.set(userDocRefHistory, {
        image_out: imageUrl,
        paid: amountDue,
        time_in: time_in,
        time_out: time_out,
    });
    batch.update(userDocSnap.ref, {
        currently_in: [],
        paidStatus: false,
    });
    batch.delete(locationDocRefIn);
    yield batch.commit();
    return 'File uploaded and Succesfuly get out';
});
exports.parkOut = parkOut;
