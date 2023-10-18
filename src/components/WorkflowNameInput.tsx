import { useWorkflowNames } from "../data/workflow";
import { Dropdown } from ".";
import { isEmpty } from "lodash";
import { DropdownProps } from "./Dropdown";

export type WorkflowNameInputProps = Omit<
  DropdownProps<string>,
  "options" | "multiple" | "freeSolo" | "loading"
>;

export default function WorkflowNameInput(props: WorkflowNameInputProps) {
  const workflowNames = useWorkflowNames();

  return (
    <Dropdown
      label={props.label || "Workflow Name"}
      options={workflowNames}
      multiple
      freeSolo
      loading={isEmpty(workflowNames)}
      {...props}
    />
  );
}
