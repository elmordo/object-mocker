import {Handler, Registry, ResultValueFactory} from "./types";
import {makeSingletonFactory, makeUniqueFactory} from "./return-value-factories";
import {MockRegistry} from "./registry";
import {CommonHandler} from "./handler";


describe("return value factory", () => {
  let factory: ResultValueFactory;
  let handler: Handler;
  let registry: Registry;

  beforeEach(() => {
    registry = new MockRegistry();
    handler = new CommonHandler({
      registry,
      returnValueFactory: () => null,
      instanceFactory: () => null,
      emulatedPrototype: Object.prototype,
      useAutoCreate: true
    });
  });

  describe("makeUniqueFactory", () => {
    beforeEach(() => {
      factory = makeUniqueFactory();
    });

    it("should always return unique value", () => {
      const val1 = factory([], handler);
      const val2 = factory([], handler);
      expect(val1).not.toBe(val2);
    });

    it("should register new handler into registry", function () {
      const val1 = factory([], handler);
      expect(registry.getHandlerByObject(val1)).toBeTruthy();
    });
  });

  describe("makeSingletonFactory", () => {
    beforeEach(() => {
      factory = makeSingletonFactory();
    });

    it("should always return same value", () => {
      const val1 = factory([], handler);
      const val2 = factory([], handler);
      expect(val1).toBe(val2);
    });

    it("should register new handler into registry", function () {
      const val1 = factory([], handler);
      expect(registry.getHandlerByObject(val1)).toBeTruthy();
    });
  });
});
