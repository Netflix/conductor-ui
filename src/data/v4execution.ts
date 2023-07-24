import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
  Query,
} from "react-query";
import useAppContext from "../hooks/useAppContext";
import { useFetch, useFetchParallel } from "./common";
import qs from "qs";
import _ from "lodash";
import { WorkflowDef } from "../types/workflowDef";
import { NamesAndVersions } from "../types/namesAndVersions";
const STALE_TIME_WORKFLOW_DEFS = 600000; // 10 mins
const STALE_TIME_SEARCH = 60000; // 1 min

export function useWorkflowSearch(searchObj: any) {
  const { fetchWithContext, ready, stack } = useAppContext();

  const pathRoot = "/workflow/search?";

  return useQuery(
    [stack, pathRoot, searchObj],
    () => {
      const { rowsPerPage, page, sort, freeText, query } = searchObj;
      const path =
        pathRoot +
        qs.stringify({
          start: (page - 1) * rowsPerPage,
          size: rowsPerPage,
          sort: sort,
          freeText: freeText,
          query: query,
        });
      return fetchWithContext(path);
      // staletime to ensure stable view when paginating back and forth (even if underlying results change)
    },
    {
      enabled: ready,
      keepPreviousData: true,
      staleTime: STALE_TIME_SEARCH,
    },
  );
}

export function useWorkflowsByIds(
  workflowIds: string[],
  reactQueryOptions: any,
) {
  return useFetchParallel(
    workflowIds.map((workflowId) => ["workflow", workflowId]),
    reactQueryOptions,
  );
}

export function useInvalidateWorkflows() {
  const { stack } = useAppContext();
  const client = useQueryClient();

  return function (workflowIds: string[]) {
    console.log("invalidating workflow Ids", workflowIds);
    client.invalidateQueries({
      predicate: (query: Query<any, any, any, any>) =>
        query.queryKey[0] === stack &&
        query.queryKey[1] === "workflow" &&
        workflowIds.includes(query.queryKey[2]),
    });
  };
}

export function useWorkflowDef(
  workflowName: string | undefined,
  version: string | undefined,
  defaultWorkflow: WorkflowDef | undefined,
  reactQueryOptions = {},
) {
  let path = "";
  const key = ["workflowDef", workflowName || ""];

  if (workflowName) {
    path = `/metadata/workflow/${workflowName}`;
    if (version) {
      path += `?version=${version}`;
      key.push(version);
    }
  }
  return useFetch<WorkflowDef>(
    key,
    path,
    { ...reactQueryOptions, enabled: !!workflowName },
    defaultWorkflow,
  );
}

export function useWorkflowDefs() {
  return useFetch<WorkflowDef[]>(["workflowDefs"], "/metadata/workflow", {
    staleTime: STALE_TIME_WORKFLOW_DEFS,
  });
}

export function useWorkflowNamesAndVersions() {
  return useFetch<NamesAndVersions>(
    ["workflowNamesAndVersions"],
    "/metadata/workflow/names-and-versions",
    {
      staleTime: STALE_TIME_WORKFLOW_DEFS,
    },
  );
}

export function usePaginatedWorkflowDefs(from = 0, to = 15, filter = "") {
  const { fetchWithContext, stack } = useAppContext();

  const rawNames = useWorkflowNames();

  const filteredNames = _.isEmpty(filter)
    ? rawNames
    : rawNames.filter((name) => name.includes(filter));
  const paginatedNames = filteredNames.slice(from, to);

  const results = useQueries(
    paginatedNames.map((name) => ({
      queryKey: [stack, "workflowDef", name],
      queryFn: () => fetchWithContext(`/metadata/workflow/${name}`),
      retry: 5,
    })),
  );

  const isFetching = useMemo(
    () =>
      _.isEmpty(rawNames) || results.findIndex((row) => row.isLoading) !== -1,
    [rawNames, results],
  );
  const workflows = useMemo(
    () =>
      isFetching
        ? []
        : results.filter((row) => row.isSuccess).map((row) => row.data),
    [results, isFetching],
  );

  return {
    isFetching,
    rawHits: isFetching ? null : rawNames.length,
    totalHits: isFetching ? null : filteredNames.length,
    workflows: workflows,
  };
}

export function useLatestWorkflowDefs() {
  const { data, ...rest } = useWorkflowDefs();

  // Filter latest versions only
  const workflows = useMemo(() => {
    if (data) {
      const unique = new Map();
      for (let workflowDef of data) {
        if (!unique.has(workflowDef.name)) {
          unique.set(workflowDef.name, workflowDef);
        } else if (unique.get(workflowDef.name).version < workflowDef.version) {
          unique.set(workflowDef.name, workflowDef);
        }
      }

      return Array.from(unique.values());
    }
  }, [data]);

  return {
    data: workflows,
    ...rest,
  };
}

export function useSaveWorkflow(callbacks: any) {
  const path = "/metadata/workflow";
  const { fetchWithContext } = useAppContext();

  return useMutation(
    ({ body, isNew }: { body: any; isNew: boolean }) =>
      fetchWithContext(path, {
        method: isNew ? "post" : "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isNew ? body : [body]),
      }),
    callbacks,
  );
}

export function useWorkflowNames() {
  const { data } = useWorkflowNamesAndVersions();
  // Extract unique names
  return useMemo(() => {
    if (data) {
      return Object.keys(data)
        .map((val) => val.trim())
        .sort();
    } else {
      return [];
    }
  }, [data]);
}

export function useStartWorkflow(callbacks: any) {
  const path = "/workflow";
  const { fetchWithContext } = useAppContext();

  return useMutation(
    ({ body }: { body: any }) =>
      fetchWithContext(path, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
    callbacks,
  );
}
