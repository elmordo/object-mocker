import {MockHandler, MockUsageReport, Registry, ReturnValueFactory} from "./types";
import {Report} from "./report";


export class Handler implements MockHandler {
  emulatedPrototype: any;

  readonly report: MockUsageReport = new Report();

  returnValueFactory: ReturnValueFactory;

  constructor(public registry: Registry, config?: HandlerOptions) {
  }

  apply(target: any, thisArg: any, argArray?: any): any {
  }

  construct(target: any, argArray: any, newTarget?: any): object {
    return Reflect.construct(target, argArray, newTarget);
  }

  deleteProperty(target: any, p: PropertyKey): boolean {
    return false;
  }

  get(target: any, p: PropertyKey, receiver: any): any {
  }

  getPrototypeOf(target: any): object | null {
    return Reflect.getPrototypeOf(target);
  }

  set(target: any, p: PropertyKey, value: any, receiver: any): boolean {
    return false;
  }
}


export interface HandlerOptions {
  returnValue?: any;
}
