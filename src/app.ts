import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import "reflect-metadata";
import { connectDB } from "./config/db";
import { setupSwagger } from "./swagger";


dotenv.config();

const app = express();

setupSwagger(app);
app.use(express.json());
app.use("/api", routes);
connectDB();
export default app;