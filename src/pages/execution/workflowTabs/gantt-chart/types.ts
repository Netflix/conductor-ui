import { TaskResultType } from "../../../../types/execution";

export interface StyleClass {
  style?: React.CSSProperties;
  className?: string;
}

export interface Styles {
  span?: StyleClass;
  waitSpan?: StyleClass;
  spanLabelExternal?: StyleClass;
  spanLabelInternal?: StyleClass;
  band?: StyleClass;
  bandLabel?: StyleClass;
  canvas?: StyleClass;
  root?: StyleClass;
}

export interface Datum {
  w1?: Date;
  iteration: number;
  status: string;
  t1: Date;
  t2: Date;
  id: string;
  styles?: Pick<
    Styles,
    "span" | "waitSpan" | "spanLabelExternal" | "spanLabelInternal"
  >;
}

export interface Series {
  id: string;
  label: string;
  labelSvgIcon?: JSX.Element;
  data: Datum[];
  parentTaskReferenceName: string;
  referenceTaskName: string;
  taskType: TaskResultType;
  status: string;
  styles?: Pick<Styles, "band" | "bandLabel">;
}

export interface Margins {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export interface GanttChartAPI {
  min: Date;
  max: Date;
  isZoomed: boolean;
  scopedMin?: Date;
  scopedMax?: Date;
  xScale: d3.ScaleTime<number, number>;
  selectedLabel?: { id: string; label: string };
  zoom: (dateA: Date, dateB: Date) => void;
  resetZoom: () => void;
  closeMenu: () => void;
}

export interface Band {
  height?: number;
  padding?: number;
}

export interface GanttProps {
  max: Date;
  min: Date;
  viewportRef?: React.MutableRefObject<HTMLDivElement>;
  style?: StyleClass["style"];
  className?: StyleClass["className"];
  band?: {
    height?: number;
    padding?: number;
  };
  margins?: Margins;
  setAPI?: (arg0: GanttChartAPI) => void;
}
