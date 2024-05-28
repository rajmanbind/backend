import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());

//route import

import userRoute from "./routes/user.route.js";

//routes declaration

app.use("/api/v1/users", userRoute);

export { app };
