import { ReactJson } from "../../../components";
import { useWorkflowInput } from "../../../data/execution";

export default function WorkflowInput({ workflowId }: { workflowId: string }) {
  const { data }: { data: any } = useWorkflowInput(workflowId);
  return (
    <>
      <ReactJson src={data} label="Workflow Input" path="workflowInput" />
    </>
  );
}
