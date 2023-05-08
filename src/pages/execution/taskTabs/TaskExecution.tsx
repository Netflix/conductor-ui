import { ReactJson } from "../../../components";
import { useWorkflowTask } from "../../../data/execution";
import { TaskSelection } from "../TileFactory";

export default function TaskExecution({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const { data: taskResult }: { data: any } = useWorkflowTask(
    taskSelection?.workflowId,
    taskSelection?.ref,
    taskSelection?.id
  );

  if (!taskResult) {
    return null;
  }

  return <ReactJson src={taskResult} label="Task Execution Result" />;
}
