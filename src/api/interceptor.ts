import { getApiBaseUrl } from "@/api/config";
import { clearAuthSession, getAccessToken } from "@/lib/auth";
import { paths } from "@/paths";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type HttpRequestConfig = Omit<RequestInit, "method" | "body"> & {
  method?: HttpMethod;
  body?: BodyInit | Record<string, unknown> | null;
  skipAuth?: boolean;
  skipAuthRedirect?: boolean;
};

type RequestContext = HttpRequestConfig & {
  path: string;
  url: string;
};

type RequestInterceptor = (
  context: RequestContext
) => Promise<RequestContext> | RequestContext;

type ResponseInterceptor = (
  response: Response,
  context: RequestContext
) => Promise<Response> | Response;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

function isJsonBody(body: HttpRequestConfig["body"]): body is Record<string, unknown> {
  return (
    body != null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ReadableStream)
  );
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function serializeBody(body: HttpRequestConfig["body"]): BodyInit | undefined {
  if (body == null) return undefined;
  if (isJsonBody(body)) return JSON.stringify(body);
  return body;
}

async function authRequestInterceptor(context: RequestContext): Promise<RequestContext> {
  if (context.skipAuth) return context;

  const accessToken = getAccessToken();
  const headers = new Headers(context.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return { ...context, headers };
}

async function jsonContentTypeRequestInterceptor(context: RequestContext): Promise<RequestContext> {
  if (!isJsonBody(context.body)) return context;

  const headers = new Headers(context.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return { ...context, headers };
}

async function unauthorizedResponseInterceptor(
  response: Response,
  context: RequestContext
): Promise<Response> {
  if (response.status !== 401 || context.skipAuth || context.skipAuthRedirect) {
    return response;
  }

  clearAuthSession();
  if (typeof window !== "undefined" && window.location.pathname !== paths.login) {
    window.location.assign(paths.login);
  }

  return response;
}

requestInterceptors.push(authRequestInterceptor, jsonContentTypeRequestInterceptor);
responseInterceptors.push(unauthorizedResponseInterceptor);

export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  requestInterceptors.push(interceptor);
}

export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  responseInterceptors.push(interceptor);
}

async function runRequestInterceptors(context: RequestContext): Promise<RequestContext> {
  let current = context;
  for (const interceptor of requestInterceptors) {
    current = await interceptor(current);
  }
  return current;
}

async function runResponseInterceptors(
  response: Response,
  context: RequestContext
): Promise<Response> {
  let current = response;
  for (const interceptor of responseInterceptors) {
    current = await interceptor(current, context);
  }
  return current;
}

async function request(path: string, config: HttpRequestConfig = {}): Promise<Response> {
  const { method = "GET", body, skipAuth, skipAuthRedirect, ...init } = config;
  const url = buildUrl(path);

  let context = await runRequestInterceptors({
    path,
    url,
    method,
    body,
    skipAuth,
    skipAuthRedirect,
    ...init
  });

  const response = await fetch(context.url, {
    ...context,
    method: context.method,
    body: serializeBody(context.body)
  });

  return runResponseInterceptors(response, context);
}

export const http = {
  request,
  get: (path: string, config?: HttpRequestConfig) => request(path, { ...config, method: "GET" }),
  post: (path: string, body?: HttpRequestConfig["body"], config?: HttpRequestConfig) =>
    request(path, { ...config, method: "POST", body }),
  patch: (path: string, body?: HttpRequestConfig["body"], config?: HttpRequestConfig) =>
    request(path, { ...config, method: "PATCH", body }),
  put: (path: string, body?: HttpRequestConfig["body"], config?: HttpRequestConfig) =>
    request(path, { ...config, method: "PUT", body }),
  delete: (path: string, config?: HttpRequestConfig) =>
    request(path, { ...config, method: "DELETE" })
};

/** @deprecated Use `http.request` from `@/api` instead. */
export const apiFetch = request;
