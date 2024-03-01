// Definição de tipos para erros personalizados
interface RequestError extends Error {
    status?: number;
  }
  
  // Definição de tipos para o evento de solicitação
  interface RequestEvent<T> {
    type: string;
    payload: T;
  }
  
  // Definição de tipos para a função que trata os eventos
  type EventHandler<T> = (event: RequestEvent<T>) => void;
  
  // Definição de tipos para o token de autenticação
  interface AuthToken {
    token: string;
  }
  
  // Definição da classe Kwatta
  declare class Kwatta<T extends AuthToken = AuthToken> {
    private baseURL: string;
    private readonly DEFAULT_HEADERS: Record<string, string>;
    private readonly cache: Record<string, any>;
    private authToken?: string;
    private authHeaderName: string;
    private includeBearerPrefix: boolean;
    private rateLimitDelay: number;
    private lastRequestTimestamp: number;
    private readonly eventHandlers: EventHandler<any>[];
  
    constructor(baseURL: string);
  
    setAuthToken(token: string, headerName?: string, includeBearerPrefix?: boolean): void;
  
    setRateLimitDelay(delay: number): void;
  
    setLastRequestTimestamp(timestamp: number): void;
  
    get<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    post<T>(path: string, data: any, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    put<T>(path: string, data: any, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    patch<T>(path: string, data: any, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    delete<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    head<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    options<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    connect<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    trace<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    copy<T>(path: string, headers?: Record<string, string>, timeout?: number): Promise<T>;
  
    private performRequest<T>(
      method: string,
      path: string,
      headers?: Record<string, string>,
      body?: string,
      timeout?: number
    ): Promise<T>;
  
    private buildHeaders(customHeaders?: Record<string, string>): Record<string, string>;
  
    addEventHandler<T>(handler: EventHandler<T>): void;
  
    removeEventHandler<T>(handler: EventHandler<T>): void;
  
    private notifyEvent<T>(type: string, payload: T): void;
  }
  
  // Exportação da instância padrão da Kwatta
  export const instance1: Kwatta;
  