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
const plateService_1 = require("../services/plateService");
const parkManagementRepository_1 = require("../repositories/parkManagementRepository");
const postPlate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const { operation, location } = req.body;
    try {
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        if (!operation || !location) {
            return res.status(400).send('please include required variable.');
        }
        const response = yield (0, plateService_1.postImageToFastAPI)(file, operation, location);
        res.status(response.status).send(response.data);
    }
    catch (error) {
        console.error('Error posting image:', error);
        res.status(500).send('An error occurred while uploading the image.');
    }
});
const queryVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { plateNumber = '', timeInLowerLimit = '', timeInUpperLimit = '', lastVisibleId = null, operation = '', } = req.body;
    try {
        const location = req.body.user.location;
        if (!location) {
            res.status(400).send('please include required variblee.');
            return;
        }
        const queryResult = yield (0, parkManagementRepository_1.query)(location, timeInLowerLimit, timeInUpperLimit, plateNumber, lastVisibleId, operation);
        res.status(200).send(queryResult);
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});
const changePlateNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { plateBefore, plateAfter } = req.body;
    const location = req.body.user.location;
    try {
        yield (0, parkManagementRepository_1.updatePlate)(plateBefore, plateAfter, location);
        res.status(200).json({ message: 'Updated Succesfuly' });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Check your input again' });
    }
});
exports.default = { postPlate, queryVehicle, changePlateNumber };
