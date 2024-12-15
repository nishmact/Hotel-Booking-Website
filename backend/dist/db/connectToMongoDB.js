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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config(); // This loads the variables from the .env file into process.env
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Connecting to MongoDB at URL: ${process.env.MONGODB_CONNECTION_STRING}`);
        if (!process.env.MONGODB_CONNECTION_STRING) {
            throw new Error('MONGODB_CONNECTION_STRING is not defined');
        }
        const connect = yield mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING);
        // Check the connection details
        const host = connect.connection.host || 'localhost';
        const dbName = connect.connection.name;
        console.log(`MongoDB Connected: Host=${host}, Database=${dbName}`);
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
