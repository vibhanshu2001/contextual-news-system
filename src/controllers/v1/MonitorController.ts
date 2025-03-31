import { Request, Response } from "express";
import { Controller } from "../../decorators/Controller";
import { Get } from "../../decorators/Endpoint";

@Controller("/monitor")
export class MonitorController {
  @Get("/ping")
  ping(req: Request, res: Response) {
    res.status(200).json({ message: "pong", status: "healthy" });
  }
}
