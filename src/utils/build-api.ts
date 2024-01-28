import { AxiosRequestConfig } from 'axios';
import { QueryClient } from '@tanstack/react-query';

import { createUsableQuery } from '../usable-query';
import { axiosBaseQuery } from './base-query';

import type { Endpoints, UsableQueryOptions } from '../types';
import type { BaseQueryFnType } from './base-query';

interface BuildApiConfig {
  /**
   * A function that returns the base query function for `react-query`.
   * @param args The arguments passed to the query function.
   */
  baseQuery?: (args: any) => AxiosRequestConfig<any>;
  /**
   * The `QueryClient` to use for all queries.
   */
  queryClient: QueryClient;
  /**
   * The base URL to use for all requests.
   * @default ''
   */
  baseUrl: string;
  /**
   * A function that injects additional config into the base query function.
   * @param config The config to inject into the base query function.
   *
   * @example
   * ```ts
   * import { buildApi } from './utils';
   *
   * const baseUQuery = buildApi({
   *  baseUrl: 'https://jsonplaceholder.typicode.com',
   *  queryClient: new QueryClient(),
   *  inject: (config) => ({
   *   ...config,
   *   headers: {
   *   ...config.headers,
   *   Authorization: `Bearer ${localStorage.getItem('token')}`,
   *  },
   * }),
   * });
   * ```
   */
  inject?: (config: AxiosRequestConfig) => AxiosRequestConfig;
}

export function buildApi(config: BuildApiConfig) {
  const { baseQuery, queryClient, baseUrl, inject } = config;
  const defaultBaseQueryFn = axiosBaseQuery(baseUrl, inject) as BaseQueryFnType;

  const customBaseQueryFn = baseQuery || defaultBaseQueryFn;

  // Return the API creation methods
  return {
    createUsableQuery: <Definitions extends Endpoints>(
      options: Omit<UsableQueryOptions<Definitions>, 'setup'>
    ) => {
      const { key, endpoints } = options;

      const usableQuery = createUsableQuery({
        key,
        endpoints,
        setup: {
          baseQueryFn: customBaseQueryFn,
          queryClient,
        },
      });

      return usableQuery;
    },
  };
}
