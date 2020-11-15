# ObjectMocker

The mock object library inspired by Python's [mock](https://pypi.org/project/mock/) implemented by Proxy objects.

## Installation

```shell script
npm install object-mocker
```

## Short example

```typescript
import {mock, getRegistry, getDeepChildHandler} from "object-mocker";

function getValueFromSource(source) {
    return source.loadValue();
}

const source = mock();
const result = getValueFromSource(source);

expect(result).toBe(getDeepChildHandler(source, "loadValue").report.getLastCall().returnValue);

// clear registry after test
getRegistry().clear();
```

## Handlers

Handlers are responsible for storing usage reports and handling actions done on mock objects.

### Configuration

target (any?);
registry (Registry);
returnValueFactory (ResultValueFactory);
instanceFactory (ResultValueFactory);
emulatedPrototype (any);
parent (Handler?);
useAutoCreate (boolean)

## Reports

Actions, done on a mock object, are stored in reports. Following table shows observed actions and collected information:

| Action | Record type |
| ------ | ----------- |
| get property | `PropertyGet` |
| set property | `PropertySet` |
| delete | `PropertyDelete` |
| apply | `Call` |
| construct | `Construct` |

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
