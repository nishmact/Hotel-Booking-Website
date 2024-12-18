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
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const baseRepository_1 = require("./baseRepository");
class ReviewRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(reviewModel_1.default);
    }
    addReply(content, reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield reviewModel_1.default.findByIdAndUpdate(reviewId, {
                $push: { reply: content },
            });
            return data;
        });
    }
    getReviewsByVendorId(vendorId, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const reviews = yield reviewModel_1.default.find({ vendorId: vendorId })
                .populate("vendorId")
                .populate("userId")
                .sort({
                createdAt: -1,
            })
                .skip(skip)
                .limit(pageSize);
            const count = yield reviewModel_1.default.countDocuments({ vendorId: vendorId });
            return { reviews, count };
        });
    }
}
exports.default = new ReviewRepository();
