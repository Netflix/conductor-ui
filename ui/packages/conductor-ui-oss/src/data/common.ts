import _ from "lodash";
import {
  useQuery,
  useQueries,
  useMutation,
  MutationOptions,
} from "react-query";
import useAppContext from "../hooks/useAppContext";

export function useFetchParallel(paths: string[][], reactQueryOptions?: any) {
  const { fetchWithContext, ready, stack } = useAppContext();

  return useQueries(
    paths.map((path: string[]) => {
      return {
        queryKey: [stack, ...path],
        queryFn: () => fetchWithContext(`/${path.join("/")}`),
        enabled: ready && _.get(reactQueryOptions, "enabled", true),
        keepPreviousData: true,
        ...reactQueryOptions,
      };
    }),
  );
}

export function useFetch<TData>(
  key: string[],
  path: string,
  reactQueryOptions?: any,
  defaultResponse?: any,
) {
  const { fetchWithContext, ready, stack } = useAppContext();

  return useQuery<TData>(
    [stack, ...key],
    () => {
      if (path) {
        return fetchWithContext(path);
      } else {
        return Promise.resolve(defaultResponse);
      }
    },
    {
      enabled: ready && _.get(reactQueryOptions, "enabled", true),
      keepPreviousData: true,
      ...reactQueryOptions,
    },
  );
}

export function useAction<TData>(
  path: string,
  method = "post",
  callbacks?: MutationOptions,
) {
  const { fetchWithContext } = useAppContext();
  return useMutation<TData>(
    (mutateParams) =>
      fetchWithContext(path, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: _.get(mutateParams, "body"),
      }),
    callbacks,
  );
}
