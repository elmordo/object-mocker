import {MockHandler, ResultValueFactory} from "./types";
import {Handler} from "./handler";

/**
 * make return value factory returning always new mock object
 */
export function makeUniqueFactory(): ResultValueFactory {
  return (args: any[], handler: MockHandler) => {
    const newHandler = new Handler(handler.registry);
    const result = new Proxy({}, newHandler);
    handler.registry.register(result, newHandler);
    return result;
  }
}

/**
 * make factory returning always same object
 */
export function makeSingletonFactory(): ResultValueFactory {
  let obj;
  return (args: any, handler: MockHandler) => {
    if (!obj) {
      const newHandler = new Handler(handler.registry);
      obj = new Proxy({}, newHandler);
      handler.registry.register(obj, newHandler);
    }
    return obj;
  }
}
