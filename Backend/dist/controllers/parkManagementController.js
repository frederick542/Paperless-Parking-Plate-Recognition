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
    const { plateNumber = '', timeIn = '', timeOut = '', lasstVisibleId = null } = req.body;
    const location = req.body.location || req.body.user.location;
    if (!location) {
        res.status(400).send('please include required variblee.');
        return;
    }
    const queryResult = yield (0, parkManagementRepository_1.query)(location, timeIn, timeOut, plateNumber, lasstVisibleId);
    res.status(404).send('work succesfuly');
});
exports.default = { postPlate, queryVehicle };
