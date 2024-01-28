import { QueryClient } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

import { createUsableQuery } from '../usable-query';
import { axiosBaseQuery } from './base-query';

import type { Endpoints, UsableQueryOptions } from '../types';
import type { BaseQueryFnType } from './base-query';

type BaseTransformResponse = (response: unknown) => unknown;
type BaseInject = (config: AxiosRequestConfig) => AxiosRequestConfig;
type BaseQueryFn = (args: any) => AxiosRequestConfig<any>;
interface BuildApiConfig {
  /**
   * A function that returns the base query function for `react-query`.
   * @param args The arguments passed to the query function.
   */
  baseQueryFn?: BaseQueryFn;
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
  inject?: BaseInject;

  /**
   * A function that transforms the response from the base query function.
   * @param response The response from the base query function.
   * @returns The transformed response.
   *
   * @example
   * ```ts
   * import { buildApi } from './utils';
   *
   * const baseUQuery = buildApi({
   * baseUrl: 'https://jsonplaceholder.typicode.com',
   * queryClient: new QueryClient(),
   * transformResponse: (response) => ({
   * ...response,
   * data: {
   * ...response.data,
   * createdAt: new Date(response.data.createdAt),
   * },
   * }),
   * });
   * ```
   */
  transformResponse?: BaseTransformResponse;
}

export function buildApi(config: BuildApiConfig) {
  const { baseQueryFn, queryClient, baseUrl, inject, transformResponse } =
    config;
  const defaultBaseQueryFn = axiosBaseQuery(
    baseUrl,
    inject,
    transformResponse
  ) as BaseQueryFnType;

  const customBaseQueryFn = baseQueryFn ?? defaultBaseQueryFn;

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
