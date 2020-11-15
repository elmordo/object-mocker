import {CommonReport} from "./report";
import {Call, PropertyGet, PropertySet} from "./types";


describe("Report", () => {
  let report: CommonReport;

  beforeEach(() => {
    report = new CommonReport();
  });

  it("should be empty after creation", () => {
    expect(report.getHistory().length).toBe(0);
    expect(report.isCalled()).toBe(false);
  });

  describe(("when is empty"), () => {
    it("should raise error when lastCall() is called", () => {
      expect(() => report.lastCall()).toThrow();
    });
  });

  describe("containing records", () => {
    let get1: PropertyGet, get2: PropertyGet;
    let set1: PropertySet, set2: PropertySet;
    let call1: Call, call2: Call, call3: Call;

    beforeEach(() => {
      get1 = {
        type: "get",
        property: "prop1",
        value: "val1",
        wasDefined: true
      }
      get2 = {
        type: "get",
        property: "prop2",
        value: "val2",
        wasDefined: false
      }
      set1 = {
        type: "set",
        property: "prop1",
        value: "val3",
        oldValue: "val1",
        created: false
      };
      set2 = {
        type: "set",
        property: "prop2",
        value: "val4",
        oldValue: undefined,
        created: true
      };
      call1 = {
        type: "apply",
        arguments: ["foo", 1],
        returnValue: "var"
      }
      call2 = {
        type: "apply",
        arguments: ["foo", 1, "bar"],
        returnValue: "var"
      }
      call3 = {
        type: "apply",
        arguments: [],
        returnValue: null
      }
      report.addAccessRecord(get1);
      report.addAccessRecord(get2);
      report.addAccessRecord(set1);
      report.addAccessRecord(set2);
      report.addAccessRecord(call1);
      report.addAccessRecord(call2);
      report.addAccessRecord(call3);
    });

    it("should be marked as called", () => {
      expect(report.isCalled()).toBeTrue();
    });

    it("should has last call", () => {
      expect(report.lastCall()).toBe(call3);
    });

    it("should has call records", () => {
      expect(report.getCalls()).toEqual([call1, call2, call3]);
    });

    it("should have property access", () => {
      expect(report.getPropertyAccess("prop1")).toEqual([get1, set1]);
    });

    it("should have gets", () => {
      expect(report.getPropertyGets()).toEqual([get1, get2]);
    });

    it("should have sets", () => {
      expect(report.getPropertySets()).toEqual([set1, set2]);
    });
  });
});
