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
exports.monitorDefault = exports.updatePlate = exports.monitorQuery = exports.parkOut = exports.parkIn = exports.uploadPlatePicture = void 0;
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
const parkIn = (destinationPath, location, plateNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const imageUrl = yield (0, firebaseConfig_1.getUrl)(destinationPath);
    const currentDate = new Date().toISOString();
    const operation = 'in';
    const locationDocRef = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection(operation)
        .doc(plateNumber);
    yield locationDocRef.set({
        time_in: currentDate,
        image: imageUrl,
    });
    const userDocRef = firebaseConfig_1.db.collection('user').doc(plateNumber);
    yield userDocRef.update({
        currently_in: [location, currentDate],
    });
});
exports.parkIn = parkIn;
const parkOut = (destinationPath, location, plateNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const imageUrl = yield (0, firebaseConfig_1.getUrl)(destinationPath);
    const currentDate = new Date().toISOString();
    const [userDocSnap, locationDocSnap] = yield Promise.all([
        firebaseConfig_1.db.collection('user').doc(plateNumber).get(),
        firebaseConfig_1.db.collection('location').doc(location).get(),
    ]);
    const userDocData = userDocSnap.data();
    const locationDocData = locationDocSnap.data();
    if (!userDocSnap.exists ||
        !locationDocSnap.exists ||
        !userDocData ||
        !locationDocData) {
        console.log('No such document!');
        return 'No such document!';
    }
    const paidStatus = userDocData.paidStatus || false;
    const time_in = new Date(userDocData.currently_in[1]);
    const time_out = new Date();
    const minutesElapsed = (new Date().getTime() - new Date(time_in).getTime()) / (1000 * 60);
    if (locationDocData.free_on_minutes < minutesElapsed) {
        if (!paidStatus) {
            return 'Not paid, cannot proceed with park out';
        }
    }
    if (!time_in) {
        return 'No valid time_in!';
    }
    const amountDue = userDocData.currently_in[2];
    const userDocRefHistory = userDocSnap.ref
        .collection('history')
        .doc(currentDate);
    const locationDocRef = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection('out')
        .doc(`${plateNumber}::${time_out.getTime()}`);
    const locationDocRefIn = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection('in')
        .doc(plateNumber);
    const batch = firebaseConfig_1.db.batch();
    const time_out_string = time_out.toISOString();
    const time_in_string = time_in.toISOString();
    batch.set(locationDocRef, {
        time_in: time_in_string,
        time_out: time_out_string,
        image: imageUrl,
        paid: amountDue,
    });
    batch.set(userDocRefHistory, {
        image_out: imageUrl,
        paid: amountDue,
        time_in: time_in_string,
        time_out: time_out_string,
        location: location,
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
const updatePlate = (plateBefore, plateAfter, location) => __awaiter(void 0, void 0, void 0, function* () {
    const locationDataRef = firebaseConfig_1.db
        .collection('location')
        .doc(location)
        .collection('in');
    const prefUser = firebaseConfig_1.db.collection('user').doc(plateBefore);
    const afterUser = firebaseConfig_1.db.collection('user').doc(plateAfter);
    yield firebaseConfig_1.db.runTransaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        const docRef = locationDataRef.doc(plateBefore);
        const docSnapshot = yield transaction.get(docRef);
        if (!docSnapshot.exists) {
            throw new Error('No document found with plateBefore.');
        }
        const prefUserDoc = yield transaction.get(prefUser);
        const prefUserData = prefUserDoc.data();
        if (!prefUserData) {
            throw new Error('No user data found for plateBefore.');
        }
        const currentlyIn = prefUserData.currently_in || [];
        transaction.delete(docRef);
        transaction.set(locationDataRef.doc(plateAfter), Object.assign(Object.assign({}, docSnapshot.data()), { plate: plateAfter }));
        transaction.update(prefUser, { currently_in: [] });
        transaction.update(afterUser, { currently_in: currentlyIn });
    }));
    console.log('Plate updated successfully.');
});
exports.updatePlate = updatePlate;
const monitorDefault = (firestoreQuery, ws) => {
    firestoreQuery.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
                const vehicleData = change.doc;
                ws.send(JSON.stringify({
                    data: Object.assign({ plateNumber: vehicleData.id }, vehicleData.data()),
                    type: 'update',
                }));
            }
            else if (change.type === 'added' || change.type === 'removed') {
                const initialData = snapshot.docs.map((doc) => (Object.assign({ plateNumber: doc.id }, doc.data())));
                ws.send(JSON.stringify({
                    type: 'add/remove',
                    data: initialData,
                }));
            }
        });
    });
};
exports.monitorDefault = monitorDefault;
const monitorQuery = (ws_1, firestoreQuery_1, location_1, timeInLowerLimit_1, timeInUpperLimit_1, ...args_1) => __awaiter(void 0, [ws_1, firestoreQuery_1, location_1, timeInLowerLimit_1, timeInUpperLimit_1, ...args_1], void 0, function* (ws, firestoreQuery, location, timeInLowerLimit, timeInUpperLimit, plateNumber = '', lastVisibleId = '', operation) {
    let lastVisible = lastVisibleId
        ? yield firebaseConfig_1.db
            .collection('location')
            .doc(location)
            .collection('in')
            .doc(lastVisibleId)
            .get()
        : null;
    if (timeInLowerLimit) {
        firestoreQuery = firestoreQuery.where('time_in', '>=', timeInLowerLimit);
    }
    if (timeInUpperLimit) {
        firestoreQuery = firestoreQuery.where('time_in', '<=', timeInUpperLimit);
    }
    if (lastVisible) {
        if (operation == 'foward') {
            firestoreQuery = firestoreQuery.startAfter(lastVisible);
        }
        else if (operation == 'backward') {
            firestoreQuery = firestoreQuery.endBefore(lastVisible);
        }
        else {
            ws.send([]);
        }
    }
    firestoreQuery.onSnapshot((snapshot) => {
        if (snapshot.empty) {
            ws.send([]);
        }
        snapshot.docChanges().forEach((change) => {
            const firstDocId = snapshot.docs.length > 0 ? snapshot.docs[0].id : null;
            const lastDocId = snapshot.docs.length > 0
                ? snapshot.docs[snapshot.docs.length - 1].id
                : null;
            if (change.type === 'modified') {
                const vehicleData = change.doc;
                if (plateNumber) {
                    if (!plateNumber || vehicleData.id === plateNumber) {
                        ws.send(JSON.stringify({
                            data: Object.assign({ plateNumber: vehicleData.id }, vehicleData.data()),
                            type: 'update',
                            firstDocId,
                            lastDocId,
                        }));
                    }
                }
            }
            else if (change.type === 'added' || change.type === 'removed') {
                const initialData = snapshot.docs.map((doc) => {
                    if (!plateNumber || doc.id === plateNumber)
                        return Object.assign({ plateNumber: doc.id }, doc.data());
                });
                ws.send(JSON.stringify({
                    type: 'add/remove',
                    data: initialData,
                    firstDocId,
                    lastDocId,
                }));
            }
        });
    });
});
exports.monitorQuery = monitorQuery;
