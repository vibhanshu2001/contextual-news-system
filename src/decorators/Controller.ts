import { Router } from "express";
import "reflect-metadata";

export const globalRouter = Router();

export function Controller(basePath: string) {
  return function (target: any) {
    const router: any = Router();
    const instance = new target();

    if (Reflect.hasMetadata("routes", target)) {
      const routes = Reflect.getMetadata("routes", target) as { path: string; method: string; handler: Function }[];

      routes.forEach(({ path, method, handler }) => {
        router[method](path, handler.bind(instance));
      });
    }

    globalRouter.use(basePath, router);
  };
}