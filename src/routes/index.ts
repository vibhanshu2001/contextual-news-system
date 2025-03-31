import express from "express";
import { globalRouter } from "../decorators/Controller";
import { readdirSync } from "fs";
import { join } from "path";

const router = express.Router();

const versions = ["v1"];

versions.forEach((version) => {
  const controllersPath = join(__dirname, `../controllers/${version}`);
  
  try {
    readdirSync(controllersPath).forEach((file) => {
      if (file.endsWith(".ts") || file.endsWith(".js")) {
        require(join(controllersPath, file));
      }
    });

    router.use(`/${version}`, globalRouter);
  } catch (error) {
    console.warn(`No controllers found for version: ${version}`);
  }
});

export default router;