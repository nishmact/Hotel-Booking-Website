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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const connectToMongoDB_1 = require("./db/connectToMongoDB");
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const otpAuthMiddleware_1 = require("./middlewares/otpAuthMiddleware");
const path_1 = __importDefault(require("path"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const cloudinary_1 = require("cloudinary");
const hotelRoutes_1 = __importDefault(require("./routes/hotelRoutes"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const socket_1 = __importDefault(require("./socket"));
const http_1 = require("http");
//import morgan from "morgan";
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const sessionMiddleware = (0, express_session_1.default)({
    secret: "cfcyygyv",
    saveUninitialized: true,
    resave: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
    },
});
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
//app.use(morgan("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(sessionMiddleware);
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
app.use(otpAuthMiddleware_1.userOtpExpiration);
app.use('/api/admin', adminRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use('/api/vendor', vendorRoutes_1.default);
app.use('/api/hotel', hotelRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/conversation', conversationRoutes_1.default);
(0, socket_1.default)(server);
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
});
app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: "Unauthorized" });
    }
});
// Generic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack trace
    res.status(500).json({ error: "Something went wrong!" });
});
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        server.listen(3000, () => {
            console.log("Server running on 3000...");
        });
        yield (0, connectToMongoDB_1.connectDB)();
        console.log("Connected to the database successfully");
    }
    catch (error) {
        console.log(error);
    }
});
start();
