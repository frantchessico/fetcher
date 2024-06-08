"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kwatta = void 0;
/**
 * Main class facilitating HTTP requests with middleware support.
 */
class Kwatta {
    /**
     * Constructor for the Kwatta class.
     * @param baseURL The base URL for all requests.
     */
    constructor(baseURL) {
        this.DEFAULT_HEADERS = {
            'Content-Type': 'application/json',
        };
        this.authHeaderName = 'Authorization';
        this.includeBearerPrefix = true;
        this.rateLimitDelay = 1000;
        this.lastRequestTimestamp = 0;
        this.eventHandlers = [];
        this.cache = {};
        this.cacheLifetime = 60 * 1000;
        this.middlewares = [];
        this.baseURL = baseURL;
    }
    /**
     * Sets the authentication token.
     * @param token The authentication token.
     * @param headerName The authentication header name.
     * @param includeBearerPrefix Indicates whether to include the 'Bearer' prefix.
     */
    setAuthToken(token, headerName = 'Authorization', includeBearerPrefix = true) {
        this.authToken = token;
        this.authHeaderName = headerName;
        this.includeBearerPrefix = includeBearerPrefix;
    }
    /**
     * Sets the rate limit delay.
     * @param delay The rate limit delay in milliseconds.
     */
    setRateLimitDelay(delay) {
        this.rateLimitDelay = delay;
    }
    /**
     * Sets the last request timestamp.
     * @param timestamp The timestamp of the last request in milliseconds.
     */
    setLastRequestTimestamp(timestamp) {
        this.lastRequestTimestamp = timestamp;
    }
    /**
     * Sets the cache lifetime.
     * @param lifetime The cache lifetime in milliseconds.
     */
    setCacheLifetime(lifetime) {
        this.cacheLifetime = lifetime;
    }
    /**
     * Adds a middleware to the middleware chain.
     * @param middleware The middleware to be added.
     * @returns This Kwatta instance to allow method chaining.
     */
    use(middleware) {
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
    get(path, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('GET', path, headers, undefined, timeout);
        });
    }
    /**
     * Executes an HTTP POST request.
     * @param path The request path.
     * @param data The request data.
     * @param headers Optional request headers.
     * @param timeout Optional request timeout in milliseconds.
     * @returns A promise that resolves with the response data.
     */
    post(path, data, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('POST', path, headers, JSON.stringify(data), timeout);
        });
    }
    /**
     * Executes an HTTP PUT request.
     * @param path The request path.
     * @param data The request data.
     * @param headers Optional request headers.
     * @param timeout Optional request timeout in milliseconds.
     * @returns A promise that resolves with the response data.
     */
    put(path, data, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('PUT', path, headers, JSON.stringify(data), timeout);
        });
    }
    /**
     * Executes an HTTP PATCH request.
     * @param path The request path.
     * @param data The request data.
     * @param headers Optional request headers.
     * @param timeout Optional request timeout in milliseconds.
     * @returns A promise that resolves with the response data.
     */
    patch(path, data, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('PATCH', path, headers, JSON.stringify(data), timeout);
        });
    }
    /**
     * Executes an HTTP DELETE request.
     * @param path The request path.
     * @param headers Optional request headers.
     * @param timeout Optional request timeout in milliseconds.
     * @returns A promise that resolves with the response data.
     */
    delete(path, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('DELETE', path, headers, undefined, timeout);
        });
    }
    /**
     * Executes an HTTP HEAD request.
     * @param path The request path.
     * @param headers Optional request headers.
     * @param timeout Optional request timeout in milliseconds.
     * @returns A promise that resolves with the response data.
     */
    head(path, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('HEAD', path, headers, undefined, timeout);
        });
    }
    /**
     * Executes an HTTP OPTIONS request.
     * @param path The request path.
     * @param headers Optional request headers.
     * @param timeout Optional request timeout in milliseconds.
     * @returns A promise that resolves with the response data.
     */
    options(path, headers, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performRequest('OPTIONS', path, headers, undefined, timeout);
        });
    }
    /**
     * Applies middlewares to the options object.
     * @param options The request options object.
     * @returns A promise that resolves with the modified options.
     */
    applyMiddlewares(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let modifiedOptions = Object.assign({}, options);
            for (const middleware of this.middlewares) {
                modifiedOptions = (_a = yield middleware(modifiedOptions)) !== null && _a !== void 0 ? _a : modifiedOptions;
            }
            return modifiedOptions;
        });
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
    performRequest(method, path, headers, body, timeout, includeAuthHeader = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.baseURL + path;
            try {
                const controller = new AbortController();
                const signal = controller.signal;
                const currentTime = Date.now();
                const timeSinceLastRequest = currentTime - this.lastRequestTimestamp;
                if (timeSinceLastRequest < this.rateLimitDelay) {
                    const delay = this.rateLimitDelay - timeSinceLastRequest;
                    yield new Promise(resolve => setTimeout(resolve, delay));
                }
                const cacheKey = `${method}:${url}`;
                const cachedData = this.getFromCache(cacheKey);
                if (cachedData) {
                    this.logRequestSuccess(method, url);
                    return cachedData;
                }
                let options = {
                    method,
                    headers: this.buildHeaders(headers),
                    signal,
                    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
                };
                options = yield this.applyMiddlewares(options);
                if (body instanceof FormData) {
                    const formDataHeaders = options.headers;
                    if ('Content-Type' in formDataHeaders) {
                        delete formDataHeaders['Content-Type'];
                    }
                }
                if (this.authToken && includeAuthHeader) {
                    const authTokenValue = this.includeBearerPrefix ? `Bearer ${this.authToken}` : this.authToken;
                    options.headers = Object.assign(Object.assign({}, options.headers), { [this.authHeaderName]: authTokenValue });
                }
                if (timeout) {
                    setTimeout(() => controller.abort(), timeout);
                }
                const response = yield fetch(url, options);
                if (!response.ok) {
                    this.logRequestFailure(method, url, response.status);
                    const error = new Error(`Failed to ${method.toLowerCase()} data to ${url}. Status: ${response.status}`);
                    error.status = response.status;
                    throw error;
                }
                const responseData = yield response.json();
                this.addToCache(cacheKey, responseData);
                this.notifyEvent('success', responseData);
                this.lastRequestTimestamp = Date.now();
                return responseData;
            }
            catch (error) {
                console.error(`Error ${method.toLowerCase()}ing data to ${path}: ${error.message}`);
                this.logRequestAborted(method, url);
                this.notifyEvent('error', error);
                throw error;
            }
        });
    }
    /**
     * Builds headers combining default and custom headers.
     * @param customHeaders Optional custom headers.
     * @returns The combined headers.
     */
    buildHeaders(customHeaders) {
        const headers = Object.assign({}, this.DEFAULT_HEADERS);
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
    getFromCache(key) {
        const cachedItem = this.cache[key];
        if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheLifetime) {
            return cachedItem.data;
        }
        else {
            delete this.cache[key];
            return undefined;
        }
    }
    /**
     * Adds data to the cache.
     * @param key The cache key.
     * @param data The data to be cached.
     */
    addToCache(key, data) {
        this.cache[key] = {
            data,
            timestamp: Date.now(),
        };
    }
    /**
     * Clears the cache.
     */
    clearCache() {
        this.cache = {};
    }
    /**
     * Adds an event handler.
     * @param handler The event handler function.
     */
    addEventHandler(handler) {
        this.eventHandlers.push(handler);
    }
    /**
     * Removes an event handler.
     * @param handler The event handler function to be removed.
     */
    removeEventHandler(handler) {
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
    notifyEvent(type, payload) {
        const event = { type, payload };
        this.eventHandlers.forEach(handler => handler(event));
    }
    /**
     * Logs a successful request.
     * @param method The HTTP method.
     * @param url The request URL.
     */
    logRequestSuccess(method, url) {
        console.log(`[SUCCESS] ${method.toUpperCase()} request to ${url} was successful`);
    }
    /**
     * Logs a failed request.
     * @param method The HTTP method.
     * @param url The request URL.
     * @param status The HTTP status code.
     */
    logRequestFailure(method, url, status) {
        console.error(`[FAILURE] ${method.toUpperCase()} request to ${url} failed with status ${status}`);
    }
    /**
     * Logs an aborted request.
     * @param method The HTTP method.
     * @param url The request URL.
     */
    logRequestAborted(method, url) {
        console.log(`[ABORTED] ${method.toUpperCase()} request to ${url} was aborted`);
    }
}
exports.Kwatta = Kwatta;
