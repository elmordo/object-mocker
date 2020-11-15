import {
  Call,
  Construct,
  Handler,
  Report,
  PropertyDelete,
  PropertyGet,
  PropertySet,
  Registry,
  ResultValueFactory
} from "./types";
import {CommonReport} from "./report";


export class CommonHandler implements Handler {

  /**
   * list of special properties used by some frameworks (e.g. jasmine)
   */
  static readonly SPECIAL_PROPERTIES = new Set(["jasmineToString"]);

  emulatedPrototype: any;

  readonly report: Report = new CommonReport();

  readonly registry: Registry;

  returnValueFactory: ResultValueFactory;

  instanceFactory: ResultValueFactory;

  parent?: Handler;

  useAutoCreate: boolean;

  readonly target: any;

  constructor(options: CommonHandlerOptions) {
    this.registry = options.registry;
    this.returnValueFactory = options.returnValueFactory;
    this.instanceFactory = options.instanceFactory;
    this.emulatedPrototype = options.emulatedPrototype;
    this.parent = options.parent || null;
    this.target = options.target || {};
    this.useAutoCreate = options.useAutoCreate;
  }

  makeChild(): Handler {
    return new CommonHandler({
      registry: this.registry,
      returnValueFactory: this.returnValueFactory,
      instanceFactory: this.instanceFactory,
      emulatedPrototype: NoEmulatedPrototype,
      parent: this,
      useAutoCreate: true
    });
  }

  apply(target: any, thisArg: any, argArray?: any): any {
    const returnValue = this.returnValueFactory(argArray, this);
    const record: Call = {
      type: "apply",
      arguments: argArray,
      returnValue: returnValue
    };
    this.report.addAccessRecord(record);
    return returnValue;
  }

  construct(target: any, argArray: any, newTarget?: any): any {
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
    const wasDefined = p in target;

    // some testing frameworks access to special properties and we do not want to trap them
    if (CommonHandler.SPECIAL_PROPERTIES.has(p as string)) {
      return Reflect.get(target, p, receiver);
    }

    if (!wasDefined && this.useAutoCreate) {
      const childHandler = this.makeChild();
      const proxy = new Proxy(childHandler.target, childHandler);
      this.registry.register(proxy, childHandler);
      target[p] = proxy;
    }

    const value = Reflect.get(target, p, receiver);

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
      created: p in target,
      oldValue: target[p],
    };
    this.report.addAccessRecord(record);
    return Reflect.set(target, p, value, receiver);
  }
}


export const NoEmulatedPrototype = Symbol("No emulated prototype");


export interface CommonHandlerOptions {
  target?: any;
  registry: Registry;
  returnValueFactory: ResultValueFactory;
  instanceFactory: ResultValueFactory;
  emulatedPrototype: any;
  parent?: Handler;
  useAutoCreate: boolean
}
