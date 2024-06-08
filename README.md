Here's the documentation for the Kwatta Library:

# Kwatta Library Documentation

The Kwatta library is a tool designed to simplify HTTP requests in JavaScript applications. It provides support for common HTTP methods such as GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, CONNECT, TRACE, and COPY, making it easier to interact with web servers.

## Installation

You can install the Kwatta library via npm:

```bash
npm install kwatta
```

## Basic Usage

To begin using the Kwatta library, follow these steps:

1. Import the `Kwatta` class and necessary types:

```typescript
import { Kwatta, Middleware, RequestError } from 'kwatta';
```

2. Create an instance of the `Kwatta` class, specifying the base URL of your API:

```typescript
const k = new Kwatta('https://your-api.com');
```

3. Make HTTP requests using the available methods:

```typescript
k.get('/users')
    .then(users => {
        console.log('List of users:', users);
    })
    .catch((error: RequestError) => {
        console.error('Error fetching users:', error.message);
    });
```


```typescript
k.post('/users', { name: 'John Doe', age: 30 })
    .then(response => {
        console.log('User added successfully:', response);
    })
    .catch((error: RequestError) => {
        console.error('Error adding user:', error.message);
    });
```

```typescript
k.put('/users/1', { name: 'Jane Doe', age: 25 })
    .then(response => {
        console.log('User updated successfully:', response);
    })
    .catch((error: RequestError) => {
        console.error('Error updating user:', error.message);
    });
```

```typescript
k.patch('/users/1', { age: 26 })
    .then(response => {
        console.log('User updated successfully:', response);
    })
    .catch((error: RequestError) => {
        console.error('Error updating user:', error.message);
    });
```

```typescript
k.delete('/users/1')
    .then(() => {
        console.log('User deleted successfully');
    })
    .catch((error: RequestError) => {
        console.error('Error deleting user:', error.message);
    });
```



## Authentication Configuration

You can configure an authentication token to be sent with all requests:

```typescript
k.setAuthToken('your-token');
```

You can also specify the name of the authentication header and whether to include the "Bearer" prefix:

```typescript
k.setAuthToken('your-token', 'Authorization', true);
```

## Middlewares

Middlewares allow you to modify or intercept requests before they are sent. You can add as many middlewares as you like:

```typescript
const logMiddleware: Middleware = (options) => {
    console.log(`Request: ${options.method} ${options.url}`);
    return options;
};

k.use(logMiddleware);
```

## Request Cache

The Kwatta library supports response caching to reduce the number of repeated requests to the server. You can configure the cache lifetime in milliseconds:

```typescript
k.setCacheLifetime(60000); // Cache valid for 1 minute
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

k.addEventHandler(successHandler);
k.addEventHandler(errorHandler);
```

## Clearing Cache

You can manually clear the response cache:

```typescript
k.clearCache();
```

## Removing Event Handlers

To remove an event handler, use the `removeEventHandler` method:

```typescript
k.removeEventHandler(successHandler);
```

## Example Usage

Here's a more complete example of usage:

```typescript
import { Kwatta, Middleware } from 'kwatta';

const k = new Kwatta('https://your-api.com');

const addCustomHeaderMiddleware: Middleware = (options) => {
    const customHeaders = {
        ...options.headers,
        'X-Custom-Header': 'Custom Header Value'
    };
    return { ...options, headers: customHeaders };
};

const logMiddleware: Middleware = (options) => {
    console.log(`Request: ${options.method} ${options.url}`);
    return options;
};

k.use(addCustomHeaderMiddleware).use(logMiddleware);

k.get('/users')
    .then(users => {
        console.log('List of users:', users);
    })
    .catch((error: RequestError) => {
        console.error('Error fetching users:', error.message);
    });
```

---

### By Francisco Inoque