import { createContext } from "react";

export type AppContextType = {
  ready: boolean;
  stack: string;
  defaultStack: string;
  customTypeRenderers: any;
  customExecutionSummaryRows: Array<any>;
  customTaskSummaryRows: Array<any>;
  CustomWorkflowActions?: Function;
  fetchWithContext: (path: string, fetchParams?: any) => Promise<any>;
}
export default createContext<AppContextType>({
  ready: false,
  stack: "",
  defaultStack: "",
  customTypeRenderers: {},
  customExecutionSummaryRows: [],
  customTaskSummaryRows: [],
  CustomWorkflowActions: undefined,
  fetchWithContext: () => Promise.resolve(),
});
