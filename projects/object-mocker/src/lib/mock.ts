import {MockRegistry} from "./registry";
import {Registry} from "./types";
import {CommonHandler, CommonHandlerOptions, NoEmulatedPrototype} from "./handler";
import {makeSingletonFactory, makeUniqueFactory} from "./return-value-factories";

/**
 * default registry used for managing mock objects and handlers
 */
export const defaultRegistry: Registry = new MockRegistry();

/**
 * internal state of current registry
 */
let currentRegistry = defaultRegistry;


/**
 * set new registry to use
 * @param registry
 */
export function setRegistry(registry: Registry): void {
  currentRegistry = registry;
}

/**
 * get currently used registry
 */
export function getRegistry(): Registry {
  return currentRegistry;
}

/**
 * make new mock objects
 * @param options options used for mock object initialization
 */
export function mock(options?: MockOptions): any {
  const handlerOptions = extractHandlerOptions(options || {});
  const handler = new CommonHandler(handlerOptions);
  const proxy = new Proxy(handler.target, handler);
  getRegistry().register(proxy, handler);
  return proxy;
}

/**
 * object interface used for mock objects initial configuration
 */
export interface MockOptions {
  /**
   * handler configuration
   */
  handlerOptions?: Partial<CommonHandlerOptions>
}

/**
 * extract options for handler creation
 * @param options mock object options.
 */
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

/**
 * if property `prop` is defined on `options`, return its value, return `defaultValue` otherwise
 * @param options object with options
 * @param prop property name
 * @param defaultValue default value
 */
function getPropertyOrDefault<T>(options: T, prop: keyof T, defaultValue: any): any {
  return options.hasOwnProperty(prop) ? options[prop] : defaultValue;
}
