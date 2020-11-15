import {MockHandler, ResultValueFactory} from "./types";

/**
 * make return value factory returning always new mock object
 */
export function makeUniqueFactory(): ResultValueFactory {
  return (args: any[], handler: MockHandler) => {
    const newHandler = handler.makeChild();
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
      const newHandler = handler.makeChild();
      obj = new Proxy({}, newHandler);
      handler.registry.register(obj, newHandler);
    }
    return obj;
  }
}
