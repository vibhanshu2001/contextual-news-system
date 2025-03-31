import "reflect-metadata";

function createRouteDecorator(method: "get" | "post" | "put" | "delete") {
  return function (path: string) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
      if (!Reflect.hasMetadata("routes", target.constructor)) {
        Reflect.defineMetadata("routes", [], target.constructor);
      }

      const routes = Reflect.getMetadata("routes", target.constructor);
      routes.push({ path, method, handler: descriptor.value });
      Reflect.defineMetadata("routes", routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator("get");
export const Post = createRouteDecorator("post");
export const Put = createRouteDecorator("put");
export const Delete = createRouteDecorator("delete");
