import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, Tooltip } from "@mui/material";
import {
  Bars,
  Cursor,
  GanttChart,
  Highlight,
  Series,
  XAxis,
  YAxis,
  useGanttChartAPI,
} from "./";
import { HighlightActions } from "./HighlightActions";
import { blue07, red, yellow07 } from "../../../../theme/colors";
import { fontFamily, fontSizes } from "../../../../theme/variables";
import { Datum } from "./types";
import { TaskResult, TaskResultType } from "../../../../types/execution";
import { TaskCoordinate } from "../../../../types/workflowDef";
import WorkflowDAG from "../../../../components/diagram/WorkflowDAG";
import InfoIcon from "@mui/icons-material/Info";

const [DO_WHILE, FORK_JOIN_DYNAMIC, FORK] = [
  "DO_WHILE",
  "FORK_JOIN_DYNAMIC",
  "FORK",
];
const collapseTaskTypes = [DO_WHILE, FORK, FORK_JOIN_DYNAMIC];
const [FAILED, IN_PROGRESS, SCHEDULED, TIMED_OUT] = [
  "FAILED",
  "IN_PROGRESS",
  "SCHEDULED",
  "TIMED_OUT",
];
const ongoingStates = [IN_PROGRESS, SCHEDULED];
const [BARHEIGHT, ALIGNMENTRATIOALONGYBANDWIDTH] = [22, 0.3];
type ConductorTimelineProps = {
  data: TaskResult[];
  onClick: (id: string) => void;
  viewportRef: React.MutableRefObject<HTMLDivElement>;
  selectedTask: TaskCoordinate;
  dag: WorkflowDAG;
};

