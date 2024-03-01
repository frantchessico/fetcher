

# Kwatta Library Documentation

The Kwatta library is a tool to facilitate HTTP requests in JavaScript applications. With it, you can perform GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, CONNECT, TRACE, and COPY requests in a simple and efficient way.

## Installation

To use the Kwatta library in your project, you can install it via npm:

```bash
npm install kwatta
```

## Basic Usage

To get started with the Kwatta library, follow the steps below:

1. Import the `Kwatta` class and necessary types:

```typescript
import { Kwatta, Middleware, RequestError } from 'kwatta';
```

2. Create an instance of the `Kwatta` class, specifying the base URL of your API:

```typescript
const kwatta = new Kwatta('https://your-api.com');
```

3. Make HTTP requests using the available methods (GET, POST, PUT, etc.):

```typescript
kwatta.get('/users')
    .then(users => {
        console.log('List of users:', users);
    })
    .catch((error: RequestError) => {
        console.error('Error fetching users:', error.message);
    });
```

## Authentication Configuration

You can configure an authentication token to be sent with all requests:

```typescript
kwatta.setAuthToken('your-token');
```

You can also specify the name of the authentication header and whether to include the "Bearer" prefix:

```typescript
kwatta.setAuthToken('your-token', 'Authorization', true);
```

## Middlewares

Middlewares allow you to modify or intercept requests before they are sent. You can add as many middlewares as you like:

```typescript
const loggingMiddleware: Middleware = (options) => {
    console.log(`Request: ${options.method} ${options.url}`);
    return options;
};

kwatta.use(loggingMiddleware);
```

## Request Cache

The Kwatta library supports response caching to reduce the number of repeated requests to the server. You can configure the cache lifetime in milliseconds:

```typescript
kwatta.setCacheLifetime(60000); // Cache valid for 1 minute
```

## Event Handling

You can add event handlers to be notified about the success or failure of requests:

```typescript
const successHandler = (event: RequestEvent<any>) => {
    console.log('Request successful:', event.payload);
};

const errorHandler = (event: RequestEvent<RequestError>) => {
    console.error('Request error:', event.payload.message);
};

kwatta.addEventHandler(successHandler);
kwatta.addEventHandler(errorHandler);
```

## Clearing Cache

You can manually clear the response cache:

```typescript
kwatta.clearCache();
```

## Removing Event Handlers

To remove an event handler, use the `removeEventHandler` method:

```typescript
kwatta.removeEventHandler(successHandler);
```

## Example Usage

Here's a more complete example of usage:

```typescript
import { Kwatta, Middleware } from 'kwatta';

const kwatta = new Kwatta('https://your-api.com');

const addCustomHeaderMiddleware: Middleware = (options) => {
    const customHeaders = {
        ...options.headers,
        'X-Custom-Header': 'Custom Header Value'
    };
    return { ...options, headers: customHeaders };
};

const loggingMiddleware: Middleware = (options) => {
    console.log(`Request: ${options.method} ${options.url}`);
    return options;
};

kwatta.use(addCustomHeaderMiddleware).use(loggingMiddleware);

kwatta.get('/users')
    .then(users => {
        console.log('List of users:', users);
    })
    .catch((error: RequestError) => {
        console.error('Error fetching users:', error.message);
    });
```

---

### By Francisco Inoque