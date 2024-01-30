import type {
  InvalidateQueryFilters,
  QueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

import type {
  ListenerAction,
  ListenerConfig,
  MutationDefinition,
  QueryDefinition,
} from '../types';

/**
 * A function that creates a usable Listener API from a set of endpoints.
 *
 * @param listeners The listeners to create a usable API from.
 * @returns A usable Listener API.
 *
 * @example
 * import { createUsableApi } from '@lib/usable-query';
 *
 * const authApiCreator = createUsableApi({
 *  endpoints: (builder) => ({
 *   login: builder.mutation<{ username: string; password: string }, { token: string }>({
 *   key: 'login',
 *  mutationFn: ({ username, password }) => ({
 *   url: '/auth/login',
 *  method: 'POST',
 * data: { username, password },
 * }),
 *
 * export {useLoginMutation} = authApiCreator;
 *
 * authApiCreator.startListening({
 *  matches: (action) => action.key === 'login',
 *  performAction: (action) => {
 *   if (action.state === 'success') {
 *    console.log(`Login successful:`, action.data);
 *   } else if (action.state === 'error') {
 *    console.error(`Login failed:`, action.error);
 *   } else if (action.state === 'loading') {
 *    console.log(`Login started`);
 *   }
 *  },
 * });
 */
export const usableListen = <TData extends unknown, TError extends unknown>(
  listeners: Array<ListenerConfig<TData, TError>>,
  queryClient: QueryClient
) => {
  const startListening = (listenerConfig: ListenerConfig) => {
    listeners.push(listenerConfig);
  };

  const stopListening = (listenerConfig: ListenerConfig) => {
    /**
     * We want to eminently stop listening to the listenerConfig after it has performed its action.
     *
     */
    const index = listeners.indexOf(listenerConfig);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };

  const notifyListeners = (action: {
    type: 'query' | 'mutation';
    key: string;
    state: 'success' | 'error' | 'loading';
    data?: TData;
    error?: TError;
  }) => {
    // Map each listener to a promise
    const promises = listeners.map((listener) => {
      if (listener.matches(action)) {
        return (
          listener.performAction(action) as unknown as Promise<void>
        ).then((e) => {
          if (action.state === 'success') {
            stopListening(listener as ListenerConfig);
          }
        });
      }

      return Promise.resolve();
    });

    return Promise.all(promises);
  };

  type DefinitionKey<T extends 'query' | 'mutation'> = T extends 'query'
    ? QueryDefinition<any, any>
    : MutationDefinition<any, any>;

  const buildListeners = <T extends 'query' | 'mutation'>(
    type: 'query' | 'mutation',
    options: T extends 'query' ? UseQueryOptions<any> : UseMutationOptions<any>,
    definition: DefinitionKey<T>
  ): ListenerAction => ({
    onStart: () => {
      notifyListeners({ type, key: definition?.key || '', state: 'loading' });
    },
    onSuccess: async (data, variable, mutation) => {
      await notifyListeners({
        type,
        key: definition?.key || '',
        state: 'success',
        data: data as TData,
      });

      if (
        typeof (definition as DefinitionKey<'mutation'>).setCache === 'function'
      ) {
        (
          definition as DefinitionKey<'mutation'> & {
            setCache: (queryClient: any, options: any) => void;
          }
        ).setCache(queryClient, {
          data,
          variable,
          mutation,
        });
      }

      if ((definition as DefinitionKey<'mutation'>).invalidatesQueries) {
        (definition as DefinitionKey<'mutation'>)?.invalidatesQueries?.forEach(
          (queryKey: Record<string, unknown>) => {
            const keys = Object.keys(queryKey);
            queryClient.invalidateQueries(keys as InvalidateQueryFilters);
          }
        );
      }

      /**
       * Cast the options to UseMutationOptions to get access to the onSuccess callback.
       * This is a bit of a hack, but it works.
       * @todo Find a better way to do this.
       */
      (options as UseMutationOptions<any>)?.onSuccess?.(
        data,
        variable,
        mutation
      );
    },
    onError: async (error, variable, mutation) => {
      await notifyListeners({
        type,
        key: definition.key || '',
        state: 'error',
        error: error as TError,
      });

      /**
       * Cast the options to UseMutationOptions to get access to the onSuccess callback.
       * This is a bit of a hack, but it works.
       * @todo Find a better way to do this.
       */
      (options as UseMutationOptions<any>)?.onError?.(
        error,
        variable,
        mutation
      );
    },
    onSettled: async (data, error, variable, context) => {
      // onSettled is called whether the query was successful or not
      const state = error ? 'error' : 'success';
      await notifyListeners({
        type,
        key: definition.key || '',
        state,
        data: data as TData,
        error: error as TError,
      });

      /**
       * Cast the options to UseMutationOptions to get access to the onSuccess callback.
       * This is a bit of a hack, but it works.
       * @todo Find a better way to do this.
       */
      (options as UseMutationOptions<any>)?.onSettled?.(
        data,
        error,
        variable,
        context
      );
    },
  });

  return {
    startListening,
    buildListeners,
  };
};