export default function ConductorTimeline({
  dag,
  data,
  selectedTask,
  onClick,
  viewportRef,
}: ConductorTimelineProps) {
  const { resetZoom } = useGanttChartAPI();
  /** Function to return the style object of a span - based on the span status and selection state. */
  const spanStyle = useCallback(
    (taskId: string, status: string) => {
      return taskId === selectedTask?.id
        ? {
            style: {
              fill: blue07,
            },
          }
        : [FAILED, TIMED_OUT].includes(status)
        ? {
            style: {
              fill: red,
            },
          }
        : ongoingStates.includes(status)
        ? {
            style: {
              fill: yellow07,
            },
          }
        : {};
    },
    [selectedTask],
  );
  /** Map from task reference name to task type */
  const taskTypeMap = useMemo(
    () =>
      new Map<string, TaskResultType>(
        data.map(({ referenceTaskName, taskType }) => [
          referenceTaskName,
          taskType,
        ]),
      ),
    [data],
  );
  /** ID of tasks which have children: DO_WHILE, FORK, FORK_JOIN_DYNAMIC */
  const collapsibleTasks = useMemo<Set<string>>(
    () =>
      new Set(
        data
          ?.filter((task) =>
            collapseTaskTypes.includes(task.taskType as string),
          )
          .map((task) => task.taskId),
      ),
    [data],
  );
  /** Map from id to boolean of whether a task is expanded */
  const [taskExpanded, setTaskExpanded] = useState<Map<string, boolean>>(
    new Map<string, boolean>(
      Array.from(collapsibleTasks).map((id) => [id, false]),
    ),
  );
  /** Full expansion of timeline data. Simplified to contain information relevant to timeline  */
  const initialData = useMemo<Series[]>(() => {
    let series: Series[] = [];
    let seenTaskNameToIndexMap: Map<string, number> = new Map<string, number>();
    data?.forEach(
      (
        {
          taskId,
          scheduledTime,
          startTime,
          endTime,
          parentTaskReferenceName,
          referenceTaskName,
          taskType,
          status,
          iteration,
        }: any,
        index: number,
      ) => {
        let endTimeDate: Date = endTime ? new Date(endTime) : new Date();
        let startTimeDate: Date = startTime ? new Date(startTime) : new Date();
        let span: Datum = {
          id: taskId, //span id
          status: status,
          t1: startTimeDate,
          t2: endTimeDate,
          w1: new Date(scheduledTime),
          iteration,
          styles: {
            span: spanStyle(taskId, status),
            waitSpan: spanStyle(taskId, status),
          },
        };
        if (
          !seenTaskNameToIndexMap.has(referenceTaskName) ||
          taskTypeMap.get(parentTaskReferenceName) === "DO_WHILE"
        ) {
          series.push({
            id: taskId,
            label: `${referenceTaskName}`,
            parentTaskReferenceName,
            referenceTaskName,
            taskType,
            status,
            data: [span],
          });
          seenTaskNameToIndexMap.set(referenceTaskName, index);
        } else {
          let retryTask: Series =
            series[seenTaskNameToIndexMap.get(referenceTaskName)];
          retryTask.data.push(span);
        }
      },
    );
    return series;
  }, [data, spanStyle, taskTypeMap]);
  /** Map from task ID to index in fully expanded data */
  const idToIndexMap = useMemo(
    () =>
      new Map<string, number>(initialData.map((task, idx) => [task.id, idx])),
    [initialData],
  );
  /** Data for the fully collapsed view of the workflow */
  const collapsedData = useMemo<Series[]>(() => {
    let data: Series[] = [];
    initialData.forEach((task, idx) => {
      const {
        referenceTaskName: refTaskName,
        parentTaskReferenceName: parentTaskRefName,
        taskType,
      } = task;
      if (
        !parentTaskRefName ||
        !collapseTaskTypes.includes(
          taskTypeMap.get(parentTaskRefName) as string,
        )
      ) {
        data.push(task);
        if (taskType === DO_WHILE) {
          let i = idx + 1;
          let subTaskData: Series[] = [];
          while (
            i < initialData.length &&
            initialData[i].parentTaskReferenceName === refTaskName
          ) {
            let subTaskRefName = initialData[i].referenceTaskName;
            let subTaskIndex = subTaskData.findIndex(
              (tsk) => tsk.referenceTaskName === subTaskRefName,
            );
            if (subTaskIndex === -1) {
              subTaskData.push(initialData[i]);
            } else {
              subTaskData[subTaskIndex] = {
                ...subTaskData[subTaskIndex],
                data: [
                  ...subTaskData[subTaskIndex].data,
                  initialData[i].data[0],
                ],
              };
            }
            i++;
          }
          data.push(...subTaskData);
        } else if (taskType === FORK_JOIN_DYNAMIC || taskType === FORK) {
          let i = idx + 1;
          let maxTime = data.at(-1).data.at(-1).t2;
          while (
            i < initialData.length &&
            initialData[i].parentTaskReferenceName === refTaskName
          ) {
            if (initialData[i].data.at(-1).t2 > maxTime) {
              maxTime = initialData[i].data.at(-1).t2;
            }
            i++;
          }
          if (maxTime > data.at(-1).data.at(-1).t2) {
            data[data.length - 1] = {
              ...task,
              data: [{ ...task.data[0], t2: maxTime }],
            };
          }
        }
      }
    });
    return data;
  }, [initialData, taskTypeMap]);
  /** ID of Tasks which exist in fully collapsed view (may or may not have subtasks) */
  const parentTaskIds = useMemo<string[]>(
    () =>
      initialData
        .filter((task) => {
          const { parentTaskReferenceName: parentTaskRefName } = task;
          if (
            !parentTaskRefName ||
            !collapseTaskTypes.includes(
              taskTypeMap.get(parentTaskRefName) as string,
            )
          ) {
            return true;
          }
          return false;
        })
        .map((task) => task.id),
    [initialData, taskTypeMap],
  );
  /** Map of Task IDs to their content when collapsed */
  const collapsedTaskMap = useMemo<Map<string, Series[]>>(() => {
    let subTaskMap = new Map<string, Series[]>();
    parentTaskIds.forEach((taskId) => {
      let taskIdx = idToIndexMap.get(taskId);
      let task = initialData[taskIdx];
      subTaskMap.set(taskId, [task]);
      let i = taskIdx + 1;
      let subTaskArr = subTaskMap.get(taskId);
      while (
        i < initialData.length &&
        initialData[i].parentTaskReferenceName === task.referenceTaskName
      ) {
        if (task.taskType === DO_WHILE) {
          let subTaskRefName = initialData[i].referenceTaskName;
          let idx = subTaskArr.findIndex(
            (subTask) => subTask.referenceTaskName === subTaskRefName,
          );
          if (idx === -1) {
            subTaskArr.push(initialData[i]);
          } else {
            subTaskArr[idx] = {
              ...subTaskArr[idx],
              data: [...subTaskArr[idx].data, initialData[i].data[0]],
            };
          }
        } else if (
          task.taskType === FORK_JOIN_DYNAMIC ||
          task.taskType === FORK
        ) {
          let newTime: Date = initialData[i].data[0].t2;
          let oldTime: Date = subTaskArr[0].data[0].t2;
          if (oldTime < newTime) {
            subTaskArr[0] = {
              ...subTaskArr[0],
              data: [{ ...subTaskArr[0].data[0], t2: newTime }],
            };
          }
        }
        i++;
      }
      subTaskMap.set(taskId, subTaskArr);
    });
    return subTaskMap;
  }, [idToIndexMap, initialData, parentTaskIds]);
  /** Map of Task IDs to their content when expanded */
  const expandedTaskMap = useMemo<Map<string, Series[]>>(() => {
    let subTaskMap = new Map<string, Series[]>();
    parentTaskIds.forEach((taskId) => {
      let taskIdx = idToIndexMap.get(taskId);
      let task = initialData[taskIdx];
      subTaskMap.set(taskId, [task]);
      let i = taskIdx + 1;
      let subTaskArr = subTaskMap.get(taskId);
      while (
        i < initialData.length &&
        initialData[i].parentTaskReferenceName === task.referenceTaskName
      ) {
        subTaskArr.push(initialData[i]);
        i++;
      }
      subTaskMap.set(taskId, subTaskArr);
    });
    return subTaskMap;
  }, [idToIndexMap, initialData, parentTaskIds]);

  const [series, setSeries] = useState<Series[]>(collapsedData);

  const seriesMax = useCallback(() => {
    let task: Series = series[series.length - 1];
    let idx: number = task.data.length - 1;
    return task.data[idx].t2;
  }, [series]);

  const seriesMin = useCallback(() => {
    let task: Series = series[0];
    return task.data[0].w1 || task.data[0].t1;
  }, [series]);

  const [expanded, setExpanded] = useState<boolean>(false);

  const max = useMemo(
    () => (series && series.length ? seriesMax() : null),
    [series, seriesMax],
  );
  const min = useMemo(
    () => (series && series.length ? seriesMin() : null),
    [series, seriesMin],
  );

  useEffect(() => {
    !selectedTask?.id &&
      selectedTask?.ref &&
      onClick(dag.getTaskResultByRef(selectedTask.ref).taskId);

    setSeries(
      series.map((task) => {
        task.data.forEach((span) => {
          span.styles = {
            span: spanStyle(span.id, span.status),
            waitSpan: spanStyle(span.id, span.status),
          };
        });
        return task;
      }),
    );
    //eslint-disable-next-line
  }, [selectedTask]);

  function toggleAll() {
    if (expanded) {
      let newData = [];
      taskExpanded.forEach(
        (value, key) => value && setTaskExpanded(taskExpanded.set(key, false)),
      );
      parentTaskIds.forEach((taskId) =>
        collapsedTaskMap.get(taskId).forEach((span) => newData.push(span)),
      );
      setSeries(newData);
    } else {
      taskExpanded.forEach(
        (value, key) => !value && setTaskExpanded(taskExpanded.set(key, true)),
      );
      setSeries(initialData);
    }
    setExpanded(!expanded);
  }

  function toggleExpansion(parentTaskID: string) {
    let taskIsExpanded = taskExpanded.get(parentTaskID);
    let parentTask = initialData[idToIndexMap.get(parentTaskID)];
    let newData: Series[] = series.filter(
      (tsk) => tsk.parentTaskReferenceName !== parentTask.referenceTaskName,
    );
    if (taskIsExpanded) {
      let currTaskIndex = newData.findIndex((tsk) => tsk.id === parentTaskID);
      setSeries([
        ...newData.slice(0, currTaskIndex),
        ...collapsedTaskMap.get(parentTaskID),
        ...newData.slice(currTaskIndex + 1),
      ]);
    } else {
      let currTaskIndex = series.findIndex((tsk) => tsk.id === parentTaskID);
      setSeries([
        ...newData.slice(0, currTaskIndex),
        ...expandedTaskMap.get(parentTaskID),
        ...newData.slice(currTaskIndex + 1),
      ]);
    }
    setTaskExpanded(taskExpanded.set(parentTaskID, !taskIsExpanded));
  }

  function zoomToFit() {
    if (max && min) {
      resetZoom();
    }
  }

  return (
    <>
      <ButtonGroup orientation="horizontal">
        <Button onClick={toggleAll}>
          {expanded ? "Collapse All" : "Expand All"}
        </Button>
        <Button onClick={zoomToFit}>Zoom To Fit</Button>
        <div style={{ position: "relative", top: "10px", marginLeft: "10px" }}>
          <Tooltip title="Click and drag to zoom" placement="right">
            <InfoIcon sx={{ fontSize: 20 }} color="primary" />
          </Tooltip>
        </div>
      </ButtonGroup>
      <GanttChart min={min} max={max} viewportRef={viewportRef}>
        <Bars
          barHeight={BARHEIGHT}
          waitHeightDelta={2}
          alignmentRatioAlongYBandwidth={ALIGNMENTRATIOALONGYBANDWIDTH}
          onSpanClick={(datum) => {
            onClick(selectedTask?.id === datum.id ? null : datum.id);
          }}
          data={series}
          font={`${fontSizes.fontSize3} ${fontFamily.fontFamilySans}`}
        />
        <YAxis
          toggleRow={toggleExpansion}
          collapsibleRows={collapsibleTasks}
          rows={series}
          taskExpanded={taskExpanded}
          selectedTask={selectedTask}
        />
        <XAxis />
        <Cursor />

        <Highlight>
          <HighlightActions />
        </Highlight>
      </GanttChart>
    </>
  );
}
