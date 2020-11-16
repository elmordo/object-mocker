# ObjectMocker

The mock object library inspired by Python's [mock](https://pypi.org/project/mock/) implemented by Proxy objects.

## How to install

```shell script
npm install object-mocker
```

## How to use

```typescript
import {mock, getRegistry, getDeepChildHandler} from "object-mocker"; import {afterEach} from "selenium-webdriver/testing";

function getValueFromSource(source) {
    return source.loadValue();
}

const source = mock();
const result = getValueFromSource(source);

afterEach(() => {
    // clear registry after each test
    getRegistry().clear();
})

expect(result).toBe(getDeepChildHandler(source, "loadValue").report.getLastCall().returnValue);

// clear registry after test
getRegistry().clear();
```

### Observation change the observed object!

Use only specialized functions to get nested mock objects instead of direct access by a mock object! Accessing a nested object directly create new history records and this can break test expectations.

### Bad approach

```typescript
import {mock, getRegistry} from "object-mocker";
const myMock = mock();

const value = myMock.child.value;

// was child accessed?
const registry = getRegistry();

expect(registry.getHandlerByObject(myMock.child).filter(r => r.type == "get" && r.property == "value").length).toBe(1)
// WRONG - GETTING THE HANDLER THIS WAY CAUSE CREATION OF NEW ACCESS RECORD! 
```

### Good approach

```typescript
import {mock, getRegistry, getDeepChildHandler} from "object-mocker";
const myMock = mock();

const value = myMock.child.value;

// was child accessed?
const registry = getRegistry();

expect(getDeepChildHandler(myMock, "child").filter(r => r.type == "get" && r.property == "value").length).toBe(1)
// OK - THERE IS ONLY ONCE RECORD
```

## Important types

* `NoEmulatedPrototype` (`Symbol`) - declare no prototype emulation for `instanceof` operator.
* `ResultValueFactory` (`(args: any[], handler: Handler) => any`) - signature of factories used for making results of function calls and the `new` operator.
* `Handler` - manage actions done on mock object.
* `Registry` - store pairs of mock objects and their handlers.
* `Report` - hold information about mock object access (get property, set property, ...)

## Mock objects

The mock objects are create by the `mock(options?: MockOptions)` function. This function has one optional argument. This argument contains configuration of the mock objects.

The `MockOptions` object contains only one field at this time. This field is the `handlerOptions` containing partial configuration of the `Handler` class.

## Handlers

Handlers are responsible for storing usage reports and handling actions done on mock objects.

### Configuration

Configuration of Handler is done by the `CommonHandlerOptions` interface: 

* `target` (`any?`) - target object used as prototype. Default is a `Function` instance.
* `registry` (`Registry`) - the registry where to store child objects.
* `returnValueFactory` (`ResultValueFactory`) - factory used for return value when object is called as function.
* `instanceFactory` (`ResultValueFactory`) - factory used for create "instance" when object is used with the `new` operator.
* `emulatedPrototype` (`any`|`NoEmulatedPrototype`) - prototype used for emulation of `instanceof` operator.
* `parent` (`Handler?`) - handler which created this handler.
* `useAutoCreate` (`boolean`) - if true, attempt to access undefined property create new mock object and set it to this property. The `undefined` value is returned otherwise. 

### Value factories

When mock object is called as a function or used as a constructor by the `new` operator, return value must be generated. For this purpose there are some built in value generator factories:

* `makeUniqueFactory()` - make factory returning unique mock object each time called.
* `makeSingletonFactory()` - make factory returning new value the first time its called and then always return this value.

For custom generators see value generator signature above.

## Registry

Pairs of handlers and mock objects are stored in a registry. The `Registry` API is:

* `clear(): void` - clear all records in registry.
* `getObjectByHandler(handler: Handler): any` - get mock object paired with given handler.
* `getHandlerByObject(obj: any): Handler` - get handler paired with given object.
* `register(obj: any, handler: Handler): void` - register a new pair of an object and a handler.
* `getObjects(): any[]` - get all registered objects.
* `getHandlers(): any[]` - get all registered handlers.

### Registry related functions

* `getRegistry(): Registry` - get an active registry (there is always built in registry set in default).
* `setRegistry(registry: Registry): void` - set new active registry.

## Reports

Actions, done on a mock object, are stored in reports. Following table shows observed actions and collected information:

| Action | Record type |
| ------ | ----------- |
| get property | `PropertyGet` |
| set property | `PropertySet` |
| delete | `PropertyDelete` |
| call as function | `Call` |
| use as construction (the `new` operator) | `Construct` |

### Report's methods

* `getHistory()` - return all usage records.
* `isCalled()` - return true if mock object was called at least once, false otherwise.
* `getLastCall()` - return last `Call` record or throw an Error if no call was performed.
* `getCalls()` - return list of all the `Call` records.
* `getPropertyGets()` - return list of all `PropertyGet` records.
* `getPropertySets()` - return list of all `PropertySet` records.
* `getPropertyAccess(propName: string)` - return all records of the property.
* `filter(pred: (record: ObjectAccess) -> bool)` - apply a custom filter to the history of a mock object. 
* `clear()` - remove all records from a mock object's history.

### `PropertyGet`

* `type` (`str`) - be always the `get`
* `property` (`str`) - name of the property
* `value` (`any`) - value returned by property
* `wasDefined` (`boolean`) - true if value was defined, false otherwise

### `PropertySet`

* `type` (`str`) - be always the `set`
* `property` (`str`) - name of the property
* `value` (`any`) - new value of the property 
* `oldValue` (`any`) - old value of the property
* `created` (`boolean`) - true if property was not defined before assignment, false otherwise

### `PropertyDelete`

* `type` (`str`) - be always the `delete`
* `property` (`str`) - name of the deleted property

### `Call`

* `type` (`str`) - be always the `call`
* `arguments` (`any[]`) - call arguments
* `returnValue` (`any`) - value returned by the call

### `Construct`

* `type` (`str`) - be always the `construct`
* `arguments` (`any[]`) - constructor call arguments

### Helper functions

* `getDeepChildHandler(obj: any, path: string, autoCreate: boolean=true): Handler` - get handler of the nested object. If `autoCreate` is true and handler is missing, the there is missing part of path, this part is created automatically.
Example: `const nestedHandler(myMock, "child.childOfChild")` 
