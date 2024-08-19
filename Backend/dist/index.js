"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const port = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/admin', adminRoutes_1.default);
app.listen(port, () => {
    console.log(`now listening on localhost:${port}`);
});
