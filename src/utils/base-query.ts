import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export type BaseQueryFnType = <
  ResultType,
  ErrorType,
  QueryFnType extends (...args: any[]) => any
>(
  queryFn: QueryFnType
) => Promise<{ data?: ResultType; error?: ErrorType }>;

/**
 * A base query function for `react-query` that uses `axios` to make requests.
 * @param baseUrl The base URL to use for all requests.
 * @returns A base query function for `react-query`.
 *
 * @example
 * ```ts
 * import { useQuery } from 'react-query';
 * import { axiosBaseQuery } from './blackAxios';
 *
 * const baseQueryFn = axiosBaseQuery();
 *
 * function useUserQuery() {
 *  return useQuery('user', () => baseQueryFn({ url: '/user' }));
 * }
 */
export const axiosBaseQuery = <ResultType, ErrorType>(
  baseUrl: string,
  inject: (config: AxiosRequestConfig) => AxiosRequestConfig = (config) =>
    config,
  transformResponse: (response: unknown) => unknown = (response) => response
): BaseQueryFnType =>
  async function axiosBaseQuery<
    ResultType,
    ErrorType,
    QueryFnType extends AxiosRequestConfig & { body?: any; token?: string }
  >(queryFn: QueryFnType): Promise<{ data?: ResultType; error?: ErrorType }> {
    try {
      const {
        url,
        method,
        data,
        body,
        params,
        headers,
        token: __,
      } = queryFn as AxiosRequestConfig & { body?: any; token?: string };

      const result = await axios({
        url: baseUrl + url,
        method,
        data: body || data,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...inject(queryFn),
      });

      if (transformResponse)
        return transformResponse(result) as {
          data?: ResultType;
          error?: ErrorType;
        };

      return result as { data?: ResultType; error?: ErrorType };
    } catch (axiosError) {
      const err = axiosError as AxiosError<ErrorType>;
      throw err?.response?.data || err;
    }
  };
