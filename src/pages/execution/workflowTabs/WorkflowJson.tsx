import { ReactJson } from "../../../components";
import { Execution } from "../../../types/execution";

export default function WorkflowJson({
  execution,
}: {
  execution: Execution;
}) {
  return (
    <ReactJson
      src={execution}
      label="Execution JSON (Includes Definition, but not Tasks)"
      path="execution.json"
    />
  );
}
