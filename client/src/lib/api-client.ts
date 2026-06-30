const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

import { queuePayment, getQueuedPayments, deleteQueuedPayment } from './offline-queue';

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
  const config: RequestInit = {
    method: data ? "POST" : "GET",
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      "Content-Type": data ? "application/json" : "",
      ...(customHeaders as Record<string, string>),
    },
    ...customConfig,
  };

  if (config.method === "GET") {
    delete config.body;
    delete (config.headers as Record<string, string>)["Content-Type"];
  }

  // Handle Offline Queueing for Payments
  if (endpoint === '/payments' && config.method === 'POST') {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('App is offline. Queuing payment...');
      await queuePayment(data);
      return { 
        success: false, 
        error: "Offline — payment queued",
        code: "OFFLINE_QUEUED"
      };
    }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      // Network error occurred
      if (endpoint === '/payments' && config.method === 'POST') {
        console.log('Fetch failed (offline). Queuing payment...');
        await queuePayment(data);
        return { 
          success: false, 
          error: "Offline — payment queued",
          code: "OFFLINE_QUEUED"
        };
      }
      return { success: false, error: "Network error. Please check your connection." };
    }
    throw err;
  }

  const isAuthEndpoint = endpoint.startsWith("/auth/");

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

// Background sync function
export const syncOfflineQueue = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  
  const queued = await getQueuedPayments();
  if (queued.length === 0) return;

  console.log(`Syncing ${queued.length} offline payments...`);
  
  for (const item of queued) {
    try {
      const res = await apiClient('/payments', { data: item.payload });
      if (res.success || res.code !== 'OFFLINE_QUEUED') {
        if (item.id) {
          await deleteQueuedPayment(item.id);
        }
      }
    } catch (err) {
      console.error('Failed to sync queued payment:', err);
    }
  }
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online. Triggering sync...');
    syncOfflineQueue();
  });
}
