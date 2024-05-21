import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongodb connection failed: ", error);
    process.exit(1); //todo need to know
  }
};
export default connectDB;
