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
const userModel_1 = __importDefault(require("../models/userModel"));
const baseRepository_1 = require("./baseRepository");
class UserRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(userModel_1.default);
    }
    findAllUsers(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = search ? { name: { $regex: new RegExp(search, "i") } } : {};
                const users = yield userModel_1.default.find(query)
                    .skip((page - 1) * limit)
                    .limit(limit);
                return users;
            }
            catch (error) {
                throw error;
            }
        });
    }
    UpdatePassword(password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield userModel_1.default.updateOne({ email: mail }, { password: password });
                if (result.modifiedCount === 1) {
                    return { success: true, message: "Password updated successfully." };
                }
                else {
                    return {
                        success: false,
                        message: "User not found or password not updated.",
                    };
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new UserRepository();
