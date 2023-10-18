import { ReactJson } from "../../../components";
import Blank from "../../../components/Blank";
import { TaskPanelProps } from "./TaskSelectionWrapper";

export default function TaskConfiguration({ taskSelection }: TaskPanelProps) {
  if (!taskSelection) {
    return <Blank />;
  }
  let { taskConfig, taskResult } = taskSelection;

  // If subworkflow, backfill taskConfig from taskResult.workflowTask
  // Caveat - Not available for 3.0 workflows.
  if (taskResult?.taskType === "SUB_WORKFLOW" && taskResult?.workflowTask) {
    taskConfig = taskResult.workflowTask!;
  }

  return <ReactJson src={taskConfig} label="Task Configuration JSON" />;
}
