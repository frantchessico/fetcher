import fetch, { RequestInit, Headers } from 'node-fetch';

/**
 * Interface for defining the request error format.
 */
export interface RequestError extends Error {
  status?: number;
}

/**
 * Interface for defining the request event format.
 */
export interface RequestEvent<T> {
  type: string;
  payload: T;
}

/**
 * Type definition for event handler functions.
 */
export type EventHandler<T> = (event: RequestEvent<T>) => void;

/**
 * Interface for defining the authentication token format.
 */
interface AuthToken {
  token: string;
}

/**
 * Interface for cache item.
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Type definition for middlewares.
 */
export type Middleware = (options: RequestInit) => RequestInit | Promise<RequestInit>;

/**
 * Main class facilitating HTTP requests with middleware support.
 */
export class Kwatta<T extends AuthToken = AuthToken> {
  private baseURL: string;
  private readonly DEFAULT_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  private authToken?: string;
  private authHeaderName: string = 'Authorization';
  private includeBearerPrefix: boolean = true;
  private rateLimitDelay: number = 1000;
  private lastRequestTimestamp: number = 0;
  private readonly eventHandlers: EventHandler<any>[] = [];
  private cache: Record<string, CacheItem<any>> = {};
  private cacheLifetime: number = 60 * 1000;
  private middlewares: Middleware[] = [];

  /**
   * Constructor for the Kwatta class.
   * @param baseURL The base URL for all requests.
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Sets the authentication token.
   * @param token The authentication token.
   * @param headerName The authentication header name.
   * @param includeBearerPrefix Indicates whether to include the 'Bearer' prefix.
   */
  setAuthToken(token: string, headerName: string = 'Authorization', includeBearerPrefix: boolean = true): void {
    this.authToken = token;
    this.authHeaderName = headerName;
    this.includeBearerPrefix = includeBearerPrefix;
  }

  /**
   * Sets the rate limit delay.
   * @param delay The rate limit delay in milliseconds.
   */
  setRateLimitDelay(delay: number): void {
    this.rateLimitDelay = delay;
  }

  /**
   * Sets the last request timestamp.
   * @param timestamp The timestamp of the last request in milliseconds.
   */
  setLastRequestTimestamp(timestamp: number): void {
    this.lastRequestTimestamp = timestamp;
  }

  /**
   * Sets the cache lifetime.
   * @param lifetime The cache lifetime in milliseconds.
   */
  setCacheLifetime(lifetime: number): void {
    this.cacheLifetime = lifetime;
  }

