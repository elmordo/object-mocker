import {CommonHandler, NoEmulatedPrototype} from "./handler";
import {Call, Construct, MockHandler, PropertyDelete, PropertyGet, PropertySet, Registry} from "./types";
import {MockRegistry} from "./registry";


describe("Handler", () => {
  let handler: CommonHandler;
  let registry: Registry;
  let emulatedPrototype;
  let instanceFactory, returnValueFactory;
  let instanceFactoryCalls, returnValueFactoryCalls;

  beforeEach(() => {
    registry = new MockRegistry();
    emulatedPrototype = Symbol();
    instanceFactoryCalls = [];
    returnValueFactoryCalls = [];
    instanceFactory = (args, handler) => {
      const result = {};
      instanceFactoryCalls.push([args, handler, result])
      return result;
    }
    returnValueFactory = (args, handler: CommonHandler) => {
      const result = {};
      returnValueFactoryCalls.push([args, handler, result])
      return result;
    }
    handler = new CommonHandler({
      emulatedPrototype,
      instanceFactory,
      returnValueFactory,
      registry
    });
  });

  it("should be created with arguments from options", () => {
    expect(handler.registry).toBe(registry);
    expect(handler.emulatedPrototype).toBe(emulatedPrototype);
    expect(handler.returnValueFactory).toBe(returnValueFactory);
    expect(handler.instanceFactory).toBe(instanceFactory);
    expect(handler.parent).toBeNull();
  });

  describe("when making child", () => {
    let child: MockHandler;

    beforeEach(() => {
      child = handler.makeChild();
    });

    it("should set itself as parent", () => {
      expect(child.parent).toBe(handler);
    });

    it("should set its own registry", () => {
      expect(child.registry).toBe(handler.registry);
    });

    it("should set its own instance factory", () => {
      expect(child.instanceFactory).toBe(handler.instanceFactory);
    });

    it("should set its own return value factory", () => {
      expect(child.returnValueFactory).toBe(handler.returnValueFactory);
    });

    it("should set emulated prototype to NoEmulatePrototype", () => {
      expect(child.emulatedPrototype).toBe(NoEmulatedPrototype);
    });

    it("should create new target object", () => {
      expect(child.target).not.toBe(handler.target);
    });
  });

  describe("calling the", () => {
    describe("apply", () => {
      it("should call the returnValueFactory and return its result", () => {
        const args = ["foo", "bar"];
        const returnValue = Symbol();
        let callCount = 0;

        handler.returnValueFactory = (a, h) => {
          expect(h).toBe(handler);
          expect(a).toEqual(args);
          ++callCount;
          return returnValue;
        }
        const result = handler.apply({}, handler.target, args);
        expect(result).toBe(returnValue);
        expect(callCount).toBe(1);
      });

      it("should insert record into report", () => {
        const args = ["foo", "var"];
        const returnValue = Symbol();
        handler.returnValueFactory = () => returnValue;

        handler.apply({}, handler.target, args);
        const report: Call = {
          type: "apply",
          returnValue: returnValue,
          arguments: args
        };

        expect(handler.report.getHistory()).toEqual([report]);
      });
    });

    describe("construct", () => {
      it("should call the instance factory", () => {
        const args = ["foo", "xxx"];
        const expectedInstance = Symbol();
        let factoryCallCount = 0;
        handler.instanceFactory = (a, h) => {
          expect(a).toEqual(args);
          expect(h).toBe(handler);
          ++factoryCallCount;
          return expectedInstance;
        }
        const newInstance = handler.construct({}, args, {});
        expect(newInstance).toBe(expectedInstance);
        expect(factoryCallCount).toBe(1);
      });

      it("should insert record to report", () => {
        const args = [1, 2];
        handler.construct({}, args, {});
        const expectedRecord: Construct = {
          type: "construct",
          arguments: args
        };
        expect(handler.report.getHistory()).toEqual([expectedRecord])
      });
    });

    describe("deleteProperty", () => {
      let prop;

      beforeEach(() => {
        prop = "foo";
        handler.target[prop] = 10;
        handler.deleteProperty(handler.target, prop);
      });

      it("should delete property", () => {
        expect(handler.hasOwnProperty(prop)).toBeFalse();
      });

      it("should insert record into report", () => {
        const expectedRecord: PropertyDelete = {
          type: "delete",
          property: prop
        };
        expect(handler.report.getHistory()).toEqual([expectedRecord]);
      });
    })

    describe("set", () => {
      let prop, value;

      beforeEach(() => {
        prop = "property";
        value = "foo";
      });

      describe("on not existing property", () => {
        beforeEach(() => {
          handler.set(handler.target, prop, value, handler.target);
        });

        it("should set the property", () => {
          expect(handler.target[prop]).toEqual(value);
        });

        it("should insert a record into report", () => {
          const expectedReport: PropertySet = {
            type: "set",
            property: prop,
            created: false,
            oldValue: undefined,
            value
          };
          expect(handler.report.getHistory()).toEqual([expectedReport]);
        });
      });

      describe("on existing propery", () => {
        let oldValue;

        beforeEach(() => {
          oldValue = 458;
          handler.target[prop] = oldValue;
          handler.set(handler.target, prop, value, handler.target);
        });

        it("should set the property", () => {
          expect(handler.target[prop]).toEqual(value);
        });

        it("should insert a record into report", () => {
          const expectedRecord: PropertySet = {
            type: "set",
            value,
            oldValue,
            created: true,
            property: prop
          };
          expect(handler.report.getHistory()).toEqual([expectedRecord]);
        });
      });
    });

    describe("get", () => {
      let prop;

      beforeEach(() => {
        prop = "bar";
      });

      describe("on not existing property", () => {
        let val;

        beforeEach(() => {
          val = handler.get(handler.target, prop, undefined);
        });

        it("should return the `undefined`", () => {
          expect(val).toBeUndefined();
        });

        it("should insert a record into the report", () => {
          const expectedReport: PropertyGet = {
            type: "get",
            property: prop,
            wasDefined: false,
            value: undefined
          };
          expect(handler.report.getHistory()).toEqual([expectedReport]);
        });
      });

      describe("on existing propery", () => {
        let val;
        let expectedVal;

        beforeEach(() => {
          expectedVal = Math.random();
          handler.target[prop] = expectedVal;
          val = handler.get(handler.target, prop, undefined);
        });

        it("should return an expected value", () => {
          expect(val).toEqual(expectedVal);
        });

        it("should insert a record into the report", () => {
          const record: PropertyGet = {
            type: "get",
            property: prop,
            value: val,
            wasDefined: true
          };
          expect(handler.report.getHistory()).toEqual([record]);
        });
      });
    });

    describe("getPrototypeOf", () => {
      describe("with defined prototype emulation", () => {
        it("should return emulated prototype", () => {
          expect(handler.getPrototypeOf(handler.target)).toBe(emulatedPrototype);
        });
      });

      describe("with no defined prototype emulation", () => {
        beforeEach(() => {
          handler.emulatedPrototype = NoEmulatedPrototype;
        });

        it("should return prototype of the target object", () => {
          expect(handler.getPrototypeOf(handler.target)).toBe(Object.prototype);
        });
      });
    })
  });
});
