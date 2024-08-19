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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImageToFastAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const fileManagementUtils_1 = require("../utils/fileManagementUtils");
const parkManagementRepository_1 = require("../repositories/parkManagementRepository");
const uuid_1 = require("uuid");
const authRepository_1 = require("../repositories/authRepository");
const FASTAPI_URL = process.env.FASTAPI_URL || '';
const postImageToFastAPI = (file, operation, location) => __awaiter(void 0, void 0, void 0, function* () {
    const form = new form_data_1.default();
    const filePath = (0, fileManagementUtils_1.getFilePath)(file.path);
    const uniqueFileName = `${(0, uuid_1.v4)()}_${file.originalname}`;
    const destinationPath = `${location}/${operation}/${uniqueFileName}`;
    form.append('file', fs_1.default.createReadStream(filePath), {
        filename: file.originalname,
        contentType: file.mimetype,
    });
    try {
        const { data } = yield axios_1.default.post(FASTAPI_URL, form, {
            headers: Object.assign({}, form.getHeaders()),
        });
        if (data.message === 'No license plates detected') {
            return {
                status: 406,
                data: { message: 'No license plates detected' },
            };
        }
        if (!['in', 'out', 'register'].includes(operation)) {
            return {
                status: 400,
                data: { message: 'Invalid operation' },
            };
        }
        const license_plate = data.license_plate;
        if (!(yield (0, authRepository_1.checkVehicleRegistered)(license_plate))) {
            return {
                status: 401,
                data: { message: 'Account does not exist' },
            };
        }
        let text = 'File uploaded and Firestore updated successfully';
        if (operation == 'in') {
            yield (0, parkManagementRepository_1.uploadPlatePicture)(file, destinationPath);
            yield (0, parkManagementRepository_1.parkIn)(destinationPath, location, license_plate);
        }
        else if (operation == 'out') {
            if (!(yield (0, authRepository_1.checkVehicleIn)(location, license_plate))) {
                return {
                    status: 404,
                    data: { message: 'no data in parked in' },
                };
            }
            yield (0, parkManagementRepository_1.uploadPlatePicture)(file, destinationPath);
            text = yield (0, parkManagementRepository_1.parkOut)(destinationPath, location, license_plate);
        }
        else if (operation == 'register') {
            return {
                status: 200,
                data: { yourPlate: license_plate },
            };
        }
        return {
            status: 200,
            data: { message: text },
        };
    }
    catch (error) {
        console.error('Error processing file upload:', error);
        return {
            status: 500,
            data: { message: 'An error occurred while processing the request' },
        };
    }
    finally {
        (0, fileManagementUtils_1.deleteFile)(filePath);
    }
});
exports.postImageToFastAPI = postImageToFastAPI;
