export const TEST_CONNECTION_PARAM = "test";
export const TEST_DELJIT_REF = "DELJIT-TEST";
export const TEST_TRADING_PARTNER = "Demo-Partner";
export const TEST_BUYER_NAME = "Demo Partner";
export const TEST_FACILITY = "CASA-GRANDE-AZ";

export function isTestConnectionSearch(searchParams: URLSearchParams): boolean {
  return searchParams.get(TEST_CONNECTION_PARAM) === "1";
}

export function testConnectionHref(path: string): string {
  const url = new URL(path, "https://local.invalid");
  url.searchParams.set(TEST_CONNECTION_PARAM, "1");
  return `${url.pathname}?${url.searchParams.toString()}`;
}
