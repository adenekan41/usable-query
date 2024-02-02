<br />
<p align="center">
	<a href="https://i.ibb.co/rZdp765/Dribbble-shot-HD-3.png">
 	<img src="https://i.ibb.co/rZdp765/Dribbble-shot-HD-3.png" width="98%" alt="usable-query">
	</a>
</p>

<hr />

## Usable Query: Simplifying React Query Management

[View on CodeSandbox](https://codesandbox.io/p/sandbox/usable-query-pwzdhk)

[![npm](https://badge.fury.io/js/usable-query.svg)](https://www.npmjs.com/package/usable-query)

[![NPM](https://nodei.co/npm/usable-query.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/usable-query/)

## 🤨 Motivation

### The Challenge in Managing Data Fetching in React
While React Query is a powerful tool for managing server state, it can be challenging to work with, especially for developers new to the library or those working on large-scale projects. The syntax for defining and using queries and mutations can be confusing and difficult to read, and the process of setting up and managing server state can be tedious and time-consuming. This can lead to a lot of boilerplate code and make it difficult to maintain and scale React applications.

### Introducing UsableQuery
UsableQuery was born out of a need to simplify and streamline the process of working with queries and mutations in React applications. While React Query itself is a powerful tool for managing server state, I recognized that there could be a more intuitive and efficient way to handle these data fetching mechanisms, especially for developers new to the library or those working on large-scale projects.

### Goals
- *Simplify Query Syntax:* Provide a more straightforward and readable syntax for defining and using queries and mutations, making it easier for developers of all levels to work with data fetching in React.

- *Centralize Query Management:* Offers a centralized system to manage all queries and mutations, reducing boilerplate and improving maintainability. see [this](#centralized-query-management) for more details.

- *Enhance Code Quality:* Encourage better coding practices and architecture by providing a structured and consistent way to handle data fetching and state management.

- *Facilitate Easy Integration and Extensibility:* Ensure that UsableQuery seamlessly integrates with existing React Query setups and is flexible enough to adapt to various use cases and requirements.


## ⚡️About UsableQuery

[UsableQuery](https://github.com/adenekan41/usable-query), is a React utility package designed to enhance the experience of working with the React Query library. It provides a streamlined and centralized approach for managing queries and mutations, making data fetching and state management in React applications both efficient and intuitive. Built with the needs of modern web developers in mind, UsableQuery aims to reduce boilerplate, improve readability, and accelerate the development process in React-based projects.

## ✨ Features

- 📦 Centralized Query Management
- 🔧 Simplified Query Syntax
- ✅ Efficient Data Fetching
- ⚒ CommonJS, ESM & browser standalone support
- 📚 Extensive Documentation
- 👍🏾 Listener Configurations
- 📝 TypeScript Support

## ⬇ Installing [usable-query](https://github.com/adenekan41/usable-query)

> [!IMPORTANT]
> @tanstack/react-query is a peer dependency of usable-query, so you must install it in your project before installing usable-query.


#### Using NPM

```bash
npm i @tanstack/react-query 

npm i usable-query
```

### Using Yarn

```bash
yarn add @tanstack/react-query

yarn add usable-query
```

### Using CDN

```html
<!-- React Query -->
<script src="https://cdn.skypack.dev/@tanstack/react-query"></script>

<!-- Usable Query -->
<script src="https://cdn.skypack.dev/usable-query"></script>
```


## 📖 Getting Started

This guide will walk you through the process of installing and implementing UsableQuery in your React project.

### Prerequisites
Before you begin, ensure that you have the following installed:

- Node.js (version 14 or later)
- npm (usually comes with Node.js) or Yarn
- A React project set up and ready to go
- UsableQuery is built to work alongside React Query, so you should also have [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query) installed in your project.



### 🛠️ Implementation

After installing, you can set up UsableQuery in your project. Here's a basic example to get you started, first we need to setup our base UsableQuery instance:

#### File: `u-api-query.ts`

```ts
import { buildApi } from 'usable-query';
import { QueryClient } from '@tanstack/react-query'; // or your already configured query client


const cacheTime = 1000 * 60 * 60 * 24; // 24 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
      staleTime: cacheTime,
      refetchOnWindowFocus: false,
    },
  },
});


export const baseUQuery = buildApi({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  queryClient,
});

```

After this we can now use our baseUQuery instance to create our first query or mutation.:

#### File: `api/user.ts`

```ts
import { baseUQuery } from './u-api-query';

type User = {
  id: number;
  name: string;
};

const userUQuery = baseUQuery.createUsableQuery({
  key: 'getUsers',
  endpoints: (builder) => ({
    getUsers: builder.query<null, User[]>({
      key: 'getUsers',
      queryFn: () => ({
        url: '/users',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetUsersQuery } = userUQuery; // export the generated hook and also the generated query function for server calls
```


#### File: `App.tsx`

```tsx
import { useGetUsersQuery } from './api/user';

function App() {
  const { data, isLoading, error } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Oops! Something went wrong...</div>;

  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

Want to see a demo of UsableQuery in a project? [View on CodeSandbox](https://codesandbox.io/p/sandbox/usable-query-pwzdhk)

You can now start building your application with UsableQuery.

## 📚 API Documentation

### `buildApi`

The `buildApi` function is used to create a base UsableQuery instance. It takes in an object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `baseUrl` | `string` | The base url for all requests made with this instance. |
| `queryClient` | `QueryClient` | The query client instance to be used by this instance. |
| `baseQueryFn` | `BaseQueryFn` | An optional function that can be used to override the default queryFn for all queries created with this instance. |
| `inject` | `BaseInject` | An optional object containing functions that can be used to inject data into the query client cache. |
| `transformResponse` | `BaseTransformResponse` | An optional function that can be used to transform the response of all queries created with this instance. |

#### Returns
- `createUsableQuery` - A function that can be used to create queries and mutations with this instance.


### `createUsableQuery`

The `createUsableQuery` function is used to create queries and mutations. It takes in an object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `key` | `string` | The key for this query or mutation. |
| `endpoints` | `Endpoints` | A function that returns an object containing the endpoints for this query or mutation. |
| `setup` | `{queryClient: QueryClient;baseQueryFn: any;}` | An optional function that can be used to override the default queryFn for all queries created with this instance. |


#### Returns
- `use{key}Query` - A hook that can be used to fetch data for this query or mutation.
- `{key}` - A function that can be used to fetch data for this query or mutation.
- `use{key}Mutation` - A hook that can be used to mutate data for this query or mutation.
- `{key}Mutation` - A function that can be used to mutate data for this query or mutation.

<hr />

- `startListening` - A function that can be used to start listening for changes to the query or mutation.
- `stopListening` - A function that can be used to stop listening for changes to the query or mutation.
#### Example

```ts
import { baseUQuery } from './u-api-query';

type User = {
  id: number;
  name: string;
};

const userUQuery = baseUQuery.createUsableQuery({
  key: 'getUsers',
  endpoints: (builder) => ({
    getUsers: builder.query<null, User[]>({
      key: 'getUsers',
      queryFn: () => ({
        url: '/users',
        method: 'GET',
      }),
    }),
  }),
});

userUQuery.startListening({
  matches: (action) => ['getUsers'].includes(action.key),
  performAction: async (action: function) => {
    // perform action
  },
}); // start listening for changes to the query or mutation

userUQuery.stopListening({
  matches: (action) => ['getUsers'].includes(action.key),
}); // stop listening for changes to the query or mutation

export const { useGetUsersQuery } = userUQuery; // export the generated hook and also the generated query function for server calls
```


### `Endpoints`

The `Endpoints` type is an object containing the endpoints for a query or mutation. It takes in an object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `query` | `QueryEndpoint` | An optional function that returns an object containing the query endpoint for this query or mutation. |
| `mutation` | `MutationEndpoint` | An optional function that returns an object containing the mutation endpoint for this query or mutation. |

### `builder.query`

The `builder.query` function is used to create a query endpoint. It takes in an object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `key` | `string` | The key for this query or mutation. |
| `queryFn` | `QueryFn` | The queryFn for this query or mutation. |
| `isInfinite` | `boolean` | An optional boolean that can be used to indicate whether this query is infinite. |
| `transformResponse` | `TransformResponse` | An optional function that can be used to transform the response of this query or mutation. |

#### Example

```ts
import { baseUQuery } from './u-api-query';

type User = {
  id: number;
  name: string;
};

const userUQuery = baseUQuery.createUsableQuery({
  key: 'getUsers',
  endpoints: (builder) => ({
    getUsers: builder.query<null, User[]>({
      key: 'getUsers',
      queryFn: () => ({
        url: '/users',
        method: 'GET',
      }),
    }),
  }),
  isInfinite: true,
  transformResponse: (response) => response.data,
});

export const { useGetUsersQuery } = userUQuery; // export the generated hook and also the generated query function for server calls
```


### `builder.mutation`

The `builder.mutation` function is used to create a mutation endpoint. It takes in an object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `key` | `string` | The key for this query or mutation. |
| `mutationFn` | `MutationFn` | The mutationFn for this query or mutation. |
| `invalidatesQueries` | `string[]` | An optional array of keys for queries that should be invalidated when this mutation is performed. |
| `setCache` | `SetCache` | An optional function that can be used to set the cache for this mutation. |

#### Example

```ts

import { baseUQuery } from './u-api-query';

type User = {
  id: number;
  name: string;
};


const userUQuery = baseUQuery.createUsableQuery({
  key: 'getUsers',
  endpoints: (builder) => ({
    getUsers: builder.query<null, User[]>({
      key: 'getUsers',
      queryFn: () => ({
        url: '/users',
        method: 'GET',
      }),
    }),
    createUser: builder.mutation<null, User>({
      key: 'createUser',
      mutationFn: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesQueries: ['getUsers'],
      setCache: (cache, { data }) => {
        cache.setQueryData('getUsers', (old) => [...old, data]);
      },
    }),
  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = userUQuery; // export the generated hook and also the generated query function for server calls
```


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

