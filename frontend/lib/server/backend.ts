import "server-only";
import { cookies } from "next/headers";
import { ApiErrorResponse } from "@/lib/types";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:8080";
export const BACKEND_UNAVAILABLE_CODE = "BACKEND_UNAVAILABLE";

export class BackendApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function backendUnavailableError() {
  return new BackendApiError(
    503,
    BACKEND_UNAVAILABLE_CODE,
    "The frontend could not reach the backend service."
  );
}

function backendBaseUrl() {
  const configured = readEnv("BACKEND_BASE_URL") ?? DEFAULT_BACKEND_BASE_URL;
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

function readEnv(name: string) {
  return Reflect.get(process.env, name) as string | undefined;
}

async function incomingCookiesHeader() {
  const cookieStore = await cookies();
  const serialized = cookieStore.toString();
  return serialized ? serialized : null;
}

async function mergeHeaders(
  headers?: HeadersInit,
  includeJsonContentType = false,
  options?: {
    includeIncomingCookies?: boolean;
  }
) {
  const merged = new Headers();

  if (options?.includeIncomingCookies) {
    const cookieHeader = await incomingCookiesHeader();
    if (cookieHeader) {
      merged.set("Cookie", cookieHeader);
    }
  }

  if (headers) {
    const incoming = new Headers(headers);
    incoming.forEach((value, key) => merged.set(key, value));
  }

  if (includeJsonContentType) {
    merged.set("Content-Type", "application/json");
  }

  return merged;
}

export async function fetchBackendJson<T>(
  path: string,
  init?: RequestInit,
  options?: {
    includeIncomingCookies?: boolean;
  }
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${backendBaseUrl()}${path}`, {
      ...init,
      headers: await mergeHeaders(init?.headers, false, options),
      cache: "no-store",
    });
  } catch {
    throw backendUnavailableError();
  }

  if (!response.ok) {
    let errorCode = "UNKNOWN_ERROR";
    let message = `Backend request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      errorCode = payload.code;
      message = payload.message;
    } catch {
      // Preserve the generic transport error when the response body is not JSON.
    }

    throw new BackendApiError(response.status, errorCode, message);
  }

  return (await response.json()) as T;
}

export async function proxyBackend(
  request: Request,
  path: string,
  method: string
) {
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();
  const requestHeaders = new Headers(request.headers);
  const mergedHeaders = await mergeHeaders(undefined, !!body);
  const cookieHeader = requestHeaders.get("cookie");
  if (cookieHeader) {
    mergedHeaders.set("Cookie", cookieHeader);
  }

  let response: Response;

  try {
    response = await fetch(`${backendBaseUrl()}${path}`, {
      method,
      headers: mergedHeaders,
      body,
      cache: "no-store",
    });
  } catch {
    return Response.json(
      {
        code: BACKEND_UNAVAILABLE_CODE,
        message: "The frontend could not reach the backend service.",
      } satisfies ApiErrorResponse,
      {
        status: 503,
      }
    );
  }

  const headers = new Headers();
  const contentType = response.headers.get("Content-Type");
  const setCookie = response.headers.get("set-cookie");
  const location = response.headers.get("location");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (setCookie) {
    headers.set("set-cookie", setCookie);
  }
  if (location) {
    headers.set("location", location);
  }

  const payload = response.status === 204 || response.status === 205
    ? undefined
    : await response.arrayBuffer();

  return new Response(payload, {
    status: response.status,
    headers,
  });
}
