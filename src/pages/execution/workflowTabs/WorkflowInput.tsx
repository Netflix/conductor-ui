import { ReactJson } from "../../../components";
import { useWorkflowInput } from "../../../data/execution";
import JsonSkeleton from "../../../components/JsonSkeleton";

export default function WorkflowInput({ workflowId }: { workflowId: string }) {
  const { data, isLoading } = useWorkflowInput(workflowId);
  return isLoading ? (
    <JsonSkeleton />
  ) : (
    <ReactJson src={data} label="Workflow Input" path="workflowInput.json" />
  );
}
