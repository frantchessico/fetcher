declare module 'kwatta' {
  export interface RequestError extends Error {
    status?: number;
  }

  export interface RequestEvent<T> {
    type: string;
    payload: T;
  }

  export type EventHandler<T> = (event: RequestEvent<T>) => void;

  export interface AuthToken {
    token: string;
  }

  export interface CacheItem<T> {
    data: T;
    timestamp: number;
  }

  export type Middleware = (options: RequestInit) => RequestInit | Promise<RequestInit>;

  export class Kwatta<T extends AuthToken = AuthToken> {
    constructor(baseURL: string);

    setAuthToken(token: string, headerName?: string, includeBearerPrefix?: boolean): void;

    setRateLimitDelay(delay: number): void;

    setLastRequestTimestamp(timestamp: number): void;

    setCacheLifetime(lifetime: number): void;

    use(middleware: Middleware): this;

    get<R>(path: string, headers?: Record<string, string>, timeout?: number): Promise<R>;

    post<R>(path: string, data: any, headers?: Record<string, string>, timeout?: number): Promise<R>;

    put<R>(path: string, data: any, headers?: Record<string, string>, timeout?: number): Promise<R>;

    patch<R>(path: string, data: any, headers?: Record<string, string>, timeout?: number): Promise<R>;

    delete<R>(path: string, headers?: Record<string, string>, timeout?: number): Promise<R>;

    head<R>(path: string, headers?: Record<string, string>, timeout?: number): Promise<R>;

    options<R>(path: string, headers?: Record<string, string>, timeout?: number): Promise<R>;

    clearCache(): void;

    addEventHandler<T>(handler: EventHandler<T>): void;

    removeEventHandler<T>(handler: EventHandler<T>): void;
  }
}
