import { useWorkflowNames } from "../data/workflow";
import { Dropdown } from ".";
import { isEmpty } from "lodash";
import { DropdownProps } from "./Dropdown";

export type WorkflowNameInputProps = Omit<
  DropdownProps<string>,
  "options" | "freeSolo" | "loading"
>;

export default function WorkflowNameInput({
  label,
  multiple = true,
  ...props
}: WorkflowNameInputProps) {
  const workflowNames = useWorkflowNames();

  return (
    <Dropdown
      label={label || "Workflow Name"}
      options={workflowNames}
      multiple={multiple}
      freeSolo
      loading={isEmpty(workflowNames)}
      {...props}
    />
  );
}
