import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";
import type { useStyles } from "../components/styles";

export interface GanttContextState {
  ref: MutableRefObject<HTMLDivElement>;
  classes: ReturnType<typeof useStyles>;
  viewportRef: React.MutableRefObject<HTMLDivElement>;
}

export const GanttContext = createContext<GanttContextState>(null);

export const useGanttContext = (): GanttContextState => {
  const ganttContext = useContext(GanttContext);
  if (!ganttContext) {
    throw new Error("GanttContext can only be requested within a GanttChart");
  }
  return ganttContext;
};
