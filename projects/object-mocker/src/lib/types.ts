/**
 * property name type
 */
export type PropertyName = string;


/**
 * common object access report
 */
export interface ObjectAccess {
  /**
   * type of the access
   */
  type: "apply"|"get"|"set";
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
 * common property access report
 */
export interface PropertyAccess extends ObjectAccess {
  /**
   * name of the accessed property
   */
  property: PropertyName;
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
export interface MockUsageReport {
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
  lastCall(): Call;
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
}


/**
 * handler of the mock object
 */
export interface MockHandler extends ProxyHandler<any> {
  /**
   * mock object access report
   */
  readonly report: MockUsageReport;
}


/**
 * store objects and associated handlers
 */
export interface Registry {
  /**
   * get object associated to the handler.
   * @param handler instance of the handler
   * @throws Error the handler is not associated to any object
   */
  getObjectByHandler(handler: MockHandler): any;
  /**
   * get handler associated to the object
   * @param obj object associated to the handler
   * @throws Error the object is not associated to any handler
   */
  getHandlerByObject(obj: any): MockHandler;
  /**
   * get list of all objects
   */
  getObjects(): any[];
  /**
   * get list of all handlers
   */
  getHandlers(): MockHandler[];
}
