/**
 * property name type
 */
export type PropertyName = string;

/**
 * type of access record
 */
export type AccessType = "apply"|"get"|"set"|"delete"|"construct";

/**
 * common object access report record
 */
export interface ObjectAccess {
  /**
   * type of the access
   */
  type: AccessType;
}

/**
 * object as used as constructor by the `new` operator
 */
export interface Construct extends ObjectAccess {
  type: "construct";
  /**
   * constructor arguments
   */
  arguments: any[];
}

/**
 * object was called as function
 */
export interface Call extends ObjectAccess {
  type: "apply";
  /**
   * call arguments
   */
  arguments: any[];
  /**
   * returned value
   */
  returnValue: any;
}

/**
 * common property access report record
 */
export interface PropertyAccess extends ObjectAccess {
  /**
   * name of the accessed property
   */
  property: PropertyName;
}

/**
 * property was deleted
 */
export interface PropertyDelete extends PropertyAccess {
  type: "delete"
}

/**
 * property was read
 */
export interface PropertyGet extends PropertyAccess  {
  type: "get";
  /**
   * returned value of the property
   */
  value: any;
  /**
   * true if property was defined at time of access, false otherwise
   */
  wasDefined: boolean;
}

/**
 * new value was set to the property
 */
export interface PropertySet extends PropertyAccess{
  type: "set";
  /**
   * new value of the property
   */
  value: any;
  /**
   * old value of the property
   */
  oldValue: any;
  /**
   * true if property was created by assign, false otherwise
   */
  created: boolean;
}

/**
 * report of mock usage
 */
export interface Report {
  /**
   * add one record to history of object usage.
   * @param record record instance to be added
   */
  addAccessRecord(record: ObjectAccess): void;
  /**
   * get complete history of the access
   */
  getHistory(): ObjectAccess[];
  /**
   * true if object was called as function once at least
   */
  isCalled(): boolean;
  /**
   * get the last call
   * @throws Error property was not called
   */
  getLastCall(): Call;
  /**
   * get list of all call reports of the object
   */
  getCalls(): Call[];
  /**
   * get list of all property get accesses
   */
  getPropertyGets(): PropertyGet[];
  /**
   * get list of all property set accesses
   */
  getPropertySets(): PropertySet[];
  /**
   * get list of access to property
   * @param property name of the property
   */
  getPropertyAccess(property: PropertyName): PropertyAccess[];
  /**
   * shorthand to filter reports.
   * @param predicate
   */
  filter(predicate: (report: ObjectAccess) => boolean): ObjectAccess[];
  /**
   * clear usage history
   */
  clear(): void;
}

/**
 * define return value policy for a handler
 */
export type ResultValueFactory = (args: any[], handler: Handler) => any;

/**
 * handler of the mock object
 */
export interface Handler extends ProxyHandler<any> {
  /**
   * mock object access report
   */
  readonly report: Report;
  /**
   * the registry
   */
  readonly registry: Registry;
  /**
   * prototype matched by instanceof
   * default is Object.prototype
   */
  emulatedPrototype: any;
  /**
   * factory used when the `apply` is trapped
   */
  returnValueFactory: ResultValueFactory;
  /**
   * factory used when the `construct` is trapped
   */
  instanceFactory: ResultValueFactory;
  /**
   * the target object.
   */
  readonly target: any;
  /**
   * parent handler
   */
  parent?: Handler

  /**
   * make child handler with parent set to `this` instance
   */
  makeChild(): Handler;
}

/**
 * store objects and associated handlers
 */
export interface Registry {
  /**
   * register new object - handler association
   * @param obj object
   * @param handler handler instance
   */
  register(obj: any, handler: Handler): void;
  /**
   * clear all registered associations
   */
  clear();
  /**
   * get object associated to the handler.
   * @param handler instance of the handler
   * @throws Error the handler is not associated to any object
   */
  getObjectByHandler(handler: Handler): any;
  /**
   * get handler associated to the object
   * @param obj object associated to the handler
   * @throws Error the object is not associated to any handler
   */
  getHandlerByObject(obj: any): Handler;
  /**
   * get list of all objects
   */
  getObjects(): any[];
  /**
   * get list of all handlers
   */
  getHandlers(): Handler[];
}
