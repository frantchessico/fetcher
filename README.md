

# Fetcher

Fetcher is a TypeScript library for simplifying HTTP requests using the `fetch` API. It provides straightforward methods for performing GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, CONNECT, TRACE, and COPY requests, along with support for authentication, header control, caching, and event handling.

## Installation

To install Fetcher, you can use npm or yarn:

```bash
npm install fetcher
```

or

```bash
yarn add fetcher
```

## Usage

### Import

```typescript
import { Fetcher, RequestError, RequestEvent, EventHandler } from 'fetcher';
```

### Configuration

To start using Fetcher, create an instance by passing the base URL for all your requests:

```typescript
const fetcher = new Fetcher('https://api.example.com');
```

### Making Requests

Fetcher provides methods for different types of requests:

```typescript
// GET
const data = await fetcher.get<MyData>('/data');

// POST
const newData = { name: 'John', age: 30 };
const createdData = await fetcher.post<MyData>('/data', newData);

// PUT
const updatedData = await fetcher.put<MyData>('/data/123', newData);

// DELETE
const deletedData = await fetcher.delete<MyData>('/data/123');
```

### Authentication

You can configure an authentication token to be included in the request headers:

```typescript
fetcher.setAuthToken('your_token_here');
```

### Event Handling

You can add event handlers to deal with specific events like success or error:

```typescript
const successHandler: EventHandler<MyData> = (event) => {
  console.log('Request succeeded:', event.payload);
};

const errorHandler: EventHandler<RequestError> = (event) => {
  console.error('Request failed:', event.payload.message);
};

fetcher.addEventHandler(successHandler);
fetcher.addEventHandler(errorHandler);
```

### Additional Features

#### Custom Headers

You can define custom headers to include in your requests:

```typescript
const customHeaders = {
  'Custom-Header': 'value'
};

const dataWithHeaders = await fetcher.get<MyData>('/data', customHeaders);
```

#### Caching

Fetcher supports caching responses to reduce unnecessary network requests:

```typescript
fetcher.setCacheEnabled(true);
```

#### Rate Limiting

You can set a delay between requests to prevent hitting rate limits:

```typescript
fetcher.setRateLimitDelay(1000); // 1000ms delay between requests
```

#### Timeout

Set a timeout for requests to handle slow responses:

```typescript
const timeout = 5000; // 5 seconds
const responseData = await fetcher.get<MyData>('/data', undefined, timeout);
```

## Contribution

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

---
This README provides a more comprehensive overview of your library's functionality, including additional features, configuration options, and examples. You can further expand it with usage examples, advanced configurations, error handling details, and more, based on your library's specific requirements and use cases.