import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { capitalizeFirstLetter, stringifyURL, usableListen } from './utils';

import type {
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

import type {
  Endpoints,
  ListenerConfig,
  MutationDefinition,
  QueryDefinition,
  UsableApi,
  UsableQueryOptions,
} from './types';

/**
 * A function that creates a usable API from a set of endpoints.
 * @param endpoints The endpoints to create a usable API from.
 * @returns A usable API.
 *
 * @example
 * ```ts
 * import { createUsableQuery } from '@lib/usable-query';
 *
 * const authApiCreator = createUsableQuery({
 *  endpoints: (builder) => ({
 *   login: builder.mutation<{ username: string; password: string }, { token: string }>({
 *   key: 'login',
 *  mutationFn: ({ username, password }) => ({
 *   url: '/auth/login',
 *  method: 'POST',
 * data: { username, password },
 * }),
 *
 *
 * export {useLoginMutation} = authApiCreator;
 */
export const createUsableQuery = <Definitions extends Endpoints>(
  options: UsableQueryOptions<Definitions>
) => {
  const { endpoints } = options;
  const { queryClient, baseQueryFn } = options.setup;
  const builder = {
    query: <Args, ResultType>(definition: QueryDefinition<Args, ResultType>) =>
      definition,
    mutation: <Args, ResultType>(
      definition: MutationDefinition<Args, ResultType>
    ) => definition,
  };

  const apiDefinitions = endpoints(builder!);

  const usableApi = {} as UsableApi<Definitions>;
  const listeners: ListenerConfig[] = [];

  const { startListening, buildListeners } = usableListen(
    listeners,
    queryClient
  );

  type HookName<K extends string> = `use${Capitalize<K>}${K extends any
    ? 'Query'
    : 'Mutation'}`;

  for (const [key, definition] of Object.entries(apiDefinitions)) {
    const hookName = `use${capitalizeFirstLetter(key)}${
      'queryFn' in definition ? 'Query' : 'Mutation'
    }` as HookName<typeof key>;

    if ('queryFn' in definition) {
      (usableApi as any)[key] = (
        args: any,
        options?: UseQueryOptions<any> & {
          extra?: {
            /**
             * any is used here because we want to allow for both the req object from Next.js and the headers object from Express.
             */
            req?: any;
            headers?: Record<string, string>;
            cookies?: Record<string, string>;
          };
        }
      ) => {
        const { extra, ...rest } = options || {};
        /**
         * We want to use the queryClient directly here instead of the useQuery hook
         * for use cases where we want to use the queryClient outside of a React component.
         */
        return queryClient.fetchQuery({
          queryKey: [definition.key, key, args],
          queryFn: () => {
            if (typeof definition.transformResponse === 'function') {
              return definition.transformResponse(
                baseQueryFn({
                  ...(definition.queryFn(args) as any),
                  token: extra?.req?.cookies?.token || extra?.cookies?.token,
                  headers: extra?.req?.headers || extra?.headers,
                })
              );
            }

            return baseQueryFn({
              ...(definition.queryFn(args) as any),
              token: extra?.req?.cookies?.token || extra?.cookies?.token,
              headers: extra?.req?.headers || extra?.headers,
            });
          },
          ...rest,
        });
      };

      type UseQueryOptionsType = typeof definition.isInfinite extends true
        ? UseInfiniteQueryOptions<any>
        : UseQueryOptions<any>;

      (usableApi as any)[hookName] = (
        args?: any,
        options?: UseQueryOptionsType
      ) => {
        const isInfinite = definition.isInfinite;
        const useFetchQuery: any = isInfinite ? useInfiniteQuery : useQuery;
        const _options = {
          ...options,
          onError: (error: unknown) => {
            return options?.onError?.(error);
          },
        } as UseQueryOptionsType;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useFetchQuery({
          queryKey: [definition.key, key, args].filter(Boolean),
          queryFn: (context: any) => {
            const queryOptions = definition.queryFn(args);

            if (typeof definition.transformResponse === 'function') {
              return definition.transformResponse(
                baseQueryFn(definition.queryFn(queryOptions) as any)
              );
            }

            return baseQueryFn(
              isInfinite && context?.pageParam
                ? {
                    ...queryOptions,
                    url: stringifyURL(queryOptions?.url!, {
                      ...args,
                      cursor: `next.${context?.pageParam}`,
                    }),
                  }
                : (queryOptions as any)
            );
          },

          ...(isInfinite && {
            getNextPageParam: (lastPage: any) => {
              return lastPage?.pagination?.next;
            },

            select: (data: any) => {
              return data?.pages
                ?.flatMap((page: any) => page)
                ?.reduce((acc: any, curr: any) => {
                  Object.keys(curr).forEach((key) => {
                    if (Array.isArray(curr[key])) {
                      acc[key] = [...(acc[key] || []), ...curr[key]];
                    } else {
                      acc[key] = curr[key];
                    }
                  });

                  return acc;
                }, {});
            },
          }),

          ..._options,
          ...buildListeners('query', _options!, definition),
        });
      };
    } else if ('mutationFn' in definition) {
      (usableApi as any)[hookName] = (
        options?: UseMutationOptions<any, unknown, any>
      ) => {
        const _options = {
          ...options,
          onError: (error: unknown, variable: unknown, mutation: unknown) => {
            return options?.onError?.(error, variable, mutation);
          },
        } as UseMutationOptions<any, unknown, any>;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useMutation({
          mutationKey: [key, definition.key].filter(Boolean),
          mutationFn: (args: any) => {
            if (typeof definition.transformResponse === 'function') {
              return definition.transformResponse(
                baseQueryFn(definition.mutationFn(args) as any)
              );
            }

            return baseQueryFn(definition.mutationFn(args) as any);
          },

          ..._options,
          ...buildListeners('mutation', _options!, definition),
        });
      };
    }
  }

  return {
    ...usableApi,
    startListening,
  };
};
