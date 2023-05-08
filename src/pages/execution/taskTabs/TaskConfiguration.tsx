import { ReactJson } from "../../../components";
import { TaskSelection } from "../TileFactory";

export default function TaskConfiguration({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  if (!taskSelection) {
    return null;
  }

  return (
    <ReactJson src={taskSelection.taskConfig} label="Task Configuration" />
  );
}
