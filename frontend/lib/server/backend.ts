import "server-only";
import { ApiErrorResponse } from "@/lib/types";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:8080";

export class BackendApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function backendBaseUrl() {
  return process.env.BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL;
}

function devAuthEnabled() {
  return process.env.DEV_AUTH_ENABLED !== "false";
}

function authHeaders(): Record<string, string> {
  if (!devAuthEnabled()) {
    return {};
  }

  return {
    "X-User-Id": process.env.DEV_USER_ID ?? "usr_123",
    "X-User-Name": process.env.DEV_USER_NAME ?? "Alex Johnson",
    "X-User-Role": process.env.DEV_USER_ROLE ?? "user",
  };
}

function mergeHeaders(headers?: HeadersInit, includeJsonContentType = false) {
  const merged = new Headers(authHeaders());

  if (headers) {
    const incoming = new Headers(headers);
    incoming.forEach((value, key) => merged.set(key, value));
  }

  if (includeJsonContentType) {
    merged.set("Content-Type", "application/json");
  }

  return merged;
}

export async function fetchBackendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    headers: mergeHeaders(init?.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    let errorCode = "UNKNOWN_ERROR";
    let message = `Backend request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      errorCode = payload.code;
      message = payload.message;
    } catch {
      // Keep fallback error.
    }

    throw new BackendApiError(response.status, errorCode, message);
  }

  return (await response.json()) as T;
}

export async function proxyBackend(request: Request, path: string, method: string) {
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  const response = await fetch(`${backendBaseUrl()}${path}`, {
    method,
    headers: mergeHeaders(undefined, true),
    body,
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
