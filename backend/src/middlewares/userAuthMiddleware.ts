import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: any;
}

export default function userAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "Server error, Please login again." });
    return;
  }

  const accessToken = token.split(" ")[1];

  jwt.verify(
    accessToken,
    process.env.JWT_SECRET!,
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;
      next();
    }
  );
}
