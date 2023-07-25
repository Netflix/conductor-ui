import _ from "lodash";
import { NavLink, KeyValueTable, ClipboardButton } from "../../../components";
import { useTime } from "../../../hooks/useTime";
import { useAppContext } from "../../../export";
import { KeyValueTableEntry } from "../../../components/KeyValueTable";
import { TaskSelection } from "../tabLoader";
import Blank from "../../../components/NoTaskSelected";
import { SubworkflowTaskConfig } from "../../../types/workflowDef";

export default function TaskSummary({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const now = useTime();
  const { customTaskSummaryRows } = useAppContext();

  if (!taskSelection) {
    return <Blank />;
  }
  let { taskConfig, taskResult } = taskSelection;

  // If subworkflow, backfill taskConfig from taskResult.workflowTask
  // Caveat - Not available for 3.0 workflows.
  if (taskResult?.taskType === "SUB_WORKFLOW" && taskResult?.workflowTask) {
    taskConfig = taskResult.workflowTask!;
  }

  // To accommodate unexecuted tasks, read type & name & ref out of workflow
  const data: KeyValueTableEntry[] = [
    { label: "Task Type", value: taskResult?.taskType || taskConfig.type },
    { label: "Status", value: taskResult?.status || "Not executed" },
    { label: "Task Name", value: taskResult?.taskDefName || taskConfig?.name },
    {
      label: "Task Reference",
      value:
        taskResult?.referenceTaskName ||
        taskResult?.aliasForRef ||
        taskConfig.taskReferenceName,
    },
  ];

  if (taskResult?.domain) {
    data.push({ label: "Domain", value: taskResult.domain });
  }

  if (taskResult?.taskId) {
    data.push({
      label: "Task Execution ID",
      value: (
        <div>
          {taskResult.taskId}
          <ClipboardButton textToCopy={taskResult.taskId} />
        </div>
      ),
    });
  }

  if (taskResult?.scheduledTime) {
    data.push({
      label: "Scheduled Time",
      value: taskResult.scheduledTime > 0 && taskResult.scheduledTime,
      type: "date-ms",
    });
  }
  if (taskResult?.startTime) {
    data.push({
      label: "Start Time",
      value: taskResult.startTime > 0 && taskResult.startTime,
      type: "date-ms",
    });
  }
  if (taskResult?.endTime) {
    data.push({
      label: "End Time",
      value: taskResult.endTime,
      type: "date-ms",
    });
  }
  if (taskResult?.startTime && taskResult?.endTime) {
    data.push({
      label: "Duration",
      value:
        taskResult.startTime > 0 && taskResult.endTime - taskResult.startTime,
      type: "duration",
    });
  }
  if (taskResult?.startTime && taskResult?.status === "IN_PROGRESS") {
    data.push({
      label: "Current Elapsed Time",
      value: taskResult.startTime > 0 && now - taskResult.startTime,
      type: "duration",
    });
  }
  if (!_.isNil(taskResult?.retryCount)) {
    data.push({ label: "Retry Count", value: taskResult.retryCount });
  }
  if (taskResult?.reasonForIncompletion) {
    data.push({
      label: "Reason for Incompletion",
      value: taskResult.reasonForIncompletion,
    });
  }
  if (taskResult?.workerId) {
    data.push({
      label: "Worker",
      value: taskResult.workerId,
      type: "workerId",
    });
  }

  if (taskResult?.taskType === "SUB_WORKFLOW") {
    // NOTE: Edge case - SUB_WORKFLOW spawned by DYNAMIC_FORK will not have an accessible taskConfig.
    const subWorkflowName = (taskConfig as SubworkflowTaskConfig)
      ?.subWorkflowParam?.name;
    if (subWorkflowName) {
      data.push({
        label: "Subworkflow Definition",
        value: (
          <NavLink newTab path={`/workflowDef/${subWorkflowName}`}>
            {subWorkflowName}{" "}
          </NavLink>
        ),
      });
    }

    if (taskResult?.subWorkflowId) {
      data.push({
        label: "Subworkflow ID",
        value: (
          <NavLink newTab path={`/execution/${taskResult.subWorkflowId}`}>
            {taskResult.subWorkflowId}
          </NavLink>
        ),
      });
    }
  }

  for (const row of customTaskSummaryRows) {
    const rendered = row.renderer(taskResult);
    if (rendered !== undefined) {
      data.push({
        label: row.label,
        value: rendered,
      });
    }
  }

  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <KeyValueTable data={data} loading={false} />
    </div>
  );
}
