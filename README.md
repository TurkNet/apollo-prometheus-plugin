# Prometheus Resolver Metrics Plugin

This is a simple and efficient plugin to collect and report GraphQL resolver metrics using Prometheus. It helps track the duration of each resolver request and logs metrics for successful and errored requests, making it easier to monitor the performance of your GraphQL APIs.

## Features

- Measures the duration of each resolver field execution.
- Tracks the status of each request (success/error).
- Integrates seamlessly with GraphQL servers.
- Uses Prometheus for monitoring and metric collection.

## Installation

You can install the plugin via npm:

```bash
npm install apollo-prometheus-plugin
```

## Usage

### 1. **Setup the Metrics Plugin**

To use the plugin in your GraphQL server, import and configure it as follows:

```typescript
import { resolverMetricsPlugin } from 'apollo-prometheus-plugin';
import { ApolloServer } from 'apollo-server';

// Create your Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    resolverMetricsPlugin(), // Add the plugin here
  ],
});
```

### 2. **Configure Prometheus With Expressjs**

To expose metrics for Prometheus scraping, you'll need to expose an endpoint in your server, typically `/metrics`. If you're using Apollo Server, this can be done easily with the built-in HTTP integration.

Example:

```typescript
import express from 'express';
import { resolverMetricsPlugin } from 'apollo-prometheus-plugin';
import { ApolloServer } from 'apollo-server-express';
import { collectDefaultMetrics, register } from 'prom-client';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [resolverMetricsPlugin()],
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

server.applyMiddleware({ app });

app.listen({ port: 3000 }, () => {
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);
  collectDefaultMetrics();
  console.log(`📊 Metrics available at http://localhost:3000/metrics`);
});
```

Once the server is running, your metrics will be available at the `/metrics` endpoint. You can scrape this endpoint using Prometheus.

## Metrics Overview

The plugin collects the following metrics:

### `resolver_request_duration_seconds`

- **Type**: Histogram
- **Description**: Duration of each resolver request (in seconds).
- **Labels**:
  - `operation`: The operation name of the GraphQL query (e.g., `query`, `mutation`).
  - `fieldName`: The name of the resolver field.
  - `status`: The status of the request (either `success` or `error`).

This metric will help you monitor the performance of your GraphQL resolvers and troubleshoot slow or failed requests.

## Example of Collected Metrics

Once you start using the plugin, Prometheus will start collecting data about resolver durations. An example of how these metrics might look in Prometheus:

```
resolver_request_duration_seconds_bucket{operation="query",fieldName="getUser",status="success",le="0.005"} 5
resolver_request_duration_seconds_bucket{operation="query",fieldName="getUser",status="success",le="0.01"} 10
resolver_request_duration_seconds_sum{operation="query",fieldName="getUser",status="success"} 0.03
resolver_request_duration_seconds_count{operation="query",fieldName="getUser",status="success"} 50
```
