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
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const websocketConfig_1 = require("./config/websocketConfig");
const upload = (0, multer_1.default)({ dest: 'uploads/cache/' });
const port = 3000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use('/admin', adminRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.post('/readPlate', upload.single('file'), parkManagementController_1.default.postPlate);
(0, websocketConfig_1.setupWebSocketServer)(server);
server.listen(port, () => {
    console.log(`now listening on localhost:${port}`);
});
