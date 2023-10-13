import React from "react";
import { createContext } from "react";
import { Execution } from "../../export";

export type WorkflowActionsProps = {
  execution: Execution;
};

export type AppContextType = {
  ready: boolean;
  env: string;
  stack: string;
  defaultStack: string;
  customTypeRenderers: any;
  customExecutionSummaryRows: Array<any>;
  customTaskSummaryRows: Array<any>;
  CustomWorkflowActions?: React.ComponentType<WorkflowActionsProps>;
  fetchWithContext: (path: string, fetchParams?: any) => Promise<any>;
};
export default createContext<AppContextType>({
  ready: false,
  env: "",
  stack: "",
  defaultStack: "",
  customTypeRenderers: {},
  customExecutionSummaryRows: [],
  customTaskSummaryRows: [],
  CustomWorkflowActions: undefined,
  fetchWithContext: () => Promise.resolve(),
});
