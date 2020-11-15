import {Call, Report, ObjectAccess, PropertyAccess, PropertyGet, PropertyName, PropertySet} from "./types";


export class CommonReport implements Report {

  private history: ObjectAccess[] = [];

  private called = false;

  addAccessRecord(record: ObjectAccess): void {
    switch (record.type) {
      case "apply":
        this.called = true;
        break;
    }
    this.history.push(record);
  }

  clear(): void {
    this.history = [];
  }

  filter(predicate: (report: ObjectAccess) => boolean): ObjectAccess[] {
    return this.history.filter(predicate);
  }

  getCalls(): Call[] {
    return this.filter(r => r.type == "apply") as Call[];
  }

  getHistory(): ObjectAccess[] {
    return this.history;
  }

  getPropertyAccess(property: PropertyName): PropertyAccess[] {
    return this.filter(r => {
      return r.hasOwnProperty("property") && (r as PropertyAccess).property == property;
    }) as PropertyAccess[];
  }x

  getPropertyGets(): PropertyGet[] {
    return this.filter(r => r.type == "get") as PropertyGet[];
  }

  getPropertySets(): PropertySet[] {
    return this.filter(r => r.type == "set") as PropertySet[];
  }

  isCalled(): boolean {
    return this.called;
  }

  getLastCall(): Call {
    if (!this.called) {
      throw new Error("Object was not called.");
    }

    return this.getCalls().pop();
  }

}
