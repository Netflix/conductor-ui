import { ReactJson } from "../../../components";
import JsonSkeleton from "../../../components/JsonSkeleton";
import { useWorkflowOutput } from "../../../data/execution";

export default function WorkflowOutput({ workflowId }: { workflowId: string }) {
  const { data, isLoading } = useWorkflowOutput(workflowId);
  return isLoading ? (
    <JsonSkeleton />
  ) : (
    <ReactJson src={data} label="Workflow Output" path="workflowOutput.json" />
  );
}
