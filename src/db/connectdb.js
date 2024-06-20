import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); // Adjust the path as needed

import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";
// console.log("URI: ", process.env.MONGODB_URI);
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}${DB_NAME}`
    );
    // const connectionInstance = await mongoose.connect(
    //   `mongodb+srv://rajmanbind3535:yNqScTFVvOXcviU6@cluster0.jrxknrq.mongodb.net/learn-backend`
    // );

    console.log(
      `\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongodb connection failed: ", error);
    process.exit(1); //todo need to know
  }
};
export default connectDB;
