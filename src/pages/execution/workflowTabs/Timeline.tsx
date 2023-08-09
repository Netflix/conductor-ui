//@ts-nocheck
import React from "react";
import "./timeline.scss";
import WorkflowDAG from "../../../components/diagram/WorkflowDAG";
import { TaskResult } from "../../../types/execution";
import { TaskCoordinate } from "../../../types/workflowDef";
import ConductorTimeline from "./gantt-chart/ConductorTimeline";

export default function TimelineComponent({
  dag,
  tasks,
  onClick,
  selectedTask,
}: {
  dag: WorkflowDAG;
  tasks: TaskResult[];
  onClick: (task: TaskCoordinate | null) => void;
  selectedTask: TaskCoordinate | null;
}) {
  const timelineRef = React.useRef<HTMLDivElement>(null);

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
          dag={dag}
          data={tasks}
          selectedTask={selectedTask}
          onClick={handleClick}
          viewportRef={timelineRef}
        />
      </div>
      <br />
    </div>
  );
}
