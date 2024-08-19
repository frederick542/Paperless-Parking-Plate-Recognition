"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const multer_1 = __importDefault(require("multer"));
const parkManagementController_1 = __importDefault(require("./controllers/parkManagementController"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const upload = (0, multer_1.default)({ dest: 'uploads/cache/' });
const port = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/admin', adminRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.post('/readPlate', upload.single('file'), parkManagementController_1.default.postPlate);
app.listen(port, () => {
    console.log(`now listening on localhost:${port}`);
});