  /**
   * Adds a middleware to the middleware chain.
   * @param middleware The middleware to be added.
   * @returns This Kwatta instance to allow method chaining.
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Executes an HTTP GET request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async get<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('GET', path, headers, undefined, timeout);
  }

  /**
   * Executes an HTTP POST request.
   * @param path The request path.
   * @param data The request data.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async post<T>(
    path: string,
    data: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('POST', path, headers, JSON.stringify(data), timeout);
  }

  /**
   * Executes an HTTP PUT request.
   * @param path The request path.
   * @param data The request data.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async put<T>(
    path: string,
    data: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('PUT', path, headers, JSON.stringify(data), timeout);
  }

  /**
   * Executes an HTTP PATCH request.
   * @param path The request path.
   * @param data The request data.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async patch<T>(
    path: string,
    data: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('PATCH', path, headers, JSON.stringify(data), timeout);
  }

  /**
   * Executes an HTTP DELETE request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async delete<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('DELETE', path, headers, undefined, timeout);
  }

  /**
   * Executes an HTTP HEAD request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async head<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('HEAD', path, headers, undefined, timeout);
  }

  /**
   * Executes an HTTP OPTIONS request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async options<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('OPTIONS', path, headers, undefined, timeout);
  }

  /**
   * Executes an HTTP CONNECT request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async connect<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('CONNECT', path, headers, undefined, timeout);
  }

  /**
   * Executes an HTTP TRACE request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async trace<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('TRACE', path, headers, undefined, timeout);
  }

  /**
   * Executes an HTTP COPY request.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param timeout Optional request timeout in milliseconds.
   * @returns A promise that resolves with the response data.
   */
  async copy<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('COPY', path, headers, undefined, timeout);
  }

  /**
   * Applies middlewares to the options object.
   * @param options The request options object.
   * @returns A promise that resolves with the modified options.
   */
  private async applyMiddlewares(options: RequestInit): Promise<RequestInit> {
    let modifiedOptions: RequestInit = { ...options };
    for (const middleware of this.middlewares) {
      modifiedOptions = await middleware(modifiedOptions) ?? modifiedOptions;
    }
    return modifiedOptions;
  }

  /**
   * Performs an HTTP request.
   * @param method The HTTP method.
   * @param path The request path.
   * @param headers Optional request headers.
   * @param body The request body.
   * @param timeout Optional request timeout in milliseconds.
   * @param includeAuthHeader Whether to include the authentication header.
   * @returns A promise that resolves with the response data.
   */
  private async performRequest<T>(
    method: string,
    path: string,
    headers?: Record<string, string>,
    body?: FormData | string,
    timeout?: number,
    includeAuthHeader: boolean = true
  ): Promise<T> {
    const url = this.baseURL + path;

    try {
      const controller = new AbortController();
      const signal = controller.signal;

      const currentTime = Date.now();
      const timeSinceLastRequest = currentTime - this.lastRequestTimestamp;

      if (timeSinceLastRequest < this.rateLimitDelay) {
        const delay = this.rateLimitDelay - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const cacheKey = `${method}:${url}`;
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) {
        this.logRequestSuccess(method, url);
        return cachedData;
      }

      let options: RequestInit = {
        method,
        headers: this.buildHeaders(headers),
        signal,
        body: body instanceof FormData ? body : JSON.stringify(body),
      };

      options = await this.applyMiddlewares(options);

      if (body instanceof FormData) {
        const formDataHeaders = options.headers as Record<string, string>;
        if ('Content-Type' in formDataHeaders) {
          delete formDataHeaders['Content-Type'];
        }
      }

      if (this.authToken && includeAuthHeader) {
        const authTokenValue = this.includeBearerPrefix ? `Bearer ${this.authToken}` : this.authToken;
        options.headers = {
          ...options.headers,
          [this.authHeaderName]: authTokenValue,
        };
      }

      if (timeout) {
        setTimeout(() => controller.abort(), timeout);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        this.logRequestFailure(method, url, response.status);
        const error: RequestError = new Error(`Failed to ${method.toLowerCase()} data to ${url}. Status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const responseData: T = await response.json() as T;

      this.addToCache(cacheKey, responseData);
      this.notifyEvent<T>('success', responseData);
      this.lastRequestTimestamp = Date.now();

      return responseData;
    } catch (error: any) {
      console.error(`Error ${method.toLowerCase()}ing data to ${path}: ${error.message}`);
      this.logRequestAborted(method, url);
      this.notifyEvent<RequestError>('error', error);

      throw error;
    }
  }

  /**
   * Builds headers combining default and custom headers.
   * @param customHeaders Optional custom headers.
   * @returns The combined headers.
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...this.DEFAULT_HEADERS };
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }
    return headers;
  }

  /**
   * Retrieves data from the cache.
   * @param key The cache key.
   * @returns The cached data if available and not expired, otherwise undefined.
   */
  private getFromCache<T>(key: string): T | undefined {
    const cachedItem = this.cache[key];
    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheLifetime) {
      return cachedItem.data as T;
    } else {
      delete this.cache[key];
      return undefined;
    }
  }

  /**
   * Adds data to the cache.
   * @param key The cache key.
   * @param data The data to be cached.
   */
  private addToCache<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Clears the cache.
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Adds an event handler.
   * @param handler The event handler function.
   */
  addEventHandler<T>(handler: EventHandler<T>): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Removes an event handler.
   * @param handler The event handler function to be removed.
   */
  removeEventHandler<T>(handler: EventHandler<T>): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index !== -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Notifies event handlers with the specified event.
   * @param type The type of the event.
   * @param payload The payload of the event.
   */
  private notifyEvent<T>(type: string, payload: T): void {
    const event: RequestEvent<T> = { type, payload };
    this.eventHandlers.forEach(handler => handler(event));
  }

  /**
   * Logs a successful request.
   * @param method The HTTP method.
   * @param url The request URL.
   */
  private logRequestSuccess(method: string, url: string): void {
    console.log(`[SUCCESS] ${method.toUpperCase()} request to ${url} was successful`);
  }

  /**
   * Logs a failed request.
   * @param method The HTTP method.
   * @param url The request URL.
   * @param status The HTTP status code.
   */
  private logRequestFailure(method: string, url: string, status: number): void {
    console.error(`[FAILURE] ${method.toUpperCase()} request to ${url} failed with status ${status}`);
  }

  /**
   * Logs an aborted request.
   * @param method The HTTP method.
   * @param url The request URL.
   */
  private logRequestAborted(method: string, url: string): void {
    console.log(`[ABORTED] ${method.toUpperCase()} request to ${url} was aborted`);
  }
}
