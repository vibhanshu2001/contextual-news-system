import { Sequelize } from "sequelize";
import { DB_URI } from "./constants";
import logger from "../utils/logger";
import { seedDatabase } from "../utils/seed";

export const sequelize = new Sequelize(DB_URI as string, {
  dialect: "mysql",
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected.");
    await sequelize.sync({ alter: true });
    await seedDatabase();
  } catch (error) {
    logger.error("Database connection error:", error);
  }
};
