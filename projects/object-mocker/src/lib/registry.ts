import {Handler, Registry} from "./types";


export class MockRegistry implements Registry {

  private objectToHandler = new Map<any, Handler>();

  private handlerToObject = new Map<Handler, any>();

  clear() {
    this.objectToHandler.clear();
    this.handlerToObject.clear();
  }

  getHandlerByObject(obj: any): Handler {
    if (!this.objectToHandler.has(obj)) {
      throw new Error("Object not found");
    }
    return this.objectToHandler.get(obj);
  }

  getHandlers(): Handler[] {
    return Array.from(this.objectToHandler.values());
  }

  getObjectByHandler(handler: Handler): any {
    if (!this.handlerToObject.has(handler)) {
      throw new Error("Handler not found");
    }
    return this.handlerToObject.get(handler);
  }

  getObjects(): any[] {
    return Array.from(this.handlerToObject.values());
  }

  register(obj: any, handler: Handler): void {
    this.objectToHandler.set(obj, handler);
    this.handlerToObject.set(handler, obj);
  }
}
