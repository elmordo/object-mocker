import {
  Call,
  Construct,
  MockHandler,
  MockUsageReport,
  PropertyDelete,
  PropertyGet,
  PropertySet,
  Registry,
  ResultValueFactory
} from "./types";
import {Report} from "./report";


export class Handler implements MockHandler {
  emulatedPrototype: any;

  readonly report: MockUsageReport = new Report();

  readonly registry;

  returnValueFactory: ResultValueFactory;

  instanceFactory: ResultValueFactory;

  constructor(config: HandlerOptions) {
    this.registry = config.registry;
    this.returnValueFactory = config.returnValueFactory;
    this.instanceFactory = config.instanceFactory;
    this.emulatedPrototype = config.emulatedPrototype;
  }

  apply(target: any, thisArg: any, argArray?: any): any {
    const returnValue = this.returnValueFactory(argArray, this);
    const record: Call = {
      type: "apply",
      arguments: thisArg,
      returnValue: returnValue
    };
    this.report.addAccessRecord(record);
    return returnValue;
  }

  construct(target: any, argArray: any, newTarget?: any): object {
    const result = this.instanceFactory(argArray, this);
    const record: Construct = {
      type: "construct",
      arguments: argArray
    };
    this.report.addAccessRecord(record);
    return result;
  }

  deleteProperty(target: any, p: PropertyKey): boolean {
    const record: PropertyDelete = {
      type: "delete",
      property: p as string
    };
    this.report.addAccessRecord(record);
    return Reflect.deleteProperty(target, p);
  }

  get(target: any, p: PropertyKey, receiver: any): any {
    const wasDefined = p in receiver;
    const value = receiver[p];

    const record: PropertyGet = {
      type: "get",
      property: p as string,
      wasDefined,
      value
    };
    this.report.addAccessRecord(record);
    return value;
  }

  getPrototypeOf(target: any): object | null {
    return this.emulatedPrototype === NoEmulatedPrototype ? Reflect.getPrototypeOf(target) : this.emulatedPrototype;
  }

  set(target: any, p: PropertyKey, value: any, receiver: any): boolean {
    const record: PropertySet = {
      type: "set",
      property: p as string,
      value,
      oldValue: receiver[p],
      created: p in receiver
    };
    this.report.addAccessRecord(record);
    return Reflect.set(target, p, value, receiver);
  }
}


export const NoEmulatedPrototype = Symbol("No emulated prototype");


export interface HandlerOptions {
  registry: Registry;
  returnValueFactory: ResultValueFactory;
  instanceFactory: ResultValueFactory;
  emulatedPrototype: any;
}
