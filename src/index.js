import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import express from "express";
import connectDB from "./db/connectdb.js";

const app = express(); // Create an instance of express
connectDB()

// console.log(process.env.MONGODB_URI);
/*
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Database connected!");

    app.on("error", (error) => {
      console.error("ERROR : ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR: ", error);
  }
})();
*/
