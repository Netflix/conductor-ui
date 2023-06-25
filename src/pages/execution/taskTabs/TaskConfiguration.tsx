import { ReactJson } from "../../../components";
import Blank from "../../../components/NoTaskSelected";
import { TaskSelection } from "../tabLoader";

export default function TaskConfiguration({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
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
