/**
 * Centralized API Client for BIS Parakh
 * Connects directly to Parakh FastAPI backend.
 * Provides unified request handling, auth tokens, multipart uploads, and error extraction.
 */

const RAW_API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'https://bis.hizru.me/api/v1';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export const AUTH_TOKEN_KEY = 'parakh_token';

export class ApiError extends Error {
  status: number;
  code?: string;
  correlationId?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, correlationId?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
    this.details = details;
  }
}

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    authToken = stored;
    return stored;
  }
  return authToken;
};

let isHandling401 = false;

export const handleUnauthorized = () => {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    if (!isHandling401) {
      isHandling401 = true;
      if (window.location.pathname !== '/login') {
        window.history.pushState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      setTimeout(() => {
        isHandling401 = false;
      }, 1000);
    }
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const currentToken = getAuthToken();
  if (currentToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  // If body is not FormData and not already specified, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      let errorCode: string | undefined;
      let correlationId: string | undefined;
      let errorDetails: unknown = undefined;

      try {
        const errorJson = await response.json();
        // 1. Backend standard error envelope: { error: { code, message, correlation_id, details } }
        if (errorJson?.error && typeof errorJson.error === 'object') {
          if (errorJson.error.message && typeof errorJson.error.message === 'string') {
            errorMessage = errorJson.error.message;
          }
          errorCode = errorJson.error.code;
          correlationId = errorJson.error.correlation_id || errorJson.error.request_id;
          errorDetails = errorJson.error.details;
        } else if (errorJson?.detail) {
          // FastAPI default error envelope
          if (typeof errorJson.detail === 'string') {
            errorMessage = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            errorMessage = errorJson.detail
              .map((d: { msg?: string } | unknown) => (typeof d === 'object' && d !== null && 'msg' in d ? String(d.msg) : JSON.stringify(d)))
              .join(', ');
            errorDetails = errorJson.detail;
          } else {
            errorMessage = JSON.stringify(errorJson.detail);
          }
        } else if (errorJson?.message && typeof errorJson.message === 'string') {
          errorMessage = errorJson.message;
        }
      } catch {
        // Fallback to HTTP status text when response body is not JSON
      }

      if (!correlationId) {
        correlationId = response.headers.get('x-correlation-id') || response.headers.get('x-request-id') || undefined;
      }

      // Handle 401 Unauthorized for authenticated requests (exclude login credential check)
      if (response.status === 401 && !cleanEndpoint.endsWith('/auth/login')) {
        handleUnauthorized();
      }

      throw new ApiError(errorMessage, response.status, errorCode, correlationId, errorDetails);
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your network connection and retry.', 408, 'TIMEOUT');
    }
    const message = (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string')
      ? err.message
      : 'Unable to connect to BIS Parakh backend service.';
    throw new ApiError(
      message,
      0,
      'NETWORK_ERROR'
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, params?: object): Promise<T> => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params as Record<string, unknown>).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) query = `?${qs}`;
    }
    return request<T>(`${endpoint}${query}`, { method: 'GET' });
  },

  post: <T, B = unknown>(endpoint: string, body?: B, isFormData: boolean = false): Promise<T> => {
    let payload: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (isFormData || body instanceof FormData) {
        payload = body as unknown as FormData;
      } else {
        payload = JSON.stringify(body);
      }
    }
    return request<T>(endpoint, {
      method: 'POST',
      body: payload,
    });
  },

  put: <T, B = unknown>(endpoint: string, body?: B): Promise<T> => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
