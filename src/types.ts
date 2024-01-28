import type {
  QueryClient,
  UseMutationOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

export type ListenerConfig<TData = unknown, TError = unknown> = {
  matches: (action: { type: 'query' | 'mutation'; key: string }) => boolean;
  performAction: (action: {
    type: 'query' | 'mutation';
    key: string;
    state: 'success' | 'error' | 'loading';
    data?: TData;
    error?: TError;
  }) => void;
};

export type UsableQueryOptions<Definitions> = {
  key?: string;
  endpoints: QueryArgs<Definitions>;
  setup?: {
    queryClient: QueryClient;
    baseQueryFn: any;
  };
};

export type ListenerAction<TData = unknown, TError = unknown> = {
  onSuccess: (data: TData, variable?: void, context?: TData) => void;
  onError: (error: TError, variable?: void, context?: TData) => void;
  onSettled: (
    data: TData,
    error: TError,
    variable?: void,
    context?: TData
  ) => void;
  onStart: () => void;
};

export type QueryDefinition<Args, ResultType> = {
  key?: string;
  isInfinite?: boolean;
  queryFn: (args: Args) => AxiosRequestConfig<ResultType>;
  transformResponse?: (response: unknown) => unknown;
};

export type MutationDefinition<Args, ResultType> = {
  key?: string;
  mutationFn: (args: Args) => AxiosRequestConfig<ResultType>;
  invalidatesQueries?: unknown[];
  setCache?: (
    queryClient: QueryClient,
    action: {
      data: ResultType;
      variable: Args;
      context: unknown;
    }
  ) => void;
  transformResponse?: (response: unknown) => unknown;
};

export type Endpoints = Record<
  string,
  QueryDefinition<unknown, unknown> | MutationDefinition<unknown, unknown>
>;

export type UsableQueryHook<
  K extends unknown,
  Z extends 'Query' | 'Mutation' = 'Query'
> = `use${Capitalize<K extends string ? K : never>}${Z}`;

export type UsableApiDefinition<
  K extends keyof Endpoints,
  Definitions extends Endpoints,
  Z extends true | false = true
> = Definitions[K] extends QueryDefinition<infer Args, infer ResultType>
  ? Z extends true
    ? ((
        args: Args,
        options?: UseQueryOptions<ResultType>
      ) => ReturnType<typeof useQuery<ResultType>> &
        Omit<
          ReturnType<typeof useInfiniteQuery<ResultType>>,
          'data' | 'error'
        >) & {}
    : (options: Args, extra?: unknown) => Promise<ResultType>
  : Definitions[K] extends MutationDefinition<infer Args, infer ResultType>
  ? (
      options?: UseMutationOptions<ResultType, unknown, Args>
    ) => ReturnType<typeof useMutation<ResultType, unknown, Args>>
  : never;

export type UsableApi<Definitions extends Endpoints> = {
  [K in keyof Definitions]: UsableApiDefinition<
    K extends string ? K : never,
    Definitions,
    false
  >;
} & {
  [T in keyof Definitions as UsableQueryHook<
    string & T,
    Definitions[T] extends QueryDefinition<unknown, unknown>
      ? 'Query'
      : 'Mutation'
  >]: UsableApiDefinition<T extends string ? T : never, Definitions, true>;
} & {
  startListening: (listenerConfig: ListenerConfig) => void;
};

export type QueryArgs<U> = (builder: {
  query: <Args, ResultType>(
    definition: QueryDefinition<Args, ResultType>
  ) => QueryDefinition<Args, ResultType>;
  mutation: <Args, ResultType>(
    definition: MutationDefinition<Args, ResultType>
  ) => MutationDefinition<Args, ResultType>;
}) => U;
