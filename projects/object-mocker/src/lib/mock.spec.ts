import {getDeepChildHandler, getRegistry, mock} from "./mock";
import {PropertyGet} from "./types";

describe("mock objects", () => {
  it("should be able to create complex object structure and store history of creation", function () {
    const root = mock();
    const resultOfDeepChildCall = root.child.deepChild()
    const registry = getRegistry();
    const rootHandler = registry.getHandlerByObject(root);
    const deepChildHandler = getDeepChildHandler(root, "child.deepChild");

    expect(rootHandler.report.getHistory() as PropertyGet[]).toEqual([{type: "get", wasDefined: false, value: rootHandler.target.child, property: "child"}]);
    expect(deepChildHandler.report.isCalled()).toBeTrue();
    expect(deepChildHandler.report.getHistory().length).toBe(1);
    expect(deepChildHandler.report.getLastCall().returnValue).toBe(resultOfDeepChildCall);
  });
});
