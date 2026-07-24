const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string; code?: string };

interface FetchOptions extends RequestInit {
  data?: any;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: FetchOptions = {},
): Promise<ApiResponse<T>> {
  // Resolve the actual outgoing body: prefer explicit `data`, but fall back to
  // a raw `body` passed in customConfig (some callers JSON.stringify themselves).
  const rawBody = customConfig.body;
  const hasBody = data !== undefined || rawBody !== undefined;
  const resolvedBody = data !== undefined ? JSON.stringify(data) : rawBody;
  const resolvedMethod = customConfig.method ?? (hasBody ? "POST" : "GET");

  const config: RequestInit = {
    credentials: "include",
    ...customConfig,
    method: resolvedMethod,
    body: resolvedMethod === "GET" ? undefined : resolvedBody,
    headers: {
      ...(resolvedMethod !== "GET" && hasBody ? { "Content-Type": "application/json" } : {}),
      ...(customHeaders as Record<string, string>),
    },
  };

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      return { success: false, error: "Network error. Please check your connection." };
    }
    throw err;
  }

  // Only these endpoints should skip the auto-refresh-and-retry flow: a 401
  // from them means "bad credentials" or "refresh token itself is dead",
  // not "access token expired, please refresh". Everything else under
  // /auth/ (like /auth/me) is a normal protected endpoint and should be
  // retried after a silent refresh, same as any other API call - excluding
  // the whole /auth/ prefix here was why the sidebar/navbar name reverted
  // to "Agent" after the access token expired while the session was still
  // perfectly valid.
  const NO_REFRESH_RETRY = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/accept-invite'];
  const isAuthEndpoint = NO_REFRESH_RETRY.some((p) => endpoint.startsWith(p));

  if (response.status === 401 && !isAuthEndpoint) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshResponse.ok) {
          isRefreshing = false;
          onRefreshed("success");
          // Retry original request
          response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
          isRefreshing = false;
          // Refresh failed, probably need to redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } catch (err) {
        isRefreshing = false;
      }
    } else {
      // Wait for the token to be refreshed
      return new Promise((resolve) => {
        subscribeTokenRefresh(async (token) => {
          if (token === "success") {
            const retryResponse = await fetch(`${API_URL}${endpoint}`, config);
            resolve(await retryResponse.json());
          } else {
            resolve({ success: false, error: "Token refresh failed" });
          }
        });
      });
    }
  }

  try {
    const json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.error || "API Request failed", code: json.code };
    }
    return json as ApiResponse<T>;
  } catch (error) {
    return { success: false, error: "Invalid JSON response from server" };
  }
}
