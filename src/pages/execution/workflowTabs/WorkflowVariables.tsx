import { ReactJson } from "../../../components";
import { useWorkflowVariables } from "../../../data/execution";

export default function WorkflowVariables({
  workflowId,
}: {
  workflowId: string;
}) {
  const { data }: { data: any } = useWorkflowVariables(workflowId);
  return (
    <>
      <ReactJson
        src={data}
        label="Workflow Variables"
        path="workflowVariables"
      />
    </>
  );
}
