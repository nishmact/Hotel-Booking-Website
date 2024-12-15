import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config(); // This loads the variables from the .env file into process.env

export const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB at URL: ${process.env.MONGODB_CONNECTION_STRING}`);
        if (!process.env.MONGODB_CONNECTION_STRING) {
            throw new Error('MONGODB_CONNECTION_STRING is not defined');
        }

        const connect = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

        // Check the connection details
        const host = connect.connection.host || 'localhost';
        const dbName = connect.connection.name;

        console.log(`MongoDB Connected: Host=${host}, Database=${dbName}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
