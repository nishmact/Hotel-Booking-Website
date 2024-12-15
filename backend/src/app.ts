import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import { connectDB } from './db/connectToMongoDB';
import adminRoutes from "./routes/adminRoutes";
import session from "express-session";
import userRoutes from "./routes/userRoutes";
import { userOtpExpiration } from "./middlewares/otpAuthMiddleware";
import path from 'path'
import vendorRoutes from "./routes/vendorRoutes";
import { v2 as cloudinary } from "cloudinary";
import hotelRoutes from "./routes/hotelRoutes";
import chatRoute from './routes/conversationRoutes';
import messageRoutes from './routes/messageRoutes';
import initializeSocket from './socket';
import {createServer} from 'http';
//import morgan from "morgan";


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const sessionMiddleware: RequestHandler = session({
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

const app = express();
const server = createServer(app)

//app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'../../frontend/dist')))

app.use(userOtpExpiration)


app.use('/api/admin', adminRoutes);
app.use("/api/user", userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/messages',messageRoutes)
app.use('/api/conversation',chatRoute)

initializeSocket(server);
app.get('*',(req:Request,res:Response) =>{
  res.sendFile(path.join(__dirname,'../../frontend/dist/index.html'))
})


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Generic error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log error stack trace
  res.status(500).json({ error: "Something went wrong!" });
});

const start = async () => {
  try {
    server.listen(3000, () => {
      console.log("Server running on 3000...");
    });
    await connectDB();
    console.log("Connected to the database successfully");
  } catch (error) {
    console.log(error)
  }
};

start();


