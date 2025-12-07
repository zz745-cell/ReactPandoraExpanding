import { API_BASE_URL } from './config';
import { clearAuth, getRefreshToken, getToken } from '../utils/auth';
import { firebaseLogout, getFirebaseIdToken, isFirebaseEnabled } from '../utils/firebaseAuth';

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

function buildQuery(query) {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function safeParseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Lightweight fetch-based client with interceptor support (Axios-like).
 *
 * Request interceptors: (ctx) => ctx
 * Response interceptors: (res, ctx) => res
 *
 * `ctx` is a mutable object: { baseURL, path, url, method, headers, query, body, auth, signal }
 */
export class HttpInterceptor {
  constructor({ baseURL } = {}) {
    this.baseURL = baseURL || API_BASE_URL;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this._refreshPromise = null;
  }

  addRequestInterceptor(fn) {
    this.requestInterceptors.push(fn);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter((x) => x !== fn);
    };
  }

  addResponseInterceptor(fn) {
    this.responseInterceptors.push(fn);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter((x) => x !== fn);
    };
  }

  async request(path, options = {}) {
    const { payload } = await this.requestRaw(path, options);
    return payload;
  }

  async requestRaw(path, options = {}) {
    const {
      method = 'GET',
      headers = {},
      query,
      body,
      auth = true,
      signal,
      baseURL,
      // internal control flags
      _retry = false,
      _skipRefresh = false,
    } = options;

    const ctx = {
      baseURL: baseURL || this.baseURL,
      path,
      method,
      headers: { ...headers },
      query,
      body,
      auth,
      signal,
      _retry,
      _skipRefresh,
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      // eslint-disable-next-line no-await-in-loop
      const next = await interceptor(ctx);
      if (next) Object.assign(ctx, next);
    }

    const url = joinUrl(ctx.baseURL, ctx.path) + buildQuery(ctx.query);
    ctx.url = url;

    const isFormData =
      typeof FormData !== 'undefined' && ctx.body instanceof FormData;
    const isPlainObject =
      ctx.body &&
      typeof ctx.body === 'object' &&
      !Array.isArray(ctx.body) &&
      !isFormData;

    let finalBody = ctx.body;
    if (isPlainObject && !ctx.headers['Content-Type']) {
      ctx.headers['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(ctx.body);
    }

    const res = await fetch(url, {
      method: ctx.method,
      headers: ctx.headers,
      body:
        ctx.method === 'GET' || ctx.method === 'HEAD' ? undefined : finalBody,
      signal: ctx.signal,
    });

    // Apply response interceptors
    let interceptedRes = res;
    for (const interceptor of this.responseInterceptors) {
      // eslint-disable-next-line no-await-in-loop
      const nextRes = await interceptor(interceptedRes, ctx);
      if (nextRes) interceptedRes = nextRes;
    }

    // Access token expired/invalid: attempt one refresh + retry (auth requests only).
    if (
      interceptedRes.status === 401 &&
      ctx.auth &&
      !ctx._retry &&
      !ctx._skipRefresh &&
      ctx.path !== '/auth/refresh'
    ) {
      const refreshed = await this._refreshAccessToken();
      if (refreshed) {
        return await this.request(path, {
          ...options,
          _retry: true,
        });
      }
      if (isFirebaseEnabled()) {
        try {
          await firebaseLogout();
        } catch {
          // ignore
        }
      } else {
        clearAuth();
      }
      window.location.href = '/login';
    }

    // 204 No Content
    if (interceptedRes.status === 204) {
      return { payload: null, status: interceptedRes.status };
    }

    const contentType = interceptedRes.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await safeParseJson(interceptedRes)
      : await interceptedRes.text().catch(() => null);

    if (!interceptedRes.ok) {
      const message =
        (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
        `Request failed (${interceptedRes.status})`;
      throw new ApiError(message, { status: interceptedRes.status, payload });
    }

    return { payload, status: interceptedRes.status };
  }

  get(path, options) {
    return this.request(path, { ...options, method: 'GET' });
  }
  post(path, body, options) {
    return this.request(path, { ...options, method: 'POST', body });
  }
  put(path, body, options) {
    return this.request(path, { ...options, method: 'PUT', body });
  }
  del(path, options) {
    return this.request(path, { ...options, method: 'DELETE' });
  }

  async _refreshAccessToken() {
    // Firebase flow: force-refresh the ID token (no backend refresh endpoint needed).
    if (isFirebaseEnabled()) {
      try {
        const idToken = await getFirebaseIdToken({ forceRefresh: true });
        if (idToken) {
          localStorage.setItem('AUTH_TOKEN', idToken);
          return true;
        }
      } catch {
        // If Firebase refresh failed, treat as logged out
        try {
          await firebaseLogout();
        } catch {
          // ignore
        }
        return false;
      }
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    if (!this._refreshPromise) {
      this._refreshPromise = (async () => {
        try {
          const data = await this.post(
            '/auth/refresh',
            { refreshToken },
            { auth: false, _skipRefresh: true }
          );
          const accessToken = data?.accessToken || data?.token;
          if (accessToken) {
            localStorage.setItem('AUTH_TOKEN', accessToken);
            if (data?.refreshToken) {
              localStorage.setItem('AUTH_REFRESH_TOKEN', data.refreshToken);
            }
            if (data?.user) {
              localStorage.setItem('AUTH_USER', JSON.stringify(data.user));
            }
            return true;
          }
          return false;
        } catch {
          return false;
        } finally {
          this._refreshPromise = null;
        }
      })();
    }

    return await this._refreshPromise;
  }
}

export const http = new HttpInterceptor({ baseURL: API_BASE_URL });

// ---- Default interceptors (centralized cross-cutting concerns) ----

// Auth header injection
http.addRequestInterceptor((ctx) => {
  if (!ctx.auth) return ctx;
  const token = getToken();
  if (token) {
    ctx.headers.Authorization = `Bearer ${token}`;
  }
  return ctx;
});

// 401/403 handling (logout + redirect)
http.addResponseInterceptor((res, ctx) => {
  if (ctx.auth && res.status === 403) {
    if (isFirebaseEnabled()) {
      // async sign-out (best effort); interceptor can’t be async, so fire-and-forget
      firebaseLogout().catch(() => {});
    } else {
      clearAuth();
    }
    window.location.href = '/login';
  }
  return res;
});


