type ApiRequestInit = RequestInit & {
  suppressAuthExpired?: boolean;
  suppressApiIssueLogging?: boolean;
};

/** Structured API failure (4xx/5xx JSON from backend). */
export type ApiErrorPayload = Record<string, unknown> & {
  error?: string;
  code?: string;
  message?: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly payload: ApiErrorPayload;

  constructor(message: string, statusCode: number, payload: ApiErrorPayload = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

class ApiClient {
  private pendingGets = new Map<string, Promise<unknown>>();

  private notifySessionExpired(message: string, path: string) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("admin:auth-expired", {
        detail: { message, path },
      }),
    );
  }

  private logApiIssue(status: number, path: string, details: unknown) {
    const prefix = `[API Error ${status}] ${path}:`;
    if (status >= 500) {
      console.error(prefix, details);
      return;
    }
    console.warn(prefix, details);
  }

  private fallbackMessage(status: number): string {
    if (status === 401) {
      return "Session expired. Please sign in again.";
    }
    if (status === 429) {
      return "Too many requests. Please try again later.";
    }
    if (status >= 500) {
      return "Server is temporarily unavailable. Please try again.";
    }
    return "Request failed. Please try again.";
  }

  async fetch<T>(path: string, options?: ApiRequestInit): Promise<T> {
    const method = options?.method ?? "GET";
    const { suppressAuthExpired, ...requestOptions } = options ?? {};
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...requestOptions.headers,
    };

    const isPublicPath =
      path === "/auth/login" ||
      path === "/auth/logout";

    const suppressApiIssueLogging = Boolean(requestOptions.suppressApiIssueLogging);
    delete requestOptions.suppressApiIssueLogging;

    let res: Response;

    try {
      res = await fetch(`/api${path}`, {
        ...requestOptions,
        method,
        headers,
        credentials: requestOptions.credentials ?? "include",
        ...(method === "GET" && requestOptions.cache == null ? { cache: "no-store" } : {}),
      });
    } catch (networkErr) {
      if (networkErr instanceof DOMException && networkErr.name === "AbortError") {
        throw networkErr;
      }
      const msg =
        networkErr instanceof Error ? networkErr.message : String(networkErr);
      throw new Error(
        msg.includes("ECONNREFUSED") || msg.includes("fetch failed")
          ? "Cannot reach the server. Please check if the backend is running."
          : `Network error: ${msg}`,
      );
    }

    let text = "";
    try {
      text = await res.text();
    } catch {
      if (!res.ok) {
        const fb = this.fallbackMessage(res.status);
        throw new ApiError(fb, res.status, {});
      }
    }

    if (!res.ok) {
      const suppressLogging =
        suppressApiIssueLogging || Boolean(suppressAuthExpired && res.status === 401);
      const { message, payload } = this.parseErrorFromBody(
        res.status,
        text,
        path,
        suppressLogging,
      );

      if (
        res.status === 401 &&
        !isPublicPath &&
        !suppressAuthExpired
      ) {
        this.notifySessionExpired(message, path);
      }

      throw new ApiError(message, res.status, payload);
    }

    if (!text || !text.trim()) {
      return {} as T;
    }

    if (text.trimStart().startsWith("<")) {
      return {} as T;
    }

    try {
      const json = JSON.parse(text) as { data?: T } & T;
      return json.data ?? (json as T);
    } catch {
      return {} as T;
    }
  }

  private parseErrorFromBody(
    status: number,
    text: string,
    path: string,
    suppressLogging: boolean,
  ): { message: string; payload: ApiErrorPayload } {
    const fallback = this.fallbackMessage(status);
    const emptyPayload = {} as ApiErrorPayload;

    if (!text || !text.trim()) {
      if (!suppressLogging) {
        this.logApiIssue(status, path, "Empty response body");
      }
      return { message: fallback, payload: emptyPayload };
    }

    if (text.trimStart().startsWith("<")) {
      if (!suppressLogging) {
        this.logApiIssue(status, path, "Received HTML instead of JSON");
      }
      const msg =
        status === 502 || status === 503
          ? "Server is temporarily unavailable. Please try again."
          : `Server error (HTTP ${status}).`;
      return { message: msg, payload: emptyPayload };
    }

    let errorData: ApiErrorPayload;
    try {
      errorData = JSON.parse(text) as ApiErrorPayload;
    } catch {
      if (!suppressLogging) {
        this.logApiIssue(status, path, `Non-JSON response: ${text.slice(0, 300)}`);
      }
      return {
        message: text.length <= 200 ? text : fallback,
        payload: emptyPayload,
      };
    }

    if (!errorData || typeof errorData !== "object" || Object.keys(errorData).length === 0) {
      if (!suppressLogging) {
        this.logApiIssue(status, path, "Empty JSON object");
      }
      return { message: fallback, payload: emptyPayload };
    }

    let msg = "";

    const rawMsg = errorData.message;
    if (typeof rawMsg === "string" && rawMsg.trim()) {
      msg = rawMsg.trim();
    } else if (Array.isArray(rawMsg) && rawMsg.length > 0) {
      msg = rawMsg.map(String).join("; ");
    }

    if (!msg) {
      const errField = errorData.error;
      if (typeof errField === "string" && errField.trim()) {
        msg = errField.trim();
      }
    }

    if (!suppressLogging && msg) {
      this.logApiIssue(status, path, errorData);
    }

    if (!msg) {
      msg = fallback;
    }

    if (/missing bearer\s+token/i.test(msg)) {
      msg = "Session expired. Please sign in again.";
    }

    return { message: msg, payload: errorData };
  }

  post<T>(path: string, body: unknown, options?: ApiRequestInit) {
    return this.fetch<T>(path, { ...options, method: "POST", body: JSON.stringify(body) });
  }

  get<T>(path: string, options?: ApiRequestInit) {
    if (options?.signal) {
      return this.fetch<T>(path, { ...options, method: "GET" });
    }

    const key = JSON.stringify({
      path,
      headers: options?.headers ?? null,
      cache: options?.cache ?? null,
      credentials: options?.credentials ?? null,
      suppressAuthExpired: options?.suppressAuthExpired ?? false,
    });

    const existing = this.pendingGets.get(key) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const request = this.fetch<T>(path, { ...options, method: "GET" });
    this.pendingGets.set(key, request as Promise<unknown>);

    return request.finally(() => {
      if (this.pendingGets.get(key) === request) {
        this.pendingGets.delete(key);
      }
    });
  }

  delete<T>(path: string, options?: ApiRequestInit) {
    return this.fetch<T>(path, { ...options, method: "DELETE" });
  }

  patch<T>(path: string, body: unknown, options?: ApiRequestInit) {
    return this.fetch<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) });
  }

  put<T>(path: string, body: unknown, options?: ApiRequestInit) {
    return this.fetch<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) });
  }
}

export const api = new ApiClient();
