import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_CONNECTION_STRING) {
            throw new Error('MONGODB_CONNECTION_STRING is not defined');
        }

        const connect = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

        // Check the connection details
        const host = connect.connection.host || 'localhost';
        const dbName = connect.connection.name;

        console.log(`MongoDB Connected: Host=${host}, Database=${dbName}`);
    } catch (error) {
        console.error("Error",error);
        process.exit(1);
    }
};
