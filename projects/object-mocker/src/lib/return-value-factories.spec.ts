import {MockHandler, Registry, ResultValueFactory} from "./types";
import {makeSingletonFactory, makeUniqueFactory} from "./return-value-factories";
import {Handler} from "./handler";
import {MockRegistry} from "./registry";


describe("return value factory", () => {
  let factory: ResultValueFactory;
  let handler: MockHandler;
  let registry: Registry;

  beforeEach(() => {
    registry = new MockRegistry();
    handler = {
      registry
    } as MockHandler;
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
      expect(registry.getHandlerByObject(val1) instanceof Handler).toBeTrue();
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
      expect(registry.getHandlerByObject(val1) instanceof Handler).toBeTrue();
    });
  });
});
