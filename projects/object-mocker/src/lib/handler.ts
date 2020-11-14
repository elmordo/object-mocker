import {MockHandler, MockUsageReport, Registry, ReturnValueFactory} from "./types";
import {Report} from "./report";


export class Handler implements MockHandler {
  emulatedPrototype: any;

  readonly report: MockUsageReport = new Report();

  returnValueFactory: ReturnValueFactory;

  constructor(private registry: Registry, config: HandlerOptions) {
  }

  apply(target: any, thisArg: any, argArray?: any): any {
    return Reflect.apply(target, thisArg, argArray);
  }

  construct(target: any, argArray: any, newTarget?: any): object {
    return Reflect.construct(target, argArray, newTarget);
  }

  deleteProperty(target: any, p: PropertyKey): boolean {
    return Reflect.deleteProperty(target, p);
  }

  get(target: any, p: PropertyKey, receiver: any): any {
    return Reflect.get(target, p, receiver);
  }

  getPrototypeOf(target: any): object | null {
    return undefined;
  }

  set(target: any, p: PropertyKey, value: any, receiver: any): boolean {
    return Reflect.set(target, value, receiver);
  }
}


export interface HandlerOptions {
  returnValue?: any;
}
