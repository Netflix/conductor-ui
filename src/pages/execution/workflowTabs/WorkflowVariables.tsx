import { ReactJson } from "../../../components";
import JsonSkeleton from "../../../components/JsonSkeleton";
import { useWorkflowVariables } from "../../../data/execution";

export default function WorkflowVariables({
  workflowId,
}: {
  workflowId: string;
}) {
  const { data, isLoading } = useWorkflowVariables(workflowId);
  return isLoading ? (
    <JsonSkeleton />
  ) : (
    <ReactJson
      src={data}
      label="Workflow Variables"
      path="workflowVariables.json"
    />
  );
}
