import fetch, { RequestInit } from 'node-fetch';

// Definindo um tipo personalizado para os erros
export interface RequestError extends Error {
  status?: number;
}

// Interface para definir o formato dos dados do evento
export interface RequestEvent<T> {
  type: string;
  payload: T;
}

// Definindo o tipo da função que trata os eventos
export type EventHandler<T> = (event: RequestEvent<T>) => void;

// Interface para definir o formato do token de autenticação
interface AuthToken {
  token: string;
}

export class Fetcher<T extends AuthToken = AuthToken> {
  private baseURL: string = '';
  private readonly DEFAULT_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  private readonly cache: Record<string, any> = {};
  private authToken?: string;
  private authHeaderName: string = 'Authorization';
  private includeBearerPrefix: boolean = true;
  private rateLimitDelay: number = 1000;
  private lastRequestTimestamp: number = 0;
  private readonly eventHandlers: EventHandler<any>[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string, headerName: string = 'Authorization', includeBearerPrefix: boolean = true): void {
    this.authToken = token;
    this.authHeaderName = headerName;
    this.includeBearerPrefix = includeBearerPrefix;
  }

  setRateLimitDelay(delay: number): void {
    this.rateLimitDelay = delay;
  }

  setLastRequestTimestamp(timestamp: number): void {
    this.lastRequestTimestamp = timestamp;
  }

  async get<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('GET', path, headers, undefined, timeout);
  }

  async post<T>(
    path: string,
    data: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('POST', path, headers, JSON.stringify(data), timeout);
  }

  async put<T>(
    path: string,
    data: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('PUT', path, headers, JSON.stringify(data), timeout);
  }

  async patch<T>(
    path: string,
    data: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('PATCH', path, headers, JSON.stringify(data), timeout);
  }

  async delete<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('DELETE', path, headers, undefined, timeout);
  }

  async head<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('HEAD', path, headers, undefined, timeout);
  }

  async options<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('OPTIONS', path, headers, undefined, timeout);
  }

  async connect<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('CONNECT', path, headers, undefined, timeout);
  }

  async trace<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('TRACE', path, headers, undefined, timeout);
  }

  async copy<T>(
    path: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.performRequest<T>('COPY', path, headers, undefined, timeout);
  }

  private async performRequest<T>(
    method: string,
    path: string,
    headers?: Record<string, string>,
    body?: string,
    timeout?: number,
    includeAuthHeader: boolean = true // Novo parâmetro para indicar se o cabeçalho de autorização deve ser incluído
  ): Promise<T> {
    try {
      const url = this.baseURL + path;
      const controller = new AbortController();
      const signal = controller.signal;
  
      const currentTime = Date.now();
      const timeSinceLastRequest = currentTime - this.lastRequestTimestamp;
  
      if (timeSinceLastRequest < this.rateLimitDelay) {
        const delay = this.rateLimitDelay - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
  
      // Verifica se a resposta está em cache
      const cacheKey = `${method}:${url}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
  
      let options: RequestInit = {
        method,
        headers: this.buildHeaders(headers),
        signal,
        body,
      };
  
      // Adiciona o cabeçalho de autorização aos cabeçalhos se estiver configurado e includeAuthHeader for verdadeiro
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
        const error: RequestError = new Error(`Failed to ${method.toLowerCase()} data to ${url}. Status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
  
      const responseData: T = await response.json() as T;

  
      // Salva a resposta em cache
      this.cache[cacheKey] = responseData;
  
      this.notifyEvent<T>('success', responseData);
  
      this.lastRequestTimestamp = Date.now(); // Atualiza o último carimbo de data/hora da solicitação
  
      return responseData;
    } catch (error: any) {
      console.error(`Error ${method.toLowerCase()}ing data to ${path}: ${error.message}`);
  
      this.notifyEvent<RequestError>('error', error);
  
      throw error;
    }
  }
  
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...this.DEFAULT_HEADERS };

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  addEventHandler<T>(handler: EventHandler<T>): void {
    this.eventHandlers.push(handler);
  }

  removeEventHandler<T>(handler: EventHandler<T>): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index !== -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  private notifyEvent<T>(type: string, payload: T): void {
    const event: RequestEvent<T> = { type, payload };
    this.eventHandlers.forEach(handler => handler(event));
  }
}