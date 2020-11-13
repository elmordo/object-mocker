import {MockRegistry} from "./registry";


describe("Registry", () => {
  let registry: MockRegistry;

  beforeEach(() => {
    registry = new MockRegistry();
  });

  describe("with some data", () => {
    let handler1, handler2, handler3;
    let object1, object2, object3;

    beforeEach(() => {
      handler1 = {h:1};
      handler2 = {h:2};
      handler3 = {h:3};
      object1 = {o:1};
      object2 = {o:2};
      object3 = {o:3};

      registry.register(object1, handler1);
      registry.register(object2, handler2);
    });

    it("should contains data", () => {
      expect(registry.getObjects()).toContain(object1);
      expect(registry.getObjects()).toContain(object2);
      expect(registry.getObjects()).not.toContain(object3);
    });

    it("should be empty after clear", () => {
      registry.clear();
      expect(registry.getObjects()).toEqual([]);
      expect(registry.getHandlers()).toEqual([]);
    });

    it("should return correct object for given handler", () => {
      expect(registry.getObjectByHandler(handler1)).toBe(object1);
      expect(registry.getObjectByHandler(handler2)).toBe(object2);
    });

    it("should return correct handler for given object", () => {
      expect(registry.getHandlerByObject(object1)).toBe(handler1);
      expect(registry.getHandlerByObject(object2)).toBe(handler2);
    });

    it("should raise error if handler is not registerer", () => {
      expect(() => registry.getObjectByHandler(handler3)).toThrow();
    })

    it("should raise error if object is not registered", () => {
      expect(() => registry.getHandlerByObject(object3)).toThrow();
    })
  });
});
