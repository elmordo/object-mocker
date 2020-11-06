

export interface MockUsageReport {

}


export interface MockHandler extends ProxyHandler<any> {
  readonly report: MockUsageReport;
}
