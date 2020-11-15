import {MockRegistry} from "./registry";
import {Registry} from "./types";
import {CommonHandler, CommonHandlerOptions, NoEmulatedPrototype} from "./handler";
import {makeSingletonFactory, makeUniqueFactory} from "./return-value-factories";


export const defaultRegistry: Registry = new MockRegistry();
let currentRegistry = defaultRegistry;

export function setRegistry(registry: Registry): void {
  currentRegistry = registry;
}

export function getRegistry(): Registry {
  return currentRegistry;
}

export function mock(options?: MockOptions): any {
  const handlerOptions = extractHandlerOptions(options || {});
  const handler = new CommonHandler(handlerOptions);
  const proxy = new Proxy(handler.target, handler);
  getRegistry().register(proxy, handler);
  return proxy;
}

export interface MockOptions {
  handlerOptions?: Partial<CommonHandlerOptions>
}


function extractHandlerOptions(options: MockOptions): CommonHandlerOptions {
  const opts = (options.handlerOptions || {}) as CommonHandlerOptions;
  return {
    useAutoCreate: getPropertyOrDefault<CommonHandlerOptions>(opts, "useAutoCreate", true),
    emulatedPrototype: getPropertyOrDefault<CommonHandlerOptions>(opts, "emulatedPrototype", NoEmulatedPrototype),
    instanceFactory: getPropertyOrDefault<CommonHandlerOptions>(opts, "instanceFactory", makeUniqueFactory()),
    parent: getPropertyOrDefault<CommonHandlerOptions>(opts, "parent", null),
    registry: getPropertyOrDefault<CommonHandlerOptions>(opts, "registry", getRegistry()),
    returnValueFactory: getPropertyOrDefault<CommonHandlerOptions>(opts, "returnValueFactory", makeSingletonFactory()),
    target: getPropertyOrDefault<CommonHandlerOptions>(opts, "target", {})
  };
}


function getPropertyOrDefault<T>(options: T, prop: keyof T, defaultValue: any): any {
  return options.hasOwnProperty(prop) ? options[prop] : defaultValue;
}
