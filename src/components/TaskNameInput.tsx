import { Dropdown } from ".";
import { isEmpty } from "lodash";
import { useTaskNames } from "../data/task";
import { DropdownProps } from "./Dropdown";

export type TaskNameInputProps = Omit<
  DropdownProps<string>,
  "options" | "loading"
>;

export default function TaskNameInput(props: TaskNameInputProps) {
  const taskNames = useTaskNames();

  return (
    <Dropdown
      label={props.label || "Task Name"}
      options={taskNames}
      multiple={true}
      freeSolo={true}
      loading={isEmpty(taskNames)}
      {...props}
    />
  );
}
