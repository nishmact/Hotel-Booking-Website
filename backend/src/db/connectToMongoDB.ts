import mongoose from 'mongoose';


export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_CONNECTION_STRING) {
            throw new Error('MONGODB_URI is not defined');
        }
        const connect = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log(`MongoDB Connected: ${connect.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
}


