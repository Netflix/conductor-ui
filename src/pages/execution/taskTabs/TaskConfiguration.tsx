import { ReactJson } from "../../../components";
import NoTaskSelected from "../../../components/NoTaskSelected";
import { TaskSelection } from "../TileFactory";

export default function TaskConfiguration({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  if (!taskSelection) {
    return <NoTaskSelected />;
  }

  return (
    <ReactJson src={taskSelection.taskConfig} label="Task Configuration" />
  );
}
