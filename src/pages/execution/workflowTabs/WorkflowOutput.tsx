import { ReactJson } from "../../../components";
import { useWorkflowOutput } from "../../../data/execution";

export default function WorkflowOutput({ workflowId }: { workflowId: string }) {
  const { data }: { data: any } = useWorkflowOutput(workflowId);
  return (
    <>
      <ReactJson src={data} label="Workflow Output" path="workflowOutput" />
    </>
  );
}
