"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOtpExpiration = void 0;
const userOtpExpiration = (req, res, next) => {
    const now = Date.now();
    if (req.session.user && req.session.user.otpCode && req.session.user.otpSetTimestamp) {
        const timeElapsed = now - req.session.user.otpSetTimestamp;
        if (timeElapsed >= 120000) {
            req.session.user.otpCode = undefined;
            req.session.user.otpSetTimestamp = undefined;
            console.log("Expired OTP code cleaned up");
        }
    }
    next();
};
exports.userOtpExpiration = userOtpExpiration;
