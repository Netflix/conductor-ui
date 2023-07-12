import React, { useMemo, useState } from "react";
import { timestampRenderer, durationRenderer } from "../../../utils/helpers";
import _ from "lodash";
import "./timeline.scss";
import WorkflowDAG from "../../../components/diagram/WorkflowDAG";
import { TaskResult } from "../../../types/execution";
import { TaskCoordinate } from "../../../types/workflowDef";
import ConductorTimeline from "./gantt-chart/ConductorTimeline";

export default function TimelineComponent({
  dag,
  tasks,
  onClick,
}: {
  dag: WorkflowDAG;
  tasks: TaskResult[];
  onClick: (task: TaskCoordinate | null) => void;
}) {
  const timelineRef = React.useRef<HTMLDivElement>(null);

  /*
  const selectedId = useMemo(() => {
    if(selectedTask){
      const taskResult = dag.resolveTaskResult(selectedTask);
      return _.get(taskResult, "taskId")
    }
  }, [dag, selectedTask]);
  */
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const { items, groups } = useMemo(() => {
    const groupMap = new Map();
    for (const task of tasks) {
      groupMap.set(task.referenceTaskName, {
        id: task.referenceTaskName,
        content: `${task.referenceTaskName} (${task.taskDefName})`,
      });
    }

    const items = tasks
      .filter((t) => t.startTime > 0 || t.endTime > 0)
      .map((task) => {
        const startTime =
          task.startTime > 0
            ? new Date(task.startTime)
            : new Date(task.endTime);
        const endTime =
          task.endTime > 0 ? new Date(task.endTime) : new Date(task.startTime);
        const duration = durationRenderer(
          endTime.getTime() - startTime.getTime(),
        );
        const retval = {
          id: task.taskId,
          group: task.referenceTaskName,
          content: `${duration}`,
          start: startTime,
          end: endTime,
          title: `${task.referenceTaskName} (${
            task.status
          })<br/>${timestampRenderer(startTime)} - ${timestampRenderer(
            endTime,
          )}`,
          className: `status_${task.status}`,
        };

        /* TODO: disable grouping
        if (task.taskType === "FORK_JOIN_DYNAMIC") {
          //retval.subgroup=task.referenceTaskName
          const gp = groupMap.get(dfParent.ref);
          if (!gp.nestedGroups) {
            gp.nestedGroups = [];
          }
          groupMap.get(task.referenceTaskName).treeLevel = 2;
          gp.nestedGroups.push(task.referenceTaskName);
        }
        */
        return retval;
      });

    return {
      items: items,
      groups: Array.from(groupMap.values()),
    };
  }, [tasks, dag]);

  const handleClick = (id: any) => {
    if (id) {
      onClick({
        id: id,
      });
    } else {
      onClick(null);
    }
  };
  return (
    <div ref={timelineRef} style={{ overflow: "auto", height: "100%" }}>
      <div className="timeline-container">
        <ConductorTimeline
          data={tasks}
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
          onClick={handleClick}
          viewportRef={timelineRef}
        />
      </div>
      <br />
    </div>
  );
}
