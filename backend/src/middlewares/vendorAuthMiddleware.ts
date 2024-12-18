import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedRequest extends Request {
  Vendor?: any;
}

export default function vendorAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): any {
  const token = req.headers.authorization;

  if (!token) {
    console.log("Token not provided");
    return res.status(401).json({ message: "Token not provided" });
  }

  const accessToken = token.split(" ")[1];

  jwt.verify(
    accessToken,
    process.env.JWT_SECRET!,
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.Vendor = decoded;
      next();
    }
  );
}
