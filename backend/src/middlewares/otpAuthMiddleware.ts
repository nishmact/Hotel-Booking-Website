import { NextFunction, Request , Response } from "express";


export const userOtpExpiration = (req: Request, res: Response, next: NextFunction) => {
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