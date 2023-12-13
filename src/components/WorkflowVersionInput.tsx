import { useWorkflowNamesAndVersions } from "../data/workflow";
import { Dropdown } from ".";
import { DropdownProps } from "./Dropdown";
import { useMemo } from "react";
import _ from "lodash";

export type WorkflowVersionInputProps = Omit<
  DropdownProps<string>,
  "options" | "multiple" | "freeSolo" | "loading"
> & {
  workflowName: string | undefined;
  label?: string;
};

export default function WorkflowVersionInput({
  workflowName,
  label,
  ...props
}: WorkflowVersionInputProps) {
  const { data: namesAndVersions } = useWorkflowNamesAndVersions();

  const versions = useMemo(() => {
    if (workflowName) {
      return _.get(namesAndVersions, workflowName, []).map(
        (row) => "" + row.version,
      );
    } else {
      return [];
    }
  }, [namesAndVersions, workflowName]);

  return (
    <Dropdown
      disableClearable
      label={label || "Workflow Name"}
      options={versions}
      placeholder={"Select Workflow Version"}
      {...props}
    />
  );
}
